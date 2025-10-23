const mongoose = require('mongoose');
const { PRODUCT_SIZES, PRODUCT_TEMPERATURES } = require('../config/constants');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter product name'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Please select a category']
  },
  image: {
    public_id: String,
    url: String
  },
  basePrice: {
    type: Number,
    min: 0,
    default: 0
  },
  variants: [{
    size: {
      type: String,
      enum: Object.values(PRODUCT_SIZES),
      required: true
    },
    temperature: {
      type: String,
      enum: Object.values(PRODUCT_TEMPERATURES),
      required: true
    },
    price: {
      type: Number,
      required: [true, 'Please enter price'],
      min: 0
    },
    cost: {
      type: Number,
      min: 0,
      default: 0
    }
  }],
  modifiers: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  isAvailable: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  salesCount: {
    type: Number,
    default: 0
  },
  stockQuantity: {
    type: Number,
    default: 0,
    min: 0
  },
  lowStockThreshold: {
    type: Number,
    default: 10,
    min: 0
  },
  trackInventory: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
