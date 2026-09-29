const Department = require('../models/Department');
const Employee = require('../models/Employee');

const DEFAULT_DEPARTMENTS = ['Engineering', 'Marketing', 'Finance', 'Operations', 'HR'];

/**
 * Idempotently create the five seed departments. Called once on server
 * start so databases seeded before departments were a collection keep
 * working without a reseed.
 */
const ensureDefaultDepartments = async () => {
  await Promise.all(DEFAULT_DEPARTMENTS.map((name) =>
    Department.updateOne({ name }, { $setOnInsert: { name } }, { upsert: true })
  ));
};

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Case-insensitive lookup so "hr" and "HR" cannot both exist. */
const findByNameInsensitive = (name, excludeId) => Department.findOne({
  name: { $regex: `^${escapeRegex(name)}$`, $options: 'i' },
  ...(excludeId && { _id: { $ne: excludeId } }),
});

/**
 * List departments with active/total headcount, alphabetical.
 * @route   GET /api/departments
 * @access  Protected (any authenticated role; used to populate filters)
 */
const getDepartments = async (req, res, next) => {
  try {
    const [departments, counts] = await Promise.all([
      Department.find().sort({ name: 1 }).lean(),
      Employee.aggregate([
        { $group: { _id: '$department', total: { $sum: 1 }, active: { $sum: { $cond: ['$is_active', 1, 0] } } } },
      ]),
    ]);
    const countMap = Object.fromEntries(counts.map((c) => [c._id, c]));
    const data = departments.map((d) => ({
      ...d,
      employee_count: countMap[d.name]?.total || 0,
      active_count: countMap[d.name]?.active || 0,
    }));
    res.json({ success: true, count: data.length, data });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/departments
 * @access  Protected (admin only)
 * @body    name, description?
 */
const createDepartment = async (req, res, next) => {
  try {
    const name = (req.body.name || '').trim();
    if (!name) {
      return res.status(400).json({ success: false, error: 'Department name is required' });
    }
    if (await findByNameInsensitive(name)) {
      return res.status(400).json({ success: false, error: `A department called "${name}" already exists` });
    }

    const department = await Department.create({
      name,
      description: req.body.description,
      created_by: req.user._id,
    });
    res.status(201).json({ success: true, data: department });
  } catch (error) {
    next(error);
  }
};

/**
 * Rename or re-describe a department. A rename is cascaded to every
 * Employee in it, so risk/payroll/attendance history (joined via the
 * employee) follows automatically.
 * @route   PUT /api/departments/:id
 * @access  Protected (admin only)
 * @body    name?, description?
 */
const updateDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, error: 'Department not found' });
    }

    const oldName = department.name;
    const name = req.body.name !== undefined ? String(req.body.name).trim() : oldName;
    if (!name) {
      return res.status(400).json({ success: false, error: 'Department name is required' });
    }
    if (name !== oldName && await findByNameInsensitive(name, department._id)) {
      return res.status(400).json({ success: false, error: `A department called "${name}" already exists` });
    }

    department.name = name;
    if (req.body.description !== undefined) department.description = req.body.description;
    await department.save();

    if (name !== oldName) {
      await Employee.updateMany({ department: oldName }, { department: name });
    }

    res.json({ success: true, data: department });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a department. If anyone (active or deactivated) still belongs to
 * it, `move_to` must name another department; they are reassigned there
 * first so no employee record is left orphaned.
 * @route   DELETE /api/departments/:id?move_to=<department name>
 * @access  Protected (admin only)
 */
const deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, error: 'Department not found' });
    }

    const members = await Employee.countDocuments({ department: department.name });
    const moveTo = (req.query.move_to || '').trim();

    if (members > 0) {
      if (!moveTo) {
        return res.status(400).json({
          success: false,
          error: `${department.name} has ${members} ${members === 1 ? 'employee' : 'employees'}. Choose a department to move them to.`,
        });
      }
      if (moveTo === department.name || !(await Department.exists({ name: moveTo }))) {
        return res.status(400).json({ success: false, error: 'Choose a different, existing department to move employees to' });
      }
      await Employee.updateMany({ department: department.name }, { department: moveTo });
    }

    await department.deleteOne();
    res.json({
      success: true,
      moved: members,
      message: members
        ? `${department.name} deleted; ${members} moved to ${moveTo}`
        : `${department.name} deleted`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { ensureDefaultDepartments, getDepartments, createDepartment, updateDepartment, deleteDepartment };
