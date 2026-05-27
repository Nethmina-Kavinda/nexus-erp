const Attendance = require('../models/Attendance');

// Standard 9-to-5 shift used by both check-in and check-out. Late-minute
// computation anchors on SHIFT_START_HOUR; overtime accrues after SHIFT_END_HOUR.
const SHIFT_START_HOUR = 9;
const SHIFT_END_HOUR = 17;
const STANDARD_SHIFT_HOURS = 8;

/**
 * Record a check-in for the calling user (or for `employee_id` if a manager
 * is recording on someone's behalf). Re-checking-in the same day is rejected.
 * Late minutes are derived from how far past 09:00 the check-in lands; status
 * flips to "late" if any positive lateness is detected.
 * @route   POST /api/attendance/check-in
 * @access  Protected
 */
const checkIn = async (req, res, next) => {
  try {
    const employeeId = req.body.employee_id || req.user._id;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let attendance = await Attendance.findOne({ employee_id: employeeId, date: today });

    if (attendance && attendance.check_in) {
      return res.status(400).json({ success: false, error: 'Already checked in today' });
    }

    const shiftStart = new Date(today);
    shiftStart.setHours(SHIFT_START_HOUR, 0, 0, 0);

    let lateMinutes = 0;
    let status = 'present';

    if (now > shiftStart) {
      lateMinutes = Math.round((now - shiftStart) / 60000);
      if (lateMinutes > 0) status = 'late';
    }

    if (attendance) {
      attendance.check_in = now;
      attendance.late_minutes = lateMinutes;
      attendance.status = status;
      await attendance.save();
    } else {
      attendance = await Attendance.create({
        employee_id: employeeId,
        date: today,
        check_in: now,
        late_minutes: lateMinutes,
        status,
      });
    }

    res.json({ success: true, data: attendance });
  } catch (error) {
    next(error);
  }
};

/**
 * Record a check-out. Requires a prior check-in the same day. Overtime hours
 * are computed as time past 17:00, rounded to two decimals; this feeds the
 * payroll calculator's overtime allowance.
 * @route   POST /api/attendance/check-out
 * @access  Protected
 */
const checkOut = async (req, res, next) => {
  try {
    const employeeId = req.body.employee_id || req.user._id;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const attendance = await Attendance.findOne({ employee_id: employeeId, date: today });

    if (!attendance || !attendance.check_in) {
      return res.status(400).json({ success: false, error: 'Must check in first' });
    }
    if (attendance.check_out) {
      return res.status(400).json({ success: false, error: 'Already checked out today' });
    }

    attendance.check_out = now;

    const shiftEnd = new Date(today);
    shiftEnd.setHours(SHIFT_END_HOUR, 0, 0, 0);

    if (now > shiftEnd) {
      attendance.overtime_hours = Math.round(((now - shiftEnd) / 3600000) * 100) / 100;
    }

    await attendance.save();
    res.json({ success: true, data: attendance });
  } catch (error) {
    next(error);
  }
};

/**
 * Aggregate one employee's attendance for a calendar month into the shape
 * consumed by both the Attendance UI and the payroll/feature pipelines.
 * "Working days" excludes weekends; absent days are derived as
 * `working_days - present_days` (present includes late arrivals).
 * @route   GET /api/attendance/:empId/monthly?month=YYYY-MM
 * @access  Protected
 * @returns { total_working_days, present_days, absent_days, late_days,
 *            total_overtime_hours, total_late_minutes, records[] }
 */
const getMonthlySummary = async (req, res, next) => {
  try {
    const { empId } = req.params;
    const month = req.query.month;

    if (!month) {
      return res.status(400).json({ success: false, error: 'Month parameter required (YYYY-MM)' });
    }

    const [year, mon] = month.split('-').map(Number);
    const startDate = new Date(year, mon - 1, 1);
    const endDate = new Date(year, mon, 0, 23, 59, 59);

    const records = await Attendance.find({
      employee_id: empId,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1 });

    // Calculate working days in month (exclude weekends)
    let totalWorkingDays = 0;
    const d = new Date(startDate);
    while (d <= endDate) {
      const day = d.getDay();
      if (day !== 0 && day !== 6) totalWorkingDays++;
      d.setDate(d.getDate() + 1);
    }

    const presentDays = records.filter((r) => r.status === 'present' || r.status === 'late').length;
    const absentDays = totalWorkingDays - presentDays;
    const lateDays = records.filter((r) => r.status === 'late').length;
    const totalOvertimeHours = records.reduce((sum, r) => sum + (r.overtime_hours || 0), 0);
    const totalLateMinutes = records.reduce((sum, r) => sum + (r.late_minutes || 0), 0);

    res.json({
      success: true,
      data: {
        employee_id: empId,
        month,
        total_working_days: totalWorkingDays,
        present_days: presentDays,
        absent_days: absentDays,
        late_days: lateDays,
        total_overtime_hours: Math.round(totalOvertimeHours * 100) / 100,
        total_late_minutes: totalLateMinutes,
        records,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { checkIn, checkOut, getMonthlySummary };
