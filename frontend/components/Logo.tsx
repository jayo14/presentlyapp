import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`flex items-center gap-1 font-bold text-xl tracking-tight ${className}`}>
    <div className="w-8 h-8">
      <picture>
        <source srcSet="/logo.avif" type="image/avif" />
        <source srcSet="/logo.webp" type="image/webp" />
        <img src="/logo.png" alt="Presently Logo" width={32} height={32} className="w-full" />
      </picture>
    </div>
    <span className="text-text dark:text-text transition-colors">Presently</span>
  </div>
);