import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from '@phosphor-icons/react';
import { Button } from '../Button';

export const LandingCTA: React.FC = () => {
  return (
    <section className="py-20 md:py-28 bg-[#0D0D0D] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#F5C51815_0%,_transparent_70%)]" />

      <div className="container mx-auto px-5 sm:px-6 relative z-10 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-4xl sm:text-5xl md:text-7xl lg:text-8xl text-white mb-8"
        >
          Every class.<br />
          Every student.<br />
          <span className="text-sungold">Present.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-slate-300 text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-12"
        >
          Join institutions already running smarter with Presently.<br />
          Setup takes less than 5 minutes.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 sm:gap-6"
        >
          <Button variant="primary" size="lg" className="px-12 h-16 text-lg w-full sm:w-auto">
            Get started for free <ArrowRight size={20} weight="duotone" className="ml-2" />
          </Button>
          <Button variant="outline" size="lg" className="px-12 h-16 text-lg border-white text-white hover:bg-white/10 w-full sm:w-auto">
            Request a school demo
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-16 flex flex-wrap justify-center gap-8 text-slate-500 text-sm"
        >
          <span>🔒 Secure & private</span>
          <span>📱 iOS & Android</span>
          <span>🌍 Works in Nigeria</span>
          <span>✓ Free to start</span>
        </motion.div>
      </div>
    </section>
  );
};
