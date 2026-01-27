import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence,
  withSpring,
  withDelay,
  runOnJS
} from 'react-native-reanimated';
import { Logo } from '../components/Logo';

export default function SplashScreen({ navigation }: any) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withSequence(
      withTiming(1, { duration: 1000 }),
      withDelay(1500, withTiming(0, { duration: 500 }, (finished) => {
        if (finished) {
          runOnJS(navigation.replace)('Onboarding');
        }
      }))
    );
    
    translateY.value = withSpring(0, { damping: 12 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    };
  });

  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Animated.View style={animatedStyle} className="items-center">
        <Logo size={48} className="mb-4" />
        <Text className="text-text-secondary text-lg mt-2">Attendance made simple</Text>
      </Animated.View>
    </View>
  );
}
