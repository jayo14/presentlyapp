import React from 'react';
import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';

interface DashboardCardProps extends HTMLMotionProps<'div'> {
  title?: React.ReactNode;
  description?: string;
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'outline' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  titleClassName?: string;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  description,
  children,
  variant = 'default',
  padding = 'md',
  className,
  titleClassName,
  ...props
}) => {
  const variants = {
    default: 'bg-surface border-outline/10 text-text',
    primary: 'bg-gradient-to-br from-primary/90 to-primary text-white border-primary/20 shadow-lg shadow-primary/10',
    outline: 'bg-transparent border-outline/20 text-text',
    glass: 'bg-surface/40 backdrop-blur-md border-white/10 text-text',
  };

  const paddings = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const isInteractive = !!props.onClick || !!props.whileTap;

  return (
    <motion.div
      className={cn(
        'rounded-[2rem] border transition-all duration-300',
        variants[variant],
        paddings[padding],
        isInteractive && 'cursor-pointer hover:shadow-lg hover:translate-y-[-2px] active:translate-y-[0px]',
        className
      )}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onKeyDown={isInteractive ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          (e.currentTarget as HTMLElement).click();
        }
      } : undefined}
      {...props}
    >
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h3 className={cn('text-lg font-bold tracking-tight font-headline', titleClassName)}>
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-textMuted mt-1">
              {description}
            </p>
          )}
        </div>
      )}
      <div className="relative">
        {children}
      </div>
    </motion.div>
  );
};
