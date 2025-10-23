const Order = require('../models/Order');
const Expense = require('../models/Expense');
const Product = require('../models/Product');

// Helper function to calculate revenue by category type (food or drink)
const calculateRevenueByType = async (orders, type) => {
  let revenue = 0;

  for (const order of orders) {
    for (const item of order.items) {
      const product = await Product.findById(item.product).populate('category');
      if (product && product.category && product.category.type === type) {
        revenue += item.subtotal;
      }
    }
  }

  return revenue;
};

// Get dashboard statistics
exports.getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Today's stats
    const todayOrders = await Order.find({
      createdAt: { $gte: today },
      status: { $ne: 'cancelled' }
    });

    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
    const todayOrderCount = todayOrders.length;

    const todayExpenses = await Expense.find({
      date: { $gte: today }
    });

    const todayExpenseTotal = todayExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const todayProfit = todayRevenue - todayExpenseTotal;

    // This month's stats
    const monthOrders = await Order.find({
      createdAt: { $gte: startOfMonth },
      status: { $ne: 'cancelled' }
    });

    const monthRevenue = monthOrders.reduce((sum, order) => sum + order.total, 0);
    const monthOrderCount = monthOrders.length;

    const monthExpenses = await Expense.find({
      date: { $gte: startOfMonth }
    });

    const monthExpenseTotal = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const monthProfit = monthRevenue - monthExpenseTotal;

    // Best selling products (top 5)
    const bestSellers = await Product.find({ salesCount: { $gt: 0 } })
      .sort({ salesCount: -1 })
      .limit(5)
      .populate('category', 'name')
      .select('name salesCount category');

    // Calculate food vs drink revenue for today
    const todayDrinkRevenue = await calculateRevenueByType(todayOrders, 'drink');
    const todayFoodRevenue = await calculateRevenueByType(todayOrders, 'food');

    // Calculate food vs drink revenue for this month
    const monthDrinkRevenue = await calculateRevenueByType(monthOrders, 'drink');
    const monthFoodRevenue = await calculateRevenueByType(monthOrders, 'food');

    res.status(200).json({
      success: true,
      stats: {
        today: {
          revenue: todayRevenue,
          orders: todayOrderCount,
          expenses: todayExpenseTotal,
          profit: todayProfit,
          drinkRevenue: todayDrinkRevenue,
          foodRevenue: todayFoodRevenue
        },
        month: {
          revenue: monthRevenue,
          orders: monthOrderCount,
          expenses: monthExpenseTotal,
          profit: monthProfit,
          drinkRevenue: monthDrinkRevenue,
          foodRevenue: monthFoodRevenue
        },
        bestSellers
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get sales report
exports.getSalesReport = async (req, res, next) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;

    // Build match query
    const matchQuery = { status: { $ne: 'cancelled' } };

    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) {
        matchQuery.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        matchQuery.createdAt.$lte = new Date(endDate);
      }
    }

    // Group by format
    let groupFormat;
    switch (groupBy) {
      case 'hour':
        groupFormat = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
          hour: { $hour: '$createdAt' }
        };
        break;
      case 'week':
        groupFormat = {
          year: { $year: '$createdAt' },
          week: { $week: '$createdAt' }
        };
        break;
      case 'month':
        groupFormat = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        };
        break;
      default: // day
        groupFormat = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
    }

    const salesData = await Order.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: groupFormat,
          revenue: { $sum: '$total' },
          orderCount: { $sum: 1 },
          averageOrderValue: { $avg: '$total' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.hour': 1 } }
    ]);

    const totalRevenue = salesData.reduce((sum, item) => sum + item.revenue, 0);
    const totalOrders = salesData.reduce((sum, item) => sum + item.orderCount, 0);

    res.status(200).json({
      success: true,
      summary: {
        totalRevenue,
        totalOrders,
        averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
      },
      data: salesData
    });
  } catch (error) {
    next(error);
  }
};

// Get cashier performance
exports.getCashierPerformance = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    // Build match query
    const matchQuery = { status: { $ne: 'cancelled' } };

    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) {
        matchQuery.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        matchQuery.createdAt.$lte = new Date(endDate);
      }
    }

    const performance = await Order.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$cashier',
          totalSales: { $sum: '$total' },
          orderCount: { $sum: 1 },
          averageOrderValue: { $avg: '$total' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'cashier'
        }
      },
      { $unwind: '$cashier' },
      {
        $project: {
          _id: 0,
          cashierId: '$_id',
          cashierName: {
            $concat: ['$cashier.firstName', ' ', '$cashier.lastName']
          },
          totalSales: 1,
          orderCount: 1,
          averageOrderValue: 1
        }
      },
      { $sort: { totalSales: -1 } }
    ]);

    res.status(200).json({
      success: true,
      performance
    });
  } catch (error) {
    next(error);
  }
};

// Get product performance
exports.getProductPerformance = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    // Build match query
    const matchQuery = { status: { $ne: 'cancelled' } };

    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) {
        matchQuery.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        matchQuery.createdAt.$lte = new Date(endDate);
      }
    }

    const productStats = await Order.aggregate([
      { $match: matchQuery },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          productName: { $first: '$items.productName' },
          quantitySold: { $sum: '$items.quantity' },
          revenue: { $sum: '$items.subtotal' }
        }
      },
      { $sort: { quantitySold: -1 } }
    ]);

    res.status(200).json({
      success: true,
      count: productStats.length,
      products: productStats
    });
  } catch (error) {
    next(error);
  }
};

// Get profit analysis
exports.getProfitAnalysis = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    // Build match query for orders
    const orderMatchQuery = { status: { $ne: 'cancelled' } };
    const expenseMatchQuery = {};

    if (startDate || endDate) {
      if (startDate) {
        orderMatchQuery.createdAt = { $gte: new Date(startDate) };
        expenseMatchQuery.date = { $gte: new Date(startDate) };
      }
      if (endDate) {
        orderMatchQuery.createdAt = orderMatchQuery.createdAt || {};
        orderMatchQuery.createdAt.$lte = new Date(endDate);
        expenseMatchQuery.date = expenseMatchQuery.date || {};
        expenseMatchQuery.date.$lte = new Date(endDate);
      }
    }

    // Get total revenue
    const orders = await Order.find(orderMatchQuery);
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

    // Get total expenses
    const expenses = await Expense.find(expenseMatchQuery);
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    // Calculate product costs
    let totalCosts = 0;
    for (const order of orders) {
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product) {
          const variant = product.variants.find(
            v => v.size === item.size && v.temperature === item.temperature
          );
          if (variant && variant.cost) {
            totalCosts += variant.cost * item.quantity;
          }
        }
      }
    }

    // Calculate profit
    const grossProfit = totalRevenue - totalCosts;
    const netProfit = totalRevenue - totalCosts - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    res.status(200).json({
      success: true,
      analysis: {
        totalRevenue,
        totalCosts,
        totalExpenses,
        grossProfit,
        netProfit,
        profitMargin: profitMargin.toFixed(2) + '%'
      }
    });
  } catch (error) {
    next(error);
  }
};
