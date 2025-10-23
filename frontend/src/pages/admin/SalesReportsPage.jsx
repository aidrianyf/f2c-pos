import { useState, useEffect } from 'react';
import { analyticsService } from '../../services/analyticsService';
import { toast } from 'react-toastify';
import { FiCalendar, FiTrendingUp, FiDollarSign, FiShoppingCart, FiDownload } from 'react-icons/fi';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const SalesReportsPage = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('today');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [groupBy, setGroupBy] = useState('day');
  const [categoryType, setCategoryType] = useState('all'); // 'all', 'drink', 'food'

  // Analytics data
  const [salesData, setSalesData] = useState([]);
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0
  });
  const [productPerformance, setProductPerformance] = useState([]);

  useEffect(() => {
    loadAnalytics();
  }, [dateRange, startDate, endDate, groupBy, categoryType]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Build query params based on date range
      const params = buildQueryParams();

      // Fetch sales report and product performance in parallel
      const [salesResponse, productResponse] = await Promise.all([
        analyticsService.getSalesReport(params),
        analyticsService.getProductPerformance(params)
      ]);

      if (salesResponse.success) {
        setSalesData(salesResponse.data || []);
        setSummary(salesResponse.summary || {
          totalRevenue: 0,
          totalOrders: 0,
          averageOrderValue: 0
        });
      }

      if (productResponse.success) {
        setProductPerformance(productResponse.products || []);
      }
    } catch (error) {
      toast.error('Failed to load analytics data');
      console.error('Analytics error:', error);
    } finally {
      setLoading(false);
    }
  };

  const buildQueryParams = () => {
    const params = { groupBy };
    const now = new Date();

    switch (dateRange) {
      case 'today':
        params.startDate = new Date(now.setHours(0, 0, 0, 0)).toISOString();
        params.endDate = new Date(now.setHours(23, 59, 59, 999)).toISOString();
        break;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        params.startDate = weekAgo.toISOString();
        params.endDate = new Date().toISOString();
        break;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        params.startDate = monthAgo.toISOString();
        params.endDate = new Date().toISOString();
        break;
      case 'custom':
        if (startDate) params.startDate = new Date(startDate).toISOString();
        if (endDate) params.endDate = new Date(endDate).toISOString();
        break;
    }

    // Add category type filter
    if (categoryType !== 'all') {
      params.categoryType = categoryType;
    }

    return params;
  };

  // Format sales data for charts
  const formatSalesDataForChart = () => {
    return salesData.map(item => {
      const { _id, revenue, orderCount } = item;
      let label = '';

      if (_id.year && _id.month && _id.day && _id.hour !== undefined) {
        // Hour format
        label = `${_id.month}/${_id.day} ${_id.hour}:00`;
      } else if (_id.year && _id.month && _id.day) {
        // Day format
        label = `${_id.month}/${_id.day}/${_id.year}`;
      } else if (_id.year && _id.week) {
        // Week format
        label = `Week ${_id.week}, ${_id.year}`;
      } else if (_id.year && _id.month) {
        // Month format
        label = `${_id.month}/${_id.year}`;
      }

      return {
        date: label,
        revenue: revenue || 0,
        orders: orderCount || 0
      };
    });
  };

  // Format product data for charts
  const formatProductData = () => {
    return productPerformance.slice(0, 5).map(product => ({
      name: product.productName || 'Unknown',
      quantity: product.quantitySold || 0,
      revenue: product.revenue || 0
    }));
  };

  const handleExportSales = () => {
    try {
      const exportData = salesData.map(item => ({
        Date: formatDateLabel(item._id),
        Revenue: item.revenue?.toFixed(2) || '0.00',
        'Order Count': item.orderCount || 0,
        'Avg Order Value': item.averageOrderValue?.toFixed(2) || '0.00'
      }));
      analyticsService.exportToCSV(exportData, 'sales_report');
      toast.success('Sales report exported successfully');
    } catch (error) {
      toast.error('Failed to export sales report');
    }
  };

  const handleExportProducts = () => {
    try {
      const exportData = productPerformance.map(product => ({
        'Product Name': product.productName || 'Unknown',
        'Quantity Sold': product.quantitySold || 0,
        Revenue: product.revenue?.toFixed(2) || '0.00'
      }));
      analyticsService.exportToCSV(exportData, 'product_performance');
      toast.success('Product performance exported successfully');
    } catch (error) {
      toast.error('Failed to export product performance');
    }
  };

  const formatDateLabel = (dateId) => {
    if (dateId.year && dateId.month && dateId.day && dateId.hour !== undefined) {
      return `${dateId.month}/${dateId.day}/${dateId.year} ${dateId.hour}:00`;
    } else if (dateId.year && dateId.month && dateId.day) {
      return `${dateId.month}/${dateId.day}/${dateId.year}`;
    } else if (dateId.year && dateId.week) {
      return `Week ${dateId.week}, ${dateId.year}`;
    } else if (dateId.year && dateId.month) {
      return `${dateId.month}/${dateId.year}`;
    }
    return 'Unknown';
  };

  const chartSalesData = formatSalesDataForChart();
  const chartProductData = formatProductData();

  const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Sales Reports</h1>
        <p className="text-gray-600 mt-1">Analyze your sales performance</p>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FiCalendar className="inline mr-1" />
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="all">All Time</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {dateRange === 'custom' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Group By</label>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="hour">Hour</option>
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category Type</label>
            <select
              value={categoryType}
              onChange={(e) => setCategoryType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">All (Food & Drinks)</option>
              <option value="drink">☕ Drinks Only</option>
              <option value="food">🍴 Food Only</option>
            </select>
          </div>

          <div className="ml-auto">
            <button
              onClick={handleExportSales}
              className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg flex items-center gap-2 transition"
            >
              <FiDownload />
              Export Sales
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-800">₱{summary.totalRevenue?.toFixed(2) || '0.00'}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <FiDollarSign className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Orders</p>
              <p className="text-2xl font-bold text-gray-800">{summary.totalOrders || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FiShoppingCart className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Average Order Value</p>
              <p className="text-2xl font-bold text-gray-800">₱{summary.averageOrderValue?.toFixed(2) || '0.00'}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <FiTrendingUp className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-8">
        {/* Sales Trend Chart */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Sales Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartSalesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" name="Revenue (₱)" strokeWidth={2} />
              <Line type="monotone" dataKey="orders" stroke="#3b82f6" name="Orders" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">Top Selling Products</h2>
          <button
            onClick={handleExportProducts}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-2 transition text-sm"
          >
            <FiDownload />
            Export Products
          </button>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartProductData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="revenue" fill="#8b5cf6" name="Revenue (₱)" />
            <Bar dataKey="quantity" fill="#3b82f6" name="Quantity Sold" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesReportsPage;
