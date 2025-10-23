const mongoose = require('mongoose');
const { EXPENSE_CATEGORIES } = require('../config/constants');

const expenseSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: Object.values(EXPENSE_CATEGORIES),
    required: [true, 'Please select expense category']
  },
  description: {
    type: String,
    required: [true, 'Please enter expense description'],
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Please enter amount'],
    min: 0
  },
  date: {
    type: Date,
    default: Date.now
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receipt: {
    public_id: String,
    url: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Expense', expenseSchema);
