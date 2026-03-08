import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { ChevronLeft, Calendar, AlertTriangle, TrendingUp } from 'lucide-react-native';
import Svg, { Circle } from 'react-native-svg';
import Fonts from '@/constants/fonts';
import { useLecturerDashboard } from '@/hooks/useLecturerDashboard';
import { useCourses } from '@/hooks/useApi';

export default function LecturerAnalyticsScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const { data: dashboardData, isLoading: statsLoading } = useLecturerDashboard();
  const { data: coursesData, isLoading: coursesLoading } = useCourses();

  const avgAttendance = dashboardData?.avg_attendance_percentage || 0;
  const circumference = 2 * Math.PI * 70;
  const strokeDashoffset = circumference - (avgAttendance / 100) * circumference;

  const courses = Array.isArray(coursesData) ? coursesData : (coursesData?.results || []);

  if (statsLoading || coursesLoading) {
    return (
        <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
            <ActivityIndicator color={colors.primary} size="large" />
        </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Lecturer Analytics</Text>
        <TouchableOpacity style={styles.calendarBtn}>
          <Calendar size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Overall Average Section */}
        <View style={styles.avgSection}>
            <View style={styles.progressContainer}>
                <Svg width="180" height="180" viewBox="0 0 160 160">
                    <Circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke={isDark ? '#4a4121' : '#F1F5F9'}
                        strokeWidth="12"
                        fill="none"
                    />
                    <Circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke={colors.primary}
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${circumference} ${circumference}`}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        transform="rotate(-90 80 80)"
                    />
                </Svg>
                <View style={styles.avgTextContainer}>
                    <Text style={[styles.avgValue, { color: colors.primary }]}>{avgAttendance}%</Text>
                    <Text style={[styles.avgLabel, { color: colors.text, opacity: 0.6 }]}>Avg. Attendance</Text>
                </View>
            </View>

            <View style={styles.statusContainer}>
                <View style={styles.statusHeader}>
                    <Text style={[styles.statusText, { color: colors.text }]}>Performance Status</Text>
                    <View style={[styles.statusBadge, { backgroundColor: colors.primary + '1A' }]}>
                        <Text style={[styles.statusBadgeText, { color: colors.primary }]}>
                            {avgAttendance >= 80 ? 'GOLD STANDARD' : avgAttendance >= 60 ? 'SATISFACTORY' : 'REQUIRES ATTENTION'}
                        </Text>
                    </View>
                </View>
                <View style={[styles.statusBarBg, { backgroundColor: colors.primary + '33' }]}>
                    <View style={[styles.statusBarFill, { width: `${avgAttendance}%`, backgroundColor: colors.primary }]} />
                </View>
            </View>
        </View>

        {/* Attendance Trends */}
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Attendance Trends</Text>
            </View>
            <View style={[styles.chartContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FFF', borderColor: colors.border }]}>
                <View style={styles.barChart}>
                    {dashboardData?.weekly_overview?.map((item: any, idx: number) => {
                        const maxAttendees = Math.max(...(dashboardData?.weekly_overview?.map((d: any) => d.attendees) || [100]));
                        const barHeight = maxAttendees > 0 ? (item.attendees / maxAttendees) * 100 : 0;
                        return (
                            <Bar key={idx} day={item.name.substring(0, 3).toUpperCase()} height={barHeight} colors={colors} />
                        );
                    })}
                </View>
            </View>
        </View>

        {/* Course Breakdown */}
        <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 16 }]}>Course Breakdown</Text>
            <View style={styles.courseList}>
                {courses.map((course: any) => (
                    <CourseItem
                        key={course.id}
                        title={course.title || course.name}
                        subtitle={`${course.code} • ${course.enrolled_students_count || 0} Students`}
                        percentage={course.attendance_percentage || 0}
                        warning={(course.attendance_percentage || 0) < 70}
                        colors={colors}
                    />
                ))}
            </View>
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Bar({ day, height, colors }: any) {
    return (
        <View style={styles.barWrapper}>
            <View style={[styles.barBackground, { backgroundColor: colors.primary + '33' }]}>
                <View style={[styles.barFill, { height: `${Math.max(5, height)}%`, backgroundColor: colors.primary }]} />
            </View>
            <Text style={[styles.barDay, { color: colors.text, opacity: 0.6 }]}>{day}</Text>
        </View>
    );
}

function CourseItem({ title, subtitle, percentage, warning, colors }: any) {
    return (
        <View style={[styles.courseItem, { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1 }]}>
            <View style={styles.courseItemTop}>
                <View style={styles.courseItemInfo}>
                    {warning && (
                        <View style={[styles.warningIcon, { backgroundColor: '#EF44441A' }]}>
                            <AlertTriangle size={16} color="#EF4444" />
                        </View>
                    )}
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.courseItemTitle, { color: colors.text }]} numberOfLines={1}>{title}</Text>
                        <Text style={[styles.courseItemSubtitle, { color: warning ? '#EF4444' : colors.text, opacity: warning ? 1 : 0.5 }]}>{subtitle}</Text>
                    </View>
                </View>
                <Text style={[styles.courseItemPercentage, { color: warning ? '#EF4444' : colors.primary }]}>{percentage}%</Text>
            </View>
            <View style={[styles.courseProgressBarBg, { backgroundColor: (warning ? '#EF4444' : colors.primary) + '33' }]}>
                <View style={[styles.courseProgressBarFill, { width: `${percentage}%`, backgroundColor: warning ? '#EF4444' : colors.primary }]} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  backButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontFamily: Fonts.lexend.bold },
  calendarBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { paddingBottom: 160 },
  avgSection: { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 16 },
  progressContainer: { width: 180, height: 180, alignItems: 'center', justifyContent: 'center', marginBottom: 24, position: 'relative' },
  avgTextContainer: { position: 'absolute', alignItems: 'center' },
  avgValue: { fontSize: 36, fontFamily: Fonts.lexend.bold },
  avgLabel: { fontSize: 12, fontFamily: Fonts.lexend.regular },
  statusContainer: { width: '100%', maxWidth: 400 },
  statusHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  statusText: { fontSize: 14, fontFamily: Fonts.lexend.medium },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 },
  statusBadgeText: { fontSize: 10, fontFamily: Fonts.lexend.bold },
  statusBarBg: { height: 8, borderRadius: 4, overflow: 'hidden' },
  statusBarFill: { height: '100%', borderRadius: 4 },
  section: { paddingHorizontal: 16, marginTop: 32 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontFamily: Fonts.lexend.bold },
  chartContainer: { borderRadius: 20, padding: 24, borderWidth: 1 },
  barChart: { flexDirection: 'row', height: 160, alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 },
  barWrapper: { flex: 1, alignItems: 'center', gap: 8 },
  barBackground: { width: '100%', flex: 1, borderRadius: 8, justifyContent: 'flex-end', overflow: 'hidden' },
  barFill: { width: '100%', borderRadius: 8 },
  barDay: { fontSize: 10, fontFamily: Fonts.lexend.bold },
  courseList: { gap: 12 },
  courseItem: { padding: 16, borderRadius: 16 },
  courseItemTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  courseItemInfo: { flexDirection: 'row', gap: 12, flex: 1 },
  warningIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  courseItemTitle: { fontSize: 15, fontFamily: Fonts.lexend.bold },
  courseItemSubtitle: { fontSize: 12, fontFamily: Fonts.lexend.regular },
  courseItemPercentage: { fontSize: 18, fontFamily: Fonts.lexend.bold },
  courseProgressBarBg: { height: 6, borderRadius: 3, overflow: 'hidden' },
  courseProgressBarFill: { height: '100%', borderRadius: 3 }
});
