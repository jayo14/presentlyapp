import React from 'react';
import { cn } from '../src/components/ui/utils';

interface ModernCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  hoverable?: boolean;
}

export const ModernCard: React.FC<ModernCardProps> = ({
  children,
  className = "",
  padding = "md",
  onClick,
  hoverable = false
}) => {
  const paddings = {
    none: "p-0",
    sm: "p-4",
    md: "p-6",
    lg: "p-10",
    xl: "p-16"
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-surface border border-outline/30 rounded-[2rem] shadow-sm overflow-hidden transition-all duration-500 ease-premium",
        hoverable && "hover:border-sungold/40 hover:shadow-premium hover:-translate-y-1 cursor-pointer",
        onClick && "cursor-pointer active:scale-[0.99]",
        paddings[padding],
        className
      )}
    >
      {children}
    </div>
  );
};
