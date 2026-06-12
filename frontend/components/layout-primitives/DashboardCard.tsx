import React from 'react';
import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';

interface DashboardCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'outline' | 'glass' | 'scholar';
  className?: string;
  onClick?: () => void;
  isPressable?: boolean;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  children,
  variant = 'default',
  className,
  onClick,
  isPressable = true,
  ...props
}) => {
  const variants = {
    default: "bg-surface text-text border border-outline hover:shadow-lg",
    primary: "bg-primary text-black border-none shadow-lg shadow-primary/10",
    outline: "bg-transparent text-text border-2 border-outline hover:border-primary/50",
    glass: "bg-surface/40 backdrop-blur-md text-text border border-outline/10 hover:bg-surface/60",
    scholar: "bg-gradient-to-br from-[#755b00cc] to-primary text-white border-none shadow-lg shadow-primary/10",
  };

  const Component = motion.div;

  return (
    <Component
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
      whileHover={onClick && isPressable ? { y: -4, scale: 1.01 } : undefined}
      whileTap={onClick && isPressable ? { y: 0, scale: 0.98 } : undefined}
      className={cn(
        "rounded-[2rem] p-6 transition-all duration-300 ease-premium relative overflow-hidden",
        variants[variant],
        onClick && "cursor-pointer select-none",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};
