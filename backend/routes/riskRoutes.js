const express = require('express');
const router = express.Router();
const { getScores, predictForEmployee, retrain, getMlStatus } = require('../controllers/riskController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/scores', getScores);
router.get('/predict/:empId', predictForEmployee);
router.post('/retrain', authorize('admin', 'hr_manager'), retrain);
router.get('/ml-status', getMlStatus);

module.exports = router;
