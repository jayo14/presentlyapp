import React, { useState, useEffect } from 'react';
import { ArrowLeft, Eye, EyeOff, BadgeCheck } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useResetPassword, useVerifyResetToken } from '../../hooks/useAuth';
import { SEO } from '../SEO';

type PageState = 'form' | 'success' | 'error' | 'loading' | 'invalid-link';

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [pageState, setPageState] = useState<PageState>('loading');

  const uid = searchParams.get('uid');
  const token = searchParams.get('token');

  const verifyTokenMutation = useVerifyResetToken();
  const resetPasswordMutation = useResetPassword();

  useEffect(() => {
    if (uid && token) {
      verifyTokenMutation.mutate({ uid, token }, {
        onSuccess: (data) => {
          if (data.valid) {
            setPageState('form');
          } else {
            setPageState('invalid-link');
          }
        },
        onError: () => {
          setPageState('invalid-link');
        },
      });
    } else {
      setPageState('invalid-link');
    }
  }, [uid, token]);

  // Calculate password strength
  const calculatePasswordStrength = (pwd: string): number => {
    let strength = 0;
    if (pwd.length >= 8) strength += 20;
    if (pwd.length >= 12) strength += 15;
    if (/[a-z]/.test(pwd)) strength += 20;
    if (/[A-Z]/.test(pwd)) strength += 20;
    if (/[0-9]/.test(pwd)) strength += 15;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) strength += 10;
    return Math.min(strength, 100);
  };

  const passwordStrength = calculatePasswordStrength(password);
  
  const getStrengthColor = () => {
    if (passwordStrength < 40) return 'bg-red-500';
    if (passwordStrength < 70) return 'bg-primary';
    return 'bg-primary';
  };

  const getStrengthLabel = () => {
    if (passwordStrength < 40) return 'Weak password';
    if (passwordStrength < 70) return 'Good password';
    return 'Strong password!';
  };

  const isPasswordValid = passwordStrength >= 70 && password === confirmPassword && password.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid || !uid || !token) return;
    
    resetPasswordMutation.mutate({ uid, token, newPassword: password }, {
      onSuccess: () => setPageState('success'),
      onError: () => setPageState('error'),
    });
  };

  const handleBackToLogin = () => navigate('/login', { replace: true });
  const onBack = () => navigate(-1);

  if (pageState === 'loading' || verifyTokenMutation.isPending) {
    return (
      <div className="min-h-screen bg-light-background flex flex-col items-center justify-center">
        <SEO title="Verifying Reset Link | Presently" />
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-light-text-secondary">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  if (pageState === 'invalid-link') {
    return (
      <div className="min-h-screen bg-light-background flex flex-col items-center justify-center p-4">
        <SEO title="Invalid Reset Link | Presently" />
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-light-text mb-4">Invalid Reset Link</h2>
          <p className="text-light-text-secondary mb-6">This password reset link is invalid or has expired.</p>
          <button
            onClick={() => navigate('/forgot-password')}
            className="px-6 py-3 bg-primary hover:bg-primary-hover text-light-text font-semibold rounded-full transition-all"
          >
            Request New Link
          </button>
        </div>
      </div>
    );
  }

  if (pageState === 'success') {
    return <PasswordResetSuccess onBackToLogin={handleBackToLogin} />;
  }

  return (
    <div className="min-h-screen bg-light-background flex flex-col p-4 relative">
      <SEO title="Reset Password | Presently" />
      
      {/* Back Button */}
      <button 
        onClick={onBack} 
        className="absolute top-6 left-6 text-light-text hover:text-light-text-secondary flex items-center gap-2 transition-colors"
      >
        <ArrowLeft size={20} />
      </button>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-start w-full max-w-md mx-auto px-4 pt-16">
        {/* Title and Description */}
        <div className="text-center mb-8 w-full">
          <h1 className="text-3xl font-bold text-light-text mb-4">Create new password</h1>
          <p className="text-light-text-secondary text-base">
            Your new password must be different from previous used passwords for security.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-6">
          {/* New Password */}
          <div>
            <label className="block text-sm font-semibold text-light-text mb-3">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-4 pr-12 bg-white border border-light-border rounded-xl text-light-text placeholder:text-light-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-primary hover:text-primary-dark transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Password Strength */}
          {password && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-light-text">Password strength</span>
                <span className="font-bold text-light-text">{passwordStrength} / 100</span>
              </div>
              <div className="h-2 bg-light-border rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getStrengthColor()} transition-all duration-300`}
                  style={{ width: `${passwordStrength}%` }}
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-primary font-semibold">
                {passwordStrength >= 70 && <BadgeCheck size={16} />}
                <span>{getStrengthLabel()}</span>
              </div>
            </div>
          )}

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-semibold text-light-text mb-3">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-4 pr-12 bg-white border border-light-border rounded-xl text-light-text placeholder:text-light-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-primary hover:text-primary-dark transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Password mismatch error */}
          {confirmPassword && password !== confirmPassword && (
            <p className="text-red-500 text-sm">Passwords do not match</p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isPasswordValid || resetPasswordMutation.isPending}
            className="w-full py-4 bg-primary hover:bg-primary-hover text-light-text font-bold rounded-full transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed mt-8"
          >
            {resetPasswordMutation.isPending ? 'Updating...' : 'Update Password'}
          </button>

          {/* Cancel Link */}
          <div className="text-center">
            <button
              type="button"
              onClick={handleBackToLogin}
              className="text-primary hover:underline font-semibold text-sm"
            >
              Cancel and return to login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Password Reset Success Component
const PasswordResetSuccess: React.FC<{ onBackToLogin: () => void }> = ({ onBackToLogin }) => {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onBackToLogin();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onBackToLogin]);

  return (
    <div className="min-h-screen bg-light-background flex flex-col items-center justify-center p-4">
      <SEO title="Password Reset Successful | Presently" />
      
      {/* Success Icon */}
      <div className="mb-8 flex justify-center">
        <div className="w-40 h-40 rounded-full bg-primary/10 flex items-center justify-center relative">
          <div className="w-32 h-32 rounded-full bg-primary flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-primary-dark flex items-center justify-center">
              <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Title and Message */}
      <div className="text-center max-w-md mb-8">
        <h1 className="text-4xl font-bold text-light-text mb-4">Password Reset Successful!</h1>
        <p className="text-light-text-secondary text-lg">
          Your password has been successfully updated. You can now log in to{' '}
          <span className="text-primary font-semibold">Presently</span> with your new credentials.
        </p>
      </div>

      {/* Button */}
      <button
        onClick={onBackToLogin}
        className="w-full max-w-md py-4 bg-primary hover:bg-primary-hover text-light-text font-bold rounded-full transition-all shadow-md mb-4"
      >
        Back to Login
      </button>

      {/* Countdown */}
      <p className="text-light-text-secondary text-sm">
        Redirecting you in {countdown} seconds...
      </p>
    </div>
  );
};
