import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

interface LandingCTAProps {
  onRegister: () => void;
}

export const LandingCTA: React.FC<LandingCTAProps> = ({ onRegister }) => {
  return (
    <section className="py-32 bg-[#0A0A0A] relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#D4AF37]/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto liquid-glass-gold border-white/10 rounded-[4rem] p-12 md:p-24 text-center relative overflow-hidden group"
        >
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/30 mb-10"
            >
              <Sparkles size={16} className="text-[#D4AF37]" />
              <span className="text-[#D4AF37] text-xs font-black uppercase tracking-[0.2em]">Ready to start?</span>
            </motion.div>

            <h2 className="text-5xl md:text-8xl font-black text-white tracking-tighter mb-10 leading-[0.85]">
              Restore <span className="text-gradient-gold">Academic <br className="hidden md:block" /> Integrity</span> Today.
            </h2>

            <p className="text-zinc-400 text-xl md:text-2xl font-medium leading-relaxed mb-16 max-w-2xl mx-auto">
              Join the growing list of Nigerian universities using Presently to reclaim their lecture halls.
            </p>

            <button
              onClick={onRegister}
              className="group relative px-12 py-6 bg-[#D4AF37] text-[#0A0A0A] rounded-2xl font-black text-xl uppercase tracking-widest overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_20px_40px_rgba(212,175,55,0.3)]"
            >
              <div className="relative z-10 flex items-center gap-4">
                <span>Join Presently Now</span>
                <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
              </div>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
            </button>
          </div>

          {/* Abstract background shapes */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-[80px]" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-[80px]" />
        </motion.div>
      </div>
    </section>
  );
};
