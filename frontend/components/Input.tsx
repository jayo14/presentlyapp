import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, icon, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-1.5">{label}</label>}
      <div className="relative">
        <input
          className={`
            w-full bg-background-tertiary dark:bg-dark-background-tertiary border border-border-light dark:border-dark-border-light rounded-full px-4 py-2.5 text-text-primary dark:text-dark-text-primary placeholder-text-tertiary dark:placeholder-dark-text-tertiary
            focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none dark:focus:border-dark-primary-DEFAULT dark:focus:ring-dark-primary-DEFAULT transition-all
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-error focus:border-error focus:ring-error dark:border-error-dark dark:focus:border-error-dark dark:focus:ring-error-dark' : ''}
            ${className}
          `}
          {...props}
        />
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary dark:text-dark-text-tertiary">
            {icon}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-error dark:text-error-dark">{error}</p>}
    </div>
  );
};