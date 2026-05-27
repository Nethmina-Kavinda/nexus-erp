/**
 * Weighted composite formula for the deterministic risk-score path.
 * Weights sum to 1.0 and were calibrated by mapping each SLR-identified
 * attrition signal to a relative importance:
 *   social_score (0.25)       — primary research contribution; captures the
 *                               digital-disengagement signal absent in legacy
 *                               HR scoring.
 *   absence_rate (0.20)       — strongest single behavioural predictor in
 *                               classical attrition literature.
 *   productivity_index (0.15) — secondary behavioural signal.
 *   late_rate, overtime_ratio,
 *   department_risk (0.10 ea) — tertiary signals; department_risk is the
 *                               leave-one-out peer average to avoid leakage.
 *   payroll_variance,
 *   tenure_months (0.05 ea)   — slow-moving structural factors.
 *
 * The formula always runs (cold start, ML-down fallback) and serves as the
 * Stage-1 label generator before HR feedback is available.
 */
const WEIGHTS = {
  absence_rate: 0.20,
  late_rate: 0.10,
  overtime_ratio: 0.10,
  productivity_index: 0.15,
  payroll_variance: 0.05,
  social_score: 0.25,
  tenure_months: 0.05,
  department_risk: 0.10,
};

/**
 * Reduce a normalised feature vector to a 0-100 risk score by linear
 * combination with WEIGHTS. Inputs are expected min-max normalised to [0,1]
 * by the feature-vector seed step; missing keys default to 0.
 */
function computeRiskScore(features) {
  let score = 0;
  for (const [key, weight] of Object.entries(WEIGHTS)) {
    score += (features[key] || 0) * weight;
  }
  return Math.round(score * 100 * 100) / 100;
}

/**
 * Map a numeric score to one of four ordinal tiers using equal-width
 * thresholds (25/50/75). Equal-width was chosen over quantile binning so
 * tier semantics stay stable as the dataset grows — a "High" employee in
 * month 1 means the same thing as a "High" employee in month 6.
 */
function classifyRisk(score) {
  if (score <= 25) return 'Low';
  if (score <= 50) return 'Medium';
  if (score <= 75) return 'High';
  return 'Critical';
}

/**
 * Translate the RF model's max-class probability into a human label for the
 * UI. Thresholds (>0.6 Strong, 0.4-0.6 Moderate, <0.4 Uncertain) align with
 * how HR users in the brainstorming session said they'd interpret a number.
 */
function getConfidenceLabel(confidence) {
  if (confidence > 0.6) return 'Strong';
  if (confidence >= 0.4) return 'Moderate';
  return 'Uncertain';
}

module.exports = { WEIGHTS, computeRiskScore, classifyRisk, getConfidenceLabel };
