import React from 'react';
import { cn } from '@/components/ui/utils';

interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  className?: string;
  gap?: 'sm' | 'md' | 'lg' | 'xl' | '32';
}

const columnVariants = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-5',
  6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
  12: 'grid-cols-2 md:grid-cols-6 lg:grid-cols-12',
};

const gapVariants = {
  sm: 'gap-4',
  md: 'gap-6',
  lg: 'gap-8',
  xl: 'gap-10',
  '32': 'gap-32',
};

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  columns = 3,
  className,
  gap = 'md',
}) => {
  return (
    <div
      className={cn(
        'grid w-full',
        columnVariants[columns],
        gapVariants[gap],
        className
      )}
    >
      {children}
    </div>
  );
};
