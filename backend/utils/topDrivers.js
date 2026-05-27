/**
 * SHAP → human-readable narrative table. Each feature has a positive
 * (raises risk) and negative (lowers risk) phrase tuned for an HR audience
 * — the SHAP numerical values mean nothing on their own to a non-ML user,
 * so the UI displays this prose alongside the score. This is the
 * Explainable-AI surface that satisfies Research Pillar 2 (transparency).
 */
const FEATURE_EXPLANATIONS = {
  social_score: { pos: 'Social media activity signals potential disengagement', neg: 'Social media activity indicates stability' },
  absence_rate: { pos: 'Absence frequency is elevated', neg: 'Attendance record is strong' },
  late_rate: { pos: 'Frequent late arrivals indicate reduced commitment', neg: 'Consistent on-time attendance' },
  overtime_ratio: { pos: 'Excessive overtime suggests burnout risk', neg: 'Healthy work-life balance' },
  productivity_index: { pos: 'Declining productivity signals disengagement', neg: 'Strong productivity levels' },
  payroll_variance: { pos: 'Salary instability may indicate dissatisfaction', neg: 'Stable compensation' },
  tenure_months: { pos: 'Shorter tenure increases baseline attrition risk', neg: 'Longer tenure suggests commitment' },
  department_risk: { pos: 'Department environment elevates individual risk', neg: 'Department environment is healthy' },
};

/**
 * Pick the three SHAP values with the largest magnitude (regardless of
 * sign), bucket each into low/moderate/high impact, and look up the
 * appropriate phrase. We expose only the top three to keep the UI digest
 * scannable — the full SHAP vector is still available on the RiskScore
 * doc for users who want to inspect the full breakdown.
 *
 * @param {Object<string,number>} shapValues - feature → SHAP contribution.
 * @returns {Array<{feature, impact, explanation}>}
 */
function generateTopDrivers(shapValues) {
  if (!shapValues) return [];

  const entries = Object.entries(shapValues)
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    .slice(0, 3);

  return entries.map(([feature, value]) => {
    const abs = Math.abs(value);
    const impact = abs > 0.1 ? 'high' : abs > 0.05 ? 'moderate' : 'low';
    const direction = value > 0 ? 'pos' : 'neg';
    const explanationMap = FEATURE_EXPLANATIONS[feature] || { pos: `${feature} is increasing risk`, neg: `${feature} is decreasing risk` };

    return {
      feature,
      impact,
      explanation: explanationMap[direction],
    };
  });
}

module.exports = { generateTopDrivers };
