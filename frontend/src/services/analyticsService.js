import api from './api';

const API_URL = '/analytics';

// Get dashboard statistics (today and month)
export const getDashboardStats = async () => {
  try {
    const response = await api.get(`${API_URL}/dashboard`);
    return response.data;
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    throw error.response?.data || error;
  }
};

// Get sales report with optional date range and grouping
export const getSalesReport = async (params = {}) => {
  try {
    const response = await api.get(`${API_URL}/sales`, { params });
    return response.data;
  } catch (error) {
    console.error('Get sales report error:', error);
    throw error.response?.data || error;
  }
};

// Get cashier performance report
export const getCashierPerformance = async (params = {}) => {
  try {
    const response = await api.get(`${API_URL}/cashiers`, { params });
    return response.data;
  } catch (error) {
    console.error('Get cashier performance error:', error);
    throw error.response?.data || error;
  }
};

// Get product performance report
export const getProductPerformance = async (params = {}) => {
  try {
    const response = await api.get(`${API_URL}/products`, { params });
    return response.data;
  } catch (error) {
    console.error('Get product performance error:', error);
    throw error.response?.data || error;
  }
};

// Get profit analysis
export const getProfitAnalysis = async (params = {}) => {
  try {
    const response = await api.get(`${API_URL}/profit`, { params });
    return response.data;
  } catch (error) {
    console.error('Get profit analysis error:', error);
    throw error.response?.data || error;
  }
};

// Export to CSV helper
export const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);

  // Create CSV content
  const csvContent = [
    headers.join(','), // Header row
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        // Escape values containing commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const analyticsService = {
  getDashboardStats,
  getSalesReport,
  getCashierPerformance,
  getProductPerformance,
  getProfitAnalysis,
  exportToCSV
};

export default analyticsService;
