import { useState, useEffect } from 'react';
import { FiTrendingUp, FiTrendingDown, FiDollarSign } from 'react-icons/fi';
import { orderService } from '../../services/orderService';
import { expenseService } from '../../services/expenseService';
import { toast } from 'react-toastify';

const FinancePage = () => {
  const [period, setPeriod] = useState('today');
  const [revenue, setRevenue] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [profit, setProfit] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFinanceData();
  }, [period]);

  const loadFinanceData = async () => {
    try {
      const [ordersData, expensesData] = await Promise.all([
        orderService.getAllOrders(),
        expenseService.getAllExpenses(),
      ]);

      if (ordersData.success && expensesData.success) {
        const orders = ordersData.orders || [];
        const expensesList = expensesData.expenses || [];

        const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
        const totalExpenses = expensesList.reduce((sum, expense) => sum + expense.amount, 0);
        const totalProfit = totalRevenue - totalExpenses;

        setRevenue(totalRevenue);
        setExpenses(totalExpenses);
        setProfit(totalProfit);
      }
    } catch (error) {
      toast.error('Failed to load finance data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const profitMargin = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : 0;

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Finance Tracking</h1>
          <p className="text-gray-600 mt-1">Monitor your revenue, expenses, and profit</p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* Finance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Total Revenue</h3>
            <div className="p-3 rounded-lg bg-green-100 text-green-600">
              <FiTrendingUp size={24} />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800">₱{revenue.toFixed(2)}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Total Expenses</h3>
            <div className="p-3 rounded-lg bg-red-100 text-red-600">
              <FiTrendingDown size={24} />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800">₱{expenses.toFixed(2)}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Net Profit</h3>
            <div className={`p-3 rounded-lg ${profit >= 0 ? 'bg-primary-light/10 text-primary' : 'bg-red-100 text-red-600'}`}>
              <FiDollarSign size={24} />
            </div>
          </div>
          <p className={`text-3xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ₱{profit.toFixed(2)}
          </p>
          <p className="text-sm text-gray-500 mt-2">Profit Margin: {profitMargin}%</p>
        </div>
      </div>

      {/* Profit & Loss Statement */}
      <div className="bg-white rounded-lg shadow border border-gray-200 mb-8">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Profit & Loss Statement</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b">
              <span className="text-gray-700 font-medium">Revenue</span>
              <span className="text-lg font-semibold text-green-600">+ ₱{revenue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b">
              <span className="text-gray-700 font-medium">Expenses</span>
              <span className="text-lg font-semibold text-red-600">- ₱{expenses.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pt-4 border-t-2">
              <span className="text-gray-800 font-bold text-lg">Net Profit</span>
              <span className={`text-2xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₱{profit.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition text-left">
              Add New Expense
            </button>
            <button className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-left">
              Export Report (PDF)
            </button>
            <button className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-left">
              Export Report (Excel)
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Financial Health</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Profit Margin</span>
                <span className="font-medium">{profitMargin}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: `${Math.min(profitMargin, 100)}%` }}
                ></div>
              </div>
            </div>
            <div className="pt-3 border-t">
              <p className="text-sm text-gray-600">
                {profit >= 0
                  ? '✅ Your business is profitable!'
                  : '⚠️ Expenses exceed revenue. Review your costs.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancePage;
