const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { generateReport } = require('../controllers/reportController');

router.post('/generate', protect, authorize('admin', 'hr_manager'), generateReport);

module.exports = router;
