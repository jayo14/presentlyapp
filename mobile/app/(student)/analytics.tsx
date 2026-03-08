import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useAttendance } from '@/contexts/AttendanceContext';
import { ChevronLeft, TrendingUp, BookOpen, TrendingDown } from 'lucide-react-native';
import Fonts from '@/constants/fonts';
import Svg, { Circle } from 'react-native-svg';
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/services/api';

export default function StudentAnalyticsScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { stats, courses, refreshData } = useAttendance();
  const [weeklyTrends, setWeeklyTrends] = useState<any[]>([]);
  const [trendInfo, setTrendInfo] = useState<{ label: string; positive: boolean } | null>(null);
  const [fetching, setFetching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const percentage = stats.percentage || 0;
  const circumference = 2 * Math.PI * 80;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const loadAnalytics = useCallback(async () => {
    try {
      setFetching(true);
      const response: any = await api.analytics.getStudentDashboard();

      if (response?.weekly_trends && Array.isArray(response.weekly_trends)) {
        const trends = response.weekly_trends.slice(-4);
        setWeeklyTrends(trends);
      } else if (response?.attendance_stats?.weekly_breakdown) {
        setWeeklyTrends(response.attendance_stats.weekly_breakdown.slice(-4));
      }

      if (response?.attendance_stats) {
        const stats = response.attendance_stats;
        const change = stats.trend_vs_last_month ?? stats.change_percentage;
        if (change !== undefined) {
          setTrendInfo({
            label: `${Math.abs(change) >= 0 ? '+' : ''}${Number(change).toFixed(1)}% vs last month`,
            positive: Number(change) >= 0,
          });
        }
      }
    } catch (e) {
      console.error('Analytics load error', e);
    } finally {
      setFetching(false);
    }
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshData(), loadAnalytics()]);
    setRefreshing(false);
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  // Build course breakdown from the AttendanceContext courses (already loaded from backend)
  const courseBreakdown = courses.map(c => ({
    id: c.id,
    name: c.name,
    percentage: c.percentage,
    low: c.percentage < 75,
  }));

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

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
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
              <Text style={[styles.chartValue, { color: colors.text }]}>{percentage.toFixed(1)}%</Text>
              <Text style={[styles.chartLabel, { color: colors.textSecondary }]}>Overall Attendance</Text>
            </View>
          </View>

          {trendInfo && (
            <View style={[styles.trendBadge, { backgroundColor: trendInfo.positive ? '#66BB6A1A' : 'rgba(239,68,68,0.1)' }]}>
              {trendInfo.positive ? (
                <TrendingUp size={16} color="#10B981" />
              ) : (
                <TrendingDown size={16} color="#EF4444" />
              )}
              <Text style={[styles.trendText, { color: trendInfo.positive ? '#10B981' : '#EF4444' }]}>
                {trendInfo.label}
              </Text>
            </View>
          )}

          {/* Summary Stats */}
          <View style={styles.summaryRow}>
            <View style={[styles.summaryBox, { backgroundColor: isDark ? '#2e2918' : '#FFFFFF', borderColor: isDark ? '#4a4121' : '#E2E8F0' }]}>
              <View style={[styles.summaryIcon, { backgroundColor: '#10B9811A' }]}>
                <TrendingUp size={20} color="#10B981" />
              </View>
              <View>
                <Text style={[styles.summaryVal, { color: colors.text }]}>{stats.attended}</Text>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Attended</Text>
              </View>
            </View>
            <View style={[styles.summaryBox, { backgroundColor: isDark ? '#2e2918' : '#FFFFFF', borderColor: isDark ? '#4a4121' : '#E2E8F0' }]}>
              <View style={[styles.summaryIcon, { backgroundColor: '#EF44441A' }]}>
                <TrendingDown size={20} color="#EF4444" />
              </View>
              <View>
                <Text style={[styles.summaryVal, { color: colors.text }]}>{Math.max(0, stats.totalSessions - stats.attended)}</Text>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Missed</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Weekly Trends Bar Chart */}
        {weeklyTrends.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Weekly Trends</Text>
            <View style={[styles.card, { backgroundColor: isDark ? '#2e2918' : '#FFFFFF' }]}>
              <View style={styles.cardHeader}>
                  <View>
                      <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>LAST 4 WEEKS</Text>
                      <Text style={[styles.cardValue, { color: colors.text }]}>Attendance Rate</Text>
                  </View>
                  <View style={[styles.periodBadge, { backgroundColor: colors.primary + '33' }]}>
                      <Text style={[styles.periodText, { color: colors.primary }]}>Weekly</Text>
                  </View>
              </View>

              <View style={styles.barChart}>
                  {weeklyTrends.map((week, idx) => {
                    const pct = typeof week === 'number' ? week : (week?.percentage ?? week?.rate ?? 0);
                    const heightPct = `${Math.max(5, pct)}%`;
                    return (
                      <BarItem
                        key={idx}
                        label={week?.label || `W${idx + 1}`}
                        height={heightPct}
                        active={idx === weeklyTrends.length - 1}
                        colors={colors}
                        isDark={isDark}
                        value={`${Math.round(pct)}%`}
                      />
                    );
                  })}
              </View>
            </View>
          </View>
        )}

        {/* Course Breakdown */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Course Breakdown</Text>
          </View>

          <View style={styles.courseList}>
            {fetching && courseBreakdown.length === 0 ? (
                <ActivityIndicator color={colors.primary} />
            ) : courseBreakdown.length === 0 ? (
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No courses enrolled yet.
                </Text>
            ) : (
                courseBreakdown.map((item) => (
                    <CourseStatItem
                        key={item.id}
                        icon={<BookOpen size={20} color={item.low ? '#9E9E9E' : colors.primary} />}
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

function BarItem({ label, height, active, colors, isDark, value }: any) {
    return (
        <View style={styles.barContainer}>
            <Text style={[styles.barValueText, { color: active ? colors.primary : colors.textSecondary }]}>{value}</Text>
            <View style={[styles.barBackground, { backgroundColor: isDark ? '#4a4121' : '#F1F5F9' }]}>
                <View style={[styles.barFill, { height, backgroundColor: active ? colors.primary : (isDark ? '#ccbf8e66' : '#94A3B866') }]} />
            </View>
            <Text style={[styles.barLabel, { color: active ? colors.text : colors.textSecondary, fontFamily: active ? Fonts.lexend.bold : Fonts.lexend.regular }]}>{label}</Text>
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
  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 16,
    width: '100%',
    marginTop: 32,
  },
  summaryBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    gap: 12,
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryVal: {
    fontSize: 18,
    fontFamily: Fonts.lexend.bold,
  },
  summaryLabel: {
    fontSize: 11,
    fontFamily: Fonts.lexend.medium,
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
    fontSize: 20,
    fontFamily: Fonts.lexend.bold,
  },
  card: {
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  cardLabel: {
    fontSize: 10,
    fontFamily: Fonts.lexend.bold,
    letterSpacing: 1.5,
  },
  cardValue: {
    fontSize: 22,
    fontFamily: Fonts.lexend.bold,
    marginTop: 4,
  },
  periodBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  periodText: {
    fontSize: 10,
    fontFamily: Fonts.lexend.bold,
  },
  barChart: {
    flexDirection: 'row',
    height: 180,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  barContainer: {
    alignItems: 'center',
    width: 50,
  },
  barValueText: {
    fontSize: 10,
    fontFamily: Fonts.lexend.bold,
    marginBottom: 8,
  },
  barBackground: {
    width: 14,
    height: 120,
    borderRadius: 7,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  barFill: {
    width: '100%',
    borderRadius: 7,
  },
  barLabel: {
    fontSize: 11,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
  },
  courseList: {
    gap: 12,
  },
  courseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    gap: 16,
  },
  courseIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
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
