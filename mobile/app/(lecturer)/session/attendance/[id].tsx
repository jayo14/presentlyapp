import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Dimensions, ScrollView } from 'react-native';
import { useState, useCallback } from 'react';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { storage } from '@/utils/storage';
import { Session } from '@/types';
import { ChevronLeft, MoreVertical, Search, Share2 } from 'lucide-react-native';
import Fonts from '@/constants/fonts';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

const { width } = Dimensions.get('window');

export default function AttendanceRecordsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { colors, isDark } = useTheme();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const bottomDockOffset = tabBarHeight + insets.bottom;
  
  const [session, setSession] = useState<Session | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState<any[]>([]);

  const loadData = async () => {
    if (typeof id !== 'string') return;
    
    const sessions = await storage.getSessions();
    const foundSession = sessions.find(s => (s.uuid || s.id) === id);
    setSession(foundSession || null);

    // Simulated data matching Screen 2
    setStudents([
        { id: '1', name: 'John Doe', matric: 'A0123456X', percentage: 98, status: 'Excellent' },
        { id: '2', name: 'Jane Smith', matric: 'A0123457Y', percentage: 85, status: 'Good' },
        { id: '3', name: 'Michael Lee', matric: 'A0123458Z', percentage: 94, status: 'Excellent' },
        { id: '4', name: 'Sarah Chen', matric: 'A0123459W', percentage: 72, status: 'At Risk' },
        { id: '5', name: 'Robert Wong', matric: 'A0123460A', percentage: 91, status: 'Excellent' },
    ]);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [id])
  );

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.matric.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!session) return null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Top Navigation Bar */}
      <View style={[styles.header, { borderBottomColor: isDark ? '#4a4121' : '#E2E8F0' }]}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace("/")} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{session.courseCode} - {session.courseName}</Text>
        <TouchableOpacity style={styles.moreButton}>
          <MoreVertical size={24} color={isDark ? '#ccbf8e' : '#94A3B8'} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomDockOffset + 24 }]} showsVerticalScrollIndicator={false}>
        {/* Stats Section */}
        <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: isDark ? '#2d2714' : '#FFFFFF', borderColor: isDark ? '#6a5d2f' : '#E2E8F0' }]}>
                <Text style={[styles.statLabel, { color: isDark ? '#ccbf8e' : '#666666' }]}>Students Registered</Text>
                <Text style={[styles.statValue, { color: colors.text }]}>45</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: isDark ? '#2d2714' : '#FFFFFF', borderColor: isDark ? '#6a5d2f' : '#E2E8F0' }]}>
                <Text style={[styles.statLabel, { color: isDark ? '#ccbf8e' : '#666666' }]}>Avg Attendance</Text>
                <Text style={[styles.statValue, { color: colors.primary }]}>92%</Text>
            </View>
        </View>

        {/* Search Section */}
        <View style={styles.searchSection}>
            <View style={[styles.searchBar, { backgroundColor: isDark ? '#4a4121' : '#FFFFFF', borderColor: isDark ? 'transparent' : '#E2E8F0' }]}>
                <Search size={20} color={isDark ? '#ccbf8e' : '#94A3B8'} style={styles.searchIcon} />
                <TextInput
                    style={[styles.searchInput, { color: colors.text }]}
                    placeholder="Search students by name or matric number"
                    placeholderTextColor={isDark ? '#ccbf8e' : '#94A3B8'}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>
        </View>

        {/* Student List Header */}
        <View style={styles.listHeader}>
            <Text style={[styles.listHeaderText, { color: colors.text }]}>STUDENT LIST</Text>
            <Text style={[styles.listHeaderCount, { color: isDark ? '#ccbf8e' : '#666666' }]}>Showing {filteredStudents.length} students</Text>
        </View>

        {/* Student List */}
        <View style={styles.studentList}>
            {filteredStudents.map((student) => (
                <StudentItem key={student.id} student={student} colors={colors} isDark={isDark} />
            ))}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary }]}>
        <Share2 size={24} color="#231e0f" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function StudentItem({ student, colors, isDark }: any) {
    const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();
    const getStatusColor = (status: string) => {
        switch(status) {
            case 'Excellent': return '#10B981';
            case 'Good': return '#F59E0B';
            case 'At Risk': return '#EF4444';
            default: return colors.textSecondary;
        }
    };

    return (
        <TouchableOpacity style={[styles.studentItem, { borderBottomColor: isDark ? '#4a4121' : '#F1F5F9' }]}>
            <View style={styles.itemLeft}>
                <View style={[styles.avatar, { backgroundColor: colors.primary + '33' }]}>
                    <Text style={[styles.avatarText, { color: colors.primary }]}>{getInitials(student.name)}</Text>
                </View>
                <View>
                    <Text style={[styles.studentName, { color: colors.text }]}>{student.name}</Text>
                    <Text style={[styles.studentMatric, { color: isDark ? '#ccbf8e' : '#666666' }]}>{student.matric}</Text>
                </View>
            </View>
            <View style={styles.itemRight}>
                <Text style={[styles.studentPercentage, { color: colors.text }]}>{student.percentage}%</Text>
                <Text style={[styles.studentStatus, { color: getStatusColor(student.status) }]}>{student.status.toUpperCase()}</Text>
            </View>
        </TouchableOpacity>
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
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: Fonts.lexend.bold,
  },
  moreButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  statsRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  statCard: {
    flex: 1,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: Fonts.lexend.medium,
  },
  statValue: {
    fontSize: 24,
    fontFamily: Fonts.lexend.bold,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: Fonts.lexend.regular,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  listHeaderText: {
    fontSize: 12,
    fontFamily: Fonts.lexend.bold,
    letterSpacing: 1,
  },
  listHeaderCount: {
    fontSize: 11,
    fontFamily: Fonts.lexend.regular,
  },
  studentList: {
    // No gap, uses dividers
  },
  studentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 72,
    borderBottomWidth: 1,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontFamily: Fonts.lexend.bold,
  },
  studentName: {
    fontSize: 16,
    fontFamily: Fonts.lexend.medium,
  },
  studentMatric: {
    fontSize: 14,
    fontFamily: Fonts.lexend.regular,
  },
  itemRight: {
    alignItems: 'flex-end',
  },
  studentPercentage: {
    fontSize: 16,
    fontFamily: Fonts.lexend.bold,
  },
  studentStatus: {
    fontSize: 10,
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
    shadowColor: '#f9c406',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  }
});
