import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { api } from '@/services/api';
import { ChevronLeft, MoreVertical, Search, UserPlus } from 'lucide-react-native';
import { useEffect, useState } from 'react';

export default function AdminAccessControlScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [admins, setAdmins] = useState<any[]>([]);

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      const response: any = await api.users.list({ role: 'admin' });
      setAdmins(response.results || response);
    } catch (error) {
      console.error('Error loading admins:', error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.primary + '1A', borderBottomWidth: 1 }]}>
        <View style={styles.headerTop}>
          <View style={styles.headerTitleGroup}>
            <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace("/")}>
              <ChevronLeft size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Admin Management</Text>
          </View>
          <TouchableOpacity style={[styles.headerIconButton, { backgroundColor: colors.primary + '1A' }]}>
            <MoreVertical size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchBar, { backgroundColor: colors.primary + '0D', borderColor: colors.primary + '33' }]}>
          <Search size={20} color={colors.primary + '99'} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search administrators..."
            placeholderTextColor={colors.primary + '66'}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.actionSection}>
          <View>
            <Text style={[styles.actionTitle, { color: colors.text }]}>Assigned Admins</Text>
            <Text style={[styles.actionSubtitle, { color: colors.primary + '99' }]}>12 total administrators found</Text>
          </View>
          <TouchableOpacity style={[styles.addAdminBtn, { backgroundColor: colors.primary }]}>
            <UserPlus size={18} color="#000" />
            <Text style={styles.addAdminText}>Add Admin</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.adminList}>
          {admins.map(admin => (
            <View key={admin.id} style={[styles.adminCard, { backgroundColor: colors.primary + '0D', borderColor: colors.primary + '1A' }]}>
              <View style={styles.adminCardHeader}>
                <View style={styles.adminInfoRow}>
                  <View style={[styles.avatarContainer, { backgroundColor: colors.primary + '33' }]}>
                    {admin.avatar ? (
                      <Image source={{ uri: admin.avatar }} style={styles.avatarImage} />
                    ) : (
                      <Text style={[styles.initials, { color: colors.primary }]}>
                        {admin.fullName.split(' ').map((n: any) => n[0]).join('').toUpperCase()}
                      </Text>
                    )}
                  </View>
                  <View>
                    <Text style={[styles.adminName, { color: colors.text }]}>{admin.fullName}</Text>
                    <Text style={[styles.adminEmail, { color: colors.primary + '99' }]}>{admin.email}</Text>
                    <View style={[styles.roleBadge, { borderColor: colors.primary }]}>
                      <Text style={[styles.roleText, { color: colors.primary }]}>
                        {admin.role?.toUpperCase() || 'ADMIN'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={[styles.scopeBox, { backgroundColor: colors.primary + '0D', borderLeftColor: colors.primary }]}>
                <Text style={[styles.scopeLabel, { color: colors.primary + '99' }]}>SCOPE OF ACCESS</Text>
                <Text style={[styles.scopeText, { color: colors.text }]}>
                  {admin.department || 'University-wide: All Faculties & Departments'}
                </Text>
              </View>

              <View style={styles.cardActions}>
                <TouchableOpacity style={[styles.actionBtn, { borderColor: colors.primary + '4D' }]}>
                  <Text style={[styles.actionBtnText, { color: colors.primary }]}>Edit Scope</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn}>
                  <Text style={[styles.actionBtnText, { color: '#EF4444' }]}>Revoke Access</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, gap: 16 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitleGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 20, fontWeight: '700', letterSpacing: -0.5 },
  headerIconButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  searchBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, height: 48, borderRadius: 12, borderWidth: 1, gap: 10 },
  searchInput: { flex: 1, fontSize: 14 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  actionSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  actionTitle: { fontSize: 18, fontWeight: '600' },
  actionSubtitle: { fontSize: 12, marginTop: 2 },
  addAdminBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, shadowColor: '#f2b90d', shadowOpacity: 0.2, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 5 },
  addAdminText: { fontSize: 14, fontWeight: '700' },
  adminList: { gap: 16 },
  adminCard: { padding: 16, borderRadius: 16, borderWidth: 1, gap: 16 },
  adminCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  adminInfoRow: { flexDirection: 'row', gap: 12 },
  avatarContainer: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%' },
  initials: { fontSize: 18, fontWeight: '700' },
  adminName: { fontSize: 16, fontWeight: '700' },
  adminEmail: { fontSize: 12, marginTop: 2 },
  roleBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20, borderWidth: 1, marginTop: 8 },
  roleText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  scopeBox: { padding: 12, borderRadius: 8, borderLeftWidth: 2 },
  scopeLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  scopeText: { fontSize: 13, fontWeight: '500', marginTop: 4 },
  cardActions: { flexDirection: 'row', gap: 12 },
  actionBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10, borderWidth: 1, borderColor: 'transparent' },
  actionBtnText: { fontSize: 12, fontWeight: '700' }
});
