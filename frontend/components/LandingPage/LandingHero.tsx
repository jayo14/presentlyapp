import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { CaretRight, Play } from '@phosphor-icons/react';

export const Hero = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={containerRef} className="relative min-h-screen bg-surface pt-56 pb-40 overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/10 blur-[140px] rounded-full pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-[85%] md:max-w-[80%] mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-20 items-center relative z-10">
        <motion.div style={{ opacity }}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-3 mb-10 px-4 py-2 bg-primary/10 rounded-full border border-primary/20"
          >
            <span className="text-primary text-xs font-black tracking-[0.3em] uppercase">GPS-Verified Attendance</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="font-headline text-6xl md:text-8xl lg:text-[110px] text-on-surface leading-[0.95] tracking-tighter mb-12 font-black"
          >
            Attendance<br />
            that actually<br />
            <span className="text-primary relative inline-block">
              knows you're there.
              <motion.span
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 1, duration: 1 }}
                className="absolute -bottom-2 left-0 h-2 bg-primary/30 rounded-full"
              />
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-xl md:text-2xl text-textMuted mb-16 max-w-xl leading-relaxed font-medium"
          >
            Presently ends roll calls, paper sheets, and proxy attendance — for students, lecturers, and institutions that mean business.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center gap-8"
          >
            <a href="/register" className="w-full sm:w-auto skeuo-button-gold px-12 py-7 rounded-3xl font-black text-xl flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all">
              Start for free <CaretRight size={28} weight="bold" />
            </a>
            <a href="/how-it-works" className="group flex items-center gap-4 font-bold text-on-surface text-lg">
              <div className="w-16 h-16 rounded-full border-2 border-outline flex items-center justify-center group-hover:border-primary transition-all duration-300 group-hover:scale-110 bg-surface/50 backdrop-blur shadow-sm">
                <Play size={24} weight="fill" className="ml-1 text-primary transition-transform group-hover:scale-110" />
              </div>
              <span className="border-b-2 border-transparent group-hover:border-primary transition-all pb-1">Watch how it works</span>
            </a>
          </motion.div>
        </motion.div>

        <div className="relative h-[700px] hidden lg:block perspective-1000">
          {/* Mockup 1 */}
          <motion.div
            style={{ y: y1 }}
            initial={{ opacity: 0, rotate: -15, x: -50 }}
            animate={{ opacity: 1, rotate: -6, x: 0 }}
            transition={{ duration: 1.2, delay: 0.4 }}
            className="absolute z-10 -left-10 top-20 w-72 p-4 bg-surface rounded-[48px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.25)] border border-outline/20 skeuo-card"
          >
            <div className="bg-background h-[500px] rounded-[36px] overflow-hidden p-8 border border-outline/10">
              <div className="w-12 h-12 bg-primary/20 rounded-xl mb-8 flex items-center justify-center">
                 <div className="w-6 h-6 bg-primary rounded-md" />
              </div>
              <div className="h-5 w-32 bg-surface-variant rounded-full mb-12" />
              <div className="space-y-6">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-14 w-full bg-surface-container/50 rounded-2xl border border-outline/5" />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Mockup 2 - Primary */}
          <motion.div
            style={{ y: y2 }}
            initial={{ opacity: 0, scale: 0.8, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="absolute z-20 left-32 top-0 w-[320px] p-4 bg-surface rounded-[54px] shadow-[0_60px_120px_-30px_rgba(0,0,0,0.3)] border border-outline/30 skeuo-card"
          >
            <div className="bg-background h-[600px] rounded-[42px] overflow-hidden flex flex-col items-center justify-center p-12 text-center border border-outline/10 relative">
               <div className="absolute top-8 w-20 h-1.5 bg-outline/20 rounded-full" />
               <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mb-10 relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-20" />
                  <div className="relative z-10 w-20 h-20 bg-primary rounded-3xl flex items-center justify-center shadow-lg">
                    <Play size={40} weight="fill" className="text-white ml-1" />
                  </div>
               </div>
               <div className="h-4 w-40 bg-surface-variant rounded-full mb-4" />
               <div className="h-3 w-24 bg-surface-variant/40 rounded-full mb-12" />
               <div className="w-full h-14 skeuo-button-gold rounded-2xl" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
