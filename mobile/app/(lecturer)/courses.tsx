import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/contexts/AuthContext';
import { Search, Plus, MoreVertical } from 'lucide-react-native';
import Fonts from '@/constants/fonts';
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { api } from '@/services/api';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useCurrentPlan } from '@/hooks/useApi';

export default function LecturerCourseHubScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const bottomDockOffset = tabBarHeight + insets.bottom;
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: currentPlan } = useCurrentPlan();
  const canCreate = currentPlan?.course_limit === null || !currentPlan?.is_active;

  const bgColor = isDark ? '#0A0A0A' : colors.background;
  const surfaceColor = isDark ? '#1A1A1A' : '#FFFFFF';

  const handleCreatePress = () => {
    if (canCreate) {
      router.push('/(lecturer)/create-course');
    } else {
      Alert.alert(
        'Course limit reached',
        `You've reached the ${currentPlan?.course_limit ?? 1}-course limit. Upgrade to Pro to create more courses.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => router.push('/pricing') },
        ],
      );
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
        const data = await api.courses.list();
        setCourses(data.courses || data.results || data || []);
    } catch (e) {
        console.error('Failed to load courses', e);
    } finally {
        setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCourses();
    setRefreshing(false);
  };

  const filteredCourses = courses.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: isDark ? 'rgba(10, 10, 10, 0.8)' : 'rgba(255, 255, 255, 0.8)' }]}>
        <View style={styles.headerTop}>
            <View>
                <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : colors.text }]}>Course Hub</Text>
                <Text style={styles.headerSubtitle}>Manage your current academic load</Text>
            </View>
            <View style={[styles.profileImgContainer, { borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#E2E8F0' }]}>
                <Image source={{ uri: user?.profilePicture || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAg5o8203WNZIxONqSkXaJpEAfQRk2t_URQ3DFROkMLFnshERoqKII5kHs8sVynK5l8m4qqfcDj0rJiHO76kYgkA0GzTVG5bCOXyH1w4pbg4gyFgWubJuGbBfPnLlY1fbnKiYIna24ZrG_1aZLm6tANg2009WPMNT0v40G6dBOyp23-vWkEZa5tuFrLbEO4g4Fuk8zQH4jaLLtWRskxKdF8U7R-AgnZuItTTd6GjmcvaB-sDf32UCcT0M4vFtKm9GCt4-lwcDYj-3uw' }} style={styles.profileImg} />
            </View>
        </View>

        <View style={styles.searchContainer}>
            <Search size={20} color="#FFCA0D" style={styles.searchIcon} />
            <TextInput
                style={[styles.searchInput, { backgroundColor: isDark ? 'rgba(26, 26, 26, 0.5)' : '#F1F5F9', color: isDark ? '#FFFFFF' : '#000000', borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#E2E8F0' }]}
                placeholder="Search courses..."
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomDockOffset + 72 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFCA0D" />}
      >
        {loading && !refreshing ? (
            <ActivityIndicator color="#FFCA0D" style={{ marginTop: 40 }} />
        ) : (
            <View style={styles.courseList}>
                {filteredCourses.map((course) => (
                    <TouchableOpacity
                        key={course.id}
                        style={[styles.courseCard, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#FFFFFF', borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0' }]}
                        activeOpacity={0.9}
                        onPress={() => router.push({
                            pathname: '/(lecturer)/students',
                            params: { courseId: course.id, courseName: course.title, courseCode: course.code }
                        })}
                    >
                        <View style={styles.cardHeader}>
                            <View>
                                <View style={styles.codeTag}>
                                    <Text style={styles.codeTagText}>{course.code}</Text>
                                </View>
                                <Text style={[styles.courseTitle, { color: isDark ? '#FFFFFF' : colors.text }]}>{course.title}</Text>
                            </View>
                            <TouchableOpacity>
                                <MoreVertical size={20} color="rgba(255, 255, 255, 0.3)" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.attendanceSection}>
                            <View style={styles.attendanceHeader}>
                                <Text style={styles.attendanceLabel}>ATTENDANCE RATE</Text>
                                <Text style={styles.attendanceValue}>{course.attendance_percentage || 88}%</Text>
                            </View>
                            <View style={[styles.progressBg, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F1F5F9' }]}>
                                <View
                                    style={[
                                        styles.progressFill,
                                        { width: `${course.attendance_percentage || 88}%`, backgroundColor: '#FFCA0D' }
                                    ]}
                                />
                            </View>
                        </View>

                        <View style={styles.cardFooter}>
                            <View style={[styles.studentBadge, { backgroundColor: surfaceColor, borderColor: bgColor }]}>
                                <Text style={styles.studentBadgeText}>{course.enrolled_count || 128} Students</Text>
                            </View>
                            <Text style={styles.footerLabel}>Registered</Text>
                        </View>
                    </TouchableOpacity>
                ))}
                {!loading && filteredCourses.length === 0 && (
                    <Text style={styles.emptyText}>No courses found</Text>
                )}
            </View>
        )}
        <View style={{ height: bottomDockOffset + 24 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { bottom: bottomDockOffset + 16 }]}
        onPress={handleCreatePress}
      >
        <Plus size={32} color="#0A0A0A" strokeWidth={2.5} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
    zIndex: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: Fonts.lexend.bold,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: Fonts.lexend.regular,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 4,
  },
  profileImgContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
  },
  profileImg: {
    width: '100%',
    height: '100%',
  },
  searchContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  searchInput: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    paddingLeft: 52,
    paddingRight: 20,
    fontSize: 14,
    fontFamily: Fonts.lexend.medium,
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 160,
  },
  courseList: {
    paddingHorizontal: 24,
    gap: 20,
  },
  courseCard: {
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  codeTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 202, 13, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  codeTagText: {
    fontSize: 10,
    fontFamily: Fonts.lexend.bold,
    color: '#FFCA0D',
    letterSpacing: 1.5,
  },
  courseTitle: {
    fontSize: 20,
    fontFamily: Fonts.lexend.bold,
    lineHeight: 24,
    maxWidth: '90%',
  },
  attendanceSection: {
    marginBottom: 20,
  },
  attendanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  attendanceLabel: {
    fontSize: 10,
    fontFamily: Fonts.lexend.bold,
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 1,
  },
  attendanceValue: {
    fontSize: 14,
    fontFamily: Fonts.lexend.bold,
    color: '#FFCA0D',
  },
  progressBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  studentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
  },
  studentBadgeText: {
    fontSize: 9,
    fontFamily: Fonts.lexend.bold,
    color: '#FFFFFF',
  },
  footerLabel: {
    fontSize: 10,
    fontFamily: Fonts.lexend.medium,
    color: 'rgba(255, 255, 255, 0.4)',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: 'rgba(255, 255, 255, 0.4)',
    fontFamily: Fonts.lexend.medium,
  },
  fab: {
    position: 'absolute',
    bottom: 120,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: '#FFCA0D',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFCA0D',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  }
});
