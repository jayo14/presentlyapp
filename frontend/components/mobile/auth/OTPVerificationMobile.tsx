import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CaretLeft, ShieldCheck, ArrowRight } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../../SEO';

export const OTPVerificationMobile: React.FC = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (inputRefs.current[0]) inputRefs.current[0].focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0];
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/auth/reset-password');
  };

  return (
    <div className="flex flex-col min-h-screen bg-presently-black text-white relative overflow-hidden">
      <SEO title="Verify OTP | Presently" />
      
      <div className="absolute top-0 left-0 p-6 pt-safe z-50">
         <button 
           onClick={() => navigate(-1)}
           className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center active:scale-95 transition-transform"
         >
           <CaretLeft size={20} weight="bold" />
         </button>
      </div>

      <div className="absolute top-[-10%] right-[-10%] w-[120vw] h-[50vh] bg-sungold/20 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="flex-1 flex flex-col items-center justify-center p-6 pt-12 pb-8 relative z-10">
         <div className="w-20 h-20 rounded-[24px] bg-white/10 border border-white/20 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(245,197,24,0.3)]">
            <ShieldCheck size={40} weight="duotone" className="text-sungold" />
         </div>
         <h1 className="text-4xl font-bold tracking-tight mb-2 text-center">Verify Email</h1>
         <p className="text-white/60 font-medium text-center px-4">Enter the 6-digit code sent to your email.</p>
      </div>

      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200, delay: 0.1 }}
        className="w-full bg-white dark:bg-charcoal rounded-t-[40px] px-6 pt-10 pb-12 shadow-2xl relative z-20 flex-shrink-0"
      >
         <form onSubmit={handleSubmit} className="space-y-8">
            
            <div className="flex justify-between gap-2 max-w-[320px] mx-auto">
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
                    className="w-[45px] h-[56px] bg-slate-50 dark:bg-white/5 border-2 border-slate-100 dark:border-white/10 rounded-2xl outline-none focus:border-sungold focus:shadow-[0_0_0_4px_rgba(245,197,24,0.15)] transition-all text-2xl font-mono font-bold text-center text-presently-black dark:text-white"
                  />
               ))}
            </div>

            <button 
              type="submit"
              disabled={otp.join('').length < 6}
              className="w-full h-[56px] bg-sungold text-presently-black rounded-2xl font-black text-lg shadow-gold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-40"
            >
              Verify Code <ArrowRight size={20} weight="bold" />
            </button>
         </form>
         
         <div className="mt-8 text-center">
            <p className="text-slate-500 dark:text-slate-400 text-[13px] font-medium">
               Didn't receive it? <button className="font-bold text-presently-black dark:text-white underline decoration-sungold decoration-2 underline-offset-4">Resend Code</button>
            </p>
         </div>
      </motion.div>
    </div>
  );
};
