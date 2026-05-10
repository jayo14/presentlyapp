import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Button } from '../Button';

interface LandingHeroProps {
  onGetStarted: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onGetStarted }) => {
  return (
    <section className="relative min-h-screen flex items-center pt-24 md:pt-20 pb-20 md:pb-28 overflow-hidden bg-presently-black text-white">
      {/* Background Decorative Element */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -right-1/4 w-[600px] h-[600px] bg-sungold/5 blur-[120px] rounded-full" />
      </div>

      <div className="container mx-auto px-5 sm:px-6 relative z-10">
        <div className="grid lg:grid-cols-12 gap-10 md:gap-12 items-center">

          {/* Left Content */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="text-sungold font-bold uppercase tracking-widest text-sm mb-6 block">
                THE MODERN STANDARD
              </span>
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-tight mb-8">
                Attendance that <br />
                survives every audit.
              </h1>
              <p className="font-sans text-base sm:text-lg md:text-xl text-slate-300 max-w-xl mb-10 md:mb-12">
                A premium, GPS-verified attendance system for the modern university.
                No paperwork, no proxies, no stress.
              </p>

              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4">
                <Button variant="primary" size="lg" onClick={onGetStarted} className="w-full sm:w-auto">
                  Get started for free <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button variant="outline" size="lg" className="w-full sm:w-auto border-white text-white hover:bg-white/10">
                  Request a school demo
                </Button>
              </div>

              <div className="lg:hidden mt-10 max-w-sm rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-slate-200 text-sm font-semibold">Live check-ins</span>
                  <span className="text-sungold text-sm font-bold">94.7%</span>
                </div>
                <div className="space-y-3">
                  {[1, 2, 3].map((entry) => (
                    <div key={entry} className="flex items-center gap-3 rounded-xl bg-black/30 border border-white/10 px-3 py-2">
                      <span className="h-2 w-2 rounded-full bg-sungold" />
                      <span className="h-2 w-20 rounded-full bg-white/30" />
                      <span className="ml-auto h-2 w-12 rounded-full bg-sungold/30" />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Visual: Staggered Phone Mockups */}
          <div className="lg:col-span-5 relative h-[600px] hidden lg:block">
            {/* Phone 1 (Back) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 100 }}
              animate={{ opacity: 1, scale: 1, x: 60 }}
              transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
              className="absolute top-20 right-0 w-64 h-[500px] bg-[#1A1A1A] rounded-[40px] border-4 border-[#2A2A2A] shadow-2xl overflow-hidden"
            >
              <div className="w-full h-full bg-[#141414] p-4 flex flex-col gap-4 opacity-40">
                <div className="w-full h-32 bg-[#1A1A1A] rounded-2xl" />
                <div className="w-full h-8 bg-[#1A1A1A] rounded-full" />
                <div className="w-full h-8 bg-[#1A1A1A] rounded-full" />
              </div>
            </motion.div>

            {/* Phone 2 (Middle) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
              className="absolute top-10 right-20 w-64 h-[500px] bg-[#1A1A1A] rounded-[40px] border-4 border-[#2A2A2A] shadow-2xl z-10 overflow-hidden"
            >
               <div className="w-full h-full bg-[#141414] p-4 flex flex-col gap-4">
                <div className="flex justify-between items-center mb-4">
                   <div className="w-8 h-8 rounded-full bg-sungold/20 flex items-center justify-center text-sungold font-display">P</div>
                   <div className="w-20 h-2 bg-[#2A2A2A] rounded-full" />
                </div>
                <div className="w-full h-40 bg-[#1A1A1A] rounded-3xl border border-[#2A2A2A] flex flex-col items-center justify-center gap-2">
                   <div className="w-16 h-16 rounded-full border-4 border-sungold flex items-center justify-center">
                     <span className="text-sungold font-bold">85%</span>
                   </div>
                   <div className="w-24 h-2 bg-sungold/20 rounded-full" />
                </div>
                <div className="space-y-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-full h-12 bg-[#1A1A1A] rounded-xl border border-[#2A2A2A]" />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Phone 3 (Front) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: -50 }}
              animate={{ opacity: 1, scale: 1, x: -60 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="absolute top-0 right-40 w-64 h-[500px] bg-[#1A1A1A] rounded-[40px] border-4 border-[#2A2A2A] shadow-2xl z-20 overflow-hidden"
            >
              <div className="w-full h-full bg-[#141414] p-6 flex flex-col justify-center items-center gap-6">
                <motion.div
                   animate={{ scale: [1, 1.1, 1] }}
                   transition={{ duration: 2, repeat: Infinity }}
                   className="w-24 h-24 rounded-full bg-sungold flex items-center justify-center shadow-gold"
                >
                  <CheckCircle2 className="w-12 h-12 text-presently-black" />
                </motion.div>
                <div className="text-center">
                  <p className="font-display text-xl mb-1">Present</p>
                  <p className="text-slate-500 text-sm">Checked in at 09:02 AM</p>
                </div>
              </div>
            </motion.div>

            {/* Floating Badges */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="absolute top-1/2 -left-10 z-30 bg-[#D1FAE5] text-[#065F46] px-4 py-2 rounded-full flex items-center gap-2 shadow-lg font-semibold text-sm"
            >
              <CheckCircle2 size={16} /> Present ✓
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 }}
              className="absolute top-1/4 -right-10 z-30 bg-[#FEE2E2] text-[#991B1B] px-4 py-2 rounded-full flex items-center gap-2 shadow-lg font-semibold text-sm"
            >
              <XCircle size={16} /> Absent ✗
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="absolute bottom-20 left-0 z-30 bg-[#FEF3C7] text-[#92400E] px-4 py-2 rounded-full flex items-center gap-2 shadow-lg font-semibold text-sm"
            >
              <Clock size={16} /> Late
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
