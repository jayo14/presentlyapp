import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { ArrowLeft, Search, SlidersHorizontal, Bookmark, User, PlusCircle, AlertCircle } from 'lucide-react-native';
import Fonts from '@/constants/fonts';
import { useState, useEffect } from 'react';
import { api } from '@/services/api';

export default function SearchResultsScreen() {
  const router = useRouter();
  const { q, code } = useLocalSearchParams();
  const { colors, isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState((q as string) || (code as string) || '');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const bgColor = isDark ? '#1a1608' : colors.background;
  const cardColor = isDark ? '#2c2614' : '#FFFFFF';

  useEffect(() => {
    performSearch();
  }, [q, code]);

  const performSearch = async () => {
    setLoading(true);
    try {
        const data = await api.courses.search(searchQuery);
        setResults(data.results || []);
    } catch (e) {
        console.error('Search failed', e);
    } finally {
        setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDark ? 'rgba(26, 22, 8, 0.95)' : 'rgba(248, 248, 245, 0.95)', borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : '#E2E8F0' }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={isDark ? '#FFFFFF' : '#111418'} />
        </TouchableOpacity>
        <View style={styles.searchBarContainer}>
            <Search size={18} color="#94A3B8" style={styles.searchIcon} />
            <TextInput
                style={[styles.searchInput, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9', color: isDark ? '#FFFFFF' : '#000000' }]}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={performSearch}
                placeholder="Search courses..."
                placeholderTextColor="#94A3B8"
            />
        </View>
        <TouchableOpacity style={styles.filterButton}>
            <SlidersHorizontal size={24} color={isDark ? '#FFFFFF' : '#111418'} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.resultsHeader}>
            <Text style={styles.resultsCount}>SEARCH RESULTS ({results.length})</Text>
            <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={styles.clearAll}>Clear all</Text>
            </TouchableOpacity>
        </View>

        {loading ? (
            <ActivityIndicator color="#f9c406" style={{ marginTop: 40 }} />
        ) : (
            <View style={styles.resultsList}>
                {results.map((course) => (
                    <View key={course.id} style={[styles.courseCard, { backgroundColor: cardColor, borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9' }]}>
                        <View style={styles.cardHeader}>
                            <View>
                                <Text style={styles.deptName}>{course.department_name?.split(',')[0].toUpperCase() || 'GENERAL'}</Text>
                                <View style={styles.titleRow}>
                                    <Text style={[styles.courseCode, { backgroundColor: 'rgba(249, 196, 6, 0.2)' }]}>
                                        {course.code.substring(0, 4)}
                                    </Text>
                                    <Text style={[styles.courseTitle, { color: isDark ? '#FFFFFF' : colors.text }]}>
                                        {course.code.substring(4)}: {course.title}
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity style={[styles.bookmarkBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC' }]}>
                                <Bookmark size={20} color="#94A3B8" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.instructorRow}>
                            <View style={[styles.avatar, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0' }]}>
                                <User size={20} color="#94A3B8" />
                            </View>
                            <Text style={styles.instructorName}>{course.lecturer_name || 'Dr. Alexander Wright'}</Text>
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

                {searchQuery.toLowerCase() === 'cs40' && (
                     <View style={styles.errorBanner}>
                        <View style={styles.errorIconContainer}>
                            <AlertCircle size={20} color="#EF4444" />
                        </View>
                        <View style={styles.errorTextContainer}>
                            <Text style={styles.errorTitle}>Invalid course code</Text>
                            <Text style={styles.errorDesc}>The code "CS40" is not a direct entry code. Please select a specific section from the results above or check your code again.</Text>
                        </View>
                    </View>
                )}
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
  filterButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  resultsCount: {
    fontSize: 12,
    fontFamily: Fonts.lexend.bold,
    color: '#94A3B8',
    letterSpacing: 1.5,
  },
  clearAll: {
    fontSize: 11,
    fontFamily: Fonts.lexend.medium,
    color: '#f9c406',
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
  },
  bookmarkBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  errorBanner: {
    marginTop: 16,
    padding: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    flexDirection: 'row',
    gap: 16,
  },
  errorIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  errorTextContainer: {
    flex: 1,
  },
  errorTitle: {
    fontSize: 15,
    fontFamily: Fonts.lexend.bold,
    color: '#EF4444',
    marginBottom: 2,
  },
  errorDesc: {
    fontSize: 12,
    fontFamily: Fonts.lexend.regular,
    color: 'rgba(239, 68, 68, 0.8)',
    lineHeight: 18,
  }
});
