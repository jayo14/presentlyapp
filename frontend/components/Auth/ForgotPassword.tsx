import React, { useState, useEffect } from 'react';
import { Mail, ArrowLeft, Lock, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
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

  const COOLDOWN_SECONDS = 120;

  useEffect(() => {
    if (lastSentTime) {
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - lastSentTime) / 1000);
        const remaining = Math.max(0, COOLDOWN_SECONDS - elapsed);
        setCooldownRemaining(remaining);
        if (remaining === 0) clearInterval(interval);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [lastSentTime]);

  const validateEmail = (emailValue: string) => {
    if (!emailValue) { setEmailError(''); return false; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailValue)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    validateEmail(value);
  };

  const clearEmail = () => { setEmail(''); setEmailError(''); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldownRemaining > 0) {
      toast.error(`Please wait ${cooldownRemaining} seconds before requesting another link`);
      return;
    }
    if (!validateEmail(email)) return;

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

  const formatCooldown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center p-4 relative">
      <SEO
        title="Forgot Password | Presently"
        description="Reset your Presently password to regain access to your account."
      />

      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 text-gray-300 hover:text-white flex items-center gap-2 transition-colors"
        aria-label="Go back"
      >
        <ArrowLeft size={20} />
      </button>

      <div className="w-full max-w-md">
        {/* Icon + Title */}
        <div className="mb-8 text-center flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-[#FFD700] flex items-center justify-center mb-6">
            <Lock size={48} color="#09090b" strokeWidth={2.5} />
          </div>
          <h2 className="text-4xl font-bold text-white mb-2">Reset Password</h2>
          <p className="text-[#a1a1aa] text-center">
            Enter your registered university email address and we'll send you a secure link to reset your password.
          </p>
        </div>

        <div className="bg-[#18181b] border border-[#27272a] p-6 rounded-2xl shadow-lg">
          {pageState === 'form' && (
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">University Email</label>
                  <div className="relative">
                    <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280] z-10" />
                    <input
                      type="email"
                      placeholder="name@university.edu"
                      required
                      value={email}
                      onChange={handleEmailChange}
                      disabled={requestPasswordResetMutation.isPending}
                      className={[
                        'w-full h-14 pl-12 pr-12 bg-[#27272a] border rounded-2xl text-white placeholder-[#71717a]',
                        'focus:outline-none focus:ring-1 transition-colors',
                        emailError
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                          : 'border-[#3f3f46] focus:border-[#FFD700] focus:ring-[#FFD700]',
                        'disabled:opacity-50',
                      ].join(' ')}
                    />
                    {email && !requestPasswordResetMutation.isPending && (
                      <button
                        type="button"
                        onClick={clearEmail}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors z-10"
                        aria-label="Clear email"
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>
                  {emailError && (
                    <div className="flex items-center gap-1.5 mt-2 text-red-400 text-xs">
                      <AlertCircle size={14} />
                      <span>{emailError}</span>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={requestPasswordResetMutation.isPending || !email || !!emailError || cooldownRemaining > 0}
                  className="w-full h-14 bg-[#FFD700] text-[#09090b] rounded-2xl font-bold text-lg hover:bg-[#FFE44D] hover:-translate-y-px active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {requestPasswordResetMutation.isPending ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : cooldownRemaining > 0 ? (
                    `Wait ${formatCooldown(cooldownRemaining)}`
                  ) : (
                    'Send Reset Link'
                  )}
                </button>

                <p className="text-center text-sm text-[#a1a1aa] mt-2">
                  Having trouble?{' '}
                  <button
                    type="button"
                    onClick={() => window.open('mailto:support@presently.app', '_blank')}
                    className="text-[#FFD700] font-semibold hover:underline"
                  >
                    Contact Support
                  </button>
                </p>
              </div>
            </form>
          )}

          {pageState === 'sent' && (
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle size={40} className="text-green-500" />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold text-green-400">Link sent!</h3>
                <p className="text-[#a1a1aa]">Check your email for the password reset link.</p>
              </div>
              <button
                onClick={handleReset}
                className="text-[#FFD700] font-semibold hover:underline"
              >
                Send to a different email
              </button>
            </div>
          )}

          {pageState === 'error' && (
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertCircle size={40} className="text-red-500" />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold text-red-400">Something went wrong</h3>
                <p className="text-[#a1a1aa]">We couldn't send the reset link. Please try again.</p>
              </div>
              <button
                onClick={handleReset}
                className="w-full h-12 bg-[#FFD700] text-[#09090b] rounded-full font-semibold hover:bg-[#FFE44D] transition-all"
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
