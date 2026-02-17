import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, LogOut, Settings, ShieldCheck, Database, FileText } from 'lucide-react-native';
import { useState } from 'react';
import { CustomModal } from '@/components/CustomModal';

export default function AdminProfileScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user, signOut } = useAuth();
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  const handleSignOut = () => setShowSignOutModal(true);

  const confirmSignOut = async () => {
    setShowSignOutModal(false);
    await signOut();
    router.replace('/auth/sign-in');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <CustomModal
        visible={showSignOutModal}
        title="Sign Out"
        message="Are you sure you want to sign out from the Admin Portal?"
        type="confirmation"
        onConfirm={confirmSignOut}
        onCancel={() => setShowSignOutModal(false)}
        confirmText="Sign Out"
      />
      
      <View style={styles.headerBar}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Admin Profile</Text>
        <ShieldCheck size={24} color={colors.primary} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.profileHeader, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={[styles.avatarText, { color: colors.background }]}>AD</Text>
          </View>
          <Text style={[styles.name, { color: colors.text }]}>{user?.fullName || 'Administrator'}</Text>
          <View style={[styles.adminBadge, { backgroundColor: colors.primary + '15' }]}>
            <Text style={[styles.adminBadgeText, { color: colors.primary }]}>SUPER ADMIN</Text>
          </View>
          <Text style={[styles.email, { color: colors.textSecondary }]}>{user?.email}</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>SYSTEM MANAGEMENT</Text>
          <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <ProfileRow icon={Database} label="System Logs" subLabel="View all activity trails" color={colors.text} />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <ProfileRow icon={FileText} label="Generate Reports" subLabel="Export system data" color={colors.text} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>ACCOUNT</Text>
          <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <View style={styles.infoRow}>
              <Mail size={20} color={colors.textSecondary} />
              <View>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Admin Email</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{user?.email}</Text>
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.signOutButton, { backgroundColor: colors.error + '15', borderColor: colors.error }]}
          onPress={handleSignOut}
        >
          <LogOut size={20} color={colors.error} />
          <Text style={[styles.signOutText, { color: colors.error }]}>Log Out of Portal</Text>
        </TouchableOpacity>

        <Text style={[styles.version, { color: colors.textSecondary }]}>Admin Portal v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function ProfileRow({ icon: Icon, label, subLabel, color }: any) {
  return (
    <TouchableOpacity style={styles.rowItem}>
      <View style={[styles.rowIcon, { backgroundColor: 'rgba(0,0,0,0.03)' }]}>
        <Icon size={20} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowLabel, { color }]}>{label}</Text>
        <Text style={styles.rowSubLabel}>{subLabel}</Text>
      </View>
      <ShieldCheck size={16} color="rgba(0,0,0,0.1)" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  scrollContent: { padding: 20, gap: 24, paddingBottom: 40 },
  profileHeader: { alignItems: 'center', padding: 32, borderRadius: 24, borderWidth: 1, gap: 8 },
  avatar: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  avatarText: { fontSize: 32, fontWeight: '800' },
  name: { fontSize: 22, fontWeight: '700' },
  adminBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  adminBadgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  email: { fontSize: 14, marginTop: 4 },
  section: { gap: 12 },
  sectionTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 1, marginLeft: 4 },
  card: { borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
  infoRow: { flexDirection: 'row', padding: 16, gap: 12, alignItems: 'center' },
  infoLabel: { fontSize: 12, fontWeight: '600' },
  infoValue: { fontSize: 15, fontWeight: '600' },
  rowItem: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  rowIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { fontSize: 15, fontWeight: '600' },
  rowSubLabel: { fontSize: 12, color: '#888', marginTop: 2 },
  divider: { height: 1, marginLeft: 68 },
  signOutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 16, borderRadius: 16, borderWidth: 2, marginTop: 12 },
  signOutText: { fontSize: 16, fontWeight: '700' },
  version: { fontSize: 13, textAlign: 'center', marginTop: 12 }
});
