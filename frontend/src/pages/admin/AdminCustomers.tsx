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
      <div className="flex justify-between items-center border-b border-gray-100 dark:border-dark-border pb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold">User Registry</h2>
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
        <div className="overflow-x-auto text-[11px] font-semibold">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 dark:border-dark-border pb-3 text-[9px] text-text-secondary">
                <th className="pb-3">Name</th>
                <th className="pb-3">Email Address</th>
                <th className="pb-3">Mobile</th>
                <th className="pb-3">Access Level</th>
                <th className="pb-3 text-right">Lock / Unlock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
              {customers.map((c) => (
                <tr key={c._id}>
                  <td className="py-4 font-bold">{c.firstName} {c.lastName}</td>
                  <td className="py-4 text-text-secondary dark:text-neutral-400 normal-case">{c.email}</td>
                  <td className="py-4 font-bold">{c.mobileNumber}</td>
                  <td className="py-4 uppercase font-bold text-accent">{c.role}</td>
                  <td className="py-4 text-right">
                    <button
                      onClick={() => handleToggleStatus(c._id)}
                      className={`p-1.5 border transition-all ${
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
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;
