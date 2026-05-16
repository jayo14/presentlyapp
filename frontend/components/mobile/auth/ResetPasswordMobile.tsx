import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LockKey, ArrowRight, Eye, EyeSlash, CaretLeft, CheckCircle } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../../SEO';

export const ResetPasswordMobile: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  
  const rules = [
    { label: 'At least 8 characters', valid: password.length >= 8 },
    { label: 'Contains a number', valid: /\d/.test(password) },
    { label: 'Contains a special character', valid: /[!@#$%^&*]/.test(password) },
  ];

  const isValid = rules.every(r => r.valid);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) navigate('/auth/login');
  };

  return (
    <div className="flex flex-col min-h-screen bg-presently-black text-white relative overflow-hidden">
      <SEO title="Reset Password | Presently" />
      
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
         <h1 className="text-4xl font-bold tracking-tight mb-2 text-center">New Password</h1>
         <p className="text-white/60 font-medium text-center px-4">Create a strong password for your account.</p>
      </div>

      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200, delay: 0.1 }}
        className="w-full bg-white dark:bg-charcoal rounded-t-[40px] px-6 pt-10 pb-12 shadow-2xl relative z-20 flex-shrink-0"
      >
         <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
               <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/50 pl-2">New Password</label>
               <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                     <LockKey size={20} weight="bold" />
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-[52px] pl-12 pr-12 bg-slate-50 dark:bg-white/5 border-2 border-slate-100 dark:border-white/10 rounded-[20px] outline-none focus:border-sungold focus:shadow-[0_0_0_4px_rgba(245,197,24,0.15)] transition-all text-[15px] font-bold text-presently-black dark:text-white placeholder:font-medium placeholder:text-slate-400 font-mono tracking-widest"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 p-1 active:scale-90 transition-transform"
                  >
                     {showPassword ? <EyeSlash size={20} weight="bold" /> : <Eye size={20} weight="bold" />}
                  </button>
               </div>
            </div>

            <div className="space-y-2 bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
               {rules.map((rule, i) => (
                 <div key={i} className="flex items-center gap-2">
                    <CheckCircle size={16} weight="bold" className={rule.valid ? 'text-moss-green' : 'text-slate-300 dark:text-slate-600'} />
                    <span className={`text-[13px] font-medium transition-colors ${rule.valid ? 'text-presently-black dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>
                       {rule.label}
                    </span>
                 </div>
               ))}
            </div>

            <button 
              type="submit"
              disabled={!isValid}
              className="w-full h-[56px] mt-4 bg-sungold text-presently-black rounded-2xl font-black text-lg shadow-gold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-40"
            >
              Update Password <ArrowRight size={20} weight="bold" />
            </button>
         </form>
      </motion.div>
    </div>
  );
};
