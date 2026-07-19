import React from 'react';

export const Logo: React.FC<{ className?: string, showText?: boolean }> = ({
  className = "",
  showText = true
}) => (
  <div className={`flex items-center gap-2.5 ${className}`}>
    <div className="relative group">
      <div className="relative w-9 h-9 md:w-10 md:h-10 flex items-center justify-center bg-white dark:bg-surface-container-low rounded-xl shadow-sm border border-black/5 dark:border-white/5 overflow-hidden">
        <picture>
          <source srcSet="/logo.webp" type="image/webp" />
          <img
            src="/logo.png"
            alt="Presently"
            width={40}
            height={40}
            className="w-full h-full object-contain p-1"
          />
        </picture>
      </div>
    </div>
    {showText && (
      <span className="text-neutral-900 dark:text-neutral-50 font-medium text-xl tracking-tighter">
        Presently
      </span>
    )}
  </div>
);
