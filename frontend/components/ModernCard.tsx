import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface ModernCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'outline' | 'accent';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const ModernCard: React.FC<ModernCardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  ...props
}) => {
  const variants = {
    default: "bg-surface border border-outline shadow-soft",
    glass: "glass shadow-premium",
    outline: "bg-transparent border border-outline",
    accent: "bg-primary/5 border border-primary/20"
  };

  const paddings = {
    none: "p-0",
    sm: "p-3",
    md: "p-5",
    lg: "p-8"
  };

  return (
    <motion.div
      className={`rounded-md ${variants[variant]} ${paddings[padding]} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};
