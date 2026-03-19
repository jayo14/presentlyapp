import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLogin, useCurrentUser, useGoogleAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';
import { SEO } from '../SEO';
import { getFirebaseAuth, GoogleAuthProvider } from '../../services/firebase/config';
import { signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { LoadingScreen } from '../LoadingScreen';
import { Mail, Lock, ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const loginMutation = useLogin();
  const googleAuthMutation = useGoogleAuth();
  const { data: user, isLoading } = useCurrentUser();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [hasHandledRedirect, setHasHandledRedirect] = useState(false);

  const redirectTo = searchParams.get('redirect_to') || '/dashboard';
  const message = searchParams.get('message');

  useEffect(() => {
    if (message) {
      toast.info(message, { id: 'login-message' });
    }
  }, [message]);

  useEffect(() => {
    if (hasHandledRedirect) return;

    const handleRedirect = async () => {
      const auth = getFirebaseAuth();
      if (!auth) return;

      try {
        const result = await getRedirectResult(auth);
        if (result) {
          setHasHandledRedirect(true);
          const idToken = await result.user.getIdToken();
          setIsRedirecting(true);
          googleAuthMutation.mutate({ idToken, rememberMe }, {
            onSuccess: () => {
              toast.success('Login Successful');
            },
            onError: () => {
              setIsRedirecting(false);
              toast.error('Google Login Failed');
            }
          });
        }
      } catch (error) {
        console.error('Error getting redirect result', error);
      }
    };

    handleRedirect();
  }, [hasHandledRedirect, googleAuthMutation, rememberMe]);

  useEffect(() => {
    if (!user || isLoading || isRedirecting) return;

    setIsRedirecting(true);
    const pendingCheckIn = localStorage.getItem('pending_checkin');
    const explicitRedirect = searchParams.get('redirect_to');

    if (!user.onboarding_complete) {
      navigate('/onboarding', { replace: true });
    } else if (explicitRedirect) {
      navigate(explicitRedirect, { replace: true });
    } else if (pendingCheckIn) {
      localStorage.removeItem('pending_checkin');
      navigate(`/check-in/${pendingCheckIn}`, { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }
  }, [user, isLoading, navigate, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRedirecting(true);
    loginMutation.mutate({ email, password, rememberMe }, {
      onError: (error: any) => {
        setIsRedirecting(false);
        let errorMessage = 'Invalid credentials. Please try again.';
        const errorData = error.response?.data;

        if (errorData) {
          if (errorData.errors?.non_field_errors) {
            errorMessage = errorData.errors.non_field_errors[0];
          } else if (errorData.non_field_errors) {
            errorMessage = errorData.non_field_errors[0];
          } else if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        }

        toast.error('Login Failed', { description: errorMessage });
      },
      onSuccess: () => {
        toast.success('Login Successful', {
          description: 'Welcome back! Redirecting to dashboard...'
        });
      }
    });
  };

  const handleGoogleLogin = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      toast.error('Google Auth Error', {
        description: 'Google Client ID is not configured.'
      });
      return;
    }

    const redirectUri = `${window.location.origin}/auth/callback`;
    const scope = 'email profile';
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent`;
    window.location.href = authUrl;
  };

  const handleAppleLogin = () => {
    toast.info('Apple Login', { description: 'Apple authentication is coming soon.' });
  };

  const onBack = () => navigate(-1);

  if (isRedirecting || (user && isLoading)) {
    return <LoadingScreen message="Redirecting to dashboard" />;
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center p-4 relative">
      <SEO
        title="Login | Presently"
        description="Sign in to your Presently account to manage attendance, track sessions, and view analytics."
      />

      {/* Back Button */}
      <button
        onClick={onBack}
        className="absolute top-6 left-6 text-[#a1a1aa] hover:text-white flex items-center gap-2 transition-colors z-10"
        aria-label="Go back"
      >
        <ArrowLeft size={20} />
      </button>

      <div className="w-full max-w-md">
        {/* Title */}
        <div className="mb-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-2">Welcome back</h2>
          <p className="text-[#a1a1aa]">Enter your credentials to access your account.</p>
        </div>

        {/* Login Form Card */}
        <div className="bg-[#18181b] border border-[#27272a] p-6 rounded-2xl shadow-lg">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-5">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Email</label>
                <div className="relative">
                  <Mail
                    size={20}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a1a1aa] z-10"
                  />
                  <input
                    type="email"
                    placeholder="name@university.edu"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-14 pl-12 pr-4 bg-[#27272a] border border-[#3f3f46] rounded-2xl text-white placeholder-[#71717a] focus:outline-none focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700] transition-colors"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Password</label>
                <div className="relative">
                  <Lock
                    size={20}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a1a1aa] z-10"
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-14 pl-12 pr-12 bg-[#27272a] border border-[#3f3f46] rounded-2xl text-white placeholder-[#71717a] focus:outline-none focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#a1a1aa] hover:text-[#FFD700] transition-colors z-10"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 cursor-pointer accent-[#FFD700]"
                  />
                  <span className="text-[#a1a1aa]">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-[#FFD700] font-medium hover:text-[#FFE44D] transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full h-14 bg-[#FFD700] text-[#09090b] rounded-2xl font-bold text-lg hover:bg-[#FFE44D] hover:-translate-y-px active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="h-px bg-[#27272a] flex-1" />
            <span className="text-xs text-[#71717a] uppercase font-bold tracking-wide">Or continue with</span>
            <div className="h-px bg-[#27272a] flex-1" />
          </div>

          {/* OAuth Buttons */}
          <div className="flex justify-center gap-6 mb-4">
            {/* Google */}
            <button
              onClick={handleGoogleLogin}
              disabled={googleAuthMutation.isPending || isRedirecting}
              className="w-14 h-14 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:-translate-y-0.5 transition-all disabled:opacity-50"
              aria-label="Sign in with Google"
            >
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            </button>

            {/* Apple */}
            <button
              onClick={handleAppleLogin}
              className="w-14 h-14 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:-translate-y-0.5 transition-all"
              aria-label="Sign in with Apple"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M17.05 20.28c-.96.95-2.45 2.1-4.05 2.1-1.45 0-2.1-.8-3.65-.8-1.55 0-2.3.75-3.6.8-1.5.05-3.1-1.25-4.15-2.85-1.95-3.15-1.5-8.25.95-11.5 1.25-1.6 2.85-2.6 4.6-2.6 1.45 0 2.3.85 3.55.85s2.1-.9 3.8-.85c1.45.05 2.75.65 3.65 1.7-3.05 1.8-2.55 6 .65 7.4-.7 1.7-1.6 3.4-2.75 4.85zM12.03 5.48c-.05-1.85 1.55-3.65 3.35-3.7.25 1.95-1.7 3.8-3.35 3.7z" />
              </svg>
            </button>
          </div>

          {/* Sign Up Link */}
          <p className="mt-8 text-center text-sm text-[#a1a1aa]">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/register')}
              className="text-[#FFD700] font-semibold hover:text-[#FFE44D] hover:underline transition-colors"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

