import React from 'react';

import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';

type OmittedProps = 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag' | 'style';
interface ButtonProps extends Omit<HTMLMotionProps<"button">, OmittedProps | 'children'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'premium';
  size?: 'sm' | 'md' | 'lg' | 'icon' | 'huge';
  isLoading?: boolean;
  children?: React.ReactNode;
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) => {
  const baseStyles = "relative inline-flex items-center justify-center font-bold transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:pointer-events-none disabled:grayscale overflow-hidden group whitespace-nowrap shrink-0";

  const variants = {
    primary: "bg-primary text-black shadow-[0_8px_32px_rgba(255,215,0,0.25)] hover:shadow-[0_12px_48px_rgba(255,215,0,0.4)] rounded-2xl",
    secondary: "bg-surfaceHigh text-text border border-outline/10 hover:border-primary/30 rounded-2xl",
    outline: "bg-transparent border-2 border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/50 rounded-2xl",
    ghost: "text-textMuted hover:text-text hover:bg-surfaceLow rounded-xl",
    premium: "bg-black dark:bg-white text-white dark:text-black shadow-2xl rounded-[1.75rem] hover:scale-[1.02] active:scale-95"
  };

  const sizes = {
    sm: "h-10 px-4 text-xs tracking-wider uppercase",
    md: "h-13 px-8 text-sm tracking-wide uppercase",
    lg: "h-16 px-10 text-base tracking-widest uppercase",
    huge: "h-24 px-12 text-xl font-black tracking-[0.2em] uppercase",
    icon: "h-12 w-12 p-0 rounded-full",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {/* Glint effect for premium/primary variants */}
      {(variant === 'primary' || variant === 'premium') && (
        <div className="absolute inset-0 w-full h-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700">
          <div className="absolute -inset-x-20 top-0 bottom-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out skew-x-[25deg]" />
        </div>
      )}

      <span className={`inline-flex items-center gap-2 ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity`}>
        {children as React.ReactNode}
      </span>

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      )}
    </motion.button>
  );
};