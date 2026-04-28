import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Smartphone, Download, Apple, Play } from 'lucide-react';

export const LandingMobileApp: React.FC = () => {
  const targetRef = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"]
  });

  const x = useTransform(scrollYProgress, [0, 1], [-100, 100]);
  const rotate = useTransform(scrollYProgress, [0, 1], [-15, 15]);

  return (
    <section ref={targetRef} className="py-32 bg-[#0A0A0A] overflow-hidden relative">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          <div className="order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 mb-8"
            >
              <Smartphone size={16} className="text-[#D4AF37]" />
              <span className="text-[#D4AF37] text-xs font-black uppercase tracking-[0.2em]">Mobile First</span>
            </motion.div>

            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-8 leading-[0.9]">
              Attendance in <br />
              <span className="text-gradient-gold">Your Pocket.</span>
            </h2>

            <p className="text-zinc-400 text-xl font-medium leading-relaxed mb-12 max-w-xl">
              Our mobile app is designed for speed. Check-in takes less than 3 seconds with our proprietary background geofence verification.
            </p>

            <div className="flex flex-col sm:flex-row gap-6">
              <button className="flex items-center gap-4 px-8 py-5 bg-white/5 border border-white/10 rounded-2xl group hover:bg-white/10 transition-all">
                <Apple size={32} className="text-white" />
                <div className="text-left">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Download on the</p>
                  <p className="text-xl text-white font-black leading-none">App Store</p>
                </div>
              </button>

              <button className="flex items-center gap-4 px-8 py-5 bg-white/5 border border-white/10 rounded-2xl group hover:bg-white/10 transition-all">
                <Play size={32} className="text-[#D4AF37] fill-[#D4AF37]" />
                <div className="text-left">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Get it on</p>
                  <p className="text-xl text-white font-black leading-none">Google Play</p>
                </div>
              </button>
            </div>
          </div>

          <div className="order-1 lg:order-2 relative flex justify-center">
            <motion.div
              style={{ rotate, x }}
              className="relative w-[300px] aspect-[1/2] liquid-glass-gold rounded-[3.5rem] border-white/10 p-6 shadow-[0_60px_120px_-20px_rgba(212,175,55,0.2)] overflow-hidden"
            >
              {/* App Mockup Content */}
              <div className="h-full w-full bg-zinc-950 rounded-[2.8rem] border border-white/5 p-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-[#D4AF37] rounded-2xl" />
                  <div className="h-4 w-3/4 bg-white/10 rounded-full" />
                  <div className="h-4 w-1/2 bg-white/10 rounded-full" />
                </div>
                <div className="space-y-6">
                  <div className="h-32 w-full bg-white/5 rounded-[2rem] border border-white/5" />
                  <div className="h-14 w-full bg-[#D4AF37] rounded-2xl" />
                </div>
              </div>
            </motion.div>

            {/* Floating Badges */}
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-20 -right-10 p-4 liquid-glass border-white/10 rounded-2xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Check size={16} className="text-green-500" />
                </div>
                <span className="text-white text-xs font-black uppercase tracking-widest">Verified</span>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};
