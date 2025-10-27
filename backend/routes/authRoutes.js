const express = require('express');
const router = express.Router();
const passport = require('passport');
const {
  register,
  login,
  logout,
  getMe,
  updatePassword
} = require('../controllers/authController');
const {
  googleCallback,
  getPendingUsers,
  approveUser,
  rejectUser
} = require('../controllers/oauthController');
const { protect, authorizeRoles } = require('../middleware/auth');

// Traditional auth routes
router.post('/register', protect, authorizeRoles('admin'), register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.get('/profile', protect, getMe); // Add profile alias
router.put('/password', protect, updatePassword);

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.CLIENT_URL}/login?error=auth_failed`,
    session: false
  }),
  googleCallback
);

// User management routes (Admin only)
router.get('/pending-users', protect, authorizeRoles('admin'), getPendingUsers);
router.put('/approve-user/:id', protect, authorizeRoles('admin'), approveUser);
router.delete('/reject-user/:id', protect, authorizeRoles('admin'), rejectUser);

module.exports = router;
