import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, ScrollView, Alert } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { storage } from '@/utils/storage';
import { School, College } from '@/types';
import { Search, Plus, School as SchoolIcon, Trash2, Edit2, X, ChevronRight, Building2, GraduationCap } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { CustomModal } from '@/components/CustomModal';
import { schools as mockSchools } from '@/mocks/schools';

export default function ManageInstitutionsScreen() {
  const { colors } = useTheme();
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
    let loadedSchools = await storage.getSchools();
    if (loadedSchools.length === 0) {
      // Initialize with mocks
      for (const s of mockSchools) {
        await storage.saveSchool(s as any);
      }
      loadedSchools = await storage.getSchools();
    }
    setSchools(loadedSchools);
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

    await storage.saveSchool(schoolToSave);
    await loadSchools();
    setLoading(false);
    setModalVisible(false);
    resetForm();
  };

  const deleteSchool = async (id: string) => {
    await storage.deleteSchool(id);
    await loadSchools();
    setConfirmModal({ visible: false, schoolId: '' });
  };

  const resetForm = () => {
    setFormData({ name: '' });
    setEditingUser(null);
  };

  const openEdit = (school: School) => {
    setEditingUser(school);
    setFormData({ name: school.name });
    setModalVisible(true);
  };

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

      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Schools</Text>
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => { resetForm(); setModalVisible(true); }}
        >
          <Plus size={24} color={colors.background} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchSection}>
        <View style={[styles.searchBar, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
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
        renderItem={({ item }) => (
          <View style={[styles.schoolCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconBox, { backgroundColor: colors.primary + '15' }]}>
                <SchoolIcon size={24} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.schoolName, { color: colors.text }]}>{item.name}</Text>
                <Text style={[styles.schoolMeta, { color: colors.textSecondary }]}>{item.colleges.length} Colleges • {item.colleges.reduce((acc, c) => acc + c.departments.length, 0)} Depts</Text>
              </View>
              <View style={styles.cardActions}>
                <TouchableOpacity onPress={() => openEdit(item)} style={styles.actionBtn}>
                  <Edit2 size={18} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setConfirmModal({ visible: true, schoolId: item.id })} style={styles.actionBtn}>
                  <Trash2 size={18} color={colors.error} />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.collegePreview}>
              {item.colleges.slice(0, 2).map((college, idx) => (
                <View key={idx} style={styles.previewItem}>
                  <Building2 size={14} color={colors.textSecondary} />
                  <Text style={[styles.previewText, { color: colors.textSecondary }]} numberOfLines={1}>{college.name}</Text>
                </View>
              ))}
              {item.colleges.length > 2 && (
                <Text style={[styles.moreText, { color: colors.primary }]}>+{item.colleges.length - 2} more colleges</Text>
              )}
            </View>
          </View>
        )}
      />

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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: '700' },
  addButton: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  searchSection: { paddingHorizontal: 20, marginBottom: 16 },
  searchBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, height: 48, borderRadius: 14, borderWidth: 1, gap: 8 },
  searchInput: { flex: 1, fontSize: 15 },
  listContent: { paddingHorizontal: 20, gap: 16, paddingBottom: 40 },
  schoolCard: { padding: 16, borderRadius: 24, borderWidth: 1, gap: 12 },
  cardHeader: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  iconBox: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  schoolName: { fontSize: 17, fontWeight: '700' },
  schoolMeta: { fontSize: 12, marginTop: 2 },
  cardActions: { flexDirection: 'row', gap: 8 },
  actionBtn: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.03)' },
  collegePreview: { paddingLeft: 60, gap: 6 },
  previewItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  previewText: { fontSize: 13 },
  moreText: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  form: { gap: 16 },
  editNote: { padding: 12, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.03)', marginTop: 8 }
});
