import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Envelope, ArrowRight, CaretLeft, PaperPlaneRight } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../../SEO';

export const ForgotPasswordMobile: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'input' | 'success'>('input');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('success');
  };

  return (
    <div className="flex flex-col min-h-screen bg-presently-black text-white relative overflow-hidden">
      <SEO title="Forgot Password | Presently" />
      
      <div className="absolute top-0 left-0 p-6 pt-safe z-50">
         <button 
           onClick={() => navigate(-1)}
           className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center active:scale-95 transition-transform"
         >
           <CaretLeft size={20} weight="bold" />
         </button>
      </div>

      <div className="absolute top-[-10%] right-[-10%] w-[120vw] h-[50vh] bg-sungold/20 rounded-full blur-[100px] pointer-events-none" />
      
      <AnimatePresence mode="wait">
        {step === 'input' ? (
          <motion.div 
            key="input"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col"
          >
            <div className="flex-1 flex flex-col items-center justify-center p-6 pt-12 pb-8 relative z-10">
               <h1 className="text-4xl font-bold tracking-tight mb-2 text-center">Reset Password</h1>
               <p className="text-white/60 font-medium text-center px-4">Enter your email and we'll send you a recovery link.</p>
            </div>

            <div className="w-full bg-white dark:bg-charcoal rounded-t-[40px] px-6 pt-10 pb-12 shadow-2xl relative z-20 flex-shrink-0">
               <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-1.5">
                     <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/50 pl-2">Institution Email</label>
                     <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                           <Envelope size={20} weight="bold" />
                        </div>
                        <input 
                          type="email"
                          required
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="student@university.edu"
                          className="w-full h-[52px] pl-12 pr-4 bg-slate-50 dark:bg-white/5 border-2 border-slate-100 dark:border-white/10 rounded-[20px] outline-none focus:border-sungold focus:shadow-[0_0_0_4px_rgba(245,197,24,0.15)] transition-all text-[15px] font-bold text-presently-black dark:text-white placeholder:font-medium placeholder:text-slate-400"
                        />
                     </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full h-[56px] bg-sungold text-presently-black rounded-2xl font-black text-lg shadow-gold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                  >
                    Send Link <ArrowRight size={20} weight="bold" />
                  </button>
               </form>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center flex-1 p-6 relative z-10"
          >
            <div className="w-24 h-24 rounded-full bg-sungold/20 flex items-center justify-center mb-8">
               <PaperPlaneRight size={48} weight="duotone" className="text-sungold" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-4 text-center">Check your inbox</h2>
            <p className="text-white/60 font-medium text-center mb-8">
               We sent a recovery link to<br/>
               <span className="text-white font-bold">{email}</span>
            </p>
            <button 
              onClick={() => navigate('/auth/login')}
              className="w-full max-w-[280px] h-[56px] bg-white text-presently-black rounded-2xl font-black text-lg shadow-sm active:scale-[0.98] transition-transform"
            >
              Back to Login
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
