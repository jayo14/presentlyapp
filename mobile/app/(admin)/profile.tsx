import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronLeft, Settings, ShieldCheck, Shield, TrendingUp, User, Lock, FileText, Database, LogOut, ChevronRight, Clock } from 'lucide-react-native';

export default function AdminProfile() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { user, signOut } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout from Terminal',
      'Are you sure you want to end your administrative session?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: signOut }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header Navigation */}
      <View style={[styles.header, { borderBottomColor: colors.primary + '1A', borderBottomWidth: 1 }]}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Administrator Profile</Text>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.push('/(admin)/settings')}>
          <Settings size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Identity Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarWrapper}>
            <View style={[styles.avatarGlow, { backgroundColor: colors.primary }]} />
            <View style={[styles.avatarContainer, { borderColor: colors.primary + '33' }]}>
              <Image
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBLRwwSjE9kCnMtNMEqOqQ5388pHIcCashg_tceg_guF0WII5s-7Y3Yw_00vl8O5EwOIlzIkn0PXlnf9fzrmK5RlbtEKkrveYLKTB4QWt6oB204XGs9nJu9yjzZPgZa2UhuqcRjrWef1f6PFczUK8MhGckkfxdviQnknJWivE5cfu1i7xo_zwMHfgvvoXfMhqO5gtWJWWEbjUWruW6U_Biiag6h3_Z5cgRWE2z7tcozqjDVwtKBK4j-lQVsE9gqdjEqoGSnlddTDM_' }}
                style={styles.avatarImage}
              />
            </View>
            <View style={[styles.verifiedBadge, { backgroundColor: colors.primary, borderColor: colors.background }]}>
              <ShieldCheck size={14} color="#000" strokeWidth={3} />
            </View>
          </View>

          <View style={styles.profileTextContainer}>
            <Text style={[styles.profileName, { color: colors.text }]}>{user?.fullName || 'Alexander Pierce'}</Text>
            <View style={[styles.roleBadge, { backgroundColor: colors.primary + '1A', borderColor: colors.primary + '33' }]}>
              <Text style={[styles.roleText, { color: colors.primary }]}>SYSTEM ADMINISTRATOR</Text>
            </View>
            <View style={styles.lastLoginContainer}>
              <Clock size={14} color={colors.primary + '99'} />
              <Text style={[styles.lastLoginText, { color: colors.textSecondary }]}>
                Last login: Oct 24, 10:45 AM
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#fff' }]}>
            <View style={styles.statCardHeader}>
              <View style={[styles.statIconBox, { backgroundColor: colors.primary + '33' }]}>
                <Shield size={20} color={colors.primary} />
              </View>
              <Text style={styles.statBadgeText}>SECURE</Text>
            </View>
            <View>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>SECURITY LEVEL</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>High</Text>
            </View>
          </View>

          <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#fff' }]}>
            <View style={styles.statCardHeader}>
              <View style={[styles.statIconBox, { backgroundColor: colors.primary + '33' }]}>
                <TrendingUp size={20} color={colors.primary} />
              </View>
              <View style={styles.trendRow}>
                <TrendingUp size={12} color="#10B981" />
                <Text style={styles.trendText}>5%</Text>
              </View>
            </View>
            <View>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>ADMIN ACTIONS TODAY</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>14</Text>
            </View>
          </View>
        </View>

        {/* Administrative Navigation */}
        <View style={styles.navSection}>
          <Text style={[styles.navSectionTitle, { color: colors.primary + '99' }]}>MANAGEMENT CONSOLE</Text>
          <View style={styles.navItemsContainer}>
            <ProfileNavItem
              icon={<User size={22} color={colors.primary} />}
              title="Personal Info"
              subtitle="Manage your administrative profile"
              colors={colors}
              isDark={isDark}
            />
            <ProfileNavItem
              icon={<Lock size={22} color={colors.primary} />}
              title="Security Status"
              subtitle="MFA & Authentication protocols"
              colors={colors}
              isDark={isDark}
            />
            <ProfileNavItem
              icon={<FileText size={22} color={colors.primary} />}
              title="Activity History"
              subtitle="Audit logs & recent transactions"
              colors={colors}
              isDark={isDark}
              onPress={() => router.push('/(admin)/logs')}
            />
            <ProfileNavItem
              icon={<Database size={22} color={colors.primary} />}
              title="System Health"
              subtitle="Infrastructure performance"
              colors={colors}
              isDark={isDark}
            />
          </View>
        </View>

        {/* Danger Zone Footer */}
        {/* Sign Out button moved to settings screen */}
      </ScrollView>
    </SafeAreaView>
  );
}

function ProfileNavItem({ icon, title, subtitle, colors, isDark, onPress }: any) {
  return (
    <TouchableOpacity
      style={[styles.navItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#fff' }]}
      onPress={onPress}
    >
      <View style={[styles.navIconBox, { backgroundColor: colors.primary + '1A' }]}>
        {icon}
      </View>
      <View style={styles.navContent}>
        <Text style={[styles.navTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.navSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
      </View>
      <ChevronRight size={20} color={colors.primary + '66'} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  headerButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '700' },
  scrollContent: { padding: 16, paddingBottom: 100 },
  profileSection: { alignItems: 'center', marginTop: 24, marginBottom: 40 },
  avatarWrapper: { position: 'relative' },
  avatarGlow: { position: 'absolute', top: -4, left: -4, right: -4, bottom: -4, borderRadius: 68, opacity: 0.2 },
  avatarContainer: { width: 128, height: 128, borderRadius: 64, borderWidth: 4, overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%' },
  verifiedBadge: { position: 'absolute', bottom: 4, right: 4, width: 28, height: 28, borderRadius: 14, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  profileTextContainer: { alignItems: 'center', marginTop: 20 },
  profileName: { fontSize: 24, fontWeight: '700', letterSpacing: -0.5 },
  roleBadge: { marginTop: 8, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  roleText: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  lastLoginContainer: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  lastLoginText: { fontSize: 13, fontWeight: '500' },
  statsGrid: { flexDirection: 'row', gap: 16, marginBottom: 40 },
  statCard: { flex: 1, padding: 20, borderRadius: 16, gap: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  statCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statIconBox: { width: 40, height: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  statBadgeText: { fontSize: 10, fontWeight: '800', color: '#10B981' },
  trendRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  trendText: { fontSize: 10, fontWeight: '800', color: '#10B981' },
  statLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  statValue: { fontSize: 24, fontWeight: '700', marginTop: 2 },
  navSection: { marginBottom: 32 },
  navSectionTitle: { fontSize: 11, fontWeight: '800', letterSpacing: 2, paddingHorizontal: 8, marginBottom: 16 },
  navItemsContainer: { gap: 8 },
  navItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  navIconBox: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  navContent: { flex: 1, marginLeft: 16 },
  navTitle: { fontSize: 16, fontWeight: '700' },
  navSubtitle: { fontSize: 12, marginTop: 2 },
  signOutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 16, borderRadius: 16, borderWidth: 1, marginTop: 8 },
  signOutButtonText: { color: '#EF4444', fontSize: 15, fontWeight: '700' }
});
