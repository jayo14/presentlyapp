import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useAttendance } from '@/contexts/AttendanceContext';
import { ChevronLeft, ChevronDown, TrendingUp, Calculator, BookOpen } from 'lucide-react-native';
import Fonts from '@/constants/fonts';
import Svg, { Circle } from 'react-native-svg';
import { useState, useEffect } from 'react';

export default function StudentAnalyticsScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { stats } = useAttendance();
  const [courseBreakdown, setCourseBreakdown] = useState<any[]>([]);
  const [fetching, setFetching] = useState(false);

  const percentage = stats.percentage || 0;
  const circumference = 2 * Math.PI * 80;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const loadBreakdown = async () => {
    try {
        setFetching(true);
        // This is a placeholder since we don't have a specific breakdown API yet in ApiService
        // But we can simulate or fetch from a general endpoint if it existed
        // For now we'll use the stats and history to build a mock-ish but slightly more dynamic list
        setCourseBreakdown([
            { id: '1', name: 'Advanced Calculus', percentage: 95, icon: <Calculator size={20} color={colors.primary} /> },
            { id: '2', name: 'Physics II', percentage: 88, icon: <BookOpen size={20} color="#42A5F5" /> },
            { id: '3', name: 'History of Art', percentage: 65, icon: <BookOpen size={20} color="#9E9E9E" />, low: true },
            { id: '4', name: 'Comp Sci 101', percentage: 98, icon: <BookOpen size={20} color="#AB47BC" /> },
        ]);
    } catch (e) {
        console.error(e);
    } finally {
        setFetching(false);
    }
  };

  useEffect(() => {
    loadBreakdown();
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
        >
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Attendance Analytics</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Filters */}
        <View style={styles.filtersContainer}>
          <TouchableOpacity style={[styles.filterBtn, { backgroundColor: isDark ? '#4a4121' : '#F1F5F9' }]}>
            <Text style={[styles.filterText, { color: colors.text }]}>Semester 1</Text>
            <ChevronDown size={18} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.filterBtn, { backgroundColor: isDark ? '#4a4121' : '#F1F5F9' }]}>
            <Text style={[styles.filterText, { color: colors.text }]}>All Courses</Text>
            <ChevronDown size={18} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Hero Circular Chart */}
        <View style={styles.heroSection}>
          <View style={styles.chartContainer}>
            <Svg width="200" height="200" viewBox="0 0 200 200">
              <Circle
                cx="100"
                cy="100"
                r="80"
                stroke={isDark ? '#4a4121' : '#F1F5F9'}
                strokeWidth="12"
                fill="none"
              />
              <Circle
                cx="100"
                cy="100"
                r="80"
                stroke={colors.primary}
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform="rotate(-90 100 100)"
              />
            </Svg>
            <View style={styles.chartTextContainer}>
              <Text style={[styles.chartValue, { color: colors.text }]}>{percentage}%</Text>
              <Text style={[styles.chartLabel, { color: colors.textSecondary }]}>Overall Attendance</Text>
            </View>
          </View>

          <View style={[styles.trendBadge, { backgroundColor: '#66BB6A1A' }]}>
            <TrendingUp size={16} color="#10B981" />
            <Text style={[styles.trendText, { color: '#10B981' }]}>+2% vs last month</Text>
          </View>
        </View>

        {/* Weekly Trends Bar Chart */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Weekly Trends</Text>
          <View style={[styles.card, { backgroundColor: isDark ? '#2e2918' : '#FFFFFF' }]}>
            <View style={styles.cardHeader}>
                <View>
                    <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>AVERAGE</Text>
                    <Text style={[styles.cardValue, { color: colors.text }]}>18.5 hrs</Text>
                </View>
                <View style={[styles.periodBadge, { backgroundColor: colors.primary + '33' }]}>
                    <Text style={[styles.periodText, { color: colors.primary }]}>Last 4 Weeks</Text>
                </View>
            </View>

            <View style={styles.barChart}>
                <BarItem label="W1" height="65%" active={false} colors={colors} isDark={isDark} />
                <BarItem label="W2" height="85%" active={false} colors={colors} isDark={isDark} />
                <BarItem label="W3" height="45%" active={false} colors={colors} isDark={isDark} />
                <BarItem label="W4" height="92%" active={true} colors={colors} isDark={isDark} />
            </View>
          </View>
        </View>

        {/* Course Breakdown */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Course Breakdown</Text>
            <TouchableOpacity>
                <Text style={[styles.seeAllText, { color: colors.primary }]}>See All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.courseList}>
            {fetching ? (
                <ActivityIndicator color={colors.primary} />
            ) : (
                courseBreakdown.map((item) => (
                    <CourseStatItem
                        key={item.id}
                        icon={item.icon}
                        name={item.name}
                        percentage={item.percentage}
                        colors={colors}
                        isDark={isDark}
                        low={item.low}
                    />
                ))
            )}
          </View>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function BarItem({ label, height, active, colors, isDark }: any) {
    return (
        <View style={styles.barContainer}>
            <View style={[styles.barBackground, { backgroundColor: isDark ? '#4a4121' : '#F1F5F9' }]}>
                <View style={[styles.barFill, { height, backgroundColor: active ? colors.primary : (isDark ? colors.primary + '99' : colors.primary + '66') }]} />
            </View>
            <Text style={[styles.barLabel, { color: active ? colors.primary : colors.textSecondary, fontFamily: active ? Fonts.lexend.bold : Fonts.lexend.medium }]}>{label}</Text>
        </View>
    );
}

function CourseStatItem({ icon, name, percentage, colors, isDark, low }: any) {
    return (
        <View style={[styles.courseItem, { backgroundColor: isDark ? '#2e2918' : '#FFFFFF', borderColor: isDark ? '#4a4121' : 'transparent' }]}>
            <View style={[styles.courseIconContainer, { backgroundColor: low ? '#9E9E9E1A' : (colors.primary + '1A') }]}>
                {icon}
            </View>
            <View style={styles.courseInfo}>
                <View style={styles.courseHeader}>
                    <Text style={[styles.courseNameText, { color: colors.text }]} numberOfLines={1}>{name}</Text>
                    <Text style={[styles.coursePercentageText, { color: colors.text }]}>{percentage}%</Text>
                </View>
                <View style={[styles.progressBarBg, { backgroundColor: isDark ? '#4a4121' : '#F1F5F9' }]}>
                    <View style={[styles.progressBarFill, { width: `${percentage}%`, backgroundColor: low ? '#9E9E9E' : colors.primary }]} />
                </View>
            </View>
        </View>
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
    paddingBottom: 40,
  },
  filtersContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    marginVertical: 12,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    paddingLeft: 16,
    paddingRight: 10,
    borderRadius: 18,
    gap: 8,
  },
  filterText: {
    fontSize: 14,
    fontFamily: Fonts.lexend.medium,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  chartContainer: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartTextContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  chartValue: {
    fontSize: 48,
    fontFamily: Fonts.lexend.bold,
    letterSpacing: -2,
  },
  chartLabel: {
    fontSize: 12,
    fontFamily: Fonts.lexend.medium,
    marginTop: 4,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 8,
    marginTop: 24,
  },
  trendText: {
    fontSize: 13,
    fontFamily: Fonts.lexend.bold,
  },
  section: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: Fonts.lexend.bold,
    marginBottom: 16,
  },
  card: {
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 32,
  },
  cardLabel: {
    fontSize: 10,
    fontFamily: Fonts.lexend.bold,
    letterSpacing: 1.5,
  },
  cardValue: {
    fontSize: 24,
    fontFamily: Fonts.lexend.bold,
    marginTop: 4,
  },
  periodBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  periodText: {
    fontSize: 11,
    fontFamily: Fonts.lexend.bold,
  },
  barChart: {
    flexDirection: 'row',
    height: 160,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  barContainer: {
    alignItems: 'center',
    width: 48,
    height: '100%',
    justifyContent: 'flex-end',
  },
  barBackground: {
    width: '100%',
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    marginBottom: 12,
  },
  barFill: {
    width: '100%',
    borderRadius: 8,
  },
  barLabel: {
    fontSize: 12,
  },
  seeAllText: {
    fontSize: 14,
    fontFamily: Fonts.lexend.bold,
  },
  courseList: {
    gap: 12,
  },
  courseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  courseIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  courseInfo: {
    flex: 1,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  courseNameText: {
    fontSize: 15,
    fontFamily: Fonts.lexend.bold,
    flex: 1,
  },
  coursePercentageText: {
    fontSize: 15,
    fontFamily: Fonts.lexend.bold,
    marginLeft: 8,
  },
  progressBarBg: {
    height: 6,
    width: '100%',
    borderRadius: 3,
  },
  progressBarFill: {
    height: 6,
    borderRadius: 3,
  },
});
