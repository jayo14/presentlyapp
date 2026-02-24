import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Dimensions, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, Bell, Plus,  Atom, Network } from 'lucide-react-native';
import Fonts from '@/constants/fonts';
import { useState, useEffect } from 'react';
import { api } from '@/services/api';

const { width } = Dimensions.get('window');

export default function LecturerCoursesScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { isAuthenticated, isLoading: authLoading, refreshSession } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadCourses = async (allowRetry = true) => {
    try {
        if (!isAuthenticated) {
          setCourses([]);
          return;
        }

        const data: any = await api.courses.list();
        setCourses(data.courses || []);
    } catch (e) {
        console.error('Failed to load courses', e);
        setCourses([]);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    loadCourses();
  }, [authLoading, isAuthenticated]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCourses();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Top App Bar */}
      <View style={[styles.header, { borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : '#E2E8F0' }]}>
        <View style={styles.headerLeft}>
            <BookOpen size={28} color={colors.primary} />
            <Text style={[styles.headerTitle, { color: colors.text }]}>My Classes</Text>
        </View>
        <TouchableOpacity style={styles.notificationBtn} onPress={() => router.push('/(lecturer)/notifications')}>
          <Bell size={24} color={isDark ? '#ccbf8e' : colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Ongoing Courses</Text>
            <Text style={[styles.sectionSubtitle, { color: isDark ? '#ccbf8e' : colors.textSecondary }]}>Manage your active lecture series</Text>
        </View>

        <View style={styles.courseList}>
            {loading && !refreshing ? (
                <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
            ) : (
                courses.map((course, index) => (
                    <CourseCard
                        key={course.id}
                        title={course.name}
                        code={course.code}
                        students={`${course.enrolled_students_count || 124} Students`}
                        attendance={course.attendance || 85}
                        index={index}
                        colors={colors}
                        isDark={isDark}
                        onPress={() => router.push({
                            pathname: '/(lecturer)/students',
                            params: { courseId: course.id, courseName: course.name }
                        })}
                    />
                ))
            )}
            {!loading && courses.length === 0 && (
                <Text style={{ textAlign: 'center', marginTop: 40, color: colors.textSecondary, fontFamily: Fonts.lexend.medium }}>No classes found</Text>
            )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        activeOpacity={0.8}
        onPress={() => router.push('/(lecturer)/sessions')}
      >
        <Plus size={32} color="#231e0f" strokeWidth={2.5} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function CourseCard({ title, code, students, attendance, index, colors, isDark, onPress }: any) {
    const getIcon = () => {
        if (index % 3 === 0) return <Text style={{ fontSize: 24, color: colors.primary }}>ƒ</Text>; // Functions
        if (index % 3 === 1) return <Atom size={24} color={colors.primary} />;
        return <Network size={24} color={colors.primary} />;
    };

    return (
        <View style={[styles.card, { backgroundColor: isDark ? '#352e18' : '#FFFFFF', borderColor: isDark ? 'transparent' : '#E2E8F0' }]}>
            <View style={styles.cardTop}>
                <View style={styles.cardInfo}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>{title}</Text>
                    <View style={styles.metaRow}>
                        <Text style={[styles.cardCode, { color: colors.primary }]}>{code}</Text>
                        <Text style={[styles.metaDot, { color: isDark ? '#ccbf8e' : colors.textSecondary }]}>•</Text>
                        <Text style={[styles.cardStudents, { color: isDark ? '#ccbf8e' : colors.textSecondary }]}>{students}</Text>
                    </View>
                </View>
                <View style={[styles.iconBox, { backgroundColor: colors.primary + '1A' }]}>
                    {getIcon()}
                </View>
            </View>

            <View style={styles.attendanceSection}>
                <View style={styles.attendanceHeader}>
                    <Text style={[styles.attendanceLabel, { color: isDark ? '#ccbf8e' : colors.textSecondary }]}>AVG. ATTENDANCE</Text>
                    <Text style={[styles.attendanceValue, { color: colors.text }]}>{attendance}%</Text>
                </View>
                <View style={[styles.progressBg, { backgroundColor: isDark ? '#4a4121' : '#F1F5F9' }]}>
                    <View style={[styles.progressFill, { width: `${attendance}%`, backgroundColor: colors.primary }]} />
                </View>
            </View>

            <TouchableOpacity
                style={[styles.detailsBtn, { backgroundColor: isDark ? '#4a4121' : '#F1F5F9' }]}
                onPress={onPress}
            >
                <Text style={[styles.detailsBtnText, { color: colors.text }]}>View Class Details</Text>
            </TouchableOpacity>
        </View>
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: Fonts.lexend.bold,
  },
  notificationBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingTop: 24,
    paddingBottom: 100,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: Fonts.lexend.bold,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: Fonts.lexend.regular,
  },
  courseList: {
    paddingHorizontal: 16,
    gap: 16,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: Fonts.lexend.bold,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardCode: {
    fontSize: 12,
    fontFamily: Fonts.lexend.bold,
    letterSpacing: 1,
  },
  metaDot: {
    fontSize: 12,
  },
  cardStudents: {
    fontSize: 13,
    fontFamily: Fonts.lexend.medium,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attendanceSection: {
    marginBottom: 16,
  },
  attendanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  attendanceLabel: {
    fontSize: 10,
    fontFamily: Fonts.lexend.bold,
    letterSpacing: 1,
  },
  attendanceValue: {
    fontSize: 14,
    fontFamily: Fonts.lexend.bold,
  },
  progressBg: {
    height: 8,
    width: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  detailsBtn: {
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsBtnText: {
    fontSize: 14,
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
    shadowRadius: 8,
    elevation: 5,
  }
});
