const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['admin', 'hr_manager', 'manager', 'employee'],
      default: 'employee',
    },
    // Must name an existing Department; admins manage the list.
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
      validate: {
        validator: async (name) => !!(await mongoose.model('Department').exists({ name })),
        message: (props) => `Department "${props.value}" does not exist`,
      },
    },
    position: {
      type: String,
      trim: true,
    },
    hourly_rate: {
      type: Number,
      required: [true, 'Hourly rate is required'],
      min: 0,
    },
    allowances: {
      type: Number,
      default: 0,
      min: 0,
    },
    risk_bias: {
      type: Number,
      min: 0,
      max: 0.5,
      select: false,
    },
    hire_date: {
      type: Date,
      required: [true, 'Hire date is required'],
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

employeeSchema.index({ department: 1 });

module.exports = mongoose.model('Employee', employeeSchema);
