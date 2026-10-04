import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth.ts';
import Input from '../../components/ui/Input.tsx';
import Button from '../../components/ui/Button.tsx';
import logoPng from '../../assets/logo.png';

const adminLoginSchema = z.object({
  email: z.string().email('Please enter a valid admin email'),
  password: z.string().min(6, 'Password must contain at least 6 characters'),
});

type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;

const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, loading } = useAuth();
  
  const redirectPath = searchParams.get('redirect') || '/admin';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: AdminLoginFormValues) => {
    try {
      const response = await login(data);
      if (response.success && response.data?.user) {
        const role = response.data.user.role;
        if (['admin', 'superadmin'].includes(role)) {
          toast.success('Authenticated as VIMSA Store Admin!');
          navigate(redirectPath);
        } else {
          toast.error('Access Denied: Customer accounts do not have admin permissions.');
        }
      } else {
        toast.error(response.message || 'Admin login failed. Please check credentials.');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid credentials or server error.';
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-black flex justify-center items-center px-4 py-12 text-white font-outfit select-none">
      <div className="w-full max-w-md bg-[#111318] border border-accent/30 p-8 md:p-10 shadow-2xl rounded-sm">
        <div className="flex flex-col items-center mb-8 text-center">
          <img src={logoPng} alt="VIMSA Logo" className="h-12 w-auto mb-3" />
          <h2 className="uppercase tracking-widest text-xl font-extrabold text-accent">
            VIMSA ADMIN LOGIN
          </h2>
          <p className="text-[10px] text-neutral-400 mt-1 uppercase tracking-wider font-semibold font-inter">
            Protected Store Control Console
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Admin Email Address"
            type="email"
            placeholder="Enter admin email"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Admin Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />

          <Button type="submit" variant="accent" fullWidth size="lg" isLoading={loading} className="font-extrabold uppercase tracking-widest text-xs mt-2">
            Authenticate &amp; Access Admin
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;
