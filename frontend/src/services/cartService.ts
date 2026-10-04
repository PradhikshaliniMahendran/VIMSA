import api from './api.ts';

export const cartService = {
  async getCart() {
    const response = await api.get('/cart');
    return response.data;
  },

  async addToCart(productId: string, quantity: number, size: string, color: string) {
    const response = await api.post('/cart', { productId, quantity, size, color });
    return response.data;
  },

  async updateCartItem(productId: string, quantity: number, size: string, color: string) {
    const response = await api.put('/cart', { productId, quantity, size, color });
    return response.data;
  },

  async removeFromCart(productId: string, size: string, color: string) {
    const response = await api.delete('/cart', { data: { productId, size, color } });
    return response.data;
  },

  async clearCart() {
    const response = await api.delete('/cart/clear');
    return response.data;
  },
};
