const mongoose = require('mongoose');

const employeeFeatureSchema = new mongoose.Schema(
  {
    employee_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    month: {
      type: String,
      required: true,
    },
    absence_rate: {
      type: Number,
      min: 0,
      max: 1,
    },
    late_rate: {
      type: Number,
      min: 0,
      max: 1,
    },
    overtime_ratio: {
      type: Number,
      min: 0,
      max: 1,
    },
    productivity_index: {
      type: Number,
      min: 0,
      max: 1,
    },
    payroll_variance: {
      type: Number,
      min: 0,
      max: 1,
    },
    social_score: {
      type: Number,
      min: 0,
      max: 1,
    },
    tenure_months: {
      type: Number,
      min: 0,
      max: 1,
    },
    department_risk: {
      type: Number,
      min: 0,
      max: 1,
    },
  },
  { timestamps: true }
);

employeeFeatureSchema.index({ employee_id: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('EmployeeFeature', employeeFeatureSchema);
