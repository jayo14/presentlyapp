import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, ClipboardText, 
  Clock, ShieldCheck, Sparkle
} from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { useVerifyEmailOTP, useResendEmailVerification } from '../../../hooks/useAuth';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { toast } from 'sonner';
import { SEO } from '../../SEO';


export const OTPVerificationMobile: React.FC = () => {
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

  const triggerHaptic = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (e) {}
  };

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    triggerHaptic();

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (index === 5 && value && newOtp.every(d => d !== '')) {
      verifyMutation.mutate({ email, otp: newOtp.join('') });
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const digits = text.replace(/\D/g, '').slice(0, 6);
      if (digits) {
        const newOtp = [...otp];
        digits.split('').forEach((d, i) => { newOtp[i] = d; });
        setOtp(newOtp);
        inputRefs.current[Math.min(digits.length, 5)]?.focus();
      }
    } catch (e) {
      toast.error('Clipboard access denied');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col p-6 pt-safe">
      <SEO title="Verify OTP | Presently" />

      {/* Top Bar */}
      <div className="flex items-center justify-between mb-12">
        <button 
          onClick={() => navigate(-1)}
          className="p-3 rounded-2xl bg-surface-container active:scale-90 transition-transform"
        >
          <ArrowLeft size={24} weight="bold" />
        </button>
        <div className="flex items-center gap-2">
           <img src="/logo.png" alt="Logo" className="w-8 h-8" />
           <span className="font-display text-xl font-bold tracking-tight">Presently</span>
        </div>
        <div className="w-12" />
      </div>

      {/* Header */}
      <div className="mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sungold mb-2"
        >
          <ShieldCheck size={20} weight="fill" />
          <span className="text-xs font-bold uppercase tracking-[0.2em]">Account Security</span>
        </motion.div>
        <h1 className="text-4xl font-bold tracking-tight mb-2">Verify Account</h1>
        <p className="text-on-surface-variant font-medium">
          We've sent a 6-digit code to <br />
          <span className="text-on-surface font-bold">{email}</span>
        </p>
      </div>

      {/* OTP Input Grid */}
      <div className="grid grid-cols-6 gap-3 mb-10">
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
            className={`
              w-full aspect-[2/3] text-center text-3xl font-black rounded-2xl border transition-all
              ${digit ? 'bg-sungold text-black border-sungold shadow-gold' : 'bg-surface-container border-outline text-on-surface focus:border-sungold focus:ring-4 focus:ring-sungold/10'}
            `}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="space-y-6">
        <button
          onClick={handlePaste}
          className="w-full h-14 flex items-center justify-center gap-2 text-on-surface-variant font-bold hover:text-on-surface active:scale-95 transition-all"
        >
          <ClipboardText size={20} weight="duotone" />
          Paste from clipboard
        </button>

        {!canResend ? (
          <div className="flex items-center justify-center gap-2 text-on-surface-variant font-medium">
            <Clock size={18} weight="duotone" />
            <span>Resend code in <span className="font-bold text-sungold">{countdown}s</span></span>
          </div>
        ) : (
          <button
            onClick={() => resendMutation.mutate(email)}
            disabled={resendMutation.isPending}
            className="w-full h-14 rounded-2xl border border-outline font-bold active:scale-95 transition-all disabled:opacity-50 skeuo-button"
          >
            {resendMutation.isPending ? 'Resending...' : 'Resend Code'}
          </button>

        )}

        <button
          onClick={() => verifyMutation.mutate({ email, otp: otp.join('') })}
          disabled={!otp.every(d => d !== '') || verifyMutation.isPending}
          className="w-full h-18 bg-sungold text-presently-black rounded-3xl font-black text-xl skeuo-button-gold flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {verifyMutation.isPending ? (
            <div className="w-8 h-8 border-4 border-black/20 border-t-black rounded-full animate-spin" />
          ) : 'Verify Account'}
        </button>

      </div>

      {/* Visual Decoration */}
      <div className="mt-auto py-10 flex justify-center">
         <div className="p-4 bg-surface-container rounded-full animate-bounce">
            <Sparkle size={24} weight="fill" className="text-sungold" />
         </div>
      </div>
    </div>
  );
};
