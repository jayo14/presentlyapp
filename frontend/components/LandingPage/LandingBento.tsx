import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Wifi, Signal, FileDown, ShieldCheck, Users } from 'lucide-react';
import { cn } from '../../src/components/ui/utils';

export const LandingBento: React.FC = () => {
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-5 sm:px-6">
        <div className="text-center mb-20">
          <span className="text-sungold font-bold uppercase tracking-widest text-sm mb-4 block">
            WHAT'S UNDER THE HOOD
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-on-surface mb-6">
            Powerful features.<br />Quietly in the background.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 auto-rows-[220px] sm:auto-rows-[260px] md:auto-rows-[280px]">
          {/* GPS Verification - 6-col */}
          <motion.div
            whileInView={{ opacity: 1, scale: 1 }}
            initial={{ opacity: 0, scale: 0.95 }}
            viewport={{ once: true }}
            className="md:col-span-6 bg-presently-black rounded-[20px] p-8 text-white flex flex-col justify-between overflow-hidden relative group"
          >
            <div className="relative z-10">
              <h3 className="font-display text-2xl mb-2">"You can't check in from your dorm."</h3>
              <p className="text-slate-300 text-sm max-w-xs">GPS + wifi triangulation verifies campus presence. No VPNs, no spoofing.</p>
            </div>
            <div className="absolute bottom-0 right-0 w-1/2 h-full bg-[#1A1A1A] border-l border-t border-[#2A2A2A] rounded-tl-[40px] p-4 flex items-center justify-center translate-y-8 group-hover:translate-y-4 transition-transform duration-500">
               <div className="relative w-full h-full bg-[#0D0D0D] rounded-[20px] flex items-center justify-center border border-[#2A2A2A]">
                 <motion.div
                   animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.2, 0.5] }}
                   transition={{ duration: 3, repeat: Infinity }}
                   className="absolute w-24 h-24 bg-sungold/20 rounded-full"
                 />
                 <MapPin className="text-sungold w-8 h-8 relative z-10" />
               </div>
            </div>
          </motion.div>

          {/* Offline Mode - 3-col */}
          <motion.div
            whileInView={{ opacity: 1, scale: 1 }}
            initial={{ opacity: 0, scale: 0.95 }}
            viewport={{ once: true }}
            className="md:col-span-3 bg-pale-honey dark:bg-[#1F1A0F] rounded-[20px] p-8 flex flex-col justify-between"
          >
            <div className="w-12 h-12 bg-white dark:bg-[#2A2418] rounded-full flex items-center justify-center shadow-sm mb-4">
              <Wifi className="text-sungold w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display text-xl mb-2">Poor signal? No problem.</h3>
              <p className="text-on-surface-variant text-sm">Check-ins queue locally and sync when connection returns.</p>
            </div>
          </motion.div>

          {/* Real-time Feed - 3-col */}
          <motion.div
            whileInView={{ opacity: 1, scale: 1 }}
            initial={{ opacity: 0, scale: 0.95 }}
            viewport={{ once: true }}
            className="md:col-span-3 bg-surface rounded-[20px] p-8 border border-outline flex flex-col justify-between overflow-hidden"
          >
             <div>
              <h3 className="font-display text-xl mb-2">Watch your class fill up.</h3>
              <p className="text-on-surface-variant text-sm">Live attendance list with names and timestamps animating in.</p>
            </div>
            <div className="mt-4 space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-[#141414] rounded-lg border border-outline animate-in fade-in slide-in-from-right-4" style={{ animationDelay: `${i * 200}ms` }}>
                   <div className="w-2 h-2 rounded-full bg-moss-green" />
                   <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full" />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Export Reports - 3-col */}
          <motion.div
            whileInView={{ opacity: 1, scale: 1 }}
            initial={{ opacity: 0, scale: 0.95 }}
            viewport={{ once: true }}
            className="md:col-span-3 bg-surface rounded-[20px] p-8 border border-outline flex flex-col items-center justify-center text-center gap-4"
          >
            <div className="w-16 h-16 bg-sungold/10 rounded-2xl flex items-center justify-center text-sungold">
              <FileDown size={32} />
            </div>
            <h3 className="font-display text-xl">One click to PDF.</h3>
          </motion.div>

          {/* Role-Based Access - 6-col */}
          <motion.div
            whileInView={{ opacity: 1, scale: 1 }}
            initial={{ opacity: 0, scale: 0.95 }}
            viewport={{ once: true }}
            className="md:col-span-6 bg-pale-honey dark:bg-[#1F1A0F] rounded-[20px] p-8 flex flex-col md:flex-row gap-8 items-center"
          >
            <div className="flex-1">
              <h3 className="font-display text-2xl mb-2">Everyone sees exactly what they should.</h3>
              <p className="text-on-surface-variant text-sm">Students see theirs. Lecturers see their class. Admins see everything.</p>
            </div>
            <div className="w-48 h-48 bg-white dark:bg-[#141414] rounded-full flex items-center justify-center relative shadow-md">
               <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-12 bg-sungold rounded-xl flex items-center justify-center shadow-lg"><ShieldCheck className="text-presently-black w-6 h-6" /></div>
                <div className="absolute bottom-8 left-4 w-12 h-12 bg-presently-black rounded-xl flex items-center justify-center shadow-lg"><Users className="text-white w-6 h-6" /></div>
                <div className="absolute bottom-8 right-4 w-12 h-12 bg-presently-black rounded-xl flex items-center justify-center shadow-lg"><Users className="text-white w-6 h-6" /></div>
                <div className="w-24 h-0.5 bg-slate-300 dark:bg-slate-700 absolute rotate-[120deg] origin-center -translate-y-4 -translate-x-6" />
                <div className="w-24 h-0.5 bg-slate-300 dark:bg-slate-700 absolute rotate-[60deg] origin-center -translate-y-4 translate-x-6" />
             </div>
           </motion.div>

          {/* Placeholder/Empty for layout completion if needed - 3-col */}
          <motion.div
            whileInView={{ opacity: 1, scale: 1 }}
            initial={{ opacity: 0, scale: 0.95 }}
            viewport={{ once: true }}
            className="md:col-span-3 bg-presently-black rounded-[20px] p-8 text-white flex flex-col justify-center items-center text-center"
          >
            <Signal className="text-sungold w-12 h-12 mb-4 animate-pulse" />
            <h3 className="font-display text-lg">99.9% Uptime</h3>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
