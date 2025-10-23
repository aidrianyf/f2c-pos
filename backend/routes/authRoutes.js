const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  getMe,
  updatePassword
} = require('../controllers/authController');
const { protect, authorizeRoles } = require('../middleware/auth');

router.post('/register', protect, authorizeRoles('admin'), register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.get('/profile', protect, getMe); // Add profile alias
router.put('/password', protect, updatePassword);

module.exports = router;
