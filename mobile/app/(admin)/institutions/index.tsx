import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, ScrollView, Alert, Image } from 'react-native';
import { useState, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { api } from '@/services/api';
import { School } from '@/types';
import { Search, Plus, School as SchoolIcon, X, ChevronRight, Bell } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { CustomModal } from '@/components/CustomModal';

export default function ManageInstitutionsScreen() {
  const { colors, isDark } = useTheme();
  const [schools, setSchools] = useState<School[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Create/Edit Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSchool, setEditingUser] = useState<School | null>(null);
  const [formData, setFormData] = useState({
    name: '',
  });

  // Alert State
  const [confirmModal, setConfirmModal] = useState<{ visible: boolean, schoolId: string }>({ visible: false, schoolId: '' });

  const loadSchools = async () => {
    try {
      const response: any = await api.institutions.list();
      setSchools(response.results || response);
    } catch (error) {
      console.error('Error loading schools:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadSchools();
    }, [])
  );

  const filteredSchools = schools.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSaveSchool = async () => {
    if (!formData.name) {
      Alert.alert('Error', 'School name is required');
      return;
    }

    setLoading(true);
    const schoolToSave: School = editingSchool ? {
      ...editingSchool,
      name: formData.name
    } : {
      id: `school_${Date.now()}`,
      name: formData.name,
      colleges: []
    };

    try {
      if (editingSchool) {
        await api.institutions.update(editingSchool.id, schoolToSave);
      } else {
        await api.institutions.create(schoolToSave);
      }
      await loadSchools();
    } catch (error) {
      console.error('Error saving institution:', error);
    }
    setLoading(false);
    setModalVisible(false);
    resetForm();
  };

  const deleteSchool = async (id: string) => {
    try {
      await api.institutions.delete(id);
      await loadSchools();
    } catch (error) {
      console.error('Error deleting institution:', error);
    }
    setConfirmModal({ visible: false, schoolId: '' });
  };

  const resetForm = () => {
    setFormData({ name: '' });
    setEditingUser(null);
  };

  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'inactive' | 'pending'>('all');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <CustomModal
        visible={confirmModal.visible}
        title="Delete Institution"
        message="Are you sure you want to delete this school? This will remove all associated colleges and departments."
        type="confirmation"
        confirmText="Delete"
        onConfirm={() => deleteSchool(confirmModal.schoolId)}
        onCancel={() => setConfirmModal({ visible: false, schoolId: '' })}
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={[styles.title, { color: colors.text }]}>Institutions</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconButton}>
              <Bell size={24} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.profileAvatar, { borderColor: colors.primary + '4D' }]}>
              <Image
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-Nmb8TYH6EBuTcIdoxTKVvW0dZ0IhN_7kxZXNDnqtLk5O8rBKCSBd3MTRTJoTPPXO7CT_3jXfISyAzZBkVu1A86atvsRm7NEFHtdqfv1Dn6mQJxogKZ88W6ud7AYNgR4Cgu9Xnkdp0ul2JKz-0X4F6Yfvbu4rS79iTyTXopU4N8ooPAdWOozKxrCmgdKam2oiS-7-NKIuZHef7fJdosl_mz-nAUvLozq-1x_ABW-7hzHjzxg6aGOZAudoNgrtQvtqwMgvl3xZzXU1' }}
                style={styles.avatarImage}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f0f0f0' }]}>
          <Search size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search institutions..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filters */}
        <View style={styles.filterSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {(['all', 'active', 'inactive', 'pending'] as const).map(filter => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterBadge,
                  selectedFilter === filter ? { backgroundColor: colors.primary } : { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f0f0f0', borderColor: isDark ? colors.border : '#e0e0e0', borderWidth: 1 }
                ]}
                onPress={() => setSelectedFilter(filter)}
              >
                <Text style={[
                  styles.filterText,
                  selectedFilter === filter ? { color: '#000' } : { color: colors.textSecondary }
                ]}>
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      <FlatList
        data={filteredSchools}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={[styles.schoolCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderMain}>
                <View style={[styles.iconBox, { backgroundColor: colors.primary + '1A' }]}>
                  <SchoolIcon size={32} color={colors.primary} />
                </View>
                <View style={styles.cardTitles}>
                  <Text style={[styles.schoolName, { color: colors.text }]}>{item.name}</Text>
                  <Text style={[styles.schoolLocation, { color: colors.textSecondary }]}>Main Campus • Region</Text>
                </View>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: colors.primary + '33' }]}>
                <Text style={[styles.statusText, { color: colors.primary }]}>ACTIVE</Text>
              </View>
            </View>

            <View style={[styles.statsRow, { borderTopColor: colors.border, borderBottomColor: colors.border }]}>
              <View style={[styles.statItem, { borderRightColor: colors.border }]}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Users</Text>
                <Text style={[styles.statValue, { color: colors.text }]}>1,240</Text>
              </View>
              <View style={[styles.statItem, { borderRightColor: colors.border }]}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Faculties</Text>
                <Text style={[styles.statValue, { color: colors.text }]}>{item.colleges.length}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Depts</Text>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {item.colleges.reduce((acc, c) => acc + c.departments.length, 0)}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.detailedStatsButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f0f0f0' }]}
              onPress={() => router.push(`/(admin)/institutions/${item.id}`)}
            >
              <Text style={[styles.detailedStatsText, { color: colors.text }]}>View Detailed Stats</Text>
              <ChevronRight size={14} color={colors.primary} />
            </TouchableOpacity>
          </View>
        )}
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/(admin)/institutions/new')}
      >
        <Plus size={32} color="#000" strokeWidth={2.5} />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {editingSchool ? 'Edit Institution' : 'New Institution'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <View style={styles.form}>
              <Input label="School Name" placeholder="University of Excellence" value={formData.name} onChangeText={t => setFormData({...formData, name: t})} />

              {editingSchool && (
                <View style={styles.editNote}>
                  <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
                    Hierarchy management (Colleges & Departments) is coming soon in the next update.
                  </Text>
                </View>
              )}

              <Button title={editingSchool ? "Update School" : "Create School"} onPress={handleSaveSchool} loading={loading} style={{ marginTop: 24 }} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, gap: 16 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 32, fontWeight: '700', letterSpacing: -1 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconButton: { padding: 8 },
  profileAvatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%' },
  searchBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 52, borderRadius: 12, gap: 12 },
  searchInput: { flex: 1, fontSize: 16 },
  filterSection: { marginHorizontal: -16 },
  filterScroll: { paddingHorizontal: 16, gap: 8 },
  filterBadge: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  filterText: { fontSize: 14, fontWeight: '600' },
  listContent: { padding: 16, gap: 16, paddingBottom: 120 },
  schoolCard: { padding: 20, borderRadius: 16, borderWidth: 1, gap: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardHeaderMain: { flexDirection: 'row', gap: 12, alignItems: 'center', flex: 1 },
  iconBox: { width: 56, height: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cardTitles: { flex: 1 },
  schoolName: { fontSize: 18, fontWeight: '700', lineHeight: 22 },
  schoolLocation: { fontSize: 14, marginTop: 2 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  statsRow: { flexDirection: 'row', paddingVertical: 16, borderTopWidth: 1, borderBottomWidth: 1 },
  statItem: { flex: 1, alignItems: 'center', borderRightWidth: 1 },
  statLabel: { fontSize: 12, marginBottom: 4 },
  statValue: { fontSize: 16, fontWeight: '700' },
  detailedStatsButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 10, gap: 8 },
  detailedStatsText: { fontSize: 14, fontWeight: '600' },
  fab: { position: 'absolute', bottom: 32, right: 24, width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  form: { gap: 16 },
  editNote: { padding: 12, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.03)', marginTop: 8 }
});
