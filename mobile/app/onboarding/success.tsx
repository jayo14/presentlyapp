import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { Check, ArrowRight } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import Fonts from '@/constants/fonts';

export default function OnboardingSuccessScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { user } = useAuth();

  const handleEnterDashboard = () => {
    if (user?.role === 'lecturer') {
      router.replace('/(lecturer)');
    } else {
      router.replace('/(student)');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      {/* Mesh Gradient / Background effect */}
      <View style={[styles.meshGradient, { backgroundColor: colors.primary + '0D' }]} />

      <View style={styles.content}>
        <View style={styles.successIconSection}>
          <View style={[styles.glowBackground, { backgroundColor: colors.primary + '33' }]} />
          <View style={[styles.iconCircle, { backgroundColor: colors.primary, borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)' }]}>
            <Check size={80} color={isDark ? '#231f0f' : '#FFFFFF'} strokeWidth={4} />
          </View>
          {/* Small decorative circles */}
          <View style={[styles.decoCircle1, { backgroundColor: colors.primary }]} />
          <View style={[styles.decoCircle2, { backgroundColor: colors.primary + '66' }]} />
        </View>

        <View style={styles.textSection}>
          <Text style={[styles.title, { color: isDark ? colors.primary : colors.text }]}>
            You{"'"}re all set!
          </Text>
          <Text style={[styles.subtitle, { color: isDark ? colors.primary + 'B3' : colors.textSecondary }]}>
            Your academic profile is verified and ready.
          </Text>
        </View>

        <View style={[styles.patternContainer, { borderColor: colors.primary + '33' }]}>
          <Image
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5dfThYcyvktlQV8_0pjvtDm4wWVOhtid76sfsWcokAsyq4LOQSNSxkjg0emnLnQQcRjTRsyYQ6PrLFr1j_YzUr44o65BD-dBGwP67_EsPlAxOXA4-ITTG8DakvwW6jedM6LNpqVpa_dBSjrlL1fZXMmXUmypY1lfqCpLh4HrAwd5upKxJjVkVJ7xeeS9kLku6X_PqsqC6ty8LwEVGipge0VQIfcJ5O5Hp_fwMXfOrRHZ7LXvreHtpg3OP0VWvMFzFfPSX7vDcHm_y' }}
            style={styles.patternImage}
            resizeMode="cover"
          />
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.enterButton, { backgroundColor: colors.primary }]}
          onPress={handleEnterDashboard}
          activeOpacity={0.8}
        >
          <Text style={[styles.enterButtonText, { color: '#231f0f' }]}>Enter Dashboard</Text>
          <ArrowRight size={24} color="#231f0f" strokeWidth={3} />
        </TouchableOpacity>

        <View style={styles.dotsContainer}>
          <View style={[styles.dot, { backgroundColor: colors.primary + '66', width: 24 }]} />
          <View style={[styles.dot, { backgroundColor: colors.primary + '66', width: 24 }]} />
          <View style={[styles.dot, { backgroundColor: colors.primary + '66', width: 24 }]} />
          <View style={[styles.dotActive, { backgroundColor: colors.primary }]} />
        </View>

        <View style={[styles.homeIndicator, { backgroundColor: isDark ? '#FFFFFF33' : '#00000033' }]} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  meshGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '60%',
    // @ts-ignore
    filter: 'blur(100px)',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  successIconSection: {
    position: 'relative',
    marginBottom: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowBackground: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    // @ts-ignore
    filter: 'blur(40px)',
  },
  iconCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#f9c815',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 10,
  },
  decoCircle1: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 20,
    height: 20,
    borderRadius: 10,
    opacity: 0.6,
  },
  decoCircle2: {
    position: 'absolute',
    bottom: 20,
    left: -30,
    width: 16,
    height: 16,
    borderRadius: 8,
    opacity: 0.4,
  },
  textSection: {
    alignItems: 'center',
    marginBottom: 64,
  },
  title: {
    fontSize: 40,
    fontFamily: Fonts.lexend.bold,
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: Fonts.lexend.regular,
    textAlign: 'center',
    lineHeight: 28,
    maxWidth: 280,
  },
  patternContainer: {
    width: 140,
    height: 140,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    opacity: 0.2,
    // @ts-ignore
    filter: 'grayscale(1) contrast(1.25)',
  },
  patternImage: {
    width: '100%',
    height: '100%',
  },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 12,
  },
  enterButton: {
    width: '100%',
    height: 64,
    borderRadius: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#f9c815',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  enterButtonText: {
    fontSize: 20,
    fontFamily: Fonts.lexend.bold,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 32,
    marginBottom: 24,
  },
  dot: {
    height: 4,
    borderRadius: 2,
  },
  dotActive: {
    width: 40,
    height: 4,
    borderRadius: 2,
    shadowColor: '#f9c815',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
  },
  homeIndicator: {
    width: 144,
    height: 6,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 8,
  },
});
