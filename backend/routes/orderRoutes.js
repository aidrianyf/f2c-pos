const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrder,
  getMyOrders,
  cancelOrder,
  getUnpaidOrders,
  markAsPaid,
  deleteOrder,
  bulkDeleteOrders
} = require('../controllers/orderController');
const { protect, authorizeRoles } = require('../middleware/auth');

router.post('/', protect, createOrder);
router.post('/bulk-delete', protect, authorizeRoles('admin'), bulkDeleteOrders);
router.get('/', protect, getOrders);
router.get('/unpaid', protect, authorizeRoles('admin'), getUnpaidOrders);
router.get('/my-orders', protect, authorizeRoles('cashier'), getMyOrders);
router.get('/:id', protect, getOrder);
router.patch('/:id/cancel', protect, authorizeRoles('admin'), cancelOrder);
router.patch('/:id/mark-paid', protect, authorizeRoles('admin'), markAsPaid);
router.delete('/:id', protect, authorizeRoles('admin'), deleteOrder);

module.exports = router;
