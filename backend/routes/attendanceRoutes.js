const express = require('express');
const router = express.Router();
const { checkIn, checkOut, getMonthlySummary } = require('../controllers/attendanceController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.get('/:empId/monthly', getMonthlySummary);

module.exports = router;
