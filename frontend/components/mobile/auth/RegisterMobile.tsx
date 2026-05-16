import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Envelope, LockKey, User, ArrowRight, Buildings, GraduationCap, IdentificationCard } from '@phosphor-icons/react';
import { useNavigate, Link } from 'react-router-dom';
import { SEO } from '../../SEO';

export const RegisterMobile: React.FC = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<'student' | 'lecturer'>('student');
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="flex flex-col min-h-screen bg-presently-black text-white relative overflow-hidden">
      <SEO title="Register | Presently" />
      
      {/* Background styling */}
      <div className="absolute top-[-10%] right-[-10%] w-[120vw] h-[50vh] bg-sungold/20 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="flex-1 flex flex-col items-center justify-center p-6 pt-12 pb-8 relative z-10">
         <h1 className="text-4xl font-bold tracking-tight mb-2 text-center">Get Started</h1>
         <p className="text-white/60 font-medium text-center px-4">Create your account to access the platform.</p>
      </div>

      {/* Form Card sliding up */}
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200, delay: 0.1 }}
        className="w-full bg-white dark:bg-charcoal rounded-t-[40px] px-6 pt-8 pb-12 shadow-2xl relative z-20 flex-shrink-0"
      >
         <form onSubmit={handleRegister} className="space-y-4">
            
            {/* Segmented Control for Role */}
            <div className="p-1 bg-slate-100 dark:bg-white/5 rounded-2xl flex relative mb-2">
               <motion.div 
                 className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-white dark:bg-charcoal rounded-xl shadow-sm border border-slate-200 dark:border-white/10"
                 animate={{ x: role === 'student' ? 0 : '100%' }}
                 transition={{ type: 'spring', damping: 25, stiffness: 300 }}
               />
               <button 
                 type="button"
                 onClick={() => setRole('student')}
                 className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl relative z-10 transition-colors ${role === 'student' ? 'text-sungold font-bold' : 'text-slate-400 font-medium'}`}
               >
                 <GraduationCap size={20} weight={role === 'student' ? 'bold' : 'regular'} />
                 Student
               </button>
               <button 
                 type="button"
                 onClick={() => setRole('lecturer')}
                 className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl relative z-10 transition-colors ${role === 'lecturer' ? 'text-sungold font-bold' : 'text-slate-400 font-medium'}`}
               >
                 <IdentificationCard size={20} weight={role === 'lecturer' ? 'bold' : 'regular'} />
                 Lecturer
               </button>
            </div>

            <div className="space-y-1.5">
               <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/50 pl-2">Full Name</label>
               <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                     <User size={20} weight="bold" />
                  </div>
                  <input 
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Jane Doe"
                    className="w-full h-[52px] pl-12 pr-4 bg-slate-50 dark:bg-white/5 border-2 border-slate-100 dark:border-white/10 rounded-[20px] outline-none focus:border-sungold focus:shadow-[0_0_0_4px_rgba(245,197,24,0.15)] transition-all text-[15px] font-bold text-presently-black dark:text-white placeholder:font-medium placeholder:text-slate-400"
                  />
               </div>
            </div>

            <div className="space-y-1.5">
               <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/50 pl-2">Institution Email</label>
               <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                     <Envelope size={20} weight="bold" />
                  </div>
                  <input 
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder={role === 'student' ? 'student@university.edu' : 'faculty@university.edu'}
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
                    type="password"
                    required
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full h-[52px] pl-12 pr-4 bg-slate-50 dark:bg-white/5 border-2 border-slate-100 dark:border-white/10 rounded-[20px] outline-none focus:border-sungold focus:shadow-[0_0_0_4px_rgba(245,197,24,0.15)] transition-all text-[15px] font-bold text-presently-black dark:text-white placeholder:font-medium placeholder:text-slate-400 font-mono tracking-widest"
                  />
               </div>
            </div>

            <button 
              type="submit"
              className="w-full h-[56px] mt-6 bg-sungold text-presently-black rounded-2xl font-black text-lg shadow-gold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            >
              Create Account <ArrowRight size={20} weight="bold" />
            </button>
         </form>

         <p className="text-center text-[13px] font-medium text-slate-500 dark:text-slate-400 mt-6">
            Already have an account? <Link to="/auth/login" className="font-bold text-presently-black dark:text-white underline decoration-sungold decoration-2 underline-offset-4">Log in</Link>
         </p>
      </motion.div>
    </div>
  );
};
