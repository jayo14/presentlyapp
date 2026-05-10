import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useRegister, useCurrentUser } from '../../hooks/useAuth';
import { toast } from 'sonner';
import { SEO } from '../SEO';
import { Logo } from '../Logo';
import { Button } from '../Button';
import { Input } from '../Input';
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

  return (
    <div className="min-h-screen bg-warm-ivory flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <SEO title="Join Presently" description="Create your Presently account." />

      <div className="absolute top-8 left-8 z-20">
        <button
          onClick={() => navigate('/')}
          className="p-3 text-presently-black hover:bg-black/5 rounded-full transition-all"
        >
          <ArrowLeft size={24} />
        </button>
      </div>

      <div className="w-full max-w-md relative z-10 py-12">
        <div className="text-center mb-10">
          <Logo className="justify-center mb-8" />
          <h2 className="font-display text-4xl font-bold text-presently-black mb-2">Create Account</h2>
          <p className="text-on-surface-variant">Join Nigeria's most trusted academic platform.</p>
        </div>

        <div className="bg-white p-8 md:p-10 rounded-[20px] shadow-lg border border-outline">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Full Name"
              type="text"
              placeholder="John Doe"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              icon={<User />}
            />

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
              <label className="text-[13px] font-semibold text-on-surface-variant px-1">Password</label>
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

            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={<Lock />}
            />

            <div className="flex items-start gap-3 px-1 pt-2">
               <button
                  type="button"
                  onClick={() => setAgreeTerms(!agreeTerms)}
                  className="flex-shrink-0 mt-0.5 group"
                >
                  <div className={cn(
                    "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all",
                    agreeTerms ? "bg-sungold border-sungold" : "border-[#CBD5E1] group-hover:border-sungold"
                  )}>
                    {agreeTerms && <CheckCircle2 size={12} className="text-presently-black" />}
                  </div>
               </button>
               <span className="text-xs font-medium text-on-surface-variant leading-relaxed">
                 I agree to the <button type="button" className="text-sungold font-bold hover:underline">Terms of Service</button> and <button type="button" className="text-sungold font-bold hover:underline">Privacy Policy</button>.
               </span>
            </div>

            <Button
              type="submit"
              isLoading={registerMutation.isPending}
              fullWidth
              className="h-14 text-lg mt-4"
            >
              Get Started
            </Button>
          </form>
        </div>

        <p className="mt-8 text-center text-sm text-on-surface-variant">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-sungold font-bold hover:underline"
          >
            Sign in here
          </button>
        </p>
      </div>
    </div>
  );
};
