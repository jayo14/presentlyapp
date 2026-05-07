import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, icon, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-[13px] font-semibold text-textMuted mb-2 pl-1">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          className={`
            w-full h-[54px] transition-all duration-200 outline-none
            bg-surfaceContainer border border-outline focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-md px-4
            text-text font-medium placeholder:text-textMuted/50
            ${icon ? 'pl-12' : ''}
            ${error ? 'border-error/50 focus:border-error focus:ring-error/10' : ''}
            ${className}
            disabled:opacity-50
          `}
          {...props}
        />
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted transition-colors">
            {React.cloneElement(icon as React.ReactElement, { size: 20 })}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-2 text-xs text-error font-medium ml-1 animate-in fade-in slide-in-from-top-1">
           {error}
        </p>
      )}
    </div>
  );
};
