const mongoose = require('mongoose');
const { DISCOUNT_TYPES } = require('../config/constants');

const discountSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Please enter discount code'],
    unique: true,
    uppercase: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Please enter discount name'],
    trim: true
  },
  type: {
    type: String,
    enum: Object.values(DISCOUNT_TYPES),
    required: [true, 'Please select discount type']
  },
  value: {
    type: Number,
    required: [true, 'Please enter discount value'],
    min: 0
  },
  minPurchase: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  validFrom: {
    type: Date,
    default: Date.now
  },
  validUntil: {
    type: Date
  },
  usageCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Convert code to uppercase before saving
discountSchema.pre('save', function(next) {
  if (this.code) {
    this.code = this.code.toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Discount', discountSchema);
