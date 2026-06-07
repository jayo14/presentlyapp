import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { ChevronLeft, MapPin, Group, School, BookOpen, DoorOpen, Landmark, LayoutDashboard, Settings, ChevronRight, TrendingUp, TrendingDown, Monitor } from 'lucide-react-native';
import { storage } from '@/utils/storage';
import { useState, useEffect } from 'react';
import { School as SchoolType } from '@/types';

export default function InstitutionCommandCenter() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { colors, isDark } = useTheme();
  const [institution, setInstitution] = useState<SchoolType | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const schools = await storage.getSchools();
      const found = schools.find(s => s.id === id);
      if (found) setInstitution(found);
    };
    loadData();
  }, [id]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border + '33', borderBottomWidth: 1 }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Command Center</Text>
        </View>
        <TouchableOpacity style={[styles.editButton, { backgroundColor: colors.primary + '1A' }]}>
          <Text style={[styles.editButtonText, { color: colors.primary }]}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Identity */}
        <View style={styles.identitySection}>
          <View style={styles.logoWrapper}>
            <View style={[styles.logoContainer, { borderColor: colors.primary, backgroundColor: isDark ? '#1e1b0f' : '#fff' }]}>
              <Image
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBRsfFJM2D4aa2wzT1w3HV0vUilqxlj7fzgNXPYQ9RiIEJijT4V2IQNkc4Uz1U1a9-Uz_niWoSCr48gjOXJhlfO2ytCXWUDtGaYKrvr7YCdU3iHvxE3SPxrr8KoZNByXGJT9B1gsV1w58xHz31BhNI_1OzNwFYFAacCgKQR_NdmLztW_dcJQ-hneTlFE7iad0bID73Uigz-LetzwnEUqqQr3E9dHQlYd1FvT2JTb0DQShaIoEebf7K_s264p6aG5wBFj9gINYd4nMXn' }}
                style={styles.logoImage}
              />
            </View>
            <View style={[styles.statusDot, { backgroundColor: '#10B981', borderColor: colors.background }]} />
          </View>
          <View style={styles.identityText}>
            <Text style={[styles.institutionName, { color: colors.text }]}>{institution?.name || 'Global University'}</Text>
            <View style={styles.locationRow}>
              <MapPin size={12} color={colors.primary + 'B3'} />
              <Text style={[styles.locationText, { color: colors.primary + 'B3' }]}>Main Campus • Admin Node</Text>
            </View>
            <Text style={[styles.idText, { color: colors.textSecondary }]}>ID: UNIV-9421-PRIME</Text>
          </View>
        </View>

        {/* KPI Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            icon={<Group size={20} color={colors.primary} />}
            value="12,450"
            label="Total Students"
            trend="+2.5%"
            trendUp
            colors={colors}
            isDark={isDark}
          />
          <StatCard
            icon={<School size={20} color={colors.primary} />}
            value="840"
            label="Lecturers"
            trend="-1.2%"
            trendUp={false}
            colors={colors}
            isDark={isDark}
          />
          <StatCard
            icon={<BookOpen size={20} color={colors.primary} />}
            value="320"
            label="Courses"
            trend="+5.0%"
            trendUp
            colors={colors}
            isDark={isDark}
          />
          <StatCard
            icon={<DoorOpen size={20} color={colors.primary} />}
            value="45/50"
            label="Active Venues"
            colors={colors}
            isDark={isDark}
            status="Active"
          />
        </View>

        {/* Management LayoutDashboard */}
        <View style={styles.hubSection}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>MANAGEMENT HUB</Text>
          <View style={styles.hubGrid}>
            <LayoutDashboardCard
              icon={<Landmark size={20} color={colors.primary} />}
              title="Colleges & Faculties"
              subtitle="8 Managed Entities"
              colors={colors}
              isDark={isDark}
              onPress={() => router.push(`/(admin)/institutions/${id}/faculties`)}
            />
            <LayoutDashboardCard
              icon={<LayoutDashboard size={20} color={colors.primary} />}
              title="Departments"
              subtitle="24 Academic Units"
              colors={colors}
              isDark={isDark}
              onPress={() => router.push(`/(admin)/institutions/${id}/departments`)}
            />
            <LayoutDashboardCard
              icon={<MapPin size={20} color={colors.primary} />}
              title="Venue Management"
              subtitle="Labs, Auditoriums & Halls"
              colors={colors}
              isDark={isDark}
              onPress={() => router.push(`/(admin)/venues`)}
            />
            <LayoutDashboardCard
              icon={<Settings size={20} color={colors.primary} />}
              title="Admins & Access"
              subtitle="12 Security Protocols"
              colors={colors}
              isDark={isDark}
              onPress={() => router.push(`/(admin)/institutions/${id}/admins`)}
            />
          </View>
        </View>

        {/* Attendance Trend Chart */}
        <View style={[styles.chartCard, { backgroundColor: isDark ? '#1e1b0f' : '#fff', borderColor: colors.border + '1A' }]}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={[styles.chartTitle, { color: colors.text }]}>Attendance Trend</Text>
              <Text style={[styles.chartSubtitle, { color: colors.textSecondary }]}>Weekly snapshot • Campus-wide</Text>
            </View>
            <Monitor size={20} color={colors.primary} />
          </View>

          <View style={styles.barChart}>
            {[60, 75, 50, 90, 40, 85, 20].map((h, i) => (
              <View key={i} style={styles.barContainer}>
                <View style={[styles.bar, { height: `${h}%`, backgroundColor: i === 5 ? colors.primary : colors.primary + '33' }]}>
                  {i === 5 && <View style={[styles.barGlow, { backgroundColor: colors.primary }]} />}
                </View>
              </View>
            ))}
          </View>
          <View style={styles.chartDays}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => (
              <Text key={d} style={[styles.dayText, { color: i === 5 ? colors.primary : colors.textSecondary }]}>{d}</Text>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ icon, value, label, trend, trendUp, status, colors, isDark }: any) {
  return (
    <View style={[styles.statCard, { backgroundColor: isDark ? '#1e1b0f' : '#fff', borderColor: colors.border + '1A' }]}>
      <View style={styles.statCardTop}>
        <View style={styles.statIconWrapper}>{icon}</View>
        {trend && (
          <View style={[styles.trendBadge, { backgroundColor: trendUp ? '#10B9811A' : '#EF44441A' }]}>
            {trendUp ? <TrendingUp size={10} color="#10B981" /> : <TrendingDown size={10} color="#EF4444" />}
            <Text style={[styles.trendText, { color: trendUp ? '#10B981' : '#EF4444' }]}>{trend.replace('+', '').replace('-', '')}</Text>
          </View>
        )}
        {status && (
          <View style={[styles.statusBadge, { backgroundColor: 'rgba(161,161,170,0.1)' }]}>
            <Text style={styles.statusBadgeText}>{status}</Text>
          </View>
        )}
      </View>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

function LayoutDashboardCard({ icon, title, subtitle, colors, isDark, onPress }: any) {
  return (
    <TouchableOpacity style={[styles.hubCard, { backgroundColor: isDark ? '#1e1b0f' : '#fff', borderColor: colors.border + '1A' }]} onPress={onPress}>
      <View style={styles.hubCardLeft}>
        <View style={[styles.hubIconBox, { backgroundColor: colors.primary + '1A' }]}>
          {icon}
        </View>
        <View>
          <Text style={[styles.hubTitle, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.hubSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
        </View>
      </View>
      <ChevronRight size={18} color={isDark ? '#36301a' : '#ddd'} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  editButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  editButtonText: { fontSize: 13, fontWeight: '600' },
  scrollContent: { paddingBottom: 100 },
  identitySection: { flexDirection: 'row', padding: 20, alignItems: 'center', gap: 20 },
  logoWrapper: { position: 'relative' },
  logoContainer: { width: 80, height: 80, borderRadius: 40, borderWidth: 2, padding: 4, overflow: 'hidden' },
  logoImage: { width: '100%', height: '100%', borderRadius: 36 },
  statusDot: { width: 20, height: 20, borderRadius: 10, borderWidth: 4, position: 'absolute', bottom: -2, right: -2 },
  identityText: { flex: 1 },
  institutionName: { fontSize: 24, fontWeight: '700', lineHeight: 28 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  locationText: { fontSize: 14, fontWeight: '500' },
  idText: { fontSize: 10, fontWeight: '800', letterSpacing: 1, marginTop: 8, textTransform: 'uppercase' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 16, gap: 12 },
  statCard: { width: '48%', padding: 16, borderRadius: 16, borderWidth: 1, gap: 8 },
  statCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  statIconWrapper: { opacity: 0.8 },
  trendBadge: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
  trendText: { fontSize: 10, fontWeight: '700' },
  statusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
  statusBadgeText: { fontSize: 10, fontWeight: '700', color: '#a1a1aa' },
  statValue: { fontSize: 22, fontWeight: '700' },
  statLabel: { fontSize: 12, fontWeight: '500' },
  hubSection: { padding: 16, gap: 12 },
  sectionTitle: { fontSize: 11, fontWeight: '800', letterSpacing: 2, paddingHorizontal: 4 },
  hubGrid: { gap: 8 },
  hubCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 16, borderWidth: 1 },
  hubCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  hubIconBox: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  hubTitle: { fontSize: 14, fontWeight: '600' },
  hubSubtitle: { fontSize: 12, marginTop: 2 },
  chartCard: { margin: 16, padding: 20, borderRadius: 16, borderWidth: 1 },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  chartTitle: { fontSize: 18, fontWeight: '700' },
  chartSubtitle: { fontSize: 12, marginTop: 2 },
  barChart: { height: 100, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 4 },
  barContainer: { flex: 1, height: '100%', justifyContent: 'flex-end' },
  bar: { width: '100%', borderTopLeftRadius: 2, borderTopRightRadius: 2, position: 'relative' },
  barGlow: { position: 'absolute', bottom: -4, left: -4, right: -4, height: 2, shadowColor: '#f2b90d', shadowOpacity: 0.8, shadowRadius: 10, shadowOffset: { width: 0, height: 0 }, elevation: 10 },
  chartDays: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  dayText: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 }
});
