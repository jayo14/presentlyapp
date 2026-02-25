import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { Check, X } from 'lucide-react-native';
import Fonts from '@/constants/fonts';

export default function DropSuccessScreen() {
  const router = useRouter();
  const { code, title } = useLocalSearchParams();
  const { colors, isDark } = useTheme();

  const bgColor = isDark ? '#231e0f' : colors.background;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/(student)/courses')} style={styles.closeBtn}>
            <X size={28} color={isDark ? '#FFFFFF' : '#111418'} />
        </TouchableOpacity>
        <Text style={styles.headerLabel}>MANAGEMENT</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
            <View style={[styles.glow, { opacity: 0.1, transform: [{ scale: 1.5 }] }]} />
            <View style={[styles.glow, { opacity: 0.3, transform: [{ scale: 1.1 }], borderWidth: 1, borderColor: '#f9c406' }]} />
            <View style={styles.checkCircle}>
                <Check size={64} color="#231e0f" strokeWidth={6} />
            </View>
        </View>

        <Text style={[styles.title, { color: isDark ? '#FFFFFF' : colors.text }]}>Course Dropped</Text>
        <Text style={styles.courseName}>{code} - {title}</Text>
        <Text style={styles.subtitle}>
            This course has been successfully removed from your registration for the upcoming semester.
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.replace('/(student)/courses')}
        >
            <Text style={styles.backBtnText}>Back to Courses</Text>
        </TouchableOpacity>
        <Text style={styles.footerBrand}>PREMIUM UNIVERSITY PORTAL</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  closeBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  headerLabel: {
    fontSize: 12,
    fontFamily: Fonts.lexend.medium,
    color: '#94A3B8',
    letterSpacing: 2,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 128,
    height: 128,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 48,
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: '#f9c406',
  },
  checkCircle: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: '#f9c406',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#f9c406',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 36,
    fontFamily: Fonts.lexend.bold,
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -1,
  },
  courseName: {
    fontSize: 18,
    fontFamily: Fonts.lexend.medium,
    color: '#f9c406',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: Fonts.lexend.regular,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
  },
  footer: {
    padding: 32,
    paddingBottom: 48,
    gap: 16,
  },
  backBtn: {
    height: 56,
    backgroundColor: '#f9c406',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  backBtnText: {
    fontSize: 18,
    fontFamily: Fonts.lexend.bold,
    color: '#231e0f',
  },
  footerBrand: {
    fontSize: 10,
    fontFamily: Fonts.lexend.medium,
    color: '#64748B',
    textAlign: 'center',
    letterSpacing: 2,
    textTransform: 'uppercase',
  }
});
