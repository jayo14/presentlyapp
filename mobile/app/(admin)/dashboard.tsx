import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { Users, MapPin, Clock, AlertTriangle, Bell, DoorOpen, RefreshCcw, Building, Info, UserPlus } from 'lucide-react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';
import * as Animatable from 'react-native-animatable';
import { useAdminDashboardStats, useSystemActivity } from '@/hooks/useAdminDashboard';

export default function AdminDashboard() {
  const { colors, isDark } = useTheme();
  
  const {
    data: dashboardData,
    isLoading: isLoadingStats,
    refetch: refetchStats,
    isRefetching: isRefetchingStats
  } = useAdminDashboardStats();

  const {
    data: activityFeedData,
    isLoading: isLoadingActivity,
    refetch: refetchActivity,
    isRefetching: isRefetchingActivity
  } = useSystemActivity();

  const activityFeed = (activityFeedData as any[]) || [];

  const onRefresh = useCallback(async () => {
    await Promise.all([refetchStats(), refetchActivity()]);
  }, [refetchStats, refetchActivity]);

  const isLoading = isLoadingStats || isLoadingActivity;
  const refreshing = isRefetchingStats || isRefetchingActivity;

  if (isLoading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.profileContainer, { borderColor: colors.primary }]}>
              <View style={[styles.profileImage, { backgroundColor: colors.primary + '20', justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: colors.primary, fontWeight: 'bold' }}>AD</Text>
              </View>
              <View style={[styles.statusDot, { backgroundColor: '#10B981', borderColor: colors.background }]} />
            </View>
            <View>
              <Text style={[styles.welcomeText, { color: colors.primary }]}>SYSTEM OVERVIEW</Text>
              <Text style={[styles.userName, { color: colors.text }]}>Admin Panel</Text>
            </View>
          </View>
          <TouchableOpacity style={[styles.notificationButton, { backgroundColor: isDark ? '#1a1608' : '#f0f0f0', borderColor: colors.border }]}>
            <Bell size={20} color={colors.primary} />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>

        {/* KPI Grid */}
        <View style={styles.kpiGrid}>
          <View style={styles.kpiRow}>
            <StatCard
              icon={<Users size={20} color={colors.primary} />}
              label="Institutions"
              value={dashboardData?.total_institutions || '0'}
              trend={dashboardData?.institution_trend}
              trendColor="#10B981"
              colors={colors}
            />
            <StatCard
              icon={<Building size={20} color={colors.primary} />}
              label="Colleges"
              value={dashboardData?.total_colleges || '0'}
              colors={colors}
            />
          </View>
          <View style={styles.kpiRow}>
            <StatCard
              icon={<Clock size={20} color={colors.primary} />}
              label="Sessions"
              value={dashboardData?.active_sessions || '0'}
              colors={colors}
            />
            <StatCard
              icon={<AlertTriangle size={20} color={colors.primary} />}
              label="Attendance"
              value={dashboardData?.attendance_rate ? `${dashboardData.attendance_rate}%` : '0%'}
              colors={colors}
              isAlert={(dashboardData?.attendance_rate || 0) < 50}
            />
          </View>
        </View>

        {/* Chart Section */}
        <View style={[styles.chartCard, { backgroundColor: isDark ? '#1a1608' : '#fff', borderColor: colors.border }]}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={[styles.chartTitle, { color: colors.text }]}>Weekly System Activity</Text>
              <Text style={[styles.chartSubtitle, { color: colors.primary }]}>Activity Peak</Text>
            </View>
            <Text style={[styles.chartPeriod, { color: colors.textSecondary }]}>Last 7 Days</Text>
          </View>

          <View style={styles.chartContainer}>
            <Svg width="100%" height="150" viewBox="0 0 400 150">
              <Defs>
                <LinearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor={colors.primary} stopOpacity="0.3" />
                  <Stop offset="100%" stopColor={colors.primary} stopOpacity="0" />
                </LinearGradient>
              </Defs>
              <Path
                d="M0,120 Q50,110 80,40 T160,80 T240,20 T320,100 T400,30 V150 H0 Z"
                fill="url(#chartGradient)"
              />
              <Path
                d="M0,120 Q50,110 80,40 T160,80 T240,20 T320,100 T400,30"
                fill="none"
                stroke={colors.primary}
                strokeWidth="3"
                strokeLinecap="round"
              />
              <Circle cx="240" cy="20" r="4" fill={colors.primary} />
              <Circle cx="240" cy="20" r="10" fill={colors.primary} opacity="0.2" />
            </Svg>
          </View>

          <View style={styles.chartDays}>
            {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day, idx) => (
              <Text key={day} style={[styles.dayText, { color: day === 'FRI' ? colors.primary : colors.textSecondary }]}>
                {day}
              </Text>
            ))}
          </View>
        </View>

        {/* Live Activity Feed */}
        <View style={styles.feedSection}>
          <View style={styles.feedHeader}>
            <Text style={[styles.feedTitle, { color: colors.text }]}>Live Activity Feed</Text>
            <View style={styles.liveIndicator}>
              <Animatable.View
                animation="pulse"
                easing="ease-out"
                iterationCount="infinite"
                style={[styles.liveDot, { backgroundColor: colors.primary }]}
              />
              <Text style={[styles.liveText, { color: colors.primary }]}>LIVE</Text>
            </View>
          </View>

          <View style={styles.feedList}>
            {activityFeed.length > 0 ? activityFeed.map((item, index) => (
              <FeedItem
                key={index}
                icon={getActivityIcon(item.type, colors)}
                title={item.title}
                time={item.timestamp || item.time}
                subtitle={item.description}
                colors={colors}
                isDark={isDark}
              />
            )) : (
              <View style={styles.emptyFeed}>
                <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 20 }}>No recent activity</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ icon, label, value, trend, trendColor, colors, isAlert }: any) {
  return (
    <View style={[styles.kpiCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
      <View style={styles.kpiHeader}>
        <View style={[styles.kpiIconBox, { backgroundColor: colors.primary + '1A' }]}>
          {icon}
        </View>
        {trend && (
          <View style={[styles.trendBadge, { backgroundColor: trendColor + '1A' }]}>
            <Text style={[styles.trendText, { color: trendColor }]}>{trend}</Text>
          </View>
        )}
        {isAlert && (
          <Animatable.View
            animation="pulse"
            iterationCount="infinite"
            style={[styles.alertDot, { backgroundColor: colors.primary }]}
          />
        )}
      </View>
      <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.kpiValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

function getActivityIcon(type: string, colors: any) {
  switch (type) {
    case 'session': return <DoorOpen size={20} color={colors.primary} />;
    case 'sync': return <RefreshCcw size={20} color={colors.primary} />;
    case 'venue': return <Building size={20} color={colors.primary} />;
    case 'user': return <UserPlus size={20} color={colors.primary} />;
    case 'alert': return <AlertTriangle size={20} color={colors.primary} />;
    default: return <Info size={20} color={colors.primary} />;
  }
}

function FeedItem({ icon, title, time, subtitle, colors, isDark }: any) {
  return (
    <View style={[styles.feedItem, { backgroundColor: isDark ? 'rgba(26, 22, 8, 0.5)' : '#f9f9f9', borderColor: colors.border + '4D' }]}>
      <View style={[styles.feedIconBox, { backgroundColor: colors.primary + '1A' }]}>
        {icon}
      </View>
      <View style={styles.feedContent}>
        <View style={styles.feedTopLine}>
          <Text style={[styles.feedItemTitle, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.feedTime, { color: colors.textSecondary }]}>{time}</Text>
        </View>
        <Text style={[styles.feedSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 24, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  profileContainer: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, padding: 2, position: 'relative' },
  profileImage: { width: '100%', height: '100%', borderRadius: 22, overflow: 'hidden' },
  statusDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 2, position: 'absolute', bottom: 0, right: 0 },
  welcomeText: { fontSize: 10, fontWeight: '700', letterSpacing: 1.2 },
  userName: { fontSize: 20, fontWeight: '700' },
  notificationButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  notificationBadge: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444', position: 'absolute', top: 10, right: 10 },
  kpiGrid: { gap: 16, marginBottom: 24 },
  kpiRow: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  kpiCard: { flex: 1, padding: 20, borderRadius: 16, borderWidth: 1, gap: 4 },
  kpiHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  kpiIconBox: { padding: 8, borderRadius: 8 },
  trendBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  trendText: { fontSize: 10, fontWeight: '700' },
  alertDot: { width: 8, height: 8, borderRadius: 4 },
  kpiLabel: { fontSize: 14, fontWeight: '500' },
  kpiValue: { fontSize: 24, fontWeight: '700', letterSpacing: -0.5 },
  chartCard: { padding: 24, borderRadius: 16, borderWidth: 1, marginBottom: 24 },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 },
  chartTitle: { fontSize: 16, fontWeight: '600' },
  chartSubtitle: { fontSize: 24, fontWeight: '700', marginTop: 4 },
  chartPeriod: { fontSize: 12, fontWeight: '500' },
  chartContainer: { height: 150, width: '100%', marginBottom: 16 },
  chartDays: { flexDirection: 'row', justifyContent: 'space-between' },
  dayText: { fontSize: 11, fontWeight: '700' },
  feedSection: { gap: 16 },
  feedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  feedTitle: { fontSize: 18, fontWeight: '700' },
  liveIndicator: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  liveDot: { width: 6, height: 6, borderRadius: 3 },
  liveText: { fontSize: 12, fontWeight: '700' },
  feedList: { gap: 12 },
  feedItem: { flexDirection: 'row', padding: 16, borderRadius: 12, borderWidth: 1, gap: 16 },
  feedIconBox: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  feedContent: { flex: 1 },
  feedTopLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  feedItemTitle: { fontSize: 14, fontWeight: '600' },
  feedTime: { fontSize: 10, fontWeight: '500' },
  feedSubtitle: { fontSize: 12, marginTop: 2 },
  emptyFeed: { padding: 40, alignItems: 'center' }
});
