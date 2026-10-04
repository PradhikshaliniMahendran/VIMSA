import axios from 'axios';
import { logout, setCredentials } from '../store/slices/authSlice.ts';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5006/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add a request interceptor to inject JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('vimsa_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let failedRequestsQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedRequestsQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedRequestsQueue = [];
};

export const setupInterceptors = (store: any) => {
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Avoid infinite loop if the refresh token endpoint itself returns 401
      if (originalRequest.url.includes('/auth/refresh-token')) {
        store.dispatch(logout());
        return Promise.reject(error);
      }

      const isAuthRoute = originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/register');

      if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry && !isAuthRoute) {
        const refreshToken = localStorage.getItem('vimsa_refresh_token');
        
        // If there's no stored refresh token, the user is a guest, so do not try to refresh
        if (!refreshToken) {
          store.dispatch(logout());
          return Promise.reject(error);
        }

        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedRequestsQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return api(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const response = await axios.post(
            `${api.defaults.baseURL}/auth/refresh-token`,
            { refreshToken },
            { withCredentials: true }
          );

          const { success, data } = response.data;
          if (success && data.accessToken) {
            const newToken = data.accessToken;
            const user = data.user || JSON.parse(localStorage.getItem('vimsa_user') || 'null');
            
            store.dispatch(setCredentials({ user, token: newToken }));
            
            processQueue(null, newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          } else {
            store.dispatch(logout());
            processQueue(new Error('Failed to refresh token'), null);
            return Promise.reject(error);
          }
        } catch (refreshError) {
          store.dispatch(logout());
          processQueue(refreshError, null);
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );
};

export default api;
