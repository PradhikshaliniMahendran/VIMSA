import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/index.ts';
import {
  CartItem,
  addToCart,
  removeFromCart,
  updateCartQuantity,
  clearCart,
  toggleCartDrawer,
  setCartOpen,
} from '../store/slices/cartSlice.ts';

export const useCart = () => {
  const dispatch = useDispatch();
  const { items, isOpen } = useSelector((state: RootState) => state.cart);
  const { currency, currencyRate } = useSelector((state: RootState) => state.ui);

  const cartItemsCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const subtotal = items.reduce((acc, item) => {
    const activePrice = item.salePrice || item.price;
    return acc + activePrice * item.quantity;
  }, 0);

  // Formatter for prices depending on active currency (LKR / USD)
  const formatPrice = (priceInLKR: number): string => {
    if (currency === 'USD') {
      const priceInUSD = priceInLKR / currencyRate;
      return `$${priceInUSD.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
    return `Rs. ${priceInLKR.toLocaleString()}`;
  };

  const convertPrice = (priceInLKR: number): number => {
    if (currency === 'USD') {
      return Number((priceInLKR / currencyRate).toFixed(2));
    }
    return priceInLKR;
  };

  const addItem = (item: CartItem) => {
    dispatch(addToCart(item));
  };

  const removeItem = (id: string, size: string, color: string) => {
    dispatch(removeFromCart({ id, size, color }));
  };

  const updateQty = (id: string, size: string, color: string, quantity: number) => {
    dispatch(updateCartQuantity({ id, size, color, quantity }));
  };

  const clear = () => {
    dispatch(clearCart());
  };

  const toggle = () => {
    dispatch(toggleCartDrawer());
  };

  const setOpen = (open: boolean) => {
    dispatch(setCartOpen(open));
  };

  return {
    items,
    isOpen,
    cartItemsCount,
    subtotal,
    formatPrice,
    convertPrice,
    currency,
    addItem,
    removeItem,
    updateQty,
    clear,
    toggle,
    setOpen,
    dispatch,
  };
};
