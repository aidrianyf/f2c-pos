const express = require('express');
const router = express.Router();
const {
  getExpenses,
  getExpenseSummary,
  createExpense,
  updateExpense,
  deleteExpense
} = require('../controllers/expenseController');
const { protect, authorizeRoles } = require('../middleware/auth');

router.get('/', protect, authorizeRoles('admin'), getExpenses);
router.get('/summary', protect, authorizeRoles('admin'), getExpenseSummary);
router.post('/', protect, authorizeRoles('admin'), createExpense);
router.put('/:id', protect, authorizeRoles('admin'), updateExpense);
router.delete('/:id', protect, authorizeRoles('admin'), deleteExpense);

module.exports = router;
