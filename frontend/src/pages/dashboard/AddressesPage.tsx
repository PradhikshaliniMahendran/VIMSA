import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Home, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import Input from '../../components/ui/Input.tsx';
import Button from '../../components/ui/Button.tsx';
import LoadingSpinner from '../../components/ui/LoadingSpinner.tsx';

interface Address {
  _id: string;
  fullName: string;
  mobileNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district: string;
  province: string;
  postalCode: string;
  country: string;
  isDefaultShipping: boolean;
}

const AddressesPage: React.FC = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [province, setProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const api = (await import('../../services/api.ts')).default;
      const response = await api.get('/user/addresses');
      if (response.data.success) {
        const addrData = response.data.data;
        setAddresses(addrData?.addresses || (Array.isArray(addrData) ? addrData : []));
      }
    } catch (err) {
      console.error('Failed to load user addresses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !mobileNumber || !addressLine1 || !city || !postalCode) {
      toast.error('Please complete all mandatory address fields');
      return;
    }

    setSubmitting(true);
    try {
      const api = (await import('../../services/api.ts')).default;
      const response = await api.post('/user/addresses', {
        fullName,
        mobileNumber,
        addressLine1,
        addressLine2,
        city,
        district,
        province,
        postalCode,
        country: 'Sri Lanka',
      });

      if (response.data.success) {
        toast.success('Address added successfully! 🎉');
        setShowAddForm(false);
        // Clear fields
        setFullName('');
        setMobileNumber('');
        setAddressLine1('');
        setAddressLine2('');
        setCity('');
        setDistrict('');
        setProvince('');
        setPostalCode('');
        await fetchAddresses();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add address');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirm = window.confirm('Are you sure you want to delete this address?');
    if (!confirm) return;

    try {
      const api = (await import('../../services/api.ts')).default;
      const response = await api.delete(`/user/addresses/${id}`);
      if (response.data.success) {
        toast.success('Address deleted.');
        await fetchAddresses();
      }
    } catch (err) {
      toast.error('Failed to delete address.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-gray-100 dark:border-dark-border pb-4">
        <div>
          <h3 className="font-outfit uppercase tracking-widest text-xs font-bold text-accent">
            Address Book
          </h3>
          <p className="text-[10px] text-text-secondary dark:text-gray-400 uppercase tracking-wider font-semibold font-outfit mt-0.5">
            Configure delivery shipping details
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center space-x-1 py-1.5 px-3"
        >
          <Plus className="w-4 h-4 text-accent" />
          <span className="text-[10px]">{showAddForm ? 'Cancel' : 'New Address'}</span>
        </Button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddAddress} className="bg-neutral-50 dark:bg-neutral-900/40 p-6 border border-gray-100 dark:border-dark-border space-y-4 max-w-xl animate-fade-in">
          <h4 className="font-outfit uppercase text-[10px] font-bold text-accent mb-4">Add New Address</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Recipient Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            <Input label="Mobile Number" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} required />
          </div>
          <Input label="Address Line 1" value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} required />
          <Input label="Address Line 2 (Optional)" value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} required />
            <Input label="District" value={district} onChange={(e) => setDistrict(e.target.value)} />
            <Input label="Province" value={province} onChange={(e) => setProvince(e.target.value)} />
            <Input label="Postal Code" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} required />
          </div>
          <Button type="submit" variant="primary" isLoading={submitting}>
            Save Address
          </Button>
        </form>
      )}

      {loading ? (
        <div className="h-24 flex justify-center items-center">
          <LoadingSpinner />
        </div>
      ) : addresses.length === 0 ? (
        <div className="py-12 text-center text-xs text-text-secondary uppercase tracking-widest font-semibold font-outfit">
          No delivery addresses listed in your address book yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed font-semibold font-outfit">
          {addresses.map((address) => (
            <div key={address._id} className="relative bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="flex items-center space-x-1.5 text-accent text-[10px] font-bold">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Shipping Point</span>
                  </span>
                  <button
                    onClick={() => handleDelete(address._id)}
                    className="text-text-secondary hover:text-error transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="font-bold text-text-primary dark:text-white uppercase">{address.fullName}</p>
                <p className="text-text-secondary dark:text-neutral-400 mt-1">{address.addressLine1}</p>
                {address.addressLine2 && <p className="text-text-secondary dark:text-neutral-400">{address.addressLine2}</p>}
                <p className="text-text-secondary dark:text-neutral-400">{address.city}, {address.district}</p>
                <p className="text-text-secondary dark:text-neutral-400">{address.postalCode}</p>
                <p className="text-text-primary dark:text-white mt-1">Phone: {address.mobileNumber}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressesPage;
