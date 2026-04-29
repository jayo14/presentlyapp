import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

interface LandingCTAProps {
  onRegister: () => void;
}

export const LandingCTA: React.FC<LandingCTAProps> = ({ onRegister }) => {
  return (
    <section className="py-40 bg-[#0A0A0A] relative overflow-hidden">
      {/* Dynamic Background */}
      <motion.div
        animate={{
          rotate: [0, 360],
          scale: [1, 1.2, 1]
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-gradient-to-tr from-[#D4AF37]/10 via-[#0A0A0A] to-[#D4AF37]/5 blur-[180px] rounded-full pointer-events-none"
      />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto liquid-glass-gold border-white/10 rounded-[5rem] p-16 md:p-32 text-center relative overflow-hidden group shadow-[0_60px_120px_rgba(0,0,0,0.5)]"
        >
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/30 mb-12 backdrop-blur-md"
            >
              <Sparkles size={18} className="text-[#D4AF37]" />
              <span className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.4em]">Ready to Elevate?</span>
            </motion.div>

            <h2 className="text-5xl md:text-8xl font-black text-white tracking-tighter mb-12 leading-[0.8]">
              Join the <br className="hidden md:block" /> <span className="text-gradient-gold">Movement.</span>
            </h2>

            <p className="text-zinc-400 text-xl md:text-3xl font-medium leading-relaxed mb-20 max-w-3xl mx-auto">
              Reclaim your lecture time, ensure your marks are safe, and join the thousands of students already using Presently.
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onRegister}
              className="group relative px-16 py-8 bg-[#D4AF37] text-[#0A0A0A] rounded-[2.5rem] font-black text-2xl uppercase tracking-[0.2em] overflow-hidden transition-all shadow-[0_30px_60px_rgba(212,175,55,0.4)]"
            >
              <div className="relative z-10 flex items-center gap-5">
                <span>Start Free Now</span>
                <ArrowRight size={28} className="group-hover:translate-x-2 transition-transform" />
              </div>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-25 transition-opacity" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </motion.button>
          </div>

          {/* Abstract background blobs */}
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#D4AF37]/15 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#D4AF37]/15 rounded-full blur-[100px] animate-pulse delay-1000" />
        </motion.div>
      </div>
    </section>
  );
};
