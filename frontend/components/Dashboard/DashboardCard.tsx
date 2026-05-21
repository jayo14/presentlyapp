import React from 'react';
import { cn } from '../../src/components/ui/utils';

interface DashboardCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
}

export const DashboardCard: React.FC<DashboardCardProps & React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  padding = 'md',
  hoverable = true,
  onClick,
  ...props
}) => {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const isClickable = !!onClick;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick(e as any);
    }
  };

  return (
    <div
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={cn(
        'bg-surface-highest/40 backdrop-blur-md border border-outline rounded-[2rem] shadow-sm transition-all duration-500 ease-premium outline-none',
        paddingStyles[padding],
        hoverable && 'hover:border-outline-variant/60 hover:shadow-lg hover:-translate-y-1.5 active:scale-[0.99]',
        isClickable && 'cursor-pointer focus-visible:ring-2 focus-visible:ring-sungold focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
