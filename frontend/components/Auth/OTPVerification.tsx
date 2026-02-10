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

  // Format countdown time
  const formatCountdown = () => {
    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;
    return seconds < 60 ? seconds : `${minutes}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#3A3A2F] dark:bg-[#3A3A2F] text-white flex flex-col p-4 relative">
      <SEO title="OTP Verification | Presently" />
      
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)} 
        className="absolute top-6 left-6 text-gray-300 hover:text-white transition-colors"
      >
        <ArrowLeft size={24} />
      </button>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-white mb-4">
            Verify your {email ? 'email' : 'phone number'}
          </h1>
          <p className="text-gray-400 mb-2">
            Enter the 6-digit code we sent to
          </p>
          <p className="text-[#FFD700] font-medium">
            {email || formatPhoneDisplay(phone)}
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
              className={`w-12 h-14 text-center text-2xl font-bold bg-[#2A2A25] border-2 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#FFD700] transition-all ${
                digit ? 'border-[#FFD700]' : 'border-[#3A3A30]'
              }`}
              aria-label={`Digit ${index + 1}`}
            />
          ))}
        </div>

        {/* Timer Display */}
        <div className="flex gap-4 justify-center mb-8">
          <div className="text-center">
            <div className="bg-[#2A2A25] rounded-xl px-6 py-3 mb-2 border border-[#3A3A30]">
              <span className="text-3xl font-bold text-white">
                {Math.floor(countdown / 60).toString().padStart(2, '0')}
              </span>
            </div>
            <span className="text-xs text-gray-400">Minutes</span>
          </div>
          <div className="flex items-center text-3xl font-bold text-gray-500 pb-8">:</div>
          <div className="text-center">
            <div className="bg-[#2A2A25] rounded-xl px-6 py-3 mb-2 border border-[#3A3A30]">
              <span className="text-3xl font-bold text-white">
                {(countdown % 60).toString().padStart(2, '0')}
              </span>
            </div>
            <span className="text-xs text-gray-400">Seconds</span>
          </div>
        </div>

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          disabled={!isOtpComplete || verifyMutation.isPending}
          className="w-full py-4 bg-[#FFD700] hover:bg-[#FFE44D] text-[#2A2A25] font-bold text-lg rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-6 flex items-center justify-center gap-2"
        >
          {verifyMutation.isPending ? (
            <>
              <div className="w-5 h-5 border-2 border-[#2A2A25] border-t-transparent rounded-full animate-spin"></div>
              Verifying...
            </>
          ) : (
            'Verify Code'
          )}
        </button>

        {/* Resend Section */}
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-2">
            Didn't receive the code?
          </p>
          <button
            onClick={handleResend}
            disabled={!canResend || resendMutation.isPending}
            className="text-[#FFD700] font-medium hover:text-[#FFE44D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resendMutation.isPending ? 'Sending...' : canResend ? 'Resend Code' : `Resend in ${countdown}s`}
          </button>
        </div>

        {/* Error Message */}
        {verifyMutation.isError && (
          <div className="mt-6 p-4 bg-red-900/20 border border-red-700 rounded-xl">
            <p className="text-sm text-red-400 text-center">
              Invalid or expired code. Please try again.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
