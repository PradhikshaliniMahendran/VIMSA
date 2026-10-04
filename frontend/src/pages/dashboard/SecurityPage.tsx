import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import Input from '../../components/ui/Input.tsx';
import Button from '../../components/ui/Button.tsx';

const passwordSchema = z
  .object({
    oldPassword: z.string().min(6, 'Old password must contain at least 6 characters'),
    newPassword: z.string().min(6, 'New password must contain at least 6 characters'),
    confirmNewPassword: z.string().min(6, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

const SecurityPage: React.FC = () => {
  const [updating, setUpdating] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data: PasswordFormValues) => {
    setUpdating(true);
    try {
      const api = (await import('../../services/api.ts')).default;
      const response = await api.put('/user/change-password', {
        currentPassword: data.oldPassword,
        newPassword: data.newPassword,
      });

      if (response.data.success) {
        toast.success('Your account password updated successfully! 🎉');
        reset();
      } else {
        toast.error(response.data.message || 'Failed to update password.');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error occurred updating password.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-100 dark:border-dark-border pb-4">
        <h3 className="font-outfit uppercase tracking-widest text-xs font-bold text-accent">
          Security Settings
        </h3>
        <p className="text-[10px] text-text-secondary dark:text-gray-400 uppercase tracking-wider font-semibold font-outfit mt-0.5">
          Change your account password credentials
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-xl">
        <Input
          label="Current Password"
          type="password"
          placeholder="••••••••"
          error={errors.oldPassword?.message}
          {...register('oldPassword')}
        />
        <Input
          label="New Password"
          type="password"
          placeholder="••••••••"
          error={errors.newPassword?.message}
          {...register('newPassword')}
        />
        <Input
          label="Confirm New Password"
          type="password"
          placeholder="••••••••"
          error={errors.confirmNewPassword?.message}
          {...register('confirmNewPassword')}
        />

        <Button type="submit" variant="primary" isLoading={updating} className="mt-4">
          Update Password Credentials
        </Button>
      </form>
    </div>
  );
};

export default SecurityPage;
