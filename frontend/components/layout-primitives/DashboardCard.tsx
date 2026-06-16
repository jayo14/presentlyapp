import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

type CardVariant = 'default' | 'primary' | 'glass' | 'outline' | 'scholar' | 'ghost';

interface DashboardCardProps extends HTMLMotionProps<'div'> {
  variant?: CardVariant;
  noPadding?: boolean;
  clickable?: boolean;
  children: React.ReactNode;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  variant = 'default',
  noPadding = false,
  clickable = false,
  children,
  className,
  onClick,
  ...props
}) => {
  const variants: Record<CardVariant, string> = {
    default: 'bg-surface text-text border border-outline shadow-sm',
    primary: 'bg-primary text-black border-none shadow-lg shadow-primary/10',
    glass: 'bg-white/10 backdrop-blur-xl border border-white/10 text-white',
    outline: 'bg-transparent border border-outline',
    scholar: 'bg-gradient-to-br from-[#755b00cc] to-primary text-white border-none shadow-lg shadow-primary/10',
    ghost: 'bg-transparent border-none shadow-none',
  };

  const isClickable = !!onClick || clickable;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick?.(e as any);
    }
  };

  return (
    <motion.div
      className={cn(
        'rounded-[2rem] transition-all duration-300',
        !noPadding && 'p-6',
        variants[variant],
        isClickable && 'cursor-pointer hover:shadow-md hover:border-primary/20',
        className
      )}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      whileHover={isClickable ? { y: -2, scale: 1.01 } : undefined}
      whileTap={isClickable ? { scale: 0.98 } : undefined}
      {...props}
    >
      {children}
    </motion.div>
  );
};
