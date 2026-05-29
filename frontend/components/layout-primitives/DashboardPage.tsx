import React from 'react';
import { cn } from '../../lib/utils';

interface DashboardPageProps {
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  title,
  description,
  children,
  actions,
  className,
}) => {
  return (
    <div className={cn("flex flex-col gap-8 w-full animate-in fade-in duration-500", className)}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text font-headline">{title}</h1>
          {description && (
            <div className="text-textMuted mt-1 flex items-center gap-2">
              {description}
            </div>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>

      <div className="flex-1 w-full">
        {children}
      </div>
    </div>
  );
};
