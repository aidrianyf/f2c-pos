import api from './api';

export const orderService = {
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  getAllOrders: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/orders?${params}`);
    return response.data;
  },

  getOrderById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  updateOrderStatus: async (id, status) => {
    const response = await api.put(`/orders/${id}/status`, { status });
    return response.data;
  },

  getUnpaidOrders: async () => {
    const response = await api.get('/orders/unpaid');
    return response.data;
  },

  markOrderAsPaid: async (id, paymentData) => {
    const response = await api.patch(`/orders/${id}/mark-paid`, paymentData);
    return response.data;
  },

  deleteOrder: async (id) => {
    const response = await api.delete(`/orders/${id}`);
    return response.data;
  },

  bulkDeleteOrders: async (orderIds) => {
    const response = await api.post('/orders/bulk-delete', { orderIds });
    return response.data;
  },
};
