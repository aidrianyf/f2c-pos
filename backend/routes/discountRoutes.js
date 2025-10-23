const express = require('express');
const router = express.Router();
const {
  getDiscounts,
  createDiscount,
  updateDiscount,
  deleteDiscount,
  validateDiscount
} = require('../controllers/discountController');
const { protect, authorizeRoles } = require('../middleware/auth');

router.get('/', protect, authorizeRoles('admin'), getDiscounts);
router.post('/', protect, authorizeRoles('admin'), createDiscount);
router.get('/validate/:code', protect, validateDiscount);
router.put('/:id', protect, authorizeRoles('admin'), updateDiscount);
router.delete('/:id', protect, authorizeRoles('admin'), deleteDiscount);

module.exports = router;
