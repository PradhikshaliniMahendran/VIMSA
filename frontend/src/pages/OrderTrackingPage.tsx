import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ShieldCheck, Truck, Clock, Package, CheckSquare, Search } from 'lucide-react';
import { orderService } from '../services/orderService.ts';
import { useCart } from '../hooks/useCart.ts';
import LoadingSpinner from '../components/ui/LoadingSpinner.tsx';
import { formatColorName } from '../utils/colorHelper.ts';
import Button from '../components/ui/Button.tsx';
import toast from 'react-hot-toast';

const OrderTrackingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { formatPrice } = useCart();
  const orderId = searchParams.get('orderId') || '';

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchOrderDetails = async (id: string) => {
    setLoading(true);
    try {
      const response = await orderService.getOrderById(id);
      if (response.success && response.data) {
        setOrder(response.data);
      } else {
        toast.error('Failed to locate order details');
      }
    } catch (err) {
      console.error('Failed to load tracking details:', err);
      toast.error('Failed to fetch tracking details');
    } finally {
      setLoading(false);
    }
  };

  const paypalToken = searchParams.get('token');

  useEffect(() => {
    const handlePayPalCapture = async () => {
      if (paypalToken && orderId) {
        setLoading(true);
        try {
          const api = (await import('../services/api.ts')).default;
          const response = await api.post('/payments/paypal/capture', {
            paypalOrderId: paypalToken,
            orderId: orderId
          });
          if (response.data?.success) {
            toast.success('PayPal Payment captured successfully! 🎉');
            fetchOrderDetails(orderId);
          } else {
            toast.error(response.data?.message || 'Failed to capture PayPal payment');
          }
        } catch (err: any) {
          toast.error(err.response?.data?.message || 'Error capturing PayPal payment');
        } finally {
          setLoading(false);
        }
      }
    };

    if (orderId) {
      fetchOrderDetails(orderId);
      if (paypalToken) {
        handlePayPalCapture();
      }
    }
  }, [orderId, paypalToken]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      fetchOrderDetails(searchQuery.trim());
    }
  };

  const getStatusStep = (status: string) => {
    const steps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    return steps.indexOf(status.toLowerCase());
  };

  const timelineSteps = [
    { label: 'Pending Approval', status: 'pending', icon: <Clock className="w-5 h-5" /> },
    { label: 'Confirmed', status: 'confirmed', icon: <CheckSquare className="w-5 h-5" /> },
    { label: 'Processing', status: 'processing', icon: <Package className="w-5 h-5" /> },
    { label: 'Shipped', status: 'shipped', icon: <Truck className="w-5 h-5" /> },
    { label: 'Delivered', status: 'delivered', icon: <ShieldCheck className="w-5 h-5" /> },
  ];

  const currentStep = order ? getStatusStep(order.orderStatus || 'pending') : -1;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12" id="order-tracking-page">
      {/* Title */}
      <div className="text-center mb-12">
        <span className="font-outfit uppercase tracking-widest text-xs font-bold text-accent mb-2 block">
          Logistics Dashboard
        </span>
        <h1 className="text-2xl md:text-3xl font-outfit uppercase font-extrabold tracking-wider text-text-primary dark:text-white">
          Track Your Shipment
        </h1>
        <div className="w-12 h-[2px] bg-accent mx-auto mt-4" />
      </div>

      {/* Lookup Form */}
      <div className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border p-6 shadow-sm mb-10 max-w-xl mx-auto">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="ENTER ORDER NUMBER OR ID"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border border-gray-200 dark:border-dark-border px-3 py-2.5 outline-none uppercase text-xs font-outfit font-semibold tracking-wider text-text-primary dark:text-white focus:border-accent"
          />
          <Button type="submit" variant="primary" className="px-6 flex items-center space-x-1.5">
            <Search className="w-4 h-4" />
            <span>Search</span>
          </Button>
        </form>
      </div>

      {loading ? (
        <div className="h-64 flex justify-center items-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : order ? (
        <div className="space-y-8 animate-fade-in bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border p-8 md:p-10 shadow-sm">
          {/* Top summary row */}
          <div className="flex flex-col md:flex-row justify-between items-baseline border-b border-gray-100 dark:border-dark-border pb-6">
            <div>
              <p className="font-outfit uppercase text-[10px] text-accent tracking-widest font-extrabold mb-1">
                Order Reference
              </p>
              <h3 className="font-outfit uppercase font-extrabold text-sm md:text-base text-text-primary dark:text-white">
                {order.orderNumber || order._id}
              </h3>
            </div>
            <div className="mt-4 md:mt-0 font-outfit uppercase text-[11px] font-semibold text-text-secondary dark:text-gray-400">
              Placed On: {new Date(order.createdAt).toLocaleDateString()}
            </div>
          </div>

          {/* Timeline Tracking */}
          <div className="py-8 border-b border-gray-100 dark:border-dark-border">
            <h4 className="font-outfit uppercase text-xs font-bold text-accent mb-10 text-center md:text-left">
              Delivery Progress
            </h4>
            <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center relative gap-8 md:gap-4 select-none">
              {/* Desktop connector line */}
              <div className="hidden md:block absolute left-4 right-4 top-1/2 h-[2px] bg-gray-100 dark:bg-dark-border -translate-y-1/2 -z-0" />

              {timelineSteps.map((stepItem, index) => {
                const isCompleted = index <= currentStep;
                const isActive = index === currentStep;

                return (
                  <div
                    key={stepItem.status}
                    className="flex md:flex-col items-center relative z-10 md:text-center gap-4 md:gap-0"
                  >
                    <div
                      className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 md:mb-3 ${
                        isCompleted
                          ? 'bg-accent border-accent text-black shadow-md'
                          : 'bg-white dark:bg-dark-surface border-gray-200 dark:border-dark-border text-neutral-400'
                      }`}
                    >
                      {stepItem.icon}
                    </div>
                    <div>
                      <p
                        className={`font-outfit uppercase text-[10px] tracking-wider font-extrabold ${
                          isActive ? 'text-accent' : isCompleted ? 'text-text-primary dark:text-white' : 'text-neutral-400'
                        }`}
                      >
                        {stepItem.label}
                      </p>
                      <p className="text-[9px] text-text-secondary dark:text-neutral-500 font-semibold font-outfit mt-0.5">
                        {isCompleted && index === 0 ? 'Verified' : isCompleted && index === 1 ? 'Approved' : isCompleted && index === 3 ? 'Carrier Dispatched' : ''}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Items Summary Details */}
          <div>
            <h4 className="font-outfit uppercase text-xs font-bold text-accent mb-6">
              Package Details
            </h4>
            <div className="space-y-4">
              {order.items?.map((item: any, i: number) => (
                <div key={i} className="flex justify-between items-center text-xs border-b border-gray-50 dark:border-dark-border pb-4">
                  <div className="flex items-center space-x-4">
                    <img src={item.image} alt={item.name} className="w-12 aspect-[3/4] object-cover bg-neutral-100" />
                    <div>
                      <h5 className="font-outfit uppercase font-semibold text-text-primary dark:text-white line-clamp-1">{item.name}</h5>
                      <p className="text-[9px] text-text-secondary dark:text-neutral-500 uppercase mt-0.5">Size: {item.size} | Qty: {item.quantity} | Color: {formatColorName(item.color)}</p>
                    </div>
                  </div>
                  <span className="font-outfit font-bold text-text-primary dark:text-white">
                    {formatPrice((item.salePrice || item.price) * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-xs text-text-secondary uppercase tracking-widest font-semibold font-outfit">
          Please enter an order number above to fetch shipment tracking details.
        </div>
      )}
    </div>
  );
};

export default OrderTrackingPage;
