const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    employee_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    check_in: {
      type: Date,
    },
    check_out: {
      type: Date,
    },
    late_minutes: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late'],
      default: 'present',
    },
    overtime_hours: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

attendanceSchema.index({ employee_id: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
