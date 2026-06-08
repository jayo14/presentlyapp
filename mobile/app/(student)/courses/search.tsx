import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { ArrowLeft, Search, SlidersHorizontal, Bookmark, User, PlusCircle, AlertCircle, Building2, GraduationCap, ChevronRight } from 'lucide-react-native';
import Fonts from '@/constants/fonts';
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

export default function SearchResultsScreen() {
  const router = useRouter();
  const { q, code } = useLocalSearchParams();
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState((q as string) || (code as string) || '');
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const bgColor = isDark ? '#1a1608' : colors.background;
  const cardColor = isDark ? '#2c2614' : '#FFFFFF';

  const performSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setHasSearched(true);
    try {
        const institutionId = user?.institutionId;

        // Search courses
        const courseData = await api.courses.list({ search: searchQuery, institution: institutionId }).catch(() => ({ results: [] }));

        setCourses(courseData.results || courseData || []);
    } catch (e) {
        console.error('Search failed', e);
    } finally {
        setLoading(false);
    }
  }, [searchQuery, user]);

  useEffect(() => {
    if (q || code) {
        performSearch();
    }
  }, [q, code]);

  const totalResults = courses.length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDark ? 'rgba(26, 22, 8, 0.95)' : 'rgba(248, 248, 245, 0.95)', borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : '#E2E8F0' }]}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace("/")} style={styles.backButton}>
            <ArrowLeft size={24} color={isDark ? '#FFFFFF' : '#111418'} />
        </TouchableOpacity>
        <View style={styles.searchBarContainer}>
            <Search size={18} color="#94A3B8" style={styles.searchIcon} />
            <TextInput
                style={[styles.searchInput, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9', color: isDark ? '#FFFFFF' : '#000000' }]}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={performSearch}
                placeholder="Search courses, depts, faculties..."
                placeholderTextColor="#94A3B8"
                autoFocus={!q && !code}
            />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {loading ? (
            <View style={styles.centerContainer}>
                <ActivityIndicator color="#f9c406" size="large" />
                <Text style={[styles.loadingText, { color: isDark ? '#ccbf8e' : '#666666' }]}>Searching institution database...</Text>
            </View>
        ) : !hasSearched ? (
            <View style={styles.emptyState}>
                <View style={styles.emptyIconBg}>
                    <Search size={64} color="#f9c406" opacity={0.5} />
                </View>
                <Text style={[styles.emptyTitle, { color: isDark ? '#FFFFFF' : colors.text }]}>Discover Your Courses</Text>
                <Text style={[styles.emptyDesc, { color: isDark ? '#ccbf8e' : '#666666' }]}>Enter a course code, department name, or faculty to explore available offerings.</Text>
            </View>
        ) : totalResults === 0 ? (
            <View style={styles.emptyState}>
                <View style={[styles.emptyIconBg, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                    <AlertCircle size={64} color="#EF4444" opacity={0.5} />
                </View>
                <Text style={[styles.emptyTitle, { color: isDark ? '#FFFFFF' : colors.text }]}>No Results Found</Text>
                <Text style={[styles.emptyDesc, { color: isDark ? '#ccbf8e' : '#666666' }]}>We couldn't find anything matching "{searchQuery}" in your institution.</Text>
                <TouchableOpacity style={styles.clearBtn} onPress={() => { setSearchQuery(''); setHasSearched(false); }}>
                    <Text style={styles.clearBtnText}>Clear Search</Text>
                </TouchableOpacity>
            </View>
        ) : (
            <>
                <View style={styles.resultsHeader}>
                    <Text style={styles.resultsCount}>FOUND {totalResults} RESULTS</Text>
                </View>

                {courses.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>COURSES</Text>
                        <View style={styles.resultsList}>
                            {courses.map((course) => (
                                <View key={course.id} style={[styles.courseCard, { backgroundColor: cardColor, borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9' }]}>
                                    <View style={styles.cardHeader}>
                                        <View>
                                            <Text style={styles.deptName}>{course.department_name?.split(',')[0].toUpperCase() || 'GENERAL'}</Text>
                                            <View style={styles.titleRow}>
                                                <Text style={[styles.courseCode, { backgroundColor: 'rgba(249, 196, 6, 0.2)' }]}>
                                                    {course.code}
                                                </Text>
                                                <Text style={[styles.courseTitle, { color: isDark ? '#FFFFFF' : colors.text }]} numberOfLines={1}>
                                                    : {course.title}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>

                                    <View style={styles.instructorRow}>
                                        <View style={[styles.avatar, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0' }]}>
                                            <User size={20} color="#94A3B8" />
                                        </View>
                                        <Text style={styles.instructorName}>{course.lecturer_name || 'Departmental Lecturer'}</Text>
                                    </View>

                                    <TouchableOpacity
                                        style={styles.enrollBtn}
                                        onPress={() => router.push(`/(student)/courses/${course.id}`)}
                                    >
                                        <Text style={styles.enrollBtnText}>Enroll Now</Text>
                                        <PlusCircle size={18} color="#1a1608" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    </View>
                )}
            </>
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
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  searchBarContainer: {
    flex: 1,
    marginHorizontal: 8,
    position: 'relative',
    justifyContent: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  searchInput: {
    height: 40,
    borderRadius: 12,
    paddingLeft: 40,
    paddingRight: 16,
    fontSize: 14,
    fontFamily: Fonts.lexend.medium,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  centerContainer: {
    marginTop: 100,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    fontFamily: Fonts.lexend.medium,
  },
  emptyState: {
    marginTop: 80,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconBg: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(249, 196, 6, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: Fonts.lexend.bold,
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyState: {
    marginTop: 80,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyDesc: {
    fontSize: 14,
    fontFamily: Fonts.lexend.regular,
    textAlign: 'center',
    lineHeight: 22,
  },
  clearBtn: {
    marginTop: 24,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(249, 196, 6, 0.1)',
  },
  clearBtnText: {
    color: '#f9c406',
    fontFamily: Fonts.lexend.bold,
    fontSize: 14,
  },
  resultsHeader: {
    marginBottom: 24,
  },
  resultsCount: {
    fontSize: 12,
    fontFamily: Fonts.lexend.bold,
    color: '#94A3B8',
    letterSpacing: 1.5,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: Fonts.lexend.bold,
    color: '#f9c406',
    letterSpacing: 1,
    marginBottom: 16,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(249, 196, 6, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontFamily: Fonts.lexend.bold,
  },
  itemSubtitle: {
    fontSize: 12,
    fontFamily: Fonts.lexend.medium,
    color: '#94A3B8',
    marginTop: 2,
  },
  resultsList: {
    gap: 20,
  },
  courseCard: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  deptName: {
    fontSize: 11,
    fontFamily: Fonts.lexend.bold,
    color: '#f9c406',
    letterSpacing: 1,
    marginBottom: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  courseCode: {
    fontSize: 18,
    fontFamily: Fonts.lexend.bold,
    color: '#f9c406',
    paddingHorizontal: 2,
    borderRadius: 4,
  },
  courseTitle: {
    fontSize: 18,
    fontFamily: Fonts.lexend.bold,
    marginLeft: 2,
    flex: 1,
  },
  instructorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  instructorName: {
    fontSize: 14,
    fontFamily: Fonts.lexend.medium,
    color: '#94A3B8',
  },
  enrollBtn: {
    height: 52,
    backgroundColor: '#f9c406',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  enrollBtnText: {
    fontSize: 16,
    fontFamily: Fonts.lexend.bold,
    color: '#1a1608',
  }
});
