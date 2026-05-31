import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from '@phosphor-icons/react';

export const FeatureCard = ({ title, description, icon: Icon, color, features, children, className = "" }) => {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const { left, top } = cardRef.current.getBoundingClientRect();
    setCoords({ x: e.clientX - left, y: e.clientY - top });
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      className={`group relative overflow-hidden rounded-[48px] skeuo-card p-8 md:p-16 ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(800px circle at ${coords.x}px ${coords.y}px, ${color}20, transparent 40%)`
        }}
      />

      <div className="relative z-10 grid lg:grid-cols-2 gap-20 items-center h-full">
        <div className="flex flex-col h-full justify-between py-4 pr-8">
          <div className="space-y-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-lg transition-transform group-hover:scale-110 duration-500" style={{ backgroundColor: color }}>
              <Icon size={32} weight="duotone" className="text-white" />
            </div>
            <h3 className="font-headline text-4xl md:text-5xl text-on-surface mb-6 tracking-tighter leading-tight font-black">{title}</h3>
            <p className="text-textMuted text-xl leading-relaxed mb-10 max-w-sm font-medium">{description}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-3 text-on-surface/80 text-base font-semibold group-hover:text-on-surface transition-colors">
                  <CheckCircle size={22} weight="bold" style={{ color }} className="flex-shrink-0" /> {f}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative h-full min-h-[300px] flex items-center justify-center">
          {children}
        </div>
      </div>
    </motion.div>
  );
};
