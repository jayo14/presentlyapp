import React, { useState, useEffect } from 'react';
import { ArrowLeft, Eye, EyeOff, Key, Info, CheckCircle2, X } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useResetPassword, useVerifyResetToken } from '../../hooks/useAuth';
import { SEO } from '../SEO';
import { PasswordStrengthMeter } from '../PasswordStrengthMeter';
import { ConfettiAnimation } from '../ConfettiAnimation';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

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
    if (passwordStrength < 70) return 'bg-yellow-500';
    return 'bg-[#FDB913]';
  };

  const getStrengthLabel = () => {
    if (passwordStrength < 40) return 'Weak password';
    if (passwordStrength < 70) return 'Good password';
    return 'Strong password!';
  };

  // Check password requirements
  const requirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Contains number', met: /[0-9]/.test(password) },
    { label: 'Contains special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];

  const allRequirementsMet = requirements.every(req => req.met);
  const passwordsMatch = password && confirmPassword && password === confirmPassword;
  const isPasswordValid = allRequirementsMet && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid || !uid || !token) return;
    
    resetPasswordMutation.mutate({ uid, token, newPassword: password }, {
      onSuccess: () => {
        setPageState('success');
        toast.success('Password reset successful!');
      },
      onError: (error: any) => {
        setPageState('error');
        const errorMessage = error?.response?.data?.message || 'Failed to reset password';
        toast.error(errorMessage);
      },
    });
  };

  const handleBackToLogin = () => navigate('/login', { replace: true });
  const onBack = () => navigate(-1);

  if (pageState === 'loading' || verifyTokenMutation.isPending) {
    return (
      <div className="min-h-screen bg-background-primary dark:bg-dark-background-primary flex flex-col items-center justify-center">
        <SEO title="Verifying Reset Link | Presently" />
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary dark:border-dark-primary-DEFAULT border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary dark:text-dark-text-secondary">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  if (pageState === 'invalid-link') {
    return (
      <div className="min-h-screen bg-background-primary dark:bg-dark-background-primary flex flex-col items-center justify-center p-4">
        <SEO title="Invalid Reset Link | Presently" />
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary mb-4">Invalid Reset Link</h2>
          <p className="text-text-secondary dark:text-dark-text-secondary mb-6">This password reset link is invalid or has expired.</p>
          <button
            onClick={() => navigate('/forgot-password')}
            className="px-6 py-3 bg-primary hover:bg-primary-hover dark:bg-dark-primary-DEFAULT dark:hover:bg-dark-primary-hover text-primary-foreground dark:text-dark-primary-foreground font-semibold rounded-xl transition-all"
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
    <div className="min-h-screen bg-[#3A3A2F] dark:bg-[#3A3A2F] text-white flex flex-col p-4 relative">
      <SEO title="Reset Password | Presently" />
      
      {/* Back Button */}
      <button 
        onClick={onBack} 
        className="absolute top-6 left-6 text-gray-300 hover:text-white transition-colors"
      >
        <ArrowLeft size={24} />
      </button>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md mx-auto px-4">
        {/* Heading */}
        <h2 className="text-3xl font-bold text-white mb-3 text-center">
          Create new password
        </h2>
        
        {/* Subtitle */}
        <p className="text-gray-400 mb-8 text-center">
          Your new password must be different from previous used passwords for security.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-6">
          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                autoComplete="new-password"
                className="w-full px-4 py-3 pr-12 bg-[#2A2A25] border border-[#3A3A30] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#FFD700] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Password Strength Meter */}
          {password && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-300">Password strength</span>
                <span className="font-bold text-white">{passwordStrength}%</span>
              </div>
              <div className="w-full h-2 bg-[#2A2A25] rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${
                    passwordStrength < 40 ? 'bg-red-500' : 
                    passwordStrength < 70 ? 'bg-yellow-500' : 
                    'bg-[#FFD700]'
                  }`}
                  style={{ width: `${passwordStrength}%` }}
                />
              </div>
              <div className="text-sm">
                {passwordStrength >= 70 && (
                  <span className="text-[#FFD700]">✓ {getStrengthLabel()}</span>
                )}
                {passwordStrength < 70 && passwordStrength >= 40 && (
                  <span className="text-yellow-500">{getStrengthLabel()}</span>
                )}
                {passwordStrength < 40 && password && (
                  <span className="text-red-500">{getStrengthLabel()}</span>
                )}
              </div>
            </div>
          )}

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                className="w-full px-4 py-3 pr-12 bg-[#2A2A25] border border-[#3A3A30] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#FFD700] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                aria-label="Toggle confirm password visibility"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isPasswordValid || resetPasswordMutation.isPending}
            className="w-full py-5 bg-[#FDB913] hover:bg-[#E5A912] text-black font-bold text-lg rounded-full transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed mt-12"
          >
            {resetPasswordMutation.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating Password...
              </span>
            ) : 'Update Password'}
          </button>

          {/* Cancel Link */}
          <div className="text-center">
            <button
              type="button"
              onClick={handleBackToLogin}
              className="text-[#8B7355] dark:text-dark-primary-DEFAULT hover:underline font-medium text-base"
            >
              Cancel and return to login
            </button>
          </div>

          {/* Error Message */}
          {pageState === 'error' && (
            <div className="p-3 bg-error/10 dark:bg-error-dark/10 border border-error dark:border-error-dark rounded-lg">
              <p className="text-sm text-error dark:text-error-dark text-center">
                Failed to reset password. Please try again.
              </p>
            </div>
          )}
        </form>
      </div>

      {/* Main Content - Mobile */}
      <div className="md:hidden flex-1 flex flex-col w-full max-w-md mx-auto px-6 pt-16">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary mb-2">
            Reset Password
          </h1>
          
          <h2 className="text-3xl font-bold text-text-primary dark:text-dark-text-primary mb-6">
            Create new password
          </h2>
          
          <p className="text-base text-text-secondary dark:text-dark-text-secondary">
            Your new password must be different from previous used passwords for security.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-5 flex-1">
          {/* New Password */}
          <div>
            <label className="block text-base font-bold text-text-primary dark:text-dark-text-primary mb-3">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                autoComplete="new-password"
                className="w-full px-4 py-4 pr-14 bg-background-tertiary dark:bg-dark-background-tertiary border border-border-light dark:border-dark-border-light rounded-2xl text-text-primary dark:text-dark-text-primary placeholder:text-text-tertiary dark:placeholder:dark-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-dark-primary-DEFAULT/20 focus:border-primary dark:focus:border-dark-primary-DEFAULT transition-all text-base"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-primary dark:text-dark-primary-DEFAULT transition-colors p-1"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
              </button>
            </div>
          </div>

          {/* Password Strength */}
          {password && (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-text-primary dark:text-dark-text-primary">Password strength</span>
                <span className="font-bold text-text-primary dark:text-dark-text-primary">{passwordStrength} / 100</span>
              </div>
              <div className="w-full h-2 bg-background-tertiary dark:bg-dark-background-tertiary rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${getStrengthColor()}`}
                  style={{ width: `${passwordStrength}%` }}
                ></div>
              </div>
              {passwordStrength >= 70 && (
                <div className="flex items-center gap-2 text-primary dark:text-dark-primary-DEFAULT">
                  <CheckCircle2 size={16} />
                  <span className="text-sm font-medium">{getStrengthLabel()}</span>
                </div>
              )}
            </div>
          )}

          {/* Confirm Password */}
          <div>
            <label className="block text-base font-bold text-text-primary dark:text-dark-text-primary mb-3">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                className="w-full px-4 py-4 pr-14 bg-background-tertiary dark:bg-dark-background-tertiary border border-border-light dark:border-dark-border-light rounded-2xl text-text-primary dark:text-dark-text-primary placeholder:text-text-tertiary dark:placeholder:dark-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-dark-primary-DEFAULT/20 focus:border-primary dark:focus:border-dark-primary-DEFAULT transition-all text-base"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-primary dark:text-dark-primary-DEFAULT transition-colors p-1"
                aria-label="Toggle confirm password visibility"
              >
                {showConfirmPassword ? <EyeOff size={22} /> : <Eye size={22} />}
              </button>
            </div>
          </div>

          <div className="flex-1"></div>

          {/* Error Message */}
          {pageState === 'error' && (
            <div className="p-3 bg-error/10 dark:bg-error-dark/10 border border-error dark:border-error-dark rounded-lg">
              <p className="text-sm text-error dark:text-error-dark text-center">
                Failed to reset password. Please try again.
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isPasswordValid || resetPasswordMutation.isPending}
            className="w-full py-4 bg-primary hover:bg-primary-hover dark:bg-dark-primary-DEFAULT dark:hover:bg-dark-primary-hover text-primary-foreground dark:text-dark-primary-foreground font-bold rounded-2xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {resetPasswordMutation.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating Password...
              </span>
            ) : 'Update Password'}
          </button>

          {/* Cancel Link */}
          <div className="text-center pb-6">
            <button
              type="button"
              onClick={handleBackToLogin}
              className="text-primary dark:text-dark-primary-DEFAULT hover:underline font-semibold text-base"
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
  const [showConfetti, setShowConfetti] = useState(true);
  const [cancelRedirect, setCancelRedirect] = useState(false);

  useEffect(() => {
    if (cancelRedirect) return;

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
  }, [onBackToLogin, cancelRedirect]);

  const handleCancelRedirect = () => {
    setCancelRedirect(true);
    setCountdown(0);
  };

  return (
    <div className="min-h-screen bg-[#3A3A2F] dark:bg-[#3A3A2F] text-white flex flex-col items-center justify-center p-4 relative">
      <SEO title="Password Reset Successful | Presently" />
      
      {/* Confetti Animation */}
      <ConfettiAnimation active={showConfetti} duration={3000} count={40} />

      {/* Main Content */}
      <div className="max-w-md w-full text-center flex flex-col items-center">
        {/* Success Icon with Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.1
          }}
          className="mb-8 flex justify-center"
        >
          <div className="relative">
            {/* Outer rings */}
            <div className="absolute inset-0 rounded-full bg-[#4A4A3F] opacity-20 animate-ping" style={{ animationDuration: '2s' }}></div>
            <div className="absolute inset-0 rounded-full bg-[#4A4A3F] opacity-40"></div>
            
            {/* Inner circle */}
            <div className="relative w-32 h-32 bg-[#FFD700] rounded-full flex items-center justify-center">
              <CheckCircle2 size={64} className="text-[#3A3A2F]" strokeWidth={3} />
            </div>
          </div>
        </motion.div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-white mb-4">
          Password Changed!
        </h1>

        {/* Message */}
        <p className="text-gray-400 mb-12 px-4">
          Your password has been successfully updated. You can now log in to{' '}
          <span className="text-[#FFD700] font-semibold">Presently</span>{' '}
          with your new credentials.
        </p>

        {/* Login Button */}
        <button
          onClick={onBackToLogin}
          className="w-full max-w-md py-4 bg-[#FFD700] hover:bg-[#FFE44D] text-[#2A2A25] font-bold text-lg rounded-xl transition-all shadow-lg mb-4"
        >
          Back to Login
        </button>

        {/* Countdown */}
        {!cancelRedirect && countdown > 0 && (
          <button
            onClick={handleCancelRedirect}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Redirecting in {countdown} seconds... <span className="underline">Cancel</span>
          </button>
        )}

        {cancelRedirect && (
          <p className="text-sm text-gray-500">
            Auto-redirect cancelled
          </p>
        )}
      </div>
    </div>
  );
};
