import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers } from 'lucide-react';
import { Logo } from './Logo';

export const LoadingScreen: React.FC<{ message?: string; showOnPublicPages?: boolean }> = ({ message = 'Syncing your flow', showOnPublicPages = true }) => {
  if (!showOnPublicPages) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[1000] bg-[#FDFDFF] dark:bg-[#08080A] flex flex-col items-center justify-center overflow-hidden">
      {/* Soft Animated Background Mesh */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40 dark:opacity-20">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-primary/10 blur-[120px] rounded-full"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -40, 0],
            y: [0, -60, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] bg-primary/5 blur-[100px] rounded-full"
        />
      </div>

      <div className="relative flex flex-col items-center gap-12">
        {/* Central Kinetic Loader with Skeuomorphic Depth */}
        <div className="relative w-40 h-40">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-[3rem] border-2 border-slate-200 dark:border-white/5 shadow-[6px_6px_12px_rgba(0,0,0,0.05),inset_2px_2px_4px_rgba(255,255,255,0.8)] dark:shadow-[inset_1px_1px_1px_rgba(255,255,255,0.05)]"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute inset-6 rounded-[2.5rem] border border-primary/20 shadow-inner"
          />

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative group">
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute inset-0 bg-primary/20 blur-2xl rounded-full"
              />
              <div className="w-14 h-14">
                <picture>
                  <source srcSet="/logo.avif" type="image/avif" />
                  <source srcSet="/logo.webp" type="image/webp" />
                  <img src="/logo.png" alt="Presently Logo" width={56} height={56} className="w-full" />
                </picture>
              </div>
            </div>
          </div>
        </div>

        {/* Status Messaging */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-col items-center gap-1 text-center">
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[10px] font-black tracking-[0.4em] text-primary uppercase opacity-60"
            >
              Syncing your flow
            </motion.div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
              {message}
            </h1>
          </div>

          {/* Modern Wave Loader */}
          <div className="flex gap-1.5 h-6 items-end">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                animate={{
                  height: [6, 24, 6],
                  backgroundColor: ['var(--primary)', 'var(--primary-container)', 'var(--primary)']
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: "easeInOut"
                }}
                className="w-1.5 rounded-full shadow-[0_0_8px_rgba(var(--primary-rgb),0.3)]"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Low-key Footer Status */}
      <div className="absolute bottom-12 flex gap-8 text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
          Core: Active
        </div>
        {/* <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
            V 2.5 Premium
         </div> */}
      </div>
    </div>
  );
};

export default LoadingScreen;
