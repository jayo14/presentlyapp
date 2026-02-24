import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Image, Modal, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useState, useMemo, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { Search, UserPlus, MoreVertical, X, Mail, Shield, User as UserIcon } from 'lucide-react-native';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '@/hooks/useUsers';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { CustomModal } from '@/components/CustomModal';

export default function UserManagement() {
  const { colors, isDark } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<'all' | 'student' | 'lecturer' | 'admin'>('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [confirmModal, setConfirmModal] = useState({ visible: false, userId: '' });

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: 'student' as 'student' | 'lecturer' | 'admin',
    department: '',
    level: ''
  });

  const { data: usersData, isLoading, refetch, isRefetching } = useUsers();
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  const users = (usersData as any[]) || [];

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch =
        user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = selectedRole === 'all' || user.role === selectedRole;

      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, selectedRole]);

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      role: 'student',
      department: '',
      level: ''
    });
    setEditingUser(null);
  };

  const handleSaveUser = async () => {
    try {
      if (editingUser) {
        await updateUserMutation.mutateAsync({
          id: editingUser.id,
          data: {
            full_name: formData.fullName,
            role: formData.role,
            // Add other fields as per API
          }
        });
      } else {
        await createUserMutation.mutateAsync({
          full_name: formData.fullName,
          email: formData.email,
          role: formData.role,
          // password: 'DefaultPassword123!', // Example, backend might handle this
        });
      }
      setModalVisible(false);
      resetForm();
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await deleteUserMutation.mutateAsync(id);
      setConfirmModal({ visible: false, userId: '' });
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const openEdit = (user: any) => {
    setEditingUser(user);
    setFormData({
      fullName: user.full_name || '',
      email: user.email || '',
      role: user.role || 'student',
      department: user.department || '',
      level: user.level || ''
    });
    setModalVisible(true);
  };

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  if (isLoading && !isRefetching) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <CustomModal 
        visible={confirmModal.visible}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        type="confirmation"
        confirmText="Delete"
        onConfirm={() => handleDeleteUser(confirmModal.userId)}
        onCancel={() => setConfirmModal({ visible: false, userId: '' })}
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={[styles.title, { color: colors.text }]}>Users</Text>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f0f0f0' }]}
            onPress={() => { resetForm(); setModalVisible(true); }}
          >
            <UserPlus size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f0f0f0' }]}>
          <Search size={20} color={colors.textSecondary} />
          <TextInput 
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search users..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Role Filters */}
        <View style={styles.filterSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {(['all', 'student', 'lecturer', 'admin'] as const).map(role => (
              <TouchableOpacity
                key={role}
                style={[
                  styles.filterBadge,
                  selectedRole === role ? { backgroundColor: colors.primary } : { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f0f0f0' }
                ]}
                onPress={() => setSelectedRole(role)}
              >
                <Text style={[
                  styles.filterText,
                  selectedRole === role ? { color: '#000' } : { color: colors.textSecondary }
                ]}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      <FlatList 
        data={filteredUsers}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        renderItem={({ item }) => (
          <View style={[styles.userCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <View style={styles.userMain}>
              <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary + '20' }]}>
                <Text style={[styles.avatarText, { color: colors.primary }]}>
                  {item.full_name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                </Text>
              </View>
              <View style={styles.userInfo}>
                <View style={styles.nameRow}>
                  <Text style={[styles.userName, { color: colors.text }]}>{item.full_name}</Text>
                  <View style={[styles.statusDot, { backgroundColor: item.is_active ? '#10B981' : '#EF4444' }]} />
                </View>
                <Text style={[styles.userMeta, { color: colors.textSecondary }]}>
                  {item.email}
                </Text>
                <View style={[styles.roleBadge, { backgroundColor: getRoleColor(item.role) + '1A' }]}>
                  <Text style={[styles.roleLabel, { color: getRoleColor(item.role) }]}>{item.role?.toUpperCase()}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => openEdit(item)} style={styles.moreButton}>
                <MoreVertical size={20} color={colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setConfirmModal({ visible: true, userId: item.id })} style={styles.moreButton}>
                <X size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Create/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {editingUser ? 'Edit User' : 'New User'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.form}>
              <Input label="Full Name" placeholder="John Doe" value={formData.fullName} onChangeText={(t: string) => setFormData({...formData, fullName: t})} />
              {!editingUser && (
                <Input label="Email" placeholder="email@university.edu" value={formData.email} onChangeText={(t: string) => setFormData({...formData, email: t})} />
              )}
              
              <Text style={[styles.label, { color: colors.text }]}>Role</Text>
              <View style={styles.rolePicker}>
                {(['student', 'lecturer', 'admin'] as const).map(role => (
                  <TouchableOpacity 
                    key={role}
                    style={[
                      styles.roleOption, 
                      { borderColor: colors.border },
                      formData.role === role && { backgroundColor: colors.primary, borderColor: colors.primary }
                    ]}
                    onPress={() => setFormData({...formData, role})}
                  >
                    <Text style={[
                      styles.roleOptionText, 
                      formData.role === role && { color: colors.background }
                    ]}>{role.charAt(0).toUpperCase() + role.slice(1)}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Button
                title={editingUser ? "Update User" : "Create User"}
                onPress={handleSaveUser}
                loading={createUserMutation.isPending || updateUserMutation.isPending}
                style={{ marginTop: 20 }}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function getRoleColor(role: any) {
  switch (role) {
    case 'student': return '#f2b90d';
    case 'lecturer': return '#3B82F6';
    case 'admin': return '#A855F7';
    default: return '#f2b90d';
  }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, gap: 16 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', letterSpacing: -0.5 },
  headerButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  searchBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, height: 48, borderRadius: 12, gap: 8 },
  searchInput: { flex: 1, fontSize: 14 },
  filterSection: { marginHorizontal: -16 },
  filterScroll: { paddingHorizontal: 16, gap: 8 },
  filterBadge: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
  filterText: { fontSize: 12, fontWeight: '600' },
  listContent: { padding: 16, gap: 12, paddingBottom: 100 },
  userCard: { padding: 12, borderRadius: 16, borderWidth: 1 },
  userMain: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  avatarPlaceholder: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 16, fontWeight: '700' },
  userInfo: { flex: 1, gap: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  userName: { fontSize: 14, fontWeight: '700' },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  userMeta: { fontSize: 12, color: '#666' },
  roleBadge: { alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 4 },
  roleLabel: { fontSize: 10, fontWeight: '800' },
  moreButton: { padding: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, height: '70%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  form: { flex: 1 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 8 },
  rolePicker: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  roleOption: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10, borderWidth: 1 },
  roleOptionText: { fontSize: 13, fontWeight: '600' }
});
