import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { authService } from '../services/authService.ts';
import { setCredentials } from '../store/slices/authSlice.ts';
import Input from '../components/ui/Input.tsx';
import Button from '../components/ui/Button.tsx';
import logoPng from '../assets/logo.png';

const OTPVerificationPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || location.state?.email || '';

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    if (!email) {
      navigate('/register');
      return;
    }

    const interval = setInterval(() => {
      setTimer((t) => (t > 0 ? t - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [email, navigate]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) {
      toast.error('Please enter a valid 6-digit OTP code');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.verifyOTP({ email, otp });

      if (response.success) {
        dispatch(
          setCredentials({
            user: response.user,
            token: response.token,
          })
        );
        toast.success('Account verified successfully!');
        navigate('/');
      } else {
        toast.error(response.message || 'Verification failed.');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Invalid OTP Code. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const response = await authService.resendOTP(email);
      if (response.success) {
        toast.success('New OTP has been sent to your email');
        setTimer(60);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex justify-center items-center px-4 py-12 bg-background dark:bg-dark-bg transition-colors duration-300">
      <div className="w-full max-w-md bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border p-8 md:p-10 shadow-lg">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <img src={logoPng} alt="VIMSA Logo" className="h-12 w-auto mb-3" />
          <h2 className="font-outfit uppercase tracking-widest text-lg font-bold text-text-primary dark:text-white">
            Verify Your Account
          </h2>
          <p className="text-[10px] text-text-secondary dark:text-gray-400 mt-1 uppercase font-semibold font-outfit tracking-wider text-center">
            We sent an email with a 6-digit code to <br/><span className="text-accent">{email}</span>
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <Input
            label="Verification Code (OTP)"
            type="text"
            placeholder="ENTER 6-DIGIT OTP"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            className="text-center font-bold text-lg tracking-widest"
          />

          <Button type="submit" variant="primary" fullWidth isLoading={loading}>
            Verify & Login
          </Button>
        </form>

        <div className="mt-8 text-center flex flex-col items-center">
          {timer > 0 ? (
            <p className="text-xs text-text-secondary dark:text-gray-400 font-semibold font-outfit uppercase tracking-wider">
              Resend OTP code in {timer}s
            </p>
          ) : (
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-xs font-outfit uppercase tracking-widest font-extrabold text-accent hover:underline disabled:opacity-50"
            >
              {resending ? 'Resending Code...' : 'Resend OTP Code'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OTPVerificationPage;
