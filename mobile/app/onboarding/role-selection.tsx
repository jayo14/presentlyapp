import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { GraduationCap, Users, Check, ArrowRight } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import Fonts from '@/constants/fonts';

export default function RoleSelectionScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { user, isLoading, updateProfileDetails } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'student' | 'lecturer' | 'admin' | null>((user?.role as any) || 'student');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/auth/sign-up');
    }
  }, [isLoading, router, user]);

  const handleContinue = async () => {
    if (!selectedRole || !user) return;

    setLoading(true);
    await updateProfileDetails({ role: selectedRole });
    setLoading(false);

    router.push('/onboarding/personal-info');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      {/* Background Glows */}
      <View style={[styles.glowTop, { backgroundColor: colors.primary + '1A' }]} />
      <View style={[styles.glowBottom, { backgroundColor: colors.primary + '0D' }]} />

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.progressHeader}>
            <Text style={[styles.stepText, { color: colors.primary }]}>Step 1 of 4</Text>
            <Text style={[styles.percentageText, { color: colors.textSecondary }]}>25%</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { backgroundColor: colors.primary, width: '25%' }]} />
            <View style={[styles.progressBarBackground, { backgroundColor: colors.primary + '33' }]} />
          </View>
        </View>

        <View style={styles.titleSection}>
          <Text style={[styles.title, { color: colors.text }]}>
            How will you use <Text style={{ color: colors.primary }}>Presently?</Text>
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Choose the role that best describes you to personalize your experience.
          </Text>
        </View>

        <View style={styles.rolesContainer}>
          <TouchableOpacity
            style={[
              styles.roleCard,
              {
                backgroundColor: selectedRole === 'student' ? colors.primary + '1A' : (isDark ? 'rgba(255,255,255,0.05)' : colors.cardBg),
                borderColor: selectedRole === 'student' ? colors.primary : 'transparent',
                borderWidth: 2,
              },
              selectedRole === 'student' && styles.roleCardActive
            ]}
            onPress={() => setSelectedRole('student')}
            activeOpacity={0.9}
            accessible={true}
            accessibilityLabel="Student Role"
            accessibilityRole="radio"
            accessibilityState={{ selected: selectedRole === 'student' }}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
                <GraduationCap size={32} color={isDark ? '#231f0f' : '#FFFFFF'} strokeWidth={2.5} />
              </View>
              {selectedRole === 'student' && (
                <View style={[styles.checkBadge, { backgroundColor: colors.primary }]}>
                  <Check size={14} color={isDark ? '#231f0f' : '#FFFFFF'} strokeWidth={4} />
                </View>
              )}
            </View>
            <Text style={[styles.roleTitle, { color: colors.text }]}>Student</Text>
            <Text style={[styles.roleDescription, { color: colors.textSecondary }]}>
              Track your attendance, view course materials, and stay updated with campus events.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.roleCard,
              {
                backgroundColor: selectedRole === 'lecturer' ? colors.primary + '1A' : (isDark ? 'rgba(255,255,255,0.05)' : colors.cardBg),
                borderColor: selectedRole === 'lecturer' ? colors.primary : 'transparent',
                borderWidth: 2,
              },
              selectedRole === 'lecturer' && styles.roleCardActive
            ]}
            onPress={() => setSelectedRole('lecturer')}
            activeOpacity={0.9}
            accessible={true}
            accessibilityLabel="Lecturer Role"
            accessibilityRole="radio"
            accessibilityState={{ selected: selectedRole === 'lecturer' }}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#F1F5F9' }]}>
                <Users size={32} color={colors.primary} strokeWidth={2.5} />
              </View>
              {selectedRole === 'lecturer' && (
                <View style={[styles.checkBadge, { backgroundColor: colors.primary }]}>
                  <Check size={14} color={isDark ? '#231f0f' : '#FFFFFF'} strokeWidth={4} />
                </View>
              )}
            </View>
            <Text style={[styles.roleTitle, { color: colors.text }]}>Lecturer</Text>
            <Text style={[styles.roleDescription, { color: colors.textSecondary }]}>
              Manage your classes, monitor student engagement, and generate attendance reports easily.
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.continueButton, { backgroundColor: colors.primary }]}
            onPress={handleContinue}
            activeOpacity={0.8}
            disabled={loading}
          >
            <Text style={[styles.continueButtonText, { color: '#231f10' }]}>Continue</Text>
            <ArrowRight size={20} color="#231f10" strokeWidth={3} />
          </TouchableOpacity>
          <Text style={[styles.footerHint, { color: colors.textSecondary }]}>
            YOU CAN CHANGE THIS LATER IN SETTINGS
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  glowTop: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 320,
    height: 320,
    borderRadius: 160,
  },
  glowBottom: {
    position: 'absolute',
    bottom: -100,
    left: -100,
    width: 320,
    height: 320,
    borderRadius: 160,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
  },
  header: {
    paddingTop: 16,
    paddingBottom: 40,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepText: {
    fontSize: 10,
    fontFamily: Fonts.lexend.bold,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  percentageText: {
    fontSize: 10,
    fontFamily: Fonts.lexend.bold,
    letterSpacing: 1,
  },
  progressBarContainer: {
    height: 4,
    width: '100%',
    position: 'relative',
  },
  progressBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: 4,
    borderRadius: 2,
    zIndex: 1,
  },
  progressBarBackground: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: 4,
    width: '100%',
    borderRadius: 2,
  },
  titleSection: {
    marginBottom: 56,
  },
  title: {
    fontSize: 32,
    fontFamily: Fonts.lexend.bold,
    lineHeight: 40,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: Fonts.lexend.regular,
    lineHeight: 24,
  },
  rolesContainer: {
    flex: 1,
    gap: 20,
  },
  roleCard: {
    padding: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  roleCardActive: {
    shadowColor: '#f9c815',
    shadowOpacity: 0.12,
    shadowRadius: 25,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  roleTitle: {
    fontSize: 20,
    fontFamily: Fonts.lexend.bold,
    marginBottom: 6,
  },
  roleDescription: {
    fontSize: 14,
    fontFamily: Fonts.lexend.regular,
    lineHeight: 20,
  },
  footer: {
    marginTop: 64,
    paddingBottom: 32,
    alignItems: 'center',
  },
  continueButton: {
    width: '100%',
    height: 64,
    borderRadius: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#f9c815',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  continueButtonText: {
    fontSize: 18,
    fontFamily: Fonts.lexend.bold,
  },
  footerHint: {
    marginTop: 32,
    fontSize: 10,
    fontFamily: Fonts.lexend.bold,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});
