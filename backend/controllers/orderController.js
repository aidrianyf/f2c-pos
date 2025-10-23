const Order = require('../models/Order');
const Product = require('../models/Product');
const Discount = require('../models/Discount');

// Create order (POS transaction)
exports.createOrder = async (req, res, next) => {
  try {
    const { items, discountCode, paymentMethod, amountPaid, notes, referenceNumber, paymentStatus, customerName } = req.body;
    console.log('Order creation - referenceNumber received:', referenceNumber);
    console.log('Order creation - paymentStatus:', paymentStatus, 'customerName:', customerName);

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please add items to order'
      });
    }

    // Process each item and calculate totals
    let subtotal = 0;
    const processedItems = [];

    for (const item of items) {
      // Validate product
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.product}`
        });
      }

      if (!product.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `Product ${product.name} is not available`
        });
      }

      // Find matching variant or use basePrice
      let itemPrice;

      if (product.variants && product.variants.length > 0) {
        // Product has variants - find matching one
        const variant = product.variants.find(
          v => v.size === item.size && v.temperature === item.temperature
        );

        if (!variant) {
          return res.status(400).json({
            success: false,
            message: `Variant not found for ${product.name} - ${item.size} ${item.temperature}`
          });
        }

        itemPrice = variant.price;
      } else {
        // Product doesn't have variants - use basePrice
        itemPrice = product.basePrice || 0;
      }

      // Calculate item subtotal
      let itemSubtotal = itemPrice * item.quantity;

      // Add modifiers price
      const modifiersData = [];
      if (item.modifiers && item.modifiers.length > 0) {
        for (const modifierName of item.modifiers) {
          const modifier = product.modifiers.find(m => m.name === modifierName);
          if (modifier) {
            itemSubtotal += modifier.price * item.quantity;
            modifiersData.push({
              name: modifier.name,
              price: modifier.price
            });
          }
        }
      }

      subtotal += itemSubtotal;

      processedItems.push({
        product: product._id,
        productName: product.name,
        size: item.size,
        temperature: item.temperature,
        quantity: item.quantity,
        unitPrice: itemPrice,
        modifiers: modifiersData,
        subtotal: itemSubtotal,
        notes: item.notes || ''
      });

      // Update product sales count and stock
      product.salesCount += item.quantity;
      if (product.trackInventory) {
        product.stockQuantity = Math.max(0, product.stockQuantity - item.quantity);
      }
      await product.save();
    }

    // Apply discount if code provided
    let discountAmount = 0;
    let discountDoc = null;

    if (discountCode) {
      discountDoc = await Discount.findOne({
        code: discountCode.toUpperCase(),
        isActive: true
      });

      if (!discountDoc) {
        return res.status(400).json({
          success: false,
          message: 'Invalid discount code'
        });
      }

      // Check if discount is valid date-wise
      const now = new Date();
      if (discountDoc.validFrom && now < discountDoc.validFrom) {
        return res.status(400).json({
          success: false,
          message: 'Discount code is not yet valid'
        });
      }

      if (discountDoc.validUntil && now > discountDoc.validUntil) {
        return res.status(400).json({
          success: false,
          message: 'Discount code has expired'
        });
      }

      // Check minimum purchase
      if (subtotal < discountDoc.minPurchase) {
        return res.status(400).json({
          success: false,
          message: `Minimum purchase of ₱${discountDoc.minPurchase} required for this discount`
        });
      }

      // Calculate discount
      if (discountDoc.type === 'percentage') {
        discountAmount = (subtotal * discountDoc.value) / 100;
      } else {
        discountAmount = discountDoc.value;
      }

      // Update discount usage count
      discountDoc.usageCount += 1;
      await discountDoc.save();
    }

    // Calculate total
    const total = subtotal - discountAmount;

    // Handle payment validation based on payment status
    const isUnpaid = paymentStatus === 'unpaid';

    if (isUnpaid) {
      // For unpaid orders, customer name is required
      if (!customerName || customerName.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Customer name is required for unpaid orders'
        });
      }
    } else {
      // For paid orders, validate payment amount
      if (!amountPaid || amountPaid < total) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient payment amount'
        });
      }
    }

    // Calculate change (only for paid orders)
    const change = isUnpaid ? 0 : amountPaid - total;

    // Generate order number (FTC-YYYYMMDD-0001 format)
    const today = new Date();
    const dateString = today.toISOString().slice(0, 10).replace(/-/g, '');

    // Count today's orders to get next sequence number
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const todayOrdersCount = await Order.countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    const sequenceNumber = String(todayOrdersCount + 1).padStart(4, '0');
    const orderNumber = `FTC-${dateString}-${sequenceNumber}`;

    // Create order
    const orderData = {
      orderNumber,
      items: processedItems,
      subtotal,
      discount: discountDoc ? discountDoc._id : null,
      discountAmount,
      total,
      paymentMethod,
      amountPaid: isUnpaid ? 0 : amountPaid,
      change,
      referenceNumber: referenceNumber || undefined,
      paymentStatus: isUnpaid ? 'unpaid' : 'paid',
      customerName: isUnpaid ? customerName : undefined,
      paidAt: isUnpaid ? undefined : new Date(),
      cashier: req.user._id,
      notes: notes || ''
    };

    const order = await Order.create(orderData);

    // Populate order data
    const populatedOrder = await Order.findById(order._id)
      .populate('cashier', 'firstName lastName')
      .populate('discount', 'code name type value');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: populatedOrder
    });
  } catch (error) {
    next(error);
  }
};

// Get all orders
exports.getOrders = async (req, res, next) => {
  try {
    const { startDate, endDate, status, paymentMethod } = req.query;

    // Build query
    const query = {};

    // If cashier, only show their orders
    if (req.user.role === 'cashier') {
      query.cashier = req.user._id;
    }

    if (status) {
      query.status = status;
    }

    if (paymentMethod) {
      query.paymentMethod = paymentMethod;
    }

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    const orders = await Order.find(query)
      .populate('cashier', 'firstName lastName')
      .populate('discount', 'code name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    next(error);
  }
};

// Get single order
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('cashier', 'firstName lastName email')
      .populate('discount', 'code name type value')
      .populate('items.product');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // If cashier, only allow viewing their own orders
    if (req.user.role === 'cashier' && order.cashier._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
};

// Get cashier's own orders
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ cashier: req.user._id })
      .populate('discount', 'code name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    next(error);
  }
};

// Cancel order (Admin only)
exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Order is already cancelled'
      });
    }

    order.status = 'cancelled';
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    next(error);
  }
};

// Get unpaid orders (Admin only)
exports.getUnpaidOrders = async (req, res, next) => {
  try {
    const unpaidOrders = await Order.find({ paymentStatus: 'unpaid' })
      .populate('cashier', 'firstName lastName')
      .populate('discount', 'code name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: unpaidOrders.length,
      orders: unpaidOrders
    });
  } catch (error) {
    next(error);
  }
};

// Mark order as paid (Admin only)
exports.markAsPaid = async (req, res, next) => {
  try {
    const { amountPaid, paymentMethod, referenceNumber } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Order is already paid'
      });
    }

    // Validate payment amount
    if (!amountPaid || amountPaid < order.total) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient payment amount'
      });
    }

    // Calculate change
    const change = amountPaid - order.total;

    // Update order
    order.paymentStatus = 'paid';
    order.amountPaid = amountPaid;
    order.change = change;
    order.paymentMethod = paymentMethod || order.paymentMethod;
    order.referenceNumber = referenceNumber || order.referenceNumber;
    order.paidAt = new Date();

    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('cashier', 'firstName lastName')
      .populate('discount', 'code name');

    res.status(200).json({
      success: true,
      message: 'Order marked as paid successfully',
      order: populatedOrder
    });
  } catch (error) {
    next(error);
  }
};

// Delete single order (Admin only)
exports.deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    await Order.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Bulk delete orders (Admin only)
exports.bulkDeleteOrders = async (req, res, next) => {
  try {
    const { orderIds } = req.body;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide order IDs to delete'
      });
    }

    const result = await Order.deleteMany({ _id: { $in: orderIds } });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} order(s) deleted successfully`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    next(error);
  }
};
