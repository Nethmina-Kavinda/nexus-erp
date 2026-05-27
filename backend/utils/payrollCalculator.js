/**
 * Payroll constants. EPF (Employees' Provident Fund — 8%) and ETF (Employees'
 * Trust Fund — 3%) match the statutory employee contribution rates under
 * Sri Lankan labour law (EPF Act No. 15 of 1958, ETF Act No. 46 of 1980).
 * Overtime pays time-and-a-half (1.5×). Lateness deducts LKR 50 per minute —
 * a punitive rate chosen to make the penalty signal visible in the seeded
 * data so the risk model can learn from it.
 */
const STANDARD_HOURS_PER_DAY = 8;
const OVERTIME_MULTIPLIER = 1.5;
const PENALTY_RATE_PER_MINUTE = 50; // LKR
const EPF_RATE = 0.08;
const ETF_RATE = 0.03;

/**
 * Compute the full monthly payroll for one employee from their attendance
 * summary. Pipeline:
 *   gross    = (present_days × 8h × hourly_rate)
 *            + (overtime_hours × hourly_rate × 1.5)
 *            + allowances
 *   net      = gross − EPF (8%) − ETF (3%)
 *   final    = max(0, net − late_penalty)   // payroll cannot go negative
 *
 * All currency values are rounded to two decimals (LKR cents) and the final
 * salary is floored at zero so a heavy-lateness month never produces a
 * negative payslip — the policy is "no pay can be reclaimed", penalties only
 * eat into earned income.
 *
 * @param {Object} employee - Mongoose Employee doc; needs hourly_rate, allowances.
 * @param {Object} monthlySummary - { present_days, total_overtime_hours, total_late_minutes }.
 * @returns {Object} payroll fields ready to merge into a Payroll document.
 */
function calculatePayroll(employee, monthlySummary) {
  const workingHours = monthlySummary.present_days * STANDARD_HOURS_PER_DAY;
  const overtimeHours = monthlySummary.total_overtime_hours || 0;

  const grossSalary =
    workingHours * employee.hourly_rate +
    overtimeHours * employee.hourly_rate * OVERTIME_MULTIPLIER +
    (employee.allowances || 0);

  const epf = Math.round(grossSalary * EPF_RATE * 100) / 100;
  const etf = Math.round(grossSalary * ETF_RATE * 100) / 100;
  const netSalary = Math.round((grossSalary - epf - etf) * 100) / 100;
  const latePenalty = Math.round((monthlySummary.total_late_minutes || 0) * PENALTY_RATE_PER_MINUTE * 100) / 100;
  const finalSalary = Math.round((netSalary - latePenalty) * 100) / 100;

  return {
    working_hours: workingHours,
    overtime_hours: Math.round(overtimeHours * 100) / 100,
    gross_salary: Math.round(grossSalary * 100) / 100,
    deductions: { epf, etf, tax: 0 },
    net_salary: netSalary,
    late_penalty: latePenalty,
    final_salary: Math.max(0, finalSalary),
  };
}

module.exports = { calculatePayroll };
