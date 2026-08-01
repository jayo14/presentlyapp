import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Animated } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { Check, Calendar, Clock, LayoutDashboard } from 'lucide-react-native';
import Fonts from '@/constants/fonts';
import { useEffect, useRef } from 'react';

const { width, height } = Dimensions.get('window');

export default function EnrollmentSuccessScreen() {
  const router = useRouter();
  const { code, title, credits } = useLocalSearchParams();
  const { colors, isDark } = useTheme();

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
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
  }, []);

  const bgColor = isDark ? '#12110a' : colors.background;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Decorative Background Glows */}
      <View style={[styles.glow, { top: height * 0.15, backgroundColor: 'rgba(249, 196, 6, 0.1)', width: 300, height: 300, borderRadius: 150 }]} />
      <View style={[styles.glow, { bottom: height * 0.2, backgroundColor: 'rgba(249, 196, 6, 0.05)', width: 200, height: 200, borderRadius: 100 }]} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
            {/* Success Icon */}
            <View style={styles.iconWrapper}>
                <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulseAnim }], opacity: 0.2, width: 140, height: 140, borderRadius: 70 }]} />
                <Animated.View style={[styles.pulseRing, { transform: [{ scale: Animated.multiply(pulseAnim, 1.2) }], opacity: 0.1, width: 180, height: 180, borderRadius: 90 }]} />
                <View style={styles.checkCircle}>
                    <Check size={56} color="#12110a" strokeWidth={4} />
                </View>
            </View>

            <Text style={[styles.successTitle, { color: isDark ? '#FFFFFF' : colors.text }]}>
                Successfully Enrolled{'\n'}in <Text style={{ color: '#f9c406' }}>{code || 'CS401'}</Text>
            </Text>
            <Text style={styles.successSubtitle}>COURSE REGISTRATION CONFIRMED</Text>

            {/* Info Card */}
            <View style={[styles.infoCard, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#FFFFFF', borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#F1F5F9' }]}>
                <View style={styles.cardHeader}>
                    <View>
                        <Text style={styles.cardLabel}>COURSE CODE</Text>
                        <Text style={styles.cardValueLarge}>{code || 'CS401'}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.cardLabel}>CREDITS</Text>
                        <Text style={[styles.cardValueLarge, { color: isDark ? '#FFFFFF' : colors.text }]}>{credits || '4.0'} Units</Text>
                    </View>
                </View>

                <View style={styles.cardDivider} />

                <View style={styles.infoRow}>
                    <View style={[styles.infoIcon, { backgroundColor: 'rgba(249, 196, 6, 0.1)' }]}>
                        <Calendar size={20} color="#f9c406" />
                    </View>
                    <View>
                        <Text style={styles.infoLabel}>Schedule</Text>
                        <Text style={[styles.infoValue, { color: isDark ? '#FFFFFF' : colors.text }]}>Mon, Wed, Fri</Text>
                    </View>
                </View>

                <View style={styles.infoRow}>
                    <View style={[styles.infoIcon, { backgroundColor: 'rgba(249, 196, 6, 0.1)' }]}>
                        <Clock size={20} color="#f9c406" />
                    </View>
                    <View>
                        <Text style={styles.infoLabel}>Time</Text>
                        <Text style={[styles.infoValue, { color: isDark ? '#FFFFFF' : colors.text }]}>10:00 AM - 11:30 AM</Text>
                    </View>
                </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonGroup}>
                <TouchableOpacity
                    style={styles.primaryBtn}
                    onPress={() => router.replace('/(student)')}
                >
                    <Text style={styles.primaryBtnText}>Go to Dashboard</Text>
                    <LayoutDashboard size={20} color="#12110a" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.secondaryBtn, { borderColor: 'rgba(249, 196, 6, 0.3)', backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'transparent' }]}
                    onPress={() => router.canGoBack() ? router.back() : router.replace("/")}
                >
                    <Text style={styles.secondaryBtnText}>Add Another Course</Text>
                </TouchableOpacity>
            </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  glow: {
    position: 'absolute',
    left: '50%',
    marginLeft: -100, // centered roughly
    zIndex: 0,
    // Note: React Native doesn't have a direct blur filter for Views like CSS,
    // but we can use opacity or dedicated libraries.
    // For simplicity, we use translucent colors.
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 40,
    paddingBottom: 40,
  },
  content: {
    paddingHorizontal: 24,
    alignItems: 'center',
    zIndex: 1,
  },
  iconWrapper: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  pulseRing: {
    position: 'absolute',
    backgroundColor: '#f9c406',
  },
  checkCircle: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: '#f9c406',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#f9c406',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
  },
  successTitle: {
    fontSize: 32,
    fontFamily: Fonts.lexend.bold,
    textAlign: 'center',
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  successSubtitle: {
    fontSize: 12,
    fontFamily: Fonts.lexend.light,
    color: '#94A3B8',
    marginTop: 12,
    letterSpacing: 2,
  },
  infoCard: {
    width: '100%',
    marginTop: 40,
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 30,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  cardLabel: {
    fontSize: 10,
    fontFamily: Fonts.lexend.semiBold,
    color: '#64748B',
    letterSpacing: 2,
    marginBottom: 4,
  },
  cardValueLarge: {
    fontSize: 20,
    fontFamily: Fonts.lexend.bold,
    color: '#f9c406',
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
    padding: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: Fonts.lexend.regular,
    color: '#94A3B8',
  },
  infoValue: {
    fontSize: 14,
    fontFamily: Fonts.lexend.medium,
  },
  buttonGroup: {
    width: '100%',
    marginTop: 40,
    gap: 16,
  },
  primaryBtn: {
    height: 64,
    backgroundColor: '#f9c406',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#f9c406',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  primaryBtnText: {
    fontSize: 18,
    fontFamily: Fonts.lexend.bold,
    color: '#12110a',
  },
  secondaryBtn: {
    height: 64,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    fontSize: 18,
    fontFamily: Fonts.lexend.bold,
    color: '#f9c406',
  }
});
