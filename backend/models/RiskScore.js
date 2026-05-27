const mongoose = require('mongoose');

const riskScoreSchema = new mongoose.Schema(
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
    risk_score: {
      type: Number,
      min: 0,
      max: 100,
    },
    risk_class: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
    },
    ml_status: {
      type: String,
      enum: ['predicted', 'formula_only'],
      default: 'formula_only',
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
    },
    confidence_label: {
      type: String,
      enum: ['Strong', 'Moderate', 'Uncertain'],
    },
    top_drivers: [
      {
        feature: String,
        impact: { type: String, enum: ['high', 'moderate', 'low'] },
        explanation: String,
      },
    ],
    shap_base_value: {
      type: Number,
    },
    shap_values: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

riskScoreSchema.index({ employee_id: 1, month: 1 }, { unique: true });
riskScoreSchema.index({ month: 1, risk_class: 1 });

module.exports = mongoose.model('RiskScore', riskScoreSchema);
