import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CircleNotch } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { useRegister } from '../../../hooks/useAuth';
import { SEO } from '../../SEO';
import { UserRole } from '../../../types';

export const RegisterMobile: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const registerMutation = useRegister();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate({
      full_name: formData.name, password2: formData.password,
      email: formData.email,
      password: formData.password,
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-off-white dark:bg-presently-black text-presently-black dark:text-white relative overflow-hidden">
      <SEO title="Register | Presently" />

      {/* Background styling */}
      <div className="absolute top-[-10%] right-[-10%] w-[120vw] h-[50vh] bg-sungold/20 rounded-full blur-[100px] pointer-events-none" />
      <div className='w-24 h-24 flex items-center justify-center absolute top-16 left-4 '>

        <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-6 pt-16 pb-10 relative z-10">
        <h1 className="text-4xl font-bold tracking-tight mb-2 text-center">Get Started</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-center px-4">Create your account to access the platform.</p>
      </div>

      {/* Form Card sliding up */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200, delay: 0.1 }}
        className="w-full bg-white dark:bg-background dark:text-white rounded-t-[40px] px-6 pt-24 pb-16 shadow-2xl relative z-20 flex-shrink-0"
      >
        <form onSubmit={handleRegister} className="space-y-6">

          <div className="space-y-2">
            <label className="text-[12px] font-bold uppercase tracking-widest text-slate-400 pl-2">Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="Jane Doe"
              className="w-full h-[60px] px-6 bg-slate-50 dark:bg-white/5 border-2 border-slate-100 dark:border-white/10 rounded-[20px] outline-none focus:border-sungold focus:shadow-[0_0_0_4px_rgba(245,197,24,0.15)] transition-all text-[16px] font-bold text-presently-black dark:text-white placeholder:font-medium placeholder:text-slate-400"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[12px] font-bold uppercase tracking-widest text-slate-400 pl-2">Institution Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              placeholder="student@university.edu"
              className="w-full h-[60px] px-6 bg-slate-50 dark:bg-white/5 border-2 border-slate-100 dark:border-white/10 rounded-[20px] outline-none focus:border-sungold focus:shadow-[0_0_0_4px_rgba(245,197,24,0.15)] transition-all text-[16px] font-bold text-presently-black dark:text-white placeholder:font-medium placeholder:text-slate-400"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[12px] font-bold uppercase tracking-widest text-slate-400 pl-2">Password</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              className="w-full h-[60px] px-6 bg-slate-50 dark:bg-white/5 border-2 border-slate-100 dark:border-white/10 rounded-[20px] outline-none focus:border-sungold focus:shadow-[0_0_0_4px_rgba(245,197,24,0.15)] transition-all text-[16px] font-bold text-presently-black dark:text-white placeholder:font-medium placeholder:text-slate-400 font-mono tracking-widest"
            />
          </div>

          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="w-full h-[64px] mt-8 bg-sungold text-presently-black rounded-2xl font-black text-lg shadow-gold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            {registerMutation.isPending ? (
              <CircleNotch size={24} className="animate-spin" />
            ) : (
              <>Create Account <ArrowRight size={24} weight="bold" /></>
            )}
          </button>
        </form>

        <p className="text-center text-[14px] font-medium text-slate-500 dark:text-slate-400 mt-10">
          Already have an account? <Link to="/login" className="font-bold text-presently-black dark:text-white underline decoration-sungold decoration-2 underline-offset-4">Log in</Link>
        </p>
      </motion.div>
    </div>
  );
};
