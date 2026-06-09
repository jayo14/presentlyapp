import React, { useEffect, useRef } from 'react';
import { motion, useInView, useSpring, useTransform } from 'framer-motion';

interface StatCounterProps {
  value: number;
  suffix?: string;
  decimals?: number;
}

export const StatCounter = ({ value, suffix = '', decimals = 0 }: StatCounterProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const springValue = useSpring(0, {
    stiffness: 100,
    damping: 30,
  });

  const display = useTransform(springValue, (current) =>
    current.toFixed(decimals).toLocaleString()
  );

  useEffect(() => {
    if (isInView) {
      springValue.set(value);
    }
  }, [isInView, value, springValue]);

  return (
    <span ref={ref}>
      <motion.span>{display}</motion.span>
      {suffix}
    </span>
  );
};
