import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../services/authService.ts';
import Input from '../components/ui/Input.tsx';
import Button from '../components/ui/Button.tsx';
import logoPng from '../assets/logo.png';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const response = await authService.forgotPassword(email);
      if (response.success) {
        setSubmitted(true);
        toast.success('Password recovery email dispatched successfully!');
      } else {
        toast.error(response.message || 'Failed to dispatch password recovery mail.');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error occurred. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex justify-center items-center px-4 py-12 bg-background dark:bg-dark-bg transition-colors duration-300">
      <div className="w-full max-w-md bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border p-8 md:p-10 shadow-lg">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <img src={logoPng} alt="VIMSA Logo" className="h-12 w-auto mb-3" />
          <h2 className="font-outfit uppercase tracking-widest text-lg font-bold text-text-primary dark:text-white">
            Reset Password
          </h2>
          <p className="text-[10px] text-text-secondary dark:text-gray-400 mt-1 uppercase font-semibold font-outfit tracking-wider">
            Recover access to your account
          </p>
        </div>

        {submitted ? (
          <div className="text-center py-6">
            <p className="text-xs text-text-secondary dark:text-gray-400 leading-relaxed font-semibold font-outfit mb-6">
              A recovery link has been dispatched to {email}. Follow the instructions to configure a new password.
            </p>
            <Link to="/login">
              <Button variant="primary" fullWidth>
                Back To Login
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Button type="submit" variant="primary" fullWidth isLoading={loading}>
              Send Recovery Link
            </Button>
          </form>
        )}

        <div className="border-t border-gray-100 dark:border-dark-border mt-8 pt-6 text-center">
          <Link
            to="/login"
            className="text-xs font-outfit uppercase tracking-widest font-extrabold text-accent hover:underline"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
