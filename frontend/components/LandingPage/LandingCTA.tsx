import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from '@phosphor-icons/react';

export const CTASection = () => (
  <section className="py-64 bg-presently-black text-center relative overflow-hidden">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/15 blur-[160px] rounded-full pointer-events-none animate-pulse-glow" />

    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="max-w-5xl mx-auto relative z-10 px-8"
    >
      <h2 className="font-headline text-6xl md:text-8xl lg:text-[100px] text-white tracking-tighter mb-12 leading-[0.9] font-black">
        Every class.<br />
        Every student.<br />
        <span className="text-primary">Present.</span>
      </h2>
      <p className="text-white/60 text-xl md:text-2xl mb-20 max-w-2xl mx-auto leading-relaxed font-black tracking-tight">
        Join institutions already running smarter with Presently. Setup takes less than 5 minutes.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
        <a href="/register" className="w-full sm:w-auto skeuo-button-gold px-14 py-7 rounded-3xl font-black text-xl hover:scale-105 transition-all flex items-center justify-center gap-3">
          Get started for free <ArrowUpRight size={28} weight="bold" />
        </a>
        <a href="/demo" className="w-full sm:w-auto px-14 py-7 rounded-3xl font-black text-xl border-2 border-white/10 text-white hover:bg-white/5 transition-all backdrop-blur-sm flex items-center justify-center gap-3">
          Request a demo
        </a>
      </div>
    </motion.div>

    {/* Background Decorative Elements */}
    <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
  </section>
);
