import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`flex items-center gap-1 font-bold text-xl tracking-tight ${className}`}>
    <div className="w-8 h-8">
      <img src="/logo.png" alt="Presently Logo" className="w-full" />
    </div>
    <span className="text-on-surface">Presently</span>
  </div>
);