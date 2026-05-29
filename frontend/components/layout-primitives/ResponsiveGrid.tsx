import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveGridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4 | 6 | 12;
  gap?: 16 | 24 | 32 | 40;
  className?: string;
}

/**
 * ResponsiveGrid provides a standardized grid layout for dashboard sections.
 * It abstracts Tailwind's responsive grid classes to ensure consistency.
 */
export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  cols = 4, // Changed default to 4 for dashboard cards
  gap = 32,
  className,
}) => {
  const gapClass = {
    16: 'gap-4', // 16px
    24: 'gap-6', // 24px
    32: 'gap-8', // 32px
    40: 'gap-10', // 40px
  }[gap];

  const colsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
    12: 'grid-cols-1 md:grid-cols-12',
  }[cols];

  return (
    <div className={cn("grid", colsClass, gapClass, className)}>
      {children}
    </div>
  );
};
