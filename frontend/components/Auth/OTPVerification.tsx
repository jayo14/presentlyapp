import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Smartphone } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SEO } from '../SEO';
import { useVerifyEmailOTP, useResendEmailVerification } from '../../hooks/useAuth';
import { CircularProgress } from '../CircularProgress';
import { Haptics } from '@capacitor/haptics';

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

    // Haptic feedback on digit entry
    try {
      if (typeof Haptics !== 'undefined') {
        Haptics.impact({ style: 'light' });
      }
    } catch (error) {
      // Haptics not available on web or unsupported platform
      console.debug('Haptics not available:', error);
    }

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit on 6th digit
    if (index === 5 && value) {
      const completeOtp = [...newOtp];
      completeOtp[5] = value;
      if (completeOtp.every(digit => digit !== '') && email) {
        setTimeout(() => {
          verifyMutation.mutate({ email, otp: completeOtp.join('') });
        }, 300);
      }
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
  const progress = (60 - countdown) / 60 * 100;

  // Format phone number for display
  const formatPhoneDisplay = (phoneNum: string) => {
    if (!phoneNum) return '';
    const cleaned = phoneNum.replace(/\D/g, '');
    const last2 = cleaned.slice(-2);
    return `+1 (555) *** ***${last2}`;
  };

  return (
    <div className="min-h-screen bg-background-primary dark:bg-dark-background-primary flex flex-col p-4 relative">
      <SEO title="OTP Verification | Presently" />
      
      {/* Back Button - Hidden on mobile <768px */}
      <button 
        onClick={() => navigate(-1)} 
        className="hidden md:flex absolute top-6 left-6 text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary items-center gap-2 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Back</span>
      </button>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8 w-full">
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary dark:text-dark-text-primary mb-3">
            OTP Verification
          </h1>
          <p className="text-base text-text-secondary dark:text-dark-text-secondary mb-6">
            Enter the 6-digit code sent to your mobile
          </p>
          
          {/* Phone Display Card */}
          <div className="bg-background-secondary dark:bg-dark-background-secondary rounded-2xl px-6 py-4 mb-6 inline-flex items-center gap-3 shadow-sm">
            <Smartphone className="w-5 h-5 text-primary dark:text-dark-primary-DEFAULT" />
            <span className="text-lg font-semibold text-primary dark:text-dark-primary-DEFAULT">
              {formatPhoneDisplay(phone) || email}
            </span>
          </div>
        </div>

        {/* OTP Input - Larger on mobile */}
        <div className="flex gap-2 md:gap-3 justify-center mb-8" onPaste={handlePaste}>
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
              className={`w-11 h-11 mobile:w-[44px] mobile:h-[44px] md:w-14 md:h-14 text-center text-xl md:text-2xl font-bold bg-background-tertiary dark:bg-dark-background-tertiary border-2 rounded-xl md:rounded-2xl text-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-dark-primary-DEFAULT/20 transition-all ${
                digit ? 'border-primary dark:border-dark-primary-DEFAULT' : 'border-border-light dark:border-dark-border-light'
              }`}
              aria-label={`Digit ${index + 1}`}
            />
          ))}
        </div>

        {/* Circular Timer Display */}
        <div className="mb-8">
          <CircularProgress 
            percentage={progress} 
            size={100} 
            strokeWidth={8}
            className="mb-4"
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-text-primary dark:text-dark-text-primary">
                0:{countdown.toString().padStart(2, '0')}
              </div>
            </div>
          </CircularProgress>
        </div>

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          disabled={!isOtpComplete || verifyMutation.isPending}
          className="w-full py-4 bg-primary hover:bg-primary-hover dark:bg-dark-primary-DEFAULT dark:hover:bg-dark-primary-hover text-primary-foreground dark:text-dark-primary-foreground font-bold rounded-xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed mb-6"
        >
          {verifyMutation.isPending ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Verifying...
            </span>
          ) : 'Verify'}
        </button>

        {/* Footer - Resend Section */}
        <div className="text-center">
          <p className="text-sm text-text-secondary dark:text-dark-text-secondary mb-2">
            Didn't receive the code?
          </p>
          <button
            onClick={handleResend}
            disabled={!canResend || resendMutation.isPending}
            className="text-primary dark:text-dark-primary-DEFAULT hover:underline font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {resendMutation.isPending ? 'Sending...' : canResend ? 'Resend SMS' : `Resend in 0:${countdown.toString().padStart(2, '0')}`}
          </button>
        </div>

        {/* Error Message */}
        {verifyMutation.isError && (
          <div className="mt-4 p-3 bg-error/10 dark:bg-error-dark/10 border border-error dark:border-error-dark rounded-lg">
            <p className="text-sm text-error dark:text-error-dark text-center">
              Invalid or expired code. Please try again.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
