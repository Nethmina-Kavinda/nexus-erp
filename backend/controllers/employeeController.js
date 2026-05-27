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
 * Update an employee record. Two security guards: (1) only admins may set
 * the `admin` role to prevent privilege escalation, and (2) `password` and
 * `risk_bias` are stripped from the body — passwords have a dedicated path
 * and `risk_bias` is internal-only research metadata.
 * @route   PUT /api/employees/:id
 * @access  Protected (admin, hr_manager)
 */
const updateEmployee = async (req, res, next) => {
  try {
    // Prevent role escalation — only admin can set admin role
    if (req.body.role === 'admin' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Only admins can assign admin role' });
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

module.exports = { getEmployees, getEmployee, createEmployee, updateEmployee, deleteEmployee };
