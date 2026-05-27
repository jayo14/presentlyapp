import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '../src/components/ui/utils';

type OmittedProps = 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag' | 'style';
interface ButtonProps extends Omit<HTMLMotionProps<"button">, OmittedProps | 'children'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'error' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  children?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  fullWidth = false,
  ...props
}: ButtonProps) => {
  const baseStyles = "relative inline-flex items-center justify-center font-bold transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:pointer-events-none select-none uppercase tracking-widest";

  const variants = {
    primary: "bg-sungold text-presently-black skeuo-button-gold hover:-translate-y-0.5 shadow-gold",
    secondary: "bg-on-surface text-surface skeuo-button hover:-translate-y-0.5",
    outline: "bg-transparent border border-outline text-on-surface hover:bg-surface-highest/40 skeuo-button",
    ghost: "bg-transparent text-on-surface hover:bg-surface-highest/20",
    error: "bg-soft-coral text-white shadow-md",
    destructive: "bg-soft-coral text-white shadow-md"
  };

  const sizes = {
    sm: "h-12 px-6 text-[10px] rounded-2xl",
    md: "h-16 px-10 text-xs rounded-2xl",
    lg: "h-20 px-12 text-sm rounded-2xl",
    icon: "h-16 w-16 p-0 rounded-2xl",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      className={cn(baseStyles, variants[variant], sizes[size], fullWidth ? 'w-full' : '', className)}
      disabled={isLoading || disabled}
      {...props}
    >
      <span className={cn("inline-flex items-center gap-2 transition-opacity", isLoading ? 'opacity-0' : 'opacity-100')}>
        {children}
      </span>

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      )}
    </motion.button>
  );
};
