import React, { useState } from 'react';
import { Mail, ArrowLeft, RotateCcw, Lock } from 'lucide-react';
import { Button } from '../Button';
import { Input } from '../Input';
import { useRequestPasswordReset } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../SEO';

type PageState = 'form' | 'sent' | 'error';

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [pageState, setPageState] = useState<PageState>('form');
  const requestPasswordResetMutation = useRequestPasswordReset();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    requestPasswordResetMutation.mutate(email, {
      onSuccess: () => setPageState('sent'),
      onError: () => setPageState('error'),
    });
  };

  const handleReset = () => {
    setEmail('');
    requestPasswordResetMutation.reset();
    setPageState('form');
  };

  const onBack = () => navigate(-1);

  return (
    <div className="min-h-screen bg-light-background flex flex-col p-4 relative">
      <SEO 
        title="Forgot Password | Presently"
        description="Reset your Presently password to regain access to your account."
      />
      
      {/* Back Button - Top Left */}
      <button 
        onClick={onBack} 
        className="absolute top-6 left-6 text-light-text hover:text-light-text-secondary flex items-center gap-2 transition-colors"
      >
        <ArrowLeft size={20} />
      </button>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md mx-auto px-4">
        {/* Icon */}
        <div className="mb-8 flex justify-center">
          <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center relative">
            <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-primary-dark flex items-center justify-center">
                <RotateCcw size={32} className="text-white" />
                <Lock size={16} className="text-white absolute" />
              </div>
            </div>
          </div>
        </div>

        {/* Title and Description */}
        <div className="text-center mb-8 w-full">
          <h1 className="text-3xl font-bold text-light-text mb-4">Reset Password</h1>
          <p className="text-light-text-secondary text-base">
            Enter your registered university email address and we'll send you a secure link to reset your password.
          </p>
        </div>

        {/* Form or Success Message */}
        <div className="w-full space-y-6">
          {pageState === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-light-text mb-3">
                  University Email
                </label>
                <div className="relative">
                  <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
                  <input
                    type="email"
                    placeholder="name@university.edu"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={requestPasswordResetMutation.isPending}
                    className="w-full pl-12 pr-4 py-4 bg-white border border-light-border rounded-xl text-light-text placeholder:text-light-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={requestPasswordResetMutation.isPending || !email}
                className="w-full py-4 bg-primary hover:bg-primary-hover text-light-text font-bold rounded-full transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {requestPasswordResetMutation.isPending ? 'Sending...' : 'Send Reset Link'}
              </button>

              <div className="text-center text-sm">
                <span className="text-light-text-secondary">Having trouble? </span>
                <button
                  type="button"
                  className="text-primary hover:underline font-semibold"
                >
                  Contact University Support
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
