import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { api } from '@/services/api';
import { ChevronLeft, MoreHorizontal, Search, ChevronRight, Plus, Landmark } from 'lucide-react-native';
import { useEffect, useState } from 'react';

export default function FacultiesManagementScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [faculties, setFaculties] = useState<any[]>([]);

  useEffect(() => {
    loadFaculties();
  }, []);

  const loadFaculties = async () => {
    try {
      const response: any = await api.colleges.list();
      setFaculties(response.results || response);
    } catch (error) {
      console.error('Error loading faculties:', error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.canGoBack() ? router.back() : router.replace("/")}>
            <ChevronLeft size={28} color={colors.primary} />
            <Text style={[styles.backText, { color: colors.primary }]}>Institutions</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <MoreHorizontal size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.institutionName, { color: isDark ? '#cbbc90' : '#888' }]}>University of Technology</Text>
          <Text style={[styles.title, { color: colors.text }]}>Faculties</Text>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f0f0f0' }]}>
          <Search size={20} color={isDark ? '#cbbc90' : '#888'} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search faculties..."
            placeholderTextColor={isDark ? '#cbbc90' : '#888'}
          />
        </View>
      </View>

      <FlatList
        data={faculties}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.facultyCard, { backgroundColor: colors.cardBg, borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#eee' }]}>
            <View style={styles.facultyMain}>
              <View style={[styles.iconBox, { backgroundColor: colors.primary + '1A' }]}>
                <Landmark size={24} color={colors.primary} />
              </View>
              <View>
                <Text style={[styles.facultyName, { color: colors.text }]}>{item.name}</Text>
                <Text style={[styles.facultyMeta, { color: isDark ? '#cbbc90' : '#888' }]}>
                  {item.departments_count || 0} Departments • {item.users_count || 0} Users
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color={isDark ? '#333' : '#ddd'} />
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary }]}>
        <Plus size={32} color="#000" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, gap: 16 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backButton: { flexDirection: 'row', alignItems: 'center', marginLeft: -8 },
  backText: { fontSize: 14, fontWeight: '500' },
  headerTitleContainer: { marginTop: 8 },
  institutionName: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  title: { fontSize: 32, fontWeight: '700', letterSpacing: -1, marginTop: 4 },
  searchBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, height: 48, borderRadius: 12, gap: 10, marginTop: 8 },
  searchInput: { flex: 1, fontSize: 14 },
  listContent: { padding: 16, gap: 12, paddingBottom: 100 },
  facultyCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 16, borderWidth: 1 },
  facultyMain: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  iconBox: { width: 48, height: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  facultyName: { fontSize: 16, fontWeight: '600' },
  facultyMeta: { fontSize: 14, marginTop: 2 },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 5 }
});
