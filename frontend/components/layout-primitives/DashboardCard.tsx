import React from 'react';
import { cn } from '@/lib/utils';

interface DashboardCardProps {
  title?: string;
  subtitle?: string;
  icon?: React.ElementType;
  iconClassName?: string;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  actions?: React.ReactNode;
}

/**
 * DashboardCard is a premium card component that uses the skeuomorphic design system.
 */
export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  subtitle,
  icon: Icon,
  iconClassName,
  children,
  onClick,
  className,
  actions,
}) => {
  const isInteractive = !!onClick;

  return (
    <div
      onClick={onClick}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onKeyDown={isInteractive ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
      className={cn(
        "skeuo-card p-5 flex flex-col justify-between h-full min-h-[140px]",
        isInteractive && "cursor-pointer group",
        className
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300",
              isInteractive && "group-hover:scale-110",
              iconClassName || "bg-primary/10 text-primary"
            )}>
              <Icon size={20} weight="bold" />
            </div>
          )}
          {(title || subtitle) && (
            <div className="flex flex-col">
              {title && <h4 className="font-headline text-sm font-bold text-text tracking-tight">{title}</h4>}
              {subtitle && <p className="text-[10px] font-black text-textMuted uppercase tracking-widest">{subtitle}</p>}
            </div>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      <div className="flex-1">
        {children}
      </div>
    </div>
  );
};
