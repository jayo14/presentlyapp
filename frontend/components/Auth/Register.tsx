import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft, Check } from 'lucide-react';
import { useRegister, useCurrentUser } from '../../hooks/useAuth';
import { toast } from 'sonner';
import { SEO } from '../SEO';
import { Logo } from '../Logo';
import { Button } from '../Button';
import { Input } from '../Input';
import { GoogleAuthButton } from './GoogleAuthButton';
import { getGoogleOAuthUrl } from '../../utils/authRedirect';
import { cn } from '../../src/components/ui/utils';
export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const registerMutation = useRegister();
  const { data: user, isLoading } = useCurrentUser();
  useEffect(() => {
    if (user && !isLoading) {
      navigate('/onboarding', { replace: true });
    }
  }, [user, isLoading, navigate]);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (!agreeTerms) {
      toast.error('You must agree to the Terms of Service');
      return;
    }
    registerMutation.mutate({ fullName, email, password }, {
      onSuccess: () => {
        toast.success('Account created!', {
          description: 'Please check your email to verify your account.'
        });
        navigate('/verify-email');
      },
      onError: (error: any) => {
        toast.error('Registration Failed', {
          description: error.response?.data?.email?.[0] || error.response?.data?.detail || 'Something went wrong.'
        });
      }
    });
  };

  const handleGoogleSignUp = () => {
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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 md:p-6 relative overflow-hidden">
      <SEO title="Join Presently" description="Create your Presently account." />
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
      <div className="w-full max-w-md relative z-10 py-8 md:py-12">
        <div className="text-center mb-12 md:mb-16 space-y-3">
          <Logo className="justify-center mb-6" />
          <h2 className="font-display text-4xl md:text-5xl font-bold text-on-surface">Create Account</h2>
          <p className="text-textMuted text-base md:text-lg">Join Nigeria's most trusted academic platform.</p>
        </div>
        {/* Skeuomorphic card with shadow and depth */}
        <div className="bg-surface p-8 md:p-10 rounded-3xl shadow-2xl border border-outline/50 relative overflow-hidden">
          {/* Subtle top highlight for skeuomorphism */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

          <form onSubmit={handleSubmit} className="space-y-8">
            <Input
              label="Full Name"
              type="text"
              placeholder="John Doe"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="name@university.edu"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="space-y-3">
              <label className="text-sm font-semibold text-on-surface px-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-[52px] pl-12 pr-12 bg-surface-container border border-outline placeholder:text-textMuted text-on-surface focus:border-primary focus:ring-4 focus:ring-primary/20 rounded-lg outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-textMuted hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <div className="flex items-center justify-start px-1 pt-2">
              <button
                type="button"
                onClick={() => setAgreeTerms(!agreeTerms)}
                className="flex-shrink-0 mt-0.5 group"
              >
                <div className={cn(
                  "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0",
                  agreeTerms ? "bg-primary border-primary shadow-md" : "border-outline group-hover:border-primary"
                )}>
                  {agreeTerms && <Check size={12} className="text-on-primary-fixed" />}
                </div>
              </button>
              <span className="text-xs font-medium text-on-surface leading-relaxed pt-0.5">
                I agree to the <button type="button" onClick={() => navigate('/terms')} className="text-primary font-bold hover:underline">Terms of Service</button> and <button type="button" onClick={() => navigate('/privacy')} className="text-primary font-bold hover:underline">Privacy Policy</button>.
              </span>
            </div>
            <Button
              type="submit"
              isLoading={registerMutation.isPending}
              fullWidth
              className="h-14 text-base font-semibold rounded-lg shadow-lg mt-8"
            >
              Get Started
            </Button>
          </form>

          <div className="flex items-center gap-4 my-8">
            <div className="h-px bg-outline/40 flex-1" />
            <span className="text-xs text-textMuted uppercase font-bold tracking-widest">Or continue with</span>
            <div className="h-px bg-outline/40 flex-1" />
          </div>

          <GoogleAuthButton onClick={handleGoogleSignUp} label="Sign up with Google" />
        </div>
        <p className="mt-10 text-center text-sm text-textMuted">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-primary font-bold hover:underline transition-colors"
          >
            Sign in here
          </button>
        </p>
      </div>
    </div>
  );
};