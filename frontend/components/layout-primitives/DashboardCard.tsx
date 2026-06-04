import React from 'react';
import { cn } from '@/lib/utils';

interface DashboardCardProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'default' | 'elevated';
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  description,
  icon,
  children,
  className,
  onClick,
  variant = 'default',
}) => {
  const isInteractive = !!onClick;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isInteractive && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <div
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "skeuo-card rounded-[2rem] p-5 flex flex-col min-h-[128px] relative overflow-hidden",
        isInteractive && "cursor-pointer",
        variant === 'elevated' && "shadow-lg shadow-primary/5",
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-surface-highest/40 flex items-center justify-center text-primary-fixed-dim">
            {icon}
          </div>
        )}
      </div>

      <div className="flex-1">
        {title && (
          <h3 className="text-xl font-black tracking-tighter text-text line-clamp-1">
            {title}
          </h3>
        )}
        {description && (
          <p className="text-[10px] font-black text-textMuted uppercase tracking-widest mt-0.5">
            {description}
          </p>
        )}
        <div className={cn(title || description ? "mt-4" : "")}>
          {children}
        </div>
      </div>
    </div>
  );
};
