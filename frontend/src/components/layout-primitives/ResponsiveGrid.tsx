import React from 'react';
import { cn } from '../ui/utils';

interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
  gap?: 16 | 24 | 32 | 48;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  columns = 3,
  className,
  gap = 32
}) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  const gapSize = {
    16: 'gap-8 md:gap-16 lg:gap-24',
    24: 'gap-10 md:gap-24 lg:gap-32',
    32: 'gap-12 md:gap-32 lg:gap-40',
    48: 'gap-16 md:gap-48 lg:gap-64',
  };

  return (
    <div className={cn(
      'grid w-full',
      gridCols[columns],
      gapSize[gap],
      className
    )}>
      {children}
    </div>
  );
};
