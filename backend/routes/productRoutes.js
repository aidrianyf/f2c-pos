const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleAvailability,
  getLowStockProducts,
  updateStock
} = require('../controllers/productController');
const { protect, authorizeRoles } = require('../middleware/auth');

router.get('/', getProducts);
router.get('/low-stock/all', protect, authorizeRoles('admin'), getLowStockProducts);
router.get('/:id', getProduct);
router.post('/', protect, authorizeRoles('admin'), createProduct);
router.put('/:id', protect, authorizeRoles('admin'), updateProduct);
router.delete('/:id', protect, authorizeRoles('admin'), deleteProduct);
router.patch('/:id/availability', protect, authorizeRoles('admin'), toggleAvailability);
router.patch('/:id/stock', protect, authorizeRoles('admin'), updateStock);

module.exports = router;
