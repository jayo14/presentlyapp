import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useRegister, useCurrentUser, useGoogleAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';
import { SEO } from '../SEO';
import { Mail, Lock, User as UserIcon, ArrowLeft, Eye, EyeOff, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { AuthBackground } from './AuthBackground';
import { getGoogleAuthRedirectUri } from '../../utils/authRedirect';
// import { ThemeToggle } from '../ThemeToggle';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const registerMutation = useRegister();
  const googleAuthMutation = useGoogleAuth();
  const { data: user, isLoading } = useCurrentUser();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const redirectTo = searchParams.get('redirect_to') || '/dashboard';

  // OAuth callback is handled by the dedicated /auth/callback route

  useEffect(() => {
    if (user && !isLoading) {
      if (!user.email_verified) {
        navigate(`/otp-verification?email=${encodeURIComponent(user.email)}`, { replace: true });
      } else if (!user.onboarding_complete) {
        navigate('/onboarding', { replace: true });
      } else {
        navigate(redirectTo, { replace: true });
      }
    }
  }, [user, isLoading, navigate, redirectTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if password is too weak
    const strength = calculatePasswordStrength(password);
    if (strength < 50) {
      toast.error('Weak Password', {
        description: 'Please use a stronger password with at least 8 characters, letters, and numbers.'
      });
      return;
    }

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

  const calculatePasswordStrength = (pwd: string) => {
    if (!pwd) return 0;

    // Common passwords list (basic check)
    const commonPasswords = ['password', '123456', '12345678', 'qwerty', 'admin', 'password123', 'Password123'];
    if (commonPasswords.includes(pwd.toLowerCase())) return 10;

    let score = 0;
    if (pwd.length >= 8) score += 25;
    if (/[A-Z]/.test(pwd)) score += 25;
    if (/[0-9]/.test(pwd)) score += 25;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 25;

    // Pattern checks
    if (/(.)\1{2,}/.test(pwd)) score -= 15; // Repeating characters (aaa)
    if (pwd.length < 6) score = Math.min(score, 15);

    return Math.max(0, Math.min(100, score));
  };

  const getStrengthColor = (score: number) => {
    if (score < 25) return 'bg-red-500';
    if (score < 50) return 'bg-orange-500';
    if (score < 75) return 'bg-yellow-500';
    if (score < 100) return 'bg-lime-500';
    return 'bg-green-500';
  };

  const getStrengthLabel = (score: number) => {
    if (score === 0) return '';
    if (score <= 10) return 'Too Common / Poor';
    if (score < 25) return 'Very Weak';
    if (score < 50) return 'Weak';
    if (score < 75) return 'Medium';
    if (score < 100) return 'Strong';
    return 'Very Strong';
  };

  const passwordStrength = calculatePasswordStrength(password);

  const handleAppleLogin = () => {
    toast.info('Apple Login', { description: 'Apple authentication is coming soon.' });
  };

  const onBack = () => navigate(-1);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="animate-spin text-primary" />
          <p className="text-textMuted">Loading</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <AuthBackground />

      <SEO
        title="Register | Presently"
        description="Create a Presently account to start tracking attendance efficiently with GPS-verified check-ins."
      />

      {/* Header bar */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20">
        <button
          onClick={onBack}
          className="p-2 text-textMuted hover:text-text hover:bg-surface-container rounded-full transition-all"
          aria-label="Go back"
        >
          <ArrowLeft size={24} />
        </button>

        {/* <ThemeToggle /> */}
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="mb-10 text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-widest mb-4">
            <Sparkles size={14} />
            <span>Join Presently</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-headline font-bold mb-2 tracking-tight text-text">Create account</h2>
          <p className="text-textMuted text-lg leading-relaxed">Start tracking attendance with precision.</p>
        </div>

        <div className="skeuo-card p-8 shadow-2xl backdrop-blur-3xl">
          {registerMutation.error && (
            <div className="p-3 bg-red-500/10 border border-red-500 rounded-lg mb-4">
              <p className="text-sm text-red-500">
                {(registerMutation.error as any).message}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-bold mb-2 text-foreground/80 tracking-wide px-1">Full Name</label>
                <div className="relative group">
                  <UserIcon
                    size={20}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-sungold transition-colors z-10"
                  />
                   <input
                     type="text"
                     placeholder="John Doe"
                     required
                     value={name}
                     onChange={(e) => setName(e.target.value)}
                     className="w-full h-14 pl-12 pr-4 bg-background/50 border border-outline rounded-2xl placeholder:text-muted-foreground focus:outline-none focus:border-sungold focus:ring-1 focus:ring-sungold transition-all"
                   />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-bold mb-2 text-foreground/80 tracking-wide px-1">Email Address</label>
                <div className="relative group">
                  <Mail
                    size={20}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-sungold transition-colors z-10"
                  />
                   <input
                     type="email"
                     placeholder="name@university.edu"
                     required
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     className="w-full h-14 pl-12 pr-4 bg-background/50 border border-outline rounded-2xl placeholder:text-muted-foreground focus:outline-none focus:border-sungold focus:ring-1 focus:ring-sungold transition-all"
                   />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-bold mb-2 text-foreground/80 tracking-wide px-1">Password</label>
                <div className="relative group">
                  <Lock
                    size={20}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-sungold transition-colors z-10"
                  />
                   <input
                     type={showPassword ? 'text' : 'password'}
                     placeholder="••••••••"
                     required
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     className="w-full h-14 pl-12 pr-12 bg-background/50 border border-outline rounded-2xl placeholder:text-muted-foreground focus:outline-none focus:border-sungold focus:ring-1 focus:ring-sungold transition-all"
                   />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-sungold transition-colors z-10"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                {/* Password Strength Gauge */}
                {password && (
                  <div className="mt-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground px-1">Password Strength</span>
                      <span className={`text-[10px] font-bold ${getStrengthColor(passwordStrength).replace('bg-', 'text-')}`}>
                        {getStrengthLabel(passwordStrength)}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-foreground/5 rounded-full overflow-hidden flex gap-1">
                      {[25, 50, 75, 100].map((step) => (
                        <div
                          key={step}
                          className={`h-full flex-1 transition-all duration-500 ${passwordStrength >= step ? getStrengthColor(passwordStrength) : 'bg-white/5'
                            }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <p className="text-xs text-muted-foreground px-1 leading-relaxed">
                By clicking "Create Account", you agree to our{' '}
                <a href="/terms" className="underline hover:text-foreground transition-colors">Terms</a>
                {' '}and{' '}
                <a href="/privacy" className="underline hover:text-foreground transition-colors">Privacy Policy</a>.
              </p>

              <button
                type="submit"
                disabled={registerMutation.isPending}
                className="skeuo-button-gold w-full flex items-center justify-center gap-2 h-14 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {registerMutation.isPending ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>
          </form>

          <div className="flex items-center gap-4 my-8">
            <div className="h-px bg-outline flex-1" />
            <span className="text-xs text-textMuted uppercase font-bold tracking-wide">Or sign up with</span>
            <div className="h-px bg-outline flex-1" />
          </div>

          <div className="flex justify-center gap-6 mb-4">
            <button
              onClick={handleGoogleLogin}
              disabled={googleAuthMutation.isPending || isRedirecting}
              className="w-14 h-14 flex items-center justify-center rounded-full bg-surface hover:bg-surfaceVariant border transition-all disabled:opacity-50"
              aria-label="Sign up with Google"
            >
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            </button>

            <button
              onClick={handleAppleLogin}
              className="w-14 h-14 flex items-center justify-center rounded-full bg-surface hover:bg-surfaceVariant border transition-all"
              aria-label="Sign up with Apple"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" className="fill-foreground">
                <path d="M17.05 20.28c-.96.95-2.45 2.1-4.05 2.1-1.45 0-2.1-.8-3.65-.8-1.55 0-2.3.75-3.6.8-1.5.05-3.1-1.25-4.15-2.85-1.95-3.15-1.5-8.25.95-11.5 1.25-1.6 2.85-2.6 4.6-2.6 1.45 0 2.3.85 3.55.85s2.1-.9 3.8-.85c1.45.05 2.75.65 3.65 1.7-3.05 1.8-2.55 6 .65 7.4-.7 1.7-1.6 3.4-2.75 4.85zM12.03 5.48c-.05-1.85 1.55-3.65 3.35-3.7.25 1.95-1.7 3.8-3.35 3.7z" />
              </svg>
            </button>
          </div>

          <p className="mt-10 text-center text-sm text-textMuted flex items-center justify-center gap-2">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-primary font-bold hover:underline transition-colors py-1 px-2 hover:bg-primary/5 rounded-lg"
            >
              Log in
            </button>
          </p>
        </div>

        {/* Footer text */}
        <p className="mt-8 text-center text-xs text-textMuted/60 font-medium">
          &copy; {new Date().getFullYear()} Presently Inc. All rights reserved.
        </p>
      </div>
    </div>
  );
};
