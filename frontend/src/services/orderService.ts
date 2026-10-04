import api from './api.ts';

export const orderService = {
  async createOrder(orderData: any) {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  async getMyOrders(page = 1, limit = 10) {
    const response = await api.get('/orders/my', { params: { page, limit } });
    return response.data;
  },

  async getOrderById(id: string) {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  async cancelOrder(id: string, reason: string) {
    const response = await api.patch(`/orders/${id}/cancel`, { reason });
    return response.data;
  },

  async editOrder(id: string, updates: any) {
    const response = await api.put(`/orders/${id}`, updates);
    return response.data;
  },

  getInvoiceUrl(id: string) {
    const token = localStorage.getItem('vimsa_token');
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
    return `${baseUrl}/orders/${id}/invoice?token=${token}`;
  },

  // Admin order methods
  async adminGetAllOrders(filters: any = {}) {
    const response = await api.get('/orders/admin/all', { params: filters });
    return response.data;
  },

  async adminUpdateOrderStatus(id: string, updates: any) {
    const response = await api.patch(`/orders/admin/${id}/status`, updates);
    return response.data;
  },
};
