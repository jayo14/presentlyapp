import React, { useState, useEffect } from 'react';
import { Mail, ArrowLeft, Lock, Send, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../Button';
import { Input } from '../Input';
import { useRequestPasswordReset } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../SEO';
import { toast } from 'sonner';

type PageState = 'form' | 'sent' | 'error';

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [pageState, setPageState] = useState<PageState>('form');
  const [emailError, setEmailError] = useState('');
  const [lastSentTime, setLastSentTime] = useState<number | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const requestPasswordResetMutation = useRequestPasswordReset();

  // Rate limiting - 1 email per 2 minutes (120 seconds)
  const COOLDOWN_SECONDS = 120;

  useEffect(() => {
    if (lastSentTime) {
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - lastSentTime) / 1000);
        const remaining = Math.max(0, COOLDOWN_SECONDS - elapsed);
        setCooldownRemaining(remaining);
        
        if (remaining === 0) {
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [lastSentTime]);

  // Real-time email validation
  const validateEmail = (emailValue: string) => {
    if (!emailValue) {
      setEmailError('');
      return false;
    }
    
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailValue)) {
      setEmailError('Please enter a valid email address');
      return false;
    }

    // Optional: Check for university domain if configured
    // Remove .edu check to allow international institutions
    // This can be configured via environment variable if needed
    // Example: VITE_REQUIRE_EDU_EMAIL=true

    setEmailError('');
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    validateEmail(value);
  };

  const clearEmail = () => {
    setEmail('');
    setEmailError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check rate limiting
    if (cooldownRemaining > 0) {
      toast.error(`Please wait ${cooldownRemaining} seconds before requesting another link`);
      return;
    }

    if (!validateEmail(email)) {
      return;
    }

    requestPasswordResetMutation.mutate(email, {
      onSuccess: () => {
        setPageState('sent');
        setLastSentTime(Date.now());
        toast.success('Reset link sent to your email!');
      },
      onError: (error: any) => {
        setPageState('error');
        const errorMessage = error?.response?.data?.message || 'Failed to send reset link. Please try again.';
        toast.error(errorMessage);
      },
    });
  };

  const handleReset = () => {
    setEmail('');
    setEmailError('');
    requestPasswordResetMutation.reset();
    setPageState('form');
  };

  const onBack = () => navigate(-1);

  const formatCooldown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] dark:bg-dark-background-primary flex flex-col p-4 relative">
      <SEO 
        title="Forgot Password | Presently"
        description="Reset your Presently password to regain access to your account."
      />
      
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
          Forgot Password
        </h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-start justify-start w-full max-w-md mx-auto px-4">
        {/* Icon with Lock */}
        <div className="mb-8 flex justify-center w-full">
          <div className="w-24 h-24 rounded-full bg-[#F5E6B3] dark:bg-dark-primary-DEFAULT/10 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-[#FDB913] flex items-center justify-center">
              <Lock className="w-8 h-8 text-black" strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* Header */}
        <h2 className="text-3xl md:text-4xl font-black text-text-primary dark:text-dark-text-primary mb-4">
          Reset Password
        </h2>
        <p className="text-sm text-[#8B7355] dark:text-dark-text-tertiary mb-8">
          Enter your registered university email address and we'll send you a secure link to reset your password.
        </p>

        {/* Form or Status Message */}
        <div className="w-full space-y-6">
          {pageState === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div>
                <label className="block text-base font-semibold text-text-primary dark:text-dark-text-primary mb-2">
                  University Email
                </label>
                <div className="relative">
                  <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B7355] dark:text-dark-text-tertiary z-10" />
                  <input
                    type="email"
                    placeholder="name@university.edu"
                    required
                    value={email}
                    onChange={handleEmailChange}
                    disabled={requestPasswordResetMutation.isPending}
                    className={`w-full pl-12 pr-12 py-4 bg-white dark:bg-dark-background-tertiary border rounded-2xl text-text-primary dark:text-dark-text-primary placeholder:text-text-tertiary dark:placeholder:dark-text-tertiary focus:outline-none focus:ring-2 focus:ring-[#FDB913]/30 dark:focus:ring-dark-primary-DEFAULT/20 transition-all ${
                      emailError 
                        ? 'border-error dark:border-error-dark focus:border-error dark:focus:border-error-dark' 
                        : 'border-[#E0E0E0] dark:border-dark-border-light focus:border-[#FDB913] dark:focus:border-dark-primary-DEFAULT'
                    }`}
                  />
                  {/* Clear button */}
                  {email && !requestPasswordResetMutation.isPending && (
                    <button
                      type="button"
                      onClick={clearEmail}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary dark:text-dark-text-tertiary hover:text-text-primary dark:hover:text-dark-text-primary transition-colors"
                      aria-label="Clear email"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
                {emailError && (
                  <p className="mt-2 text-xs text-error dark:text-error-dark flex items-center gap-1">
                    <AlertCircle size={14} />
                    {emailError}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={requestPasswordResetMutation.isPending || !email || !!emailError || cooldownRemaining > 0}
                className="w-full py-5 bg-[#FDB913] hover:bg-[#E5A912] text-black font-bold text-lg rounded-full transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {requestPasswordResetMutation.isPending ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : cooldownRemaining > 0 ? (
                  <>Wait {formatCooldown(cooldownRemaining)}</>
                ) : (
                  'Send Reset Link'
                )}
              </button>

              {/* Support Link */}
              <div className="text-center text-sm">
                <span className="text-[#8B7355] dark:text-dark-text-tertiary">Having trouble? </span>
                <button
                  type="button"
                  className="text-[#FDB913] dark:text-dark-primary-DEFAULT hover:underline font-semibold"
                  onClick={() => window.open('mailto:support@presently.app', '_blank')}
                >
                  Contact University Support
                </button>
              </div>
            </form>
          )}

          {/* Success Status */}
          {pageState === 'sent' && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-success/10 dark:bg-success-dark/10 flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-success dark:text-success-dark" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-success dark:text-success-dark">Link sent!</h3>
                <p className="text-text-secondary dark:text-dark-text-secondary">
                  Check your email for the password reset link.
                </p>
              </div>
              <button
                onClick={handleReset}
                className="text-primary dark:text-dark-primary-DEFAULT hover:underline font-semibold"
              >
                Send to a different email
              </button>
            </div>
          )}

          {/* Error Status */}
          {pageState === 'error' && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-error/10 dark:bg-error-dark/10 flex items-center justify-center mx-auto">
                <AlertCircle className="w-10 h-10 text-error dark:text-error-dark" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-error dark:text-error-dark">Something went wrong</h3>
                <p className="text-text-secondary dark:text-dark-text-secondary">
                  We couldn't send the reset link. Please try again.
                </p>
              </div>
              <button
                onClick={handleReset}
                className="w-full py-3 bg-primary hover:bg-primary-hover dark:bg-dark-primary-DEFAULT dark:hover:bg-dark-primary-hover text-primary-foreground dark:text-dark-primary-foreground font-semibold rounded-xl transition-all"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Layout - Main Content */}
      <div className="md:hidden flex-1 flex flex-col w-full max-w-md mx-auto px-6 pt-16">
        {/* Icon with Lock and Concentric Circles */}
        <div className="mb-8 flex justify-center">
          <div className="relative w-40 h-40 flex items-center justify-center">
            {/* Outer Circle */}
            <div className="absolute w-40 h-40 rounded-full bg-primary/5 dark:bg-dark-primary-DEFAULT/5"></div>
            {/* Middle Circle */}
            <div className="absolute w-28 h-28 rounded-full bg-primary/10 dark:bg-dark-primary-DEFAULT/10"></div>
            {/* Inner Circle with Lock */}
            <div className="relative w-20 h-20 rounded-full bg-primary dark:bg-dark-primary-DEFAULT flex items-center justify-center shadow-lg">
              <Lock className="w-10 h-10 text-primary-foreground dark:text-dark-primary-foreground" strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary mb-2">
            Forgot Password
          </h1>
          
          <h2 className="text-3xl font-bold text-text-primary dark:text-dark-text-primary mb-6">
            Reset Password
          </h2>
          
          <p className="text-base text-text-secondary dark:text-dark-text-secondary px-2">
            Enter your registered university email address and we'll send you a secure link to reset your password.
          </p>
        </div>

        {/* Form Section */}
        <div className="w-full space-y-6 flex-1 flex flex-col">
          {pageState === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col">
              {/* Email Input */}
              <div>
                <label className="block text-base font-bold text-text-primary dark:text-dark-text-primary mb-3">
                  University Email
                </label>
                <div className="relative">
                  <Mail size={22} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary dark:text-dark-primary-DEFAULT z-10" />
                  <input
                    type="email"
                    placeholder="name@university.edu"
                    required
                    value={email}
                    onChange={handleEmailChange}
                    disabled={requestPasswordResetMutation.isPending}
                    className={`w-full pl-14 pr-4 py-4 bg-background-tertiary dark:bg-dark-background-tertiary border rounded-2xl text-text-primary dark:text-dark-text-primary placeholder:text-text-tertiary dark:placeholder:dark-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-dark-primary-DEFAULT/20 transition-all text-base ${
                      emailError 
                        ? 'border-error dark:border-error-dark focus:border-error dark:focus:border-error-dark' 
                        : 'border-border-light dark:border-dark-border-light focus:border-primary dark:focus:border-dark-primary-DEFAULT'
                    }`}
                  />
                </div>
                {emailError && (
                  <p className="mt-2 text-sm text-error dark:text-error-dark flex items-center gap-1">
                    <AlertCircle size={16} />
                    {emailError}
                  </p>
                )}
              </div>

              <div className="flex-1"></div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={requestPasswordResetMutation.isPending || !email || !!emailError || cooldownRemaining > 0}
                className="w-full py-4 bg-primary hover:bg-primary-hover dark:bg-dark-primary-DEFAULT dark:hover:bg-dark-primary-hover text-primary-foreground dark:text-dark-primary-foreground font-bold rounded-2xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
              >
                {requestPasswordResetMutation.isPending ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : cooldownRemaining > 0 ? (
                  <>Wait {formatCooldown(cooldownRemaining)}</>
                ) : (
                  'Send Reset Link'
                )}
              </button>

              {/* Support Link */}
              <div className="text-center text-base pb-6">
                <span className="text-text-tertiary dark:text-dark-text-tertiary">Having trouble? </span>
                <button
                  type="button"
                  className="text-primary dark:text-dark-primary-DEFAULT hover:underline font-semibold"
                  onClick={() => window.open('mailto:support@presently.app', '_blank')}
                >
                  Contact University Support
                </button>
              </div>
            </form>
          )}

          {/* Success Status */}
          {pageState === 'sent' && (
            <div className="text-center space-y-6 flex-1 flex flex-col justify-center">
              <div className="w-20 h-20 rounded-full bg-success/10 dark:bg-success-dark/10 flex items-center justify-center mx-auto">
                <CheckCircle className="w-12 h-12 text-success dark:text-success-dark" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-success dark:text-success-dark">Link sent!</h3>
                <p className="text-text-secondary dark:text-dark-text-secondary text-base">
                  Check your email for the password reset link.
                </p>
              </div>
              <button
                onClick={handleReset}
                className="text-primary dark:text-dark-primary-DEFAULT hover:underline font-semibold text-base"
              >
                Send to a different email
              </button>
            </div>
          )}

          {/* Error Status */}
          {pageState === 'error' && (
            <div className="text-center space-y-6 flex-1 flex flex-col justify-center">
              <div className="w-20 h-20 rounded-full bg-error/10 dark:bg-error-dark/10 flex items-center justify-center mx-auto">
                <AlertCircle className="w-12 h-12 text-error dark:text-error-dark" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-error dark:text-error-dark">Something went wrong</h3>
                <p className="text-text-secondary dark:text-dark-text-secondary text-base">
                  We couldn't send the reset link. Please try again.
                </p>
              </div>
              <button
                onClick={handleReset}
                className="w-full py-4 bg-primary hover:bg-primary-hover dark:bg-dark-primary-DEFAULT dark:hover:bg-dark-primary-hover text-primary-foreground dark:text-dark-primary-foreground font-semibold rounded-2xl transition-all text-lg"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
