import React from 'react';
import { cn } from '@/lib/utils';

interface DashboardCardProps {
  title: string;
  value?: string | number;
  description?: string;
  icon?: any;
  iconClassName?: string;
  className?: string;
  onClick?: () => void;
  children?: React.ReactNode;
  decoration?: React.ReactNode;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  description,
  icon: Icon,
  iconClassName,
  className,
  onClick,
  children,
  decoration
}) => {
  const content = (
    <div className={cn(
      "bg-surface text-text border border-outline rounded-3xl p-5 flex flex-col justify-between min-h-[128px] skeuo-card transition-all duration-200 group",
      onClick && "cursor-pointer hover:border-primary/30 active:scale-[0.98]",
      className
    )}>
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold text-textMuted uppercase tracking-wider">{title}</span>
          {value !== undefined && (
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-text tracking-tight">{value}</span>
              {children}
            </div>
          )}
          {description && <span className="text-[10px] text-textMuted font-medium">{description}</span>}
        </div>

        {Icon && (
          <div className={cn(
            "p-2.5 rounded-2xl flex items-center justify-center transition-colors",
            iconClassName || "bg-surfaceHigh text-textMuted group-hover:text-primary group-hover:bg-primary/10"
          )}>
            <Icon size={20} weight="bold" />
          </div>
        )}

        {decoration && !Icon && (
          <div className="text-textMuted">
            {decoration}
          </div>
        )}
      </div>

      {!value && children && (
        <div className="mt-4">
          {children}
        </div>
      )}
    </div>
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-3xl"
        aria-label={title}
      >
        {content}
      </button>
    );
  }

  return content;
};
