const express = require('express');
const router = express.Router();
const { listInventory, createTransaction } = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', listInventory);
router.post('/transaction', authorize('admin', 'manager'), createTransaction);

module.exports = router;
