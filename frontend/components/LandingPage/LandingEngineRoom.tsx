import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import { IconCpu, IconShieldCheck, IconMapPin, IconShare, IconFingerprint, IconSettings, IconCircleCheck } from '@tabler/icons-react';

const STAGES = [
  {
    id: 'gps',
    title: 'Precision lock',
    desc: 'Multi-source GPS & Wi-Fi triangulation verifies the student is physically within the lecture hall boundary.',
    icon: IconMapPin,
    color: '#F9C406'
  },
  {
    id: 'bio',
    title: 'Biometric handshake',
    desc: 'On-device hardware-backed authentication ensures the identity of the student is immutable.',
    icon: IconFingerprint,
    color: '#22C55E'
  },
  {
    id: 'sync',
    title: 'Sovereign sync',
    desc: 'Records are cryptographically signed and synchronized with the institutional data lake.',
    icon: IconShare,
    color: '#3B82F6'
  }
];

export const LandingEngineRoom: React.FC = () => {
  const [activeStage, setActiveStage] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);

  // Autoplay Logic
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setActiveStage((prev) => (prev + 1) % STAGES.length);
    }, 5000); // 5 seconds per stage

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  // Scroll Synchronization
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  // Map scroll progress to stage indices
  useEffect(() => {
    const unsubscribe = scrollYProgress.onChange(v => {
      // Only sync scroll if user is actively scrolling in the middle of the section
      // and we want to transition between stages
      if (v > 0.3 && v < 0.7) {
        setIsAutoPlaying(false);
        const stageIndex = Math.floor(((v - 0.3) / 0.4) * STAGES.length);
        if (stageIndex >= 0 && stageIndex < STAGES.length) {
          setActiveStage(stageIndex);
        }
      } else if (v >= 0.7 || v <= 0.3) {
        // Resume autoplay if they scroll past or haven't reached the "active" zone
        setIsAutoPlaying(true);
      }
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  const handleStageClick = (index: number) => {
    setActiveStage(index);
    setIsAutoPlaying(false);
    // Optional: Resume autoplay after a delay
    setTimeout(() => setIsAutoPlaying(true), 15000);
  };

  return (
    <section id="governance" ref={sectionRef} className="py-40 bg-white dark:bg-surface relative overflow-hidden">
      {/* Background Accent */}
      <div className="orb w-[1000px] h-[1000px] bg-sungold/5 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

      <div className="max-w-[1440px] mx-auto px-8 md:px-16 grid lg:grid-cols-2 gap-24 items-center relative z-10">

        {/* Content Side */}
        <div>
          <motion.div
             initial={{ opacity: 0, x: -20 }}
             whileInView={{ opacity: 1, x: 0 }}
             className="flex items-center gap-4 mb-8"
          >
             <div className="w-10 h-px bg-sungold" />
             <span className="text-sungold font-medium text-[11px] tracking-tight">How it works</span>
          </motion.div>

           <h2 className="text-[clamp(2.5rem,4vw,4.5rem)] tracking-[-0.04em] text-neutral-900 dark:text-neutral-50 leading-[0.9] font-medium mb-12">
             Reliable by<br />
             <span className="text-neutral-400 dark:text-neutral-500 italic ">design.</span>
           </h2>

          <div className="space-y-6 mb-16">
            {STAGES.map((stage, i) => (
              <button
                key={stage.id}
                onClick={() => handleStageClick(i)}
                className={`w-full flex gap-8 p-8 rounded-[2rem] border transition-all duration-700 text-left group ${
                  activeStage === i
                    ? 'bg-neutral-50 dark:bg-surface-container-low border-black/5 dark:border-white/10 shadow-xl scale-[1.02]'
                    : 'bg-transparent border-transparent opacity-40 hover:opacity-100'
                }`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-700 ${
                  activeStage === i ? 'bg-sungold text-neutral-900 shadow-lg shadow-sungold/20' : 'bg-neutral-100 dark:bg-white/10 text-neutral-400 dark:text-neutral-500'
                }`}>
                  <stage.icon size={28} />
                </div>
                <div>
                   <h4 className={`text-xl font-medium mb-2 tracking-tight ${activeStage === i ? 'text-neutral-900 dark:text-neutral-50' : 'text-neutral-500 dark:text-neutral-400'}`}>
                    {stage.title}
                  </h4>
                   <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed  text-base max-w-sm">
                    {stage.desc}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Visual Side */}
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
             className="bg-neutral-50 dark:bg-surface-container-low rounded-[3rem] p-12 border border-black/5 dark:border-white/5 shadow-2xl relative overflow-hidden aspect-square flex items-center justify-center"
          >
            <AnimatePresence mode="wait">
               <motion.div
                 key={activeStage}
                 initial={{ opacity: 0, scale: 0.8 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 1.1 }}
                 transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                 className="relative z-10 w-full flex flex-col items-center"
               >
                  <div className="relative w-64 h-64 flex items-center justify-center">
                     {/* Concentric Pulse Rings */}
                     {[1, 0.7, 0.4].map((s, i) => (
                       <motion.div
                         key={i}
                         initial={{ scale: 0.5, opacity: 0 }}
                         animate={{
                           scale: [s, s * 1.6],
                           opacity: [0.1, 0]
                         }}
                         transition={{
                           duration: 4,
                           repeat: Infinity,
                           delay: i * 0.8,
                           ease: "easeOut"
                         }}
                         className="absolute inset-0 border-[2px] border-sungold rounded-full"
                       />
                     ))}

                      <div className="relative w-40 h-40 rounded-[2.5rem] bg-white dark:bg-surface border border-black/5 dark:border-white/10 flex items-center justify-center shadow-2xl">
                        <motion.div
                          animate={{ rotate: [0, 5, 0, -5, 0] }}
                          transition={{ duration: 4, repeat: Infinity }}
                        >
                          {React.createElement(STAGES[activeStage].icon, {
                            size: 80,
                            className: "text-sungold"
                          })}
                        </motion.div>
                     </div>
                  </div>

                  <div className="mt-16 text-center">
                     <p className="text-[11px] font-medium tracking-tight text-sungold mb-3">Protocol active</p>
                      <h3 className="text-3xl font-medium text-neutral-900 dark:text-neutral-50 tracking-tight">
                        {STAGES[activeStage].title}
                     </h3>
                      <div className="mt-8 flex items-center justify-center gap-3 py-3 px-6 bg-white dark:bg-surface rounded-full border border-black/5 dark:border-white/10 shadow-sm">
                         <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                         <span className="text-xs font-medium tracking-tight text-neutral-500 dark:text-neutral-400">Verified verification</span>
                      </div>
                  </div>
               </motion.div>
            </AnimatePresence>

            {/* Floating Telemetry - Glass Effect */}
            <motion.div
               animate={{ y: [0, -10, 0] }}
               transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
               className="absolute top-10 right-10 glass p-5 rounded-2xl shadow-xl z-20"
            >
                <div className="flex items-center gap-2 mb-1">
                   <IconCpu size={18} className="text-sungold" />
                   <span className="font-medium text-[10px] tracking-tight text-neutral-400 dark:text-neutral-500">Telemetry</span>
                </div>
                <p className="text-[12px] font-medium text-neutral-600 dark:text-neutral-300">14ms response</p>
            </motion.div>

            <motion.div
               animate={{ y: [0, 10, 0] }}
               transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
               className="absolute bottom-10 left-10 glass p-5 rounded-2xl shadow-xl z-20"
            >
                <div className="flex items-center gap-2 mb-1">
                   <IconShieldCheck size={18} className="text-green-500" />
                   <span className="font-medium text-[10px] tracking-tight text-neutral-400 dark:text-neutral-500">Integrity</span>
                </div>
                <p className="text-[12px] font-medium text-neutral-600 dark:text-neutral-300">AES-256 validated</p>
            </motion.div>
          </motion.div>
        </div>

      </div>
    </section>
  );
};
