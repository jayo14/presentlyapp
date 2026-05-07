import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';

type OmittedProps = 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag' | 'style';
interface ButtonProps extends Omit<HTMLMotionProps<"button">, OmittedProps | 'children'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'error';
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
  const baseStyles = "relative inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.97] select-none";

  const variants = {
    primary: "bg-primary text-primary-foreground shadow-lg shadow-primary/10 hover:shadow-primary/20",
    secondary: "bg-surfaceContainer text-text hover:bg-surfaceHigh",
    outline: "bg-transparent border border-outline text-text hover:bg-surfaceContainer",
    ghost: "bg-transparent text-textMuted hover:text-text hover:bg-surfaceContainer",
    error: "bg-error text-white shadow-lg shadow-error/10"
  };

  const sizes = {
    sm: "h-10 px-4 text-xs rounded-md",
    md: "h-[52px] px-6 text-sm rounded-full",
    lg: "h-16 px-8 text-base rounded-full",
    icon: "h-12 w-12 p-0 rounded-full",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      <span className={`inline-flex items-center gap-2 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
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
