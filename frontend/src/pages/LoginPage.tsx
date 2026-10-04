import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth.ts';
import Input from '../components/ui/Input.tsx';
import Button from '../components/ui/Button.tsx';
import logoPng from '../assets/logo.png';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must contain at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, loading } = useAuth();
  
  const redirectPath = searchParams.get('redirect') || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const response = await login(data);
      if (response.success) {
        toast.success('Successfully logged in to VIMSA!');
        navigate(redirectPath);
      } else {
        toast.error(response.message || 'Login failed. Please check credentials.');
      }
    } catch (err: any) {
      if (err.response?.status === 403 && err.response?.data?.needsVerification) {
        toast.error(err.response.data.message || 'Verification required');
        navigate(`/verify-otp?email=${encodeURIComponent(data.email)}`);
        return;
      }
      const msg = err.response?.data?.message || 'Server error. Please try again.';
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-[75vh] flex justify-center items-center px-4 py-12 bg-background dark:bg-dark-bg transition-colors duration-300">
      <div className="w-full max-w-md bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border p-8 md:p-10 shadow-lg">
        {/* Logo and title */}
        <div className="flex flex-col items-center mb-8">
          <img src={logoPng} alt="VIMSA Logo" className="h-12 w-auto mb-3" />
          <h2 className="font-outfit uppercase tracking-widest text-lg font-bold text-text-primary dark:text-white">
            Access Account
          </h2>
          <p className="text-[10px] text-text-secondary dark:text-gray-400 mt-1 uppercase font-semibold font-outfit tracking-wider">
            Sign in to experience luxury clothing
          </p>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="enter your email"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />

          <div className="flex justify-end items-center mb-4">
            <Link
              to="/forgot-password"
              className="font-outfit uppercase text-[10px] text-accent tracking-widest font-extrabold hover:text-text-primary dark:hover:text-white transition-colors"
            >
              Forgot Password?
            </Link>
          </div>

          <Button type="submit" variant="primary" fullWidth isLoading={loading}>
            Sign In
          </Button>
        </form>

        {/* Form Footers */}
        <div className="border-t border-gray-100 dark:border-dark-border mt-8 pt-6 text-center">
          <p className="text-xs text-text-secondary dark:text-gray-400 font-medium">
            New to VIMSA Clothing?{' '}
            <Link
              to="/register"
              className="text-accent font-semibold hover:underline"
            >
              Create an Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
