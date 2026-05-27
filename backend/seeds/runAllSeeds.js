/**
 * Seed pipeline runner — executes the 8 seed steps in dependency order.
 *
 * Order matters: each step assumes its predecessors have already populated
 * the collections it reads from. Failure of any step aborts the run.
 *
 * Run with: `npm run seed` (after starting MongoDB). Idempotent — every
 * step deleteMany's its own collection first, so re-running resets the
 * dataset to a known-good state without manual cleanup.
 *
 * Total runtime on the prototype dataset: <1 s.
 */
const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const connectDB = require('../config/db');

const seedEmployees = require('./01_seedEmployees');
const seedAttendance = require('./02_seedAttendance');
const seedPayroll = require('./03_seedPayroll');
const seedSocialScores = require('./04_seedSocialScores');
const seedFeatureVectors = require('./05_seedFeatureVectors');
const seedRiskScores = require('./06_seedRiskScores');
const seedHRDecisions = require('./07_seedHRDecisions');
const seedInventory = require('./08_seedInventory');

const steps = [
  { name: 'Step 1: Employees (20 with risk_bias)', fn: seedEmployees },
  { name: 'Step 2: Attendance (6 months daily records)', fn: seedAttendance },
  { name: 'Step 3: Payroll (computed from attendance)', fn: seedPayroll },
  { name: 'Step 4: Social Scores (VAR model)', fn: seedSocialScores },
  { name: 'Step 5: Feature Vectors (8 features, window-informed)', fn: seedFeatureVectors },
  { name: 'Step 6: Risk Scores (weighted formula)', fn: seedRiskScores },
  { name: 'Step 7: HR Decisions (informed corrections)', fn: seedHRDecisions },
  { name: 'Bonus: Inventory (items + transactions)', fn: seedInventory },
];

async function runAllSeeds() {
  console.log('\n========================================');
  console.log(' NEXUS ERP — Database Seeding Pipeline');
  console.log('========================================\n');

  await connectDB();
  const totalStart = Date.now();

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    console.log(`[${i + 1}/${steps.length}] ${step.name}`);

    const start = Date.now();
    try {
      await step.fn();
      const elapsed = ((Date.now() - start) / 1000).toFixed(2);
      console.log(`  ✓ Done (${elapsed}s)\n`);
    } catch (error) {
      console.error(`  ✗ FAILED: ${error.message}`);
      console.error(error.stack);
      process.exit(1);
    }
  }

  const totalElapsed = ((Date.now() - totalStart) / 1000).toFixed(2);
  console.log('========================================');
  console.log(` All seeds completed in ${totalElapsed}s`);
  console.log('========================================\n');

  await mongoose.connection.close();
  process.exit(0);
}

runAllSeeds();
