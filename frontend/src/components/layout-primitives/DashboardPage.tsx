import React from 'react';
import { Badge } from '@/components/ui/badge';

interface DashboardPageProps {
  title: string;
  description?: string | React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
  headerIcon?: React.ReactNode;
  badge?: string;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  title,
  description,
  children,
  actions,
  headerIcon,
  badge,
}) => {
  return (
    <div className="flex flex-col gap-32 animate-in fade-in duration-700 ease-premium">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          {headerIcon && (
            <div className="hidden md:flex w-12 h-12 rounded-2xl bg-surface-highest/50 items-center justify-center border border-outline/10 text-primary">
              {headerIcon}
            </div>
          )}
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="font-nimbus text-3xl md:text-4xl font-bold tracking-tight text-presently-black dark:text-soft-cream">
                {title}
              </h1>
              {badge && (
                <Badge className="bg-sungold/20 text-presently-black hover:bg-sungold/30 border-none px-3 py-0.5 font-bold tracking-widest text-[10px] uppercase">
                  {badge}
                </Badge>
              )}
            </div>
            {description && (
              <div className="text-textMuted font-medium max-w-2xl leading-relaxed">
                {description}
              </div>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex items-center gap-3 self-end md:self-center">
            {actions}
          </div>
        )}
      </div>

      <div className="flex-1">
        {children}
      </div>
    </div>
  );
};
