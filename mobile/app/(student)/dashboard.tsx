import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, RefreshControl, ActivityIndicator, ImageBackground, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/contexts/AuthContext';
import { useAttendance } from '@/contexts/AttendanceContext';
import { Bell, QrCode, Check, X, BookOpen, Calendar, LayoutGrid, Clock, ChevronRight } from 'lucide-react-native';
import Fonts from '@/constants/fonts';
import Svg, { Circle } from 'react-native-svg';
import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const haversineKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + 
            Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
  return R * 2 * Math.asin(Math.sqrt(a));
};

const { width } = Dimensions.get('window');

export default function StudentDashboard() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const { stats, history, courses, getActiveSession, refreshData, isLoading } = useAttendance();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const bottomDockOffset = tabBarHeight + insets.bottom;
  const [refreshing, setRefreshing] = useState(false);
  const [rangeStatus, setRangeStatus] = useState<'in_range' | 'out_of_range' | 'unknown'>('unknown');
  const locationWatchRef = useRef<Location.LocationSubscription | null>(null);

  const activeSession = getActiveSession();

  useEffect(() => {
    const loc = activeSession?.location;
    if (!loc?.latitude || !loc?.longitude) {
      setRangeStatus('unknown');
      return;
    }
    const { latitude: vLat, longitude: vLon, radius } = loc;
    const radiusKm = (radius || 100) / 1000;
    let cancelled = false;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (cancelled || status !== 'granted') { setRangeStatus('unknown'); return; }
      locationWatchRef.current = await Location.watchPositionAsync(
        { 
          accuracy: Location.Accuracy.BestForNavigation, // Force High Accuracy GPS
          timeInterval: 5000, 
          distanceInterval: 5 
        },
        (position: Location.LocationObject) => {
          // Filter bad readings (Step 2)
          if (position.coords.accuracy && position.coords.accuracy > 50) return;
          
          const distKm = haversineKm(position.coords.latitude, position.coords.longitude, vLat, vLon);
          setRangeStatus(distKm <= radiusKm ? 'in_range' : 'out_of_range');
        }
      );
    })();
    return () => {
      cancelled = true;
      locationWatchRef.current?.remove();
      locationWatchRef.current = null;
      setRangeStatus('unknown');
    };
  }, [activeSession?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const attendancePercentage = stats.percentage || 90.5;
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (attendancePercentage / 100) * circumference;

  const firstName = user?.fullName?.split(' ')[0] || 'Alex';

  if (isLoading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Top App Bar */}
      <View style={[styles.header, { borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : '#E2E8F0' }]}>
        <View style={styles.profileRow}>
          <TouchableOpacity onPress={() => router.push('/(student)/profile')}>
            <View style={[styles.avatarContainer, { borderColor: colors.primary }]}>
                <Image
                source={{ uri: user?.profilePicture || "https://lh3.googleusercontent.com/aida-public/AB6AXuBE4dD8vVEqUFrysLfYqUs37Q9UnCyp1flmhT4XU1RfblQHPB2k7PISiBUK34BccjNrbh4JnO7p8feqfsWWxlOc64p6EuxOED9NX4AlZIH_PxRGQffUjmggdtZymKbyfq4FvyX43F_LGcJwh6yzfBm_BbDN6ju4vYx-Isl_u6yjvH0YXMg-uBSOfVL_-neAPfMeibMIG61ocySxnu5mICUOBH1jRJaiXolsnd1oFEIj8JBnT-Ug_OmXN9Ot7oEHrMNjh5w02b0f5nOz" }}
                style={styles.avatar}
                />
                <View style={[styles.onlineDot, { borderColor: colors.background }]} />
            </View>
          </TouchableOpacity>
          <View>
            <Text style={[styles.welcomeSub, { color: isDark ? '#ccbf8e' : '#666666' }]}>Welcome back</Text>
            <Text style={[styles.userName, { color: colors.text }]}>Hello, {firstName}!</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.notificationBtn} onPress={() => router.push('/(student)/notifications')}>
          <Bell size={24} color={colors.text} />
          <View style={[styles.notificationBadge, { backgroundColor: '#EF4444' }]} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomDockOffset + 40 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Happening Now Section */}
        {activeSession ? (
        <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
                <Text style={[styles.sectionSubtitle, { color: isDark ? '#ccbf8e' : '#666666' }]}>HAPPENING NOW</Text>
                <View style={styles.liveIndicator}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveText}>LIVE</Text>
                </View>
            </View>

            <ImageBackground
                source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuDILcFaUXXBA-EUWob4d9BFAkSoi-yq7JdpsBIraacoESDTr2V2NhyhXvt6l3MRatxY3XF4GkXBIEAZFiuwxeKAgigms5rjL_PbBUDbkOxVJa9cpmfY4ymq-fYuQTf4lfcr1LjXSSiUacKKfKw7BZMIWrt5DZGAM7H4UmCBggwuPR2Sau8tuinZY9lXxCaiVS2uGnfbJGoJs4l6Qpam5Zbwo5a_feAeJa9iUw_EOc5_wz4DqtD739yFW9v4G_eUon2rEu4zOfQrBhL2" }}
                style={[styles.liveCard, { backgroundColor: isDark ? '#352e18' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#E2E8F0' }]}
                imageStyle={styles.cardBgImage}
            >
                {rangeStatus !== 'unknown' && (
                  <View style={[styles.rangeBadge, { backgroundColor: rangeStatus === 'in_range' ? '#10B981' : '#F59E0B' }]}>
                    <Text style={styles.rangeBadgeText}>{rangeStatus === 'in_range' ? '✓ In Range' : '⚠ Out of Range'}</Text>
                  </View>
                )}
                <View style={styles.liveCardContent}>
                    <View style={styles.liveCardTop}>
                        <View style={styles.liveCardInfo}>
                            <View style={[styles.locationBadge, { backgroundColor: colors.primary + '33' }]}>
                                <Text style={[styles.locationText, { color: isDark ? '#fbbf24' : '#B45309' }]}>{activeSession.venueName || 'Main Hall'}</Text>
                            </View>
                            <Text style={[styles.courseName, { color: colors.text }]}>{activeSession.courseCode} - {activeSession.courseName}</Text>
                            <Text style={[styles.instructorName, { color: isDark ? '#ccbf8e' : '#666666' }]}>
                                {activeSession.lecturerName} • {new Date(activeSession.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(activeSession.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                        </View>
                        <View style={[styles.remBox, { backgroundColor: isDark ? 'rgba(74,65,33,0.3)' : 'rgba(0,0,0,0.05)' }]}>
                            <Text style={[styles.remLabel, { color: colors.text, opacity: 0.7 }]}>REM</Text>
                            <Text style={[styles.remValue, { color: colors.text }]}>{Math.max(0, Math.round((new Date(activeSession.endTime).getTime() - new Date().getTime()) / 60000))}m</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                      style={[styles.markAttendanceBtn, { backgroundColor: colors.primary }]}
                      activeOpacity={0.9}
                      onPress={() => router.push({ pathname: '/(student)/mark-attendance', params: { tab: 'code' } })}
                    >
                        <QrCode size={20} color="#231e0f" />
                        <Text style={styles.markAttendanceText}>Mark Attendance</Text>
                    </TouchableOpacity>
                </View>
            </ImageBackground>
        </View>
        ) : null}
        {/* Quick Actions */}
        <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
                {[
                    { id: 'timetable', icon: <Calendar color="#f9c406" size={24} />, label: 'Timetable', route: '/(student)/timetable' },
                    { id: 'blog', icon: <BookOpen color="#8B5CF6" size={24} />, label: 'University Blog', route: '/blog' },
                ].map((action) => (
                    <TouchableOpacity 
                        key={action.id}
                        style={[styles.actionBtn, { backgroundColor: isDark ? '#352e18' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#E2E8F0' }]}
                        onPress={() => router.push(action.route as any)}
                    >
                        <View style={[styles.actionIconBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }]}>
                            {action.icon}
                        </View>
                        <Text style={[styles.actionLabel, { color: colors.text }]}>{action.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>

        {/* Attendance Summary */}
        <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Attendance Summary</Text>
            <View style={[styles.summaryCard, { backgroundColor: isDark ? '#352e18' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#E2E8F0' }]}>
                <View style={styles.summaryRow}>
                    {/* Circular Progress */}
                    <View style={styles.progressContainer}>
                        <Svg width="100" height="100" viewBox="0 0 100 100">
                            <Circle
                                cx="50"
                                cy="50"
                                r="40"
                                stroke={isDark ? '#4a4121' : '#F1F5F9'}
                                strokeWidth="8"
                                fill="none"
                            />
                            <Circle
                                cx="50"
                                cy="50"
                                r="40"
                                stroke={colors.primary}
                                strokeWidth="8"
                                fill="none"
                                strokeDasharray={`${circumference} ${circumference}`}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                transform="rotate(-90 50 50)"
                            />
                        </Svg>
                        <View style={styles.progressTextContainer}>
                            <Text style={[styles.progressValue, { color: colors.text }]}>{attendancePercentage}%</Text>
                            <Text style={[styles.progressLabel, { color: isDark ? '#ccbf8e' : '#666666' }]}>OVERALL</Text>
                        </View>
                    </View>

                    {/* Stats Grid */}
                    <View style={styles.statsContainer}>
                        <TouchableOpacity
                            style={[styles.statBox, { backgroundColor: isDark ? '#231e0f' : '#F9FAFB', borderColor: isDark ? '#4a4121' : '#E2E8F0' }]}
                            onPress={() => router.push('/(student)/courses')}
                        >
                            <Text style={[styles.statValue, { color: colors.text }]}>{courses.length}</Text>
                            <Text style={[styles.statLabel, { color: isDark ? '#ccbf8e' : '#666666' }]}>Classes</Text>
                        </TouchableOpacity>
                        <View style={[styles.statBox, { backgroundColor: isDark ? 'rgba(16,185,129,0.1)' : '#F0FDF4', borderColor: isDark ? 'rgba(16,185,129,0.2)' : '#DCFCE7' }]}>
                            <Text style={[styles.statValue, { color: '#10B981' }]}>{stats.attended}</Text>
                            <Text style={[styles.statLabel, { color: isDark ? 'rgba(16,185,129,0.7)' : '#166534' }]}>Attended</Text>
                        </View>
                        <View style={[styles.statBox, { backgroundColor: isDark ? 'rgba(239,68,68,0.1)' : '#FEF2F2', borderColor: isDark ? 'rgba(239,68,68,0.2)' : '#FEE2E2' }]}>
                            <Text style={[styles.statValue, { color: '#EF4444' }]}>{stats.totalSessions - stats.attended}</Text>
                            <Text style={[styles.statLabel, { color: isDark ? 'rgba(239,68,68,0.7)' : '#991B1B' }]}>Missed</Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>

        {/* Recent Activity */}
        <View style={[styles.section, { marginBottom: 20 }]}>
            <View style={styles.sectionHeaderRow}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Activity</Text>
                <TouchableOpacity onPress={() => router.push('/(student)/analytics')}>
                    <Text style={[styles.viewAll, { color: colors.primary }]}>View All</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.activityList}>
                {history.slice(0, 3).map((record: any) => (
                    <View key={record.id} style={[styles.activityItem, { backgroundColor: isDark ? '#352e18' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#E2E8F0' }]}>
                        <View style={styles.activityLeft}>
                            <View style={[styles.activityIcon, { backgroundColor: record.status === 'PRESENT' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)' }]}>
                                {record.status === 'PRESENT' ? <Check size={20} color="#10B981" /> : <X size={20} color="#EF4444" />}
                            </View>
                            <View>
                                <Text style={[styles.activityCourse, { color: colors.text }]}>{record.courseCode} - {record.courseName?.split(' ').pop()}</Text>
                                <Text style={[styles.activityTime, { color: isDark ? '#ccbf8e' : '#666666' }]}>
                                    {new Date(record.timestamp).toLocaleDateString() === new Date().toLocaleDateString() ? 'Today' : 'Yesterday'}, {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                            </View>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: record.status === 'PRESENT' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)' }]}>
                            <Text style={[styles.statusText, { color: record.status === 'PRESENT' ? '#10B981' : '#EF4444' }]}>{record.status === 'PRESENT' ? 'Present' : 'Missed'}</Text>
                        </View>
                    </View>
                ))}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
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
    position: 'relative',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
  },
  welcomeSub: {
    fontSize: 12,
    fontFamily: Fonts.lexend.medium,
  },
  userName: {
    fontSize: 18,
    fontFamily: Fonts.lexend.bold,
  },
  notificationBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontFamily: Fonts.lexend.bold,
    letterSpacing: 1,
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
    backgroundColor: '#EF4444',
  },
  liveText: {
    fontSize: 12,
    fontFamily: Fonts.lexend.bold,
    color: '#EF4444',
  },
  liveCard: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  cardBgImage: {
    opacity: 0.15,
  },
  liveCardContent: {
    padding: 20,
  },
  liveCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  liveCardInfo: {
    flex: 1,
  },
  locationBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 11,
    fontFamily: Fonts.lexend.bold,
  },
  courseName: {
    fontSize: 22,
    fontFamily: Fonts.lexend.bold,
    marginBottom: 4,
  },
  instructorName: {
    fontSize: 13,
    fontFamily: Fonts.lexend.regular,
  },
  remBox: {
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 56,
  },
  remLabel: {
    fontSize: 10,
    fontFamily: Fonts.lexend.bold,
  },
  remValue: {
    fontSize: 18,
    fontFamily: Fonts.lexend.bold,
  },
  markAttendanceBtn: {
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#f9c406',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  markAttendanceText: {
    fontSize: 16,
    fontFamily: Fonts.lexend.bold,
    color: '#231e0f',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: Fonts.lexend.bold,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  summaryCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  progressContainer: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressTextContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  progressValue: {
    fontSize: 20,
    fontFamily: Fonts.lexend.bold,
  },
  progressLabel: {
    fontSize: 8,
    fontFamily: Fonts.lexend.bold,
    letterSpacing: 0.5,
  },
  statsContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  statBox: {
    flex: 1,
    padding: 10,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  statValue: {
    fontSize: 18,
    fontFamily: Fonts.lexend.bold,
  },
  statLabel: {
    fontSize: 9,
    fontFamily: Fonts.lexend.medium,
    marginTop: 2,
  },
  viewAll: {
    fontSize: 14,
    fontFamily: Fonts.lexend.medium,
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityCourse: {
    fontSize: 14,
    fontFamily: Fonts.lexend.bold,
  },
  activityTime: {
    fontSize: 12,
    fontFamily: Fonts.lexend.regular,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontFamily: Fonts.lexend.bold,
  },
  rangeBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 10,
  },
  rangeBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: Fonts.lexend.bold,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionBtn: {
    width: (width - 44) / 2, // 2 columns minus gap and padding
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    gap: 10,
  },
  actionIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 13,
    fontFamily: Fonts.lexend.bold,
  },
});
