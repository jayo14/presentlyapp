import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  MapPin,
  ShieldCheck,
  Users,
  Zap,
  CheckCircle2,
  Navigation,
  Globe,
  Lock,
  MousePointer2
} from 'lucide-react';

interface LandingHeroProps {
  onGetStarted: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onGetStarted }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 40,
        y: (e.clientY / window.innerHeight - 0.5) * 40,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Smooth parallax springs
  const springConfig = { stiffness: 150, damping: 30 };
  const x = useSpring(mousePosition.x, springConfig);
  const y = useSpring(mousePosition.y, springConfig);

  return (
    <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden bg-[#0A0A0A] -mt-20 md:-mt-28 selection:bg-[#D4AF37] selection:text-black">
      {/* ─── LIQUID GLASS BACKGROUND ─── */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Animated Liquid Orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 80, 0],
            y: [0, 40, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[15%] -left-[5%] w-[80%] h-[80%] bg-[#D4AF37] opacity-[0.06] blur-[140px] rounded-full"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -100, 0],
            y: [0, 60, 0],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-[30%] -right-[10%] w-[70%] h-[70%] bg-[#2B1B12] opacity-[0.2] blur-[120px] rounded-full"
        />

        {/* Grainy Noise Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] mix-blend-overlay"></div>

        {/* Cyber Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(212,175,55,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(212,175,55,0.03)_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_60%,transparent_100%)]"></div>
      </div>

      <div className="container mx-auto px-4 md:px-8 relative z-10 pt-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 items-center">

          {/* ─── LEFT COLUMN: CONTENT ─── */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 space-y-10 text-center lg:text-left"
          >
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex justify-center lg:justify-start"
              >
                <Badge className="bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20 px-5 py-2 rounded-full text-[10px] font-black tracking-[0.2em] uppercase backdrop-blur-2xl ring-1 ring-white/5">
                  Future of Attendance
                </Badge>
              </motion.div>

              <h1 className="text-5xl md:text-7xl lg:text-8xl font-headline font-black text-white leading-[0.95] tracking-tighter">
                Attendance <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#F4CF57] to-[#D4AF37] drop-shadow-[0_0_20px_rgba(212,175,55,0.4)] italic font-serif pr-4">
                  perfected
                </span> <br/>
                by GPS.
              </h1>

              <p className="text-lg md:text-2xl text-zinc-400 max-w-xl leading-relaxed mx-auto lg:mx-0 font-medium">
                No cheating. No stress. Just presence. Built for modern campuses with <span className="text-white">unbreakable</span> geofencing.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-5">
              <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={onGetStarted}
                  className="bg-[#D4AF37] hover:bg-[#F4CF57] text-[#0A0A0A] font-black px-10 py-8 rounded-[2rem] text-xl shadow-[0_20px_40px_rgba(212,175,55,0.25)] transition-all flex items-center gap-3 group relative overflow-hidden"
                >
                  <span className="relative z-10">Get Started</span>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform relative z-10" />
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  className="border-zinc-800 text-white hover:bg-zinc-900 px-10 py-8 rounded-[2rem] text-xl transition-all backdrop-blur-md bg-white/5 ring-1 ring-white/10"
                  onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Watch Demo
                </Button>
              </motion.div>
            </div>

            {/* Micro-Social Proof */}
            <div className="pt-12 flex flex-wrap items-center justify-center lg:justify-start gap-10 border-t border-white/5">
              <div className="flex flex-col gap-1 text-zinc-500">
                <div className="flex items-center gap-2">
                   <div className="flex -space-x-2">
                      {[1,2,3].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0A0A0A] bg-zinc-800 flex items-center justify-center overflow-hidden">
                           <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" className="w-full h-full object-cover" />
                        </div>
                      ))}
                   </div>
                   <span className="text-xs font-black text-white ml-2 tracking-widest uppercase">10k+ Daily Users</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-zinc-500 group cursor-default">
                <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-[#D4AF37]/50 transition-colors">
                   <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div className="text-left">
                   <p className="text-[10px] font-black text-white tracking-widest uppercase">Verified</p>
                   <p className="text-[10px] font-bold">Anti-Proxy System</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ─── RIGHT COLUMN: INTERACTIVE MOCKUP ─── */}
          <div className="lg:col-span-5 relative hidden lg:block">
            {/* Parallax Container */}
            <motion.div
              style={{ x: useTransform(x, v => v * 0.5), y: useTransform(y, v => v * 0.5) }}
              className="relative perspective-3000"
            >
              {/* Main Phone Frame */}
              <motion.div
                initial={{ opacity: 0, rotateY: 25, y: 40 }}
                animate={{ opacity: 1, rotateY: 15, y: 0 }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                className="relative mx-auto w-[360px] h-[740px] bg-zinc-950 rounded-[4rem] border-[14px] border-zinc-900 shadow-[0_60px_120px_-20px_rgba(0,0,0,0.8)] overflow-hidden glass-reflection ring-2 ring-white/5"
              >
                {/* Dynamic Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-9 bg-zinc-900 rounded-b-[2rem] z-40 flex items-center justify-center">
                   <div className="w-12 h-1 bg-white/5 rounded-full"></div>
                </div>

                {/* UI CONTENT */}
                <div className="absolute inset-0 flex flex-col pt-14 px-8 pb-10 bg-[#0A0A0A]">
                  {/* Dashboard Header */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="space-y-1">
                       <p className="text-[10px] font-black text-[#D4AF37] tracking-[0.2em] uppercase">Session Active</p>
                       <h2 className="text-2xl font-black text-white tracking-tight">ENG 402</h2>
                    </div>
                    <div className="w-14 h-14 bg-gradient-to-br from-[#D4AF37] to-[#F4CF57] rounded-3xl flex items-center justify-center shadow-[0_15px_30px_rgba(212,175,55,0.3)]">
                       <Navigation className="text-black w-7 h-7" />
                    </div>
                  </div>

                  {/* Visual Map / Radius */}
                  <div className="relative flex-1 bg-white/5 rounded-[3rem] border border-white/5 overflow-hidden flex items-center justify-center mb-8">
                     <div className="absolute inset-0 bg-[linear-gradient(rgba(212,175,55,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(212,175,55,0.05)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

                     {/* GPS Pulse */}
                     <div className="relative z-10">
                        <motion.div
                          animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
                          transition={{ duration: 4, repeat: Infinity }}
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-[#D4AF37]/10 rounded-full"
                        />
                        <div className="w-8 h-8 bg-[#D4AF37] rounded-full shadow-[0_0_40px_#D4AF37] border-4 border-[#0A0A0A] flex items-center justify-center relative z-20">
                           <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                     </div>

                     <div className="absolute bottom-6 inset-x-6">
                        <div className="bg-black/60 backdrop-blur-2xl border border-white/10 p-4 rounded-3xl flex items-center justify-between shadow-2xl">
                           <div className="flex items-center gap-3">
                              <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></div>
                              <span className="text-[10px] font-black text-white uppercase tracking-widest">Geofence Match</span>
                           </div>
                           <span className="text-[10px] font-bold text-zinc-500">RADIUS 50M</span>
                        </div>
                     </div>
                  </div>

                  {/* Check-in CTA */}
                  <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-8 space-y-6 shadow-2xl relative group">
                     <div className="flex items-center justify-between">
                        <div className="space-y-1">
                           <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Accuracy</p>
                           <p className="text-white font-black">±1.2m</p>
                        </div>
                        <div className="text-right space-y-1">
                           <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Verification</p>
                           <div className="flex items-center gap-1 justify-end text-green-500">
                              <CheckCircle2 size={12} />
                              <span className="text-[10px] font-black uppercase">Secure</span>
                           </div>
                        </div>
                     </div>
                     <motion.button
                       whileTap={{ scale: 0.95 }}
                       className="w-full bg-gradient-to-r from-[#D4AF37] to-[#F4CF57] text-[#0A0A0A] font-black py-6 rounded-[2rem] text-sm uppercase tracking-widest shadow-[0_20px_40px_rgba(212,175,55,0.3)] hover:scale-[1.02] transition-transform"
                     >
                       Mark Presence
                     </motion.button>
                  </div>
                </div>
              </motion.div>

              {/* ─── FLOATING OVERLAYS ─── */}

              {/* Security Tag */}
              <motion.div
                style={{ x: useTransform(x, v => v * 1.2), y: useTransform(y, v => v * 1.2) }}
                className="absolute -top-10 -right-20 w-64 p-6 bg-white/5 backdrop-blur-[50px] border border-white/10 rounded-[2.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.5)] z-20 group"
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-[#D4AF37]/50 transition-colors">
                     <Lock className="w-6 h-6 text-[#D4AF37]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-[#D4AF37] tracking-widest uppercase mb-1">Device ID</p>
                    <p className="text-lg text-white font-black tracking-tight leading-none">TRUSTED ✅</p>
                  </div>
                </div>
              </motion.div>

              {/* Stats Card */}
              <motion.div
                style={{ x: useTransform(x, v => v * -1.5), y: useTransform(y, v => v * -1.5) }}
                className="absolute bottom-20 -left-32 w-56 p-6 bg-white/5 backdrop-blur-[50px] border border-white/10 rounded-[2.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.5)] z-20"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                     <Zap className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
                     <span className="text-[10px] font-black text-white tracking-widest uppercase">Live Signal</span>
                  </div>
                  <div className="h-3 bg-zinc-900 rounded-full overflow-hidden p-0.5 border border-white/5">
                     <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "94%" }}
                        transition={{ duration: 2.5, delay: 0.5, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-[#D4AF37] to-white rounded-full"
                     />
                  </div>
                  <p className="text-[11px] font-black text-[#D4AF37] uppercase tracking-tighter">94% Attendance Score</p>
                </div>
              </motion.div>

              {/* Cursor Interaction Visual */}
              <motion.div
                style={{ x: useTransform(x, v => v * 2.5), y: useTransform(y, v => v * 2.5) }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#D4AF37]/5 blur-[120px] rounded-full pointer-events-none -z-10"
              />
            </motion.div>
          </div>

        </div>
      </div>

      <style>{`
        .glass-reflection { position: relative; }
        .glass-reflection::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 100%;
          background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.02) 100%);
          pointer-events: none;
          z-index: 50;
        }
        .perspective-3000 { perspective: 3000px; }
      `}</style>
    </section>
  );
};
