import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  role: 'guest' | 'customer' | 'admin' | 'superadmin';
  loyaltyPoints: number;
  isVerified: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const safeParseJSON = (key: string, fallback: any = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (error) {
    console.error(`Error parsing localStorage key "${key}":`, error);
    return fallback;
  }
};

const initialState: AuthState = {
  user: safeParseJSON('vimsa_user', null),
  token: localStorage.getItem('vimsa_token'),
  isAuthenticated: !!localStorage.getItem('vimsa_token'),
  loading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string; refreshToken?: string }>
    ) => {
      const { user, token, refreshToken } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      localStorage.setItem('vimsa_token', token);
      if (refreshToken) {
        localStorage.setItem('vimsa_refresh_token', refreshToken);
      }
      localStorage.setItem('vimsa_user', JSON.stringify(user));
    },
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      localStorage.setItem('vimsa_user', JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('vimsa_token');
      localStorage.removeItem('vimsa_refresh_token');
      localStorage.removeItem('vimsa_user');
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setCredentials, updateUser, logout, setLoading } = authSlice.actions;
export default authSlice.reducer;
export type { User, AuthState };
