import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, icon, className = '', ...props }) => {
  return (
    <div className="w-full group/field">
      {label && (
        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-textMuted group-focus-within/field:text-primary transition-colors duration-300 mb-2 pl-1">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          className={`
            w-full h-14 transition-all duration-500 outline-none
            bg-surface border-2 border-outline/10 group-hover/field:border-primary/20 focus:border-primary/50 rounded-2xl px-5 
            text-text font-medium placeholder:text-textMuted/40 placeholder:font-normal
            shadow-sm group-focus-within/field:shadow-[0_8px_32px_rgba(255,215,0,0.05)]
            ${icon ? 'pl-14' : ''}
            ${error ? 'border-red-500/50 focus:border-red-500 group-hover/field:border-red-500/30' : ''}
            ${className}
            disabled:opacity-40 disabled:grayscale
          `}
          {...props}
        />
        {icon && (
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-textMuted/40 group-focus-within/field:text-primary transition-colors duration-500">
            {icon}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-2 text-xs text-red-500 font-bold ml-1 flex items-center gap-1 animate-in slide-in-from-top-1 duration-300">
           <span className="w-1 h-1 rounded-full bg-red-500" />
           {error}
        </p>
      )}
    </div>
  );
};