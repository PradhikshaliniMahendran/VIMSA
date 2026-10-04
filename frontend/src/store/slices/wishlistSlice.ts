import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WishlistState {
  productIds: string[];
}

const safeParseJSON = (key: string, fallback: any = []) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (error) {
    console.error(`Error parsing localStorage key "${key}":`, error);
    return fallback;
  }
};

const initialState: WishlistState = {
  productIds: safeParseJSON('vimsa_wishlist', []),
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    toggleWishlist: (state, action: PayloadAction<string>) => {
      const productId = action.payload;
      const index = state.productIds.indexOf(productId);
      if (index > -1) {
        state.productIds.splice(index, 1);
      } else {
        state.productIds.push(productId);
      }
      localStorage.setItem('vimsa_wishlist', JSON.stringify(state.productIds));
    },
    setWishlist: (state, action: PayloadAction<string[]>) => {
      state.productIds = action.payload;
      localStorage.setItem('vimsa_wishlist', JSON.stringify(state.productIds));
    },
    removeFromWishlist: (state, action: PayloadAction<string>) => {
      state.productIds = state.productIds.filter(id => id !== action.payload);
      localStorage.setItem('vimsa_wishlist', JSON.stringify(state.productIds));
    },
  },
});

export const { toggleWishlist, setWishlist, removeFromWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
