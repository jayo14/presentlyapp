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
  const baseStyles = "relative inline-flex items-center justify-center font-semibold transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:pointer-events-none select-none";

  const variants = {
    primary: "bg-primary text-on-primary-fixed shadow-gold hover:-translate-y-0.5 hover:shadow-lg",
    secondary: "bg-on-surface text-background hover:-translate-y-0.5 hover:shadow-md",
    outline: "bg-transparent border border-outline text-on-surface hover:bg-surfaceHigh",
    ghost: "bg-transparent text-on-surface hover:bg-surfaceHigh",
    error: "bg-soft-coral text-white shadow-md",
    destructive: "bg-soft-coral text-white shadow-md"
  };

  const sizes = {
    sm: "h-10 px-4 text-xs rounded-full",
    md: "h-[52px] px-[28px] text-sm rounded-full",
    lg: "h-[64px] px-[32px] text-base rounded-full",
    icon: "h-12 w-12 p-0 rounded-full",
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
