import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SEO } from '../SEO';
import { useVerifyEmailOTP, useResendEmailVerification } from '../../hooks/useAuth';

export const OTPVerification: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const phone = searchParams.get('phone') || '';
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const verifyMutation = useVerifyEmailOTP();
  const resendMutation = useResendEmailVerification();

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Take only last character
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
    
    // Focus last filled input or first empty
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleVerify = () => {
    const otpCode = otp.join('');
    if (otpCode.length === 6 && email) {
      verifyMutation.mutate({ email, otp: otpCode });
    }
  };

  const handleResend = () => {
    if (canResend && email) {
      resendMutation.mutate(email, {
        onSuccess: () => {
          setCountdown(60);
          setCanResend(false);
        }
      });
    }
  };

  const isOtpComplete = otp.every(digit => digit !== '');

  return (
    <div className="min-h-screen bg-light-background flex flex-col p-4 relative">
      <SEO title="OTP Verification | Presently" />
      
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)} 
        className="absolute top-6 left-6 text-light-text hover:text-light-text-secondary flex items-center gap-2 transition-colors"
      >
        <ArrowLeft size={20} />
      </button>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md mx-auto px-4">
        {/* Title and Description */}
        <div className="text-center mb-8 w-full">
          <h1 className="text-3xl font-bold text-light-text mb-4">Enter the 6-digit code sent to your mobile</h1>
          <p className="text-primary text-base">
            We've sent a code to {phone || email}
          </p>
        </div>

        {/* OTP Input */}
        <div className="flex gap-3 justify-center mb-8" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`w-14 h-14 text-center text-2xl font-bold bg-white border-2 rounded-2xl text-light-text focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                digit ? 'border-primary' : 'border-light-border'
              }`}
              aria-label={`Digit ${index + 1}`}
            />
          ))}
        </div>

        {/* Resend Timer */}
        <div className="flex items-center gap-2 text-primary mb-8">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-semibold">
            {canResend ? 'You can resend now' : `Resend in 0:${countdown.toString().padStart(2, '0')}`}
          </span>
        </div>

        {/* Timer Display */}
        <div className="flex gap-4 mb-12">
          <div className="bg-light-card px-6 py-3 rounded-xl">
            <div className="text-2xl font-bold text-light-text">00</div>
            <div className="text-xs text-light-text-secondary">Min</div>
          </div>
          <div className="bg-light-card px-6 py-3 rounded-xl">
            <div className="text-2xl font-bold text-light-text">{countdown.toString().padStart(2, '0')}</div>
            <div className="text-xs text-light-text-secondary">Sec</div>
          </div>
        </div>

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          disabled={!isOtpComplete || verifyMutation.isPending}
          className="w-full py-4 bg-primary hover:bg-primary-hover text-light-text font-bold rounded-full transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed mb-4"
        >
          {verifyMutation.isPending ? 'Verifying...' : 'Verify'}
        </button>

        {/* Resend Link */}
        <button
          onClick={handleResend}
          disabled={!canResend || resendMutation.isPending}
          className="text-light-text hover:underline font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {resendMutation.isPending ? 'Sending...' : "Didn't receive the code?"}
        </button>
      </div>
    </div>
  );
};
