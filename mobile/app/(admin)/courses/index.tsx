import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { LayoutGrid, Bell, Search, Calendar, Landmark, Grid, School, User, MoreVertical, Plus } from 'lucide-react-native';
import { useCourses } from '@/hooks/useCourses';

export default function CourseDirectoryScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: coursesData, isLoading, refetch, isRefetching } = useCourses();

  const courses = (coursesData as any[]) || [];

  const filteredCourses = courses.filter(course =>
    course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  if (isLoading && !isRefetching) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : '#e0e0e0' }]}>
        <View style={styles.headerTop}>
          <View style={styles.headerTitleContainer}>
            <LayoutGrid size={24} color={colors.primary} />
            <Text style={[styles.title, { color: colors.text }]}>Course Directory</Text>
          </View>
          <TouchableOpacity style={[styles.iconButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f0f0f0' }]}>
            <Bell size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f0f0f0' }]}>
          <Search size={18} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search code, title, or faculty..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll} style={styles.filterSection}>
          <FilterChip icon={<Calendar size={14} color="#000" />} label="Semester" active colors={colors} />
          <FilterChip icon={<Landmark size={14} color={colors.textSecondary} />} label="Faculty" colors={colors} isDark={isDark} />
          <FilterChip icon={<Grid size={14} color={colors.textSecondary} />} label="All" colors={colors} isDark={isDark} />
        </ScrollView>
      </View>

      <FlatList
        data={filteredCourses}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListHeaderComponent={
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>AVAILABLE COURSES ({filteredCourses.length})</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.courseCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <View>
                <View style={styles.badgeRow}>
                  <View style={[styles.codeBadge, { backgroundColor: colors.primary + '1A' }]}>
                    <Text style={[styles.codeText, { color: colors.primary }]}>{item.code}</Text>
                  </View>
                </View>
                <Text style={[styles.courseTitle, { color: colors.text }]}>{item.title}</Text>
              </View>
              <TouchableOpacity>
                <MoreVertical size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.metaGrid}>
              <View style={styles.metaItem}>
                <School size={16} color={colors.textSecondary} />
                <Text style={[styles.metaText, { color: colors.textSecondary }]} numberOfLines={1}>{item.faculty_name || 'N/A'}</Text>
              </View>
              <View style={styles.metaItem}>
                <User size={16} color={colors.textSecondary} />
                <Text style={[styles.metaText, { color: colors.textSecondary }]} numberOfLines={1}>{item.lecturer_name || 'N/A'}</Text>
              </View>
            </View>
          </View>
        )}
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/(admin)/courses/create')}
      >
        <Plus size={32} color="#000" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function FilterChip({ icon, label, active, colors, isDark }: any) {
  return (
    <TouchableOpacity
      style={[
        styles.chip,
        active ? { backgroundColor: colors.primary } : { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f0f0f0', borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e0e0e0' }
      ]}
    >
      {icon}
      <Text style={[styles.chipText, { color: active ? '#000' : colors.textSecondary }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, borderBottomWidth: 1, gap: 16 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitleContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontSize: 20, fontWeight: '700', letterSpacing: -0.5 },
  iconButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  searchBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, height: 48, borderRadius: 12, gap: 10 },
  searchInput: { flex: 1, fontSize: 14 },
  filterSection: { marginHorizontal: -16 },
  filterScroll: { paddingHorizontal: 16, gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  chipText: { fontSize: 12, fontWeight: '600' },
  listContent: { padding: 16, gap: 16, paddingBottom: 100 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, paddingHorizontal: 4 },
  sectionTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  courseCard: { padding: 16, borderRadius: 16, borderWidth: 1, gap: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  codeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  codeText: { fontSize: 10, fontWeight: '800' },
  courseTitle: { fontSize: 16, fontWeight: '700' },
  metaGrid: { flexDirection: 'row', gap: 12 },
  metaItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaText: { fontSize: 12, fontWeight: '500' },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 5 }
});
