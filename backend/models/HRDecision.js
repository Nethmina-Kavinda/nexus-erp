const mongoose = require('mongoose');

const hrDecisionSchema = new mongoose.Schema(
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
    original_class: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      required: true,
    },
    decision: {
      type: String,
      enum: ['accept', 'reject'],
      required: true,
    },
    corrected_class: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
    },
    reason: {
      type: String,
      trim: true,
    },
    decided_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
    },
    decided_at: {
      type: Date,
      default: Date.now,
    },
    // Provenance: 'seed' = synthetic historical label from seed step 7,
    // 'hr_review' = recorded by an HR user in the app. Only 'hr_review'
    // decisions lock a prediction against further accept/reject.
    source: {
      type: String,
      enum: ['seed', 'hr_review'],
    },
  },
  { timestamps: true }
);

hrDecisionSchema.index({ employee_id: 1, month: 1 });

module.exports = mongoose.model('HRDecision', hrDecisionSchema);
