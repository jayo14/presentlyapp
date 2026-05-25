import React from 'react';
import { cn } from '../src/components/ui/utils';

export const Logo: React.FC<{ className?: string, showText?: boolean, variant?: 'light' | 'dark' }> = ({
  className = "",
  showText = true,
  variant
}) => {
  const isDark = variant === 'dark';

  return (
    <div className={cn("flex items-center gap-2 tracking-tight", className)}>
      <div className={cn(
        "relative flex items-center justify-center w-10 h-10 rounded-[22%] transition-all shadow-md group",
        isDark ? "bg-presently-black" : "bg-sungold"
      )}>
        <span className={cn(
          "font-nimbus font-bold text-2xl select-none relative",
          isDark ? "text-sungold" : "text-presently-black"
        )}>
          P
          <span className="absolute -right-0.5 bottom-1 text-[10px]">◆</span>
        </span>
      </div>
      {showText && (
        <span className={cn(
          "font-nimbus font-bold tracking-[-0.02em] text-2xl transition-colors",
          isDark ? "text-white" : "text-presently-black"
        )}>
          Presently
        </span>
      )}
    </div>
  );
};
