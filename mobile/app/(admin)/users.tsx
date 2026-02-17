import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, ScrollView, Alert } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { storage } from '@/utils/storage';
import { User } from '@/types';
import { Search, Plus, UserCircle, Trash2, Edit2, X, Filter } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { CustomModal } from '@/components/CustomModal';

export default function ManageUsersScreen() {
  const { colors } = useTheme();
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
    const loadedUsers = await storage.getAllUsers();
    setUsers(loadedUsers);
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

    await storage.saveUser(userToSave);
    await loadUsers();
    setLoading(false);
    setModalVisible(false);
    setEditingUser(null);
    resetForm();
  };

  const deleteUser = async (id: string) => {
    await storage.deleteUser(id);
    await loadUsers();
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

      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Users</Text>
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => { setEditingUser(null); resetForm(); setModalVisible(true); }}
        >
          <Plus size={24} color={colors.background} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchSection}>
        <View style={[styles.searchBar, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <Search size={20} color={colors.textSecondary} />
          <TextInput 
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search users..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {(['all', 'student', 'lecturer', 'admin'] as const).map(role => (
            <TouchableOpacity 
              key={role}
              style={[
                styles.filterBadge, 
                { backgroundColor: colors.cardBg, borderColor: colors.border },
                selectedRole === role && { backgroundColor: colors.primary, borderColor: colors.primary }
              ]}
              onPress={() => setSelectedRole(role)}
            >
              <Text style={[
                styles.filterText, 
                { color: colors.textSecondary },
                selectedRole === role && { color: colors.background }
              ]}>
                {role.charAt(0).toUpperCase() + role.slice(1)}s
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList 
        data={filteredUsers}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={[styles.userCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <View style={styles.userMain}>
              <View style={[styles.avatar, { backgroundColor: colors.primary + '15' }]}>
                <UserCircle size={24} color={colors.primary} />
              </View>
              <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: colors.text }]}>{item.fullName}</Text>
                <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{item.email}</Text>
                <View style={[styles.roleBadge, { backgroundColor: colors.border + '50' }]}>
                  <Text style={[styles.roleLabel, { color: colors.textSecondary }]}>{item.role?.toUpperCase()}</Text>
                </View>
              </View>
              <View style={styles.userActions}>
                <TouchableOpacity onPress={() => openEdit(item)} style={styles.actionBtn}>
                  <Edit2 size={18} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setConfirmModal({ visible: true, userId: item.id })} style={styles.actionBtn}>
                  <Trash2 size={18} color={colors.error} />
                </TouchableOpacity>
              </View>
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

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: '700' },
  addButton: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  searchSection: { paddingHorizontal: 20, marginBottom: 12 },
  searchBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, height: 48, borderRadius: 14, borderWidth: 1, gap: 8 },
  searchInput: { flex: 1, fontSize: 15 },
  filterSection: { marginBottom: 16 },
  filterScroll: { paddingHorizontal: 20, gap: 10 },
  filterBadge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  filterText: { fontSize: 13, fontWeight: '600' },
  listContent: { paddingHorizontal: 20, gap: 12, paddingBottom: 40 },
  userCard: { padding: 16, borderRadius: 20, borderWidth: 1 },
  userMain: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  avatar: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  userInfo: { flex: 1, gap: 2 },
  userName: { fontSize: 16, fontWeight: '700' },
  userEmail: { fontSize: 13 },
  roleBadge: { alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 4 },
  roleLabel: { fontSize: 10, fontWeight: '800' },
  userActions: { flexDirection: 'row', gap: 8 },
  actionBtn: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.03)' },
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
