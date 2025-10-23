import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { categoryService } from '../../services/categoryService';
import { toast } from 'react-toastify';
import CategoryModal from '../../components/admin/CategoryModal';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAllCategories();
      if (data.success) setCategories(data.categories);
    } catch (error) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setShowModal(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setShowModal(true);
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    try {
      await categoryService.deleteCategory(id);
      toast.success('Category deleted successfully');
      loadCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete category');
    }
  };

  const handleSaveCategory = async (categoryData) => {
    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory._id, categoryData);
        toast.success('Category updated successfully');
      } else {
        await categoryService.createCategory(categoryData);
        toast.success('Category added successfully');
      }
      setShowModal(false);
      loadCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save category');
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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Categories</h1>
          <p className="text-gray-600 mt-1">Manage product categories</p>
        </div>
        <button
          onClick={handleAddCategory}
          className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
        >
          <FiPlus size={20} />
          <span>Add Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div
            key={category._id}
            className="bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-lg transition"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{category.name}</h3>
                <p className="text-sm text-gray-600 mb-3">
                  {category.description || 'No description'}
                </p>
                <p className="text-xs text-gray-500">
                  {category.productCount || 0} products
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 pt-4 border-t">
              <button
                onClick={() => handleEditCategory(category)}
                className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded transition"
              >
                <FiEdit2 size={16} />
                <span className="text-sm">Edit</span>
              </button>
              <button
                onClick={() => handleDeleteCategory(category._id)}
                className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded transition"
              >
                <FiTrash2 size={16} />
                <span className="text-sm">Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow border border-gray-200">
          <p className="text-gray-500">No categories yet. Add your first category!</p>
        </div>
      )}

      {/* Category Modal */}
      {showModal && (
        <CategoryModal
          category={editingCategory}
          onSave={handleSaveCategory}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default CategoriesPage;
