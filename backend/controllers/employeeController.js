const Employee = require('../models/Employee');
const bcrypt = require('bcryptjs');

/**
 * List employees with department/role/active filters, free-text search on
 * name/email, and pagination. The internal `risk_bias` field is always
 * stripped — it is a hidden ground-truth attribute used only by the social
 * score seeder and must never leak to the client.
 * @route   GET /api/employees
 * @access  Protected (admin, hr_manager, manager)
 * @query   department?, role?, is_active?, search?, page=1, limit=50
 */
const getEmployees = async (req, res, next) => {
  try {
    const { department, role, is_active, search, page = 1, limit = 50 } = req.query;

    const filter = {};
    if (department) filter.department = department;
    if (role) filter.role = role;
    if (is_active !== undefined) filter.is_active = is_active === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const employees = await Employee.find(filter)
      .select('-password -risk_bias')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ name: 1 });

    const total = await Employee.countDocuments(filter);

    res.json({
      success: true,
      count: employees.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: employees,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch a single employee. Strips `password` and `risk_bias`.
 * @route   GET /api/employees/:id
 * @access  Protected
 */
const getEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id).select('-password -risk_bias');
    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }
    res.json({ success: true, data: employee });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new employee. Falls back to the demo password `nexus123` so
 * supervisor-created users are immediately usable in the prototype.
 * @route   POST /api/employees
 * @access  Protected (admin only)
 */
const createEmployee = async (req, res, next) => {
  try {
    const { name, email, password, role, department, position, hourly_rate, allowances, hire_date } = req.body;

    const hashedPassword = await bcrypt.hash(password || 'nexus123', 12);

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

    const result = employee.toObject();
    delete result.password;
    delete result.risk_bias;

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an employee record. Security guards: (1) only admins may change a
 * role at all, preventing privilege escalation; (2) admins cannot change
 * their own role or deactivate themselves, so the system can never be left
 * without a working admin; (3) `password` and `risk_bias` are stripped from
 * the body — passwords have a dedicated path and `risk_bias` is internal-only
 * research metadata.
 * @route   PUT /api/employees/:id
 * @access  Protected (admin, hr_manager)
 */
const updateEmployee = async (req, res, next) => {
  try {
    const target = await Employee.findById(req.params.id);
    if (!target) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }

    // Prevent role escalation — only admins can change roles
    if (req.body.role !== undefined && req.body.role !== target.role && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Only admins can change roles' });
    }

    // Prevent self lock-out
    if (String(target._id) === String(req.user._id)) {
      if (req.body.role !== undefined && req.body.role !== target.role) {
        return res.status(400).json({ success: false, error: 'You cannot change your own role' });
      }
      if (req.body.is_active === false) {
        return res.status(400).json({ success: false, error: 'You cannot deactivate your own account' });
      }
    }

    // Don't allow password update through this route
    delete req.body.password;
    delete req.body.risk_bias;

    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).select('-password -risk_bias');

    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }

    res.json({ success: true, data: employee });
  } catch (error) {
    next(error);
  }
};

/**
 * Soft delete: set `is_active=false` rather than removing the document, so
 * historical attendance/payroll/risk records keep referential integrity.
 * @route   DELETE /api/employees/:id
 * @access  Protected (admin only)
 */
const deleteEmployee = async (req, res, next) => {
  try {
    if (String(req.params.id) === String(req.user._id)) {
      return res.status(400).json({ success: false, error: 'You cannot deactivate your own account' });
    }

    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { is_active: false },
      { new: true }
    ).select('-password -risk_bias');

    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }

    res.json({ success: true, data: employee, message: 'Employee deactivated' });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin password reset for another user (e.g. a forgotten password).
 * Users change their own password via PUT /api/auth/password instead.
 * @route   PUT /api/employees/:id/password
 * @access  Protected (admin only)
 * @body    password (min 6 chars)
 */
const resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }

    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { password: await bcrypt.hash(password, 12) },
      { new: true }
    ).select('name email');

    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }

    res.json({ success: true, message: `Password reset for ${employee.name}` });
  } catch (error) {
    next(error);
  }
};

module.exports = { getEmployees, getEmployee, createEmployee, updateEmployee, deleteEmployee, resetPassword };
