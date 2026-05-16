import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Envelope, LockKey, ArrowRight, Eye, EyeSlash, Fingerprint } from '@phosphor-icons/react';
import { useNavigate, Link } from 'react-router-dom';
import { SEO } from '../../SEO';

export const LoginMobile: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login
    navigate('/dashboard');
  };

  return (
    <div className="flex flex-col min-h-screen bg-presently-black text-white relative overflow-hidden">
      <SEO title="Login | Presently" />
      
      {/* Background styling */}
      <div className="absolute top-[-10%] right-[-10%] w-[120vw] h-[50vh] bg-sungold/20 rounded-full blur-[100px] pointer-events-none" />
      
      {/* Top Graphic */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 pt-12 pb-8 relative z-10">
         <div className="w-20 h-20 rounded-[24px] bg-white/10 border border-white/20 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(245,197,24,0.3)]">
            <Fingerprint size={40} weight="duotone" className="text-sungold" />
         </div>
         <h1 className="text-4xl font-bold tracking-tight mb-2 text-center">Welcome Back</h1>
         <p className="text-white/60 font-medium text-center px-4">Sign in to access your digital campus.</p>
      </div>

      {/* Form Card sliding up */}
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200, delay: 0.1 }}
        className="w-full bg-white dark:bg-charcoal rounded-t-[40px] px-6 pt-8 pb-12 shadow-2xl relative z-20 flex-shrink-0"
      >
         <form onSubmit={handleLogin} className="space-y-5">
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

            <div className="space-y-1.5">
               <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/50 pl-2">Password</label>
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
               <div className="flex justify-end pt-2">
                  <Link to="/auth/forgot-password" className="text-[12px] font-bold text-sungold">Forgot password?</Link>
               </div>
            </div>

            <button 
              type="submit"
              className="w-full h-[56px] mt-4 bg-sungold text-presently-black rounded-2xl font-black text-lg shadow-gold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            >
              Sign In <ArrowRight size={20} weight="bold" />
            </button>
         </form>

         <p className="text-center text-[13px] font-medium text-slate-500 dark:text-slate-400 mt-8">
            Don't have an account? <Link to="/auth/register" className="font-bold text-presently-black dark:text-white underline decoration-sungold decoration-2 underline-offset-4">Register here</Link>
         </p>
      </motion.div>
    </div>
  );
};
