/**
 * Thin axios wrapper around the Flask ML microservice. Kept deliberately
 * minimal: the controller is responsible for fallback behaviour, this
 * module just speaks HTTP. Localhost default makes dev work zero-config.
 */
const axios = require('axios');

const ML_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:5000';

/**
 * Liveness probe. Swallows network errors and reports `offline` so callers
 * can branch on `model_loaded` without try/catch. Short 3 s timeout means
 * a dead Flask never blocks an end-user request for long.
 */
async function checkHealth() {
  try {
    const res = await axios.get(`${ML_URL}/health`, { timeout: 3000 });
    return res.data;
  } catch {
    return { status: 'offline', model_loaded: false };
  }
}

/**
 * Synchronous risk prediction. Returns { risk_class, confidence,
 * shap_base_value, shap_values{8 features} }. Errors propagate so the
 * controller can decide whether to fall back to the formula.
 */
async function predictRisk(employeeId, month, features) {
  const res = await axios.post(
    `${ML_URL}/predict`,
    { employee_id: employeeId.toString(), month, features },
    { timeout: 5000 }
  );
  return res.data;
}

/**
 * Kick a retrain on the ML service. 30 s timeout accommodates the
 * 20-employee × 6-month dataset; production scaling would queue this.
 */
async function triggerTrain(stage) {
  const res = await axios.post(
    `${ML_URL}/train`,
    { stage },
    { timeout: 30000 }
  );
  return res.data;
}

module.exports = { checkHealth, predictRisk, triggerTrain };
