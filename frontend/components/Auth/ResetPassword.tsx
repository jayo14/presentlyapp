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
    return 'bg-primary';
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
    <div className="min-h-screen bg-background-primary dark:bg-dark-background-primary flex flex-col p-4 relative">
      <SEO title="Reset Password | Presently" />
      
      {/* Back Button - Desktop */}
      <button 
        onClick={onBack} 
        className="hidden md:flex absolute top-6 left-6 text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary items-center gap-2 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Back</span>
      </button>

      {/* Back Button - Mobile Only (Top Left) */}
      <button 
        onClick={onBack} 
        className="md:hidden absolute top-6 left-6 text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary transition-colors"
        aria-label="Go back"
      >
        <ArrowLeft size={24} />
      </button>

      {/* Main Content - Desktop */}
      <div className="hidden md:flex flex-1 flex-col items-center justify-start w-full max-w-md mx-auto px-4 pt-12 md:pt-16">
        {/* Header with Key Icon */}
        <div className="mb-8 flex justify-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 dark:bg-dark-primary-DEFAULT/10 flex items-center justify-center">
            <Key className="w-8 h-8 text-primary dark:text-dark-primary-DEFAULT" />
          </div>
        </div>

        {/* Title and Description */}
        <div className="text-center mb-8 w-full">
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary dark:text-dark-text-primary mb-3">
            Reset Password
          </h1>
          <h2 className="text-lg font-semibold text-text-secondary dark:text-dark-text-secondary mb-4">
            Create new password
          </h2>
          <div className="p-3 bg-warning/10 dark:bg-warning-dark/10 border border-warning dark:border-warning-dark rounded-lg" role="alert">
            <p className="text-sm text-warning dark:text-warning-dark">
              Your new password must be different from previous used passwords for security.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-6">
          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-2 flex items-center gap-2">
              New Password
              <Info className="w-4 h-4 text-text-tertiary dark:text-dark-text-tertiary" />
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                autoComplete="new-password"
                className="w-full px-4 py-3.5 pr-12 bg-background-tertiary dark:bg-dark-background-tertiary border border-border-light dark:border-dark-border-light rounded-xl text-text-primary dark:text-dark-text-primary placeholder:text-text-tertiary dark:placeholder:dark-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-dark-primary-DEFAULT/20 focus:border-primary dark:focus:border-dark-primary-DEFAULT transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary dark:text-dark-text-tertiary hover:text-text-primary dark:hover:text-dark-text-primary transition-colors"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Password Strength Meter */}
          {password && (
            <PasswordStrengthMeter password={password} showRequirements={true} />
          )}

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                className="w-full px-4 py-3.5 pr-12 bg-background-tertiary dark:bg-dark-background-tertiary border border-border-light dark:border-dark-border-light rounded-xl text-text-primary dark:text-dark-text-primary placeholder:text-text-tertiary dark:placeholder:dark-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-dark-primary-DEFAULT/20 focus:border-primary dark:focus:border-dark-primary-DEFAULT transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary dark:text-dark-text-tertiary hover:text-text-primary dark:hover:text-dark-text-primary transition-colors"
                aria-label="Toggle confirm password visibility"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Match Indicator */}
          {confirmPassword && (
            <div className={`flex items-center gap-2 text-sm ${
              passwordsMatch 
                ? 'text-success dark:text-success-dark' 
                : 'text-error dark:text-error-dark'
            }`}>
              {passwordsMatch ? (
                <>
                  <CheckCircle2 size={16} />
                  <span>Passwords match</span>
                </>
              ) : (
                <>
                  <X size={16} />
                  <span>Passwords do not match</span>
                </>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isPasswordValid || resetPasswordMutation.isPending}
            className="w-full py-4 bg-primary hover:bg-primary-hover dark:bg-dark-primary-DEFAULT dark:hover:bg-dark-primary-hover text-primary-foreground dark:text-dark-primary-foreground font-bold rounded-xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed mt-8"
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
              className="text-primary dark:text-dark-primary-DEFAULT hover:underline font-semibold text-sm"
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
    <div className="min-h-screen bg-background-primary dark:bg-dark-background-primary flex flex-col items-center justify-center p-4 relative">
      <SEO title="Password Reset Successful | Presently" />
      
      {/* Confetti Animation */}
      <ConfettiAnimation active={showConfetti} duration={3000} count={40} />

      {/* Three Dots Menu - Mobile Only */}
      <button 
        className="md:hidden absolute top-6 right-6 text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary transition-colors"
        aria-label="Menu"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="5" r="1.5" fill="currentColor"/>
          <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
          <circle cx="12" cy="19" r="1.5" fill="currentColor"/>
        </svg>
      </button>

      {/* Desktop Layout - Hidden on mobile */}
      <div className="hidden md:block max-w-md w-full bg-background-secondary dark:bg-dark-background-secondary rounded-2xl p-8 shadow-lg text-center">
        {/* Success Icon with Animation */}
        <div className="mb-6 flex justify-center">
          <div className="w-24 h-24 rounded-full bg-success/10 dark:bg-success-dark/10 flex items-center justify-center relative">
            <div className="w-20 h-20 rounded-full bg-success/20 dark:bg-success-dark/20 flex items-center justify-center animate-pulse-ring">
              <CheckCircle2 className="w-12 h-12 text-success dark:text-success-dark animate-checkmark" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-success dark:text-success-dark mb-4">
          Password Reset Successful!
        </h1>

        {/* Message */}
        <p className="text-base text-text-secondary dark:text-dark-text-secondary mb-6">
          Your password has been successfully updated. You can now log in to{' '}
          <span className="text-primary dark:text-dark-primary-DEFAULT font-semibold">Presently</span>{' '}
          with your new credentials.
        </p>

        {/* Login Button */}
        <button
          onClick={onBackToLogin}
          className="w-full py-4 bg-primary hover:bg-primary-hover dark:bg-dark-primary-DEFAULT dark:hover:bg-dark-primary-hover text-primary-foreground dark:text-dark-primary-foreground font-bold rounded-xl transition-all shadow-md mb-4"
        >
          Back to Login
        </button>

        {/* Countdown or Cancel */}
        {!cancelRedirect && countdown > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-text-tertiary dark:text-dark-text-tertiary">
              Redirecting you in {countdown} seconds...
            </p>
            <button
              onClick={handleCancelRedirect}
              className="text-xs text-primary dark:text-dark-primary-DEFAULT hover:underline"
            >
              Cancel redirect
            </button>
          </div>
        )}

        {cancelRedirect && (
          <p className="text-sm text-text-tertiary dark:text-dark-text-tertiary">
            Auto-redirect cancelled
          </p>
        )}
      </div>

      {/* Mobile Layout - Shown only on mobile */}
      <div className="md:hidden w-full max-w-md mx-auto flex flex-col items-center justify-center flex-1 px-6">
        {/* Success Icon with Concentric Circles */}
        <div className="mb-12 flex justify-center">
          <div className="relative w-64 h-64 flex items-center justify-center">
            {/* Outer Circle */}
            <div className="absolute w-64 h-64 rounded-full bg-primary/5 dark:bg-dark-primary-DEFAULT/5"></div>
            {/* Middle Circle */}
            <div className="absolute w-48 h-48 rounded-full bg-primary/10 dark:bg-dark-primary-DEFAULT/10"></div>
            {/* Inner Circle with Checkmark */}
            <div className="relative w-32 h-32 rounded-full bg-primary dark:bg-dark-primary-DEFAULT flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-16 h-16 text-primary-foreground dark:text-dark-primary-foreground" strokeWidth={3} />
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-text-primary dark:text-dark-text-primary mb-6 text-center">
          Password Reset Successful!
        </h1>

        {/* Message */}
        <p className="text-base text-text-secondary dark:text-dark-text-secondary mb-12 text-center px-4">
          Your password has been successfully updated. You can now log in to{' '}
          <span className="text-primary dark:text-dark-primary-DEFAULT font-semibold">Presently</span>{' '}
          with your new credentials.
        </p>

        {/* Login Button */}
        <button
          onClick={onBackToLogin}
          className="w-full py-4 bg-primary hover:bg-primary-hover dark:bg-dark-primary-DEFAULT dark:hover:bg-dark-primary-hover text-primary-foreground dark:text-dark-primary-foreground font-bold rounded-2xl transition-all shadow-md mb-6 text-lg"
        >
          Back to Login
        </button>

        {/* Countdown */}
        {!cancelRedirect && countdown > 0 && (
          <p className="text-base text-text-tertiary dark:text-dark-text-tertiary text-center">
            Redirecting you in {countdown} seconds...
          </p>
        )}

        {cancelRedirect && (
          <p className="text-base text-text-tertiary dark:text-dark-text-tertiary text-center">
            Auto-redirect cancelled
          </p>
        )}
      </div>
    </div>
  );
};
