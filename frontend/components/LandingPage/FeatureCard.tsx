import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { IconCircleCheck } from '@tabler/icons-react';

export const FeatureCard = ({ title, description, icon: Icon, color, features, children, className = "" }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["3deg", "-3deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-3deg", "3deg"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = (mouseX / width) - 0.5;
    const yPct = (mouseY / height) - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
       className={`group relative overflow-hidden rounded-[2.5rem] bg-white dark:bg-surface border border-black/5 p-6 md:p-8 ${className}`}
    >
      <div style={{ transform: "translateZ(40px)" }} className="relative z-10 grid lg:grid-cols-2 gap-16 items-center h-full">
        <div className="flex flex-col h-full justify-between">
          <div>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-10 shadow-lg transition-all group-hover:scale-110 duration-700" style={{ backgroundColor: color }}>
              <Icon size={32} className="text-white" />
            </div>
             <h3 className="text-4xl md:text-5xl text-neutral-900 dark:text-neutral-50 mb-8 tracking-tight leading-[1] font-medium">{title}</h3>
             <p className="text-neutral-500 dark:text-neutral-400 text-lg leading-relaxed mb-10 max-w-md ">{description}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {features.map((f, i) => (
                 <div key={i} className="flex items-center gap-3 text-neutral-600 dark:text-neutral-300 text-sm font-medium group-hover:text-neutral-900 dark:group-hover:text-neutral-50 transition-colors">
                  <IconCircleCheck size={20} style={{ color }} className="flex-shrink-0" /> {f}
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
