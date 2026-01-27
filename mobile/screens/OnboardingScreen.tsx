import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Dimensions, useWindowDimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft
} from 'react-native-reanimated';
import { Button } from '../components/Button';
import { ScanLine, BarChart3, BellRing, ChevronRight } from 'lucide-react-native';
import { cn } from '../utils/cn';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: 1,
    title: 'Effortless Attendance',
    description: 'Track attendance with just a few taps. Simple, fast, and completely paperless.',
    icon: ScanLine,
    color: '#C1B66D',
  },
  {
    id: 2,
    title: 'Real-time Analytics',
    description: 'Stay updated with instant reports and insights on your attendance patterns.',
    icon: BarChart3,
    color: '#C1B66D',
  },
  {
    id: 3,
    title: 'Smart Notifications',
    description: 'Get notified about important updates and reminders instantly on your device.',
    icon: BellRing,
    color: '#C1B66D',
  },
];

export default function OnboardingScreen({ navigation }: any) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { width: windowWidth } = useWindowDimensions();

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigation.replace('Login');
    }
  };

  const handleSkip = () => {
    navigation.replace('Login');
  };

  const SlideContent = ({ slide }: { slide: typeof SLIDES[0] }) => {
    const Icon = slide.icon;
    return (
      <Animated.View 
        entering={FadeIn.duration(600)}
        exiting={FadeOut.duration(400)}
        className="flex-1 items-center justify-center px-8"
      >
        <View className="bg-surface p-10 rounded-full mb-10 border border-zinc-800">
          <Icon size={80} color={slide.color} strokeWidth={1.5} />
        </View>
        <Text className="text-white text-3xl font-bold text-center mb-4">
          {slide.title}
        </Text>
        <Text className="text-text-muted text-lg text-center leading-6">
          {slide.description}
        </Text>
      </Animated.View>
    );
  };

  return (
    <View className="flex-1 bg-background">
      {/* Skip Button */}
      <View className="absolute top-12 right-6 z-10">
        <TouchableOpacity onPress={handleSkip}>
          <Text className="text-text-muted font-medium">Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View className="flex-1">
        <SlideContent key={currentSlide} slide={SLIDES[currentSlide]} />
      </View>

      {/* Footer */}
      <View className="p-8 pb-12">
        <View className="flex-row items-center justify-between">
          {/* Dots Indicator */}
          <View className="flex-row gap-2">
            {SLIDES.map((_, index) => (
              <View 
                key={index}
                className={cn(
                  "h-2 rounded-full transition-all",
                  currentSlide === index ? "w-8 bg-primary" : "w-2 bg-zinc-800"
                )}
              />
            ))}
          </View>

          {/* Next Button */}
          <TouchableOpacity 
            onPress={handleNext}
            className="bg-primary w-14 h-14 rounded-full items-center justify-center shadow-lg shadow-primary/20"
          >
            {currentSlide === SLIDES.length - 1 ? (
              <Animated.View entering={FadeIn}>
                 <ChevronRight size={30} color="#002368" />
              </Animated.View>
            ) : (
              <ChevronRight size={30} color="#002368" />
            )}
          </TouchableOpacity>
        </View>
        
        {currentSlide === SLIDES.length - 1 && (
          <Animated.View entering={FadeIn.delay(300)} className="mt-8">
            <Button onPress={handleNext}>
              Get Started
            </Button>
          </Animated.View>
        )}
      </View>
    </View>
  );
}
