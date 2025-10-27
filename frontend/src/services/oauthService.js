import api from './api';

// Get all pending users (Admin only)
export const getPendingUsers = async () => {
  try {
    const response = await api.get('/auth/pending-users');
    return response.data;
  } catch (error) {
    console.error('Error fetching pending users:', error);
    throw error.response?.data || error;
  }
};

// Approve user and assign role (Admin only)
export const approveUser = async (userId, role) => {
  try {
    const response = await api.put(`/auth/approve-user/${userId}`, { role });
    return response.data;
  } catch (error) {
    console.error('Error approving user:', error);
    throw error.response?.data || error;
  }
};

// Reject pending user (Admin only)
export const rejectUser = async (userId) => {
  try {
    const response = await api.delete(`/auth/reject-user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error rejecting user:', error);
    throw error.response?.data || error;
  }
};
