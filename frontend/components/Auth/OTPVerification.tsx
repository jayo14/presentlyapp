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
    <div className="min-h-screen bg-[#F5F5F0] dark:bg-dark-background-primary flex flex-col p-4 relative">
      <SEO title="OTP Verification | Presently" />
      
      {/* Back Button - Always visible */}
      <button 
        onClick={() => navigate(-1)} 
        className="absolute top-6 left-6 text-text-primary dark:text-dark-text-primary hover:text-text-secondary dark:hover:text-dark-text-secondary transition-colors"
      >
        <ArrowLeft size={24} strokeWidth={2.5} />
      </button>

      {/* Title at top */}
      <div className="text-center pt-6 pb-8">
        <h1 className="text-xl font-bold text-text-primary dark:text-dark-text-primary">
          OTP Verification
        </h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-start w-full max-w-md mx-auto px-4">
        {/* Header */}
        <h2 className="text-3xl md:text-4xl font-black text-text-primary dark:text-dark-text-primary mb-4 text-center">
          Enter the 6-digit code sent to your mobile
        </h2>
        <p className="text-sm text-[#8B7355] dark:text-dark-text-secondary mb-6 text-center">
          We've sent a code to {formatPhoneDisplay(phone) || email}
        </p>

        {/* OTP Input - Larger boxes */}
        <div className="flex gap-3 justify-center mb-8 mt-8" onPaste={handlePaste}>
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
              className={`w-12 h-12 md:w-14 md:h-14 text-center text-2xl font-bold bg-white dark:bg-dark-background-tertiary border-2 rounded-2xl text-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-[#FDB913]/30 dark:focus:ring-dark-primary-DEFAULT/20 transition-all ${
                digit ? 'border-[#3B82F6]' : 'border-[#E0E0E0] dark:border-dark-border-light'
              }`}
              aria-label={`Digit ${index + 1}`}
            />
          ))}
        </div>

        {/* Countdown Timer and Resend */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-5 h-5 rounded-full border-2 border-[#8B7355] dark:border-dark-text-tertiary flex items-center justify-center">
              <svg className="w-3 h-3 text-[#8B7355] dark:text-dark-text-tertiary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-[#8B7355] dark:text-dark-text-tertiary font-medium">
              Resend in {countdown < 10 ? '0' : ''}{countdown < 60 ? countdown : `${Math.floor(countdown / 60)}:${String(countdown % 60).padStart(2, '0')}`}
            </span>
          </div>
          
          {/* Time Display Boxes */}
          <div className="flex gap-4 justify-center mb-6">
            <div className="text-center">
              <div className="bg-[#F5E6B3] dark:bg-dark-background-secondary rounded-2xl px-6 py-3 mb-1">
                <span className="text-2xl font-bold text-text-primary dark:text-dark-text-primary">
                  {Math.floor(countdown / 60).toString().padStart(2, '0')}
                </span>
              </div>
              <span className="text-xs text-[#8B7355] dark:text-dark-text-tertiary">Min</span>
            </div>
            <div className="text-center">
              <div className="bg-[#F5E6B3] dark:bg-dark-background-secondary rounded-2xl px-6 py-3 mb-1">
                <span className="text-2xl font-bold text-text-primary dark:text-dark-text-primary">
                  {(countdown % 60).toString().padStart(2, '0')}
                </span>
              </div>
              <span className="text-xs text-[#8B7355] dark:text-dark-text-tertiary">Sec</span>
            </div>
          </div>
        </div>

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          disabled={!isOtpComplete || verifyMutation.isPending}
          className="w-full py-5 bg-[#FDB913] hover:bg-[#E5A912] text-black font-bold text-lg rounded-full transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed mb-6"
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
          <p className="text-sm text-text-primary dark:text-dark-text-primary font-medium mb-0">
            Didn't receive the code?
          </p>
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
