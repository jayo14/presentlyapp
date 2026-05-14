import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Envelope, Lock, Eye, EyeSlash, 
  ArrowLeft, GoogleLogo, AppleLogo, 
  CaretRight, Sparkle
} from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { useLogin, useGoogleAuth, useCurrentUser } from '../../../hooks/useAuth';
import { toast } from 'sonner';
import { SEO } from '../../SEO';


export const LoginMobile: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const loginMutation = useLogin();
  const googleAuthMutation = useGoogleAuth();
  const { data: user, isLoading } = useCurrentUser();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    const state = params.get('state');

    if (code) {
      googleAuthMutation.mutate({ code, state }, {
        onSuccess: () => {
          toast.success('Logged in successfully!');
          navigate('/dashboard', { replace: true });
        },
        onError: (error: any) => {
          toast.error('Login Failed', {
            description: error.response?.data?.message || 'Failed to authenticate with Google.'
          });
        }
      });
    }
  }, [location, navigate, googleAuthMutation]);

  useEffect(() => {
    if (user && !isLoading) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, isLoading, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password }, {
      onSuccess: () => {
        toast.success('Welcome back!');
        navigate('/dashboard');
      },
      onError: (error: any) => {
        toast.error('Login Failed', {
          description: error.response?.data?.detail || 'Invalid email or password.'
        });
      }
    });
  };

  const handleGoogleLogin = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      toast.error('Configuration Error', { description: 'Google Client ID is missing.' });
      return;
    }
    const rawApi = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
    const redirectUri = encodeURIComponent(`${rawApi}/api/auth/google/callback/`);
    const scope = encodeURIComponent('email profile');
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
    window.location.href = authUrl;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col p-6 pt-safe">
      <SEO title="Login | Presently" description="Sign in to your Presently account." />

      {/* Top Bar */}
      <div className="flex items-center justify-between mb-12">
        <button 
          onClick={() => navigate('/')}
          className="p-3 rounded-2xl bg-surface-container active:scale-90 transition-transform"
        >
          <ArrowLeft size={24} weight="bold" />
        </button>
        <div className="flex items-center gap-2">
           <img src="/logo.png" alt="Logo" className="w-8 h-8" />
           <span className="font-display text-xl font-bold tracking-tight">Presently</span>
        </div>
        <div className="w-12" /> {/* Spacer */}
      </div>

      {/* Greeting */}
      <div className="mb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sungold mb-2"
        >
          <Sparkle size={20} weight="fill" />
          <span className="text-xs font-bold uppercase tracking-[0.2em]">Welcome Back</span>
        </motion.div>
        <h1 className="text-4xl font-bold tracking-tight mb-2">Sign In</h1>
        <p className="text-on-surface-variant font-medium">Access your attendance dashboard and class schedules.</p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
              <Envelope size={20} weight="duotone" />
            </div>
            <input
              type="email"
              placeholder="Email Address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-16 pl-12 pr-4 bg-surface-container border border-outline rounded-2xl outline-none focus:border-sungold focus:ring-4 focus:ring-sungold/10 transition-all font-medium"
            />
          </div>

          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
              <Lock size={20} weight="duotone" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-16 pl-12 pr-12 bg-surface-container border border-outline rounded-2xl outline-none focus:border-sungold focus:ring-4 focus:ring-sungold/10 transition-all font-medium"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant p-2"
            >
              {showPassword ? <EyeSlash size={20} weight="duotone" /> : <Eye size={20} weight="duotone" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between px-2">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="hidden"
            />
            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${rememberMe ? 'bg-sungold border-sungold shadow-gold' : 'border-outline group-hover:border-sungold'}`}>
               {rememberMe && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-2.5 h-2.5 bg-black rounded-sm" />}
            </div>
            <span className="text-sm font-bold text-on-surface-variant">Remember Me</span>
          </label>
          <button 
            type="button"
            onClick={() => navigate('/forgot-password')}
            className="text-sm font-bold text-sungold hover:underline"
          >
            Forgot Password?
          </button>
        </div>

        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full h-16 bg-sungold text-presently-black rounded-2xl font-bold shadow-gold flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {loginMutation.isPending ? (
            <div className="w-6 h-6 border-4 border-black/20 border-t-black rounded-full animate-spin" />
          ) : (
            <>
              Continue <CaretRight size={20} weight="bold" />
            </>
          )}
        </button>
      </form>

      {/* Social Logins */}
      <div className="mt-12">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-px bg-outline/50 flex-1" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Or login with</span>
          <div className="h-px bg-outline/50 flex-1" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={handleGoogleLogin}
            className="h-16 rounded-2xl bg-surface border border-outline flex items-center justify-center gap-3 font-bold active:scale-95 transition-all"
          >
            <GoogleLogo size={24} weight="duotone" className="text-error" />
            Google
          </button>
          <button 
            className="h-16 rounded-2xl bg-surface border border-outline flex items-center justify-center gap-3 font-bold active:scale-95 transition-all"
          >
            <AppleLogo size={24} weight="fill" />
            Apple
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-8 text-center">
        <p className="text-on-surface-variant font-medium">
          New to Presently? {' '}
          <button 
            onClick={() => navigate('/register')}
            className="text-sungold font-bold hover:underline"
          >
            Create Account
          </button>
        </p>
      </div>
    </div>
  );
};
