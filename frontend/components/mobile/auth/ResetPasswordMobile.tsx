import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Lock, Eye, EyeSlash, 
  ArrowLeft, CheckCircle, 
  CaretRight, Sparkle 
} from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { useResetPassword } from '../../../hooks/useAuth';
import { toast } from 'sonner';
import { SEO } from '../../SEO';

export const ResetPasswordMobile: React.FC = () => {
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
      toast.success('Password updated successfully!');
    } catch (error: any) {
      toast.error('Failed to reset password', {
        description: error.response?.data?.detail || 'The link may have expired.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col p-6 pt-safe overflow-y-auto no-scrollbar">
      <SEO title="Reset Password | Presently" description="Set a new password for your account." />

      {/* Top Bar */}
      <div className="flex items-center justify-between mb-12">
        <button 
          onClick={() => navigate('/login')}
          className="p-3 rounded-2xl bg-surface-container active:scale-90 transition-transform"
        >
          <ArrowLeft size={24} weight="bold" />
        </button>
        <div className="flex items-center gap-2">
           <img src="/logo.png" alt="Logo" className="w-8 h-8" />
           <span className="font-display text-xl font-bold tracking-tight">Presently</span>
        </div>
        <div className="w-12" />
      </div>

      {/* Header */}
      {!isSuccess ? (
        <>
          <div className="mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-sungold mb-2"
            >
              <Lock size={20} weight="fill" />
              <span className="text-xs font-bold uppercase tracking-[0.2em]">Security Update</span>
            </motion.div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">New Password</h1>
            <p className="text-on-surface-variant font-medium">Choose a strong, unique password to secure your account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="New Password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-20 pl-6 pr-14 bg-surface-container rounded-3xl outline-none focus:border-sungold focus:ring-4 focus:ring-sungold/10 transition-all font-bold text-lg skeuo-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-on-surface-variant p-2"
                >
                  {showPassword ? <EyeSlash size={24} weight="duotone" /> : <Eye size={24} weight="duotone" />}
                </button>
              </div>

              <div className="relative">
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full h-20 px-6 bg-surface-container rounded-3xl outline-none focus:border-sungold focus:ring-4 focus:ring-sungold/10 transition-all font-bold text-lg skeuo-input"
                />
              </div>
            </div>


            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-20 bg-sungold text-presently-black rounded-3xl font-black text-xl skeuo-button-gold flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-8 h-8 border-4 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  Update Password <CaretRight size={24} weight="bold" />
                </>
              )}
            </button>

          </form>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center mb-8"
          >
            <CheckCircle size={48} weight="fill" className="text-success" />
          </motion.div>
          <h1 className="text-3xl font-bold mb-4">Password Updated</h1>
          <p className="text-on-surface-variant font-medium mb-10 max-w-[280px]">
            Your password has been reset successfully. You can now log in with your new credentials.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full h-16 bg-sungold text-presently-black rounded-2xl font-bold shadow-gold flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
          >
            Back to Login <CaretRight size={20} weight="bold" />
          </button>
        </div>
      )}
    </div>
  );
};
