import React from 'react';
import { cn } from '../src/components/ui/utils';

export const Logo: React.FC<{ className?: string, showText?: boolean, variant?: 'light' | 'dark' }> = ({
  className = "",
  showText = true,
  variant
}) => {
  const isDark = variant === 'dark';

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn(
        "relative flex items-center justify-center w-10 h-10 rounded-[28%] transition-all shadow-md group overflow-hidden",
        isDark ? "bg-presently-black" : "bg-sungold"
      )}>
        <span className={cn(
          "font-display font-bold text-2xl select-none relative z-10",
          isDark ? "text-sungold" : "text-presently-black"
        )}>
          P
        </span>
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      {showText && (
        <span className={cn(
          "font-nimbus text-2xl transition-colors tracking-tight",
          isDark ? "text-white" : "text-presently-black"
        )}>
          Presently
        </span>
      )}
    </div>
  );
};
