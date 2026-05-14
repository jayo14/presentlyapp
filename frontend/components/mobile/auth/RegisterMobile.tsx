import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Envelope, Lock, Eye, EyeSlash, 
  ArrowLeft, Check, CaretRight, Sparkle
} from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { useRegister, useCurrentUser } from '../../../hooks/useAuth';
import { toast } from 'sonner';
import { SEO } from '../../SEO';


export const RegisterMobile: React.FC = () => {
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
      toast.error('Please agree to the terms');
      return;
    }
    registerMutation.mutate({ fullName, email, password }, {
      onSuccess: () => {
        toast.success('Account created!', {
          description: 'Please verify your email to continue.'
        });
        navigate('/verify-email');
      },
      onError: (error: any) => {
        toast.error('Registration Failed', {
          description: error.response?.data?.email?.[0] || 'Something went wrong.'
        });
      }
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col p-6 pt-safe overflow-y-auto no-scrollbar">
      <SEO title="Join Presently" description="Create your Presently account." />

      {/* Top Bar */}
      <div className="flex items-center justify-between mb-8">
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
        <div className="w-12" />
      </div>

      {/* Header */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sungold mb-2"
        >
          <Sparkle size={20} weight="fill" />
          <span className="text-xs font-bold uppercase tracking-[0.2em]">Start Your Journey</span>
        </motion.div>
        <h1 className="text-4xl font-bold tracking-tight mb-2">Create Account</h1>
        <p className="text-on-surface-variant font-medium text-balance">Join the community of modern students and educators.</p>
      </div>

      {/* Register Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
              <User size={20} weight="duotone" />
            </div>
            <input
              type="text"
              placeholder="Full Name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full h-16 pl-12 pr-4 bg-surface-container border border-outline rounded-2xl outline-none focus:border-sungold focus:ring-4 focus:ring-sungold/10 transition-all font-medium"
            />
          </div>

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

          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
              <Lock size={20} weight="duotone" />
            </div>
            <input
              type="password"
              placeholder="Confirm Password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full h-16 pl-12 pr-4 bg-surface-container border border-outline rounded-2xl outline-none focus:border-sungold focus:ring-4 focus:ring-sungold/10 transition-all font-medium"
            />
          </div>
        </div>

        {/* Terms Agreement */}
        <div className="flex items-start gap-3 px-2 py-2">
          <button
            type="button"
            onClick={() => setAgreeTerms(!agreeTerms)}
            className="mt-1 flex-shrink-0"
          >
            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${agreeTerms ? 'bg-sungold border-sungold shadow-gold' : 'border-outline hover:border-sungold'}`}>
               {agreeTerms && <Check size={16} weight="bold" className="text-black" />}
            </div>
          </button>
          <span className="text-sm text-on-surface-variant font-medium leading-relaxed">
            I agree to the <button type="button" className="text-sungold font-bold">Terms of Service</button> and <button type="button" className="text-sungold font-bold">Privacy Policy</button>.
          </span>
        </div>

        <button
          type="submit"
          disabled={registerMutation.isPending}
          className="w-full h-16 bg-sungold text-presently-black rounded-2xl font-bold shadow-gold flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {registerMutation.isPending ? (
            <div className="w-6 h-6 border-4 border-black/20 border-t-black rounded-full animate-spin" />
          ) : (
            <>
              Get Started <CaretRight size={20} weight="bold" />
            </>
          )}
        </button>
      </form>

      {/* Footer */}
      <div className="mt-8 pb-10 text-center">
        <p className="text-on-surface-variant font-medium">
          Already have an account? {' '}
          <button 
            onClick={() => navigate('/login')}
            className="text-sungold font-bold hover:underline"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
};
