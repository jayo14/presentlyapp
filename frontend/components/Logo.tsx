import React from 'react';

export const Logo: React.FC<{ className?: string, showText?: boolean }> = ({
  className = "",
  showText = true
}) => (
  <div className={`flex items-center gap-2.5 ${className}`}>
    <div className="relative group">
      {/* Subtle skeuomorphic ring around logo */}
      <div className="absolute -inset-1.5 bg-gradient-to-br from-primary/20 to-transparent rounded-xl blur-sm group-hover:opacity-100 transition-opacity opacity-0" />
      <div className="relative w-10 h-10 md:w-11 md:h-11 flex items-center justify-center bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.08),inset_0_-2px_4px_rgba(0,0,0,0.05)] border border-black/5 overflow-hidden">
        <picture>
          <source srcSet="/logo.avif" type="image/avif" />
          <source srcSet="/logo.webp" type="image/webp" />
          <img
            src="/logo.png"
            alt="Presently"
            width={44}
            height={44}
            className="w-full h-full object-contain p-1.5"
          />
        </picture>
      </div>
    </div>
    {showText && (
      <span className="text-on-surface font-headline font-black text-2xl tracking-tighter transition-colors">
        Presently
      </span>
    )}
  </div>
);
