import { useState, useEffect } from 'react';
import { FiDollarSign, FiShoppingCart, FiTrendingUp, FiPackage } from 'react-icons/fi';
import StatCard from '../../components/admin/StatCard';
import LowStockAlert from '../../components/admin/LowStockAlert';
import { orderService } from '../../services/orderService';
import { analyticsService } from '../../services/analyticsService';
import { toast } from 'react-toastify';

const DashboardOverview = () => {
  const [stats, setStats] = useState({
    today: {
      revenue: 0,
      orders: 0,
      expenses: 0,
      profit: 0,
      drinkRevenue: 0,
      foodRevenue: 0
    },
    month: {
      revenue: 0,
      orders: 0,
      expenses: 0,
      profit: 0,
      drinkRevenue: 0,
      foodRevenue: 0
    }
  });
  const [bestSellers, setBestSellers] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load analytics stats and recent orders in parallel
      const [dashboardStats, ordersData] = await Promise.all([
        analyticsService.getDashboardStats(),
        orderService.getAllOrders()
      ]);

      if (dashboardStats.success) {
        setStats(dashboardStats.stats);
        setBestSellers(dashboardStats.stats.bestSellers || []);
      }

      if (ordersData.success) {
        setRecentOrders(ordersData.orders.slice(0, 5));
      }
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error('Dashboard error:', error);
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

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Today's Revenue"
          value={`₱${stats.today.revenue?.toFixed(2) || '0.00'}`}
          icon={FiDollarSign}
          color="green"
        />
        <StatCard
          title="Today's Orders"
          value={stats.today.orders || 0}
          icon={FiShoppingCart}
          color="blue"
        />
        <StatCard
          title="Today's Profit"
          value={`₱${stats.today.profit?.toFixed(2) || '0.00'}`}
          icon={FiTrendingUp}
          color="primary"
        />
        <StatCard
          title="Today's Expenses"
          value={`₱${stats.today.expenses?.toFixed(2) || '0.00'}`}
          icon={FiPackage}
          color="orange"
        />
      </div>

      {/* Food vs Drink Revenue - Today */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Today's Revenue Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-700 mb-1">Drinks Revenue</p>
                <p className="text-3xl font-bold text-amber-900">₱{stats.today.drinkRevenue?.toFixed(2) || '0.00'}</p>
              </div>
              <div className="text-4xl">☕</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 mb-1">Food Revenue</p>
                <p className="text-3xl font-bold text-green-900">₱{stats.today.foodRevenue?.toFixed(2) || '0.00'}</p>
              </div>
              <div className="text-4xl">🍴</div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Month's Revenue"
          value={`₱${stats.month.revenue?.toFixed(2) || '0.00'}`}
          icon={FiDollarSign}
          color="green"
        />
        <StatCard
          title="Month's Orders"
          value={stats.month.orders || 0}
          icon={FiShoppingCart}
          color="blue"
        />
        <StatCard
          title="Month's Profit"
          value={`₱${stats.month.profit?.toFixed(2) || '0.00'}`}
          icon={FiTrendingUp}
          color="primary"
        />
        <StatCard
          title="Month's Expenses"
          value={`₱${stats.month.expenses?.toFixed(2) || '0.00'}`}
          icon={FiPackage}
          color="orange"
        />
      </div>

      {/* Food vs Drink Revenue - Month */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">This Month's Revenue Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-700 mb-1">Drinks Revenue</p>
                <p className="text-3xl font-bold text-amber-900">₱{stats.month.drinkRevenue?.toFixed(2) || '0.00'}</p>
              </div>
              <div className="text-4xl">☕</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 mb-1">Food Revenue</p>
                <p className="text-3xl font-bold text-green-900">₱{stats.month.foodRevenue?.toFixed(2) || '0.00'}</p>
              </div>
              <div className="text-4xl">🍴</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Best Sellers */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-800">Top Selling Products</h2>
          </div>
          <div className="p-6">
            {bestSellers.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No sales data yet</p>
            ) : (
              <div className="space-y-4">
                {bestSellers.map((product, index) => (
                  <div key={product._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-gray-300'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.category?.name || 'Uncategorized'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">{product.salesCount} sold</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div>
          <LowStockAlert />
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No orders yet
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">{order.orderNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{order.items.length} items</td>
                    <td className="px-6 py-4 text-sm font-semibold text-primary">₱{order.total.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 capitalize">{order.paymentMethod}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'completed' ? 'bg-green-100 text-green-600' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-red-100 text-red-600'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
