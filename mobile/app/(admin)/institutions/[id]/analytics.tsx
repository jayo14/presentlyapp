import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { api } from '@/services/api';
import { Bell, School, TrendingUp } from 'lucide-react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';
import { useEffect, useState } from 'react';

export default function InstitutionalAnalyticsScreen() {
  const { id } = useLocalSearchParams();
  const { colors, isDark } = useTheme();
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    loadAnalytics();
  }, [id]);

  const loadAnalytics = async () => {
    try {
      const response = await api.analytics.getOverview();
      setAnalytics(response);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.primary + '1A', borderBottomWidth: 1 }]}>
        <View style={styles.headerLeft}>
          <TrendingUp size={24} color={colors.primary} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>Institutional Analytics</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIconButton}>
            <Bell size={20} color={colors.text} />
          </TouchableOpacity>
          <View style={[styles.avatarBadge, { backgroundColor: colors.primary + '33', borderColor: colors.primary + '4D' }]}>
            <Text style={[styles.avatarText, { color: colors.primary }]}>AD</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Attendance Card */}
        <View style={[styles.heroCard, { backgroundColor: isDark ? '#1e1e1e' : '#fff', borderColor: colors.primary + '1A' }]}>
          <View style={styles.heroOverlay}>
            <School size={100} color={colors.primary} style={styles.heroIconBackground} />
          </View>
          <View style={styles.heroContent}>
            <Text style={[styles.heroLabel, { color: colors.textSecondary }]}>Attendance Performance</Text>
            <View style={styles.heroValueRow}>
              <Text style={[styles.heroValue, { color: colors.primary }]}>{analytics?.attendance_rate || '84.2'}%</Text>
              <View style={[styles.trendBadge, { backgroundColor: '#10B9811A' }]}>
                <TrendingUp size={14} color="#10B981" />
                <Text style={styles.trendText}>{analytics?.attendance_trend || '2.1%'}</Text>
              </View>
            </View>
            <Text style={[styles.heroSubtext, { color: colors.textSecondary }]}>Average attendance across all faculties this semester.</Text>
            <View style={[styles.progressBg, { backgroundColor: isDark ? '#2a2a2a' : '#f0f0f0' }]}>
              <View style={[styles.progressFill, { width: `${analytics?.attendance_rate || 84.2}%`, backgroundColor: colors.primary }]} />
            </View>
          </View>
        </View>

        {/* Active Sessions Trend Chart */}
        <View style={[styles.card, { backgroundColor: isDark ? '#1e1e1e' : '#fff', borderColor: colors.primary + '1A' }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Active Sessions</Text>
            <View style={[styles.tabSelector, { backgroundColor: isDark ? '#2a2a2a' : '#f0f0f0' }]}>
              <View style={[styles.tabActive, { backgroundColor: colors.primary }]}>
                <Text style={styles.tabActiveText}>7D</Text>
              </View>
              <Text style={[styles.tabInactiveText, { color: colors.textSecondary }]}>30D</Text>
            </View>
          </View>

          <View style={styles.chartContainer}>
            <Svg width="100%" height="160" viewBox="0 0 400 120">
              <Defs>
                <LinearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor={colors.primary} stopOpacity="0.4" />
                  <Stop offset="100%" stopColor={colors.primary} stopOpacity="0" />
                </LinearGradient>
              </Defs>
              <Path
                d="M0,100 Q40,95 80,70 T160,80 T240,40 T320,60 T400,30 V120 H0 Z"
                fill="url(#lineGrad)"
              />
              <Path
                d="M0,100 Q40,95 80,70 T160,80 T240,40 T320,60 T400,30"
                fill="none"
                stroke={colors.primary}
                strokeWidth="3"
                strokeLinecap="round"
              />
              <Circle cx="240" cy="40" r="4" fill={colors.primary} stroke={isDark ? '#1e1e1e' : '#fff'} strokeWidth="2" />
            </Svg>
          </View>
          <View style={styles.chartDays}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <Text key={day} style={[styles.dayText, { color: colors.textSecondary }]}>{day.toUpperCase()}</Text>
            ))}
          </View>

          <View style={[styles.cardFooter, { borderTopColor: 'rgba(255,255,255,0.05)' }]}>
            <View>
              <Text style={[styles.footerLabel, { color: colors.textSecondary }]}>Peak Load</Text>
              <Text style={[styles.footerValue, { color: colors.text }]}>1,240 Users</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.footerLabel, { color: colors.textSecondary }]}>Avg Time</Text>
              <Text style={[styles.footerValue, { color: colors.text }]}>42m</Text>
            </View>
          </View>
        </View>

        {/* Venue Utilization */}
        <View style={[styles.card, { backgroundColor: isDark ? '#1e1e1e' : '#fff', borderColor: colors.primary + '1A' }]}>
          <Text style={[styles.cardTitle, { color: colors.text, marginBottom: 20 }]}>Venue Utilization</Text>
          <View style={styles.utilizationList}>
            <UtilizationRow label="Engineering Hall" value={92} color={colors.primary} colors={colors} isDark={isDark} />
            <UtilizationRow label="Main Library" value={78} color={colors.primary} colors={colors} isDark={isDark} />
            <UtilizationRow label="Science Block B" value={64} color={colors.primary} colors={colors} isDark={isDark} />
            <UtilizationRow label="Arts Center" value={45} color={colors.primary} colors={colors} isDark={isDark} />
          </View>
        </View>

        {/* User Breakdown */}
        <View style={[styles.card, { backgroundColor: isDark ? '#1e1e1e' : '#fff', borderColor: colors.primary + '1A' }]}>
          <Text style={[styles.cardTitle, { color: colors.text, marginBottom: 20 }]}>User Breakdown by Faculty</Text>
          <View style={styles.pieSection}>
            <View style={styles.pieWrapper}>
              <Svg width="120" height="120" viewBox="0 0 36 36">
                <Circle cx="18" cy="18" r="15.9" fill="transparent" stroke={isDark ? "#2a2a2a" : "#f0f0f0"} strokeWidth="4" />
                <Circle cx="18" cy="18" r="15.9" fill="transparent" stroke={colors.primary} strokeWidth="4" strokeDasharray="40 100" strokeDashoffset="25" />
                <Circle cx="18" cy="18" r="15.9" fill="transparent" stroke={colors.primary} strokeWidth="4" strokeDasharray="25 100" strokeDashoffset="65" opacity={0.6} />
                <Circle cx="18" cy="18" r="15.9" fill="transparent" stroke={colors.primary} strokeWidth="4" strokeDasharray="20 100" strokeDashoffset="85" opacity={0.3} />
                <Circle cx="18" cy="18" r="15.9" fill="transparent" stroke={colors.primary} strokeWidth="4" strokeDasharray="15 100" strokeDashoffset="100" opacity={0.1} />
              </Svg>
              <View style={styles.pieCenter}>
                <Text style={[styles.pieTotal, { color: colors.text }]}>12.4k</Text>
                <Text style={[styles.pieTotalLabel, { color: colors.textSecondary }]}>TOTAL</Text>
              </View>
            </View>
            <View style={styles.pieLegend}>
              <LegendItem color={colors.primary} label="Science" value="40%" colors={colors} />
              <LegendItem color={colors.primary + '99'} label="Engineering" value="25%" colors={colors} />
              <LegendItem color={colors.primary + '4D'} label="Business" value="20%" colors={colors} />
              <LegendItem color={colors.primary + '1A'} label="Arts" value="15%" colors={colors} />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function UtilizationRow({ label, value, color, colors, isDark }: any) {
  return (
    <View style={styles.utilRow}>
      <View style={styles.utilHeader}>
        <Text style={[styles.utilLabel, { color: isDark ? '#d1d1d1' : '#444' }]}>{label}</Text>
        <Text style={[styles.utilValue, { color: colors.primary }]}>{value}%</Text>
      </View>
      <View style={[styles.utilProgressBg, { backgroundColor: isDark ? '#2a2a2a' : '#f0f0f0' }]}>
        <View style={[styles.utilProgressFill, { width: `${value}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

function LegendItem({ color, label, value, colors, isDark }: any) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={[styles.legendLabel, { color: isDark ? '#d1d1d1' : '#444' }]}>{label}</Text>
      <Text style={[styles.legendValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerIconButton: { padding: 8 },
  avatarBadge: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 10, fontWeight: '700' },
  scrollContent: { padding: 16, gap: 16, paddingBottom: 100 },
  heroCard: { padding: 24, borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
  heroOverlay: { position: 'absolute', top: 0, right: 0, opacity: 0.1 },
  heroIconBackground: { transform: [{ rotate: '15deg' }, { translateX: 20 }, { translateY: -20 }] },
  heroContent: { zIndex: 1 },
  heroLabel: { fontSize: 14, fontWeight: '500' },
  heroValueRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 12, marginTop: 4 },
  heroValue: { fontSize: 48, fontWeight: '800', letterSpacing: -2 },
  trendBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, marginBottom: 8 },
  trendText: { fontSize: 12, fontWeight: '700', color: '#10B981' },
  heroSubtext: { fontSize: 12, marginTop: 16 },
  progressBg: { height: 8, borderRadius: 4, marginTop: 16, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  card: { padding: 20, borderRadius: 20, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  tabSelector: { flexDirection: 'row', padding: 4, borderRadius: 10, gap: 4 },
  tabActive: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  tabActiveText: { color: '#000', fontSize: 10, fontWeight: '800' },
  tabInactiveText: { paddingHorizontal: 12, paddingVertical: 4, fontSize: 10, fontWeight: '800' },
  chartContainer: { height: 160, width: '100%' },
  chartDays: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  dayText: { fontSize: 9, fontWeight: '800' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24, paddingTop: 16, borderTopWidth: 1 },
  footerLabel: { fontSize: 11, fontWeight: '500' },
  footerValue: { fontSize: 14, fontWeight: '700', marginTop: 2 },
  utilizationList: { gap: 20 },
  utilRow: { gap: 6 },
  utilHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  utilLabel: { fontSize: 13, fontWeight: '500' },
  utilValue: { fontSize: 13, fontWeight: '700' },
  utilProgressBg: { height: 6, borderRadius: 3, overflow: 'hidden' },
  utilProgressFill: { height: '100%', borderRadius: 3 },
  pieSection: { flexDirection: 'row', alignItems: 'center', gap: 32 },
  pieWrapper: { position: 'relative', width: 120, height: 120 },
  pieCenter: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  pieTotal: { fontSize: 18, fontWeight: '800' },
  pieTotalLabel: { fontSize: 8, fontWeight: '800', letterSpacing: 1 },
  pieLegend: { flex: 1, gap: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { flex: 1, fontSize: 12, fontWeight: '500' },
  legendValue: { fontSize: 12, fontWeight: '700' }
});
