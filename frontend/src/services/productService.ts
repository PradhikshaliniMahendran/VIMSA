import api from './api.ts';

export interface ProductFilters {
  category?: string;
  brand?: string;
  collectionRef?: string;
  color?: string;
  size?: string;
  minPrice?: number;
  maxPrice?: number;
  isFeatured?: boolean | string;
  isTrending?: boolean | string;
  isBestSeller?: boolean | string;
  isNewArrival?: boolean | string;
  status?: string;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
  productType?: string;
}

export const productService = {
  async getProducts(filters: ProductFilters = {}) {
    const response = await api.get('/products', { params: filters });
    return response.data;
  },

  async getAdminProducts(filters: ProductFilters = {}) {
    const response = await api.get('/products/admin/all', { params: filters });
    return response.data;
  },

  async getProductBySlug(slug: string) {
    const response = await api.get(`/products/${slug}`);
    return response.data;
  },

  async getFeatured(productType?: string) {
    const response = await api.get('/products/featured', { params: productType ? { productType } : {} });
    return response.data;
  },

  async getTrending(productType?: string) {
    const response = await api.get('/products/trending', { params: productType ? { productType } : {} });
    return response.data;
  },

  async getBestSellers(productType?: string) {
    const response = await api.get('/products/best-sellers', { params: productType ? { productType } : {} });
    return response.data;
  },

  async getNewArrivals(productType?: string) {
    const response = await api.get('/products/new-arrivals', { params: productType ? { productType } : {} });
    return response.data;
  },

  async getFlashSale() {
    const response = await api.get('/products/flash-sale');
    return response.data;
  },
};
