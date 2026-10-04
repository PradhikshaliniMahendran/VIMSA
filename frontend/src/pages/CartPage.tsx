import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { useCart } from '../hooks/useCart.ts';
import { formatColorName } from '../utils/colorHelper.ts';
import Button from '../components/ui/Button.tsx';
import toast from 'react-hot-toast';

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    items,
    subtotal,
    formatPrice,
    updateQty,
    removeItem,
    clear,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0); // in currency amount

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    // Mimic coupon validation logic
    if (couponCode.toUpperCase() === 'VIMSA10') {
      const discAmt = subtotal * 0.1;
      setDiscount(discAmt);
      toast.success('10% VIP Coupon applied successfully!');
    } else {
      toast.error('Invalid or expired coupon code');
    }
  };

  const finalTotal = subtotal - discount;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" id="full-cart-page">
      {/* Title */}
      <div className="mb-12">
        <h1 className="font-outfit uppercase tracking-widest text-2xl md:text-3xl font-extrabold text-text-primary dark:text-white">
          Shopping Cart
        </h1>
        <p className="text-xs text-text-secondary dark:text-gray-400 mt-1 uppercase font-semibold font-outfit tracking-wide">
          Manage your selected premium clothing items
        </p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border p-10">
          <ShoppingBag className="w-16 h-16 text-neutral-300 dark:text-neutral-700 mx-auto mb-4 stroke-1" />
          <p className="font-outfit uppercase tracking-wider text-sm font-semibold text-text-primary dark:text-white mb-2">
            Your bag is waiting for something special.
          </p>
          <p className="text-xs text-text-secondary dark:text-gray-400 mb-8 max-w-xs mx-auto">
            Discover our luxury dresses and everyday home essentials.
          </p>
          <Link to="/shop">
            <Button variant="primary" size="md">
              Continue Shopping
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cart items list table */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border p-6 shadow-sm overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-dark-border pb-4 font-outfit uppercase text-[10px] text-text-secondary dark:text-gray-400 font-bold tracking-widest">
                    <th className="pb-4">Product Details</th>
                    <th className="pb-4 text-center">Quantity</th>
                    <th className="pb-4 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                  {items.map((item) => {
                    const activePrice = item.salePrice !== null ? item.salePrice : item.price;
                    return (
                      <tr key={`${item.id}-${item.size}-${item.color}`} className="py-4">
                        <td className="py-6 flex items-center">
                          {/* Image */}
                          <div className="w-16 aspect-[3/4] bg-neutral-100 dark:bg-neutral-900 overflow-hidden border border-gray-100 dark:border-dark-border">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          {/* Info details */}
                          <div className="ml-4">
                            <h3 className="font-outfit uppercase font-semibold text-xs tracking-wide text-text-primary dark:text-white mb-1 line-clamp-1">
                              {item.name}
                            </h3>
                            <p className="text-[10px] text-text-secondary dark:text-gray-400 uppercase tracking-widest font-semibold">
                              {typeof item.size === 'string' || typeof item.size === 'number' ? `Size: ${item.size}` : (item.size && (item.size as any).name ? `Size: ${(item.size as any).name}` : '')} {item.color ? `| Color: ${formatColorName(typeof item.color === 'string' ? item.color : (item.color as any).name || (item.color as any).hex || '')}` : ''}
                            </p>
                            <button
                              onClick={() => removeItem(item.id, item.size, item.color)}
                              className="text-[10px] text-error font-semibold flex items-center space-x-1.5 mt-2 hover:underline"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Remove</span>
                            </button>
                          </div>
                        </td>
                        <td className="py-6 text-center">
                          {/* Quantity Controls */}
                          <div className="inline-flex items-center border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface">
                            <button
                              onClick={() => updateQty(item.id, item.size, item.color, item.quantity - 1)}
                              className="p-1 px-2.5 text-text-secondary hover:bg-neutral-100 dark:hover:bg-neutral-800 dark:text-white"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-3 text-xs font-semibold text-text-primary dark:text-white">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQty(item.id, item.size, item.color, item.quantity + 1)}
                              className="p-1 px-2.5 text-text-secondary hover:bg-neutral-100 dark:hover:bg-neutral-800 dark:text-white"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                        <td className="py-6 text-right font-outfit font-extrabold text-xs text-text-primary dark:text-white">
                          {formatPrice(activePrice * item.quantity)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center">
              <Link to="/shop">
                <Button variant="secondary" size="sm">
                  &larr; Continue Shopping
                </Button>
              </Link>
              <button
                onClick={clear}
                className="text-xs font-outfit uppercase tracking-widest font-bold text-error border-b border-transparent hover:border-error transition-all"
              >
                Clear Cart Items
              </button>
            </div>
          </div>

          {/* Cart Sidebar Summary */}
          <div className="lg:col-span-4 space-y-6">
            {/* Coupon Code Input */}
            <div className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border p-6 shadow-sm">
              <h3 className="font-outfit uppercase tracking-widest text-xs font-bold text-accent mb-4">
                Promo Code
              </h3>
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="ENTER VIMSA10"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="w-full bg-transparent border border-gray-200 dark:border-dark-border px-3 py-2 outline-none uppercase text-xs font-outfit font-semibold tracking-wider text-text-primary dark:text-white focus:border-accent"
                />
                <Button type="submit" variant="primary" size="sm">
                  Apply
                </Button>
              </form>
            </div>

            {/* Sum stats */}
            <div className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border p-6 shadow-sm">
              <h3 className="font-outfit uppercase tracking-widest text-xs font-bold text-accent mb-6">
                Order Summary
              </h3>

              <div className="space-y-4 font-outfit uppercase text-[11px] font-semibold text-text-primary dark:text-gray-200 border-b border-gray-100 dark:border-dark-border pb-6">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Coupon Discount</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-text-secondary">Shipping</span>
                  <span className="text-neutral-500 font-normal">Calculated at next step</span>
                </div>
              </div>

              <div className="flex justify-between items-baseline pt-6 mb-8">
                <span className="font-outfit uppercase tracking-widest text-xs font-bold text-text-secondary">
                  Total
                </span>
                <span className="font-outfit font-extrabold text-xl text-text-primary dark:text-white">
                  {formatPrice(finalTotal)}
                </span>
              </div>

              <Button
                variant="accent"
                fullWidth
                size="lg"
                onClick={() => navigate('/checkout')}
                className="flex items-center justify-center space-x-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
