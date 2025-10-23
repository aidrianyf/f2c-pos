import { Routes, Route } from 'react-router-dom';
import Sidebar from '../../components/admin/Sidebar';
import DashboardOverview from './DashboardOverview';
import FinancePage from './FinancePage';
import SalesReportsPage from './SalesReportsPage';
import ProductsPage from './ProductsPage';
import CategoriesPage from './CategoriesPage';
import OrdersPage from './OrdersPage';
import UsersPage from './UsersPage';
import UnpaidOrdersPage from './UnpaidOrdersPage';

const Dashboard = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route index element={<DashboardOverview />} />
          <Route path="finance" element={<FinancePage />} />
          <Route path="sales-reports" element={<SalesReportsPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="unpaid-orders" element={<UnpaidOrdersPage />} />
          <Route path="users" element={<UsersPage />} />
        </Routes>
      </div>
    </div>
  );
};

export default Dashboard;
