/**
 * Seed step 3/8 — Payroll (120 records: 6 months × 20 employees).
 *
 * Reuses the production `calculatePayroll` utility against the seeded
 * attendance to guarantee that seeded payslips and live-generated payslips
 * follow identical Sri Lankan EPF/ETF/overtime/lateness logic. This means
 * the demo data is "real" — it would survive a re-run of the live
 * /payroll/generate endpoint with no diff.
 *
 * Depends on: Steps 1 (employees) + 2 (attendance).
 * Feeds:      Step 5 (payroll_variance feature).
 */
const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const { calculatePayroll } = require('../utils/payrollCalculator');
const { getSeedMonths } = require('./helpers');

async function seedPayroll() {
  await Payroll.deleteMany({});

  const employees = await Employee.find({});
  const months = getSeedMonths();
  const records = [];

  for (const emp of employees) {
    for (const month of months) {
      const [year, mon] = month.split('-').map(Number);
      const startDate = new Date(year, mon - 1, 1);
      const endDate = new Date(year, mon, 0, 23, 59, 59);

      const attendanceRecords = await Attendance.find({
        employee_id: emp._id,
        date: { $gte: startDate, $lte: endDate },
      });

      // Count working days in month (exclude weekends)
      let totalWorkingDays = 0;
      const d = new Date(startDate);
      while (d <= endDate) {
        if (d.getDay() !== 0 && d.getDay() !== 6) totalWorkingDays++;
        d.setDate(d.getDate() + 1);
      }

      const presentDays = attendanceRecords.filter(
        (r) => r.status === 'present' || r.status === 'late'
      ).length;
      const totalOvertimeHours = attendanceRecords.reduce(
        (sum, r) => sum + (r.overtime_hours || 0), 0
      );
      const totalLateMinutes = attendanceRecords.reduce(
        (sum, r) => sum + (r.late_minutes || 0), 0
      );

      const summary = {
        present_days: presentDays,
        total_overtime_hours: totalOvertimeHours,
        total_late_minutes: totalLateMinutes,
      };

      const payrollData = calculatePayroll(emp, summary);

      records.push({
        employee_id: emp._id,
        month,
        ...payrollData,
      });
    }
  }

  await Payroll.insertMany(records);
  console.log(`  Seeded ${records.length} payroll records (${employees.length} employees × ${months.length} months)`);
  return records.length;
}

module.exports = seedPayroll;
