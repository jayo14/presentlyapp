import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`flex items-center gap-2 font-bold text-xl tracking-tight ${className}`}>
    <div className="w-8 h-8">
      <picture>
        <source srcSet="/logo.avif" type="image/avif" />
        <source srcSet="/logo.webp" type="image/webp" />
        <img src="/logo.png" alt="Presently Logo" width={32} height={32} className="w-full" />
      </picture>
    </div>
    <span className="font-nimbus text-2xl tracking-[-0.02em] text-presently-black dark:text-soft-cream transition-colors">
      Presently
    </span>
  </div>
);
