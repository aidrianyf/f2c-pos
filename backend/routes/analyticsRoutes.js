const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getSalesReport,
  getCashierPerformance,
  getProductPerformance,
  getProfitAnalysis
} = require('../controllers/analyticsController');
const { protect, authorizeRoles } = require('../middleware/auth');

router.get('/dashboard', protect, authorizeRoles('admin'), getDashboardStats);
router.get('/sales', protect, authorizeRoles('admin'), getSalesReport);
router.get('/cashiers', protect, authorizeRoles('admin'), getCashierPerformance);
router.get('/products', protect, authorizeRoles('admin'), getProductPerformance);
router.get('/profit', protect, authorizeRoles('admin'), getProfitAnalysis);

module.exports = router;
