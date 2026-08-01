import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { ArrowLeft, Search, School, Calendar, Layers, CheckCircle2, PlusCircle } from 'lucide-react-native';
import Fonts from '@/constants/fonts';
import { useState, useEffect } from 'react';
import { api } from '@/services/api';

export default function DepartmentCoursesScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { colors, isDark } = useTheme();
  const [courses, setCourses] = useState<any[]>([]);
  const [departmentName, setDepartmentName] = useState('Department');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const bgColor = isDark ? '#231e0f' : colors.background;
  const cardColor = isDark ? '#2c2614' : '#FFFFFF';

  useEffect(() => {
    loadDepartmentCourses();
  }, [id]);

  const loadDepartmentCourses = async () => {
    try {
        const data = await api.departments.getCourses(id as string) as any;
        setCourses(data.courses || []);
        setDepartmentName(data.department || 'Department');
    } catch (e) {
        console.error('Failed to load department courses', e);
    } finally {
        setLoading(false);
    }
  };

  const filteredCourses = courses.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : '#E2E8F0' }]}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace("/")} style={styles.backButton}>
            <ArrowLeft size={24} color={isDark ? '#FFFFFF' : '#111418'} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
            <Text style={styles.deptLabel}>DEPARTMENT</Text>
            <Text style={[styles.deptName, { color: isDark ? '#FFFFFF' : colors.text }]}>{departmentName}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.contentHeader}>
            <View style={styles.titleRow}>
                <School size={24} color="#f9c406" fill="rgba(249,196,6,0.2)" />
                <Text style={[styles.title, { color: isDark ? '#FFFFFF' : colors.text }]}>Available Courses</Text>
            </View>
            <Text style={styles.subtitle}>Select courses to add to your semester registration.</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
            <Search size={20} color={isDark ? '#666666' : '#94A3B8'} style={styles.searchIcon} />
            <TextInput
                style={[styles.searchInput, { backgroundColor: isDark ? '#2c2614' : '#F1F5F9', color: isDark ? '#FFFFFF' : '#000000' }]}
                placeholder="Search by course code or name..."
                placeholderTextColor={isDark ? '#555555' : '#94A3B8'}
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
        </View>

        {loading ? (
            <ActivityIndicator color="#f9c406" style={{ marginTop: 40 }} />
        ) : (
            <View style={styles.courseList}>
                {filteredCourses.map((course) => (
                    <TouchableOpacity
                        key={course.id}
                        style={[styles.courseCard, { backgroundColor: cardColor, borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9' }]}
                        activeOpacity={0.8}
                        onPress={() => router.push(`/(student)/courses/${course.id}`)}
                    >
                        <View style={styles.cardLeft}>
                            <View style={styles.codeRow}>
                                <View style={[styles.codeBadge, { backgroundColor: course.is_enrolled ? 'rgba(249, 196, 6, 0.1)' : (isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9') }]}>
                                    <Text style={[styles.codeText, { color: course.is_enrolled ? '#f9c406' : (isDark ? '#94A3B8' : '#666666') }]}>{course.code}</Text>
                                </View>
                                <Text style={styles.creditsText}>• {course.credit_units} Credits</Text>
                            </View>
                            <Text style={[styles.courseTitle, { color: isDark ? '#FFFFFF' : colors.text }]}>{course.title}</Text>
                            <View style={styles.metaRow}>
                                <View style={styles.metaItem}>
                                    <Calendar size={12} color="#94A3B8" />
                                    <Text style={styles.metaText}>{course.semester === 'FIRST' ? '1st' : '2nd'} Semester</Text>
                                </View>
                                <View style={styles.metaItem}>
                                    <Layers size={12} color="#94A3B8" />
                                    <Text style={styles.metaText}>{course.level} Level</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.cardRight}>
                            {course.is_enrolled ? (
                                <View style={[styles.statusBadge, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#F0FDF4', borderColor: isDark ? 'rgba(16, 185, 129, 0.2)' : '#BBF7D0' }]}>
                                    <CheckCircle2 size={16} color={isDark ? '#10B981' : '#166534'} />
                                    <Text style={[styles.statusText, { color: isDark ? '#10B981' : '#166534' }]}>Registered</Text>
                                </View>
                            ) : (
                                <View style={[styles.registerBadge, { backgroundColor: 'rgba(249, 196, 6, 0.1)', borderColor: 'rgba(249, 196, 6, 0.2)' }]}>
                                    <PlusCircle size={16} color="#f9c406" />
                                    <Text style={styles.registerText}>Register</Text>
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  deptLabel: {
    fontSize: 10,
    fontFamily: Fonts.lexend.bold,
    color: '#f9c406',
    letterSpacing: 2,
  },
  deptName: {
    fontSize: 18,
    fontFamily: Fonts.lexend.bold,
    letterSpacing: -0.5,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  contentHeader: {
    marginBottom: 24,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  title: {
    fontSize: 26,
    fontFamily: Fonts.lexend.bold,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: Fonts.lexend.regular,
    color: '#94A3B8',
  },
  searchContainer: {
    position: 'relative',
    marginBottom: 24,
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
    paddingLeft: 48,
    paddingRight: 20,
    fontSize: 14,
    fontFamily: Fonts.lexend.medium,
  },
  courseList: {
    gap: 16,
  },
  courseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardLeft: {
    flex: 1,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  codeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  codeText: {
    fontSize: 10,
    fontFamily: Fonts.lexend.bold,
    letterSpacing: 1,
  },
  creditsText: {
    fontSize: 12,
    fontFamily: Fonts.lexend.medium,
    color: '#94A3B8',
    marginLeft: 8,
  },
  courseTitle: {
    fontSize: 17,
    fontFamily: Fonts.lexend.bold,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    fontFamily: Fonts.lexend.semiBold,
    color: '#94A3B8',
  },
  cardRight: {
    marginLeft: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontFamily: Fonts.lexend.bold,
  },
  registerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  registerText: {
    fontSize: 11,
    fontFamily: Fonts.lexend.bold,
    color: '#f9c406',
  }
});
