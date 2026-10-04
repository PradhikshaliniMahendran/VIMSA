import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from '../../hooks/useCart.ts';
import { formatColorName } from '../../utils/colorHelper.ts';

const CartDrawer: React.FC = () => {
  const navigate = useNavigate();
  const {
    items,
    isOpen,
    subtotal,
    formatPrice,
    removeItem,
    updateQty,
    setOpen,
  } = useCart();

  // Prevent scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleCheckout = () => {
    setOpen(false);
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Blur Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Sliding Panel */}
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ translateX: '100%' }}
              animate={{ translateX: 0 }}
              exit={{ translateX: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="w-screen max-w-md bg-white dark:bg-dark-surface flex flex-col shadow-2xl border-l border-gray-100 dark:border-dark-border"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-gray-100 dark:border-dark-border flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <ShoppingBag className="w-5 h-5 text-accent" />
                  <h2 className="font-outfit uppercase tracking-widest font-bold text-sm text-text-primary dark:text-white">
                    Your Cart ({items.reduce((sum, item) => sum + item.quantity, 0)})
                  </h2>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="text-text-primary dark:text-white hover:text-accent transition-colors duration-200"
                  aria-label="Close cart"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-grow overflow-y-auto px-6 py-4 scrollbar-thin">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col justify-center items-center text-center">
                    <ShoppingBag className="w-16 h-16 text-neutral-300 dark:text-neutral-700 mb-4 stroke-1" />
                    <p className="font-outfit uppercase tracking-wider text-sm font-semibold text-text-primary dark:text-white mb-2">
                      Your Cart is Empty
                    </p>
                    <p className="text-xs text-text-secondary dark:text-gray-400 max-w-xs mb-6">
                      Discover premium streetwear products and elevate your clothing style today.
                    </p>
                    <button
                      onClick={() => setOpen(false)}
                      className="bg-black text-white px-6 py-3 font-outfit uppercase font-semibold text-xs tracking-widest hover:bg-accent hover:text-black transition-colors"
                    >
                      Continue Shopping
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map((item) => {
                      const activePrice = item.salePrice !== null ? item.salePrice : item.price;
                      return (
                        <div
                          key={`${item.id}-${item.size}-${item.color}`}
                          className="flex py-4 border-b border-gray-100 dark:border-dark-border"
                        >
                          {/* Item Thumbnail */}
                          <div className="flex-shrink-0 w-20 aspect-[3/4] bg-neutral-100 dark:bg-neutral-900 overflow-hidden border border-gray-100 dark:border-dark-border">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-neutral-800">
                                <span className="text-[8px] text-white/50">VIMSA</span>
                              </div>
                            )}
                          </div>

                          {/* Item Info details */}
                          <div className="ml-4 flex-grow flex flex-col">
                            <div>
                              <div className="flex justify-between items-start">
                                <h3 className="font-outfit uppercase font-semibold text-xs tracking-wide text-text-primary dark:text-white pr-2 line-clamp-1">
                                  {item.name}
                                </h3>
                                <button
                                  onClick={() => removeItem(item.id, item.size, item.color)}
                                  className="text-text-secondary dark:text-gray-500 hover:text-error transition-colors"
                                  aria-label="Remove item"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                              <p className="text-[10px] text-text-secondary dark:text-gray-400 font-semibold uppercase tracking-wider mt-1.5">
                                {typeof item.size === 'string' || typeof item.size === 'number' ? `Size: ${item.size}` : (item.size && (item.size as any).name ? `Size: ${(item.size as any).name}` : '')} {item.color ? `| Color: ${formatColorName(typeof item.color === 'string' ? item.color : (item.color as any).name || (item.color as any).hex || '')}` : ''}
                              </p>
                            </div>

                            <div className="mt-auto flex justify-between items-center pt-2">
                              {/* Quantity Adjustment Selector */}
                              <div className="flex items-center border border-gray-200 dark:border-dark-border">
                                <button
                                  onClick={() => updateQty(item.id, item.size, item.color, item.quantity - 1)}
                                  className="p-1 px-2 text-text-secondary hover:bg-neutral-100 dark:hover:bg-neutral-800 dark:text-white"
                                  aria-label="Decrease quantity"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="px-2 text-xs font-semibold text-text-primary dark:text-white">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQty(item.id, item.size, item.color, item.quantity + 1)}
                                  className="p-1 px-2 text-text-secondary hover:bg-neutral-100 dark:hover:bg-neutral-800 dark:text-white"
                                  aria-label="Increase quantity"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                              {/* Price */}
                              <span className="font-outfit font-bold text-xs text-text-primary dark:text-white">
                                {formatPrice(activePrice * item.quantity)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Checkout Footers info summary */}
              {items.length > 0 && (
                <div className="px-6 py-6 border-t border-gray-100 dark:border-dark-border bg-neutral-50 dark:bg-dark-surface/40">
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="font-outfit uppercase tracking-widest text-xs text-text-secondary dark:text-gray-400 font-bold">
                      Subtotal
                    </span>
                    <span className="font-outfit font-extrabold text-lg text-text-primary dark:text-white">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                  <p className="text-[10px] text-text-secondary dark:text-gray-400 mb-6 leading-relaxed">
                    Shipping costs and coupon code discounts are computed during the checkout process.
                  </p>
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-black text-white dark:bg-white dark:text-black py-4 font-outfit uppercase font-semibold text-xs tracking-widest hover:bg-accent dark:hover:bg-accent hover:text-black dark:hover:text-black transition-colors duration-300"
                  >
                    Proceed to Checkout
                  </button>
                  <button
                    onClick={() => setOpen(false)}
                    className="w-full text-center mt-3 text-text-secondary dark:text-gray-400 hover:text-black dark:hover:text-white font-outfit uppercase tracking-widest text-[10px] font-bold transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
