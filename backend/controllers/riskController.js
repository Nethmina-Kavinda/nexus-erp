const RiskScore = require('../models/RiskScore');
const EmployeeFeature = require('../models/EmployeeFeature');
const Employee = require('../models/Employee');
const { computeRiskScore, classifyRisk, getConfidenceLabel } = require('../utils/riskScoring');
const { generateTopDrivers } = require('../utils/topDrivers');
const mlClient = require('../utils/mlClient');

/**
 * List stored RiskScore records, optionally filtered by month, department,
 * or risk class. Department filtering happens after the query because it
 * lives on the populated employee document, not on RiskScore itself.
 * @route   GET /api/risk/scores?month=YYYY-MM&department=X&risk_class=X
 * @access  Protected (admin, hr_manager, manager)
 */
const getScores = async (req, res, next) => {
  try {
    const { month, department, risk_class } = req.query;
    const filter = {};
    if (month) filter.month = month;
    if (risk_class) filter.risk_class = risk_class;

    let query = RiskScore.find(filter)
      .populate('employee_id', 'name email department position')
      .sort({ risk_score: -1 });

    let scores = await query;

    // Filter by department (post-query since it's on populated field)
    if (department) {
      scores = scores.filter((s) => s.employee_id && s.employee_id.department === department);
    }

    res.json({ success: true, count: scores.length, data: scores });
  } catch (error) {
    next(error);
  }
};

/**
 * Compute a fresh risk score for one employee in one month using a dual
 * pipeline: (1) the deterministic 8-weight formula always runs and supplies
 * a baseline `risk_score` + tier; (2) when the Flask ML service is healthy
 * its RF prediction overrides the class and adds SHAP values + confidence.
 * Result is upserted into RiskScore so the UI persists between sessions.
 * The `ml_status` field tells the frontend which path produced the answer.
 * @route   GET /api/risk/predict/:empId?month=YYYY-MM
 * @access  Protected (admin, hr_manager, manager)
 */
const predictForEmployee = async (req, res, next) => {
  try {
    const { empId } = req.params;
    const month = req.query.month;

    if (!month) {
      return res.status(400).json({ success: false, error: 'Month parameter required (YYYY-MM)' });
    }

    // Get feature vector
    const features = await EmployeeFeature.findOne({ employee_id: empId, month });
    if (!features) {
      return res.status(404).json({ success: false, error: 'No feature vector for this employee/month' });
    }

    // Weighted formula (always runs)
    const formulaScore = computeRiskScore(features);
    const formulaClass = classifyRisk(formulaScore);

    // ML prediction (if available)
    const health = await mlClient.checkHealth();
    let mlResult = null;

    if (health.model_loaded) {
      try {
        mlResult = await mlClient.predictRisk(empId, month, {
          absence_rate: features.absence_rate,
          late_rate: features.late_rate,
          overtime_ratio: features.overtime_ratio,
          productivity_index: features.productivity_index,
          payroll_variance: features.payroll_variance,
          social_score: features.social_score,
          tenure_months: features.tenure_months,
          department_risk: features.department_risk,
        });
      } catch (err) {
        console.error(`ML prediction failed for ${empId}: ${err.message}`);
      }
    }

    const riskDoc = {
      employee_id: empId,
      month,
      risk_score: formulaScore,
      risk_class: mlResult ? mlResult.risk_class : formulaClass,
      ml_status: mlResult ? 'predicted' : 'formula_only',
      confidence: mlResult ? mlResult.confidence : null,
      confidence_label: mlResult ? getConfidenceLabel(mlResult.confidence) : null,
      shap_base_value: mlResult ? mlResult.shap_base_value : null,
      shap_values: mlResult ? mlResult.shap_values : null,
      top_drivers: mlResult ? generateTopDrivers(mlResult.shap_values) : [],
    };

    const saved = await RiskScore.findOneAndUpdate(
      { employee_id: empId, month },
      riskDoc,
      { upsert: true, new: true }
    );

    res.json({ success: true, data: saved, ml_available: health.model_loaded });
  } catch (error) {
    next(error);
  }
};

/**
 * Proxy a retrain request to the Flask ML service. Two stages exist:
 *   stage_1 — train on formula-derived labels (cold-start baseline).
 *   stage_2 — train on HR-corrected labels (HITL feedback loop).
 * Errors from Flask are surfaced verbatim; full ML outage returns 503 so
 * the UI can distinguish "model rejected" from "service down".
 * @route   POST /api/ml/retrain
 * @access  Protected (admin, hr_manager)
 * @body    { stage: "stage_1" | "stage_2" }
 */
const retrain = async (req, res, next) => {
  try {
    const { stage } = req.body;
    const result = await mlClient.triggerTrain(stage || 'stage_1');
    res.json({ success: true, data: result });
  } catch (error) {
    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        error: error.response.data.error || 'ML service error',
      });
    }
    return res.status(503).json({
      success: false,
      error: 'ML service unavailable',
    });
  }
};

/**
 * Surface ML service health to the UI (sidebar badge: model_loaded,
 * model_stage, trained_at, accuracy). Used as the gate for whether the
 * predict button shows "ML available" vs "formula only".
 * @route   GET /api/risk/ml-status
 * @access  Protected
 */
const getMlStatus = async (req, res, next) => {
  try {
    const health = await mlClient.checkHealth();
    res.json({ success: true, data: health });
  } catch (error) {
    next(error);
  }
};

module.exports = { getScores, predictForEmployee, retrain, getMlStatus };
