import React, { useState, useEffect } from 'react';
import { ArrowLeft, Eye, EyeOff, CheckCircle2, Loader2, Check, X } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useResetPassword, useVerifyResetToken } from '../../hooks/useAuth';
import { SEO } from '../SEO';
import { ConfettiAnimation } from '../ConfettiAnimation';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

type PageState = 'form' | 'success' | 'error' | 'loading' | 'invalid-link';

interface PasswordResetSuccessProps {
  onBackToLogin: () => void;
}

const PasswordResetSuccess: React.FC<PasswordResetSuccessProps> = ({ onBackToLogin }) => {
  const [countdown, setCountdown] = useState(5);
  const [cancelRedirect, setCancelRedirect] = useState(false);

  useEffect(() => {
    if (cancelRedirect) return;
    if (countdown <= 0) {
      onBackToLogin();
      return;
    }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, cancelRedirect, onBackToLogin]);

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-4">
      <SEO title="Password Reset Successful | Presently" />
      <ConfettiAnimation count={40} duration={3000} colors={['#FFD700', '#22c55e', '#ffffff']} />

      <div className="w-full max-w-md bg-[#18181b] border border-[#27272a] rounded-2xl p-8 shadow-xl text-center flex flex-col items-center gap-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center"
        >
          <CheckCircle2 size={48} className="text-green-500" />
        </motion.div>

        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold text-green-400">Password Reset Successful!</h2>
          <p className="text-[#a1a1aa]">
            You can now sign in to{' '}
            <span className="text-[#FFD700] font-semibold">Presently</span>{' '}
            with your new credentials.
          </p>
        </div>

        <button
          onClick={onBackToLogin}
          className="w-full h-12 bg-[#FFD700] text-[#09090b] rounded-full font-bold hover:bg-[#FFE44D] transition-all shadow-lg"
        >
          Back to Login
        </button>

        {!cancelRedirect && countdown > 0 ? (
          <button
            onClick={() => setCancelRedirect(true)}
            className="text-sm text-[#a1a1aa] hover:text-white transition-colors"
          >
            Redirecting in {countdown} seconds...{' '}
            <span className="underline">Cancel</span>
          </button>
        ) : cancelRedirect ? (
          <p className="text-sm text-[#71717a]">Auto-redirect cancelled</p>
        ) : null}
      </div>
    </div>
  );
};

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
          setPageState(data.valid ? 'form' : 'invalid-link');
        },
        onError: () => setPageState('invalid-link'),
      });
    } else {
      setPageState('invalid-link');
    }
  }, [uid, token]);

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
    return 'bg-[#FFD700]';
  };

  const getStrengthLabel = () => {
    if (passwordStrength < 40) return 'Weak password';
    if (passwordStrength < 70) return 'Good password';
    return 'Strong password!';
  };

  const getStrengthTextColor = () => {
    if (passwordStrength < 40) return 'text-red-400';
    if (passwordStrength < 70) return 'text-yellow-400';
    return 'text-[#FFD700]';
  };

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

  if (pageState === 'loading' || verifyTokenMutation.isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090b]">
        <SEO title="Verifying Reset Link | Presently" />
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="animate-spin text-[#FFD700]" />
          <p className="text-[#a1a1aa]">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  if (pageState === 'invalid-link') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090b] p-4">
        <SEO title="Invalid Reset Link | Presently" />
        <div className="flex flex-col items-center gap-6 text-center max-w-md">
          <h2 className="text-2xl font-bold text-white">Invalid Reset Link</h2>
          <p className="text-[#a1a1aa]">This password reset link is invalid or has expired.</p>
          <button
            onClick={() => navigate('/forgot-password')}
            className="px-6 py-3 bg-[#FFD700] text-[#09090b] rounded-full font-semibold hover:bg-[#FFE44D] transition-all"
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
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center p-4 relative">
      <SEO title="Reset Password | Presently" />

      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 text-gray-300 hover:text-white transition-colors"
        aria-label="Go back"
      >
        <ArrowLeft size={20} />
      </button>

      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-2">Create new password</h2>
          <p className="text-[#a1a1aa]">
            Your new password must be different from previously used passwords.
          </p>
        </div>

        <div className="bg-[#18181b] border border-[#27272a] p-6 rounded-2xl shadow-lg">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-5">
              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    autoComplete="new-password"
                    className="w-full h-14 pl-4 pr-12 bg-[#27272a] border border-[#3f3f46] rounded-2xl text-white placeholder-[#71717a] focus:outline-none focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors z-10"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Password Strength Meter */}
              {password && (
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-300">Password strength</span>
                    <span className="font-bold text-white">{passwordStrength}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#27272a] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${getStrengthColor()}`}
                      style={{ width: `${passwordStrength}%` }}
                    />
                  </div>
                  <p className={`text-sm ${getStrengthTextColor()}`}>
                    {passwordStrength >= 70 && '✓ '}{getStrengthLabel()}
                  </p>
                  <div className="flex flex-col gap-1 mt-1">
                    {requirements.map((req) => (
                      <div key={req.label} className="flex items-center gap-2 text-xs">
                        {req.met ? (
                          <Check size={14} className="text-green-400 flex-shrink-0" />
                        ) : (
                          <X size={14} className="text-[#71717a] flex-shrink-0" />
                        )}
                        <span className={req.met ? 'text-green-400' : 'text-[#71717a]'}>
                          {req.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className={[
                      'w-full h-14 pl-4 pr-12 bg-[#27272a] border rounded-2xl text-white placeholder-[#71717a]',
                      'focus:outline-none focus:ring-1 transition-colors',
                      confirmPassword
                        ? passwordsMatch
                          ? 'border-green-500 focus:border-green-500 focus:ring-green-500'
                          : 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : 'border-[#3f3f46] focus:border-[#FFD700] focus:ring-[#FFD700]',
                    ].join(' ')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors z-10"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {confirmPassword && (
                  <p className={`text-xs mt-1.5 ${passwordsMatch ? 'text-green-400' : 'text-red-400'}`}>
                    {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!isPasswordValid || resetPasswordMutation.isPending}
                className="w-full h-14 bg-[#FFD700] text-[#09090b] rounded-2xl font-bold text-lg hover:bg-[#FFE44D] hover:-translate-y-px active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {resetPasswordMutation.isPending ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Resetting password...</span>
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
