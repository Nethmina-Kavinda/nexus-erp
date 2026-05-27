/**
 * Seed step 2/8 — Attendance (~2,600 daily records, 6 months × 20 staff).
 *
 * For each working day we sample whether an employee is present, late, or
 * absent using a Gaussian draw modulated by their hidden `risk_bias` — high
 * bias → more absences and longer lateness. A small temporal-drift term
 * makes the high-risk cohort visibly degrade over the 6-month window so the
 * ML model can learn a trajectory, not just a snapshot.
 *
 * Depends on: Step 1 (employees + risk_bias).
 * Feeds:      Steps 3 (payroll) and 5 (feature vectors).
 */
const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const { gaussian, clamp, getSeedMonths, getWorkingDays } = require('./helpers');

async function seedAttendance() {
  await Attendance.deleteMany({});

  const employees = await Employee.find({}).select('+risk_bias');
  const months = getSeedMonths();
  const records = [];

  for (const emp of employees) {
    const riskBias = emp.risk_bias || 0;

    for (let monthIdx = 0; monthIdx < months.length; monthIdx++) {
      const workingDays = getWorkingDays(months[monthIdx]);
      // Temporal drift: risk increases over months for at-risk employees
      const driftMultiplier = 1 + 0.05 * monthIdx;

      for (const day of workingDays) {
        const baseAbsentProb = 0.02 + riskBias * 0.15;
        const baseLateProb = 0.05 + riskBias * 0.20;
        const absentProb = Math.min(baseAbsentProb * driftMultiplier, 0.30);
        const lateProb = Math.min(baseLateProb * driftMultiplier, 0.40);

        const rand = Math.random();

        if (rand < absentProb) {
          // Absent
          records.push({
            employee_id: emp._id,
            date: day,
            check_in: null,
            check_out: null,
            late_minutes: 0,
            status: 'absent',
            overtime_hours: 0,
          });
        } else if (rand < absentProb + lateProb) {
          // Late
          const lateMinutes = Math.round(Math.max(1, gaussian(10 + riskBias * 25, 8)));
          const checkIn = new Date(day);
          checkIn.setHours(9, lateMinutes, 0, 0);

          // Overtime: low-risk employees sometimes work overtime, high-risk less so
          const overtimeProb = 0.3 - riskBias * 0.3;
          let overtimeHours = 0;
          if (Math.random() < overtimeProb) {
            overtimeHours = Math.round(gaussian(1.5, 0.5) * 100) / 100;
            overtimeHours = Math.max(0, overtimeHours);
          }

          const standardEnd = new Date(day);
          standardEnd.setHours(17, 0, 0, 0);
          const checkOut = new Date(standardEnd);
          if (overtimeHours > 0) {
            checkOut.setMinutes(checkOut.getMinutes() + Math.round(overtimeHours * 60));
          }

          records.push({
            employee_id: emp._id,
            date: day,
            check_in: checkIn,
            check_out: checkOut,
            late_minutes: lateMinutes,
            status: 'late',
            overtime_hours: overtimeHours,
          });
        } else {
          // Present on time
          const earlyMinutes = Math.round(Math.max(0, gaussian(5, 3)));
          const checkIn = new Date(day);
          checkIn.setHours(8, 60 - earlyMinutes, 0, 0);

          const overtimeProb = 0.35 - riskBias * 0.25;
          let overtimeHours = 0;
          if (Math.random() < Math.max(0.05, overtimeProb)) {
            overtimeHours = Math.round(gaussian(1.5, 0.7) * 100) / 100;
            overtimeHours = Math.max(0, overtimeHours);
          }

          const checkOut = new Date(day);
          checkOut.setHours(17, 0, 0, 0);
          if (overtimeHours > 0) {
            checkOut.setMinutes(checkOut.getMinutes() + Math.round(overtimeHours * 60));
          }

          records.push({
            employee_id: emp._id,
            date: day,
            check_in: checkIn,
            check_out: checkOut,
            late_minutes: 0,
            status: 'present',
            overtime_hours: overtimeHours,
          });
        }
      }
    }
  }

  // Batch insert for performance
  const batchSize = 500;
  let inserted = 0;
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    await Attendance.insertMany(batch);
    inserted += batch.length;
  }

  console.log(`  Seeded ${inserted} attendance records (${employees.length} employees × 6 months)`);
  return inserted;
}

module.exports = seedAttendance;
