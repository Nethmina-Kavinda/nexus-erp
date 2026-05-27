# NEXUS ERP — ML Microservice

Flask service that owns risk prediction, model training, and SHAP
explainability for the NEXUS ERP research prototype. Sits behind the Node
backend; bound to localhost only.

> Companion documents:
> - Root [README.md](../README.md) — full system overview.
> - [`../backend/README.md`](../backend/README.md) — API server.
> - [`../docs/PROJECT_STATUS.md`](../docs/PROJECT_STATUS.md) — phase status, eval metrics.

---

## Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Runtime | Python 3.11+ | |
| HTTP | Flask 3 + flask-cors | dev server (Werkzeug); production would use gunicorn |
| Model | scikit-learn `RandomForestClassifier` | 200 trees, `class_weight='balanced'` |
| Imbalance | `imbalanced-learn` SMOTE | `k_neighbors` auto-clipped to smallest class − 1 |
| Explainability | `shap` `TreeExplainer` | per-prediction SHAP values |
| Data | pymongo against `nexus_erp` | reads feature vectors + labels populated by the backend seed pipeline |
| Persistence | `joblib` → `model.pkl` | atomic-swap save on successful train |

---

## Project Layout

```
ml-service/
├── app.py                    Flask routes (/health, /predict, /train)
├── model.py                  RiskModel class — train, predict, load
├── config.py                 MONGO_URI, MODEL_PATH, FEATURE_NAMES, CLASS_NAMES
├── evaluate.py               Offline batch — generates 12 thesis Ch.5 artifacts
├── requirements.txt
├── model.pkl                 (created on first /train)
└── evaluation_output/        (created by evaluate.py)
```

---

## Setup

### Prerequisites

- Python 3.11+
- MongoDB running with the seed pipeline already executed (the model needs
  feature vectors + labels in `employeefeatures`, `riskscores`,
  `hrdecisions`)

### Install

```bash
cd ml-service
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

### Run

```bash
python app.py
# → http://127.0.0.1:5000
```

The service comes up immediately. If `model.pkl` exists from a previous
run, it loads on startup; otherwise `/predict` returns 503 until
`/train` is called.

---

## Endpoints

### `GET /health`

Returns liveness and current model metadata. Polled by the backend
(`mlClient.checkHealth`) as a circuit breaker.

```json
{
  "status": "ok",
  "model_loaded": true,
  "model_stage": "stage_2",
  "trained_at": "2026-04-20T11:14:32.118103",
  "training_samples": 96,
  "accuracy": 0.85,
  "flask_version": "1.0.0"
}
```

### `POST /predict`

Body:

```json
{
  "employee_id": "67e2f41c1b1c8b001234abcd",
  "month": "2026-03",
  "features": {
    "absence_rate": 0.12,
    "late_rate": 0.08,
    "overtime_ratio": 0.15,
    "productivity_index": 0.71,
    "payroll_variance": 0.05,
    "social_score": 0.62,
    "tenure_months": 0.45,
    "department_risk": 0.31
  }
}
```

Returns:

```json
{
  "risk_class": "High",
  "confidence": 0.7642,
  "shap_base_value": 0.250187,
  "shap_values": {
    "absence_rate": 0.041,
    "late_rate": 0.018,
    "overtime_ratio": -0.005,
    "productivity_index": -0.062,
    "payroll_variance": 0.011,
    "social_score": 0.094,
    "tenure_months": -0.022,
    "department_risk": 0.034
  },
  "employee_id": "67e2f41c1b1c8b001234abcd",
  "month": "2026-03"
}
```

503 if no model is loaded — the backend falls back to its formula path.

### `POST /train`

Body: `{ "stage": "stage_1" }` or `{ "stage": "stage_2" }`.

- **stage_1** trains on RiskScore labels (deterministic-formula
  cold-start). Use this immediately after `npm run seed`.
- **stage_2** trains on HRDecision labels (corrected-class falls back to
  formula when HR has not reviewed an entry). This is the
  human-in-the-loop path — and the source of the +35.9pt F1 lift
  documented in `docs/PROJECT_STATUS.md`.

Returns sample counts, per-class distribution, SMOTE flag, validation
accuracy (month 5), and test accuracy (month 6).

---

## Model Details

**Algorithm:** scikit-learn `RandomForestClassifier(n_estimators=200,
class_weight='balanced')`. The 200-tree count is empirical — see the
`n_estimators_curve.png` artifact (50→500 sweep) for the plateau.

**Temporal split** (vs random split): months 1–4 train, month 5
validation, month 6 test. Within-employee autocorrelation makes a random
split leak future months back into training; temporal split keeps
evaluation honest.

**SMOTE** balances minority classes pre-fit. `k_neighbors` is auto-clipped
to `min_class_size − 1`; if any class has only 1 sample, SMOTE is skipped.

**Two-stage training:**

| Stage | Labels | Purpose | Test acc | F1 (macro) |
|---|---|---|---|---|
| stage_1 | Formula-derived RiskScore | Cold-start baseline | 88.0% | 0.592 |
| stage_2 | HR-corrected (HRDecision) | HITL feedback loop | 83.0% | 0.836 |

**SHAP:** `TreeExplainer` is rebuilt with the model after every train.
`predict()` returns per-feature SHAP values for the predicted class so the
backend can render an explanation alongside every prediction. The handler
defends against three SHAP output shapes (list-of-arrays, 3-D ndarray,
2-D ndarray) so the code is robust across SHAP library versions.

**Feature order** is defined in `config.py::FEATURE_NAMES` and is
load-bearing — the backend's `mlClient.predictRisk` sends the same order;
reordering here without updating both sides silently corrupts predictions.

---

## Evaluation Artifacts

```bash
python evaluate.py
```

Writes 12 artifacts to `evaluation_output/` for thesis Chapter 5:

| # | File | Purpose |
|---|---|---|
| 1 | `confusion_matrix_stage1.png` | Stage-1 RF confusion matrix |
| 2 | `confusion_matrix_stage2.png` | Stage-2 (19/20 correct) |
| 3 | `feature_importance_stage1.png` | RF Gini importance — Stage 1 |
| 4 | `feature_importance_stage2.png` | RF Gini importance — Stage 2 |
| 5 | `shap_summary.png` | Mean absolute SHAP per feature (Stage 2) — XAI headline |
| 6 | `shap_drift.png` | Feature importance shift Stage 1 → Stage 2 |
| 7 | `n_estimators_curve.png` | Accuracy vs tree count (50–500), justifies n=200 |
| 8 | `social_score_histograms.png` | Sub-score distributions (Gaussian sanity) |
| 9 | `social_score_correlation.png` | Sub-score correlation matrix |
| 10 | `social_score_drift.png` | High-risk vs low-risk temporal trajectories |
| 11 | `feature_correlation.png` | 8-feature correlation matrix |
| 12 | `evaluation_results.json` | Every metric in machine-readable form |

The script reads only from MongoDB — no service restart needed.

---

## Notes & Limitations

- Werkzeug dev server is single-threaded. Production would deploy behind
  gunicorn workers and a job queue for `/train`.
- 100-employee × 6-month dataset. The pipeline scales to any employee count — only the seed script (`01_seedEmployees.js`) needs updating.
- A failed `/train` leaves both the in-memory `model` and `model.pkl`
  untouched, so a bad retrain never degrades a working service.
