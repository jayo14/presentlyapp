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
    default: "bg-surface border border-outline shadow-md",
    dark: "bg-surfaceHigh border border-outline shadow-lg",
    glass: "backdrop-blur-lg bg-surface/80 border border-outline/70 shadow-lg",
    outline: "bg-transparent border border-outline",
    accent: "bg-primary/5 border border-primary/15",
    'gold-accent': "bg-surface border-l-4 border-l-primary shadow-md"
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
