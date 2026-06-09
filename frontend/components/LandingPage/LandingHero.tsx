import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconChevronRight, IconShieldCheck, IconMapPin, IconUsers, IconFingerprint, IconBell, IconArrowRight } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

export const Hero = () => {
  const [activeTab, setActiveTab] = useState('attendance');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section className="relative min-h-screen bg-[#FDF9F0] pt-40 pb-20 overflow-hidden flex items-center selection:bg-sungold/30">
      {/* Savage Background Orbs */}
      <div className="orb w-[800px] h-[800px] bg-sungold/10 -top-40 -right-40" />
      <div className="orb w-[600px] h-[600px] bg-blue-400/5 bottom-0 -left-20" />

      <div className="max-w-[1440px] mx-auto px-8 md:px-16 w-full grid lg:grid-cols-[1fr_1.1fr] gap-16 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col justify-center"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 bg-white border border-black/5 rounded-full shadow-sm w-fit"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-sungold animate-pulse" />
            <span className="text-[11px] font-medium tracking-tight text-neutral-600">NUC accreditation protocol v2.4</span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-[clamp(3rem,6vw,5.5rem)] text-neutral-900 leading-[0.9] tracking-[-0.04em] mb-8 font-medium"
          >
            Sovereign academic<br />
            <span className="italic  text-neutral-400">infrastructure.</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-neutral-500 mb-12 max-w-xl leading-relaxed "
          >
            Eliminate proxy attendance and institutional chaos. Presently provides the location-verified accountability Nigerian universities need for excellence.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center gap-6 mb-16"
          >
            <button className="skeuo-button-gold px-10 py-5 font-medium text-lg flex items-center gap-3 group">
              Deploy presently
              <IconArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-8 py-5 font-medium text-lg border border-black/10 rounded-[2rem] hover:bg-white/50 transition-colors">
              Watch the protocol
            </button>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex items-center gap-4 text-neutral-400"
          >
            <div className="flex -space-x-3">
               {[1,2,3].map(i => (
                 <div key={i} className="w-10 h-10 rounded-full border-2 border-[#FDF9F0] bg-neutral-200 overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${i + 20}`} alt="User" />
                 </div>
               ))}
            </div>
            <p className="text-sm font-medium">Trusted by 14+ institutions across Nigeria</p>
          </motion.div>
        </motion.div>

        {/* Interactive Dashboard Mockup - Appvia/NeuroAI Inspired */}
        <motion.div
          initial={{ opacity: 0, x: 40, rotateY: -10 }}
          animate={{ opacity: 1, x: 0, rotateY: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative perspective-2000"
        >
          <div className="skeuo-card w-full h-[640px] p-6 bg-white overflow-hidden flex flex-col">
            {/* Mockup Header */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-black/5">
              <div className="flex gap-2">
                {['#FF5F56', '#FFBD2E', '#27C93F'].map(c => (
                  <div key={c} className="w-3 h-3 rounded-full" style={{ backgroundColor: c }} />
                ))}
              </div>
              <div className="flex bg-neutral-100 p-1 rounded-full border border-black/5">
                {['attendance', 'analytics', 'verification'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "px-5 py-1.5 rounded-full text-[11px] font-medium transition-all duration-300",
                      activeTab === tab ? "bg-white shadow-sm text-neutral-900" : "text-neutral-400"
                    )}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Content Area */}
            <div className="flex-1 relative">
              <AnimatePresence mode="wait">
                {activeTab === 'attendance' && (
                  <motion.div
                    key="attendance"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="grid grid-cols-2 gap-6 h-full"
                  >
                    <div className="space-y-6">
                      <div className="p-6 rounded-3xl bg-neutral-50 border border-black/5">
                        <div className="flex items-center gap-3 mb-4">
                          <IconMapPin size={20} className="text-sungold" />
                          <span className="text-xs font-medium text-neutral-400">Live checkpoint</span>
                        </div>
                        <h4 className="text-2xl font-medium mb-1">Lecture Hall 7</h4>
                        <p className="text-[11px] text-neutral-400">Computer Science Dept</p>
                      </div>
                      <div className="p-6 rounded-3xl bg-neutral-50 border border-black/5">
                        <IconUsers size={20} className="text-blue-500 mb-4" />
                        <h4 className="text-2xl font-medium mb-1">428 / 500</h4>
                        <p className="text-[11px] text-neutral-400">Students checked-in</p>
                      </div>
                    </div>
                    <div className="p-6 rounded-3xl bg-neutral-900 text-white flex flex-col justify-center items-center text-center relative overflow-hidden">
                       <div className="w-32 h-32 rounded-full border border-white/10 flex items-center justify-center mb-6">
                          <div className="w-24 h-24 rounded-full bg-sungold flex items-center justify-center shadow-[0_0_40px_rgba(249,196,6,0.4)]">
                            <IconFingerprint size={48} className="text-neutral-900" />
                          </div>
                       </div>
                       <p className="text-xs font-medium text-neutral-400 mb-2">Biometric gateway</p>
                       <p className="text-lg font-medium">Scanning identity...</p>
                       <div className="absolute bottom-0 left-0 w-full h-1 bg-white/5">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="h-full bg-sungold"
                          />
                       </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'analytics' && (
                  <motion.div
                    key="analytics"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6 h-full"
                  >
                    <div className="grid grid-cols-3 gap-4">
                       {[1,2,3].map(i => (
                         <div key={i} className="h-32 rounded-2xl bg-neutral-50 border border-black/5" />
                       ))}
                    </div>
                    <div className="flex-1 rounded-3xl bg-neutral-50 border border-black/5 p-8">
                       <div className="flex items-center justify-between mb-8">
                          <h4 className="font-medium text-lg">Weekly engagement</h4>
                          <IconBell size={20} className="text-neutral-400" />
                       </div>
                       <div className="flex items-end gap-3 h-40">
                          {[60, 80, 45, 90, 70, 85, 95].map((h, i) => (
                            <motion.div
                              key={i}
                              initial={{ height: 0 }}
                              animate={{ height: `${h}%` }}
                              transition={{ delay: i * 0.1, duration: 1 }}
                              className="flex-1 bg-sungold/20 rounded-t-lg relative group"
                            >
                               <div className="absolute inset-0 bg-sungold opacity-0 group-hover:opacity-100 transition-opacity rounded-t-lg" />
                            </motion.div>
                          ))}
                       </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'verification' && (
                  <motion.div
                    key="verification"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex flex-col items-center justify-center h-full text-center p-12"
                  >
                    <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mb-8">
                       <IconShieldCheck size={40} className="text-green-500" />
                    </div>
                    <h4 className="text-3xl font-medium mb-4">Integrity verified</h4>
                    <p className="text-neutral-400 max-w-sm mb-12">Institutional protocol successfully cross-referenced with GPS, Biometrics, and Fingerprinting.</p>
                    <button className="px-8 py-3 bg-neutral-900 text-white rounded-full text-sm font-medium hover:scale-105 transition-transform">
                      Generate NUC Report
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Floating Glass Cards */}
          <motion.div
            initial={{ opacity: 0, x: -60, y: 100 }}
            animate={{ opacity: 1, x: -80, y: 140 }}
            transition={{ delay: 0.8, duration: 1.5 }}
            className="absolute -left-12 bottom-12 w-64 glass p-6 rounded-3xl shadow-2xl z-40"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <IconUsers size={20} className="text-blue-500" />
              </div>
              <div>
                <p className="text-[10px] font-medium text-neutral-400">Total verified</p>
                <p className="text-xl font-medium">124,802</p>
              </div>
            </div>
            <div className="flex gap-1 h-1.5 w-full">
              <div className="flex-[3] bg-sungold rounded-full" />
              <div className="flex-[1] bg-neutral-200 rounded-full" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 60, y: -40 }}
            animate={{ opacity: 1, x: 80, y: -80 }}
            transition={{ delay: 1, duration: 1.5 }}
            className="absolute -right-8 top-20 w-56 glass p-6 rounded-3xl shadow-2xl z-40"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-[10px] font-medium text-neutral-400">NUC standard met</span>
            </div>
            <p className="text-sm font-medium leading-tight">Encryption layer v3.0 successfully active.</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
