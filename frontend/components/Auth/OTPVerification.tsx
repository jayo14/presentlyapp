import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SEO } from '../SEO';
import { useVerifyEmailOTP, useResendEmailVerification } from '../../hooks/useAuth';
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
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    try {
      if (typeof Haptics !== 'undefined') Haptics.impact({ style: 'light' });
    } catch {
      // Haptics not available
    }

    if (value && index < 5) inputRefs.current[index + 1]?.focus();

    if (index === 5 && value) {
      const completeOtp = [...newOtp];
      completeOtp[5] = value;
      if (completeOtp.every(d => d !== '') && email) {
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

  const isOtpComplete = otp.every(d => d !== '');

  const formatPhoneDisplay = (phoneNum: string) => {
    if (!phoneNum) return '';
    const cleaned = phoneNum.replace(/\D/g, '');
    const last2 = cleaned.slice(-2);
    return `+1 (555) *** ***${last2}`;
  };

  const formatCountdown = () => {
    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;
    return seconds < 60 ? `${seconds}` : `${minutes}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center p-4 relative">
      <SEO title="OTP Verification | Presently" />

      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 text-gray-300 hover:text-white transition-colors"
        aria-label="Go back"
      >
        <ArrowLeft size={20} />
      </button>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Verify your {email ? 'email' : 'phone number'}
          </h1>
          <p className="text-[#a1a1aa] mb-2">Enter the 6-digit code we sent to</p>
          <p className="text-[#FFD700] font-medium">{email || formatPhoneDisplay(phone)}</p>
        </div>

        {/* OTP Inputs */}
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
              className={[
                'w-12 h-14 text-center text-2xl font-bold bg-[#18181b] rounded-xl text-white',
                'border-2 transition-all focus:outline-none focus:ring-2 focus:ring-[#FFD700]',
                digit ? 'border-[#FFD700]' : 'border-[#27272a] focus:border-[#FFD700]',
              ].join(' ')}
              aria-label={`OTP digit ${index + 1}`}
            />
          ))}
        </div>

        {/* Timer */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {!canResend ? (
            <div className="flex items-center gap-2 text-[#a1a1aa] text-sm">
              <div className="w-8 h-8 rounded-full border-2 border-[#27272a] flex items-center justify-center text-xs font-bold text-[#FFD700]">
                {formatCountdown()}
              </div>
              <span>Resend code in {formatCountdown()}s</span>
            </div>
          ) : (
            <button
              onClick={handleResend}
              disabled={resendMutation.isPending}
              className="text-[#FFD700] font-medium hover:underline disabled:opacity-50 flex items-center gap-2"
            >
              {resendMutation.isPending && <Loader2 size={16} className="animate-spin" />}
              Resend Code
            </button>
          )}
        </div>

        {/* Error Display */}
        {verifyMutation.isError && (
          <div className="p-3 bg-red-500/10 border border-red-500 rounded-lg mb-4">
            <p className="text-sm text-red-400 text-center">
              Invalid code. Please try again.
            </p>
          </div>
        )}

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          disabled={!isOtpComplete || verifyMutation.isPending}
          className="w-full h-14 bg-[#FFD700] text-[#09090b] rounded-2xl font-bold text-lg hover:bg-[#FFE44D] hover:-translate-y-px active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {verifyMutation.isPending ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              <span>Verifying...</span>
            </>
          ) : (
            'Verify Code'
          )}
        </button>
      </div>
    </div>
  );
};
