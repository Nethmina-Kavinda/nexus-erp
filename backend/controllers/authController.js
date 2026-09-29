const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');
const HRDecision = require('../models/HRDecision');
const RiskScore = require('../models/RiskScore');
const Inventory = require('../models/Inventory');
const Payroll = require('../models/Payroll');
const Attendance = require('../models/Attendance');
const mlClient = require('../utils/mlClient');
const { sendOtpEmail } = require('../utils/email');

// In-memory OTP store. A research prototype assumes a single Node process; for
// production a Redis store would be required so OTPs survive restarts and span
// horizontally-scaled instances.
const otpStore = new Map();

/**
 * Issue a signed JWT carrying the user id and role. Role is embedded in the
 * token itself so the auth middleware can authorize requests without a
 * round-trip to MongoDB on every call.
 */
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

/** Session-safe user object, shared by login/register and profile updates. */
const toSessionUser = (employee) => ({
  id: employee._id,
  name: employee.name,
  email: employee.email,
  role: employee.role,
  department: employee.department,
});

/**
 * Register a new employee account.
 * @route   POST /api/auth/register
 * @access  Public
 * @body    name, email, password, role?, department, position, hourly_rate, allowances?, hire_date?
 * @returns 201 { token, user } on success; 400 if email already exists.
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, department, position, hourly_rate, allowances, hire_date } = req.body;

    const existing = await Employee.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const employee = await Employee.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'employee',
      department,
      position,
      hourly_rate,
      allowances: allowances || 0,
      hire_date: hire_date || new Date(),
    });

    const token = generateToken(employee._id, employee.role);

    res.status(201).json({
      success: true,
      token,
      user: toSessionUser(employee),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Authenticate an employee with email + password.
 * @route   POST /api/auth/login
 * @access  Public
 * @body    email, password
 * @returns 200 { token, user } on success; 400 missing creds; 401 invalid creds.
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide email and password' });
    }

    const employee = await Employee.findOne({ email }).select('+password');
    if (!employee) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    if (!employee.is_active) {
      return res.status(403).json({ success: false, error: 'This account has been deactivated. Contact an administrator.' });
    }

    const token = generateToken(employee._id, employee.role);

    res.json({
      success: true,
      token,
      user: toSessionUser(employee),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Two-step OTP verification: first call (no `otp`) generates a 6-digit code,
 * stores it for 5 minutes, and emails it. Second call validates the code.
 * Skipped entirely when SKIP_OTP=true (dev shortcut).
 * @route   POST /api/auth/verify-otp
 * @access  Public
 * @body    email, otp? (if absent → request OTP; if present → verify)
 * @returns 200 { message } on success; 400 if invalid or expired.
 */
const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    // Skip OTP in development mode
    if (process.env.SKIP_OTP === 'true') {
      return res.json({ success: true, message: 'OTP verification skipped (dev mode)' });
    }

    if (!otp) {
      // Generate and send OTP
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      otpStore.set(email, { code, expires: Date.now() + 5 * 60 * 1000 });

      // Auto-cleanup after 5 minutes
      setTimeout(() => otpStore.delete(email), 5 * 60 * 1000);

      await sendOtpEmail(email, code);
      return res.json({ success: true, message: 'OTP sent to email' });
    }

    // Verify OTP
    const stored = otpStore.get(email);
    if (!stored || stored.code !== otp || Date.now() > stored.expires) {
      return res.status(400).json({ success: false, error: 'Invalid or expired OTP' });
    }

    otpStore.delete(email);
    res.json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Return the authenticated user's profile (used by the frontend on app boot
 * to rehydrate AuthContext from a stored JWT).
 * @route   GET /api/auth/me
 * @access  Protected (any authenticated role)
 */
const getMe = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.user.id);
    res.json({ success: true, user: employee });
  } catch (error) {
    next(error);
  }
};

/**
 * Self-service profile edit. Only display fields are editable here — role,
 * department, pay and status stay under admin/HR control via /api/employees.
 * @route   PUT /api/auth/me
 * @access  Protected (any authenticated role)
 * @body    name?, position?
 */
const updateMe = async (req, res, next) => {
  try {
    const updates = {};
    if (typeof req.body.name === 'string') updates.name = req.body.name.trim();
    if (typeof req.body.position === 'string') updates.position = req.body.position.trim();

    if (updates.name === '') {
      return res.status(400).json({ success: false, error: 'Name cannot be empty' });
    }

    const employee = await Employee.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select('-risk_bias');

    res.json({ success: true, data: employee, user: toSessionUser(employee) });
  } catch (error) {
    next(error);
  }
};

/**
 * Change the signed-in user's password after re-checking the current one.
 * @route   PUT /api/auth/password
 * @access  Protected (any authenticated role)
 * @body    current_password, new_password (min 6 chars)
 */
const changePassword = async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({ success: false, error: 'Current and new password are required' });
    }
    if (new_password.length < 6) {
      return res.status(400).json({ success: false, error: 'New password must be at least 6 characters' });
    }

    const employee = await Employee.findById(req.user._id).select('+password');
    const isMatch = await bcrypt.compare(current_password, employee.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: 'Current password is incorrect' });
    }

    employee.password = await bcrypt.hash(new_password, 12);
    await employee.save();

    res.json({ success: true, message: 'Password updated' });
  } catch (error) {
    next(error);
  }
};

/**
 * Role-specific workspace data for the profile page. Each role gets only the
 * figures its RBAC scope already allows it to see elsewhere in the app:
 *   admin      — user counts by role, active/inactive split, HITL totals, ML status
 *   hr_manager — own HITL decisions, unreviewed predictions (highest risk first), ML status
 *   manager    — own department headcount, low-stock items
 *   employee   — own latest payslip and attendance month
 * @route   GET /api/auth/me/activity
 * @access  Protected (any authenticated role)
 */
const getMyActivity = async (req, res, next) => {
  try {
    const me = req.user;
    const latestMonth = (await RiskScore.findOne().sort({ month: -1 }).select('month'))?.month || null;

    if (me.role === 'admin') {
      const [byRole, active, inactive, decisions, corrections, ml] = await Promise.all([
        Employee.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
        Employee.countDocuments({ is_active: true }),
        Employee.countDocuments({ is_active: false }),
        HRDecision.countDocuments(),
        HRDecision.countDocuments({ decision: 'reject' }),
        mlClient.checkHealth(),
      ]);
      return res.json({
        success: true,
        data: {
          role: 'admin',
          users_by_role: Object.fromEntries(byRole.map((r) => [r._id, r.count])),
          active,
          inactive,
          decisions,
          corrections,
          ml,
        },
      });
    }

    if (me.role === 'hr_manager') {
      const [mine, recent, flagged, reviewed, corrections, ml] = await Promise.all([
        HRDecision.aggregate([
          { $match: { decided_by: me._id, source: 'hr_review' } },
          // One per employee-month (latest wins), so pre-lock duplicates don't inflate counts.
          { $sort: { decided_at: -1 } },
          { $group: { _id: { e: '$employee_id', m: '$month' }, decision: { $first: '$decision' } } },
          { $group: { _id: '$decision', count: { $sum: 1 } } },
        ]),
        HRDecision.find({ decided_by: me._id, source: 'hr_review' })
          .populate('employee_id', 'name department')
          .sort({ decided_at: -1 })
          .limit(5),
        // Same definition as the Risk Scoring "Awaiting review" filter:
        // every prediction this month without an in-app HR decision.
        latestMonth
          ? RiskScore.find({ month: latestMonth })
            .populate('employee_id', 'name department')
            .sort({ risk_score: -1 })
          : [],
        latestMonth ? HRDecision.distinct('employee_id', { month: latestMonth, source: 'hr_review' }) : [],
        HRDecision.countDocuments({ decision: 'reject' }),
        mlClient.checkHealth(),
      ]);

      const reviewedIds = new Set(reviewed.map(String));
      const queue = flagged.filter((s) => s.employee_id && !reviewedIds.has(String(s.employee_id._id)));
      const counts = Object.fromEntries(mine.map((d) => [d._id, d.count]));

      return res.json({
        success: true,
        data: {
          role: 'hr_manager',
          month: latestMonth,
          decisions: { accept: counts.accept || 0, reject: counts.reject || 0 },
          recent,
          queue_count: queue.length,
          queue: queue.slice(0, 5).map((s) => ({
            employee: s.employee_id,
            risk_score: s.risk_score,
            risk_class: s.risk_class,
          })),
          corrections,
          ml,
        },
      });
    }

    if (me.role === 'manager') {
      const [team, lowStock] = await Promise.all([
        Employee.countDocuments({ department: me.department, is_active: true }),
        Inventory.find({ $expr: { $lte: ['$quantity', '$reorder_level'] } })
          .select('name category quantity reorder_level')
          .sort({ quantity: 1 }),
      ]);
      return res.json({
        success: true,
        data: {
          role: 'manager',
          department: me.department,
          team,
          low_stock_count: lowStock.length,
          low_stock: lowStock.slice(0, 5),
        },
      });
    }

    // employee — own records only
    const [payslip, lastRecord] = await Promise.all([
      Payroll.findOne({ employee_id: me._id }).sort({ month: -1 }),
      Attendance.findOne({ employee_id: me._id }).sort({ date: -1 }).select('date'),
    ]);

    let attendance = null;
    if (lastRecord) {
      const d = lastRecord.date;
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      const byStatus = await Attendance.aggregate([
        { $match: { employee_id: me._id, date: { $gte: start, $lt: end } } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]);
      attendance = {
        month: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`,
        ...Object.fromEntries(byStatus.map((s) => [s._id, s.count])),
      };
    }

    res.json({ success: true, data: { role: 'employee', payslip, attendance } });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, verifyOtp, getMe, updateMe, changePassword, getMyActivity };
