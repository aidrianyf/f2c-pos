import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';

const ProductModal = ({ product, categories, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    basePrice: '',
    description: '',
    isAvailable: true,
    hasTemperatureVariants: false,
    temperatures: {
      hot: false,
      iced: false
    }
  });

  useEffect(() => {
    if (product) {
      // Get basePrice from first variant if exists
      const basePrice = product.basePrice || product.variants?.[0]?.price || '';

      // Check if product has temperature variants
      const hasVariants = product.variants && product.variants.length > 0;
      const hasHot = hasVariants && product.variants.some(v => v.temperature?.toLowerCase() === 'hot');
      const hasIced = hasVariants && product.variants.some(v => v.temperature?.toLowerCase() === 'iced');

      setFormData({
        name: product.name || '',
        category: product.category?._id || '',
        basePrice: basePrice,
        description: product.description || '',
        isAvailable: product.isAvailable !== false,
        hasTemperatureVariants: hasVariants,
        temperatures: {
          hot: hasHot,
          iced: hasIced
        }
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTemperatureChange = (tempType) => {
    setFormData(prev => ({
      ...prev,
      temperatures: {
        ...prev.temperatures,
        [tempType]: !prev.temperatures[tempType]
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const dataToSave = { ...formData };
    const basePrice = parseFloat(formData.basePrice) || 0;

    // Check if any temperature is selected
    const hasHot = formData.temperatures.hot;
    const hasIced = formData.temperatures.iced;
    const hasAnyTemperature = hasHot || hasIced;

    if (hasAnyTemperature) {
      // Create variants based on selected temperatures
      const variants = [];

      if (hasHot) {
        variants.push({
          size: '12oz',
          temperature: 'hot',
          price: basePrice
        });
      }

      if (hasIced) {
        variants.push({
          size: '12oz',
          temperature: 'iced',
          price: basePrice
        });
      }

      dataToSave.variants = variants;
      dataToSave.basePrice = basePrice; // Keep basePrice for compatibility
    } else {
      // No temperature selected - use basePrice only
      dataToSave.basePrice = basePrice;
      dataToSave.variants = []; // Clear variants if no temperature selected
    }

    // Clean up temporary fields
    delete dataToSave.hasTemperatureVariants;
    delete dataToSave.temperatures;

    console.log('Submitting product data:', dataToSave);
    onSave(dataToSave);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-800">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g., Iced Caramel Latte"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Base Price (₱) *
            </label>
            <input
              type="number"
              name="basePrice"
              value={formData.basePrice}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              placeholder="0.00"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              placeholder="Optional product description"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Temperature Variants - Optional */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Temperature Options (Optional)
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Select if this product is available in Hot or Iced variants. Leave unchecked for items without temperature options.
            </p>
            <div className="flex space-x-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="hotTemp"
                  checked={formData.temperatures.hot}
                  onChange={() => handleTemperatureChange('hot')}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <label htmlFor="hotTemp" className="ml-2 text-sm font-medium text-gray-700 flex items-center">
                  <span className="mr-1">🔥</span> Hot
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="icedTemp"
                  checked={formData.temperatures.iced}
                  onChange={() => handleTemperatureChange('iced')}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="icedTemp" className="ml-2 text-sm font-medium text-gray-700 flex items-center">
                  <span className="mr-1">❄️</span> Iced
                </label>
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="isAvailable"
              id="isAvailable"
              checked={formData.isAvailable}
              onChange={handleChange}
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <label htmlFor="isAvailable" className="ml-2 text-sm font-medium text-gray-700">
              Available for sale
            </label>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-lg transition"
            >
              {product ? 'Update Product' : 'Add Product'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
