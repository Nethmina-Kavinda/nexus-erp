const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');
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
      user: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        department: employee.department,
      },
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

    const token = generateToken(employee._id, employee.role);

    res.json({
      success: true,
      token,
      user: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        department: employee.department,
      },
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

module.exports = { register, login, verifyOtp, getMe };
