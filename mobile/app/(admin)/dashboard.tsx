import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useState, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/contexts/AuthContext';
import { storage } from '@/utils/storage';
import { Users, MapPin, School, Plus, ShieldCheck } from 'lucide-react-native';
import { User, Venue, School as SchoolType } from '@/types';

export default function AdminDashboard() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useAuth();
  
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadData = async () => {
    const [loadedUsers, loadedVenues, loadedSchools] = await Promise.all([
      storage.getAllUsers(),
      storage.getVenues(),
      storage.getSchools()
    ]);
    setAllUsers(loadedUsers);
    setVenues(loadedVenues);
    setSchools(loadedSchools);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

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
          />
        }
      >
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <View style={[styles.adminBadge, { backgroundColor: colors.primary + '20' }]}>
              <ShieldCheck size={16} color={colors.primary} />
              <Text style={[styles.adminBadgeText, { color: colors.primary }]}>Admin Portal</Text>
            </View>
          </View>
          <Text style={[styles.userName, { color: colors.text }]}>
            {user?.fullName || 'Administrator'}
          </Text>
        </View>

        <View style={styles.statsGrid}>
          <TouchableOpacity 
            style={[styles.statCard, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/(admin)/users')}
          >
            <Users size={24} color={colors.background} />
            <View>
              <Text style={[styles.statValue, { color: colors.background }]}>{allUsers.length}</Text>
              <Text style={[styles.statLabel, { color: colors.background }]}>Total Users</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.statsColumn}>
            <TouchableOpacity 
              style={[styles.smallStatCard, { backgroundColor: colors.cardBg }]}
              onPress={() => router.push('/(admin)/venues')}
            >
              <MapPin size={20} color={colors.primary} />
              <View>
                <Text style={[styles.smallStatValue, { color: colors.text }]}>{venues.length}</Text>
                <Text style={[styles.smallStatLabel, { color: colors.textSecondary }]}>Venues</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.smallStatCard, { backgroundColor: colors.cardBg }]}
              onPress={() => router.push('/(admin)/institutions')}
            >
              <School size={20} color={colors.primary} />
              <View>
                <Text style={[styles.smallStatValue, { color: colors.text }]}>{schools.length}</Text>
                <Text style={[styles.smallStatLabel, { color: colors.textSecondary }]}>Schools</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={[styles.actionItem, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
              onPress={() => router.push('/(admin)/users')}
            >
              <View style={[styles.actionIcon, { backgroundColor: colors.primary + '15' }]}>
                <Plus size={24} color={colors.primary} />
              </View>
              <Text style={[styles.actionText, { color: colors.text }]}>New User</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionItem, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
              onPress={() => router.push('/(admin)/venues')}
            >
              <View style={[styles.actionIcon, { backgroundColor: colors.primary + '15' }]}>
                <Plus size={24} color={colors.primary} />
              </View>
              <Text style={[styles.actionText, { color: colors.text }]}>New Venue</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionItem, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
              onPress={() => router.push('/(admin)/institutions')}
            >
              <View style={[styles.actionIcon, { backgroundColor: colors.primary + '15' }]}>
                <Plus size={24} color={colors.primary} />
              </View>
              <Text style={[styles.actionText, { color: colors.text }]}>New School</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Role Distribution</Text>
          <View style={[styles.distributionCard, { backgroundColor: colors.cardBg }]}>
            <RoleRow label="Students" count={allUsers.filter(u => u.role === 'student').length} total={allUsers.length} color={colors.primary} />
            <RoleRow label="Lecturers" count={allUsers.filter(u => u.role === 'lecturer').length} total={allUsers.length} color="#FFCA0D" />
            <RoleRow label="Admins" count={allUsers.filter(u => u.role === 'admin').length} total={allUsers.length} color={colors.textSecondary} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function RoleRow({ label, count, total, color }: { label: string, count: number, total: number, color: string }) {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  return (
    <View style={styles.roleRow}>
      <View style={styles.roleInfo}>
        <Text style={styles.roleLabel}>{label}</Text>
        <Text style={styles.roleCount}>{count}</Text>
      </View>
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${percentage}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, gap: 24 },
  header: { marginBottom: 8 },
  titleRow: { flexDirection: 'row', marginBottom: 8 },
  adminBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  adminBadgeText: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  userName: { fontSize: 28, fontWeight: '700' },
  statsGrid: { flexDirection: 'row', gap: 16, height: 160 },
  statCard: { flex: 1.2, borderRadius: 24, padding: 20, justifyContent: 'space-between' },
  statValue: { fontSize: 40, fontWeight: '800' },
  statLabel: { fontSize: 14, fontWeight: '600', opacity: 0.9 },
  statsColumn: { flex: 1, gap: 12 },
  smallStatCard: { flex: 1, borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  smallStatValue: { fontSize: 20, fontWeight: '700' },
  smallStatLabel: { fontSize: 12, fontWeight: '500' },
  section: { gap: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  actionsGrid: { flexDirection: 'row', gap: 12 },
  actionItem: { flex: 1, padding: 16, borderRadius: 20, alignItems: 'center', gap: 8, borderWidth: 1 },
  actionIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  actionText: { fontSize: 12, fontWeight: '600' },
  distributionCard: { padding: 20, borderRadius: 24, gap: 16 },
  roleRow: { gap: 8 },
  roleInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  roleLabel: { fontSize: 14, fontWeight: '600' },
  roleCount: { fontSize: 14, fontWeight: '700' },
  progressBg: { height: 6, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 }
});
