import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert, Modal, Image, Dimensions } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { ChevronLeft, Search, X, CheckCircle } from 'lucide-react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Fonts from '@/constants/fonts';
import { api } from '@/services/api';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

const { width } = Dimensions.get('window');

export default function ManualOverrideScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { colors, isDark } = useTheme();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const bottomDockOffset = tabBarHeight + insets.bottom;

  const [session, setSession] = useState<any>(null);
  const [absentStudents, setAbsentStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState('Late Entry');
  const [notes, setNotes] = useState('');
  const [marking, setMarking] = useState(false);

  const loadData = async () => {
    try {
      if (!id) return;
      const sessionData = await api.sessions.get(id as string);
      setSession(sessionData);

      const allStudents = await api.courses.getEnrolledStudents(sessionData.course);
      const studentList = Array.isArray(allStudents) ? allStudents : (allStudents.students || []);

      const attendances = await api.attendance.list({ session: id });
      const presentStudentIds = new Set((attendances.results || attendances || []).map((a: any) => a.student));

      const absent = studentList.filter((s: any) => !presentStudentIds.has(s.id));
      setAbsentStudents(absent);
    } catch (e) {
      console.error('Failed to load override data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleMarkPresent = async () => {
    if (!selectedStudent) return;
    try {
      setMarking(true);
      await api.attendances.create({
        session: id,
        student: selectedStudent.id,
        status: 'present',
        verification_method: 'manual',
        remarks: `${reason}: ${notes}`,
      });

      setShowModal(false);
      setNotes('');
      Alert.alert('Success', `${selectedStudent.name || selectedStudent.full_name} marked as present`);
      loadData();
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to mark attendance');
    } finally {
      setMarking(false);
    }
  };

  const filteredStudents = absentStudents.filter(s =>
    (s.name || s.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.matric_number || s.matricNumber || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center' }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : '#E2E8F0' }]}>
        <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace("/")} style={styles.backBtn}>
                <MaterialIcons name="arrow-back-ios" size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Manual Override</Text>
            <View style={{ width: 44 }} />
        </View>
        <View style={styles.searchContainer}>
            <MaterialIcons name="search" size={20} color={colors.primary} style={styles.searchIcon} />
            <TextInput
                style={[styles.searchInput, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6', color: colors.text, borderColor: isDark ? colors.primary + '33' : 'transparent' }]}
                placeholder="Search name or matric number..."
                placeholderTextColor={isDark ? 'rgba(255,255,255,0.3)' : '#999'}
                value={search}
                onChangeText={setSearch}
            />
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomDockOffset + 24 }]}>
        <View style={styles.listHeader}>
            <Text style={[styles.listTitle, { color: isDark ? colors.primary + 'B3' : '#666' }]}>Absent Students ({filteredStudents.length})</Text>
            <View style={[styles.badge, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                <Text style={styles.badgeText}>ACTION REQUIRED</Text>
            </View>
        </View>

        <View style={styles.studentList}>
            {filteredStudents.map((student, idx) => (
                <View key={student.id || idx} style={[styles.studentCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FFF', borderColor: isDark ? colors.primary + '1A' : '#E5E7EB' }]}>
                    <View style={styles.avatarWrap}>
                        <View style={[styles.avatar, { backgroundColor: colors.primary + '33', borderColor: colors.primary + '4D' }]}>
                            {student.profile_picture ? (
                                <Image source={{ uri: student.profile_picture }} style={styles.avatarImg} />
                            ) : (
                                <Text style={[styles.avatarInitial, { color: colors.primary }]}>{(student.name || student.full_name || 'U')[0].toUpperCase()}</Text>
                            )}
                        </View>
                        <View style={styles.statusDot} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.studentName, { color: colors.text }]}>{student.name || student.full_name}</Text>
                        <Text style={styles.studentMatric}>{student.matric_number || student.matricNumber}</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.markBtn, { backgroundColor: colors.primary }]}
                        onPress={() => {
                            setSelectedStudent(student);
                            setShowModal(true);
                        }}
                    >
                        <Text style={styles.markBtnText}>Mark Present</Text>
                    </TouchableOpacity>
                </View>
            ))}
            {filteredStudents.length === 0 && (
                <Text style={{ textAlign: 'center', marginTop: 40, color: '#999', fontFamily: Fonts.lexend.medium }}>No absent students found</Text>
            )}
        </View>
      </ScrollView>

      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: isDark ? '#2d2816' : '#FFF', borderColor: isDark ? colors.primary + '33' : '#E5E7EB' }]}>
                <View style={styles.modalHeader}>
                    <Text style={[styles.modalTitle, { color: colors.text }]}>Reason for Override</Text>
                    <TouchableOpacity onPress={() => setShowModal(false)}>
                        <X size={24} color="#999" />
                    </TouchableOpacity>
                </View>

                <View style={styles.reasonsList}>
                    {['Device Issue', 'GPS Failure', 'Late Entry', 'Medical / Excused'].map((r) => (
                        <TouchableOpacity
                            key={r}
                            style={[styles.reasonItem, { borderColor: isDark ? colors.primary + '33' : '#E5E7EB', backgroundColor: reason === r ? colors.primary + '0D' : 'transparent' }]}
                            onPress={() => setReason(r)}
                        >
                            <View style={[styles.radio, { borderColor: colors.primary }]}>
                                {reason === r && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
                            </View>
                            <Text style={[styles.reasonText, { color: reason === r ? colors.primary : colors.text }]}>{r}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <TextInput
                    style={[styles.notesInput, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6', color: colors.text, borderColor: isDark ? colors.primary + '1A' : 'transparent' }]}
                    placeholder="Other notes..."
                    placeholderTextColor="#666"
                    multiline
                    numberOfLines={2}
                    value={notes}
                    onChangeText={setNotes}
                />

                <View style={styles.modalFooter}>
                    <TouchableOpacity style={[styles.cancelBtn, { borderColor: colors.primary + '4D' }]} onPress={() => setShowModal(false)}>
                        <Text style={[styles.cancelBtnText, { color: colors.primary }]}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.confirmBtn, { backgroundColor: colors.primary }]}
                        onPress={handleMarkPresent}
                        disabled={marking}
                    >
                        {marking ? <ActivityIndicator color="#0A0A0A" /> : <Text style={styles.confirmBtnText}>Confirm</Text>}
                    </TouchableOpacity>
                </View>

                <View style={styles.modalHandleWrap}>
                    <View style={[styles.modalHandle, { backgroundColor: colors.primary + '4D' }]} />
                </View>
            </View>
        </View>
      </Modal>

      <View style={{ height: 80 }} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16, borderBottomWidth: 1 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontFamily: Fonts.lexend.bold },
  searchContainer: { position: 'relative' },
  searchIcon: { position: 'absolute', left: 12, top: 14, zIndex: 1 },
  searchInput: { height: 48, borderRadius: 12, paddingLeft: 44, paddingRight: 16, fontSize: 14, fontFamily: Fonts.lexend.regular, borderWidth: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4, marginBottom: 12 },
  listTitle: { fontSize: 13, fontFamily: Fonts.lexend.semiBold, textTransform: 'uppercase', letterSpacing: 1 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 10, fontFamily: Fonts.lexend.bold, color: '#EF4444' },
  studentList: { gap: 12 },
  studentCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1, gap: 16 },
  avatarWrap: { position: 'relative' },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 2, overflow: 'hidden' },
  avatarImg: { width: '100%', height: '100%' },
  avatarInitial: { fontSize: 18, fontFamily: Fonts.lexend.bold },
  statusDot: { position: 'absolute', bottom: -1, right: -1, width: 14, height: 14, borderRadius: 7, backgroundColor: '#EF4444', borderWidth: 2, borderColor: '#231e0f' },
  studentName: { fontSize: 16, fontFamily: Fonts.lexend.bold },
  studentMatric: { fontSize: 12, fontFamily: Fonts.lexend.light, color: '#999', marginTop: 2 },
  markBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  markBtnText: { fontSize: 11, fontFamily: Fonts.lexend.bold, color: '#0A0A0A' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, borderWidth: 1, borderBottomWidth: 0 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontFamily: Fonts.lexend.bold },
  reasonsList: { gap: 12, marginBottom: 16 },
  reasonItem: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1, gap: 12 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioInner: { width: 10, height: 10, borderRadius: 5 },
  reasonText: { fontSize: 14, fontFamily: Fonts.lexend.medium },
  notesInput: { borderRadius: 12, padding: 12, fontSize: 14, fontFamily: Fonts.lexend.regular, borderWidth: 1, minHeight: 60, textAlignVertical: 'top' },
  modalFooter: { flexDirection: 'row', gap: 12, marginTop: 32 },
  cancelBtn: { flex: 1, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  cancelBtnText: { fontSize: 14, fontFamily: Fonts.lexend.bold },
  confirmBtn: { flex: 1, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', shadowColor: '#f9c406', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  confirmBtnText: { fontSize: 14, fontFamily: Fonts.lexend.bold, color: '#0A0A0A' },
  modalHandleWrap: { width: '100%', alignItems: 'center', marginTop: 16 },
  modalHandle: { width: 40, height: 4, borderRadius: 2 }
});
