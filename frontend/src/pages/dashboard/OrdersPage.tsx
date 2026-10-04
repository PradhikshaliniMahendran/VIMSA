import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Clock, ShoppingBag } from 'lucide-react';
import { orderService } from '../../services/orderService.ts';
import { useCart } from '../../hooks/useCart.ts';
import LoadingSpinner from '../../components/ui/LoadingSpinner.tsx';
import Button from '../../components/ui/Button.tsx';

const OrdersPage: React.FC = () => {
  const { formatPrice } = useCart();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await orderService.getMyOrders();
        if (response.success && response.data) {
          setOrders(response.data.orders || response.data || []);
        }
      } catch (err) {
        console.error('Failed to load user orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusColor = (status?: string) => {
    if (!status) return 'text-neutral-500 border-neutral-500';
    const s = status.toLowerCase();
    if (['pending', 'confirmed'].includes(s)) return 'text-warning border-warning';
    if (s === 'processing') return 'text-blue-500 border-blue-500';
    if (s === 'shipped') return 'text-purple-500 border-purple-500';
    if (s === 'delivered') return 'text-success border-success';
    return 'text-error border-error'; // Cancelled or returned
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-100 dark:border-dark-border pb-4">
        <h3 className="font-outfit uppercase tracking-widest text-xs font-bold text-accent">
          Order History
        </h3>
        <p className="text-[10px] text-text-secondary dark:text-gray-400 uppercase tracking-wider font-semibold font-outfit mt-0.5">
          View your past orders, delivery tracking, and invoice downloads
        </p>
      </div>

      {loading ? (
        <div className="h-48 flex justify-center items-center">
          <LoadingSpinner />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingBag className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mx-auto mb-4 stroke-1" />
          <p className="font-outfit uppercase text-xs tracking-wider font-semibold text-text-primary dark:text-white mb-2">
            No Orders Found
          </p>
          <p className="text-[10px] text-text-secondary dark:text-gray-400 mb-6 max-w-xs mx-auto">
            You haven't placed any orders yet. Start browsing our catalog.
          </p>
          <Link to="/shop">
            <Button variant="primary" size="sm">
              Shop Now
            </Button>
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px] text-xs">
            <thead>
              <tr className="border-b border-gray-100 dark:border-dark-border pb-4 font-outfit uppercase font-bold text-[10px] text-text-secondary dark:text-gray-400 tracking-widest">
                <th className="pb-3">Order Code</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Total Amount</th>
                <th className="pb-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-dark-border font-medium text-text-primary dark:text-gray-100">
              {orders.map((order) => (
                <tr key={order._id}>
                  <td className="py-4 font-bold font-outfit uppercase tracking-wide">
                    {order.orderNumber || order._id.substring(0, 10)}
                  </td>
                  <td className="py-4 text-text-secondary dark:text-neutral-400">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4">
                    <span className={`px-2 py-0.5 border text-[9px] font-outfit uppercase font-bold ${getStatusColor(order.orderStatus || order.status)}`}>
                      {order.orderStatus || order.status || 'PENDING'}
                    </span>
                  </td>
                  <td className="py-4 font-bold">
                    {formatPrice(order.total)}
                  </td>
                  <td className="py-4 text-right">
                    <Link
                      to={`/dashboard/orders/${order._id}`}
                      className="inline-flex items-center space-x-1 text-accent hover:text-white transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="font-outfit uppercase text-[10px] font-bold">View Details</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
