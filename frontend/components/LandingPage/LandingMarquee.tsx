import React from 'react';
import { motion } from 'framer-motion';

export const LandingMarquee: React.FC = () => {
  const logos = [
    "University of Lagos",
    "Ahmadu Bello University",
    "University of Ibadan",
    "University of Nigeria",
    "Obafemi Awolowo University",
    "Covenant University",
  ];

  return (
    <div className="py-12 bg-white border-y border-outline overflow-hidden">
      <div className="container mx-auto px-6 mb-8">
        <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
          Trusted by Nigeria's leading institutions
        </p>
      </div>
      <div className="relative flex">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="flex whitespace-nowrap gap-20 items-center pr-20"
        >
          {[...logos, ...logos].map((logo, i) => (
            <span key={i} className="font-display text-2xl md:text-3xl text-slate-200 grayscale hover:grayscale-0 transition-all cursor-default">
              {logo}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
};
