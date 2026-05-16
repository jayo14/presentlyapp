import React from 'react';
import { cn } from '../../src/components/ui/utils';

interface DashboardCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  children,
  className,
  padding = 'md',
  hoverable = true,
}) => {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={cn(
        'bg-surface-highest/40 backdrop-blur-md border border-outline rounded-2xl shadow-sm transition-all duration-300 ease-premium',
        paddingStyles[padding],
        hoverable && 'hover:border-outline-variant hover:shadow-md hover:-translate-y-1',
        className
      )}
    >
      {children}
    </div>
  );
};
