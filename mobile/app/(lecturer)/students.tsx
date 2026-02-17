import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { ChevronLeft, MoreVertical, Search, Share2 } from 'lucide-react-native';
import Fonts from '@/constants/fonts';
import { useState, useEffect } from 'react';
import { api } from '@/services/api';

const { width } = Dimensions.get('window');

export default function LecturerStudentsScreen() {
  const router = useRouter();
  const { courseId, courseName } = useLocalSearchParams();
  const { colors, isDark } = useTheme();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const loadData = async () => {
    try {
        if (courseId) {
            const data: any = await api.courses.getEnrolledStudents(courseId as string);
            setStudents(data.students || []);
        } else {
            // Fallback mock data
            setStudents([
                { id: '1', name: 'John Doe', matricNumber: 'A0123456X', attendance: 98, status: 'EXCELLENT' },
                { id: '2', name: 'Jane Smith', matricNumber: 'A0123457Y', attendance: 85, status: 'GOOD' },
                { id: '3', name: 'Michael Lee', matricNumber: 'A0123458Z', attendance: 94, status: 'EXCELLENT' },
                { id: '4', name: 'Sarah Chen', matricNumber: 'A0123459W', attendance: 72, status: 'AT RISK' },
                { id: '5', name: 'Robert Wong', matricNumber: 'A0123460A', attendance: 91, status: 'EXCELLENT' },
            ]);
        }
    } catch (e) {
        console.error('Failed to load students', e);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [courseId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.matricNumber || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
            {courseName || 'CS401 - AI Ethics'}
        </Text>
        <TouchableOpacity style={styles.moreBtn}>
          <MoreVertical size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Stats Section */}
        <View style={styles.statsSection}>
            <View style={[styles.statBox, { backgroundColor: isDark ? '#2d2714' : '#FFFFFF', borderColor: isDark ? '#6a5d2f' : '#E5E7EB' }]}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Students Registered</Text>
                <Text style={[styles.statValue, { color: colors.text }]}>{students.length}</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: isDark ? '#2d2714' : '#FFFFFF', borderColor: isDark ? '#6a5d2f' : '#E5E7EB' }]}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Avg Attendance</Text>
                <Text style={[styles.statValue, { color: colors.primary }]}>92%</Text>
            </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchSection}>
            <View style={[styles.searchBar, { backgroundColor: isDark ? '#4a4121' : '#FFFFFF', borderColor: isDark ? 'transparent' : '#E5E7EB', borderWidth: isDark ? 0 : 1 }]}>
                <Search size={20} color={colors.textSecondary} />
                <TextInput
                    placeholder="Search students by name or matric number"
                    placeholderTextColor={isDark ? '#ccbf8e' : colors.textSecondary}
                    style={[styles.searchInput, { color: colors.text }]}
                    value={search}
                    onChangeText={setSearch}
                />
            </View>
        </View>

        {/* List Header */}
        <View style={styles.listHeader}>
            <Text style={[styles.listHeaderText, { color: colors.text }]}>STUDENT LIST</Text>
            <Text style={[styles.countText, { color: colors.textSecondary }]}>Showing {filteredStudents.length} students</Text>
        </View>

        {/* Student List */}
        <View style={styles.studentList}>
            {loading && !refreshing ? (
                <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
            ) : (
                filteredStudents.map((student) => (
                    <StudentItem key={student.id} student={student} colors={colors} isDark={isDark} />
                ))
            )}
            {!loading && filteredStudents.length === 0 && (
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No students found</Text>
            )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary }]}>
        <Share2 size={24} color="#231e0f" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function StudentItem({ student, colors, isDark }: any) {
    const status = student.status || (student.attendance >= 90 ? 'EXCELLENT' : student.attendance >= 80 ? 'GOOD' : 'AT RISK');
    const statusColor = status === 'EXCELLENT' ? '#10B981' : status === 'GOOD' ? '#F59E0B' : '#EF4444';
    const initials = student.name.split(' ').map((n:any)=>n[0]).join('').substring(0, 2).toUpperCase();

    return (
        <TouchableOpacity style={[styles.studentItem, { borderBottomColor: isDark ? '#4a4121' : '#F1F5F9' }]}>
            <View style={styles.studentLeft}>
                <View style={[styles.initialsBox, { backgroundColor: colors.primary + '33' }]}>
                    <Text style={[styles.initials, { color: colors.primary }]}>{initials}</Text>
                </View>
                <View>
                    <Text style={[styles.studentName, { color: colors.text }]}>{student.name}</Text>
                    <Text style={[styles.studentMatric, { color: colors.textSecondary }]}>{student.matricNumber || student.id}</Text>
                </View>
            </View>
            <View style={styles.studentRight}>
                <Text style={[styles.attendancePercent, { color: colors.text }]}>{student.attendance || 0}%</Text>
                <Text style={[styles.ratingText, { color: statusColor }]}>{status}</Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: Fonts.lexend.bold,
    flex: 1,
    textAlign: 'center',
  },
  moreBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 120,
  },
  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 16,
    marginTop: 12,
  },
  statBox: {
    flex: 1,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
  },
  statLabel: {
    fontSize: 13,
    fontFamily: Fonts.lexend.medium,
  },
  statValue: {
    fontSize: 24,
    fontFamily: Fonts.lexend.bold,
  },
  searchSection: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  searchBar: {
    height: 52,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: Fonts.lexend.regular,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 8,
  },
  listHeaderText: {
    fontSize: 12,
    fontFamily: Fonts.lexend.bold,
    letterSpacing: 1,
  },
  countText: {
    fontSize: 11,
    fontFamily: Fonts.lexend.regular,
  },
  studentList: {
      paddingHorizontal: 4,
  },
  studentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  studentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  initialsBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontSize: 14,
    fontFamily: Fonts.lexend.bold,
  },
  studentName: {
    fontSize: 16,
    fontFamily: Fonts.lexend.medium,
  },
  studentMatric: {
    fontSize: 14,
    fontFamily: Fonts.lexend.regular,
  },
  studentRight: {
    alignItems: 'flex-end',
  },
  attendancePercent: {
    fontSize: 16,
    fontFamily: Fonts.lexend.bold,
  },
  ratingText: {
    fontSize: 10,
    fontFamily: Fonts.lexend.bold,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  emptyText: {
      textAlign: 'center',
      marginTop: 40,
      fontFamily: Fonts.lexend.medium,
  }
});
