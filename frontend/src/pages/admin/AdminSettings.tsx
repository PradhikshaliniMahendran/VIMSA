import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button.tsx';
import Input from '../../components/ui/Input.tsx';
import { settingsService, GlobalSettings } from '../../services/settingsService.ts';
import api from '../../services/api.ts';

const AdminSettings: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Admin password reset states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const { register, handleSubmit, reset, watch } = useForm<GlobalSettings>();
  const flashSaleActive = watch('flashSaleActive');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const res = await settingsService.getSettings();
      if (res.success && res.data) {
        const data = { ...res.data };
        if (data.flashSaleEndDate) {
          const dateObj = new Date(data.flashSaleEndDate);
          if (!isNaN(dateObj.getTime())) {
            data.flashSaleEndDate = new Date(dateObj.getTime() - dateObj.getTimezoneOffset() * 60000)
              .toISOString()
              .slice(0, 16);
          } else {
            data.flashSaleEndDate = '';
          }
        } else {
          data.flashSaleEndDate = '';
        }
        reset(data);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const navigate = useNavigate();

  const onSubmit = async (data: GlobalSettings) => {
    try {
      setIsSaving(true);
      const payload = { ...data };
      if (!payload.flashSaleEndDate) {
        payload.flashSaleEndDate = null as any;
      }
      await settingsService.updateSettings(payload);
      toast.success('Store settings saved successfully! 🎉');
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error('Admin login required to update settings.');
        navigate('/admin/login?redirect=/admin/settings');
        return;
      }
      const msg = error.response?.data?.message || 'Failed to update settings';
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      setIsChangingPassword(true);
      const res = await api.put('/user/change-password', {
        currentPassword,
        newPassword,
      });

      if (res.data?.success) {
        toast.success('Admin password updated successfully! 🔑');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(res.data?.message || 'Failed to change password');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Current password incorrect or update failed.';
      toast.error(msg);
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return <div className="text-white p-8">Loading settings...</div>;
  }

  return (
    <div className="space-y-6 sm:space-y-8 text-xs font-outfit uppercase tracking-wider font-semibold text-text-primary dark:text-white max-w-4xl">
      <div className="border-b border-gray-100 dark:border-dark-border pb-4">
        <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold text-text-primary dark:text-white mb-1">
          Store Settings
        </h1>
        <p className="text-[10px] text-text-secondary dark:text-gray-400 font-inter uppercase">
          Manage store brand details, WhatsApp order destination number, shipping fees, flash sales, and security credentials.
        </p>
      </div>

      <div className="space-y-6 sm:space-y-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
          {/* Store Details Section */}
          <section className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border p-4 sm:p-6 shadow-sm rounded-xs">
            <h2 className="text-sm font-extrabold text-accent mb-4 sm:mb-6 tracking-widest">
              Store Contact &amp; Brand Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <Input
                label="Store Brand Name *"
                {...register('storeName', { required: 'Required' })}
                placeholder="e.g. VIMSA"
              />
              <Input
                label="WhatsApp Order Number *"
                {...register('whatsappNumber', { required: 'Required' })}
                placeholder="e.g. +94771234567"
                helperText="Orders placed by customers will be routed directly to this WhatsApp number."
              />
              <Input
                label="Contact Phone Number"
                {...register('contactNumber')}
                placeholder="e.g. +94771234567"
              />
              <Input
                label="Store Email"
                type="email"
                {...register('email')}
                placeholder="e.g. info@vimsa.lk"
              />
              <div className="md:col-span-2">
                <Input
                  label="Physical Store Address"
                  {...register('address')}
                  placeholder="e.g. Colombo, Sri Lanka"
                />
              </div>
              <Input
                label="Facebook Link"
                {...register('facebookUrl')}
                placeholder="https://facebook.com/vimsa"
              />
              <Input
                label="Instagram Link"
                {...register('instagramUrl')}
                placeholder="https://instagram.com/vimsa"
              />
            </div>
          </section>

          {/* Shipping Configuration */}
          <section className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border p-4 sm:p-6 shadow-sm rounded-xs">
            <h2 className="text-sm font-extrabold text-accent mb-4 sm:mb-6 tracking-widest">
              Shipping Configuration
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <Input
                label="Standard Shipping Fee (Rs.) *"
                type="number"
                {...register('shippingFee', { valueAsNumber: true, required: 'Required' })}
              />
              <Input
                label="Free Shipping Threshold (Rs.) *"
                type="number"
                {...register('freeShippingThreshold', { valueAsNumber: true, required: 'Required' })}
                helperText="Orders above this total automatically get free shipping."
              />
            </div>
          </section>

          {/* Flash Sale Banner Configuration */}
          <section className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border p-4 sm:p-6 shadow-sm rounded-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
              <h2 className="text-sm font-extrabold text-accent tracking-widest">
                Flash Sale Announcement Banner
              </h2>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('flashSaleActive')}
                  className="accent-accent w-4 h-4"
                />
                <span className="text-xs font-bold">
                  {flashSaleActive ? 'Banner Active' : 'Banner Inactive'}
                </span>
              </label>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 transition-opacity duration-300 ${!flashSaleActive ? 'opacity-40 pointer-events-none' : ''}`}>
              <div className="md:col-span-2">
                <Input
                  label="End Date &amp; Time"
                  type="datetime-local"
                  {...register('flashSaleEndDate')}
                />
              </div>
              <Input
                label="Banner Title"
                {...register('flashSaleTitle')}
                placeholder="e.g. VIMSA Flash Sale"
              />
              <Input
                label="Discount Offer Text"
                {...register('flashSaleDiscountText')}
                placeholder="e.g. 30% OFF"
              />
            </div>
          </section>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isSaving} variant="accent" size="lg" className="w-full sm:w-auto">
              {isSaving ? 'Saving All Settings...' : 'Save Store General Settings'}
            </Button>
          </div>
        </form>

        {/* Dedicated Admin Security & Password Reset Section */}
        <section className="bg-white dark:bg-dark-surface border border-red-500/30 dark:border-red-500/20 p-4 sm:p-6 shadow-sm rounded-xs mt-6 sm:mt-10">
          <h2 className="text-sm font-extrabold text-red-500 mb-2 tracking-widest flex items-center gap-2">
            <span>🔑</span>
            <span>Admin Account Security — Reset Password</span>
          </h2>
          <p className="text-[10px] text-text-secondary dark:text-gray-400 mb-6 font-inter uppercase">
            Update the active superadmin login password. You will use this new password on your next admin login.
          </p>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Current Password *"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <Input
                label="New Password *"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <Input
                label="Confirm New Password *"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" isLoading={isChangingPassword} variant="accent" className="font-extrabold uppercase tracking-widest w-full sm:w-auto">
                Update Admin Password
              </Button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};

export default AdminSettings;
