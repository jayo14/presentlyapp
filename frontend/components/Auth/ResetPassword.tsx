import React, { useState, useEffect } from 'react';
import { ArrowLeft, Eye, EyeOff, Key, Info, CheckCircle2, X } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useResetPassword, useVerifyResetToken } from '../../hooks/useAuth';
import { SEO } from '../SEO';
import { PasswordStrengthMeter } from '../PasswordStrengthMeter';
import { ConfettiAnimation } from '../ConfettiAnimation';
import { toast } from 'sonner';

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
    <div className="min-h-screen bg-[#F5F5F0] dark:bg-dark-background-primary flex flex-col p-4 relative">
      <SEO title="Reset Password | Presently" />
      
      {/* Back Button - Always visible */}
      <button 
        onClick={onBack} 
        className="absolute top-6 left-6 text-text-primary dark:text-dark-text-primary hover:text-text-secondary dark:hover:text-dark-text-secondary transition-colors"
      >
        <ArrowLeft size={24} strokeWidth={2.5} />
      </button>

      {/* Title at top */}
      <div className="text-center pt-6 pb-8">
        <h1 className="text-xl font-bold text-text-primary dark:text-dark-text-primary">
          Reset Password
        </h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-start justify-start w-full max-w-md mx-auto px-4">
        {/* Heading */}
        <h2 className="text-3xl md:text-4xl font-black text-text-primary dark:text-dark-text-primary mb-3">
          Create new password
        </h2>
        
        {/* Subtitle */}
        <p className="text-sm text-[#8B7355] dark:text-dark-text-secondary mb-8">
          Your new password must be different from previous used passwords for security.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-6">
          {/* New Password */}
          <div>
            <label className="block text-base font-semibold text-text-primary dark:text-dark-text-primary mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                autoComplete="new-password"
                className="w-full px-4 py-4 pr-12 bg-white dark:bg-dark-background-tertiary border border-[#E0E0E0] dark:border-dark-border-light rounded-2xl text-text-primary dark:text-dark-text-primary placeholder:text-text-tertiary dark:placeholder:dark-text-tertiary focus:outline-none focus:ring-2 focus:ring-[#FDB913]/30 dark:focus:ring-dark-primary-DEFAULT/20 focus:border-[#FDB913] dark:focus:border-dark-primary-DEFAULT transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8B7355] dark:text-dark-text-tertiary hover:text-text-primary dark:hover:text-dark-text-primary transition-colors"
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
                <span className="font-medium text-text-primary dark:text-dark-text-primary">Password strength</span>
                <span className="font-bold text-text-primary dark:text-dark-text-primary">{passwordStrength} / 100</span>
              </div>
              <div className="w-full h-2 bg-[#E0E0E0] dark:bg-dark-background-tertiary rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${getStrengthColor()}`}
                  style={{ width: `${passwordStrength}%` }}
                />
              </div>
              <div className="flex items-center gap-1.5">
                {passwordStrength >= 70 && (
                  <>
                    <div className="w-5 h-5 rounded-full bg-[#FDB913] flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-[#8B7355] dark:text-dark-text-secondary">{getStrengthLabel()}</span>
                  </>
                )}
                {passwordStrength < 70 && passwordStrength >= 40 && (
                  <span className="text-sm font-medium text-yellow-600 dark:text-yellow-500">{getStrengthLabel()}</span>
                )}
                {passwordStrength < 40 && password && (
                  <span className="text-sm font-medium text-red-600 dark:text-red-500">{getStrengthLabel()}</span>
                )}
              </div>
            </div>
          )}

          {/* Confirm Password */}
          <div>
            <label className="block text-base font-semibold text-text-primary dark:text-dark-text-primary mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                className="w-full px-4 py-4 pr-12 bg-white dark:bg-dark-background-tertiary border border-[#E0E0E0] dark:border-dark-border-light rounded-2xl text-text-primary dark:text-dark-text-primary placeholder:text-text-tertiary dark:placeholder:dark-text-tertiary focus:outline-none focus:ring-2 focus:ring-[#FDB913]/30 dark:focus:ring-dark-primary-DEFAULT/20 focus:border-[#FDB913] dark:focus:border-dark-primary-DEFAULT transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8B7355] dark:text-dark-text-tertiary hover:text-text-primary dark:hover:text-dark-text-primary transition-colors"
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
    <div className="min-h-screen bg-[#F5F5F0] dark:bg-dark-background-primary flex flex-col items-center justify-center p-4 relative">
      <SEO title="Password Reset Successful | Presently" />
      
      {/* Confetti Animation */}
      <ConfettiAnimation active={showConfetti} duration={3000} count={40} />

      {/* Three dots menu at top right */}
      <div className="absolute top-8 right-8">
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-text-tertiary dark:bg-dark-text-tertiary"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-text-tertiary dark:bg-dark-text-tertiary"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-text-tertiary dark:bg-dark-text-tertiary"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md w-full text-center flex flex-col items-center">
        {/* Success Icon with concentric circles */}
        <div className="mb-8 flex justify-center">
          <div className="w-56 h-56 rounded-full bg-[#F5E6B3] dark:bg-[#F5E6B3]/20 flex items-center justify-center relative">
            <div className="w-40 h-40 rounded-full bg-[#FDB913] dark:bg-[#FDB913] flex items-center justify-center">
              <CheckCircle2 className="w-20 h-20 text-black" strokeWidth={3} />
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-black text-text-primary dark:text-dark-text-primary mb-4">
          Password Reset<br />Successful!
        </h1>

        {/* Message */}
        <p className="text-base text-text-secondary dark:text-dark-text-secondary mb-12 px-4">
          Your password has been successfully updated. You can now log in to{' '}
          <span className="text-[#FDB913] dark:text-[#FDB913] font-semibold">Presently</span>{' '}
          with your new credentials.
        </p>

        {/* Login Button */}
        <button
          onClick={onBackToLogin}
          className="w-full max-w-md py-5 bg-[#FDB913] hover:bg-[#E5A912] text-black font-bold text-lg rounded-full transition-all shadow-lg mb-4"
        >
          Back to Login
        </button>

        {/* Countdown */}
        {!cancelRedirect && countdown > 0 && (
          <p className="text-sm text-text-tertiary dark:text-dark-text-tertiary">
            Redirecting you in {countdown} seconds...
          </p>
        )}

        {cancelRedirect && (
          <p className="text-sm text-text-tertiary dark:text-dark-text-tertiary">
            Auto-redirect cancelled
          </p>
        )}
      </div>
    </div>
  );
};
