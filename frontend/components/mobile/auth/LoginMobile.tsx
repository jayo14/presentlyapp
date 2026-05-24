import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Eye, EyeSlash, Fingerprint, CircleNotch } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { useLogin } from '../../../hooks/useAuth';
import { SEO } from '../../SEO';
import { toast } from 'sonner';
import { GoogleAuthButton } from '../../Auth/GoogleAuthButton';
import { getGoogleOAuthUrl } from '../../../utils/authRedirect';

export const LoginMobile: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const loginMutation = useLogin();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  const handleGoogleLogin = () => {
    const authUrl = getGoogleOAuthUrl();
    if (!authUrl) {
      toast.error('Google Auth Error', {
        description: 'Google Client ID is not configured.',
      });
      return;
    }

    window.location.href = authUrl;
  };

  return (
    <div className="flex flex-col min-h-screen bg-off-white dark:bg-presently-black text-presently-black dark:text-white relative overflow-hidden">
      <SEO title="Login | Presently" />

      {/* Background styling */}
      <div className="absolute top-[-10%] right-[-10%] w-[120vw] h-[50vh] bg-sungold/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Graphic */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 pt-16 pb-10 relative z-10">
        <div className="w-24 h-24 rounded-[32px] bg-white dark:bg-charcoal border border-slate-100 dark:border-white/10 flex items-center justify-center mb-8 shadow-sm">
          <img src="/logo.png" alt="Logo" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-2 text-center">Welcome Back</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-center px-4">Sign in to access your digital campus.</p>
      </div>

      {/* Form Card sliding up */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200, delay: 0.1 }}
        className="w-full bg-white dark:bg-background rounded-t-[40px] px-6 pt-24 pb-16 shadow-2xl relative z-20 flex-shrink-0"
      >
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[12px] font-bold uppercase tracking-widest text-slate-400 pl-2">Institution Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="student@university.edu"
              className="w-full h-[60px] px-6 bg-slate-50 dark:bg-white/5 border-2 border-slate-100 dark:border-white/10 rounded-[20px] outline-none focus:border-sungold focus:shadow-[0_0_0_4px_rgba(245,197,24,0.15)] transition-all text-[16px] font-bold text-presently-black dark:text-white placeholder:font-medium placeholder:text-slate-400"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[12px] font-bold uppercase tracking-widest text-slate-400 pl-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-[60px] pl-6 pr-14 bg-slate-50 dark:bg-white/5 border-2 border-slate-100 dark:border-white/10 rounded-[20px] outline-none focus:border-sungold focus:shadow-[0_0_0_4px_rgba(245,197,24,0.15)] transition-all text-[16px] font-bold text-presently-black dark:text-white placeholder:font-medium placeholder:text-slate-400 font-mono tracking-widest"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 p-2 active:scale-90 transition-transform"
              >
                {showPassword ? <EyeSlash size={24} weight="bold" /> : <Eye size={24} weight="bold" />}
              </button>
            </div>
            <div className="flex justify-end pt-2">
              <Link to="/forgot-password" className="text-[13px] font-bold text-sungold">Forgot password?</Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full h-[64px] mt-6 bg-sungold text-presently-black rounded-2xl font-black text-lg shadow-gold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            {loginMutation.isPending ? (
              <CircleNotch size={24} className="animate-spin" />
            ) : (
              <>Sign In <ArrowRight size={24} weight="bold" /></>
            )}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="h-px bg-slate-200 dark:bg-white/10 flex-1" />
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">or</span>
          <div className="h-px bg-slate-200 dark:bg-white/10 flex-1" />
        </div>

        <GoogleAuthButton onClick={handleGoogleLogin} label="Sign in with Google" className="h-[56px] rounded-2xl" />

        <p className="text-center text-[14px] font-medium text-slate-500 dark:text-slate-400 mt-10">
          Don't have an account? <Link to="/register" className="font-bold text-presently-black dark:text-white underline decoration-sungold decoration-2 underline-offset-4">Register here</Link>
        </p>
      </motion.div>
    </div>
  );
};
