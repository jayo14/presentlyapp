import React from 'react';
import { motion } from 'framer-motion';

interface InfiniteSliderProps {
  items: React.ReactNode[];
  direction?: 'left' | 'right';
  speed?: number;
}

export const InfiniteSlider: React.FC<InfiniteSliderProps> = ({
  items,
  direction = 'left',
  speed = 40
}) => {
  return (
    <div className="relative overflow-hidden w-full flex py-10">
      <motion.div
        className="flex gap-8 whitespace-nowrap"
        animate={{
          x: direction === 'left' ? [0, -1920] : [-1920, 0],
        }}
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {/* Render items twice for seamless loop */}
        {items.map((item, i) => (
          <div key={i} className="inline-block">
            {item}
          </div>
        ))}
        {items.map((item, i) => (
          <div key={i + items.length} className="inline-block">
            {item}
          </div>
        ))}
      </motion.div>

      {/* Gradient Mask */}
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#0A0A0A] to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#0A0A0A] to-transparent z-10 pointer-events-none" />
    </div>
  );
};
