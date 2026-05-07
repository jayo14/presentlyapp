import React, { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight, Sparkles, Target,
  CheckCircle2, Zap, ShieldCheck
} from 'lucide-react';
import { gsap } from 'gsap';
import { Button } from '../Button';

interface LandingHeroProps {
  onGetStarted: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onGetStarted }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subheadlineRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);

  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 300], [1, 0.9]);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

    tl.fromTo(headlineRef.current,
      { y: 60, opacity: 0 },
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
      className="relative min-h-[100vh] flex items-center justify-center pt-20 pb-32 overflow-hidden bg-background"
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
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary blur-[120px] rounded-full"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.05, 0.08, 0.05],
            x: [0, -40, 0],
            y: [0, 20, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-primary blur-[120px] rounded-full"
        />
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
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 backdrop-blur-md"
            >
              <Sparkles size={14} className="text-primary" />
              <span className="text-primary text-[10px] font-black uppercase tracking-[0.3em]">Redesigning Academic Life</span>
            </motion.div>

            {/* Headline */}
            <h1
              ref={headlineRef}
              className="text-5xl md:text-7xl lg:text-8xl font-black text-text tracking-tighter leading-[0.85] mb-8 opacity-0"
            >
              Attendance that <span className="text-primary">Actually Matters.</span>
            </h1>

            {/* Sub-headline */}
            <p
              ref={subheadlineRef}
              className="text-textMuted text-xl md:text-2xl max-w-2xl font-medium leading-relaxed mb-12 opacity-0"
            >
              A beautifully designed mobile-native academic operating system. One tap to mark your presence, real-time insights to track your progress.
            </p>

            {/* CTA Group */}
            <div
              ref={ctaRef}
              className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start opacity-0"
            >
              <Button
                size="lg"
                onClick={onGetStarted}
                className="px-10 h-16"
              >
                Get Started Free
                <ArrowRight size={20} />
              </Button>

              <Button variant="outline" size="lg" className="px-10 h-16">
                Watch Demo
              </Button>
            </div>

            {/* Social Proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 2 }}
              className="mt-20 flex flex-wrap items-center justify-center lg:justify-start gap-10 opacity-60 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-surfaceContainer flex items-center justify-center overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?img=${i+20}`} alt="User" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <span className="text-[10px] font-black text-text ml-2 tracking-[0.2em] uppercase">Trusted by 50k+ Students</span>
              </div>
              <div className="flex items-center gap-3 text-textMuted">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <span className="text-[10px] font-black text-text tracking-[0.2em] uppercase">Verified Integrity</span>
              </div>
            </motion.div>
          </motion.div>

          {/* ─── RIGHT COLUMN: VISUAL ─── */}
          <div className="lg:col-span-5 relative hidden lg:block perspective-2000">
            <div
              ref={visualRef}
              className="relative w-full aspect-[4/5] bg-surface rounded-[4rem] p-10 border border-outline overflow-hidden group shadow-premium opacity-0"
            >
              {/* Internal Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-40" />

              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="p-5 bg-surfaceContainer backdrop-blur-3xl rounded-[2rem] border border-outline shadow-xl"
                  >
                    <Target className="text-primary w-10 h-10" />
                  </motion.div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-primary tracking-[0.3em] uppercase mb-1">Live Momentum</p>
                    <p className="text-3xl text-text font-black tracking-tighter">99.9%</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="p-8 bg-surfaceContainer/50 backdrop-blur-[40px] rounded-[3rem] border border-outline shadow-sm">
                    <div className="flex items-center gap-5 mb-5">
                      <div className="w-14 h-14 rounded-[1.2rem] bg-success/10 flex items-center justify-center text-success">
                        <CheckCircle2 size={32} />
                      </div>
                      <div>
                        <p className="text-text text-lg font-black tracking-tight leading-none mb-1">Marked Present</p>
                        <p className="text-textMuted text-[10px] font-bold uppercase tracking-[0.2em]">Verified Securely</p>
                      </div>
                    </div>
                    <div className="h-2.5 bg-surfaceContainer rounded-full overflow-hidden p-0.5">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: "100%" }}
                        transition={{ duration: 2.5, delay: 1, ease: "circOut" }}
                        className="h-full bg-primary rounded-full"
                      />
                    </div>
                  </div>

                  <div className="p-8 bg-surface backdrop-blur-[50px] rounded-[3rem] border border-outline flex items-center justify-between shadow-soft">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                        <Zap size={24} className="fill-primary" />
                      </div>
                      <span className="text-text text-lg font-black tracking-tight">Real-time OS</span>
                    </div>
                    <div className="w-12 h-7 bg-surfaceContainer rounded-full flex items-center px-1.5 border border-outline">
                      <motion.div
                        animate={{ x: [0, 20, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="w-5 h-5 bg-primary rounded-full shadow-[0_0_15px_rgba(212,175,55,0.4)]"
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
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-20 -right-20 w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
