import React from 'react';
import { cn } from '../src/components/ui/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, icon, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-[13px] font-semibold text-on-surface-variant mb-2 pl-1">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          className={cn(
            "w-full h-[48px] md:h-[52px] transition-all duration-300 outline-none",
            "bg-white border-1.5 border-[#CBD5E1] focus:border-sungold focus:ring-3 focus:ring-sungold/15 rounded-md px-16",
            "text-on-surface font-medium placeholder:text-on-surface-variant/50",
            icon ? 'pl-12' : '',
            error ? 'border-soft-coral focus:border-soft-coral focus:ring-soft-coral/10' : '',
            className,
            "disabled:opacity-50"
          )}
          {...props}
        />
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant transition-colors">
            {React.cloneElement(icon as React.ReactElement, { size: 20 })}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-2 text-xs text-soft-coral font-medium ml-1 animate-in fade-in slide-in-from-top-1">
           {error}
        </p>
      )}
    </div>
  );
};
