import React, { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../Button';
import { Input } from '../Input';
import { Logo } from '../Logo';
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
  const onLoginClick = () => navigate('/login');

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative">
      <SEO 
        title="Forgot Password | Presently"
        description="Reset your Presently password to regain access to your account."
      />
      <button 
        onClick={onBack} 
        className="absolute top-8 left-8 text-zinc-400 hover:text-white flex items-center gap-2 transition-colors"
      >
        <ArrowLeft size={18} /> Back
      </button>

      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-8">
          <Logo className="justify-center mb-6 text-2xl" />
          <h2 className="text-2xl font-bold text-white">Reset your password</h2>
          <p className="text-zinc-400 mt-2">
            {pageState === 'form' && "Enter your email to receive a password reset link"}
            {pageState === 'sent' && "Check your email for the reset link"}
            {pageState === 'error' && "Something went wrong"}
          </p>
        </div>

        <div className="bg-zinc-950 border border-zinc-900 p-8 rounded-2xl shadow-2xl">
          {pageState === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {requestPasswordResetMutation.error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-start gap-2">
                  <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <span>{requestPasswordResetMutation.error.message}</span>
                </div>
              )}

              <Input
                label="Email Address"
                type="email"
                placeholder="name@university.edu"
                icon={<Mail size={16} />}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={requestPasswordResetMutation.isPending}
              />

              <Button
                type="submit"
                disabled={requestPasswordResetMutation.isPending || !email}
                className="w-full mt-6"
                isLoading={requestPasswordResetMutation.isPending}
              >
                Send Reset Link
              </Button>

              <div className="mt-4 text-center text-sm">
                <p className="text-zinc-400">
                  Remember your password?{' '}
                  <button
                    type="button"
                    onClick={onLoginClick}
                    className="text-primary hover:underline font-medium"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </form>
          )}

          {pageState === 'sent' && (
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-full">
                  <CheckCircle size={48} className="text-green-500" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">Email sent!</h3>
                <p className="text-zinc-400 text-sm">
                  We've sent a password reset link to <span className="font-medium text-white">{email}</span>
                </p>
              </div>
              <Button onClick={onLoginClick} className="w-full">
                Back to Sign In
              </Button>
            </div>
          )}

          {pageState === 'error' && (
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-full">
                  <AlertCircle size={48} className="text-red-500" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">Something went wrong</h3>
                <p className="text-zinc-400 text-sm">
                  {requestPasswordResetMutation.error?.message || 'We could not send a reset link.'}
                </p>
              </div>
              <Button onClick={handleReset} className="w-full">
                Try Again
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
