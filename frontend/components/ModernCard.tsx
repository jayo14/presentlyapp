import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../src/components/ui/utils';

interface ModernCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'outline' | 'accent' | 'dark' | 'gold-accent';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  hoverable?: boolean;
}

export const ModernCard: React.FC<ModernCardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  hoverable = true,
  ...props
}) => {
  const variants = {
    default: "bg-surface-highest/40 backdrop-blur-md border border-outline shadow-sm",
    dark: "bg-presently-black text-white border border-outline shadow-xl",
    glass: "backdrop-blur-xl bg-surface/40 border border-outline/50 shadow-lg",
    outline: "bg-transparent border border-outline",
    accent: "bg-sungold/10 border border-sungold/20",
    'gold-accent': "bg-surface-highest/50 border-l-4 border-l-sungold shadow-md"
  };

  const paddings = {
    none: "p-0",
    sm: "p-4",
    md: "p-6",
    lg: "p-8"
  };

  return (
    <motion.div
      className={cn(
        "rounded-2xl transition-all duration-500 ease-premium",
        variants[variant],
        paddings[padding],
        hoverable && "hover:border-outline-variant hover:shadow-md hover:-translate-y-1",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};
