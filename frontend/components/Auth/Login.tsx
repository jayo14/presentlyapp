import React, { useState, useEffect } from 'react';
import { Button } from '../Button';
import { Input } from '../Input';
import { PasswordInput } from '../PasswordInput';
import { Logo } from '../Logo';
import { Mail, Lock, ArrowLeft } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLogin, useCurrentUser, useGoogleAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';
import { SEO } from '../SEO';
import { getFirebaseAuth, GoogleAuthProvider } from '../../services/firebase/config';
import { signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true); // Default to true
  const loginMutation = useLogin();
  const googleAuthMutation = useGoogleAuth();
  const { data: user, isLoading } = useCurrentUser();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const redirectTo = searchParams.get('redirect_to') || '/dashboard';
  const message = searchParams.get('message');

  // Handle redirect result
  useEffect(() => {
    if (message) {
        toast.info(message, { id: 'login-message' });
    }
  }, [message]);

  useEffect(() => {
    const handleRedirect = async () => {
      const auth = getFirebaseAuth();
      if (!auth) return;

      try {
        const result = await getRedirectResult(auth);
        if (result) {
          const idToken = await result.user.getIdToken();
          setIsRedirecting(true);
          // Use the rememberMe state to respect user's checkbox preference
          googleAuthMutation.mutate({ idToken, rememberMe }, {
            onSuccess: () => {
              toast.success('Login Successful');
            },
            onError: (error: any) => {
              setIsRedirecting(false);
              toast.error('Google Login Failed');
            }
          });
        }
      } catch (error) {
        console.error("Error getting redirect result", error);
      }
    };

    handleRedirect();
  }, [googleAuthMutation, rememberMe]);

  // Auto-redirect if user is already logged in
  useEffect(() => {
    if (user && !isLoading) {
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
    }
  }, [user, isLoading, navigate, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRedirecting(true);
    loginMutation.mutate({ email, password, rememberMe }, {
      onError: (error: any) => {
        setIsRedirecting(false);
        // Extract error message from API response
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

        toast.error('Login Failed', {
          description: errorMessage
        });
      },
      onSuccess: () => {
        toast.success('Login Successful', {
          description: 'Welcome back! Redirecting to dashboard...'
        });
      }
    });
  };

  const handleGoogleLogin = async () => {
    const auth = getFirebaseAuth();
    if (!auth) {
      toast.error('Google Auth Error', {
        description: 'Firebase is not configured properly.'
      });
      return;
    }

    try {
      const provider = new GoogleAuthProvider();
      // Use redirect instead of popup for more consistent cross-device experience
      await signInWithRedirect(auth, provider);
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user') {
        console.error('Google Auth Popup Error:', error);
        toast.error('Google Auth Error', {
          description: error.message || 'Failed to open Google login popup.'
        });
      }
    }
  };

  const onBack = () => navigate(-1);
  const onRegisterClick = () => navigate('/register');

  // Show loading state while checking auth or redirecting
  if (isLoading || isRedirecting) {
    return (
      <div className="min-h-screen bg-light-background dark:bg-dark-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary dark:border-dark-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-light-text-secondary dark:text-dark-text-secondary">{isRedirecting ? 'Redirecting to dashboard...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#3A3A2F] dark:bg-[#3A3A2F] text-white flex flex-col items-center justify-center p-4 relative">
      <SEO 
        title="Login | Presently"
        description="Sign in to your Presently account to manage attendance, track sessions, and view analytics."
      />
      
      {/* Back Button */}
      <button 
        onClick={onBack} 
        className="absolute top-6 left-6 text-gray-300 hover:text-white flex items-center gap-2 transition-colors"
      >
        <ArrowLeft size={20} />
      </button>

      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <Logo className="justify-center mb-6 text-2xl text-white" />
          <h2 className="text-3xl font-bold text-white mb-2">Welcome back</h2>
          <p className="text-gray-400">Enter your credentials to access your account.</p>
        </div>

        {/* Login Form Card */}
        <div className="bg-[#2A2A25] border border-[#3A3A30] p-6 rounded-2xl shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="email"
                  placeholder="name@university.edu"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#3A3A30] border border-[#4A4A3F] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#FFD700] transition-colors"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#3A3A30] border border-[#4A4A3F] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#FFD700] transition-colors"
                />
              </div>
            </div>
            
            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-[#4A4A3F] bg-[#3A3A30] text-[#FFD700] focus:ring-[#FFD700] focus:ring-2" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-[#FFD700] hover:text-[#FFE44D] font-medium transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full bg-[#FFD700] text-[#2A2A25] py-3 rounded-xl font-bold hover:bg-[#FFE44D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loginMutation.isPending ? (
                <>
                  <div className="w-5 h-5 border-2 border-[#2A2A25] border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="h-px bg-[#3A3A30] flex-1"></div>
            <span className="text-xs text-gray-500 uppercase">Or continue with</span>
            <div className="h-px bg-[#3A3A30] flex-1"></div>
          </div>

          {/* Google Sign In */}
          <button 
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleAuthMutation.isPending || isRedirecting}
            className="w-full bg-[#3A3A30] border border-[#4A4A3F] text-white font-medium py-3 rounded-xl flex items-center justify-center gap-3 hover:bg-[#4A4A3F] transition-colors disabled:opacity-50"
          >
            {googleAuthMutation.isPending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            Google
          </button>

          {/* Sign Up Link */}
          <div className="mt-6 text-center text-sm text-gray-400">
            Don't have an account?{' '}
            <button onClick={() => navigate('/register')} className="text-[#FFD700] font-semibold hover:text-[#FFE44D] transition-colors">
              Sign up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};