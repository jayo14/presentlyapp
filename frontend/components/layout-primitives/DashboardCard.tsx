import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface DashboardCardProps {
  title?: React.ReactNode;
  description?: string;
  children: React.ReactNode;
  className?: string;
  titleClassName?: string;
  variant?: 'default' | 'primary' | 'outline' | 'glass' | 'scholar';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  description,
  children,
  className,
  titleClassName,
  variant = 'default',
  padding = 'md',
  onClick,
}) => {
  const variants = {
    default: 'bg-surface border-outline/10 text-text shadow-premium',
    primary: 'bg-primary text-black border-transparent',
    outline: 'bg-transparent border-outline/20 text-text',
    glass: 'bg-surface/40 backdrop-blur-md border-outline/10 text-text',
    scholar: 'bg-gradient-to-br from-[#755b00cc] to-primary text-white border-none shadow-lg shadow-primary/10',
  };

  const paddings = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const content = (
    <>
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h3 className={cn('text-lg font-bold tracking-tight font-headline', titleClassName)}>
              {title}
            </h3>
          )}
          {description && (
            <p className={cn(
              "text-sm mt-1 line-clamp-2",
              variant === 'scholar' || variant === 'primary' ? "text-white/80" : "text-textMuted"
            )}>
              {description}
            </p>
          )}
        </div>
      )}
      <div className="relative z-10">{children}</div>
      {/* Skeuomorphic internal glow for certain variants */}
      {(variant === 'primary' || variant === 'scholar') && (
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/10 to-transparent opacity-50" />
      )}
    </>
  );

  return (
    <motion.div
      onClick={onClick}
      className={cn(
        'rounded-[2rem] border transition-all duration-300 text-left w-full relative overflow-hidden group',
        variants[variant],
        paddings[padding],
        onClick && 'cursor-pointer hover:border-primary/30',
        className
      )}
      {...(onClick && {
        role: 'button',
        tabIndex: 0,
        onKeyDown: (e: React.KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            if ((e.target as HTMLElement).tagName !== 'BUTTON') {
              e.preventDefault();
              onClick();
            }
          }
        },
        whileHover: { y: -4, shadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' },
        whileTap: { y: 2, scale: 0.98 }
      })}
    >
      {content}
    </motion.div>
  );
};
