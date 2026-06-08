import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { CheckCircle, Calendar, Clock, ChevronLeft } from 'lucide-react-native';
import Fonts from '@/constants/fonts';

export default function AttendanceSuccessScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const params = useLocalSearchParams<{
    courseCode: string;
    courseName: string;
    location: string;
    time: string;
  }>();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      {/* Top Navigation Bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace("/")} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Verification Success</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Success Icon */}
        <View style={styles.iconSection}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primary + '33' }]}>
            <CheckCircle size={80} color={colors.primary} strokeWidth={2.5} fill={colors.primary + '00'} />
          </View>
        </View>

        {/* Headline Text */}
        <Text style={[styles.headline, { color: colors.text }]}>Attendance Verified!</Text>

        {/* Details Card */}
        <View style={styles.cardContainer}>
          <View style={[styles.card, { backgroundColor: isDark ? '#352e18' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#E2E8F0' }]}>
            <View style={styles.cardLeft}>
              <Text style={[styles.cardLabel, { color: isDark ? '#ccbf8e' : colors.textSecondary }]}>COURSE DETAILS</Text>
              <Text style={[styles.courseTitle, { color: colors.text }]}>
                {params.courseCode} {params.courseName || 'Data Structures'}
              </Text>

              <View style={styles.detailRows}>
                <View style={styles.detailRow}>
                  <Calendar size={14} color={isDark ? '#ccbf8e' : colors.textSecondary} />
                  <Text style={[styles.detailText, { color: isDark ? '#ccbf8e' : colors.textSecondary }]}>
                    {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Clock size={14} color={isDark ? '#ccbf8e' : colors.textSecondary} />
                  <Text style={[styles.detailText, { color: isDark ? '#ccbf8e' : colors.textSecondary }]}>
                    {params.time || '10:15 AM'}
                  </Text>
                </View>
              </View>
            </View>

            <Image
              source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuCL--efoqCRi5F6YlIKmOe5N7Mo-jju9lAzUHDJDiGpcVhWea75o_jbl87gP-p32Z2eI8MTspKoM-9oDCVr-Y8Kk1HnYm_KoPza-MaPb-KJNYS491-f3H8d30j0XPW41o1p6QXT7JfVBzvSo3E3tK842AfCoVdtnA-eZ0Op_UvPacE97gNE7_LyDeK6dlwtUK2AuYJze1_Y8BSJb81iPAMz-Ww42I363gs4AnxusFMPrve2bYhU_OjtEEnD33t__CzfV_xALINc63bn" }}
              style={styles.cardImage}
            />
          </View>
        </View>

        {/* Success Celebration Message */}
        <Text style={[styles.message, { color: isDark ? '#ccbf8e' : colors.textSecondary }]}>
          Your attendance has been successfully recorded in the system.
        </Text>
      </ScrollView>

      {/* Bottom Action Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.doneButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/(student)')}
          activeOpacity={0.8}
        >
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: Fonts.lexend.bold,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  iconSection: {
    marginVertical: 24,
  },
  iconContainer: {
    width: 128,
    height: 128,
    borderRadius: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headline: {
    fontSize: 32,
    fontFamily: Fonts.lexend.bold,
    textAlign: 'center',
    marginBottom: 24,
  },
  cardContainer: {
    width: '100%',
    marginBottom: 24,
  },
  card: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  cardLeft: {
    flex: 1,
    justifyContent: 'center',
  },
  cardLabel: {
    fontSize: 10,
    fontFamily: Fonts.lexend.bold,
    letterSpacing: 1,
    marginBottom: 8,
  },
  courseTitle: {
    fontSize: 20,
    fontFamily: Fonts.lexend.bold,
    marginBottom: 12,
  },
  detailRows: {
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    fontFamily: Fonts.lexend.regular,
  },
  cardImage: {
    width: 96,
    height: 96,
    borderRadius: 16,
    marginLeft: 16,
  },
  message: {
    fontSize: 14,
    fontFamily: Fonts.lexend.regular,
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  doneButton: {
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#f9c406',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  doneButtonText: {
    fontSize: 18,
    fontFamily: Fonts.lexend.bold,
    color: '#231e0f',
  }
});
