import React from 'react';

export const Logo: React.FC<{ className?: string, showText?: boolean }> = ({
  className = "",
  showText = true
}) => (
  <div className={`flex items-center gap-3 font-bold text-xl tracking-tight ${className}`}>
    <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-primary shadow-lg shadow-primary/20 overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <span className="text-primary-foreground font-black text-xl italic select-none">P</span>
      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white/20 blur-md rounded-full" />
    </div>
    {showText && (
      <span className="text-text dark:text-text transition-colors font-headline font-bold tracking-[-0.02em] text-[22px]">
        Presently
      </span>
    )}
  </div>
);
