import React, { useState, useEffect } from 'react';
import { Button } from '../Button';
import { Input } from '../Input';
import { PasswordInput } from '../PasswordInput';
import { Logo } from '../Logo';
import { Mail, Lock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLogin, useCurrentUser } from '../../hooks/useAuth';
import { toast } from 'sonner';
import { SEO } from '../SEO';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const loginMutation = useLogin();
  const { data: user, isLoading } = useCurrentUser();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Auto-redirect if user is already logged in
  useEffect(() => {
    if (user && !isLoading) {
      setIsRedirecting(true);
      if (!user.onboarding_complete) {
        navigate('/onboarding', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRedirecting(true);
    loginMutation.mutate({ email, password }, {
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

  const onBack = () => navigate(-1);
  const onRegisterClick = () => navigate('/register');

  // Show loading state while checking auth or redirecting
  if (isLoading || isRedirecting) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400">{isRedirecting ? 'Redirecting to dashboard...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative">
      <SEO 
        title="Login | Presently"
        description="Sign in to your Presently account to manage attendance, track sessions, and view analytics."
      />
      <button onClick={onBack} className="absolute top-8 left-8 text-zinc-400 hover:text-white flex items-center gap-2">
        <ArrowLeft size={18} /> Back
      </button>

      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-8">
          <Logo className="justify-center mb-6 text-2xl" />
          <h2 className="text-2xl font-bold text-white">Welcome back</h2>
          <p className="text-zinc-400 mt-2">Enter your credentials to access your account.</p>
        </div>

        <div className="bg-zinc-950 border border-zinc-900 p-8 rounded-2xl shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input 
              label="Email" 
              type="email" 
              placeholder="name@university.edu" 
              icon={<Mail size={16} />} 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <PasswordInput 
              label="Password" 
              placeholder="••••••••" 
              icon={<Lock size={16} />} 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-zinc-400 cursor-pointer">
                <input type="checkbox" className="rounded border-zinc-800 bg-zinc-900 text-primary focus:ring-primary" />
                Remember me
              </label>
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-primary hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <Button type="submit" className="w-full" size="lg" isLoading={loginMutation.isPending}>
              Sign In
            </Button>
          </form>

          <div className="my-6 flex items-center gap-4">
              <div className="h-px bg-zinc-800 flex-1"></div>
              <span className="text-xs text-zinc-500 uppercase">Or continue with</span>
              <div className="h-px bg-zinc-800 flex-1"></div>
          </div>

          <button 
            type="button"
            onClick={() => {}}
            disabled={true}
            className="w-full bg-white text-black font-medium h-12 rounded-lg flex items-center justify-center gap-3 hover:bg-zinc-200 transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google
          </button>

          <div className="mt-6 text-center text-sm text-zinc-500">
            Don't have an account?{' '}
            <button onClick={() => navigate('/register')} className="text-primary font-medium hover:underline">
              Sign up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};