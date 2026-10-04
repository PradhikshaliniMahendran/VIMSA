import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, ShieldCheck, HelpCircle } from 'lucide-react';
import { orderService } from '../../services/orderService.ts';
import { useCart } from '../../hooks/useCart.ts';
import LoadingSpinner from '../../components/ui/LoadingSpinner.tsx';
import { formatColorName } from '../../utils/colorHelper.ts';
import Button from '../../components/ui/Button.tsx';
import toast from 'react-hot-toast';
import EditOrderModal from './EditOrderModal.tsx';
import ReturnModal from '../../components/dashboard/ReturnModal.tsx';

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { formatPrice } = useCart();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);

  const fetchOrder = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await orderService.getOrderById(id);
      if (response.success && response.data) {
        setOrder(response.data.order || response.data);
      } else {
        toast.error('Failed to locate order.');
        navigate('/dashboard/orders');
      }
    } catch (err) {
      console.error('Failed to load order:', err);
      toast.error('Failed to fetch order details.');
      navigate('/dashboard/orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleCancelOrder = async () => {
    if (!order) return;
    
    const confirmCancel = window.confirm('Are you sure you want to cancel this order?');
    if (!confirmCancel) return;

    setCancelling(true);
    try {
      const response = await orderService.cancelOrder(order._id, 'Customer requested cancellation via panel');
      if (response.success) {
        toast.success('Order cancelled successfully.');
        await fetchOrder();
      } else {
        toast.error(response.message || 'Failed to cancel order.');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error cancelling order.');
    } finally {
      setCancelling(false);
    }
  };

  const handleDownloadInvoice = () => {
    if (!id) return;
    const url = orderService.getInvoiceUrl(id);
    window.open(url, '_blank');
  };

  const handleRequestReturn = async (items: any[], reason: string) => {
    try {
      const api = (await import('../../services/api.ts')).default;
      const response = await api.post('/orders/returns', {
        order: order._id,
        items,
        reason,
        images: []
      });
      if (response.data.success) {
        toast.success('Return request submitted successfully.');
        await fetchOrder();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to request return');
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex justify-center items-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="space-y-8">
      {/* Header controls */}
      <div className="flex justify-between items-center border-b border-gray-100 dark:border-dark-border pb-4">
        <div className="flex items-center space-x-2">
          <Link to="/dashboard/orders" className="text-text-secondary hover:text-accent mr-2">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h3 className="font-outfit uppercase tracking-widest text-xs font-bold text-accent">
              Order Details
            </h3>
            <div className="flex items-center space-x-3 mt-0.5">
              <p className="font-outfit uppercase text-[10px] tracking-wider text-text-primary dark:text-white">
                Code: {order.orderNumber || order._id}
              </p>
              <span className="px-2 py-0.5 border border-accent text-[9px] text-accent font-outfit uppercase font-bold">
                {order.orderStatus || order.status || 'PENDING'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex space-x-2.5">
          <Button variant="secondary" size="sm" onClick={handleDownloadInvoice} className="flex items-center space-x-1.5 py-1.5 px-3">
            <Download className="w-3.5 h-3.5 text-accent" />
            <span className="text-[10px]">Invoice</span>
          </Button>
          {['pending', 'confirmed'].includes((order.orderStatus || order.status || '').toLowerCase()) && (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsEditModalOpen(true)}
                className="text-accent border-accent/20 hover:bg-accent/10 text-[10px] py-1.5 px-3"
              >
                Edit Order
              </Button>
              <Button
                variant="secondary"
                size="sm"
                isLoading={cancelling}
                onClick={handleCancelOrder}
                className="text-error border-error/20 hover:bg-error/10 text-[10px] py-1.5 px-3"
              >
                Cancel
              </Button>
            </>
          )}
          {['delivered'].includes((order.orderStatus || order.status || '').toLowerCase()) && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsReturnModalOpen(true)}
              className="text-warning border-warning/20 hover:bg-warning/10 text-[10px] py-1.5 px-3 font-bold"
            >
              Request Return
            </Button>
          )}
        </div>
      </div>

      {/* Info grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs leading-relaxed">
        {/* Shipping address details */}
        <div className="bg-neutral-50 dark:bg-neutral-900/40 border border-gray-100 dark:border-dark-border p-5 rounded-sm">
          <h4 className="font-outfit uppercase text-[10px] font-bold text-accent mb-3">Delivery Address</h4>
          <p className="font-bold text-text-primary dark:text-white">{order.shippingAddress?.fullName}</p>
          <p>{order.shippingAddress?.addressLine1}</p>
          {order.shippingAddress?.addressLine2 && <p>{order.shippingAddress?.addressLine2}</p>}
          <p>{order.shippingAddress?.city}, {order.shippingAddress?.district}, {order.shippingAddress?.province}</p>
          <p>{order.shippingAddress?.postalCode}</p>
          <p className="mt-2 font-semibold text-text-primary dark:text-white">Mobile: {order.shippingAddress?.mobileNumber}</p>
        </div>

        {/* Payments details */}
        <div className="bg-neutral-50 dark:bg-neutral-900/40 border border-gray-100 dark:border-dark-border p-5 rounded-sm">
          <h4 className="font-outfit uppercase text-[10px] font-bold text-accent mb-3">Payment Summary</h4>
          <p className="uppercase font-bold text-text-primary dark:text-white">{(order.paymentMethod || 'COD')} Payment</p>
          <p className="text-text-secondary mt-1">Status: {order.paymentStatus || 'Pending'}</p>
          {order.paymentDetails?.transactionId && (
            <p className="text-[10px] text-neutral-500 font-semibold mt-1">TXID: {order.paymentDetails.transactionId}</p>
          )}
        </div>
      </div>

      {/* Items list */}
      <div>
        <h4 className="font-outfit uppercase text-[10px] font-bold text-accent mb-4">Items Summary</h4>
        <div className="border border-gray-100 dark:border-dark-border divide-y divide-gray-100 dark:divide-dark-border">
          {order.items?.map((item: any, idx: number) => (
            <div key={idx} className="flex py-4 px-4 justify-between items-center text-xs">
              <div className="flex items-center space-x-4">
                <img src={item.image || ''} alt={item.name || 'Product'} className="w-12 aspect-[3/4] object-cover bg-neutral-100" />
                <div>
                  <h5 className="font-outfit uppercase font-semibold text-text-primary dark:text-white line-clamp-1">{item.name || 'Unknown Product'}</h5>
                  <p className="text-[9px] text-text-secondary dark:text-neutral-500 uppercase mt-0.5">Size: {item.size || 'N/A'} | Qty: {item.quantity || 1} | Color: {formatColorName(item.color || '')}</p>
                </div>
              </div>
              <span className="font-outfit font-bold text-text-primary dark:text-white">
                {formatPrice((item.salePrice || item.price || 0) * (item.quantity || 1))}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Order totals */}
      <div className="border-t border-gray-100 dark:border-dark-border pt-6 flex justify-end text-xs font-semibold uppercase font-outfit">
        <div className="w-64 space-y-3">
          <div className="flex justify-between">
            <span className="text-neutral-400">Subtotal</span>
            <span>{formatPrice((order.total || 0) - (order.shippingCost || 0))}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Shipping</span>
            <span>{(order.shippingCost || 0) > 0 ? formatPrice(order.shippingCost) : 'Free Delivery'}</span>
          </div>
          <div className="flex justify-between font-bold pt-4 border-t border-gray-100 dark:border-dark-border">
            <span>Total</span>
            <span className="text-base text-accent font-extrabold">{formatPrice(order.total || 0)}</span>
          </div>
        </div>
      </div>

      <EditOrderModal
        order={order}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onOrderUpdated={fetchOrder}
      />
      <ReturnModal
        order={order}
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        onSubmit={handleRequestReturn}
      />
    </div>
  );
};

export default OrderDetailPage;
