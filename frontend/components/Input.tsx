import React from 'react';
import { cn } from '../src/components/ui/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, icon, className = '', ...props }) => {
  return (
    <div className="w-full space-y-3">
      {label && (
        <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        <input
          className={cn(
            "w-full h-16 transition-all duration-300 outline-none skeuo-input",
            "bg-white rounded-2xl px-6 py-4",
            "text-on-surface font-bold text-sm placeholder:text-on-surface-variant/40",
            icon ? 'pl-14' : '',
            error ? 'border-soft-coral focus:border-soft-coral focus:ring-soft-coral/10' : '',
            className,
            "disabled:opacity-50 disabled:bg-surface-variant"
          )}
          {...props}
        />
        {icon && (
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant/40 transition-colors group-focus-within:text-sungold">
            {React.cloneElement(icon as React.ReactElement, { size: 20, weight: "bold" })}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-2 text-[10px] text-soft-coral font-bold uppercase tracking-widest ml-1 animate-in fade-in slide-in-from-top-1">
           {error}
        </p>
      )}
    </div>
  );
};
