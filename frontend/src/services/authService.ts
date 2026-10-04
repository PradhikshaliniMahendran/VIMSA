import api from './api.ts';

export const authService = {
  async register(userData: any) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  async registerWithFirebase(payload: any) {
    const response = await api.post('/auth/register-with-firebase', payload);
    return response.data;
  },

  async validateEmail(email: string) {
    const response = await api.post('/auth/validate-email', { email });
    return response.data;
  },

  async login(credentials: any) {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  async logout() {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  async verifyOTP(payload: { email: string; otp: string }) {
    const response = await api.post('/auth/verify-otp', payload);
    return response.data;
  },

  async resendOTP(email: string) {
    const response = await api.post('/auth/resend-otp', { email });
    return response.data;
  },

  async forgotPassword(email: string) {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  async resetPassword(payload: any) {
    const response = await api.post('/auth/reset-password', payload);
    return response.data;
  },

  async getMe() {
    const response = await api.get('/auth/me');
    return response.data;
  },
};
