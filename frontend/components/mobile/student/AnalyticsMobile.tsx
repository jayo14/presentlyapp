import React from 'react';
import { motion } from 'framer-motion';
import { ChartLineUp, CaretRight, Info, TrendUp, Warning, Trophy } from '@phosphor-icons/react';
import { SEO } from '../../SEO';

export const AnalyticsMobile: React.FC = () => {
  return (
    <div className="space-y-8 px-4 pt-4 pb-12">
      <SEO title="Analytics | Presently" />

      {/* Header */}
      <div className="flex items-center justify-between">
         <h1 className="text-[32px] font-bold tracking-tight text-presently-black dark:text-white">Analytics</h1>
      </div>

      {/* Overview Card */}
      <section className="bg-presently-black dark:bg-charcoal rounded-[32px] p-6 shadow-gold relative overflow-hidden">
         <div className="absolute top-0 right-0 w-32 h-32 bg-sungold/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
         
         <div className="flex items-center gap-2 mb-6 text-sungold">
            <Trophy size={20} weight="fill" />
            <span className="text-[12px] font-black uppercase tracking-[0.2em]">Top 10% of class</span>
         </div>

         <div className="flex items-end justify-between">
            <div>
               <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">Overall Attendance</p>
               <h2 className="text-[48px] font-black text-white leading-none tracking-tighter">88<span className="text-sungold text-[24px]">%</span></h2>
            </div>
            <div className="w-16 h-16 rounded-full border-4 border-sungold border-t-white/10 flex items-center justify-center transform -rotate-45">
               <span className="text-white font-bold text-sm transform rotate-45">Good</span>
            </div>
         </div>
      </section>

      {/* Insight Pills */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
         <div className="bg-white dark:bg-charcoal border border-slate-100 dark:border-white/10 rounded-2xl p-4 min-w-[140px] shadow-sm">
            <TrendUp size={24} className="text-moss-green mb-2" weight="duotone" />
            <p className="text-[20px] font-black text-presently-black dark:text-white leading-none">12</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Perfect Weeks</p>
         </div>
         <div className="bg-white dark:bg-charcoal border border-slate-100 dark:border-white/10 rounded-2xl p-4 min-w-[140px] shadow-sm">
            <ChartLineUp size={24} className="text-sky-teal mb-2" weight="duotone" />
            <p className="text-[20px] font-black text-presently-black dark:text-white leading-none">45</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Total Classes</p>
         </div>
         <div className="bg-white dark:bg-charcoal border border-slate-100 dark:border-white/10 rounded-2xl p-4 min-w-[140px] shadow-sm">
            <Warning size={24} className="text-soft-coral mb-2" weight="duotone" />
            <p className="text-[20px] font-black text-presently-black dark:text-white leading-none">3</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Missed</p>
         </div>
      </div>

      {/* Course Breakdown */}
      <section className="space-y-4">
         <div className="flex items-center justify-between px-2">
            <h3 className="text-[15px] font-bold text-presently-black dark:text-white">Course Breakdown</h3>
         </div>

         <div className="space-y-3">
            {[
               { code: 'CSC 401', name: 'Intro to AI', att: 95, color: 'bg-moss-green' },
               { code: 'MTH 302', name: 'Advanced Calculus', att: 82, color: 'bg-sungold' },
               { code: 'PHY 205', name: 'Quantum Mechanics', att: 70, color: 'bg-soft-coral' },
            ].map(course => (
               <div key={course.code} className="bg-white dark:bg-charcoal rounded-[24px] p-5 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                     <div>
                        <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">{course.code}</p>
                        <p className="text-[15px] font-bold text-presently-black dark:text-white mt-0.5">{course.name}</p>
                     </div>
                     <span className="text-[18px] font-black text-presently-black dark:text-white">{course.att}%</span>
                  </div>
                  {/* Progress Bar */}
                  <div className="h-2.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                     <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${course.att}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full ${course.color}`}
                     />
                  </div>
               </div>
            ))}
         </div>
      </section>

      {/* Weekly Trend (Placeholder for Recharts) */}
      <section className="bg-white dark:bg-charcoal rounded-[24px] p-5 shadow-sm space-y-4">
         <div className="flex justify-between items-center">
            <h3 className="text-[15px] font-bold text-presently-black dark:text-white">Weekly Trend</h3>
            <Info size={20} className="text-slate-400" />
         </div>
         <div className="h-40 flex items-end justify-between gap-2 px-2 pb-2">
            {[60, 80, 100, 90, 100].map((h, i) => (
               <div key={i} className="flex-1 bg-slate-100 dark:bg-white/5 rounded-t-lg relative group">
                  <motion.div 
                     initial={{ height: 0 }}
                     animate={{ height: `${h}%` }}
                     transition={{ duration: 0.8, delay: i * 0.1 }}
                     className="absolute bottom-0 w-full bg-sungold rounded-t-lg"
                  />
               </div>
            ))}
         </div>
         <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">
            <span>W1</span>
            <span>W2</span>
            <span>W3</span>
            <span>W4</span>
            <span>W5</span>
         </div>
      </section>
    </div>
  );
};
