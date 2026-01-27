import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';
import { cn } from '../utils/cn';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  containerClassName?: string;
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  icon, 
  className, 
  containerClassName,
  ...props 
}) => {
  return (
    <View className={cn("w-full", containerClassName)}>
      {label && <Text className="text-sm font-medium text-text-secondary mb-1.5">{label}</Text>}
      <View className="relative">
        <TextInput
          className={cn(
            "w-full bg-surface border border-border rounded-lg px-4 py-3 text-white placeholder-text-muted",
            "focus:border-primary",
            icon ? 'pl-10' : '',
            error ? 'border-destructive' : '',
            className
          )}
          placeholderTextColor="#71717a"
          {...props}
        />
        {icon && (
          <View className="absolute left-3 top-0 bottom-0 justify-center">
            {icon}
          </View>
        )}
      </View>
      {error && <Text className="mt-1 text-xs text-destructive">{error}</Text>}
    </View>
  );
};
