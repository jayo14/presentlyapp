import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { CheckCircle2, Landmark, Layers, Calendar, QrCode, Users, Edit, ChevronRight } from 'lucide-react-native';
import Fonts from '@/constants/fonts';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

const { width, height } = Dimensions.get('window');

export default function CreateCourseSuccessScreen() {
  const router = useRouter();
  const { id, code, title } = useLocalSearchParams();
  const { colors, isDark } = useTheme();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const bottomDockOffset = tabBarHeight + insets.bottom;

  const bgColor = isDark ? '#0A0A0A' : colors.background;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Confetti simulation with views */}
      <View style={styles.confettiContainer} pointerEvents="none">
        <View style={[styles.confetti, { top: '10%', left: '15%' }]} />
        <View style={[styles.confetti, { top: '25%', left: '80%', transform: [{ scale: 1.5 }] }]} />
        <View style={[styles.confetti, { top: '45%', left: '10%' }]} />
        <View style={[styles.confetti, { top: '60%', left: '85%', transform: [{ scale: 0.75 }] }]} />
        <View style={[styles.confetti, { top: '80%', left: '20%', transform: [{ scale: 1.25 }] }]} />
        <View style={[styles.confetti, { top: '15%', left: '50%' }]} />
        <View style={[styles.confetti, { top: '70%', left: '50%', opacity: 0.2 }]} />
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomDockOffset + 24 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
            <View style={styles.successBadge}>
                <CheckCircle2 size={32} color="#FFCA0D" />
            </View>
            <Text style={styles.successLabel}>COURSE CREATED SUCCESSFULLY</Text>
            <Text style={styles.courseCode}>{code || 'CSC 401'}</Text>
            <Text style={styles.courseTitle}>{title || 'Advanced Software Engineering'}</Text>
        </View>

        <View style={styles.infoSection}>
            <View style={styles.deptCard}>
                <View style={styles.cardIcon}>
                    <Landmark size={24} color="rgba(255, 255, 255, 0.6)" />
                </View>
                <View>
                    <Text style={styles.cardLabel}>DEPARTMENT</Text>
                    <Text style={styles.cardValue}>Computer Science & Engineering</Text>
                </View>
            </View>

            <View style={styles.row}>
                <View style={styles.miniCard}>
                    <View style={styles.cardIcon}>
                        <Layers size={20} color="rgba(255, 255, 255, 0.6)" />
                    </View>
                    <Text style={styles.cardLabel}>LEVEL</Text>
                    <Text style={styles.cardValue}>400 Level</Text>
                </View>
                <View style={styles.miniCard}>
                    <View style={styles.cardIcon}>
                        <Calendar size={20} color="rgba(255, 255, 255, 0.6)" />
                    </View>
                    <Text style={styles.cardLabel}>SEMESTER</Text>
                    <Text style={styles.cardValue}>1st Semester</Text>
                </View>
            </View>
        </View>

        <View style={styles.actionsSection}>
            <Text style={styles.sectionLabel}>QUICK ACTIONS</Text>

            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FFCA0D' }]}>
                <View style={styles.actionLeft}>
                    <QrCode size={24} color="#0A0A0A" strokeWidth={2.5} />
                    <Text style={[styles.actionText, { color: '#0A0A0A' }]}>Start Attendance Session</Text>
                </View>
                <ChevronRight size={20} color="#0A0A0A" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryActionBtn}>
                <View style={styles.actionLeft}>
                    <Users size={24} color="rgba(255, 255, 255, 0.6)" />
                    <Text style={styles.secondaryActionText}>Enroll Students</Text>
                </View>
                <ChevronRight size={20} color="rgba(255, 255, 255, 0.3)" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryActionBtn}>
                <View style={styles.actionLeft}>
                    <Edit size={24} color="rgba(255, 255, 255, 0.6)" />
                    <Text style={styles.secondaryActionText}>Edit Course Details</Text>
                </View>
                <ChevronRight size={20} color="rgba(255, 255, 255, 0.3)" />
            </TouchableOpacity>
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Navigation bottom simulation - we use the existing tab layout,
          but if this is a full screen modal we might need to go back */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  confetti: {
    position: 'absolute',
    width: 4,
    height: 4,
    backgroundColor: '#FFCA0D',
    borderRadius: 2,
    opacity: 0.3,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 32,
  },
  successBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 202, 13, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 202, 13, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successLabel: {
    fontSize: 10,
    fontFamily: Fonts.lexend.bold,
    color: '#FFCA0D',
    letterSpacing: 2.5,
    marginBottom: 8,
  },
  courseCode: {
    fontSize: 72,
    fontFamily: Fonts.lexend.black,
    color: '#FFCA0D',
    fontStyle: 'italic',
    letterSpacing: -4,
  },
  courseTitle: {
    fontSize: 20,
    fontFamily: Fonts.lexend.semibold,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  infoSection: {
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 32,
  },
  deptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 16,
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardLabel: {
    fontSize: 9,
    fontFamily: Fonts.lexend.bold,
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 14,
    fontFamily: Fonts.lexend.medium,
    color: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  miniCard: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  actionsSection: {
    paddingHorizontal: 24,
    gap: 12,
  },
  sectionLabel: {
    fontSize: 10,
    fontFamily: Fonts.lexend.bold,
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: 2,
    marginBottom: 4,
    marginLeft: 4,
  },
  actionBtn: {
    height: 64,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionText: {
    fontSize: 15,
    fontFamily: Fonts.lexend.bold,
  },
  secondaryActionBtn: {
    height: 64,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  secondaryActionText: {
    fontSize: 15,
    fontFamily: Fonts.lexend.semibold,
    color: '#FFFFFF',
  }
});
