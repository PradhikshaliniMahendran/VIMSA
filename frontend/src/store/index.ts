import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.ts';
import cartReducer from './slices/cartSlice.ts';
import wishlistReducer from './slices/wishlistSlice.ts';
import uiReducer from './slices/uiSlice.ts';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
