const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  updateUserStatus
} = require('../controllers/userController');
const { protect, authorizeRoles } = require('../middleware/auth');

router.get('/', protect, authorizeRoles('admin'), getUsers);
router.get('/:id', protect, authorizeRoles('admin'), getUser);
router.put('/:id', protect, authorizeRoles('admin'), updateUser);
router.delete('/:id', protect, authorizeRoles('admin'), deleteUser);
router.patch('/:id/status', protect, authorizeRoles('admin'), updateUserStatus);

module.exports = router;
