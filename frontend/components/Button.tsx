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
    primary: "bg-primary text-on-primary-fixed skeuo-button-gold hover:-translate-y-0.5",
    secondary: "bg-on-surface text-background skeuo-button hover:-translate-y-0.5",
    outline: "bg-transparent border border-outline text-on-surface hover:bg-surfaceHigh skeuo-button",
    ghost: "bg-transparent text-on-surface hover:bg-surfaceHigh",
    error: "bg-soft-coral text-white shadow-md",
    destructive: "bg-soft-coral text-white shadow-md"
  };

  const sizes = {
    sm: "h-14 px-6 text-sm rounded-full",
    md: "h-18 px-10 text-base rounded-full",
    lg: "h-22 px-12 text-lg rounded-full",
    icon: "h-16 w-16 p-0 rounded-full",
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
