const Discount = require('../models/Discount');

// Get all discounts
exports.getDiscounts = async (req, res, next) => {
  try {
    const discounts = await Discount.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: discounts.length,
      discounts
    });
  } catch (error) {
    next(error);
  }
};

// Create discount (Admin only)
exports.createDiscount = async (req, res, next) => {
  try {
    const discount = await Discount.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Discount created successfully',
      discount
    });
  } catch (error) {
    next(error);
  }
};

// Update discount (Admin only)
exports.updateDiscount = async (req, res, next) => {
  try {
    let discount = await Discount.findById(req.params.id);

    if (!discount) {
      return res.status(404).json({
        success: false,
        message: 'Discount not found'
      });
    }

    discount = await Discount.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Discount updated successfully',
      discount
    });
  } catch (error) {
    next(error);
  }
};

// Delete discount (Admin only)
exports.deleteDiscount = async (req, res, next) => {
  try {
    const discount = await Discount.findById(req.params.id);

    if (!discount) {
      return res.status(404).json({
        success: false,
        message: 'Discount not found'
      });
    }

    await discount.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Discount deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Validate discount code (Cashier & Admin)
exports.validateDiscount = async (req, res, next) => {
  try {
    const { subtotal } = req.query;
    const code = req.params.code.toUpperCase();

    const discount = await Discount.findOne({
      code,
      isActive: true
    });

    if (!discount) {
      return res.status(404).json({
        success: false,
        message: 'Invalid discount code'
      });
    }

    // Check validity dates
    const now = new Date();
    if (discount.validFrom && now < discount.validFrom) {
      return res.status(400).json({
        success: false,
        message: 'Discount code is not yet valid'
      });
    }

    if (discount.validUntil && now > discount.validUntil) {
      return res.status(400).json({
        success: false,
        message: 'Discount code has expired'
      });
    }

    // Check minimum purchase if subtotal provided
    if (subtotal && parseFloat(subtotal) < discount.minPurchase) {
      return res.status(400).json({
        success: false,
        message: `Minimum purchase of ₱${discount.minPurchase} required`
      });
    }

    // Calculate discount amount if subtotal provided
    let discountAmount = 0;
    if (subtotal) {
      if (discount.type === 'percentage') {
        discountAmount = (parseFloat(subtotal) * discount.value) / 100;
      } else {
        discountAmount = discount.value;
      }
    }

    res.status(200).json({
      success: true,
      message: 'Discount code is valid',
      discount: {
        _id: discount._id,
        code: discount.code,
        name: discount.name,
        type: discount.type,
        value: discount.value,
        minPurchase: discount.minPurchase,
        discountAmount
      }
    });
  } catch (error) {
    next(error);
  }
};
