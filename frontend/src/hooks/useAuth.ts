import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/index.ts';
import {
  setCredentials,
  updateUser,
  logout as logoutAction,
  setLoading,
  User,
} from '../store/slices/authSlice.ts';
import { authService } from '../services/authService.ts';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, isAuthenticated, loading } = useSelector(
    (state: RootState) => state.auth
  );

  const login = async (credentials: any) => {
    dispatch(setLoading(true));
    try {
      const response = await authService.login(credentials);
      if (response.success && response.data) {
        dispatch(
          setCredentials({
            user: response.data.user,
            token: response.data.accessToken,
            refreshToken: response.data.refreshToken,
          })
        );
      }
      return response;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const register = async (userData: any) => {
    dispatch(setLoading(true));
    try {
      const response = await authService.register(userData);
      // New flow: registration returns needsVerification, no tokens
      // Tokens are only issued after OTP verification
      if (response.success && response.data) {
        dispatch(
          setCredentials({
            user: response.data.user,
            token: response.data.accessToken,
            refreshToken: response.data.refreshToken,
          })
        );
      }
      return response;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const logout = async () => {
    dispatch(setLoading(true));
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error on backend:', err);
    } finally {
      dispatch(logoutAction());
      dispatch(setLoading(false));
    }
  };

  const refreshProfile = async () => {
    try {
      const response = await authService.getMe();
      if (response.success && response.data) {
        dispatch(updateUser(response.data.user));
      }
    } catch (err) {
      console.error('Failed to refresh user profile:', err);
    }
  };

  const isAdmin = user && ['admin', 'superadmin'].includes(user.role);
  const isSuperAdmin = user && user.role === 'superadmin';

  return {
    user,
    token,
    isAuthenticated,
    loading,
    isAdmin,
    isSuperAdmin,
    login,
    register,
    logout,
    refreshProfile,
  };
};
