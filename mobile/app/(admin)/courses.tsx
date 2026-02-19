import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { api } from '@/services/api';
import { LayoutGrid, Bell, Search, Calendar, Landmark, Grid, Filter, School, User, MoreVertical, Plus } from 'lucide-react-native';

export default function CourseDirectoryScreen() {
  const { colors, isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const response: any = await api.courses.list();
      setCourses(response.results || response);
    } catch (error) {
      console.error('Error loading courses:', error);
    }
  };

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
          <FilterChip icon={<Calendar size={14} color="#000" />} label="Fall 2023" active colors={colors} />
          <FilterChip icon={<Landmark size={14} color={colors.textSecondary} />} label="Main Campus" colors={colors} isDark={isDark} />
          <FilterChip icon={<Grid size={14} color={colors.textSecondary} />} label="All Faculties" colors={colors} isDark={isDark} />
          <FilterChip icon={<Filter size={14} color={colors.textSecondary} />} label="Filters" colors={colors} isDark={isDark} />
        </ScrollView>
      </View>

      <FlatList
        data={courses}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>ACTIVE COURSES (24)</Text>
            <TouchableOpacity>
              <Text style={[styles.viewAll, { color: colors.primary }]}>View All</Text>
            </TouchableOpacity>
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
                  {item.critical && <View style={styles.criticalDot} />}
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
                <Text style={[styles.metaText, { color: colors.textSecondary }]} numberOfLines={1}>{item.faculty}</Text>
              </View>
              <View style={styles.metaItem}>
                <User size={16} color={colors.textSecondary} />
                <Text style={[styles.metaText, { color: colors.textSecondary }]} numberOfLines={1}>{item.lecturer}</Text>
              </View>
            </View>

            <View style={styles.healthContainer}>
              <View style={styles.healthHeader}>
                <Text style={[styles.healthLabel, { color: colors.textSecondary }]}>
                  Attendance Health {item.critical ? '(Critical)' : ''}
                </Text>
                <Text style={[styles.healthValue, { color: item.critical ? '#EF4444' : colors.primary }]}>
                  {item.health}%
                </Text>
              </View>
              <View style={[styles.progressBg, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f0f0f0' }]}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${item.health}%`, backgroundColor: item.critical ? '#EF4444' : colors.primary },
                    !item.critical && { shadowColor: colors.primary, shadowOpacity: 0.4, shadowRadius: 4, shadowOffset: { width: 0, height: 0 } }
                  ]}
                />
              </View>
            </View>
          </View>
        )}
      />

      <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary }]}>
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
  viewAll: { fontSize: 12, fontWeight: '600' },
  courseCard: { padding: 16, borderRadius: 16, borderWidth: 1, gap: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  codeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  codeText: { fontSize: 10, fontWeight: '800' },
  criticalDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444' },
  courseTitle: { fontSize: 16, fontWeight: '700' },
  metaGrid: { flexDirection: 'row', gap: 12 },
  metaItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaText: { fontSize: 12, fontWeight: '500' },
  healthContainer: { gap: 8 },
  healthHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  healthLabel: { fontSize: 11, fontWeight: '600' },
  healthValue: { fontSize: 11, fontWeight: '700' },
  progressBg: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 5 }
});
