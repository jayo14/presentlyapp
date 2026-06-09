import React from 'react';
import { cn } from '@/lib/utils';

interface DashboardCardProps {
  title?: React.ReactNode;
  description?: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  titleClassName?: string;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  description,
  children,
  className,
  onClick,
  titleClassName,
}) => {
  const isClickable = !!onClick;

  return (
    <div
      className={cn(
        "skeuo-card p-6 rounded-[2rem]",
        isClickable && "cursor-pointer",
        className
      )}
      onClick={onClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <div className={cn("text-lg font-bold text-text font-headline", titleClassName)}>
              {title}
            </div>
          )}
          {description && (
            <p className="text-sm text-textMuted mt-1">
              {description}
            </p>
          )}
        </div>
      )}
      <div className="w-full">
        {children}
      </div>
    </div>
  );
};
