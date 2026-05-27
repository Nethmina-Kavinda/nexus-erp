/**
 * Seed step 4/8 — Social Scores (the research's signature dataset).
 *
 * Generates 4 correlated sub-scores (engagement, sentiment, peer interaction,
 * external activity) per employee per month using a Vector Auto-Regressive
 * model:
 *     scores_t = α × scores_(t-1) + (1-α) × MVN(μ + risk_bias, Σ)
 * with Cholesky decomposition driving the multivariate-normal sampler. This
 * preserves both temporal autocorrelation (α-smoothing) and cross-score
 * correlation (Σ), producing distributions that pass Gaussian and
 * correlation-matrix sanity checks for thesis Chapter 5.
 *
 * Depends on: Step 1 (risk_bias modulates the mean).
 * Feeds:      Step 5 (composite social_score feature).
 */
const SocialScore = require('../models/SocialScore');
const Employee = require('../models/Employee');
const { clamp, choleskyDecompose, sampleMVN, getSeedMonths } = require('./helpers');

// VAR Model Parameters (from brainstorming session)
// scores_t = α × scores_(t-1) + (1-α) × MVN(μ + risk_bias, Σ)

// Correlation matrix for 4 sub-scores
// Captures cross-sub-score behavioral coherence
const CORRELATION_MATRIX = [
  [1.00, 0.50, 0.60, 0.50],  // job_search
  [0.50, 1.00, 0.40, 0.50],  // post_drop
  [0.60, 0.40, 1.00, 0.35],  // network_growth
  [0.50, 0.50, 0.35, 1.00],  // sentiment
];

// Base means for each sub-score (neutral employee baseline)
const BASE_MEANS = [0.25, 0.30, 0.20, 0.20];

// Standard deviations per sub-score
const BASE_SIGMAS = [0.12, 0.10, 0.10, 0.10];

// Persistence factor (autoregressive coefficient)
// ~65% of this month's score comes from previous month
const ALPHA = 0.65;

// Sub-score weights for composite social_score
const SUB_WEIGHTS = [0.35, 0.25, 0.20, 0.20]; // job_search, post_drop, network_growth, sentiment

// Pre-compute Cholesky decomposition (done once)
const CHOLESKY_L = choleskyDecompose(CORRELATION_MATRIX);

function generateSocialScores(riskBias, numMonths) {
  // Biased means: shift baseline by risk_bias
  const biasedMeans = BASE_MEANS.map((mu) => mu + riskBias);

  const monthlyScores = [];

  for (let m = 0; m < numMonths; m++) {
    let subScores;

    if (m === 0) {
      // Month 1: draw fresh from MVN
      subScores = sampleMVN(biasedMeans, BASE_SIGMAS, CHOLESKY_L);
    } else {
      // Months 2+: autoregressive with persistence
      const prevScores = monthlyScores[m - 1].subScores;
      const innovation = sampleMVN(biasedMeans, BASE_SIGMAS, CHOLESKY_L);

      subScores = prevScores.map((prev, i) =>
        clamp(ALPHA * prev + (1 - ALPHA) * innovation[i])
      );
    }

    // Compute composite social_score
    const socialScore = subScores.reduce(
      (sum, score, i) => sum + score * SUB_WEIGHTS[i], 0
    );

    monthlyScores.push({
      subScores,
      job_search: Math.round(subScores[0] * 10000) / 10000,
      post_drop: Math.round(subScores[1] * 10000) / 10000,
      network_growth: Math.round(subScores[2] * 10000) / 10000,
      sentiment: Math.round(subScores[3] * 10000) / 10000,
      social_score: Math.round(clamp(socialScore) * 10000) / 10000,
    });
  }

  return monthlyScores;
}

async function seedSocialScores() {
  await SocialScore.deleteMany({});

  const employees = await Employee.find({}).select('+risk_bias');
  const months = getSeedMonths();
  const records = [];

  let highRiskSample = null;
  let lowRiskSample = null;

  for (const emp of employees) {
    const riskBias = emp.risk_bias || 0;
    const scores = generateSocialScores(riskBias, months.length);

    for (let i = 0; i < months.length; i++) {
      records.push({
        employee_id: emp._id,
        month: months[i],
        job_search: scores[i].job_search,
        post_drop: scores[i].post_drop,
        network_growth: scores[i].network_growth,
        sentiment: scores[i].sentiment,
        social_score: scores[i].social_score,
        social_data_source: 'synthetic',
      });
    }

    // Capture sample trajectories for verification
    if (riskBias >= 0.40 && !highRiskSample) {
      highRiskSample = { name: emp.name, riskBias, scores };
    }
    if (riskBias <= 0.05 && !lowRiskSample) {
      lowRiskSample = { name: emp.name, riskBias, scores };
    }
  }

  await SocialScore.insertMany(records);
  console.log(`  Seeded ${records.length} social score records (VAR model, α=${ALPHA})`);

  // Print sample trajectories for verification
  if (highRiskSample) {
    console.log(`\n  Sample trajectory — HIGH RISK: ${highRiskSample.name} (bias=${highRiskSample.riskBias})`);
    highRiskSample.scores.forEach((s, i) => {
      console.log(`    Month ${i + 1}: job=${s.job_search.toFixed(2)} post=${s.post_drop.toFixed(2)} net=${s.network_growth.toFixed(2)} sent=${s.sentiment.toFixed(2)} → social=${s.social_score.toFixed(2)}`);
    });
  }
  if (lowRiskSample) {
    console.log(`  Sample trajectory — LOW RISK: ${lowRiskSample.name} (bias=${lowRiskSample.riskBias})`);
    lowRiskSample.scores.forEach((s, i) => {
      console.log(`    Month ${i + 1}: job=${s.job_search.toFixed(2)} post=${s.post_drop.toFixed(2)} net=${s.network_growth.toFixed(2)} sent=${s.sentiment.toFixed(2)} → social=${s.social_score.toFixed(2)}`);
    });
  }

  return records.length;
}

module.exports = seedSocialScores;
