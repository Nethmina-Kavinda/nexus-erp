/**
 * Seed step 7/8 — HR Decisions (synthetic human-in-the-loop feedback).
 *
 * Simulates the HR review queue with ~13% informed corrections, intentionally
 * focused on borderline cases (where the formula's tier sits near a
 * threshold) and aligned with `risk_bias` ground truth. Each rejection
 * carries a free-text reason for audit-trail realism.
 *
 * This is what makes Stage-2 retraining possible — and the +35.9pt F1 lift
 * documented in PROJECT_STATUS comes directly from these labels.
 *
 * Depends on: Steps 1 + 6.
 * Feeds:      ml-service `train(stage_2)`.
 */
const HRDecision = require('../models/HRDecision');
const RiskScore = require('../models/RiskScore');
const Employee = require('../models/Employee');
const SocialScore = require('../models/SocialScore');

async function seedHRDecisions() {
  await HRDecision.deleteMany({});

  const riskScores = await RiskScore.find({});
  const employees = await Employee.find({}).select('+risk_bias');
  const socialScores = await SocialScore.find({});

  // Build lookup maps
  const empMap = {};
  employees.forEach((e) => { empMap[e._id.toString()] = e; });

  const socialMap = {};
  socialScores.forEach((s) => {
    socialMap[`${s.employee_id}_${s.month}`] = s;
  });

  // Find an HR manager to be the "decider"
  const hrManager = employees.find((e) => e.role === 'hr_manager');

  const records = [];

  for (const rs of riskScores) {
    const emp = empMap[rs.employee_id.toString()];
    if (!emp) continue;

    const riskBias = emp.risk_bias || 0;
    const social = socialMap[`${rs.employee_id}_${rs.month}`];
    const socialScore = social ? social.social_score : 0;

    let decision = 'accept';
    let correctedClass = rs.risk_class;
    let reason = null;

    // Informed correction rules (per brainstorming Fail #3):
    // Only correct borderline cases where formula likely got it wrong

    if (rs.risk_class === 'Medium' && riskBias >= 0.30) {
      // Formula says Medium but employee is actually high risk — HR catches it
      decision = 'reject';
      correctedClass = 'High';
      reason = 'Employee shows emerging behavioral patterns suggesting higher risk than formula indicates';
    } else if (rs.risk_class === 'High' && riskBias <= 0.10) {
      // Formula says High but employee is actually low risk — HR knows context
      decision = 'reject';
      correctedClass = 'Medium';
      reason = 'Recent overtime was due to approved project deadline, not burnout';
    } else if (rs.risk_class === 'Low' && socialScore > 0.45) {
      // Formula says Low but social signals suggest hidden disengagement
      decision = 'reject';
      correctedClass = 'Medium';
      reason = 'Social media activity suggests employee may be exploring external opportunities';
    } else if (rs.risk_class === 'Medium' && riskBias <= 0.05 && socialScore < 0.20) {
      // Formula says Medium but all signals are green — HR overrides down
      decision = 'reject';
      correctedClass = 'Low';
      reason = 'Employee recently promoted with strong engagement metrics';
    }

    records.push({
      employee_id: rs.employee_id,
      month: rs.month,
      original_class: rs.risk_class,
      decision,
      corrected_class: correctedClass,
      reason,
      decided_by: hrManager ? hrManager._id : null,
      decided_at: new Date(),
      source: 'seed',
    });
  }

  await HRDecision.insertMany(records);

  const acceptCount = records.filter((r) => r.decision === 'accept').length;
  const rejectCount = records.filter((r) => r.decision === 'reject').length;
  const correctionRate = ((rejectCount / records.length) * 100).toFixed(1);

  console.log(`  Seeded ${records.length} HR decisions`);
  console.log(`  Accepted: ${acceptCount}, Rejected: ${rejectCount} (correction rate: ${correctionRate}%)`);

  // Show correction breakdown
  const corrections = records.filter((r) => r.decision === 'reject');
  const correctionTypes = {};
  corrections.forEach((c) => {
    const key = `${c.original_class} → ${c.corrected_class}`;
    correctionTypes[key] = (correctionTypes[key] || 0) + 1;
  });
  console.log(`  Correction types:`, correctionTypes);

  return records.length;
}

module.exports = seedHRDecisions;
