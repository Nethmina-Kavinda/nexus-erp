const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema(
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
    working_hours: {
      type: Number,
      default: 0,
    },
    overtime_hours: {
      type: Number,
      default: 0,
    },
    gross_salary: {
      type: Number,
      default: 0,
    },
    deductions: {
      epf: { type: Number, default: 0 },
      etf: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
    },
    late_penalty: {
      type: Number,
      default: 0,
    },
    net_salary: {
      type: Number,
      default: 0,
    },
    final_salary: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

payrollSchema.index({ employee_id: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Payroll', payrollSchema);
