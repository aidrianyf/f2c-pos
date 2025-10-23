const mongoose = require('mongoose');
const { ORDER_STATUS, PAYMENT_METHODS } = require('../config/constants');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    productName: {
      type: String,
      required: true
    },
    size: {
      type: String,
      required: true
    },
    temperature: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    unitPrice: {
      type: Number,
      required: true
    },
    modifiers: [{
      name: String,
      price: Number
    }],
    subtotal: {
      type: Number,
      required: true
    },
    notes: {
      type: String,
      trim: true
    }
  }],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Discount'
  },
  discountAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: Object.values(PAYMENT_METHODS),
    required: [true, 'Please select payment method']
  },
  amountPaid: {
    type: Number,
    required: [true, 'Please enter amount paid'],
    min: 0
  },
  change: {
    type: Number,
    default: 0,
    min: 0
  },
  referenceNumber: {
    type: String,
    trim: true
  },
  paymentStatus: {
    type: String,
    enum: ['paid', 'unpaid'],
    default: 'paid'
  },
  customerName: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: Object.values(ORDER_STATUS),
    default: ORDER_STATUS.COMPLETED
  },
  cashier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notes: {
    type: String,
    trim: true
  },
  paidAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}`;

    // Find the last order of the day
    const lastOrder = await this.constructor
      .findOne({ orderNumber: new RegExp(`^FTC-${dateStr}`) })
      .sort({ orderNumber: -1 });

    let sequence = 1;
    if (lastOrder) {
      const lastSequence = parseInt(lastOrder.orderNumber.split('-')[2]);
      sequence = lastSequence + 1;
    }

    this.orderNumber = `FTC-${dateStr}-${String(sequence).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
