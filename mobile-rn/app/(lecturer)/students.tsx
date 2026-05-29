import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator, RefreshControl, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { ChevronLeft, MoreVertical, Search } from 'lucide-react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Fonts from '@/constants/fonts';
import { useState } from 'react';
import { api } from '@/services/api';
import { useCourse, useCourseEnrolledStudents, useCourseAttendance } from '@/hooks/useCourses';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

const { width } = Dimensions.get('window');

export default function LecturerStudentsScreen() {
  const router = useRouter();
  const { courseId, courseName, courseCode } = useLocalSearchParams();
  const { colors, isDark } = useTheme();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const bottomDockOffset = tabBarHeight + insets.bottom;
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const { data: courseData, isLoading: courseLoading } = useCourse(courseId as string);
  const { data: studentsData, isLoading: studentsLoading, refetch: refetchStudents } = useCourseEnrolledStudents(courseId as string);
  const { data: attendanceData, isLoading: attendanceLoading, refetch: refetchAttendance } = useCourseAttendance(courseId as string);

  const students = Array.isArray(studentsData) ? studentsData : (studentsData?.results || studentsData?.students || []);
  const enrolledCount = courseData?.enrolled_students_count || students.length;
  const avgAttendance = attendanceData?.average_attendance || courseData?.attendance_percentage || 0;

  const filteredStudents = students.filter((s: any) =>
    (s.name || s.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.matric_number || s.matricNumber || '').toLowerCase().includes(search.toLowerCase())
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchStudents(), refetchAttendance()]);
    setRefreshing(false);
  };

  const loading = courseLoading || studentsLoading || attendanceLoading;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: isDark ? '#4a4121' : '#E2E8F0' }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
            {courseData?.code || courseCode ? `${courseData?.code || courseCode} - ` : ''}{courseData?.title || courseName || 'Class Students'}
        </Text>
        <TouchableOpacity style={styles.moreBtn}>
          <MoreVertical size={24} color={isDark ? '#ccbf8e' : '#94A3B8'} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomDockOffset + 56 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <View style={styles.statsSection}>
            <View style={[styles.statBox, { backgroundColor: isDark ? '#2d2714' : '#FFFFFF', borderColor: isDark ? '#6a5d2f' : '#E2E8F0' }]}>
                <Text style={[styles.statLabel, { color: isDark ? '#ccbf8e' : '#666666' }]}>Students Registered</Text>
                <Text style={[styles.statValue, { color: colors.text }]}>{enrolledCount}</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: isDark ? '#2d2714' : '#FFFFFF', borderColor: isDark ? '#6a5d2f' : '#E2E8F0' }]}>
                <Text style={[styles.statLabel, { color: isDark ? '#ccbf8e' : '#666666' }]}>Avg Attendance</Text>
                <Text style={[styles.statValue, { color: colors.primary }]}>{avgAttendance}%</Text>
            </View>
        </View>

        <View style={styles.searchSection}>
            <View style={[styles.searchBar, { backgroundColor: isDark ? '#4a4121' : '#FFFFFF', borderColor: isDark ? 'transparent' : '#E2E8F0' }]}>
                <Search size={20} color={isDark ? '#ccbf8e' : '#94A3B8'} />
                <TextInput
                    placeholder="Search students by name or matric number"
                    placeholderTextColor={isDark ? '#ccbf8e' : '#94A3B8'}
                    style={[styles.searchInput, { color: colors.text }]}
                    value={search}
                    onChangeText={setSearch}
                />
            </View>
        </View>

        <View style={styles.listHeader}>
            <Text style={[styles.listHeaderText, { color: colors.text }]}>STUDENT LIST</Text>
            <Text style={[styles.countText, { color: isDark ? '#ccbf8e' : '#666666' }]}>Showing {filteredStudents.length} students</Text>
        </View>

        <View style={styles.studentList}>
            {loading && !refreshing ? (
                <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
            ) : (
                filteredStudents.map((student: any, idx: number) => (
                    <StudentItem key={student.id || idx} student={student} colors={colors} isDark={isDark} />
                ))
            )}
            {!loading && filteredStudents.length === 0 && (
                <Text style={[styles.emptyText, { color: colors.textSecondary, marginTop: 40 }]}>No students found</Text>
            )}
        </View>
      </ScrollView>

      <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary, bottom: bottomDockOffset + 16 }]} activeOpacity={0.8}>
        <MaterialIcons name="ios-share" size={24} color="#231e0f" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function StudentItem({ student, colors, isDark }: any) {
    const attendance = student.attendance_percentage || student.attendance || 0;
    const status = attendance >= 90 ? 'Excellent' : attendance >= 75 ? 'Good' : 'At Risk';
    const statusColor = status === 'Excellent' ? '#10B981' : status === 'Good' ? '#F59E0B' : '#EF4444';
    const name = student.name || student.full_name || 'Unknown Student';
    const initials = name.split(' ').map((n:any)=>n[0]).join('').substring(0, 2).toUpperCase();

    return (
        <TouchableOpacity style={[styles.studentItem, { borderBottomColor: isDark ? '#4a4121' : '#F1F5F9' }]}>
            <View style={styles.studentLeft}>
                <View style={[styles.initialsBox, { backgroundColor: colors.primary + '33' }]}>
                    <Text style={[styles.initials, { color: colors.primary }]}>{initials}</Text>
                </View>
                <View>
                    <Text style={[styles.studentName, { color: colors.text }]}>{name}</Text>
                    <Text style={[styles.studentMatric, { color: isDark ? '#ccbf8e' : '#666666' }]}>{student.matric_number || student.matricNumber || student.id}</Text>
                </View>
            </View>
            <View style={styles.studentRight}>
                <Text style={[styles.attendancePercent, { color: colors.text }]}>{attendance}%</Text>
                <Text style={[styles.ratingText, { color: statusColor }]}>{status.toUpperCase()}</Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontFamily: Fonts.lexend.bold, flex: 1, textAlign: 'center' },
  moreBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { paddingBottom: 120 },
  statsSection: { flexDirection: 'row', paddingHorizontal: 16, gap: 16, marginTop: 12 },
  statBox: { flex: 1, padding: 24, borderRadius: 16, borderWidth: 1, gap: 8 },
  statLabel: { fontSize: 14, fontFamily: Fonts.lexend.medium },
  statValue: { fontSize: 24, fontFamily: Fonts.lexend.bold },
  searchSection: { paddingHorizontal: 16, marginTop: 12 },
  searchBar: { height: 48, borderRadius: 12, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 12, borderWidth: 1 },
  searchInput: { flex: 1, fontSize: 14, fontFamily: Fonts.lexend.regular },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginTop: 24, marginBottom: 8 },
  listHeaderText: { fontSize: 12, fontFamily: Fonts.lexend.bold, letterSpacing: 1 },
  countText: { fontSize: 11, fontFamily: Fonts.lexend.regular },
  studentList: { paddingHorizontal: 0 },
  studentItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, minHeight: 72, borderBottomWidth: 1 },
  studentLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  initialsBox: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  initials: { fontSize: 14, fontFamily: Fonts.lexend.bold },
  studentName: { fontSize: 16, fontFamily: Fonts.lexend.medium },
  studentMatric: { fontSize: 14, fontFamily: Fonts.lexend.regular },
  studentRight: { alignItems: 'flex-end' },
  attendancePercent: { fontSize: 16, fontFamily: Fonts.lexend.bold },
  ratingText: { fontSize: 10, fontFamily: Fonts.lexend.bold },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', shadowColor: '#f9c406', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
  emptyText: { textAlign: 'center', fontFamily: Fonts.lexend.medium }
});
