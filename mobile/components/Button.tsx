import React from 'react';
import { Text, TouchableOpacity, ActivityIndicator, View } from 'react-native';
import { cn } from '../utils/cn';

interface ButtonProps extends React.ComponentProps<typeof TouchableOpacity> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  className?: string;
  textClassName?: string;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading = false,
  className,
  textClassName,
  disabled,
  ...props 
}) => {
  const baseStyles = "items-center justify-center rounded-lg flex-row";
  
  const variants = {
    primary: "bg-primary",
    secondary: "bg-surface border border-zinc-800",
    outline: "border-2 border-primary bg-transparent",
    ghost: "bg-transparent",
  };

  const textVariants = {
    primary: "text-primary-foreground font-semibold",
    secondary: "text-white font-medium",
    outline: "text-primary font-semibold",
    ghost: "text-zinc-400 font-medium",
  };

  const sizes = {
    sm: "h-8 px-3",
    md: "h-12 px-5",
    lg: "h-14 px-8",
  };

  return (
    <TouchableOpacity
      className={cn(baseStyles, variants[variant], sizes[size], disabled && "opacity-50", className)}
      disabled={isLoading || disabled}
      activeOpacity={0.8}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={variant === 'primary' ? '#002368' : '#C1B66D'} className="mr-2" />
      ) : null}
      {typeof children === 'string' ? (
        <Text className={cn(textVariants[variant], size === 'sm' ? 'text-xs' : 'text-base', textClassName)}>
          {children}
        </Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
};
