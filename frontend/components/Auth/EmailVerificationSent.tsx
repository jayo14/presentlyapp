import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { SEO } from '../SEO';
import { Logo } from '../Logo';
import { Button } from '../Button';

export const EmailVerificationSent: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';

  return (
    <div className="min-h-screen bg-warm-ivory flex flex-col items-center justify-center p-6 relative">
      <SEO title="Verify Email | Presently" />

      <div className="absolute top-8 left-8 z-20">
        <button
          onClick={() => navigate('/login')}
          className="p-3 text-presently-black hover:bg-black/5 rounded-full transition-all"
        >
          <ArrowLeft size={24} />
        </button>
      </div>

      <div className="w-full max-w-md text-center">
        <Logo className="justify-center mb-12 scale-110" />

        <div className="bg-white p-10 rounded-[20px] shadow-lg border border-outline">
          <div className="w-20 h-20 bg-sungold/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <Send className="text-sungold w-10 h-10" />
          </div>

          <h1 className="font-display text-3xl font-bold text-presently-black mb-4">
            Verify your email
          </h1>

          <p className="text-on-surface-variant mb-10 leading-relaxed">
            We've sent a verification link to <br />
            <span className="font-bold text-presently-black">{email}</span>. <br />
            Please click the link in the email to continue.
          </p>

          <Button
            fullWidth
            onClick={() => navigate('/login')}
            className="h-14 mb-4"
          >
            Back to Login
          </Button>

          <p className="text-sm text-on-surface-variant">
            Didn't receive it? <button className="text-sungold font-bold hover:underline">Resend email</button>
          </p>
        </div>
      </div>
    </div>
  );
};
