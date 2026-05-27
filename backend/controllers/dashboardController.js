const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Payroll = require('../models/Payroll');
const Inventory = require('../models/Inventory');
const RiskScore = require('../models/RiskScore');
const SocialScore = require('../models/SocialScore');

/**
 * Aggregate every KPI the Dashboard renders in a single request: headcount,
 * attendance rate, late-today count, monthly payroll total, inventory
 * alerts, four-tier risk distribution, Workforce Risk Level (WRL =
 * %High+Critical), per-department average risk, top-10 risk predictions,
 * and 6-month trends for attendance and payroll.
 *
 * Aggregating server-side keeps the frontend free of cross-collection joins
 * and ensures the Dashboard renders in a single fetch.
 *
 * @route   GET /api/dashboard/summary?month=YYYY-MM
 * @access  Protected (admin, hr_manager, manager)
 */
const getSummary = async (req, res, next) => {
  try {
    const month = req.query.month || getCurrentMonth();

    // Total active employees
    const totalEmployees = await Employee.countDocuments({ is_active: true });

    // Attendance rate for the month
    const [year, mon] = month.split('-').map(Number);
    const startDate = new Date(year, mon - 1, 1);
    const endDate = new Date(year, mon, 0, 23, 59, 59);

    const attendanceRecords = await Attendance.find({
      date: { $gte: startDate, $lte: endDate },
    });

    const presentCount = attendanceRecords.filter(
      (r) => r.status === 'present' || r.status === 'late'
    ).length;

    // Working days in month
    let totalWorkingDays = 0;
    const d = new Date(startDate);
    while (d <= endDate) {
      if (d.getDay() !== 0 && d.getDay() !== 6) totalWorkingDays++;
      d.setDate(d.getDate() + 1);
    }

    const expectedRecords = totalEmployees * totalWorkingDays;
    const attendanceRate = expectedRecords > 0
      ? Math.round((presentCount / expectedRecords) * 100 * 10) / 10
      : 0;

    // Late arrivals today
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const lateTodayCount = await Attendance.countDocuments({
      date: { $gte: todayStart, $lt: todayEnd },
      status: 'late',
    });

    // Monthly payroll total
    const payrolls = await Payroll.find({ month });
    const monthlyPayrollTotal = payrolls.reduce((sum, p) => sum + (p.final_salary || 0), 0);

    // Inventory alerts
    const inventoryItems = await Inventory.find();
    const inventoryAlerts = inventoryItems.filter((item) => item.quantity <= item.reorder_level).length;

    // Risk distribution for the month
    const riskScores = await RiskScore.find({ month });
    const riskDistribution = { Low: 0, Medium: 0, High: 0, Critical: 0 };
    riskScores.forEach((rs) => {
      if (riskDistribution.hasOwnProperty(rs.risk_class)) {
        riskDistribution[rs.risk_class]++;
      }
    });

    // WRL
    const highCritical = riskDistribution.High + riskDistribution.Critical;
    const wrl = totalEmployees > 0
      ? Math.round((highCritical / totalEmployees) * 100 * 10) / 10
      : 0;

    // Department risk breakdown
    const departmentRisk = await RiskScore.aggregate([
      { $match: { month } },
      {
        $lookup: {
          from: 'employees',
          localField: 'employee_id',
          foreignField: '_id',
          as: 'employee',
        },
      },
      { $unwind: '$employee' },
      {
        $group: {
          _id: '$employee.department',
          avg_risk: { $avg: '$risk_score' },
          count: { $sum: 1 },
        },
      },
      { $sort: { avg_risk: -1 } },
    ]);

    // Recent predictions
    const recentPredictions = await RiskScore.find({ month })
      .populate('employee_id', 'name department')
      .sort({ risk_score: -1 })
      .limit(10);

    // Attendance trend (last 6 months)
    const months = getLast6Months(month);
    const attendanceTrend = [];
    for (const m of months) {
      const [y, mn] = m.split('-').map(Number);
      const s = new Date(y, mn - 1, 1);
      const e = new Date(y, mn, 0, 23, 59, 59);
      const records = await Attendance.find({ date: { $gte: s, $lte: e } });
      const present = records.filter((r) => r.status === 'present').length;
      const late = records.filter((r) => r.status === 'late').length;
      const absent = records.filter((r) => r.status === 'absent').length;
      attendanceTrend.push({ month: m, present, late, absent });
    }

    // Payroll trend (last 6 months)
    const payrollTrend = [];
    for (const m of months) {
      const ps = await Payroll.find({ month: m });
      const total = ps.reduce((sum, p) => sum + (p.final_salary || 0), 0);
      payrollTrend.push({ month: m, total: Math.round(total) });
    }

    res.json({
      success: true,
      data: {
        totalEmployees,
        attendanceRate,
        lateTodayCount,
        monthlyPayrollTotal: Math.round(monthlyPayrollTotal),
        inventoryAlerts,
        riskDistribution,
        wrl,
        departmentRisk,
        recentPredictions,
        attendanceTrend,
        payrollTrend,
        month,
      },
    });
  } catch (error) {
    next(error);
  }
};

/** Format the current month as `YYYY-MM` for the default Dashboard view. */
function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Build the 6-month rolling window ending at `currentMonth`, oldest-first,
 * for the Dashboard's attendance and payroll trend charts.
 */
function getLast6Months(currentMonth) {
  const [year, month] = currentMonth.split('-').map(Number);
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(year, month - 1 - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return months;
}

module.exports = { getSummary };
