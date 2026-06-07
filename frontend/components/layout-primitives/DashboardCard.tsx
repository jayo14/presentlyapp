import React from 'react';
import { cn } from '@/lib/utils';

interface DashboardCardProps {
  children: React.ReactNode;
  title?: React.ReactNode;
  description?: string;
  className?: string;
  titleClassName?: string;
  onClick?: () => void;
  interactive?: boolean;
  role?: string;
  'aria-label'?: string;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  children,
  title,
  description,
  className,
  titleClassName,
  onClick,
  interactive = false,
  role,
  'aria-label': ariaLabel,
}) => {
  const isClickable = !!onClick || interactive;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={cn(
        "skeuo-card rounded-[2rem] p-5 min-h-[128px] flex flex-col",
        isClickable && "cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
        className
      )}
      onClick={onClick}
      onKeyDown={isClickable ? handleKeyDown : undefined}
      tabIndex={isClickable ? 0 : undefined}
      role={role || (isClickable ? 'button' : undefined)}
      aria-label={ariaLabel}
    >
      {(title || description) && (
        <div className="mb-1">
          {title && (
            <h3 className={cn("font-headline text-sm font-semibold text-text", titleClassName)}>
              {title}
            </h3>
          )}
          {description && (
            <p className="text-xs text-textMuted leading-relaxed">
              {description}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
};
