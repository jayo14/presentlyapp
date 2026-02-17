import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { storage } from '@/utils/storage';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { ShieldCheck } from 'lucide-react-native';
import Fonts from '@/constants/fonts';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const { colors } = useTheme();

  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    checkNavigation();
  }, [isLoading]);

  const checkNavigation = async () => {
    if (isLoading) return;

    setTimeout(async () => {
      const hasOnboarded = await storage.hasCompletedOnboarding();
      
      if (isAuthenticated && user) {
        if (user.role === 'admin') {
          router.replace('/(admin)');
        } else if (user.role === 'lecturer') {
          router.replace('/(lecturer)');
        } else {
          router.replace('/(student)');
        }
      } else if (hasOnboarded) {
        router.replace('/auth/sign-in');
      } else {
        router.replace('/onboarding');
      }
    }, 2500);
  };

  return (
    <View style={[styles.container, { backgroundColor: '#000000' }]}>
      {/* Background Glows */}
      <View style={styles.glowOuter} />
      <View style={styles.glowInner} />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.logoSection}>
          <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulseAnim }], opacity: 0.2 }]} />
          <Animated.View style={[styles.pulseRingOuter, { transform: [{ scale: Animated.multiply(pulseAnim, 1.2) }], opacity: 0.1 }]} />

          <View style={[styles.logoCircle, { borderColor: colors.primary }]}>
            <ShieldCheck size={64} color={colors.primary} strokeWidth={1.5} />
          </View>
        </View>

        <Text style={[styles.title, { color: '#FFFFFF' }]}>Presently</Text>
      </Animated.View>

      <View style={styles.footer}>
        <View style={[styles.divider, { backgroundColor: colors.primary + '40' }]} />
        <Text style={[styles.tagline, { color: colors.primary + 'E6' }]}>
          VERIFIED ATTENDANCE.{'\n'}REAL PRESENCE.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowOuter: {
    position: 'absolute',
    width: 500,
    height: 500,
    borderRadius: 250,
    backgroundColor: 'rgba(249, 196, 6, 0.05)',
    // @ts-ignore
    filter: 'blur(100px)',
  },
  glowInner: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(249, 196, 6, 0.1)',
    // @ts-ignore
    filter: 'blur(60px)',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoSection: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  pulseRing: {
    position: 'absolute',
    width: 144,
    height: 144,
    borderRadius: 72,
    borderWidth: 1,
    borderColor: '#f9c406',
  },
  pulseRingOuter: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1,
    borderColor: '#f9c406',
  },
  logoCircle: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: '#231e0f',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    // shadowColor: '#f9c406',
    // shadowOffset: { width: 0, height: 0 },
    // shadowOpacity: 0.3,
    // shadowRadius: 30,
    // elevation: 10,
  },
  title: {
    fontSize: 40,
    fontFamily: Fonts.manrope.extraBold,
    letterSpacing: -1,
    marginTop: 16,
  },
  footer: {
    position: 'absolute',
    bottom: 60,
    width: '100%',
    alignItems: 'center',
  },
  divider: {
    width: 48,
    height: 1,
    marginBottom: 24,
  },
  tagline: {
    fontSize: 12,
    fontFamily: Fonts.manrope.medium,
    textAlign: 'center',
    letterSpacing: 2,
    lineHeight: 20,
  },
});
