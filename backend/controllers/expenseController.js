const Expense = require('../models/Expense');

// Get all expenses
exports.getExpenses = async (req, res, next) => {
  try {
    const { startDate, endDate, category } = req.query;

    // Build query
    const query = {};

    if (category) {
      query.category = category;
    }

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }

    const expenses = await Expense.find(query)
      .populate('addedBy', 'firstName lastName')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: expenses.length,
      expenses
    });
  } catch (error) {
    next(error);
  }
};

// Get expense summary by category
exports.getExpenseSummary = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    // Build match query
    const matchQuery = {};

    if (startDate || endDate) {
      matchQuery.date = {};
      if (startDate) {
        matchQuery.date.$gte = new Date(startDate);
      }
      if (endDate) {
        matchQuery.date.$lte = new Date(endDate);
      }
    }

    const summary = await Expense.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          total: 1,
          count: 1
        }
      },
      { $sort: { total: -1 } }
    ]);

    const totalExpenses = summary.reduce((acc, item) => acc + item.total, 0);

    res.status(200).json({
      success: true,
      totalExpenses,
      summary
    });
  } catch (error) {
    next(error);
  }
};

// Create expense (Admin only)
exports.createExpense = async (req, res, next) => {
  try {
    const expenseData = {
      ...req.body,
      addedBy: req.user._id
    };

    const expense = await Expense.create(expenseData);

    const populatedExpense = await Expense.findById(expense._id)
      .populate('addedBy', 'firstName lastName');

    res.status(201).json({
      success: true,
      message: 'Expense recorded successfully',
      expense: populatedExpense
    });
  } catch (error) {
    next(error);
  }
};

// Update expense (Admin only)
exports.updateExpense = async (req, res, next) => {
  try {
    let expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('addedBy', 'firstName lastName');

    res.status(200).json({
      success: true,
      message: 'Expense updated successfully',
      expense
    });
  } catch (error) {
    next(error);
  }
};

// Delete expense (Admin only)
exports.deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    await expense.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
