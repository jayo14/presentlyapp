import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, ScrollView, Alert, Image } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { api } from '@/services/api';
import { User } from '@/types';
import { Search, X, MoreVertical, UserPlus } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { CustomModal } from '@/components/CustomModal';

export default function ManageUsersScreen() {
  const { colors, isDark } = useTheme();
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<'all' | 'student' | 'lecturer' | 'admin'>('all');
  const [loading, setLoading] = useState(false);
  
  // Create/Edit Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: 'student' as 'student' | 'lecturer' | 'admin',
    department: '',
    level: ''
  });

  // Alert State
  const [confirmModal, setConfirmModal] = useState<{ visible: boolean, userId: string }>({ visible: false, userId: '' });

  const loadUsers = async () => {
    try {
      const response: any = await api.users.list();
      setUsers(response.results || response);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadUsers();
    }, [])
  );

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'all' || u.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const handleSaveUser = async () => {
    if (!formData.fullName || !formData.email) {
      Alert.alert('Error', 'Full name and email are required');
      return;
    }

    setLoading(true);
    const userToSave: User = editingUser ? {
      ...editingUser,
      ...formData
    } : {
      id: `user_${Date.now()}`,
      ...formData,
      matricNumber: formData.role === 'student' ? 'NEW/MATRIC' : '',
      deviceId: 'manual-add',
      emailVerified: true,
      createdAt: new Date().toISOString(),
      onboardingCompleted: true
    };

    try {
      if (editingUser) {
        await api.users.update(editingUser.id, userToSave);
      } else {
        await api.users.create(userToSave);
      }
      await loadUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      Alert.alert('Error', 'Failed to save user');
    }
    setLoading(false);
    setModalVisible(false);
    setEditingUser(null);
    resetForm();
  };

  const deleteUser = async (id: string) => {
    try {
      await api.users.delete(id);
      await loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      Alert.alert('Error', 'Failed to delete user');
    }
    setConfirmModal({ visible: false, userId: '' });
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      role: 'student',
      department: '',
      level: ''
    });
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      fullName: user.fullName,
      email: user.email,
      role: user.role || 'student',
      department: user.department || '',
      level: user.level || ''
    });
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <CustomModal 
        visible={confirmModal.visible}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        type="confirmation"
        confirmText="Delete"
        onConfirm={() => deleteUser(confirmModal.userId)}
        onCancel={() => setConfirmModal({ visible: false, userId: '' })}
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={[styles.title, { color: colors.text }]}>Users</Text>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f0f0f0' }]}
            onPress={() => { setEditingUser(null); resetForm(); setModalVisible(true); }}
          >
            <UserPlus size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f0f0f0' }]}>
          <Search size={20} color={colors.textSecondary} />
          <TextInput 
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search by name, ID, or institution..."
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
        renderItem={({ item }) => (
          <View style={[styles.userCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <View style={styles.userMain}>
              <View style={[styles.avatarContainer, { borderColor: colors.border }]}>
                {item.avatar ? (
                  <Image source={{ uri: item.avatar }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary + '20' }]}>
                    <Text style={[styles.avatarText, { color: colors.primary }]}>
                      {item.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.userInfo}>
                <View style={styles.nameRow}>
                  <Text style={[styles.userName, { color: colors.text }]}>{item.fullName}</Text>
                  <View style={[styles.statusDot, { backgroundColor: colors.primary, shadowColor: colors.primary, shadowOpacity: 0.6, shadowRadius: 4, shadowOffset: { width: 0, height: 0 } }]} />
                </View>
                <Text style={[styles.userMeta, { color: colors.textSecondary }]}>
                  ID: {item.matricNumber || 'N/A'} • {item.department || 'System'}
                </Text>
                <View style={[styles.roleBadge, { backgroundColor: getRoleColor(item.role) + '1A' }]}>
                  <Text style={[styles.roleLabel, { color: getRoleColor(item.role) }]}>{item.role?.toUpperCase()}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => openEdit(item)} style={styles.moreButton}>
                <MoreVertical size={20} color={colors.textSecondary} />
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
              <Input label="Full Name" placeholder="John Doe" value={formData.fullName} onChangeText={t => setFormData({...formData, fullName: t})} />
              <Input label="Email" placeholder="email@university.edu" value={formData.email} onChangeText={t => setFormData({...formData, email: t})} />
              
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

              {formData.role !== 'admin' && (
                <>
                  <Input label="Department" placeholder="Computer Science" value={formData.department} onChangeText={t => setFormData({...formData, department: t})} />
                  <Input label="Level" placeholder="400" value={formData.level} onChangeText={t => setFormData({...formData, level: t})} />
                </>
              )}

              <Button title={editingUser ? "Update User" : "Create User"} onPress={handleSaveUser} loading={loading} style={{ marginTop: 20 }} />
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
    case 'suspended': return '#EF4444';
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
  avatarContainer: { width: 48, height: 48, borderRadius: 24, borderWidth: 1, overflow: 'hidden' },
  avatar: { width: '100%', height: '100%' },
  avatarPlaceholder: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 16, fontWeight: '700' },
  userInfo: { flex: 1, gap: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  userName: { fontSize: 14, fontWeight: '700' },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  userMeta: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  roleBadge: { alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 4 },
  roleLabel: { fontSize: 10, fontWeight: '800' },
  moreButton: { padding: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, height: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  form: { flex: 1 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 8 },
  rolePicker: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  roleOption: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10, borderWidth: 1 },
  roleOptionText: { fontSize: 13, fontWeight: '600' }
});
