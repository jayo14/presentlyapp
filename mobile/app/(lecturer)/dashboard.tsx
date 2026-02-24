import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, RefreshControl, ActivityIndicator, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, Clock, MapPin, BookOpen, Calendar, TrendingUp, CheckCircle, AlertCircle, Mail, ChevronRight } from 'lucide-react-native';
import Fonts from '@/constants/fonts';
import { useState, useCallback } from 'react';
import { useLecturerDashboard, useUpcomingSessions } from '@/hooks/useLecturerDashboard';

export default function LecturerDashboard() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { user } = useAuth();

  const {
    data: dashboardData,
    isLoading: statsLoading,
    refetch: refetchStats,
    isRefetching: isRefetchingStats
  } = useLecturerDashboard();

  const {
    data: upcomingSessionsData,
    isLoading: upcomingLoading,
    refetch: refetchUpcoming
  } = useUpcomingSessions();

  const onRefresh = useCallback(async () => {
    await Promise.all([refetchStats(), refetchUpcoming()]);
  }, [refetchStats, refetchUpcoming]);

  const nextSession = upcomingSessionsData?.[0] || upcomingSessionsData?.results?.[0];
  const refreshing = isRefetchingStats;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.profileRow}>
            <TouchableOpacity
                style={[styles.avatarContainer, { borderColor: colors.primary + '4D' }]}
                onPress={() => router.push('/(lecturer)/profile')}
            >
                <Image
                    source={{ uri: user?.profilePicture || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" }}
                    style={styles.avatar}
                />
            </TouchableOpacity>
            <View>
                <Text style={[styles.welcomeSub, { color: isDark ? '#ccbf8e' : '#666666' }]}>GOOD MORNING,</Text>
                <Text style={[styles.userName, { color: colors.text }]}>Prof. {user?.fullName?.split(' ')[0] || 'Lecturer'}</Text>
            </View>
        </View>
        <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: isDark ? '#2d281a' : '#F9FAFB' }]}
            onPress={() => router.push('/(lecturer)/notifications')}
        >
          <Bell size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Next Class Card Section */}
        <View style={styles.section}>
            {nextSession ? (
                <View style={[styles.nextClassCard, { backgroundColor: isDark ? '#352e18' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#E2E8F0' }]}>
                    <Image
                        source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuBlxoJsKgpZimzuMN9_wIy2nQKrP6xfFobHPPC15rReLLYJ7PMTH4lJGYUO7gawKCDatFSRKvtW3W5Q_pYm2C1qvmULm56p9l0uPqnFWg0RbId2dgvNPpL2N93K5OuqLrvC1m-mZ08yHo9ElAVoWDhR0_NEg28ZQZ1WI4xj2Q2tqy3yIy-dzGAUIN7RPK0MxOEKZ3aAT-dQ8cSviIs7HhgdE1QOlj-IPnLnzsjZ4S7JpE5qis-MOWdsTrM2UcvFzShcXtqjTlLZT_Nh" }}
                        style={styles.nextClassImage}
                    />
                    <View style={styles.nextClassContent}>
                        <View style={styles.nextClassHeader}>
                            <View style={styles.liveIndicator}>
                                <View style={styles.liveDot} />
                                <Text style={styles.liveText}>NEXT CLASS</Text>
                            </View>
                        </View>
                        <Text style={[styles.nextClassName, { color: colors.text }]}>{nextSession.course_code} - {nextSession.course_name}</Text>

                        <View style={styles.nextClassFooter}>
                            <View style={styles.nextClassDetails}>
                                <View style={styles.detailRow}>
                                    <Clock size={14} color={isDark ? '#ccbf8e' : '#666666'} />
                                    <Text style={[styles.detailText, { color: isDark ? '#ccbf8e' : '#666666' }]}>
                                        {new Date(nextSession.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(nextSession.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <MapPin size={14} color={isDark ? '#ccbf8e' : '#666666'} />
                                    <Text style={[styles.detailText, { color: isDark ? '#ccbf8e' : '#666666' }]}>{nextSession.venue_name || 'Hall A'}</Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                style={[styles.startSessionBtn, { backgroundColor: colors.primary }]}
                                onPress={() => router.push({ pathname: '/(lecturer)/sessions', params: { sessionId: nextSession.id }})}
                            >
                                <Text style={styles.startSessionText}>Start Session</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            ) : !statsLoading && (
                <View style={[styles.noSessionCard, { backgroundColor: isDark ? '#352e18' : '#F9FAFB', borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#E2E8F0' }]}>
                    <Calendar size={32} color={colors.primary} />
                    <Text style={[styles.noSessionText, { color: colors.text }]}>No upcoming classes scheduled</Text>
                    <TouchableOpacity
                        style={[styles.createBtn, { backgroundColor: colors.primary }]}
                        onPress={() => router.push('/(lecturer)/sessions')}
                    >
                        <Text style={styles.startSessionText}>Create Session</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>

        {/* Quick Stats Section */}
        <View style={styles.statsSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Stats</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsScroll}>
                <StatCard
                    icon={<BookOpen size={18} color={colors.primary} />}
                    label="Courses"
                    value={dashboardData?.total_courses?.toString() || "0"}
                    colors={colors}
                    isDark={isDark}
                />
                <StatCard
                    icon={<Calendar size={18} color={colors.primary} />}
                    label="Today"
                    value={dashboardData?.active_sessions_count?.toString() || "0"}
                    colors={colors}
                    isDark={isDark}
                />
                <StatCard
                    icon={<TrendingUp size={18} color={colors.primary} />}
                    label="Attendance"
                    value={`${dashboardData?.avg_attendance_percentage || 0}%`}
                    colors={colors}
                    isDark={isDark}
                />
            </ScrollView>
        </View>

        {/* Recent Activity Section */}
        <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Activity</Text>
            <View style={styles.activityList}>
                {dashboardData?.weekly_overview?.slice(0, 3).map((item, idx) => (
                    <ActivityItem
                        key={idx}
                        icon={<CheckCircle size={20} color="#10B981" />}
                        title="Attendance Recorded"
                        subtitle={`${item.name} Session • ${item.attendees} Students`}
                        badge={`${item.attendees} mark`}
                        colors={colors}
                        isDark={isDark}
                    />
                )) || (
                    <Text style={{ textAlign: 'center', color: colors.textSecondary, marginTop: 10 }}>No recent activity</Text>
                )}
            </View>
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ icon, label, value, colors, isDark }: any) {
    return (
        <View style={[styles.statCard, { backgroundColor: isDark ? '#4a4121' : '#FFFFFF', borderColor: isDark ? 'transparent' : '#E2E8F0' }]}>
            <View style={[styles.statIconBox, { backgroundColor: colors.primary + '33' }]}>
                {icon}
            </View>
            <Text style={[styles.statLabel, { color: isDark ? '#ccbf8e' : '#666666' }]}>{label}</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
        </View>
    );
}

function ActivityItem({ icon, title, subtitle, badge, action, chevron, colors, isDark }: any) {
    return (
        <View style={[styles.activityItem, { backgroundColor: isDark ? 'rgba(53,46,24,0.5)' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#E2E8F0' }]}>
            <View style={[styles.activityIconWrap, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F9FAFB' }]}>
                {icon}
            </View>
            <View style={styles.activityContent}>
                <Text style={[styles.activityTitle, { color: colors.text }]}>{title}</Text>
                <Text style={[styles.activitySubtitle, { color: isDark ? '#ccbf8e' : '#666666' }]}>{subtitle}</Text>
            </View>
            {badge && (
                <Text style={[styles.activityBadge, { color: isDark ? '#ccbf8e' : '#94A3B8' }]}>{badge.toUpperCase()}</Text>
            )}
            {action && (
                <TouchableOpacity>
                    <Text style={[styles.activityAction, { color: colors.primary }]}>{action}</Text>
                </TouchableOpacity>
            )}
            {chevron && (
                <ChevronRight size={18} color={isDark ? '#ccbf8e' : '#94A3B8'} />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
  },
  welcomeSub: {
    fontSize: 10,
    fontFamily: Fonts.lexend.bold,
    letterSpacing: 1,
  },
  userName: {
    fontSize: 18,
    fontFamily: Fonts.lexend.bold,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  nextClassCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  nextClassImage: {
    width: '100%',
    height: 160,
  },
  nextClassContent: {
    padding: 16,
  },
  nextClassHeader: {
    marginBottom: 8,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f9c406',
  },
  liveText: {
    fontSize: 12,
    fontFamily: Fonts.lexend.bold,
    color: '#f9c406',
    letterSpacing: 1,
  },
  nextClassName: {
    fontSize: 20,
    fontFamily: Fonts.lexend.bold,
    marginBottom: 12,
  },
  nextClassFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  nextClassDetails: {
    gap: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    fontFamily: Fonts.lexend.regular,
  },
  startSessionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  startSessionText: {
    fontSize: 14,
    fontFamily: Fonts.lexend.bold,
    color: '#231e0f',
  },
  noSessionCard: {
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    gap: 12
  },
  noSessionText: {
    fontSize: 14,
    fontFamily: Fonts.lexend.medium,
    textAlign: 'center',
    opacity: 0.7
  },
  createBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 8
  },
  statsSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: Fonts.lexend.bold,
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  statsScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  statCard: {
    width: 140,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
  },
  statIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: Fonts.lexend.medium,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontFamily: Fonts.lexend.bold,
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  activityIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontFamily: Fonts.lexend.bold,
  },
  activitySubtitle: {
    fontSize: 12,
    fontFamily: Fonts.lexend.regular,
  },
  activityBadge: {
    fontSize: 10,
    fontFamily: Fonts.lexend.bold,
  },
  activityAction: {
    fontSize: 12,
    fontFamily: Fonts.lexend.bold,
  }
});
