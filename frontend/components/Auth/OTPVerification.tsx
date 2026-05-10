import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ClipboardPaste, Loader2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SEO } from '../SEO';
import { useVerifyEmailOTP, useResendEmailVerification } from '../../hooks/useAuth';
import { Haptics } from '@capacitor/haptics';
import { Logo } from '../Logo';
import { Button } from '../Button';
import { cn } from '../../src/components/ui/utils';

export const OTPVerification: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';

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
      if (typeof Haptics !== 'undefined') {
        Haptics.impact({ style: 'light' }).catch(() => {});
      }
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

  const handlePasteFromClipboard = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      const digits = clipboardText.replace(/\D/g, '').slice(0, 6);
      if (!digits) return;

      const newOtp = ['', '', '', '', '', ''];
      for (let i = 0; i < digits.length; i += 1) {
        newOtp[i] = digits[i];
      }
      setOtp(newOtp);
      inputRefs.current[Math.min(digits.length, 5)]?.focus();
    } catch {
      // Clipboard API may be blocked by browser permissions.
    }
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

  const formatCountdown = () => {
    const seconds = countdown % 60;
    return `${seconds}`;
  };

  return (
    <div className="min-h-screen bg-warm-ivory text-on-surface flex flex-col items-center justify-center p-6 relative">
      <SEO title="OTP Verification | Presently" />

      <button
        onClick={() => navigate(-1)}
        className="absolute top-8 left-8 p-3 text-presently-black hover:bg-black/5 rounded-full transition-all"
        aria-label="Go back"
      >
        <ArrowLeft size={24} />
      </button>

      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Logo className="justify-center mb-8" />
          <h1 className="font-display text-3xl font-bold text-presently-black mb-4">
            Verify your account
          </h1>
          <p className="text-on-surface-variant">
            Enter the 6-digit code we sent to <br />
            <span className="font-bold text-presently-black">{email}</span>
          </p>
        </div>

        <div className="bg-white p-8 md:p-10 rounded-[20px] shadow-lg border border-outline">
          <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
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
                className={cn(
                  "w-11 h-14 text-center text-2xl font-bold rounded-xl border transition-all focus:outline-none",
                  digit
                    ? "border-sungold bg-sungold/5 text-presently-black"
                    : "border-[#CBD5E1] focus:border-sungold focus:ring-3 focus:ring-sungold/15 bg-white"
                )}
                aria-label={`OTP digit ${index + 1}`}
              />
            ))}
          </div>

          <div className="flex justify-center mb-8">
            <button
              type="button"
              onClick={handlePasteFromClipboard}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-on-surface-variant hover:text-sungold transition-colors"
            >
              <ClipboardPaste size={16} />
              Paste code from clipboard
            </button>
          </div>

          <div className="text-center mb-10">
            {!canResend ? (
              <p className="text-sm text-on-surface-variant">
                Resend code in <span className="font-bold text-sungold">{formatCountdown()}s</span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                disabled={resendMutation.isPending}
                className="text-sungold font-bold hover:underline disabled:opacity-50 flex items-center justify-center gap-2 mx-auto"
              >
                {resendMutation.isPending && <Loader2 size={16} className="animate-spin" />}
                Resend Verification Code
              </button>
            )}
          </div>

          <Button
            onClick={handleVerify}
            disabled={!isOtpComplete || verifyMutation.isPending}
            fullWidth
            className="h-14 text-lg"
          >
            {verifyMutation.isPending ? 'Verifying...' : 'Verify & Continue'}
          </Button>

          {verifyMutation.isError && (
            <p className="mt-4 text-xs text-soft-coral font-bold text-center">
              Invalid code. Please try again.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
