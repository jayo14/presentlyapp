import React from 'react';
import { View, Text } from 'react-native';
import { ScanLine } from 'lucide-react-native';
import { cn } from '../utils/cn'; // We'll need a utility for class names if we want to mimic clsx/tailwind-merge pattern, or just use string interpolation.
// For simplicity in this step, I'll use standard string interpolation and inline styles where tailwind classes might get complex with conditional logic, but primarily nativewind classes.

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "", size = 24, showText = true }) => {
  return (
    <View className={`flex-row items-center gap-2 ${className}`}>
      <View className="bg-primary p-1.5 rounded-lg">
        <ScanLine size={size} color="black" strokeWidth={2.5} />
      </View>
      {showText && <Text className="text-white font-bold text-xl tracking-tight">Presently</Text>}
    </View>
  );
};
