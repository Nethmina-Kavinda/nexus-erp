"""Shared configuration constants for the ML microservice.

All file-path and environment lookups live here so both `app.py` (HTTP) and
`evaluate.py` (offline batch) read the same single source of truth.
"""

import os

MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017/nexus_erp")
MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.pkl")

# IMPORTANT: this list defines the column order the RandomForest is trained
# on, persisted with, and predicts against. It MUST match the order of keys
# the Node backend sends in `/predict` payloads (see backend riskController →
# mlClient.predictRisk). Reordering here without updating both call sites
# silently corrupts every prediction.
FEATURE_NAMES = [
    "absence_rate",
    "late_rate",
    "overtime_ratio",
    "productivity_index",
    "payroll_variance",
    "social_score",
    "tenure_months",
    "department_risk",
]

# Ordinal risk tiers. Order is significant for sorted plots and the SHAP
# class-index lookup in RiskModel.predict.
CLASS_NAMES = ["Low", "Medium", "High", "Critical"]
