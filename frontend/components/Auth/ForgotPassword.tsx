import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, Send } from 'lucide-react';
import { authApi } from '../../services/api/auth';
import { toast } from 'sonner';
import { SEO } from '../SEO';
import { Logo } from '../Logo';
import { Button } from '../Button';
import { Input } from '../Input';

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authApi.requestPasswordReset(email);
      setIsSubmitted(true);
      toast.success('Reset link sent!', {
        description: 'Please check your email for instructions.'
      });
    } catch (error: any) {
      toast.error('Failed to send link', {
        description: error.response?.data?.detail || 'Please try again later.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-warm-ivory flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <SEO title="Reset Password | Presently" description="Recover your Presently account password." />

      <div className="absolute top-8 left-8 z-20">
        <button
          onClick={() => navigate('/login')}
          className="p-3 text-presently-black hover:bg-black/5 rounded-full transition-all"
        >
          <ArrowLeft size={24} />
        </button>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <Logo className="justify-center mb-8" />
          <h2 className="font-display text-4xl font-bold text-presently-black mb-2">Reset Password</h2>
          <p className="text-on-surface-variant">We'll send you a link to recover your account.</p>
        </div>

        <div className="bg-white p-8 md:p-10 rounded-[20px] shadow-lg border border-outline">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Email Address"
                type="email"
                placeholder="name@university.edu"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail />}
              />

              <Button
                type="submit"
                isLoading={isLoading}
                fullWidth
                className="h-14 text-lg"
              >
                Send Reset Link
              </Button>
            </form>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-sungold/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Send className="text-sungold w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Check your email</h3>
              <p className="text-on-surface-variant mb-8 leading-relaxed">
                We've sent a password reset link to <span className="font-bold text-presently-black">{email}</span>.
              </p>
              <Button
                variant="outline"
                fullWidth
                onClick={() => navigate('/login')}
                className="h-14"
              >
                Back to Login
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
