import api from './api.ts';

export interface GlobalSettings {
  storeName?: string;
  whatsappNumber?: string;
  contactNumber?: string;
  email?: string;
  address?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  shippingFee: number;
  freeShippingThreshold: number;
  flashSaleActive: boolean;
  flashSaleEndDate: string;
  flashSaleTitle: string;
  flashSaleDiscountText: string;
}

export const settingsService = {
  getSettings: async () => {
    const response = await api.get('/settings');
    return response.data;
  },

  updateSettings: async (settingsData: Partial<GlobalSettings>) => {
    const response = await api.put('/settings', settingsData);
    return response.data;
  }
};
