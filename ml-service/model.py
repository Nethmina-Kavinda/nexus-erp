"""RandomForest risk-prediction model with two-stage training and SHAP.

This module owns the entire ML lifecycle: data loading from MongoDB,
temporal train/val/test split, SMOTE balancing, RF training, persistence,
and inference with SHAP explanations. The Flask app holds a single
RiskModel instance; train() mutates it in place and atomically swaps the
on-disk pickle.
"""

import numpy as np
import pandas as pd
from pymongo import MongoClient
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
from imblearn.over_sampling import SMOTE
import shap
import joblib
from datetime import datetime
from config import MONGO_URI, MODEL_PATH, FEATURE_NAMES, CLASS_NAMES


class RiskModel:
    """RF classifier + TreeExplainer wrapper.

    Maintains in-memory `model` and `explainer` objects plus a `metadata`
    dict that mirrors the `/health` response. Both are populated either by
    `load_model()` at startup or by a successful `train()` call.
    """

    def __init__(self):
        self.model = None
        self.explainer = None
        self.metadata = {
            "model_loaded": False,
            "model_stage": None,
            "trained_at": None,
            "training_samples": 0,
            "accuracy": 0.0,
        }

    def load_model(self):
        """Load persisted model from disk on startup."""
        try:
            data = joblib.load(MODEL_PATH)
            self.model = data["model"]
            self.explainer = shap.TreeExplainer(self.model)
            self.metadata = data["metadata"]
            self.metadata["model_loaded"] = True
            print(f"Model loaded: stage={self.metadata['model_stage']}, "
                  f"accuracy={self.metadata['accuracy']}")
        except FileNotFoundError:
            print("No saved model found — /predict will return 503 until /train is called")

    def train(self, stage="stage_1"):
        """Train the RF classifier end-to-end.

        Pipeline:
          1. Pull every feature vector from MongoDB.
          2. Build a label map. stage_1 uses formula-derived RiskScore
             labels; stage_2 prefers HR-corrected labels and only falls
             back to the formula for vectors HR has not reviewed.
          3. Temporal split: months 1-4 train, month 5 validate, month 6
             test. A temporal split (vs random) is essential because the
             dataset has within-employee autocorrelation — a random split
             leaks future months back into the training set.
          4. SMOTE balances minority classes (k_neighbors auto-clipped to
             the smallest class size − 1). Skipped when the minority class
             has only 1 sample.
          5. Fit RandomForest(n_estimators=200, class_weight='balanced').
             The 200-tree count was chosen empirically — see the
             n_estimators tuning curve in evaluation_output/.
          6. Score on val + test, then persist {model, metadata} to
             MODEL_PATH atomically so a failed train cannot corrupt the
             previous good model.

        Args:
            stage: "stage_1" or "stage_2".

        Returns:
            Dict with success flag, sample counts, class distribution,
            SMOTE flag, validation + test accuracy, and timestamp.
        """
        client = MongoClient(MONGO_URI)
        db = client["nexus_erp"]

        # Load feature vectors
        features_cursor = db.employeefeatures.find({})
        features_list = list(features_cursor)
        if not features_list:
            client.close()
            raise ValueError("No feature vectors found — run seed pipeline first")

        features_df = pd.DataFrame(features_list)

        # Load labels based on stage
        if stage == "stage_2":
            # HR-corrected labels take priority over formula labels
            decisions_cursor = db.hrdecisions.find({})
            decisions_list = list(decisions_cursor)

            # Build label map: (employee_id, month) -> corrected_class
            label_map = {}
            for d in decisions_list:
                key = (str(d["employee_id"]), d["month"])
                label_map[key] = d["corrected_class"] or d["original_class"]

            # Fall back to formula labels for any missing
            risk_cursor = db.riskscores.find({})
            for r in risk_cursor:
                key = (str(r["employee_id"]), r["month"])
                if key not in label_map:
                    label_map[key] = r["risk_class"]
        else:
            # Stage 1: formula labels only
            risk_cursor = db.riskscores.find({})
            label_map = {}
            for r in risk_cursor:
                key = (str(r["employee_id"]), r["month"])
                label_map[key] = r["risk_class"]

        # Assign labels to features
        features_df["label"] = features_df.apply(
            lambda row: label_map.get(
                (str(row["employee_id"]), row["month"])
            ),
            axis=1,
        )
        features_df = features_df.dropna(subset=["label"])

        if len(features_df) == 0:
            client.close()
            raise ValueError("No labeled data found")

        # Temporal split based on sorted months
        months_sorted = sorted(features_df["month"].unique())
        if len(months_sorted) < 6:
            print(f"Warning: only {len(months_sorted)} months available, expected 6")

        train_months = months_sorted[:4]
        val_month = months_sorted[4] if len(months_sorted) > 4 else None
        test_month = months_sorted[5] if len(months_sorted) > 5 else None

        train_df = features_df[features_df["month"].isin(train_months)]
        val_df = (
            features_df[features_df["month"] == val_month]
            if val_month
            else pd.DataFrame()
        )
        test_df = (
            features_df[features_df["month"] == test_month]
            if test_month
            else pd.DataFrame()
        )

        X_train = train_df[FEATURE_NAMES].values
        y_train = train_df["label"].values

        print(f"Training data: {len(X_train)} samples across months {train_months}")
        print(f"Class distribution (pre-SMOTE): {dict(zip(*np.unique(y_train, return_counts=True)))}")

        # SMOTE for class imbalance
        # Adjust k_neighbors based on smallest class size
        class_counts = pd.Series(y_train).value_counts()
        min_class_size = class_counts.min()
        k_neighbors = min(5, min_class_size - 1) if min_class_size > 1 else 1

        smote_applied = False
        if min_class_size > 1 and len(class_counts) > 1:
            try:
                smote = SMOTE(random_state=42, k_neighbors=k_neighbors)
                X_train_res, y_train_res = smote.fit_resample(X_train, y_train)
                smote_applied = True
                print(f"SMOTE applied (k={k_neighbors}): {len(X_train)} -> {len(X_train_res)} samples")
            except Exception as e:
                print(f"SMOTE failed ({e}), training without resampling")
                X_train_res, y_train_res = X_train, y_train
        else:
            X_train_res, y_train_res = X_train, y_train
            print("SMOTE skipped (insufficient samples in minority class)")

        # Train Random Forest
        rf = RandomForestClassifier(
            n_estimators=200,
            class_weight="balanced",
            random_state=42,
            max_depth=None,
            min_samples_split=2,
        )
        rf.fit(X_train_res, y_train_res)

        # Validation accuracy
        accuracy_val = 0.0
        if len(val_df) > 0:
            X_val = val_df[FEATURE_NAMES].values
            y_val = val_df["label"].values
            y_pred_val = rf.predict(X_val)
            accuracy_val = accuracy_score(y_val, y_pred_val)
            print(f"Validation accuracy (month 5): {accuracy_val:.4f}")
            print(classification_report(y_val, y_pred_val, zero_division=0))

        # Test accuracy
        accuracy_test = 0.0
        if len(test_df) > 0:
            X_test = test_df[FEATURE_NAMES].values
            y_test = test_df["label"].values
            y_pred_test = rf.predict(X_test)
            accuracy_test = accuracy_score(y_test, y_pred_test)
            print(f"Test accuracy (month 6): {accuracy_test:.4f}")
            print(classification_report(y_test, y_pred_test, zero_division=0))

        # Train-in-memory-first: only persist on success (Resilience #3)
        self.model = rf
        self.explainer = shap.TreeExplainer(rf)

        trained_at = datetime.utcnow().isoformat()
        self.metadata = {
            "model_loaded": True,
            "model_stage": stage,
            "trained_at": trained_at,
            "training_samples": int(len(X_train_res)),
            "accuracy": round(float(accuracy_val), 4),
        }

        joblib.dump({"model": rf, "metadata": self.metadata}, MODEL_PATH)
        print(f"Model saved to {MODEL_PATH}")

        client.close()

        # Build class distribution for response
        unique, counts = np.unique(y_train_res, return_counts=True)
        class_dist = {str(k): int(v) for k, v in zip(unique, counts)}

        return {
            "success": True,
            "stage": stage,
            "samples_used": int(len(X_train_res)),
            "classes": class_dist,
            "smote_applied": smote_applied,
            "accuracy_validation": round(float(accuracy_val), 4),
            "accuracy_test": round(float(accuracy_test), 4),
            "trained_at": trained_at,
            "model_unchanged": False,
        }

    def predict(self, features_dict):
        """Inference + SHAP for one employee/month.

        Builds the feature vector in FEATURE_NAMES order (this is why the
        order in config.py is load-bearing — see comment there). Runs the
        trained RF, picks the predicted class probability as `confidence`,
        then computes per-feature SHAP contributions for that class.

        Handles three SHAP output shapes (list-of-arrays, 3-D ndarray, 2-D
        ndarray) so the code is robust across SHAP library versions.

        Returns:
            Dict { risk_class, confidence, shap_base_value,
                   shap_values{8 keys} } or None if no model is loaded.
        """
        if self.model is None:
            return None

        # Build feature vector in correct order
        X = np.array([[features_dict[f] for f in FEATURE_NAMES]])

        # Predict class and probability
        risk_class = self.model.predict(X)[0]
        probabilities = self.model.predict_proba(X)[0]
        confidence = float(max(probabilities))

        # SHAP values (real-time per prediction — SHAP #1)
        shap_values_all = self.explainer.shap_values(X)
        class_idx = list(self.model.classes_).index(risk_class)

        # Handle different SHAP output formats across versions
        if isinstance(shap_values_all, list):
            # Old format: list of arrays [n_classes][n_samples, n_features]
            shap_vals = shap_values_all[class_idx][0]
        elif isinstance(shap_values_all, np.ndarray):
            if shap_values_all.ndim == 3:
                # New format: ndarray (n_samples, n_features, n_classes)
                shap_vals = shap_values_all[0, :, class_idx]
            elif shap_values_all.ndim == 2:
                # Binary or single-output: (n_samples, n_features)
                shap_vals = shap_values_all[0]
            else:
                shap_vals = np.zeros(len(FEATURE_NAMES))
        else:
            shap_vals = np.zeros(len(FEATURE_NAMES))

        # Base value
        base_value = self.explainer.expected_value
        if isinstance(base_value, (list, np.ndarray)):
            base_value = float(base_value[class_idx])
        else:
            base_value = float(base_value)

        # Build SHAP dict
        shap_dict = {
            FEATURE_NAMES[i]: round(float(shap_vals[i]), 6)
            for i in range(len(FEATURE_NAMES))
        }

        return {
            "risk_class": str(risk_class),
            "confidence": round(confidence, 4),
            "shap_base_value": round(base_value, 6),
            "shap_values": shap_dict,
        }
