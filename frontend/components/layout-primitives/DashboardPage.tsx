import React from 'react';
import { cn } from '@/lib/utils';

interface DashboardPageProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  titleClassName?: string;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  title,
  subtitle,
  description,
  children,
  actions,
  className,
  titleClassName,
}) => {
  return (
    <div className={cn("flex flex-col gap-6 md:gap-8 w-full animate-in fade-in duration-500 pb-24 md:pb-8", className)}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <header>
          {subtitle && (
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1 opacity-80">
              {subtitle}
            </p>
          )}
          <h1 className={cn(
            "text-2xl md:text-3xl font-black tracking-tighter text-text font-headline leading-tight",
            titleClassName
          )}>
            {title}
          </h1>
          {description && (
            <div className="text-sm text-textMuted mt-1 flex items-center gap-2">
              {description}
            </div>
          )}
        </header>
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
