import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react';
import { useLogin, useCurrentUser } from '../../hooks/useAuth';
import { toast } from 'sonner';
import { SEO } from '../SEO';
import { Logo } from '../Logo';
import { Button } from '../Button';
import { Input } from '../Input';
import { GoogleAuthButton } from './GoogleAuthButton';
import { cn } from '../../src/components/ui/utils';
import { getGoogleOAuthUrl } from '../../utils/authRedirect';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const loginMutation = useLogin();
  const { data: user, isLoading } = useCurrentUser();

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
    const authUrl = getGoogleOAuthUrl();
    if (!authUrl) {
      toast.error('Google Auth Error', {
        description: 'Google Client ID is not configured.'
      });
      return;
    }

    window.location.href = authUrl;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Logo variant="dark" className="mb-8 scale-125" />
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="mt-4 text-textMuted font-display">Checking session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 md:p-6 relative overflow-hidden">
      <SEO title="Login | Presently" description="Sign in to your Presently account." />

      {/* Subtle gradient background */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-0 left-[20%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-[10%] w-[300px] h-[300px] bg-primary/3 rounded-full blur-3xl" />
      </div>

      <div className="absolute top-6 md:top-8 left-6 md:left-8 z-20">
        <button
          onClick={() => navigate('/')}
          className="p-3 text-on-surface hover:bg-surface-container/50 rounded-lg transition-all"
        >
          <ArrowLeft size={24} />
        </button>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-12 md:mb-16 space-y-3">
          {/* <Logo className="justify-center mb-6" /> */}
          <div className="flex items-center justify-center gap-3 group cursor-pointer ml-2">
            <img src="/logo.png" alt="Logo" className="w-32" />
            <span className="text-xl font-black tracking-tight text-on-surface">
              Presently
            </span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-on-surface">Welcome Back</h2>
          <p className="text-textMuted text-base md:text-lg">Enter your credentials to continue.</p>
        </div>

        {/* Skeuomorphic card with shadow and depth */}
        <div className="bg-surface p-8 md:p-10 rounded-3xl shadow-2xl border border-outline/50 relative overflow-hidden">
          {/* Subtle top highlight for skeuomorphism */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

          <form onSubmit={handleSubmit} className="space-y-8">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@university.edu"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            // icon={<Mail />}
            />

            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <label className="text-sm font-semibold text-on-surface">Password</label>
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-xs font-bold text-primary hover:underline transition-colors"
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
                  className="w-full h-[52px] pl-12 pr-12 bg-surface-container border border-outline placeholder:text-textMuted text-on-surface focus:border-primary focus:ring-4 focus:ring-primary/20 rounded-lg outline-none transition-all"
                />
                {/* <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted" size={20} /> */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-textMuted hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 px-1">
              <button
                type="button"
                onClick={() => setRememberMe(!rememberMe)}
                className="flex items-center gap-3 group"
              >
                <div className={cn(
                  "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0",
                  rememberMe ? "bg-primary border-primary shadow-md" : "border-outline group-hover:border-primary"
                )}>
                  {rememberMe && <CheckCircle2 size={12} className="text-on-primary-fixed" />}
                </div>
                <span className="text-sm font-medium text-on-surface">Remember me</span>
              </button>
            </div>

            <Button
              type="submit"
              isLoading={loginMutation.isPending}
              fullWidth
              className="h-14 text-base font-semibold rounded-lg shadow-lg"
            >
              Sign In
            </Button>
          </form>

          <div className="flex items-center gap-4 my-10">
            <div className="h-px bg-outline/40 flex-1" />
            <span className="text-xs text-textMuted uppercase font-bold tracking-widest">Or continue with</span>
            <div className="h-px bg-outline/40 flex-1" />
          </div>

          <GoogleAuthButton onClick={handleGoogleLogin} label="Sign in with Google" />
        </div>

        <p className="mt-10 text-center text-sm text-textMuted">
          Don't have an account?{' '}
          <button
            onClick={() => navigate('/register')}
            className="text-primary font-bold hover:underline transition-colors"
          >
            Create one for free
          </button>
        </p>
      </div>
    </div>
  );
};
