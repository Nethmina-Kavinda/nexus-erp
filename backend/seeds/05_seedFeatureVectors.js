/**
 * Seed step 5/8 — Feature Vectors (120 vectors, 8 features each).
 *
 * Produces the unified ML-ready feature matrix from the heterogeneous source
 * collections. Three engineering choices baked in here are critical to
 * model behaviour:
 *   1. Sliding-window blend of current + previous + 2-months-ago values to
 *      smooth single-month noise.
 *   2. `department_risk` is computed leave-one-out (each employee's own
 *      score is excluded from their dept average) to prevent target leakage.
 *   3. All 8 features are min-max normalised to [0,1] so the deterministic
 *      formula and the RF model see comparable inputs.
 *
 * Depends on: Steps 1-4.
 * Feeds:      Step 6 (formula scoring) and the live ML /predict endpoint.
 */
const EmployeeFeature = require('../models/EmployeeFeature');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Payroll = require('../models/Payroll');
const SocialScore = require('../models/SocialScore');
const RiskScore = require('../models/RiskScore');
const { clamp, getSeedMonths, getWorkingDays } = require('./helpers');

// Window-informed computation (Feature Eng #9):
// Blend current, previous, and two-months-ago values
const WINDOW_WEIGHTS = { current: 0.6, prev: 0.3, twoBack: 0.1 };

function windowBlend(current, prev, twoBack, monthIdx) {
  if (monthIdx < 2) return current; // Not enough history
  return WINDOW_WEIGHTS.current * current +
         WINDOW_WEIGHTS.prev * (prev || current) +
         WINDOW_WEIGHTS.twoBack * (twoBack || current);
}

async function computeMonthlyAttendanceStats(employeeId, monthStr) {
  const [year, mon] = monthStr.split('-').map(Number);
  const startDate = new Date(year, mon - 1, 1);
  const endDate = new Date(year, mon, 0, 23, 59, 59);

  const records = await Attendance.find({
    employee_id: employeeId,
    date: { $gte: startDate, $lte: endDate },
  });

  const workingDays = getWorkingDays(monthStr);
  const totalWorkingDays = workingDays.length;

  const presentDays = records.filter((r) => r.status === 'present' || r.status === 'late').length;
  const absentDays = totalWorkingDays - presentDays;
  const lateDays = records.filter((r) => r.status === 'late').length;
  const totalOvertimeHours = records.reduce((sum, r) => sum + (r.overtime_hours || 0), 0);

  return {
    totalWorkingDays,
    presentDays,
    absentDays,
    lateDays,
    totalOvertimeHours,
    absenceRate: totalWorkingDays > 0 ? absentDays / totalWorkingDays : 0,
    lateRate: totalWorkingDays > 0 ? lateDays / totalWorkingDays : 0,
    overtimeRatio: totalWorkingDays > 0
      ? totalOvertimeHours / (totalWorkingDays * 8)
      : 0,
  };
}

async function seedFeatureVectors() {
  await EmployeeFeature.deleteMany({});

  const employees = await Employee.find({});
  const months = getSeedMonths();
  const records = [];

  // Pre-load all payroll data for variance calculation
  const allPayroll = await Payroll.find({});
  const payrollMap = {};
  allPayroll.forEach((p) => {
    const key = `${p.employee_id}_${p.month}`;
    payrollMap[key] = p;
  });

  // Pre-load all social scores
  const allSocial = await SocialScore.find({});
  const socialMap = {};
  allSocial.forEach((s) => {
    const key = `${s.employee_id}_${s.month}`;
    socialMap[key] = s;
  });

  // Find max tenure for normalization
  const now = new Date();
  const maxTenure = Math.max(
    ...employees.map((e) => (now - new Date(e.hire_date)) / (30 * 24 * 60 * 60 * 1000))
  );

  // First pass: compute raw features per employee per month (no department_risk yet)
  const rawFeatures = {};

  for (const emp of employees) {
    const empFeatures = [];

    for (let monthIdx = 0; monthIdx < months.length; monthIdx++) {
      const month = months[monthIdx];

      // Attendance-derived features
      const stats = await computeMonthlyAttendanceStats(emp._id, month);

      // Get previous months' stats for window blending
      let prevStats = null;
      let twoBackStats = null;
      if (monthIdx > 0) {
        prevStats = await computeMonthlyAttendanceStats(emp._id, months[monthIdx - 1]);
      }
      if (monthIdx > 1) {
        twoBackStats = await computeMonthlyAttendanceStats(emp._id, months[monthIdx - 2]);
      }

      // Window-informed features (Feature Eng #9)
      const absenceRate = clamp(windowBlend(
        stats.absenceRate,
        prevStats?.absenceRate,
        twoBackStats?.absenceRate,
        monthIdx
      ));

      const lateRate = clamp(windowBlend(
        stats.lateRate,
        prevStats?.lateRate,
        twoBackStats?.lateRate,
        monthIdx
      ));

      const overtimeRatio = clamp(windowBlend(
        stats.overtimeRatio,
        prevStats?.overtimeRatio,
        twoBackStats?.overtimeRatio,
        monthIdx
      ));

      // Productivity index: hours worked / expected hours (inverted so higher = more risk)
      const expectedHours = stats.totalWorkingDays * 8;
      const actualHours = stats.presentDays * 8 + stats.totalOvertimeHours;
      const rawProductivity = expectedHours > 0 ? actualHours / expectedHours : 1;
      const productivityIndex = clamp(1 - rawProductivity); // Invert: less work = higher risk

      // Payroll variance
      let payrollVariance = 0;
      if (monthIdx > 0) {
        const currentPayroll = payrollMap[`${emp._id}_${month}`];
        const prevPayroll = payrollMap[`${emp._id}_${months[monthIdx - 1]}`];
        if (currentPayroll && prevPayroll && prevPayroll.final_salary > 0) {
          payrollVariance = clamp(
            Math.abs(currentPayroll.final_salary - prevPayroll.final_salary) /
            prevPayroll.final_salary
          );
        }
      }

      // Social score
      const socialData = socialMap[`${emp._id}_${month}`];
      const socialScore = socialData ? socialData.social_score : 0;

      // Tenure months (normalized, inverted: shorter = higher risk)
      const tenureMonths = (now - new Date(emp.hire_date)) / (30 * 24 * 60 * 60 * 1000);
      const tenureNormalized = clamp(1 - (tenureMonths / maxTenure));

      empFeatures.push({
        employee_id: emp._id,
        department: emp.department,
        month,
        absence_rate: Math.round(absenceRate * 10000) / 10000,
        late_rate: Math.round(lateRate * 10000) / 10000,
        overtime_ratio: Math.round(overtimeRatio * 10000) / 10000,
        productivity_index: Math.round(productivityIndex * 10000) / 10000,
        payroll_variance: Math.round(payrollVariance * 10000) / 10000,
        social_score: Math.round(socialScore * 10000) / 10000,
        tenure_months: Math.round(tenureNormalized * 10000) / 10000,
        department_risk: 0, // Filled in second pass
      });
    }

    rawFeatures[emp._id.toString()] = empFeatures;
  }

  // Second pass: compute department_risk with self-exclusion (Fail #1 mitigation)
  // For month N, department_risk = avg risk of same-dept employees in month N-1, excluding self
  for (const emp of employees) {
    const empId = emp._id.toString();

    for (let monthIdx = 0; monthIdx < months.length; monthIdx++) {
      let deptRisk = 0.25; // Default for month 1

      if (monthIdx > 0) {
        // Compute simple risk proxy from previous month's features for all dept employees
        const prevMonthIdx = monthIdx - 1;
        const deptScores = [];

        for (const otherEmp of employees) {
          if (otherEmp._id.toString() === empId) continue; // EXCLUDE SELF
          if (otherEmp.department !== emp.department) continue;

          const otherFeatures = rawFeatures[otherEmp._id.toString()][prevMonthIdx];
          // Use weighted formula as proxy for risk score
          const proxyScore =
            0.20 * otherFeatures.absence_rate +
            0.10 * otherFeatures.late_rate +
            0.10 * otherFeatures.overtime_ratio +
            0.15 * otherFeatures.productivity_index +
            0.05 * otherFeatures.payroll_variance +
            0.25 * otherFeatures.social_score +
            0.05 * otherFeatures.tenure_months;

          deptScores.push(proxyScore);
        }

        if (deptScores.length > 0) {
          deptRisk = deptScores.reduce((a, b) => a + b, 0) / deptScores.length;
        }
      }

      rawFeatures[empId][monthIdx].department_risk = Math.round(clamp(deptRisk) * 10000) / 10000;
    }
  }

  // Third pass: Min-max normalization per feature across entire dataset
  // Stretches values to use the full [0, 1] range
  const FEATURE_KEYS = [
    'absence_rate', 'late_rate', 'overtime_ratio', 'productivity_index',
    'payroll_variance', 'social_score', 'tenure_months', 'department_risk',
  ];

  // Collect all values per feature
  const allValues = {};
  FEATURE_KEYS.forEach((key) => { allValues[key] = []; });

  for (const empId of Object.keys(rawFeatures)) {
    for (const feature of rawFeatures[empId]) {
      FEATURE_KEYS.forEach((key) => { allValues[key].push(feature[key]); });
    }
  }

  // Compute min/max per feature
  const normParams = {};
  for (const key of FEATURE_KEYS) {
    const min = Math.min(...allValues[key]);
    const max = Math.max(...allValues[key]);
    normParams[key] = { min, max, range: max - min || 1 };
  }

  // Normalize and flatten
  for (const empId of Object.keys(rawFeatures)) {
    for (const feature of rawFeatures[empId]) {
      const normalized = {};
      FEATURE_KEYS.forEach((key) => {
        const { min, range } = normParams[key];
        normalized[key] = Math.round(clamp((feature[key] - min) / range) * 10000) / 10000;
      });

      records.push({
        employee_id: feature.employee_id,
        month: feature.month,
        ...normalized,
      });
    }
  }

  await EmployeeFeature.insertMany(records);

  // Print normalization ranges for verification
  console.log(`  Seeded ${records.length} feature vectors (8 features, window-informed, self-excluded dept_risk, min-max normalized)`);
  console.log(`  Normalization ranges:`);
  for (const key of FEATURE_KEYS) {
    const { min, max } = normParams[key];
    console.log(`    ${key.padEnd(22)} raw: [${min.toFixed(4)}, ${max.toFixed(4)}] → normalized: [0, 1]`);
  }
  return records.length;
}

module.exports = seedFeatureVectors;
