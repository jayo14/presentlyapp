import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Smartphone, Download, Apple, Play, Check, Shield, MapPin, BarChart } from 'lucide-react';

const FEATURES = [
  {
    title: "One-Tap Verification",
    desc: "Mark your attendance in seconds using our secure geofence technology.",
    icon: <MapPin className="text-[#D4AF37]" />,
    ui: "attendance"
  },
  {
    title: "70% Threshold Tracker",
    desc: "Stay safe. Get notified before you drop below the attendance limit.",
    icon: <Shield className="text-[#D4AF37]" />,
    ui: "safety"
  },
  {
    title: "Lecture Analytics",
    desc: "Track your engagement and history across all courses in real-time.",
    icon: <BarChart className="text-[#D4AF37]" />,
    ui: "analytics"
  }
];

export const LandingMobileApp: React.FC = () => {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"]
  });

  const [activeFeature, setActiveFeature] = useState(0);

  // Controlled scroll mapping to features
  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      if (latest < 0.3) setActiveFeature(0);
      else if (latest < 0.6) setActiveFeature(1);
      else setActiveFeature(2);
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  const x = useTransform(scrollYProgress, [0, 1], [-50, 50]);
  const rotate = useTransform(scrollYProgress, [0, 1], [-10, 10]);
  const yMobile = useTransform(scrollYProgress, [0, 1], [30, -30]);

  return (
    <section ref={targetRef} className="py-40 bg-[#0A0A0A] overflow-hidden relative">
      {/* Background Blobs */}
      <div className="absolute top-1/2 left-0 w-[600px] h-[600px] bg-[#D4AF37]/5 blur-[160px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#D4AF37]/3 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-20 items-center">

          <div className="order-2 lg:order-1 space-y-12">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 mb-8 backdrop-blur-md"
              >
                <Smartphone size={16} className="text-[#D4AF37]" />
                <span className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.3em]">Cinematic Experience</span>
              </motion.div>

              <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-8 leading-[0.85]">
                The App for the <br />
                <span className="text-gradient-gold">Modern Student.</span>
              </h2>
            </div>

            <div className="space-y-8">
              {FEATURES.map((feature, i) => (
                <motion.div
                  key={i}
                  animate={{
                    opacity: activeFeature === i ? 1 : 0.3,
                    x: activeFeature === i ? 20 : 0
                  }}
                  className="flex gap-6 group cursor-pointer"
                  onClick={() => setActiveFeature(i)}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${activeFeature === i ? 'bg-[#D4AF37]/20 border-[#D4AF37]/40 shadow-lg' : 'bg-white/5 border-white/10'}`}>
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-black text-white mb-2">{feature.title}</h4>
                    <p className="text-zinc-500 font-medium text-sm leading-relaxed max-w-sm">
                      {feature.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-6 pt-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-4 px-8 py-5 bg-white/5 border border-white/10 rounded-2xl group hover:bg-white/10 transition-all shadow-xl"
              >
                <Apple size={32} className="text-white" />
                <div className="text-left">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">App Store</p>
                  <p className="text-xl text-white font-black leading-none">Download</p>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-4 px-8 py-5 bg-white/5 border border-white/10 rounded-2xl group hover:bg-white/10 transition-all shadow-xl"
              >
                <Play size={32} className="text-[#D4AF37] fill-[#D4AF37]" />
                <div className="text-left">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Google Play</p>
                  <p className="text-xl text-white font-black leading-none">Get it now</p>
                </div>
              </motion.button>
            </div>
          </div>

          <div className="order-1 lg:order-2 relative flex justify-center perspective-2000 h-[700px] items-center">
            <motion.div
              style={{ rotate, x, y: yMobile }}
              className="relative w-[340px] aspect-[1/2] liquid-glass-gold rounded-[4.5rem] border-white/15 p-7 shadow-[0_80px_160px_-40px_rgba(212,175,55,0.25)] overflow-hidden"
            >
              {/* App Mockup Content */}
              <div className="h-full w-full bg-zinc-950 rounded-[3.5rem] border border-white/10 p-8 flex flex-col justify-between relative overflow-hidden">

                <AnimatePresence mode="wait">
                  {activeFeature === 0 && (
                    <motion.div
                      key="attendance"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="h-full flex flex-col justify-between"
                    >
                      <div className="space-y-6">
                        <div className="w-16 h-16 bg-[#D4AF37] rounded-2xl flex items-center justify-center shadow-lg">
                          <span className="text-black font-black text-2xl">P</span>
                        </div>
                        <div className="h-4 w-3/4 bg-white/10 rounded-full" />
                        <div className="h-4 w-1/2 bg-white/10 rounded-full" />
                      </div>
                      <div className="space-y-6">
                        <div className="h-40 w-full bg-white/5 rounded-3xl border border-white/5 flex flex-col items-center justify-center p-4">
                           <MapPin className="text-[#D4AF37] w-10 h-10 mb-2 animate-bounce" />
                           <p className="text-white text-[10px] font-black uppercase tracking-widest">Campus Detected</p>
                        </div>
                        <div className="h-16 w-full bg-[#D4AF37] rounded-2xl flex items-center justify-center font-black uppercase tracking-widest text-black">
                          Mark Present
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeFeature === 1 && (
                    <motion.div
                      key="safety"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="h-full flex flex-col justify-center gap-12"
                    >
                      <div className="text-center">
                        <div className="w-24 h-24 rounded-full border-4 border-green-500/30 flex items-center justify-center mx-auto mb-6 bg-green-500/10">
                           <span className="text-3xl text-white font-black">82%</span>
                        </div>
                        <h4 className="text-white font-black text-xl mb-2">Attendance Safe</h4>
                        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">6 Lectures ahead of 70%</p>
                      </div>
                      <div className="space-y-4">
                         {[1,2,3].map(i => (
                           <div key={i} className="h-12 bg-white/5 rounded-xl border border-white/5 flex items-center px-4 justify-between">
                              <div className="w-20 h-2 bg-white/10 rounded-full" />
                              <div className="w-8 h-8 rounded-full bg-green-500/20" />
                           </div>
                         ))}
                      </div>
                    </motion.div>
                  )}

                  {activeFeature === 2 && (
                    <motion.div
                      key="analytics"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="h-full flex flex-col gap-8"
                    >
                      <h4 className="text-white font-black text-xl">Engagement</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {[1,2,3,4].map(i => (
                          <div key={i} className="aspect-square bg-white/5 rounded-2xl border border-white/5 p-4 flex flex-col justify-between">
                             <BarChart className="text-[#D4AF37] w-6 h-6" />
                             <div className="h-2 w-full bg-white/10 rounded-full" />
                          </div>
                        ))}
                      </div>
                      <div className="h-32 w-full bg-[#D4AF37]/5 rounded-3xl border border-[#D4AF37]/20 p-6">
                        <div className="flex justify-between items-end h-full gap-2">
                           {[40, 70, 45, 90, 65, 80].map((h, i) => (
                             <motion.div
                               key={i}
                               initial={{ height: 0 }}
                               animate={{ height: `${h}%` }}
                               className="w-full bg-[#D4AF37]/40 rounded-t-md"
                             />
                           ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Internal Glow */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#D4AF37]/5 to-transparent pointer-events-none" />
              </div>
            </motion.div>

            {/* Floating Badges */}
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-20 -right-10 p-4 liquid-glass-gold border-white/20 rounded-2xl z-20 backdrop-blur-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30">
                  <Check size={16} className="text-green-500" />
                </div>
                <span className="text-white text-[10px] font-black uppercase tracking-widest">Verified Integrity</span>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};
