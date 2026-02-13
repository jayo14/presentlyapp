import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({ 
  label, 
  error, 
  icon, 
  className = '', 
  ...props 
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-400 mb-1.5">{label}</label>}
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          className={`
            w-full bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-full px-4 py-2.5 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500
            focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all
            ${icon ? 'pl-10' : ''}
            pr-10
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            ${className}
          `}
          {...props}
        />
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500">
            {icon}
          </div>
        )}
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors focus:outline-none"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};
