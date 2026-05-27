const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const { calculatePayroll } = require('../utils/payrollCalculator');

/**
 * Generate (or refresh) the payroll batch for a given month for every active
 * employee. For each, we walk that month's attendance, derive present-days /
 * overtime / lateness, and pass the summary into `calculatePayroll` (utils)
 * which applies the gross/EPF/ETF/late-penalty/overtime formula. Upserts so
 * the endpoint is idempotent — re-running produces the same result.
 * @route   POST /api/payroll/generate
 * @access  Protected (admin, hr_manager)
 * @body    { month: "YYYY-MM" }
 */
const generatePayroll = async (req, res, next) => {
  try {
    const { month } = req.body;
    if (!month) {
      return res.status(400).json({ success: false, error: 'Month parameter required (YYYY-MM)' });
    }

    const [year, mon] = month.split('-').map(Number);
    const startDate = new Date(year, mon - 1, 1);
    const endDate = new Date(year, mon, 0, 23, 59, 59);

    const employees = await Employee.find({ is_active: true });
    const results = [];

    for (const emp of employees) {
      const records = await Attendance.find({
        employee_id: emp._id,
        date: { $gte: startDate, $lte: endDate },
      });

      // Calculate working days (exclude weekends)
      let totalWorkingDays = 0;
      const d = new Date(startDate);
      while (d <= endDate) {
        const day = d.getDay();
        if (day !== 0 && day !== 6) totalWorkingDays++;
        d.setDate(d.getDate() + 1);
      }

      const presentDays = records.filter((r) => r.status === 'present' || r.status === 'late').length;
      const totalOvertimeHours = records.reduce((sum, r) => sum + (r.overtime_hours || 0), 0);
      const totalLateMinutes = records.reduce((sum, r) => sum + (r.late_minutes || 0), 0);

      const summary = {
        present_days: presentDays,
        total_overtime_hours: totalOvertimeHours,
        total_late_minutes: totalLateMinutes,
      };

      const payrollData = calculatePayroll(emp, summary);

      const payroll = await Payroll.findOneAndUpdate(
        { employee_id: emp._id, month },
        { employee_id: emp._id, month, ...payrollData },
        { upsert: true, new: true }
      );

      results.push(payroll);
    }

    res.json({ success: true, count: results.length, data: results });
  } catch (error) {
    next(error);
  }
};

/**
 * List payroll records for one employee, optionally filtered to a single
 * month. Sorted newest-first to match the Payroll page layout.
 * @route   GET /api/payroll/:empId?month=YYYY-MM
 * @access  Protected
 */
const getPayrollRecords = async (req, res, next) => {
  try {
    const filter = { employee_id: req.params.empId };
    if (req.query.month) filter.month = req.query.month;

    const records = await Payroll.find(filter)
      .populate('employee_id', 'name email department position')
      .sort({ month: -1 });

    res.json({ success: true, count: records.length, data: records });
  } catch (error) {
    next(error);
  }
};

module.exports = { generatePayroll, getPayrollRecords };
