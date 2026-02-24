import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Image, Modal, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { Search, Plus, School as SchoolIcon, ChevronRight, X, Bell } from 'lucide-react-native';
import { useInstitutions, useCreateInstitution, useDeleteInstitution, useUpdateInstitution } from '@/hooks/useInstitutions';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { CustomModal } from '@/components/CustomModal';

export default function InstitutionManagement() {
  const { colors, isDark } = useTheme();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'inactive' | 'pending'>('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSchool, setEditingSchool] = useState<any>(null);
  const [confirmModal, setConfirmModal] = useState({ visible: false, schoolId: '' });

  const [formData, setFormData] = useState({
    name: '',
    address: '',
  });

  const { data: institutionsData, isLoading, refetch, isRefetching } = useInstitutions();
  const createMutation = useCreateInstitution();
  const updateMutation = useUpdateInstitution();
  const deleteMutation = useDeleteInstitution();

  const institutions = (institutionsData as any[]) || [];

  const filteredSchools = useMemo(() => {
    return institutions.filter(school => {
      const matchesSearch = school.name?.toLowerCase().includes(searchQuery.toLowerCase());
      // Logic for filters can be added if backend supports it
      return matchesSearch;
    });
  }, [institutions, searchQuery]);

  const handleSaveSchool = async () => {
    try {
      if (editingSchool) {
        await updateMutation.mutateAsync({
          id: editingSchool.id,
          data: formData
        });
      } else {
        await createMutation.mutateAsync(formData);
      }
      setModalVisible(false);
      setEditingSchool(null);
      setFormData({ name: '', address: '' });
    } catch (error) {
      console.error('Error saving institution:', error);
    }
  };

  const handleDeleteSchool = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      setConfirmModal({ visible: false, schoolId: '' });
    } catch (error) {
      console.error('Error deleting institution:', error);
    }
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
        title="Delete Institution"
        message="Are you sure you want to delete this institution? This will remove all associated data."
        type="confirmation"
        confirmText="Delete"
        onConfirm={() => handleDeleteSchool(confirmModal.schoolId)}
        onCancel={() => setConfirmModal({ visible: false, schoolId: '' })}
      />

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={[styles.title, { color: colors.text }]}>Institutions</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconButton}>
              <Bell size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

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
      </View>

      <FlatList
        data={filteredSchools}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        renderItem={({ item }) => (
          <View style={[styles.schoolCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderMain}>
                <View style={[styles.iconBox, { backgroundColor: colors.primary + '1A' }]}>
                  <SchoolIcon size={32} color={colors.primary} />
                </View>
                <View style={styles.cardTitles}>
                  <Text style={[styles.schoolName, { color: colors.text }]}>{item.name}</Text>
                  <Text style={[styles.schoolLocation, { color: colors.textSecondary }]}>{item.address || 'Location N/A'}</Text>
                </View>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: '#10B981' + '33' }]}>
                <Text style={[styles.statusText, { color: '#10B981' }]}>ACTIVE</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.detailedStatsButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f0f0f0' }]}
              onPress={() => router.push(`/(admin)/institutions/${item.id}`)}
            >
              <Text style={[styles.detailedStatsText, { color: colors.text }]}>Manage Institution</Text>
              <ChevronRight size={14} color={colors.primary} />
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10 }}>
              <TouchableOpacity onPress={() => {
                setEditingSchool(item);
                setFormData({ name: item.name, address: item.address || '' });
                setModalVisible(true);
              }}>
                <Text style={{ color: colors.primary }}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setConfirmModal({ visible: true, schoolId: item.id })}>
                <Text style={{ color: '#EF4444' }}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => {
          setEditingSchool(null);
          setFormData({ name: '', address: '' });
          setModalVisible(true);
        }}
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
              <Input label="School Name" placeholder="University of Excellence" value={formData.name} onChangeText={(t: string) => setFormData({...formData, name: t})} />
              <Input label="Address" placeholder="123 Education St" value={formData.address} onChangeText={(t: string) => setFormData({...formData, address: t})} />

              <Button
                title={editingSchool ? "Update Institution" : "Create Institution"}
                onPress={handleSaveSchool}
                loading={createMutation.isPending || updateMutation.isPending}
                style={{ marginTop: 24 }}
              />
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
  searchBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 52, borderRadius: 12, gap: 12 },
  searchInput: { flex: 1, fontSize: 16 },
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
  detailedStatsButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 10, gap: 8 },
  detailedStatsText: { fontSize: 14, fontWeight: '600' },
  fab: { position: 'absolute', bottom: 32, right: 24, width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', elevation: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  form: { gap: 16 }
});
