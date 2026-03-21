import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Logo } from '../Logo';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '../Button';
import { useVerifyEmailOTP } from '../../hooks/useAuth';

export const VerifyEmail: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');
  const verifyEmailMutation = useVerifyEmailOTP();

  const email = searchParams.get('email');
  const otp = searchParams.get('otp');

  useEffect(() => {
    if (email && otp) {
      verifyEmailMutation.mutate({ email, otp });
    } else {
      setStatus('error');
      setMessage('Invalid verification link. Missing parameters.');
    }
  }, [email, otp]);

  useEffect(() => {
    if (verifyEmailMutation.isPending) {
      setStatus('loading');
      setMessage('Verifying your email...');
    } else if (verifyEmailMutation.isSuccess) {
      setStatus('success');
      setMessage('Email verified successfully! Redirecting...');
    } else if (verifyEmailMutation.isError) {
      setStatus('error');
      setMessage(verifyEmailMutation.error.message || 'An error occurred during verification.');
    }
  }, [verifyEmailMutation.status]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-zinc-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-8">
          <Logo className="justify-center mb-8 text-2xl" />
        </div>

        <div className="bg-background/80 backdrop-blur-xl border border-outline/50 p-8 rounded-2xl shadow-2xl">
          <div className="flex flex-col items-center text-center space-y-6">
            {status === 'loading' && (
              <>
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                  <Loader2 className="text-primary animate-spin" size={40} />
                </div>
                <div>
                  <h2 className="font-headline text-2xl font-bold text-text mb-2">Verifying Email</h2>
                  <p className="text-textMuted">{message}</p>
                </div>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                  <CheckCircle className="text-green-500" size={40} />
                </div>
                <div>
                  <h2 className="font-headline text-2xl font-bold text-text mb-2">Email Verified!</h2>
                  <p className="text-textMuted">{message}</p>
                </div>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                  <XCircle className="text-red-500" size={40} />
                </div>
                <div>
                  <h2 className="font-headline text-2xl font-bold text-text mb-2">Verification Failed</h2>
                  <p className="text-textMuted">{message}</p>
                </div>
                <div className="w-full flex flex-col gap-3 mt-4">
                  <Button 
                    onClick={() => navigate('/login')} 
                    className="w-full"
                  >
                    Go to Login
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
