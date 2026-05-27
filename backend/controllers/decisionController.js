const HRDecision = require('../models/HRDecision');
const RiskScore = require('../models/RiskScore');

/**
 * Record an HR accept/reject of an ML risk prediction. This is the labelled
 * ground truth that powers stage_2 retraining (the human-in-the-loop core
 * of the research). On reject, the corrected class is written back to the
 * RiskScore so the UI immediately reflects the override.
 * @route   POST /api/decisions
 * @access  Protected (admin, hr_manager)
 * @body    { employee_id, month, original_class, decision: "accept"|"reject",
 *            corrected_class? (required if reject), reason? }
 */
const submitDecision = async (req, res, next) => {
  try {
    const { employee_id, month, original_class, decision, corrected_class, reason } = req.body;

    if (!employee_id || !month || !decision) {
      return res.status(400).json({ success: false, error: 'employee_id, month, and decision are required' });
    }

    if (decision === 'reject' && !corrected_class) {
      return res.status(400).json({ success: false, error: 'corrected_class required when rejecting' });
    }

    const hrDecision = await HRDecision.create({
      employee_id,
      month,
      original_class,
      decision,
      corrected_class: decision === 'reject' ? corrected_class : original_class,
      reason,
      decided_by: req.user._id,
    });

    // If rejected, update the RiskScore
    if (decision === 'reject' && corrected_class) {
      await RiskScore.findOneAndUpdate(
        { employee_id, month },
        { risk_class: corrected_class }
      );
    }

    res.status(201).json({ success: true, data: hrDecision });
  } catch (error) {
    next(error);
  }
};

/**
 * Audit trail of every HR decision for one employee, populated with the
 * deciding user's name + role.
 * @route   GET /api/decisions/:empId
 * @access  Protected (admin, hr_manager)
 */
const getHistory = async (req, res, next) => {
  try {
    const decisions = await HRDecision.find({ employee_id: req.params.empId })
      .populate('decided_by', 'name role')
      .sort({ month: -1 });

    res.json({ success: true, count: decisions.length, data: decisions });
  } catch (error) {
    next(error);
  }
};

module.exports = { submitDecision, getHistory };
