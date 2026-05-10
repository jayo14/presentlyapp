import React, { useState, useEffect } from 'react';
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
      setMessage('Email verified successfully!');
      setTimeout(() => navigate('/login'), 2000);
    } else if (verifyEmailMutation.isError) {
      setStatus('error');
      setMessage(verifyEmailMutation.error.message || 'An error occurred during verification.');
    }
  }, [verifyEmailMutation.status]);

  return (
    <div className="min-h-screen bg-warm-ivory flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Logo className="justify-center mb-8" />
        </div>

        <div className="bg-white p-10 rounded-[20px] shadow-lg border border-outline text-center">
          <div className="flex flex-col items-center space-y-6">
            {status === 'loading' && (
              <>
                <div className="w-20 h-20 bg-sungold/10 rounded-full flex items-center justify-center">
                  <Loader2 className="text-sungold animate-spin" size={40} />
                </div>
                <h2 className="font-display text-2xl font-bold text-presently-black">Verifying Email</h2>
                <p className="text-on-surface-variant">{message}</p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="w-20 h-20 bg-moss-green/10 rounded-full flex items-center justify-center">
                  <CheckCircle className="text-moss-green" size={40} />
                </div>
                <h2 className="font-display text-2xl font-bold text-presently-black">Email Verified!</h2>
                <p className="text-on-surface-variant">{message}</p>
                <p className="text-xs text-on-surface-variant">Redirecting you to login...</p>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="w-20 h-20 bg-soft-coral/10 rounded-full flex items-center justify-center">
                  <XCircle className="text-soft-coral" size={40} />
                </div>
                <h2 className="font-display text-2xl font-bold text-presently-black">Verification Failed</h2>
                <p className="text-on-surface-variant">{message}</p>
                <Button
                  onClick={() => navigate('/login')}
                  fullWidth
                  className="mt-6"
                >
                  Back to Login
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
