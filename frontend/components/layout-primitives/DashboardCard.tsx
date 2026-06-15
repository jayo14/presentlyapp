import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DashboardCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'primary' | 'outline' | 'glass' | 'scholar';
  onClick?: () => void;
  noPadding?: boolean;
  animate?: boolean;
  delay?: number;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  children,
  className,
  variant = 'default',
  onClick,
  noPadding = false,
  animate = true,
  delay = 0,
}) => {
  const isClickable = !!onClick;

  const variants = {
    default: "skeuo-card bg-surface text-text border-outline/5",
    primary: "bg-primary text-primary-foreground border-primary/20 shadow-lg shadow-primary/20",
    outline: "bg-transparent border-2 border-outline/10 text-text",
    glass: "glass text-text",
    scholar: "bg-gradient-to-br from-[#755b00cc] to-primary text-white border-none shadow-lg shadow-primary/10",
  };

  const Component = animate ? motion.div : 'div';
  const animationProps = animate ? {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] },
    whileHover: isClickable ? { y: -4, scale: 1.01 } : undefined,
    whileTap: isClickable ? { scale: 0.98 } : undefined,
  } : {};

  return (
    <Component
      {...animationProps}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
      className={cn(
        "rounded-[2rem] overflow-hidden transition-all duration-300",
        variants[variant],
        !noPadding && "p-6",
        isClickable && "cursor-pointer active:scale-[0.98]",
        className
      )}
    >
      {children}
    </Component>
  );
};
