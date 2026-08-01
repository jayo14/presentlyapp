import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Dimensions, FlatList, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { ArrowLeft, Search, Bell, Star, Terminal, GraduationCap, Palette, CircleDollarSign, ChevronRight, PlusCircle, Brain, Bitcoin, Leaf } from 'lucide-react-native';
import Fonts from '@/constants/fonts';
import { useState, useEffect } from 'react';
import { api } from '@/services/api';

const { width } = Dimensions.get('window');

const POPULAR_ELECTIVES = [
    {
        id: '1',
        title: 'Digital Psychology',
        code: 'PSY302',
        credits: 3,
        tag: 'TOP RATED',
        icon: <Brain size={24} color="#f9c406" fill="rgba(249,196,6,0.1)" />,
    },
    {
        id: '2',
        title: 'Blockchain Systems',
        code: 'CS441',
        credits: 4,
        tag: 'LIMITED SLOTS',
        icon: <Bitcoin size={24} color="#f9c406" fill="rgba(249,196,6,0.1)" />,
    },
    {
        id: '3',
        title: 'Sustainable Urbanism',
        code: 'ARC209',
        credits: 3,
        tag: 'INTERDISCIPLINARY',
        icon: <Leaf size={24} color="#f9c406" fill="rgba(249,196,6,0.1)" />,
    },
];

export default function RegistrationHubScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Background and Card colors from design
  const bgColor = isDark ? '#0f0e0a' : colors.background;
  const cardColor = isDark ? '#1a1812' : '#FFFFFF';

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
        const data = await api.departments.list() as any;
        setDepartments(data.results || data);
    } catch (e) {
        console.error('Failed to load departments', e);
    } finally {
        setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
        router.push({
            pathname: '/(student)/courses/search',
            params: { q: searchQuery }
        });
    }
  };

  const getDeptIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('computer')) return <Terminal size={30} color="#f9c406" />;
    if (n.includes('engineer')) return <Image source={{ uri: 'https://img.icons8.com/material-outlined/48/f9c406/engineering.png' }} style={{width: 30, height: 30}} /> ; // Fallback
    if (n.includes('art') || n.includes('design')) return <Palette size={30} color="#f9c406" />;
    if (n.includes('business')) return <CircleDollarSign size={30} color="#f9c406" />;
    return <Terminal size={30} color="#f9c406" />;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace("/")} style={styles.backButton}>
                <ArrowLeft size={24} color={isDark ? "#FFFFFF" : colors.text} />
            </TouchableOpacity>
            <View>
                <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : colors.text }]}>Courses</Text>
                <Text style={[styles.headerSubtitle, { color: 'rgba(249, 196, 6, 0.7)' }]}>Academic Year 2023/24</Text>
            </View>
            <TouchableOpacity style={[styles.notifButton, { backgroundColor: cardColor }]}>
                <Bell size={24} color="#f9c406" />
            </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
            <Search size={22} color="#f9c406" style={styles.searchIcon} />
            <TextInput
                style={[styles.searchInput, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9', color: isDark ? '#FFFFFF' : '#000000' }]}
                placeholder="Search by code or title"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
            />
        </View>

        {/* Popular Electives */}
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleContainer}>
                    <Star size={20} color="#f9c406" fill="#f9c406" />
                    <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : colors.text }]}>Popular Electives</Text>
                </View>
                <TouchableOpacity>
                    <Text style={styles.viewAllText}>VIEW ALL</Text>
                </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
                {POPULAR_ELECTIVES.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        style={[styles.electiveCard, { backgroundColor: cardColor }]}
                        activeOpacity={0.9}
                        onPress={() => router.push(`/(student)/courses/search?code=${item.code}`)}
                    >
                        <View style={styles.electiveAddIcon}>
                            <PlusCircle size={20} color="#f9c406" />
                        </View>
                        <View style={styles.electiveIconBg}>
                            {item.icon}
                        </View>
                        <Text style={[styles.electiveTitle, { color: isDark ? '#FFFFFF' : colors.text }]}>{item.title}</Text>
                        <Text style={styles.electiveInfo}>{item.code} • {item.credits} Credits</Text>
                        <View style={[styles.tag, { backgroundColor: item.tag === 'TOP RATED' ? '#f9c406' : 'rgba(255,255,255,0.1)' }]}>
                            <Text style={[styles.tagText, { color: item.tag === 'TOP RATED' ? '#000000' : 'rgba(255,255,255,0.6)' }]}>{item.tag}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>

        {/* Departments */}
        <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : colors.text, marginLeft: 20, marginBottom: 16 }]}>Departments</Text>
            <View style={styles.deptList}>
                {loading ? (
                    <ActivityIndicator color="#f9c406" style={{ marginTop: 20 }} />
                ) : (
                    departments.map((dept) => (
                        <TouchableOpacity
                            key={dept.id}
                            style={[styles.deptItem, { backgroundColor: cardColor }]}
                            onPress={() => router.push(`/(student)/courses/department/${dept.id}`)}
                        >
                            <View style={styles.deptLeft}>
                                <View style={styles.deptIconContainer}>
                                    {getDeptIcon(dept.name)}
                                </View>
                                <View>
                                    <Text style={[styles.deptName, { color: isDark ? '#FFFFFF' : colors.text }]}>{dept.name}</Text>
                                    <Text style={styles.deptInfo}>{dept.active_courses_count || 12} Active Courses</Text>
                                </View>
                            </View>
                            <ChevronRight size={20} color="rgba(255,255,255,0.2)" />
                        </TouchableOpacity>
                    ))
                )}
            </View>
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: Fonts.lexend.bold,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: Fonts.lexend.medium,
    marginTop: 2,
  },
  notifButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    paddingHorizontal: 20,
    position: 'relative',
    marginBottom: 32,
  },
  searchIcon: {
    position: 'absolute',
    left: 36,
    top: 16,
    zIndex: 1,
  },
  searchInput: {
    height: 56,
    borderRadius: 16,
    paddingLeft: 52,
    paddingRight: 20,
    fontSize: 16,
    fontFamily: Fonts.lexend.regular,
    borderWidth: 2,
    borderColor: 'rgba(249, 196, 6, 0.2)',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: Fonts.lexend.bold,
  },
  viewAllText: {
    color: '#f9c406',
    fontSize: 12,
    fontFamily: Fonts.lexend.bold,
    letterSpacing: 1,
  },
  horizontalScroll: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  electiveCard: {
    width: 240,
    borderRadius: 24,
    padding: 20,
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    // shadow emulation
    shadowColor: '#f9c406',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  electiveAddIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    opacity: 0.4,
  },
  electiveIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(249, 196, 6, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  electiveTitle: {
    fontSize: 17,
    fontFamily: Fonts.lexend.bold,
    lineHeight: 22,
  },
  electiveInfo: {
    fontSize: 12,
    fontFamily: Fonts.lexend.medium,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 4,
  },
  tag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 16,
  },
  tagText: {
    fontSize: 10,
    fontFamily: Fonts.lexend.bold,
  },
  deptList: {
    paddingHorizontal: 20,
    gap: 16,
  },
  deptItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  deptLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  deptIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(249, 196, 6, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(249, 196, 6, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deptName: {
    fontSize: 18,
    fontFamily: Fonts.lexend.bold,
  },
  deptInfo: {
    fontSize: 14,
    fontFamily: Fonts.lexend.regular,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  }
});
