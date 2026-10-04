import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ShoppingBag, Send, CheckCircle2, ArrowLeft, X, Check } from 'lucide-react';
import { useCart } from '../hooks/useCart.ts';
import Button from '../components/ui/Button.tsx';
import Input from '../components/ui/Input.tsx';
import { settingsService, GlobalSettings } from '../services/settingsService.ts';
import toast from 'react-hot-toast';

const sriLankanMobileRegex = /^07[0-9]{8}$/;
const nameRegex = /^(?!\d+$)[a-zA-Z\s'.]+$/;

const checkoutSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Please enter a valid full name.')
    .regex(nameRegex, 'Please enter a valid full name.'),
  mobileNumber: z
    .string()
    .regex(sriLankanMobileRegex, 'Please enter a valid 10-digit Sri Lankan mobile number.'),
  whatsappNumber: z
    .string()
    .regex(sriLankanMobileRegex, 'Please enter a valid 10-digit Sri Lankan mobile number.'),
  deliveryAddress: z
    .string()
    .min(5, 'Please enter your delivery address.'),
  email: z
    .string()
    .email('Please enter a valid email address.')
    .optional()
    .or(z.literal('')),
  orderNote: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, subtotal, formatPrice, clear } = useCart();
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings | null>(null);
  const [isOrderReadyModalOpen, setIsOrderReadyModalOpen] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await settingsService.getSettings();
        if (res.success && res.data) {
          setGlobalSettings(res.data);
        }
      } catch (e) {
        console.error('Failed to load global settings:', e);
      }
    };
    fetchSettings();
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    mode: 'onBlur',
    defaultValues: {
      fullName: '',
      mobileNumber: '',
      whatsappNumber: '',
      deliveryAddress: '',
      email: '',
      orderNote: '',
    },
  });

  const watchedMobile = watch('mobileNumber');
  const watchedWhatsapp = watch('whatsappNumber');

  const isMobileValid = sriLankanMobileRegex.test(watchedMobile || '');
  const isWhatsappValid = sriLankanMobileRegex.test(watchedWhatsapp || '');

  // Input filter to block non-digits and cap length at 10 digits
  const handleDigitOnlyInput = (e: React.FormEvent<HTMLInputElement>) => {
    const target = e.currentTarget;
    target.value = target.value.replace(/[^0-9]/g, '').slice(0, 10);
  };

  if (items.length === 0 && !isOrderReadyModalOpen) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <ShoppingBag className="w-16 h-16 text-neutral-300 mx-auto mb-4 stroke-1" />
        <h2 className="text-xl font-outfit uppercase tracking-widest font-extrabold text-text-primary dark:text-white mb-2">
          Your Bag is Empty
        </h2>
        <p className="text-xs text-text-secondary dark:text-gray-400 mb-6">
          Add items to your cart before proceeding to checkout.
        </p>
        <Link to="/shop">
          <Button variant="primary" size="md">Explore Products</Button>
        </Link>
      </div>
    );
  }

  const shippingCost = subtotal > (globalSettings?.freeShippingThreshold ?? 15000) ? 0 : (globalSettings?.shippingFee ?? 350);
  const grandTotal = subtotal + shippingCost;
  const whatsappTargetNumber = (globalSettings?.whatsappNumber || '+94771234567').replace(/[^0-9]/g, '');

  const onSubmit = (data: CheckoutFormValues) => {
    // Check cart item stock limits
    const stockErrors = items.filter(item => item.quantity > (item.stockQuantity ?? 999));
    if (stockErrors.length > 0) {
      toast.error(`One or more items exceed available stock. Please adjust quantities.`);
      return;
    }

    // Generate WhatsApp Order Message
    const orderItemsText = items
      .map((item, index) => {
        const itemPrice = item.salePrice !== null ? item.salePrice : item.price;
        let line = `${index + 1}. ${item.name}`;
        if (item.size) line += `\n   Size: ${item.size}`;
        if (item.color) line += `\n   Color: ${item.color}`;
        line += `\n   Quantity: ${item.quantity}`;
        line += `\n   Price: Rs. ${itemPrice.toLocaleString()}`;
        return line;
      })
      .join('\n\n');

    const message = `Hello VIMSA,\n\nI would like to place an order.\n\nCUSTOMER DETAILS\n\nName: ${data.fullName}\nMobile: ${data.mobileNumber}\nWhatsApp: ${data.whatsappNumber}\nAddress: ${data.deliveryAddress}${data.email ? `\nEmail: ${data.email}` : ''}${data.orderNote ? `\nNote: ${data.orderNote}` : ''}\n\nORDER DETAILS\n\n${orderItemsText}\n\nDelivery Fee: Rs. ${shippingCost.toLocaleString()}\nTOTAL: Rs. ${grandTotal.toLocaleString()}\n\nThank you.`;

    const encodedUrl = `https://wa.me/${whatsappTargetNumber}?text=${encodeURIComponent(message)}`;
    setWhatsappUrl(encodedUrl);
    setIsOrderReadyModalOpen(true);
  };

  const handleCompleteAndOpenWhatsApp = () => {
    window.open(whatsappUrl, '_blank');
    setIsOrderReadyModalOpen(false);
    clear();
    toast.success('Order dispatched to WhatsApp! Thank you for shopping with VIMSA.');
    navigate('/shop');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" id="whatsapp-checkout-page">
      {/* Back button */}
      <div className="mb-8">
        <Link to="/cart" className="inline-flex items-center space-x-2 text-xs font-outfit uppercase tracking-widest font-bold text-text-secondary dark:text-neutral-400 hover:text-accent">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Shopping Cart</span>
        </Link>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Customer Details Form */}
        <div className="lg:col-span-7 bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border p-6 md:p-8 shadow-sm">
          <h2 className="font-outfit uppercase tracking-widest text-lg font-extrabold text-text-primary dark:text-white mb-2">
            Customer &amp; Delivery Details
          </h2>
          <p className="text-xs text-text-secondary dark:text-gray-400 mb-8 font-inter">
            Please fill in your contact and address details to dispatch your order via WhatsApp.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Full Name *"
              placeholder="e.g. John Perera"
              error={errors.fullName?.message}
              {...register('fullName')}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Input
                  label="Mobile Phone Number *"
                  placeholder="e.g. 0771234567"
                  maxLength={10}
                  onInput={handleDigitOnlyInput}
                  error={errors.mobileNumber?.message}
                  {...register('mobileNumber')}
                />
                {isMobileValid && (
                  <p className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-1 font-outfit uppercase tracking-wide">
                    <Check className="w-3.5 h-3.5" /> Valid mobile number
                  </p>
                )}
              </div>

              <div>
                <Input
                  label="WhatsApp Phone Number *"
                  placeholder="e.g. 0771234567"
                  maxLength={10}
                  onInput={handleDigitOnlyInput}
                  error={errors.whatsappNumber?.message}
                  {...register('whatsappNumber')}
                />
                {isWhatsappValid && (
                  <p className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-1 font-outfit uppercase tracking-wide">
                    <Check className="w-3.5 h-3.5" /> Valid WhatsApp number
                  </p>
                )}
              </div>
            </div>

            <Input
              label="Delivery Address *"
              placeholder="House/Street number, City, District"
              error={errors.deliveryAddress?.message}
              {...register('deliveryAddress')}
            />

            <Input
              label="Email Address (Optional)"
              type="email"
              placeholder="e.g. john@example.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <div>
              <label className="font-outfit uppercase text-[10px] text-text-secondary dark:text-gray-400 font-bold tracking-widest block mb-2">
                Additional Order Note (Optional)
              </label>
              <textarea
                placeholder="Special delivery instructions or size notes..."
                {...register('orderNote')}
                rows={3}
                className="w-full bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-xs px-3 py-2 outline-none font-inter text-text-primary dark:text-white focus:border-accent"
              />
            </div>

            <Button
              type="submit"
              variant="accent"
              fullWidth
              size="lg"
              className="mt-6 flex items-center justify-center space-x-2 font-extrabold uppercase tracking-widest"
            >
              <Send className="w-4 h-4" />
              <span>Place Order via WhatsApp</span>
            </Button>
          </form>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5 bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border p-6 md:p-8 shadow-sm h-fit">
          <h3 className="font-outfit uppercase tracking-widest text-sm font-extrabold text-accent mb-6 flex items-center space-x-2">
            <ShoppingBag className="w-4 h-4" />
            <span>Order Summary</span>
          </h3>

          <div className="divide-y divide-gray-100 dark:divide-dark-border max-h-80 overflow-y-auto pr-2 mb-6">
            {items.map((item) => {
              const itemPrice = item.salePrice !== null ? item.salePrice : item.price;
              return (
                <div key={`${item.id}-${item.size}-${item.color}`} className="flex py-3.5 justify-between items-center text-xs">
                  <div className="flex items-center space-x-3">
                    <img src={item.image} alt={item.name} className="w-12 aspect-[3/4] object-cover bg-neutral-100" />
                    <div>
                      <h4 className="font-outfit uppercase font-semibold text-xs text-text-primary dark:text-white line-clamp-1 max-w-[170px]">
                        {item.name}
                      </h4>
                      <p className="text-[10px] text-text-secondary dark:text-gray-400 mt-0.5 uppercase tracking-wider">
                        {item.size ? (typeof item.size === 'string' || typeof item.size === 'number' ? `Size: ${item.size} | ` : ((item.size as any).name ? `Size: ${(item.size as any).name} | ` : '')) : ''}Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="font-outfit font-extrabold text-xs text-text-primary dark:text-white">
                    {formatPrice(itemPrice * item.quantity)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="border-t border-gray-100 dark:border-dark-border pt-4 space-y-3 font-outfit uppercase text-[11px] font-semibold text-text-primary dark:text-gray-200">
            <div className="flex justify-between">
              <span className="text-text-secondary">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Delivery Fee</span>
              <span>{shippingCost > 0 ? formatPrice(shippingCost) : 'Free Delivery'}</span>
            </div>
            <div className="flex justify-between items-baseline pt-4 border-t border-gray-100 dark:border-dark-border text-sm font-bold">
              <span className="text-text-secondary">Grand Total</span>
              <span className="text-lg text-accent font-extrabold">{formatPrice(grandTotal)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {isOrderReadyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm cursor-pointer"
            onClick={() => setIsOrderReadyModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white dark:bg-dark-surface p-8 shadow-2xl border border-gray-100 dark:border-dark-border text-center">
            <button
              onClick={() => setIsOrderReadyModalOpen(false)}
              className="absolute top-4 right-4 text-text-secondary hover:text-text-primary dark:text-gray-400 dark:hover:text-white p-1 rounded-full transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="font-outfit uppercase tracking-widest text-lg font-extrabold text-text-primary dark:text-white mb-2">
              Your Order is Ready
            </h3>
            <p className="text-xs text-text-secondary dark:text-gray-300 font-inter mb-6 leading-relaxed">
              We've prepared your order details in WhatsApp. Click below to launch WhatsApp and send your order directly to VIMSA.
            </p>
            <div className="flex flex-col space-y-3">
              <Button
                variant="accent"
                size="lg"
                onClick={handleCompleteAndOpenWhatsApp}
                className="w-full flex items-center justify-center space-x-2 font-bold uppercase tracking-widest text-xs"
              >
                <Send className="w-4 h-4" />
                <span>Open WhatsApp &amp; Send Order</span>
              </Button>
              <button
                onClick={() => setIsOrderReadyModalOpen(false)}
                className="text-xs text-text-secondary hover:text-text-primary font-outfit uppercase tracking-wider font-semibold py-2"
              >
                Edit Order Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
