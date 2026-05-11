import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { authApi } from '../../services/api/auth';
import { toast } from 'sonner';
import { SEO } from '../SEO';
import { Logo } from '../Logo';
import { Button } from '../Button';
import { Input } from '../Input';
import { cn } from '../../src/components/ui/utils';

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!token || !email) {
      toast.error('Invalid reset link');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.resetPassword({ token, email, newPassword: password });
      setIsSuccess(true);
      toast.success('Password updated!', {
        description: 'You can now sign in with your new password.'
      });
    } catch (error: any) {
      toast.error('Failed to reset password', {
        description: error.response?.data?.detail || 'The link may have expired.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 md:p-6 relative overflow-hidden">
      <SEO title="New Password | Presently" description="Set a new password for your account." />

      {/* Subtle gradient background */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-0 left-[20%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-[10%] w-[300px] h-[300px] bg-primary/3 rounded-full blur-3xl" />
      </div>

      <div className="absolute top-6 md:top-8 left-6 md:left-8 z-20">
        <button
          onClick={() => navigate('/login')}
          className="p-3 text-on-surface hover:bg-surface-container/50 rounded-lg transition-all"
        >
          <ArrowLeft size={24} />
        </button>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-12 md:mb-16 space-y-3">
          <Logo className="justify-center mb-6" />
          <h2 className="font-display text-4xl md:text-5xl font-bold text-on-surface">New Password</h2>
          <p className="text-textMuted text-base md:text-lg">Choose a strong, unique password.</p>
        </div>

        {/* Claymorphic-skeuomorphic card */}
        <div className="bg-surface p-8 md:p-10 rounded-3xl shadow-2xl border border-outline/50 relative overflow-hidden">
          {/* Subtle top highlight for clay effect */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          
          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-on-surface px-1">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-[52px] pl-12 pr-12 bg-surface-container border border-outline placeholder:text-textMuted text-on-surface focus:border-primary focus:ring-4 focus:ring-primary/20 rounded-lg outline-none transition-all"
                  />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted" size={20} />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-textMuted hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <Input
                label="Confirm New Password"
                type="password"
                placeholder="••••••••"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                icon={<Lock />}
              />

              <Button
                type="submit"
                isLoading={isLoading}
                fullWidth
                className="h-14 text-base font-semibold rounded-lg shadow-lg mt-8"
              >
                Reset Password
              </Button>
            </form>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-primary/15 rounded-full flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 className="text-primary w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-on-surface mb-3">Password Updated</h3>
              <p className="text-textMuted mb-10 leading-relaxed text-base">
                Your password has been reset successfully.
              </p>
              <Button
                fullWidth
                onClick={() => navigate('/login')}
                className="h-14 rounded-lg shadow-lg"
              >
                Back to Login
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
