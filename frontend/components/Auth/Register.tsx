import React, { useState, useEffect } from 'react';
import { Button } from '../Button';
import { Input } from '../Input';
import { PasswordInput } from '../PasswordInput';
import { Logo } from '../Logo';
import { Mail, Lock, User as UserIcon, ArrowLeft } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useRegister, useCurrentUser, useGoogleAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';
import { SEO } from '../SEO';
import { getFirebaseAuth, GoogleAuthProvider } from '../../services/firebase/config';
import { signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const registerMutation = useRegister();
  const googleAuthMutation = useGoogleAuth();
  const { data: user, isLoading } = useCurrentUser();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const redirectTo = searchParams.get('redirect_to') || '/dashboard';

  // Handle redirect result
  useEffect(() => {
    const handleRedirect = async () => {
      const auth = getFirebaseAuth();
      if (!auth) return;

      try {
        const result = await getRedirectResult(auth);
        if (result) {
          const idToken = await result.user.getIdToken();
          setIsRedirecting(true);
          googleAuthMutation.mutate(idToken, {
            onSuccess: () => {
              toast.success('Registration Successful');
            },
            onError: (error: any) => {
              setIsRedirecting(false);
              toast.error('Google Auth Failed');
            }
          });
        }
      } catch (error) {
        console.error("Error getting redirect result", error);
      }
    };

    handleRedirect();
  }, [googleAuthMutation]);

  // Auto-redirect if user is already logged in
  useEffect(() => {
    if (user && !isLoading) {
      if (!user.onboarding_complete) {
        navigate('/onboarding', { replace: true });
      } else {
        navigate(redirectTo, { replace: true });
      }
    }
  }, [user, isLoading, navigate, redirectTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate({ email, password, password2: password, full_name: name }, {
      onError: (error: any) => {
        toast.error('Registration Failed', {
          description: error.message || 'Failed to create account. Please try again.'
        });
      },
      onSuccess: () => {
        toast.success('Account Created', {
          description: 'Welcome! Setting up your account...'
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
  const onLoginClick = () => navigate('/login');

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative">
      <SEO 
        title="Register | Presently"
        description="Create a Presently account to start tracking attendance efficiently with GPS-verified check-ins."
      />
       <button onClick={onBack} className="absolute top-8 left-8 text-zinc-400 hover:text-white flex items-center gap-2">
            <ArrowLeft size={18} /> Back
        </button>

      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-8">
            <Logo className="justify-center mb-6 text-2xl" />
            <h2 className="text-2xl font-bold text-white">Create an account</h2>
            <p className="text-zinc-400 mt-2">Get started with smart attendance management.</p>
        </div>

        <div className="bg-zinc-950 border border-zinc-900 p-8 rounded-2xl shadow-2xl">
          {registerMutation.error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {registerMutation.error.message}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input 
                label="Full Name" 
                type="text" 
                placeholder="John Doe" 
                icon={<UserIcon size={16} />} 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
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
            
            <p className="text-xs text-zinc-500">
                By clicking "Create Account", you agree to our <a href="#" className="underline">Terms</a> and <a href="#" className="underline">Privacy Policy</a>.
            </p>

            <Button type="submit" className="w-full" size="lg" isLoading={registerMutation.isPending}>
              Create Account
            </Button>
          </form>

          <div className="my-6 flex items-center gap-4">
              <div className="h-px bg-zinc-800 flex-1"></div>
              <span className="text-xs text-zinc-500 uppercase">Or sign up with</span>
              <div className="h-px bg-zinc-800 flex-1"></div>
          </div>

          <button 
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleAuthMutation.isPending || isRedirecting}
            className="w-full bg-white text-black font-medium h-12 rounded-lg flex items-center justify-center gap-3 hover:bg-zinc-200 transition-colors disabled:opacity-50"
          >
            {googleAuthMutation.isPending ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
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

          <div className="mt-6 text-center text-sm text-zinc-500">
            Already have an account?{' '}
            <button onClick={onLoginClick} className="text-primary font-medium hover:underline">
              Log in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};