import React from 'react';
import { cn } from '../src/components/ui/utils';
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}
export const Input: React.FC<InputProps> = ({ label, error, icon, className = '', ...props }) => {
  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="block text-sm font-semibold text-on-surface mb-3 pl-1">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          className={cn(
            "w-full h-[48px] md:h-[52px] transition-all duration-300 outline-none",
            "bg-surface-container border border-outline focus:border-primary focus:ring-4 focus:ring-primary/20 rounded-lg px-12 py-3",
            "text-on-surface font-medium placeholder:text-textMuted",
            icon ? 'pl-12' : '',
            error ? 'border-error focus:border-error focus:ring-error/20' : '',
            className,
            "disabled:opacity-50 disabled:bg-surface-variant"
          )}
          {...props}
        />
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted transition-colors group-focus-within:text-primary">
            {React.cloneElement(icon as React.ReactElement, { size: 20 })}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-3 text-xs text-error font-medium ml-1 animate-in fade-in slide-in-from-top-1">
           {error}
        </p>
      )}
    </div>
  );
};
