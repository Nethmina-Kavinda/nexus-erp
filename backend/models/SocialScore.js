const mongoose = require('mongoose');

const socialScoreSchema = new mongoose.Schema(
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
    job_search: {
      type: Number,
      min: 0,
      max: 1,
    },
    post_drop: {
      type: Number,
      min: 0,
      max: 1,
    },
    network_growth: {
      type: Number,
      min: 0,
      max: 1,
    },
    sentiment: {
      type: Number,
      min: 0,
      max: 1,
    },
    social_score: {
      type: Number,
      min: 0,
      max: 1,
    },
    social_data_source: {
      type: String,
      default: 'synthetic',
    },
  },
  { timestamps: true }
);

socialScoreSchema.index({ employee_id: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('SocialScore', socialScoreSchema);
