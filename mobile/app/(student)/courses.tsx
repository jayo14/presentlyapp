import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Dimensions, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Plus, QrCode } from 'lucide-react-native';
import Fonts from '@/constants/fonts';
import { useState, useEffect } from 'react';
import { api } from '@/services/api';

const { width } = Dimensions.get('window');

export default function StudentCoursesScreen() {
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

        const data: any = await api.courses.getMyCourses();
        setCourses(data.courses || data.results || (Array.isArray(data) ? data : []));
    } catch (e) {
        const status = (e as any)?.response?.status;
        if (status === 401 && allowRetry) {
          const refreshed = await refreshSession();
          if (refreshed.success) {
            return loadCourses(false);
          }
          return;
        }

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
    if (authLoading) return;
    setRefreshing(true);
    await loadCourses();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Top App Bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Courses</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <View style={styles.courseList}>
          {loading && !refreshing ? (
              <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
          ) : (
              courses.map((course) => (
                <CourseItem
                    key={course.id}
                    title={course.name}
                    code={course.code}
                    instructor={course.instructor || course.lecturer_name}
                    percentage={course.percentage || 0}
                    status={course.status || (course.attendance >= 80 ? 'Active' : (course.attendance >= 60 ? 'Warning' : 'Low'))}
                    image={course.image || "https://lh3.googleusercontent.com/aida-public/AB6AXuAj31ikpQevVxSA6PeFETfug4QbDzNaS0614HFHBTD4ReuZoZ-hVoH84N2GI1XWKBQfCcJsNLaW23zcYBJwSmereyts0fJCyPIYu9DmwkybTWa9XR7NYe2BsMUpsuT8k31ImBUzfBCT2wCMDhpYAy8uJeiWcg74RByycS1GG_k0FooYWghVGoa7shzapkrRF49W-E3GK2aKWDJ67bazSMOmIWY4bA6E4BbLRqmIROtCgdiI65tlpjOjU4EKM-rbZrtiyK9Nw1U5ZAf5"}
                    colors={colors}
                    isDark={isDark}
                />
              ))
          )}
          {!loading && courses.length === 0 && (
              <Text style={{ textAlign: 'center', marginTop: 40, color: colors.textSecondary, fontFamily: Fonts.lexend.medium }}>No courses found</Text>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/(student)/courses/register')}
        activeOpacity={0.8}
      >
        <Plus size={32} color="#231e0f" strokeWidth={2.5} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function CourseItem({ title, code, instructor, percentage, status, image, colors, isDark }: any) {
    const statusType = status.toLowerCase();

    const getStatusColors = () => {
        switch(statusType) {
            case 'active': return { bg: isDark ? 'rgba(16,185,129,0.1)' : '#D1FAE5', text: isDark ? '#10B981' : '#047857' };
            case 'warning': return { bg: isDark ? 'rgba(249,196,6,0.1)' : '#FEF3C7', text: isDark ? '#f9c406' : '#B45309' };
            case 'low': return { bg: isDark ? 'rgba(239,68,68,0.1)' : '#FEE2E2', text: isDark ? '#EF4444' : '#B91C1C' };
            default: return { bg: '#F1F5F9', text: '#475569' };
        }
    };

    const sColors = getStatusColors();

    return (
        <View style={[styles.card, { backgroundColor: isDark ? '#2d281a' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#E2E8F0' }]}>
            <View style={styles.cardContent}>
                <Image source={{ uri: image }} style={styles.courseImage} />
                <View style={styles.cardInfo}>
                    <View style={styles.titleRow}>
                        <Text style={[styles.courseTitle, { color: colors.text }]} numberOfLines={1}>{title}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: sColors.bg }]}>
                            <Text style={[styles.statusText, { color: sColors.text }]}>{status}</Text>
                        </View>
                    </View>
                    <Text style={[styles.courseSubtitle, { color: isDark ? '#ccbf8e' : '#666666' }]}>
                        {code} • {instructor || 'Prof. Unknown'}
                    </Text>
                </View>
            </View>

            <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                    <Text style={[styles.progressLabel, { color: isDark ? '#ccbf8e' : '#666666' }]}>Attendance</Text>
                    <Text style={[styles.progressValue, { color: colors.text }]}>{percentage}%</Text>
                </View>
                <View style={[styles.progressBarBg, { backgroundColor: isDark ? '#4a4225' : '#F1F5F9' }]}>
                    <View style={[styles.progressBarFill, {
                        width: `${percentage}%`,
                        backgroundColor: statusType === 'low' ? '#EF4444' : colors.primary
                    }]} />
                </View>
            </View>
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
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: Fonts.lexend.bold,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 100,
  },
  courseList: {
    gap: 12,
  },
  card: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    gap: 16,
  },
  courseImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
  },
  cardInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  courseTitle: {
    fontSize: 16,
    fontFamily: Fonts.lexend.bold,
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontFamily: Fonts.lexend.bold,
  },
  courseSubtitle: {
    fontSize: 13,
    fontFamily: Fonts.lexend.regular,
  },
  progressSection: {
    marginTop: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 11,
    fontFamily: Fonts.lexend.medium,
  },
  progressValue: {
    fontSize: 13,
    fontFamily: Fonts.lexend.bold,
  },
  progressBarBg: {
    height: 8,
    width: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
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
