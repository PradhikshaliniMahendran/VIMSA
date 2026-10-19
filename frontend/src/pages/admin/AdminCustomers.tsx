import React, { useEffect, useState } from 'react';
import { Lock, Unlock, Mail } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner.tsx';
import toast from 'react-hot-toast';

interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  role: string;
  status?: string; // active or inactive/blocked
}

const AdminCustomers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const api = (await import('../../services/api.ts')).default;
      const response = await api.get('/admin/users');
      if (response.data.success) {
        const custData = response.data.data;
        setCustomers(custData?.users || (Array.isArray(custData) ? custData : []));
      }
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleToggleStatus = async (userId: string) => {
    try {
      const api = (await import('../../services/api.ts')).default;
      const response = await api.patch(`/admin/users/${userId}/toggle-status`);
      if (response.data.success) {
        toast.success('User status toggled successfully.');
        await fetchCustomers();
      }
    } catch (err) {
      toast.error('Failed to toggle user status');
    }
  };

  return (
    <div className="space-y-6 text-xs font-outfit uppercase tracking-wider font-semibold text-text-primary dark:text-white">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-dark-border pb-4">
        <div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold">User Registry</h2>
          <p className="text-[10px] text-text-secondary dark:text-gray-400 mt-1 uppercase font-semibold">
            Manage customer membership locks and access permissions
          </p>
        </div>
      </div>

      {loading ? (
        <div className="h-48 flex justify-center items-center">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border p-3 sm:p-5 lg:p-6 shadow-sm overflow-x-auto text-[11px] font-semibold rounded-xs">
          <table className="w-full text-left min-w-[620px]">
            <thead>
              <tr className="border-b border-gray-100 dark:border-dark-border pb-3 text-[9px] text-text-secondary">
                <th className="pb-3 pr-4">Name</th>
                <th className="pb-3 pr-4">Email Address</th>
                <th className="pb-3 pr-4">Mobile</th>
                <th className="pb-3 pr-4">Access Level</th>
                <th className="pb-3 text-right">Lock / Unlock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-text-secondary">
                    No users registered in the system yet.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c._id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
                    <td className="py-4 pr-4 font-bold whitespace-nowrap">{c.firstName} {c.lastName}</td>
                    <td className="py-4 pr-4 text-text-secondary dark:text-neutral-400 normal-case whitespace-nowrap">{c.email}</td>
                    <td className="py-4 pr-4 font-bold whitespace-nowrap">{c.mobileNumber || '-'}</td>
                    <td className="py-4 pr-4 uppercase font-bold text-accent whitespace-nowrap">{c.role}</td>
                    <td className="py-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(c._id)}
                        className={`p-1.5 border transition-all rounded-xs ${
                          c.status === 'inactive'
                            ? 'border-error text-error hover:bg-error hover:text-white'
                            : 'border-success text-success hover:bg-success hover:text-white'
                        }`}
                        title={c.status === 'inactive' ? 'Unlock Account' : 'Lock Account'}
                      >
                        {c.status === 'inactive' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                      </button>
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

export default AdminCustomers;
