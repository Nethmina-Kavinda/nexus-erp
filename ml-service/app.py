"""NEXUS ERP — Flask ML microservice.

Exposes three endpoints used by the Node backend:
    GET  /health   — liveness + model metadata (gates live UI behaviour).
    POST /predict  — single-employee RF inference + SHAP explanation.
    POST /train    — retrain (stage_1 = formula labels, stage_2 = HR labels).

The service is intentionally synchronous and single-process; production
deployment would put it behind gunicorn workers and a job queue. Bound to
127.0.0.1 only — backend → ML traffic stays on localhost.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from model import RiskModel

app = Flask(__name__)
CORS(app)

risk_model = RiskModel()

# Eagerly load any persisted model on import so the first /predict after a
# restart does not pay cold-start cost.
with app.app_context():
    risk_model.load_model()


@app.route("/health", methods=["GET"])
def health():
    """Return service status and current model metadata.

    Used by the backend's `mlClient.checkHealth` as a circuit breaker — if
    `model_loaded` is false the controller falls back to the formula path
    instead of issuing a doomed /predict.
    """
    return jsonify({
        "status": "ok",
        **risk_model.metadata,
        "flask_version": "1.0.0",
    })


@app.route("/predict", methods=["POST"])
def predict():
    """Predict the risk class for one employee/month.

    Body: { employee_id, month, features: {8 keys in FEATURE_NAMES order} }
    Returns: { risk_class, confidence, shap_base_value, shap_values{8},
              employee_id, month }. Returns 503 if no model is loaded so the
    backend can fall back gracefully.
    """
    data = request.json
    if not data or "features" not in data:
        return jsonify({"error": "Missing 'features' in request body"}), 400

    result = risk_model.predict(data["features"])
    if result is None:
        return jsonify({
            "error": "Model not loaded — call /train first",
            "model_loaded": False,
        }), 503

    # Echo back employee_id and month for bookkeeping
    result["employee_id"] = data.get("employee_id")
    result["month"] = data.get("month")
    return jsonify(result)


@app.route("/train", methods=["POST"])
def train():
    """Retrain the RF classifier.

    Body: { stage: "stage_1" | "stage_2" }
      stage_1 — train on formula-derived labels (cold-start baseline).
      stage_2 — train on HR-corrected labels (the human-in-the-loop path
                that produces the +35.9 F1-pt lift documented in evaluation).
    On failure the in-memory and on-disk models are left untouched so a
    failed retrain never degrades a working service.
    """
    data = request.json or {}
    stage = data.get("stage", "stage_1")

    if stage not in ("stage_1", "stage_2"):
        return jsonify({"error": "stage must be 'stage_1' or 'stage_2'"}), 400

    try:
        result = risk_model.train(stage)
        return jsonify(result)
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "model_unchanged": True,
        }), 500


if __name__ == "__main__":
    # Localhost-only binding (Security #1)
    app.run(host="127.0.0.1", port=5000, debug=False)
