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
  containerClassName?: string;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  title,
  subtitle,
  description,
  children,
  actions,
  className,
  titleClassName,
  containerClassName,
}) => {
  return (
    <div className={cn("flex flex-col gap-8 w-full animate-in fade-in duration-500 pb-24 md:pb-8", className)}>
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="space-y-1">
          {subtitle && (
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] opacity-60 mb-1">
              {subtitle}
            </p>
          )}
          <h1 className={cn("text-2xl font-bold tracking-tight text-text font-headline", titleClassName)}>
            {title}
          </h1>
          {description && (
            <div className="text-sm text-textMuted flex items-center gap-2">
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

      <div className={cn("flex-1 w-full", containerClassName)}>
        {children}
      </div>
    </div>
  );
};
