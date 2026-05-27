const express = require('express');
const router = express.Router();
const {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getEmployees)
  .post(authorize('admin'), createEmployee);

router.route('/:id')
  .get(getEmployee)
  .put(authorize('admin', 'hr_manager'), updateEmployee)
  .delete(authorize('admin'), deleteEmployee);

module.exports = router;
