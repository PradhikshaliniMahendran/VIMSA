import React, { useEffect, useState } from 'react';
import { Check, X, ShieldAlert } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner.tsx';
import toast from 'react-hot-toast';

interface ReturnRequest {
  _id: string;
  order: any;
  items: any[];
  customer: any;
  reason: string;
  status: string; // pending, approved, rejected
  createdAt: string;
}

const AdminReturns: React.FC = () => {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReturns = async () => {
    setLoading(true);
    try {
      const api = (await import('../../services/api.ts')).default;
      const response = await api.get('/admin/returns');
      if (response.data.success) {
        const retData = response.data.data;
        setReturns(retData?.returns || (Array.isArray(retData) ? retData : []));
      }
    } catch (err) {
      console.error('Failed to load return requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const handleUpdateReturn = async (returnId: string, status: string) => {
    try {
      const api = (await import('../../services/api.ts')).default;
      const response = await api.patch(`/admin/returns/${returnId}`, { status });
      if (response.data.success) {
        toast.success(`Return request ${status} successfully.`);
        await fetchReturns();
      }
    } catch (err) {
      toast.error('Failed to update return request');
    }
  };

  return (
    <div className="space-y-6 text-xs font-outfit uppercase tracking-wider font-semibold text-text-primary dark:text-white">
      {/* Title */}
      <div className="flex justify-between items-center border-b border-gray-100 dark:border-dark-border pb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold">Return Requests</h2>
          <p className="text-[10px] text-text-secondary dark:text-gray-400 mt-1 uppercase font-semibold">
            Review customer sizing exchanges and product refund claims
          </p>
        </div>
      </div>

      {loading ? (
        <div className="h-48 flex justify-center items-center">
          <LoadingSpinner />
        </div>
      ) : returns.length === 0 ? (
        <div className="py-12 text-center text-xs text-text-secondary uppercase tracking-widest font-semibold font-outfit flex flex-col items-center">
          <ShieldAlert className="w-10 h-10 text-neutral-300 dark:text-neutral-700 mb-3 stroke-[1.5]" />
          <span>No return requests filed in the database yet.</span>
        </div>
      ) : (
        <div className="overflow-x-auto text-[11px] font-semibold">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 dark:border-dark-border pb-3 text-[9px] text-text-secondary">
                <th className="pb-3">Reference</th>
                <th className="pb-3">Reason</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Approval Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
              {returns.map((ret) => (
                <tr key={ret._id}>
                  <td className="py-4 font-bold">{ret.order?.orderNumber || ret.order?._id?.substring(0, 10) || ret._id.substring(0, 10)}</td>
                  <td className="py-4 text-text-secondary dark:text-neutral-400 normal-case">
                    <p className="font-semibold text-text-primary dark:text-white mb-1">{ret.reason}</p>
                    <p className="text-[9px] opacity-75">{ret.items?.length || 0} item(s) returning</p>
                  </td>
                  <td className="py-4 text-text-secondary dark:text-neutral-400">{new Date(ret.createdAt).toLocaleDateString()}</td>
                  <td className="py-4">
                    <span className={`px-1.5 py-0.5 border text-[9px] ${
                      ret.status === 'approved'
                        ? 'border-success text-success'
                        : ret.status === 'rejected'
                        ? 'border-error text-error'
                        : 'border-warning text-warning'
                    }`}>
                      {ret.status}
                    </span>
                  </td>
                  <td className="py-4 text-right flex justify-end items-center space-x-2">
                    {ret.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleUpdateReturn(ret._id, 'approved')}
                          className="p-1 border border-success text-success hover:bg-success hover:text-white"
                          title="Approve & Refund"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleUpdateReturn(ret._id, 'rejected')}
                          className="p-1 border border-error text-error hover:bg-error hover:text-white"
                          title="Reject Claim"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}
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

export default AdminReturns;
