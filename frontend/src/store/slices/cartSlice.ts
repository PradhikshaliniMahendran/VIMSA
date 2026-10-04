import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  id: string;
  name: string;
  sku: string;
  price: number;
  salePrice: number | null;
  image: string;
  quantity: number;
  size: string;
  color: string;
  stockQuantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean; // Controls whether Cart Drawer is open or closed
}

const sanitizeCartItem = (item: any): CartItem => ({
  ...item,
  size: typeof item.size === 'object' && item.size !== null ? (item.size.name || '') : String(item.size || ''),
  color: typeof item.color === 'object' && item.color !== null ? (item.color.name || item.color.hex || '') : String(item.color || ''),
});

const safeParseJSON = (key: string, fallback: any = []) => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    const parsed = JSON.parse(item);
    return Array.isArray(parsed) ? parsed.map(sanitizeCartItem) : fallback;
  } catch (error) {
    console.error(`Error parsing localStorage key "${key}":`, error);
    return fallback;
  }
};

const initialState: CartState = {
  items: safeParseJSON('vimsa_cart', []),
  isOpen: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    toggleCartDrawer: (state) => {
      state.isOpen = !state.isOpen;
    },
    setCartOpen: (state, action: PayloadAction<boolean>) => {
      state.isOpen = action.payload;
    },
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const newItem = sanitizeCartItem(action.payload);
      const existingItemIndex = state.items.findIndex(
        (item) =>
          item.id === newItem.id &&
          item.size === newItem.size &&
          item.color === newItem.color
      );

      if (existingItemIndex > -1) {
        // Increment quantity within stock limit
        const currentQty = state.items[existingItemIndex].quantity;
        const targetQty = currentQty + newItem.quantity;
        state.items[existingItemIndex].quantity = Math.min(targetQty, newItem.stockQuantity);
      } else {
        state.items.push(newItem);
      }

      localStorage.setItem('vimsa_cart', JSON.stringify(state.items));
      state.isOpen = true; // Auto open cart drawer when product is added
    },
    removeFromCart: (
      state,
      action: PayloadAction<{ id: string; size: string; color: string }>
    ) => {
      const { id, size, color } = action.payload;
      state.items = state.items.filter(
        (item) => !(item.id === id && item.size === size && item.color === color)
      );
      localStorage.setItem('vimsa_cart', JSON.stringify(state.items));
    },
    updateCartQuantity: (
      state,
      action: PayloadAction<{ id: string; size: string; color: string; quantity: number }>
    ) => {
      const { id, size, color, quantity } = action.payload;
      const item = state.items.find(
        (item) => item.id === id && item.size === size && item.color === color
      );
      if (item) {
        item.quantity = Math.max(1, Math.min(quantity, item.stockQuantity));
      }
      localStorage.setItem('vimsa_cart', JSON.stringify(state.items));
    },
    clearCart: (state) => {
      state.items = [];
      localStorage.removeItem('vimsa_cart');
    },
    replaceCart: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload.map(sanitizeCartItem);
      localStorage.setItem('vimsa_cart', JSON.stringify(state.items));
    }
  },
});

export const {
  toggleCartDrawer,
  setCartOpen,
  addToCart,
  removeFromCart,
  updateCartQuantity,
  clearCart,
  replaceCart,
} = cartSlice.actions;

export default cartSlice.reducer;
