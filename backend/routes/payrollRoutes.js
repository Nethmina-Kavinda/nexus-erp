const express = require('express');
const router = express.Router();
const { generatePayroll, getPayrollRecords } = require('../controllers/payrollController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/generate', authorize('admin', 'hr_manager'), generatePayroll);
router.get('/:empId', getPayrollRecords);

module.exports = router;
