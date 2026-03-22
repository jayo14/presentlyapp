import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, icon, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-semibold text-text mb-1.5">{label}</label>}
      <div className="relative">
        <input
          className={`
            w-full transition-all duration-200 outline-none
            bg-white dark:bg-surfaceLow border border-outline rounded-xl px-4 py-2.5 
            text-text placeholder-textMuted
            focus:border-primary focus:ring-1 focus:ring-primary
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            ${className}
          `}
          {...props}
        />
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted">
            {icon}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
};