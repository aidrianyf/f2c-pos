const User = require('../models/User');
const { USER_STATUS, USER_ROLES } = require('../config/constants');

// @desc    Google OAuth success callback
// @route   GET /api/auth/google/callback
// @access  Public
exports.googleCallback = (req, res) => {
  if (!req.user) {
    // User is pending approval or other issue
    return res.redirect(`${process.env.CLIENT_URL}/login?error=pending_approval`);
  }

  // Generate JWT token
  const token = req.user.getJwtToken();

  // Set cookie options
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  };

  // Redirect to appropriate dashboard
  const redirectPath = req.user.role === USER_ROLES.ADMIN ? '/admin' : '/cashier';

  res.cookie('token', token, options);
  res.redirect(`${process.env.CLIENT_URL}${redirectPath}`);
};

// @desc    Get all pending users (Admin only)
// @route   GET /api/auth/pending-users
// @access  Private/Admin
exports.getPendingUsers = async (req, res, next) => {
  try {
    const pendingUsers = await User.find({ status: USER_STATUS.PENDING })
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: pendingUsers.length,
      users: pendingUsers
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve user and assign role (Admin only)
// @route   PUT /api/auth/approve-user/:id
// @access  Private/Admin
exports.approveUser = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!role || !Object.values(USER_ROLES).includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid role (admin or cashier)'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.status !== USER_STATUS.PENDING) {
      return res.status(400).json({
        success: false,
        message: 'User is not pending approval'
      });
    }

    user.status = USER_STATUS.ACTIVE;
    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User approved as ${role}`,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject/delete pending user (Admin only)
// @route   DELETE /api/auth/reject-user/:id
// @access  Private/Admin
exports.rejectUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.status !== USER_STATUS.PENDING) {
      return res.status(400).json({
        success: false,
        message: 'Can only reject pending users'
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User rejected and removed'
    });
  } catch (error) {
    next(error);
  }
};
