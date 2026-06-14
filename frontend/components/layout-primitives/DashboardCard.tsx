import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DashboardCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'glass' | 'outline' | 'scholar';
  className?: string;
  onClick?: () => void;
  noPadding?: boolean;
}

/**
 * DashboardCard provides a standardized, skeuomorphic card container.
 * It supports various branded variants and includes built-in micro-interactions.
 */
export const DashboardCard: React.FC<DashboardCardProps> = ({
  children,
  variant = 'default',
  className,
  onClick,
  noPadding = false,
  ...props
}) => {
  const isClickable = !!onClick;

  const variantClasses = {
    default: 'skeuo-card bg-surface text-text border-outline/5',
    primary: 'bg-primary text-black border-black/5 shadow-lg shadow-primary/10',
    glass: 'glass rounded-[2.5rem]',
    outline: 'bg-transparent border-2 border-outline/10 text-text',
    scholar: 'bg-gradient-to-br from-[#755b00cc] to-primary text-white border-none shadow-lg shadow-primary/10',
  }[variant];

  // Standard interactive micro-interactions for Presently
  const interactiveProps: HTMLMotionProps<'div'> = isClickable ? {
    whileHover: { scale: 1.01, y: -2 },
    whileTap: { scale: 0.98, y: 0 },
    transition: { type: 'spring', stiffness: 400, damping: 17 }
  } : {};

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <motion.div
      className={cn(
        'relative overflow-hidden transition-all duration-300',
        !noPadding && 'p-6 md:p-8',
        variantClasses,
        isClickable && 'cursor-pointer select-none',
        className
      )}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      {...interactiveProps}
      {...props}
    >
      {variant === 'scholar' && (
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      )}
      {children}
    </motion.div>
  );
};
