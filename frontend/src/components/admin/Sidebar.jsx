import { NavLink } from 'react-router-dom';
import { FiHome, FiDollarSign, FiBarChart2, FiShoppingBag, FiGrid, FiPackage, FiUsers, FiLogOut, FiCreditCard } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { logout, user } = useAuth();

  const navItems = [
    { path: '/admin', icon: FiHome, label: 'Dashboard', exact: true },
    { path: '/admin/orders', icon: FiPackage, label: 'Orders' },
    { path: '/admin/unpaid-orders', icon: FiCreditCard, label: 'Unpaid Orders' },
    { path: '/admin/finance', icon: FiDollarSign, label: 'Finance' },
    { path: '/admin/sales-reports', icon: FiBarChart2, label: 'Sales Reports' },
    { path: '/admin/products', icon: FiShoppingBag, label: 'Products' },
    { path: '/admin/categories', icon: FiGrid, label: 'Categories' },
    { path: '/admin/users', icon: FiUsers, label: 'Users' },
  ];

  return (
    <div className="w-64 bg-white border-r flex flex-col h-screen">
      <div className="p-6 border-b">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <span className="text-white font-bold">F2C</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">Farm to Cup</h2>
            <p className="text-xs text-gray-500">Admin Panel</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                isActive
                  ? 'bg-primary text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t">
        <div className="mb-3 px-4 py-2 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-800">{user?.firstName} {user?.lastName}</p>
          <p className="text-xs text-gray-500">{user?.email}</p>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition"
        >
          <FiLogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
