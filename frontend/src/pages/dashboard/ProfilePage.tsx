import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth.ts';
import { authService } from '../../services/authService.ts';
import Input from '../../components/ui/Input.tsx';
import Button from '../../components/ui/Button.tsx';

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must contain at least 2 characters'),
  lastName: z.string().min(2, 'Last name must contain at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  mobileNumber: z.string().regex(/^(?:\+94|94|0)?7[01245678]\d{7}$/, 'Please enter a valid Sri Lankan mobile number (e.g. 0771234567)'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const ProfilePage: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const [updating, setUpdating] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      mobileNumber: user?.mobileNumber || '',
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    setUpdating(true);
    try {
      // Direct call to profile update endpoint in userService (user routes require auth)
      // Since it's mounted in userController, let's make an Axios PUT request.
      // We can use the api instance directly, or implement a user service helper.
      // Let's call the api instance.
      const api = (await import('../../services/api.ts')).default;
      const response = await api.put('/user/profile', data);
      
      if (response.data.success) {
        toast.success('Profile details updated successfully! 🎉');
        await refreshProfile();
      } else {
        toast.error(response.data.message || 'Failed to update profile.');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error updating profile.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-100 dark:border-dark-border pb-4">
        <h3 className="font-outfit uppercase tracking-widest text-xs font-bold text-accent">
          Personal Information
        </h3>
        <p className="text-[10px] text-text-secondary dark:text-gray-400 uppercase tracking-wider font-semibold font-outfit mt-0.5">
          Update your profile contact and identity credentials
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="First Name"
            error={errors.firstName?.message}
            {...register('firstName')}
          />
          <Input
            label="Last Name"
            error={errors.lastName?.message}
            {...register('lastName')}
          />
        </div>

        <Input
          label="Email Address"
          type="email"
          disabled
          helperText="Email changes are locked. Contact customer care to request updates."
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Mobile Phone Number"
          error={errors.mobileNumber?.message}
          {...register('mobileNumber')}
        />

        <Button type="submit" variant="primary" isLoading={updating} className="mt-4">
          Update Profile Information
        </Button>
      </form>
    </div>
  );
};

export default ProfilePage;
