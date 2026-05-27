/**
 * Seed step 6/8 — Risk Scores (cold-start labels).
 *
 * Runs every feature vector through the deterministic 8-weight formula and
 * persists the resulting score + tier. These rows serve a dual purpose:
 *   - They become the Stage-1 training labels for the Random Forest, giving
 *     the model a supervised target before any HR feedback exists.
 *   - They populate the Risk Scoring page on first load so the UI is never
 *     empty.
 *
 * Depends on: Step 5 (feature vectors).
 * Feeds:      Step 7 (HR decisions are made *against* these scores).
 */
const RiskScore = require('../models/RiskScore');
const EmployeeFeature = require('../models/EmployeeFeature');
const { computeRiskScore, classifyRisk } = require('../utils/riskScoring');

async function seedRiskScores() {
  await RiskScore.deleteMany({});

  const features = await EmployeeFeature.find({});
  const records = [];

  for (const f of features) {
    const score = computeRiskScore(f);
    const riskClass = classifyRisk(score);

    records.push({
      employee_id: f.employee_id,
      month: f.month,
      risk_score: score,
      risk_class: riskClass,
      ml_status: 'formula_only',
      confidence: null,
      confidence_label: null,
      top_drivers: [],
      shap_base_value: null,
      shap_values: null,
    });
  }

  await RiskScore.insertMany(records);

  // Print distribution summary
  const distribution = { Low: 0, Medium: 0, High: 0, Critical: 0 };
  records.forEach((r) => distribution[r.risk_class]++);
  console.log(`  Seeded ${records.length} risk scores (formula-based)`);
  console.log(`  Distribution: Low=${distribution.Low} Med=${distribution.Medium} High=${distribution.High} Crit=${distribution.Critical}`);

  return records.length;
}

module.exports = seedRiskScores;
