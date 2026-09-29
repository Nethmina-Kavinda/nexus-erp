const express = require('express');
const router = express.Router();
const {
  register, login, verifyOtp, getMe, updateMe, changePassword, getMyActivity,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOtp);
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.get('/me/activity', protect, getMyActivity);
router.put('/password', protect, changePassword);

module.exports = router;
