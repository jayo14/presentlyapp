import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2, CheckCircle2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLogin, useGoogleAuth, useCurrentUser } from '../../hooks/useAuth';
import { toast } from 'sonner';
import { SEO } from '../SEO';
import { Logo } from '../Logo';
import { Button } from '../Button';
import { Input } from '../Input';
import { cn } from '../../src/components/ui/utils';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const loginMutation = useLogin();
  const googleAuthMutation = useGoogleAuth();
  const { data: user, isLoading } = useCurrentUser();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    const state = params.get('state');

    if (code && !isRedirecting) {
      setIsRedirecting(true);
      googleAuthMutation.mutate({ code, state }, {
        onSuccess: (data) => {
          toast.success('Logged in successfully!');
          navigate('/dashboard', { replace: true });
        },
        onError: (error: any) => {
          toast.error('Login Failed', {
            description: error.response?.data?.message || 'Failed to authenticate with Google.'
          });
          setIsRedirecting(false);
          navigate('/login', { replace: true });
        }
      });
    }
  }, [location, navigate, googleAuthMutation, isRedirecting]);

  useEffect(() => {
    if (user && !isLoading && !isRedirecting) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, isLoading, navigate, isRedirecting]);

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

  const getGoogleAuthRedirectUri = () => {
    const rawApi = (import.meta.env.VITE_API_URL || 'http://localhost:8000').trim().replace(/\/+$/, '');
    const apiBase = /\/api$/i.test(rawApi) ? rawApi : `${rawApi}/api`;
    return `${apiBase}/auth/google/callback/`;
  };

  const handleGoogleLogin = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      toast.error('Google Auth Error', {
        description: 'Google Client ID is not configured.'
      });
      return;
    }

    const redirectUri = getGoogleAuthRedirectUri();
    const scope = 'email profile';
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent`;
    window.location.href = authUrl;
  };

  if (isRedirecting || (user && isLoading)) {
    return (
      <div className="min-h-screen bg-presently-black flex flex-col items-center justify-center">
        <Logo variant="dark" className="mb-8 scale-125" />
        <Loader2 className="w-8 h-8 text-sungold animate-spin" />
        <p className="mt-4 text-slate-400 font-display">Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-ivory flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <SEO title="Login | Presently" description="Sign in to your Presently account." />

      <div className="absolute top-8 left-8 z-20">
        <button
          onClick={() => navigate('/')}
          className="p-3 text-presently-black hover:bg-black/5 rounded-full transition-all"
        >
          <ArrowLeft size={24} />
        </button>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <Logo className="justify-center mb-8" />
          <h2 className="font-display text-4xl font-bold text-presently-black mb-2">Welcome Back</h2>
          <p className="text-on-surface-variant">Enter your credentials to continue.</p>
        </div>

        <div className="bg-white p-8 md:p-10 rounded-[20px] shadow-lg border border-outline">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@university.edu"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail />}
            />

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[13px] font-semibold text-on-surface-variant">Password</label>
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-xs font-bold text-sungold hover:underline"
                >
                  Forgot?
                </button>
              </div>
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

            <div className="flex items-center gap-2 px-1">
               <button
                  type="button"
                  onClick={() => setRememberMe(!rememberMe)}
                  className="flex items-center gap-2 group"
                >
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                    rememberMe ? "bg-sungold border-sungold" : "border-[#CBD5E1] group-hover:border-sungold"
                  )}>
                    {rememberMe && <CheckCircle2 size={12} className="text-presently-black" />}
                  </div>
                  <span className="text-sm font-semibold text-on-surface-variant">Remember me</span>
               </button>
            </div>

            <Button
              type="submit"
              isLoading={loginMutation.isPending}
              fullWidth
              className="h-14 text-lg"
            >
              Sign In
            </Button>
          </form>

          <div className="flex items-center gap-4 my-8">
            <div className="h-px bg-outline flex-1" />
            <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">Or continue with</span>
            <div className="h-px bg-outline flex-1" />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <button
               onClick={handleGoogleLogin}
               className="h-14 flex items-center justify-center rounded-xl border border-outline hover:bg-slate-50 transition-all"
             >
               <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
             </button>
             <button
               className="h-14 flex items-center justify-center rounded-xl border border-outline hover:bg-slate-50 transition-all"
             >
                <svg width="20" height="20" viewBox="0 0 24 24" className="fill-presently-black">
                <path d="M17.05 20.28c-.96.95-2.45 2.1-4.05 2.1-1.45 0-2.1-.8-3.65-.8-1.55 0-2.3.75-3.6.8-1.5.05-3.1-1.25-4.15-2.85-1.95-3.15-1.5-8.25.95-11.5 1.25-1.6 2.85-2.6 4.6-2.6 1.45 0 2.3.85 3.55.85s2.1-.9 3.8-.85c1.45.05 2.75.65 3.65 1.7-3.05 1.8-2.55 6 .65 7.4-.7 1.7-1.6 3.4-2.75 4.85zM12.03 5.48c-.05-1.85 1.55-3.65 3.35-3.7.25 1.95-1.7 3.8-3.35 3.7z" />
              </svg>
             </button>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-on-surface-variant">
          Don't have an account?{' '}
          <button
            onClick={() => navigate('/register')}
            className="text-sungold font-bold hover:underline"
          >
            Create one for free
          </button>
        </p>
      </div>
    </div>
  );
};
