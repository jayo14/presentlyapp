import React from 'react';
import { ScanLine } from 'lucide-react';

export const Logo: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`flex items-center gap-2 font-bold text-xl tracking-tight ${className}`}>
    <div className="bg-primary-container text-on-primary-fixed p-1.5 rounded-lg">
      <ScanLine size={20} strokeWidth={2.5} />
    </div>
    <span className="text-on-surface">Presently</span>
  </div>
);