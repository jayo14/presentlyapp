import React, { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Target,
  CheckCircle2,
  Zap
} from 'lucide-react';
import gsap from 'gsap';

interface LandingHeroProps {
  onGetStarted: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onGetStarted }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subheadlineRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.98]);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

    tl.fromTo(headlineRef.current,
      { y: 100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.5, delay: 0.5 }
    )
    .fromTo(subheadlineRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2 },
      "-=1"
    )
    .fromTo(ctaRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 1 },
      "-=0.8"
    )
    .fromTo(visualRef.current,
      { scale: 0.8, opacity: 0, rotateY: 45, x: 100 },
      { scale: 1, opacity: 1, rotateY: 12, x: 0, duration: 2, ease: 'elastic.out(1, 0.75)' },
      "-=1.5"
    );
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[100vh] flex items-center justify-center pt-20 pb-32 overflow-hidden bg-[#0A0A0A]"
    >
      {/* ─── ATMOSPHERIC BACKGROUND ─── */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.03, 0.05, 0.03],
            x: [0, 50, 0],
            y: [0, -30, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#D4AF37] blur-[120px] rounded-full"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.05, 0.08, 0.05],
            x: [0, -40, 0],
            y: [0, 20, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-[#D4AF37] blur-[120px] rounded-full"
        />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
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
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 mb-8 backdrop-blur-md"
            >
              <Sparkles size={14} className="text-[#D4AF37]" />
              <span className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.3em]">Restoring Academic Integrity</span>
            </motion.div>

            {/* Headline */}
            <h1
              ref={headlineRef}
              className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter leading-[0.85] mb-8 opacity-0"
            >
              Attendance that <span className="text-gradient-gold">Works for You.</span>
            </h1>

            {/* Sub-headline */}
            <p
              ref={subheadlineRef}
              className="text-zinc-400 text-xl md:text-2xl max-w-2xl font-medium leading-relaxed mb-12 opacity-0"
            >
              Never miss a mark because of a lost sheet or manual signing chaos. Presently secures your attendance with one tap, ensuring you get the credit you deserve for every lecture.
            </p>

            {/* CTA Group */}
            <div
              ref={ctaRef}
              className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start opacity-0"
            >
              <button
                onClick={onGetStarted}
                className="group relative px-10 py-6 bg-[#D4AF37] text-[#0A0A0A] rounded-2xl font-black text-lg uppercase tracking-widest overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_20px_40px_rgba(212,175,55,0.3)]"
              >
                <div className="relative z-10 flex items-center gap-3">
                  <span>Join Presently</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
              </button>

              <button className="px-10 py-6 bg-white/5 text-white border border-white/10 rounded-2xl font-black text-lg uppercase tracking-widest hover:bg-white/10 transition-all backdrop-blur-xl">
                See How it Works
              </button>
            </div>

            {/* Social Proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 2 }}
              className="mt-20 flex flex-wrap items-center justify-center lg:justify-start gap-10 opacity-60 grayscale hover:grayscale-0 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-[#0A0A0A] bg-zinc-800 flex items-center justify-center overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?img=${i+20}`} alt="User" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <span className="text-[10px] font-black text-white ml-2 tracking-[0.2em] uppercase">Trusted by 50k+ Students</span>
              </div>
              <div className="flex items-center gap-3 text-zinc-500">
                <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
                <span className="text-[10px] font-black text-white tracking-[0.2em] uppercase">Verified Integrity</span>
              </div>
            </motion.div>
          </motion.div>

          {/* ─── RIGHT COLUMN: VISUAL ─── */}
          <div className="lg:col-span-5 relative hidden lg:block perspective-2000">
            <div
              ref={visualRef}
              className="relative w-full aspect-[4/5] liquid-glass-gold rounded-[4rem] p-10 border-white/10 overflow-hidden group shadow-[0_40px_100px_rgba(212,175,55,0.15)] opacity-0"
            >
              {/* Internal Glass Panel */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/15 to-transparent opacity-40" />

              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="p-5 bg-black/50 backdrop-blur-3xl rounded-[2rem] border border-white/10 shadow-2xl"
                  >
                    <Target className="text-[#D4AF37] w-10 h-10" />
                  </motion.div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-[#D4AF37] tracking-[0.3em] uppercase mb-1">Live Accuracy</p>
                    <p className="text-3xl text-white font-black tracking-tighter">99.99%</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="p-8 bg-white/5 backdrop-blur-[40px] rounded-[3rem] border border-white/10 shadow-xl">
                    <div className="flex items-center gap-5 mb-5">
                      <div className="w-14 h-14 rounded-[1.2rem] bg-green-500/20 flex items-center justify-center">
                        <CheckCircle2 className="text-green-500 w-8 h-8" />
                      </div>
                      <div>
                        <p className="text-white text-lg font-black tracking-tight leading-none mb-1">Attendance Marked</p>
                        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em]">Geofence Verified</p>
                      </div>
                    </div>
                    <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: "100%" }}
                        transition={{ duration: 2.5, delay: 1, ease: "circOut" }}
                        className="h-full bg-gradient-to-r from-green-500 via-[#D4AF37] to-white"
                      />
                    </div>
                  </div>

                  <div className="p-8 bg-black/60 backdrop-blur-[50px] rounded-[3rem] border border-white/10 flex items-center justify-between shadow-2xl">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-full flex items-center justify-center">
                        <Zap className="text-[#D4AF37] w-7 h-7 fill-[#D4AF37] animate-pulse" />
                      </div>
                      <span className="text-white text-lg font-black tracking-tight">Real-time Sync</span>
                    </div>
                    <div className="w-12 h-7 bg-white/10 rounded-full flex items-center px-1.5">
                      <motion.div
                        animate={{ x: [0, 20, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="w-5 h-5 bg-[#D4AF37] rounded-full shadow-[0_0_15px_#D4AF37]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative Liquid Orb */}
              <motion.div
                animate={{
                  y: [0, -30, 0],
                  scale: [1, 1.1, 1],
                  rotate: [0, 90, 0]
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-20 -right-20 w-64 h-64 bg-[#D4AF37]/20 blur-[80px] rounded-full pointer-events-none"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
