import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { authApi } from '../../services/api/auth';
import { toast } from 'sonner';
import { SEO } from '../SEO';
import { Logo } from '../Logo';
import { Button } from '../Button';
import { Input } from '../Input';

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
    <div className="min-h-screen bg-warm-ivory flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <SEO title="New Password | Presently" description="Set a new password for your account." />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <Logo className="justify-center mb-8" />
          <h2 className="font-display text-4xl font-bold text-presently-black mb-2">New Password</h2>
          <p className="text-on-surface-variant">Choose a strong, unique password.</p>
        </div>

        <div className="bg-white p-8 md:p-10 rounded-[20px] shadow-lg border border-outline">
          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-on-surface-variant px-1">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-[52px] pl-12 pr-12 bg-white border-1.5 border-[#CBD5E1] focus:border-sungold focus:ring-3 focus:ring-sungold/15 rounded-md outline-none transition-all"
                  />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={20} />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-sungold"
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
                className="h-14 text-lg"
              >
                Reset Password
              </Button>
            </form>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-moss-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="text-moss-green w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Password Updated</h3>
              <p className="text-on-surface-variant mb-8 leading-relaxed">
                Your password has been reset successfully.
              </p>
              <Button
                fullWidth
                onClick={() => navigate('/login')}
                className="h-14"
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
