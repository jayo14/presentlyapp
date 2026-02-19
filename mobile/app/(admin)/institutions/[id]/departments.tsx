import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { api } from '@/services/api';
import { Plus, Search, MoreVertical, User, Users, Book, ChevronLeft } from 'lucide-react-native';

export default function DepartmentDirectoryScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { colors, isDark } = useTheme();
  const [selectedFaculty, setSelectedFaculty] = useState('All');
  const [departments, setDepartments] = useState<any[]>([]);

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const response: any = await api.departments.list();
      setDepartments(response.results || response);
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Departments</Text>
          <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.primary }]}>
            <Plus size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchBar, { backgroundColor: isDark ? colors.primary + '1A' : '#f0f0f0' }]}>
          <Search size={20} color={isDark ? colors.primary + '99' : '#888'} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search by name or HOD..."
            placeholderTextColor={isDark ? colors.primary + '66' : '#888'}
          />
        </View>

        {/* Faculty Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll} style={styles.filterSection}>
          {['All', 'Engineering', 'Business', 'Medicine', 'Humanities'].map(faculty => (
            <TouchableOpacity
              key={faculty}
              style={[
                styles.filterChip,
                selectedFaculty === faculty ? { backgroundColor: colors.primary } : { backgroundColor: isDark ? colors.primary + '1A' : '#f0f0f0' }
              ]}
              onPress={() => setSelectedFaculty(faculty)}
            >
              <Text style={[
                styles.filterChipText,
                { color: selectedFaculty === faculty ? '#000' : (isDark ? colors.primary + 'CC' : '#666') }
              ]}>{faculty}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={departments}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={[styles.deptCard, { backgroundColor: isDark ? colors.primary + '0D' : '#fff', borderColor: isDark ? colors.primary + '1A' : '#eee' }]}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={[styles.facultyName, { color: colors.primary }]}>{(item.college_name || 'COLLEGE').toUpperCase()}</Text>
                <Text style={[styles.deptName, { color: colors.text }]}>{item.name}</Text>
              </View>
              <TouchableOpacity>
                <MoreVertical size={20} color={isDark ? colors.primary + '66' : '#888'} />
              </TouchableOpacity>
            </View>

            <View style={styles.hodRow}>
              <User size={18} color={isDark ? colors.primary + 'B3' : '#666'} />
              <Text style={[styles.hodName, { color: isDark ? colors.primary + 'B3' : '#666' }]}>HOD: {item.head_of_department_name || 'N/A'}</Text>
            </View>

            <View style={[styles.cardFooter, { borderTopColor: isDark ? colors.primary + '1A' : '#f0f0f0' }]}>
              <View style={styles.statItem}>
                <Users size={16} color={colors.primary} />
                <Text style={[styles.statText, { color: isDark ? colors.primary + '99' : '#888' }]}>{item.students_count || 0} Students</Text>
              </View>
              <View style={styles.statItem}>
                <Book size={16} color={colors.primary} />
                <Text style={[styles.statText, { color: isDark ? colors.primary + '99' : '#888' }]}>{item.courses_count || 0} Courses</Text>
              </View>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, gap: 16 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginLeft: -12 },
  title: { fontSize: 32, fontWeight: '700', letterSpacing: -1, flex: 1, marginLeft: 8 },
  addButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  searchBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, height: 48, borderRadius: 12, gap: 10 },
  searchInput: { flex: 1, fontSize: 14 },
  filterSection: { marginHorizontal: -16 },
  filterScroll: { paddingHorizontal: 16, gap: 8 },
  filterChip: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
  filterChipText: { fontSize: 14, fontWeight: '600' },
  listContent: { padding: 16, gap: 16, paddingBottom: 40 },
  deptCard: { padding: 20, borderRadius: 20, borderWidth: 1, gap: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  facultyName: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  deptName: { fontSize: 18, fontWeight: '700', marginTop: 2 },
  hodRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  hodName: { fontSize: 14, fontWeight: '500' },
  cardFooter: { flexDirection: 'row', gap: 16, paddingTop: 12, borderTopWidth: 1 },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statText: { fontSize: 12, fontWeight: '600' }
});
