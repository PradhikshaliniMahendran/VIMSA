import React, { useEffect, useState } from 'react';
import { Eye, Edit, Check } from 'lucide-react';
import { orderService } from '../../services/orderService.ts';
import { useCart } from '../../hooks/useCart.ts';
import LoadingSpinner from '../../components/ui/LoadingSpinner.tsx';
import toast from 'react-hot-toast';

const AdminOrders: React.FC = () => {
  const { formatPrice } = useCart();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const queryParams: any = {};
      if (filterStatus) queryParams.status = filterStatus;
      
      const response = await orderService.adminGetAllOrders(queryParams);
      if (response.success && response.data) {
        setOrders(response.data.orders || response.data || []);
      }
    } catch (err) {
      console.error('Failed to load admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filterStatus]);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await orderService.adminUpdateOrderStatus(orderId, { orderStatus: newStatus });
      if (response.success) {
        toast.success(`Order status updated to ${newStatus}`);
        await fetchOrders();
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6 text-xs font-outfit uppercase tracking-wider font-semibold text-text-primary dark:text-white">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-dark-border pb-4">
        <div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold">Order Registry</h2>
          <p className="text-[10px] text-text-secondary dark:text-gray-400 mt-1 uppercase font-semibold">
            Track user transactions and update shipment progress
          </p>
        </div>

        {/* Filter dropdown */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="w-full sm:w-auto bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-xs px-3 py-2 outline-none font-bold rounded-xs cursor-pointer focus:border-accent"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div className="h-48 flex justify-center items-center">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border p-3 sm:p-5 lg:p-6 shadow-sm overflow-x-auto text-[11px] font-semibold rounded-xs">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-100 dark:border-dark-border pb-3 text-[9px] text-text-secondary">
                <th className="pb-3 pr-4">Reference</th>
                <th className="pb-3 pr-4">Customer</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 pr-4">Total Due</th>
                <th className="pb-3 text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-text-secondary">
                    No orders matching filter.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
                    <td className="py-4 pr-4 font-bold whitespace-nowrap">{ord.orderNumber}</td>
                    <td className="py-4 pr-4 text-text-secondary dark:text-neutral-400 whitespace-nowrap">
                      {ord.shippingAddress?.fullName || 'Guest Customer'}
                    </td>
                    <td className="py-4 pr-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 border border-accent text-[9px] text-accent font-bold uppercase rounded-xs">
                        {ord.orderStatus}
                      </span>
                    </td>
                    <td className="py-4 pr-4 font-bold text-accent whitespace-nowrap">{formatPrice(ord.total)}</td>
                    <td className="py-4 text-right whitespace-nowrap">
                      <div className="flex justify-end items-center space-x-2">
                        {/* Order Status updater */}
                        <select
                          value={ord.orderStatus}
                          onChange={(e) => handleUpdateStatus(ord._id, e.target.value)}
                          className="bg-transparent border border-gray-200 dark:border-dark-border text-[9px] px-2 py-1 outline-none font-bold rounded-xs cursor-pointer"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>

                        {/* Payment Status updater */}
                        <select
                          value={ord.paymentStatus}
                          onChange={async (e) => {
                            try {
                              const res = await orderService.adminUpdateOrderStatus(ord._id, { paymentStatus: e.target.value });
                              if (res.success) {
                                fetchOrders();
                              }
                            } catch (err) {
                              console.error(err);
                            }
                          }}
                          className="bg-transparent border border-gray-200 dark:border-dark-border text-[9px] px-2 py-1 outline-none font-bold text-accent rounded-xs cursor-pointer"
                        >
                          <option value="pending">Unpaid</option>
                          <option value="paid">Paid</option>
                          <option value="failed">Failed</option>
                          <option value="refunded">Refunded</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
