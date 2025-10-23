import { useState, useEffect } from 'react';
import { FiAlertTriangle, FiPackage } from 'react-icons/fi';
import api from '../../services/api';

const LowStockAlert = () => {
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLowStockProducts();
  }, []);

  const loadLowStockProducts = async () => {
    try {
      const response = await api.get('/products/low-stock/all');
      if (response.data.success) {
        setLowStockProducts(response.data.products);
      }
    } catch (error) {
      console.error('Failed to load low stock products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      <div className="p-4 border-b bg-yellow-50 flex items-center">
        <FiAlertTriangle className="text-yellow-600 mr-2" size={20} />
        <h3 className="font-bold text-gray-800">Low Stock Alerts</h3>
        {lowStockProducts.length > 0 && (
          <span className="ml-auto bg-yellow-600 text-white px-2 py-1 rounded-full text-xs font-medium">
            {lowStockProducts.length}
          </span>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto">
        {lowStockProducts.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <FiPackage className="mx-auto mb-2" size={32} />
            <p>All products have sufficient stock</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {lowStockProducts.map((product) => (
              <div key={product._id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.category?.name}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className={`font-semibold ${
                      product.stockQuantity === 0
                        ? 'text-red-600'
                        : product.stockQuantity <= 5
                        ? 'text-orange-600'
                        : 'text-yellow-600'
                    }`}>
                      {product.stockQuantity} left
                    </p>
                    <p className="text-xs text-gray-500">
                      Threshold: {product.lowStockThreshold}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LowStockAlert;
