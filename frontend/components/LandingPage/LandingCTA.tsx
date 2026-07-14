import React from 'react';
import { motion } from 'framer-motion';
import { IconArrowUpRight, IconBuildings, IconShieldCheck, IconArrowRight, IconClipboardCheck } from '@tabler/icons-react';

export const CTASection = () => (
  <section className="py-40 bg-[#231F0F] text-center relative overflow-hidden">
    {/* Savage Ambient Lighting */}
    <div className="orb w-[1200px] h-[1200px] bg-sungold/10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-6xl mx-auto relative z-10 px-8"
    >
      <motion.div
         initial={{ opacity: 0, y: 20 }}
         whileInView={{ opacity: 1, y: 0 }}
         transition={{ delay: 0.2 }}
         className="inline-flex items-center gap-3 mb-12 px-6 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl mx-auto"
      >
         <IconShieldCheck size={20} className="text-sungold" />
          <span className="text-white font-medium text-[11px] tracking-tight">Trusted by institutions</span>
      </motion.div>

      <h2 className="text-[clamp(3rem,6vw,5.5rem)] text-white tracking-[-0.04em] mb-12 leading-[0.9] font-medium">
        Secure your institution's<br />
        academic <span className="text-sungold italic ">future.</span>
      </h2>

      <p className="text-white/50 text-xl md:text-2xl mb-16 max-w-2xl mx-auto leading-relaxed  tracking-tight">
        Join the league of forward-thinking Nigerian universities prioritizing integrity and data-backed excellence.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
        <a href="/register" className="w-full sm:w-auto skeuo-button-gold px-12 py-6 rounded-full font-medium text-xl hover:scale-105 transition-all flex items-center justify-center gap-3 shadow-2xl group">
          Start free
          <IconArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
        </a>

        {/* Savage Micro-Interaction Button: Weight Shift on Click */}
        <motion.button
          whileTap={{ y: 4, scale: 0.98 }}
          className="w-full sm:w-auto px-12 py-6 rounded-full font-medium text-xl border border-white/10 text-white bg-white/5 hover:bg-white/10 transition-all backdrop-blur-sm flex items-center justify-center gap-3 group relative overflow-hidden"
        >
          <span className="relative z-10">Claim your audit</span>
          <IconClipboardCheck size={24} className="relative z-10 group-hover:scale-110 transition-transform" />
          {/* Inner Weight-Shift Glow */}
          <motion.div
            initial={{ opacity: 0 }}
            whileTap={{ opacity: 1 }}
            className="absolute inset-0 bg-sungold/20 blur-xl pointer-events-none"
          />
        </motion.button>

        <a href="/contact" className="w-full sm:w-auto px-8 py-6 rounded-full font-medium text-lg text-white/60 hover:text-white transition-colors flex items-center justify-center gap-2 group">
          Talk to sales
          <IconBuildings size={20} className="group-hover:scale-110 transition-transform" />
        </a>
      </div>

      {/* Trust Badges */}
      <div className="mt-24 pt-16 border-t border-white/5 flex flex-wrap justify-center items-center gap-12 opacity-30">
         {['NUC compliant', 'ISO 27001', 'Socially verified', 'Encryption grade AES-256'].map(badge => (
           <span key={badge} className="text-white font-medium text-[11px] tracking-tight">{badge}</span>
         ))}
      </div>
    </motion.div>
  </section>
);
