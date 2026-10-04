import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../utils/firebase.ts';
import { authService } from '../services/authService.ts';
import Input from '../components/ui/Input.tsx';
import { StrictNumberInput } from '../components/ui/StrictNumberInput.tsx';
import Button from '../components/ui/Button.tsx';
import logoPng from '../assets/logo.png';

const registerSchema = z
  .object({
    firstName: z.string().min(2, 'First name must contain at least 2 characters'),
    lastName: z.string().min(2, 'Last name must contain at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    mobileNumber: z.string().regex(/^(?:\+94|94|0)?7[01245678]\d{7}$/, 'Please enter a valid Sri Lankan mobile number (e.g. 0771234567)'),
    password: z.string().min(6, 'Password must contain at least 6 characters'),
    confirmPassword: z.string().min(6, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setLoading(true);
    try {
      // 1. Validate Email (Deep MX/SMTP Check)
      try {
        await authService.validateEmail(data.email);
      } catch (validationErr: any) {
        const msg = validationErr.response?.data?.message || 'Invalid email address provided.';
        toast.error(msg, { duration: 5000 });
        setLoading(false);
        return; // Stop registration if email is fake
      }

      // Proceed with normal Email OTP Registration
      await authService.register(data);

      toast.success('Registration successful! Please check your email for the OTP.');

      // Navigate to verify page and pass email in state
      navigate(`/verify-otp?email=${encodeURIComponent(data.email)}`, {
        state: { email: data.email }
      });

    } catch (err: any) {
      console.error('Registration Error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex justify-center items-center px-4 py-12 bg-background dark:bg-dark-bg transition-colors duration-300">
      <div className="w-full max-w-lg bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border p-8 md:p-10 shadow-lg">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <img src={logoPng} alt="VIMSA Logo" className="h-12 w-auto mb-3" />
          <h2 className="font-outfit uppercase tracking-widest text-lg font-bold text-text-primary dark:text-white">
            Register Account
          </h2>
          <p className="text-[10px] text-text-secondary dark:text-gray-400 mt-1 uppercase font-semibold font-outfit tracking-wider">
            Join the VIMSA Elite Club
          </p>
        </div>

        {/* Form fields */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="First Name"
              type="text"
              placeholder="First name"
              error={errors.firstName?.message}
              {...register('firstName')}
            />
            <Input
              label="Last Name"
              type="text"
              placeholder="Last name"
              error={errors.lastName?.message}
              {...register('lastName')}
            />
          </div>

          <Input
            label="Email Address"
            type="email"
            placeholder="name@example.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <Controller
            name="mobileNumber"
            control={control}
            render={({ field }) => (
              <StrictNumberInput
                {...field}
                label="Mobile Number"
                maxLength={12}
                placeholder="0771234567"
                error={errors.mobileNumber?.message}
                onValueChange={(val) => field.onChange(val)}
              />
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />
            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
          </div>

          <Button type="submit" variant="primary" fullWidth isLoading={loading}>
            Create Account
          </Button>
          <div id="recaptcha-container"></div>
        </form>

        <div className="border-t border-gray-100 dark:border-dark-border mt-8 pt-6 text-center">
          <p className="text-xs text-text-secondary dark:text-gray-400 font-medium">
            Already registered at VIMSA?{' '}
            <Link
              to="/login"
              className="text-accent font-semibold hover:underline"
            >
              Sign In Instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
