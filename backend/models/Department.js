const mongoose = require('mongoose');

/**
 * Organisational department. Employees reference a department by `name`
 * (a plain string on Employee), so a rename is cascaded to Employee records
 * in the controller. The five seed departments are ensured on startup.
 */
const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Department name is required'],
      unique: true,
      trim: true,
      maxlength: [40, 'Department name must be 40 characters or fewer'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Department', departmentSchema);
