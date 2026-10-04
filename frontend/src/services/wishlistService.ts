import api from './api.ts';

export const wishlistService = {
  async getWishlist() {
    const response = await api.get('/wishlist');
    return response.data;
  },

  async addToWishlist(productId: string) {
    const response = await api.post('/wishlist', { productId });
    return response.data;
  },

  async removeFromWishlist(productId: string) {
    const response = await api.delete(`/wishlist/${productId}`);
    return response.data;
  },
};
