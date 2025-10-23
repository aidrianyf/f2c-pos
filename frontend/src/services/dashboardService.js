import api from './api';

export const dashboardService = {
  getStats: async (period = 'today') => {
    const response = await api.get(`/dashboard/stats?period=${period}`);
    return response.data;
  },

  getSalesChart: async (startDate, endDate) => {
    const response = await api.get(`/dashboard/sales-chart?start=${startDate}&end=${endDate}`);
    return response.data;
  },

  getTopProducts: async (limit = 10) => {
    const response = await api.get(`/dashboard/top-products?limit=${limit}`);
    return response.data;
  },
};
