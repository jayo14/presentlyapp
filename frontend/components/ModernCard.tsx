import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../src/components/ui/utils';

interface ModernCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'outline' | 'accent' | 'dark' | 'gold-accent';
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
    default: "bg-white dark:bg-[#1A1A1A] border border-outline shadow-md",
    dark: "bg-presently-black border border-[#2A2A2A] shadow-lg",
    glass: "backdrop-blur-lg bg-white/70 dark:bg-black/40 border border-white/20 dark:border-white/10 shadow-lg",
    outline: "bg-transparent border border-outline",
    accent: "bg-sungold/5 border border-sungold/20",
    'gold-accent': "bg-white dark:bg-[#1A1A1A] border-l-4 border-l-sungold shadow-md"
  };

  const paddings = {
    none: "p-0",
    sm: "p-3",
    md: "p-5",
    lg: "p-8"
  };

  return (
    <motion.div
      className={cn("rounded-lg transition-all duration-300", variants[variant], paddings[padding], className)}
      {...props}
    >
      {children}
    </motion.div>
  );
};
