const express = require('express');
const router = express.Router();
const { submitDecision, getHistory } = require('../controllers/decisionController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/', authorize('admin', 'hr_manager'), submitDecision);
router.get('/:empId', getHistory);

module.exports = router;
