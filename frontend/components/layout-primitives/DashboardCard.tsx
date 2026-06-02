import React from 'react';
import { cn } from '@/lib/utils';

interface DashboardCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
}

/**
 * DashboardCard provides a standardized skeuomorphic card for dashboard sections.
 */
export const DashboardCard: React.FC<DashboardCardProps> = ({
  children,
  className,
  onClick,
  interactive = false,
}) => {
  const isInteractive = interactive || !!onClick;

  return (
    <div
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (isInteractive && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={cn(
        "skeuo-card p-6 rounded-[2rem] flex flex-col",
        isInteractive && "cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
};
