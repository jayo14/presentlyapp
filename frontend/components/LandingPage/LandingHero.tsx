import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ShieldCheck,
  Sparkles,
  Navigation,
  CheckCircle2,
  ArrowRight,
  Zap,
  Lock,
  Target
} from 'lucide-react';

interface LandingHeroProps {
  onGetStarted: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onGetStarted }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[100vh] flex items-center justify-center pt-20 pb-32 overflow-hidden bg-[#0A0A0A]"
    >
      {/* ─── ATMOSPHERIC BACKGROUND ─── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#D4AF37] opacity-[0.03] blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-[#D4AF37] opacity-[0.05] blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.05]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-12 gap-16 items-center">

          {/* ─── LEFT COLUMN: CONTENT ─── */}
          <motion.div
            style={{ y, opacity, scale }}
            className="lg:col-span-7 text-center lg:text-left"
          >
            {/* Tagline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 mb-8"
            >
              <Sparkles size={16} className="text-[#D4AF37]" />
              <span className="text-[#D4AF37] text-xs font-black uppercase tracking-[0.2em]">The End of Proxy Attendance</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter leading-[0.9] mb-8"
            >
              Reclaim Your <span className="text-gradient-gold">Lecture Time.</span>
            </motion.h1>

            {/* Sub-headline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-zinc-400 text-xl md:text-2xl max-w-2xl font-medium leading-relaxed mb-12"
            >
              Stop wasting 20 minutes on manual roll calls. Presently ensures 100% accurate, anti-proxy attendance verification that works instantly, so you can focus on teaching.
            </motion.p>

            {/* CTA Group */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start"
            >
              <button
                onClick={onGetStarted}
                className="group relative px-8 py-5 bg-[#D4AF37] text-[#0A0A0A] rounded-2xl font-black text-lg uppercase tracking-widest overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_20px_40px_rgba(212,175,55,0.2)]"
              >
                <div className="relative z-10 flex items-center gap-3">
                  <span>Get Started Free</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
              </button>

              <button className="px-8 py-5 bg-white/5 text-white border border-white/10 rounded-2xl font-black text-lg uppercase tracking-widest hover:bg-white/10 transition-all backdrop-blur-xl">
                See it in Action
              </button>
            </motion.div>

            {/* Social Proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1 }}
              className="mt-16 flex flex-wrap items-center justify-center lg:justify-start gap-8 opacity-50 grayscale hover:grayscale-0 transition-all"
            >
              <div className="flex items-center gap-2">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0A0A0A] bg-zinc-800 flex items-center justify-center overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <span className="text-xs font-black text-white ml-2 tracking-widest uppercase">10k+ Daily Users</span>
              </div>
              <div className="flex items-center gap-3 text-zinc-500">
                <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
                <span className="text-xs font-black text-white tracking-widest uppercase">Verified Secure</span>
              </div>
            </motion.div>
          </motion.div>

          {/* ─── RIGHT COLUMN: VISUAL ─── */}
          <div className="lg:col-span-5 relative hidden lg:block perspective-2000">
            <motion.div
              initial={{ opacity: 0, rotateY: 30, x: 50 }}
              animate={{ opacity: 1, rotateY: 15, x: 0 }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full aspect-[4/5] liquid-glass-gold rounded-[3rem] p-8 border-white/10 overflow-hidden group"
            >
              {/* Abstract UI Elements */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/10 to-transparent opacity-50" />

              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="p-4 bg-black/40 backdrop-blur-2xl rounded-3xl border border-white/5">
                    <Target className="text-[#D4AF37] w-8 h-8" />
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-[#D4AF37] tracking-widest uppercase">Accuracy</p>
                    <p className="text-2xl text-white font-black">99.9%</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-6 bg-white/5 backdrop-blur-3xl rounded-[2.5rem] border border-white/10">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center">
                        <CheckCircle2 className="text-green-500 w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-white font-black tracking-tight leading-none mb-1">Session Verified</p>
                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Geofence Match</p>
                      </div>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 2, delay: 1 }}
                        className="h-full bg-gradient-to-r from-green-500 to-[#D4AF37]"
                      />
                    </div>
                  </div>

                  <div className="p-6 bg-black/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Zap className="text-[#D4AF37] w-6 h-6 fill-[#D4AF37]" />
                      <span className="text-white font-black tracking-tight">Real-time Sync</span>
                    </div>
                    <div className="w-10 h-6 bg-white/5 rounded-full flex items-center px-1">
                      <motion.div
                        animate={{ x: [0, 16, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-4 h-4 bg-[#D4AF37] rounded-full shadow-[0_0_10px_#D4AF37]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Decoration */}
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#D4AF37]/10 blur-[60px] rounded-full"
              />
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};
