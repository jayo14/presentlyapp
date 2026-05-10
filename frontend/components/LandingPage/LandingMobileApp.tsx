import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export const LandingMobileApp: React.FC = () => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -180]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -140]);
  const y4 = useTransform(scrollYProgress, [0, 1], [0, -220]);

  return (
    <section ref={containerRef} className="py-32 bg-warm-ivory overflow-hidden">
      <div className="container mx-auto px-6 mb-20 text-center">
        <h2 className="font-display text-4xl md:text-5xl text-presently-black mb-6">
          Beautiful on every screen.<br />Effortless in every pocket.
        </h2>
      </div>

      <div className="flex justify-center gap-4 md:gap-8 px-6 lg:px-0">
        {/* Screen 1: Onboarding */}
        <motion.div style={{ y: y1 }} className="w-48 md:w-64 h-[400px] md:h-[500px] bg-presently-black rounded-[40px] border-4 border-[#2A2A2A] shadow-lg flex-shrink-0 overflow-hidden">
          <div className="p-6 h-full flex flex-col justify-end bg-sungold/5">
             <div className="w-10 h-10 bg-sungold rounded-xl mb-4" />
             <div className="w-full h-4 bg-sungold/20 rounded-full mb-2" />
             <div className="w-3/4 h-4 bg-sungold/20 rounded-full mb-8" />
             <div className="space-y-3">
               <div className="w-full h-12 bg-white rounded-xl border-2 border-sungold" />
               <div className="w-full h-12 bg-white/50 rounded-xl" />
             </div>
          </div>
        </motion.div>

        {/* Screen 2: Student Dashboard */}
        <motion.div style={{ y: y2 }} className="w-48 md:w-64 h-[400px] md:h-[500px] bg-presently-black rounded-[40px] border-4 border-[#2A2A2A] shadow-xl flex-shrink-0 overflow-hidden">
          <div className="p-6 h-full bg-[#141414] text-white">
             <div className="flex justify-between items-center mb-8">
               <div className="w-8 h-8 rounded-full bg-sungold" />
               <div className="w-8 h-8 rounded-full bg-[#2A2A2A]" />
             </div>
             <div className="w-32 h-32 rounded-full border-[10px] border-sungold mx-auto mb-8 flex items-center justify-center">
               <span className="text-3xl font-bold">88%</span>
             </div>
             <div className="space-y-4">
                <div className="w-full h-16 bg-[#1A1A1A] rounded-2xl border border-[#2A2A2A]" />
                <div className="w-full h-16 bg-[#1A1A1A] rounded-2xl border border-[#2A2A2A]" />
             </div>
          </div>
        </motion.div>

        {/* Screen 3: Live Check-in */}
        <motion.div style={{ y: y3 }} className="w-48 md:w-64 h-[400px] md:h-[500px] bg-presently-black rounded-[40px] border-4 border-[#2A2A2A] shadow-2xl flex-shrink-0 overflow-hidden">
          <div className="h-full bg-slate-800 relative flex flex-col items-center justify-center">
             <div className="absolute inset-0 opacity-40">
               <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-sungold/40 via-transparent to-transparent" />
             </div>
             <motion.div
               animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
               transition={{ duration: 2, repeat: Infinity }}
               className="w-20 h-20 bg-sungold rounded-full flex items-center justify-center relative z-10 shadow-gold"
             >
               <div className="w-12 h-12 border-4 border-presently-black rounded-full" />
             </motion.div>
             <p className="mt-6 text-white font-display text-lg relative z-10">Confirming location...</p>
          </div>
        </motion.div>

        {/* Screen 4: History */}
        <motion.div style={{ y: y4 }} className="w-48 md:w-64 h-[400px] md:h-[500px] bg-presently-black rounded-[40px] border-4 border-[#2A2A2A] shadow-lg flex-shrink-0 overflow-hidden">
          <div className="p-6 h-full bg-white">
             <div className="w-full h-8 bg-slate-100 rounded-full mb-8" />
             <div className="grid grid-cols-7 gap-2 mb-8">
               {Array.from({ length: 28 }).map((_, i) => (
                 <div key={i} className={`aspect-square rounded-sm ${i % 7 === 0 ? 'bg-soft-coral' : 'bg-moss-green'}`} />
               ))}
             </div>
             <div className="space-y-3">
               {[1,2,3,4].map(i => (
                 <div key={i} className="w-full h-10 bg-slate-50 rounded-lg" />
               ))}
             </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
