import React from 'react';
import { cn } from '@/lib/utils';

interface DashboardPageProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  titleClassName?: string;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  title,
  subtitle,
  description,
  actions,
  children,
  className,
  titleClassName,
}) => {
  return (
    <div className={cn("flex flex-col h-full overflow-y-auto px-6 pb-24", className)}>
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pt-4">
        <div className="flex flex-col">
          {subtitle && (
            <div className="text-[10px] font-bold text-textMuted uppercase tracking-[0.2em] mb-1">
              {subtitle}
            </div>
          )}
          {title && (
            <h1 className={cn("text-2xl font-bold text-text tracking-tight", titleClassName)}>
              {title}
            </h1>
          )}
          {description && (
            <div className="text-sm text-textMuted mt-1">
              {description}
            </div>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}
      </header>

      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};
