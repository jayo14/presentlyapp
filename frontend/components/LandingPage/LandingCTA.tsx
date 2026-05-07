import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../Button';
import { ModernCard } from '../ModernCard';

interface LandingCTAProps {
  onRegister: () => void;
}

export const LandingCTA: React.FC<LandingCTAProps> = ({ onRegister }) => {
  return (
    <section className="py-40 bg-background relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto"
        >
          <ModernCard variant="accent" padding="none" className="rounded-[4rem] p-16 md:p-32 text-center relative overflow-hidden group shadow-premium border-primary/20">
            <div className="relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 mb-12 backdrop-blur-md"
              >
                <Sparkles size={18} className="text-primary" />
                <span className="text-primary text-[10px] font-black uppercase tracking-[0.4em]">Ready to Elevate?</span>
              </motion.div>

              <h2 className="text-5xl md:text-8xl font-black text-text tracking-tighter mb-12 leading-[0.8]">
                Join the <br className="hidden md:block" /> <span className="text-primary">Movement.</span>
              </h2>

              <p className="text-textMuted text-xl md:text-3xl font-medium leading-relaxed mb-20 max-w-3xl mx-auto">
                Reclaim your lecture time, ensure your marks are safe, and join the thousands of students already using Presently.
              </p>

              <Button
                size="lg"
                onClick={onRegister}
                className="px-16 h-20 text-xl"
              >
                Start Free Now
                <ArrowRight size={28} />
              </Button>
            </div>

            {/* Abstract background blobs */}
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-[100px] animate-pulse delay-1000" />
          </ModernCard>
        </motion.div>
      </div>
    </section>
  );
};
