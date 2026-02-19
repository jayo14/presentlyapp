import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { api } from '@/services/api';
import { Share, Search, AlertCircle, AlertTriangle, Info, ChevronRight, User, Filter, Calendar } from 'lucide-react-native';

export default function AuditLogsScreen() {
  const { colors, isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const response: any = await api.system.getLogs();
      setLogs(response.results || response);
    } catch (error) {
      console.error('Error loading logs:', error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: isDark ? 'rgba(255,255,255,0.1)' : '#e0e0e0', borderBottomWidth: 1 }]}>
        <View style={styles.headerTop}>
          <Text style={[styles.title, { color: colors.text }]}>System Audit Logs</Text>
          <TouchableOpacity style={styles.iconButton}>
            <Share size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f0f0f0' }]}>
          <Search size={18} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search actions, users, or IDs..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll} style={styles.filterSection}>
          <TouchableOpacity style={[styles.filterChip, { backgroundColor: colors.primary }]}>
            <Text style={styles.filterChipTextActive}>All Severities</Text>
            <ChevronRight size={14} color="#000" style={{ transform: [{ rotate: '90deg' }] }} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.filterChip, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f0f0f0', borderWidth: 1, borderColor: isDark ? colors.border : '#e0e0e0' }]}>
            <Text style={[styles.filterChipText, { color: colors.textSecondary }]}>Last 24 Hours</Text>
            <Calendar size={14} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.filterChip, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f0f0f0', borderWidth: 1, borderColor: isDark ? colors.border : '#e0e0e0' }]}>
            <Text style={[styles.filterChipText, { color: colors.textSecondary }]}>Critical Only</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <FlatList
        data={logs}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.feedHeader}>
            <Text style={[styles.feedHeaderTitle, { color: colors.textSecondary }]}>CHRONOLOGICAL FEED</Text>
            <Text style={[styles.feedCount, { color: colors.textSecondary }]}>128 events found</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.logCard,
              { backgroundColor: item.active ? (isDark ? colors.primary + '1A' : colors.primary + '0D') : (isDark ? 'rgba(255,255,255,0.03)' : '#f9f9f9') },
              { borderLeftColor: getSeverityColor(item.severity), borderLeftWidth: 4 },
              item.active && { borderColor: colors.primary + '33', borderWidth: 1, borderLeftWidth: 4 }
            ]}
          >
            <View style={[styles.iconBox, { backgroundColor: getSeverityColor(item.severity) + '1A' }]}>
              {getSeverityIcon(item.severity)}
            </View>
            <View style={styles.logContent}>
              <View style={styles.logTopLine}>
                <Text style={[styles.logTitle, { color: item.active ? colors.primary : colors.text }]} numberOfLines={1}>{item.title}</Text>
                <Text style={[styles.logTime, { color: item.active ? colors.primary : colors.textSecondary }]}>{item.time}</Text>
              </View>
              <View style={styles.logMeta}>
                <User size={12} color={item.active ? colors.primary : colors.textSecondary} />
                <Text style={[styles.logMetaText, { color: item.active ? colors.primary : colors.textSecondary }]}>{item.user}</Text>
                <Text style={[styles.logMetaDivider, { color: colors.textSecondary }]}>•</Text>
                <Text style={[styles.logMetaText, { color: item.active ? colors.primary : colors.textSecondary }]}>{item.service}</Text>
              </View>
            </View>
            <ChevronRight size={18} color={item.active ? colors.primary : colors.textSecondary} />
          </View>
        )}
        ListFooterComponent={
          <TouchableOpacity style={[styles.loadMoreButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f0f0f0', borderColor: colors.border }]}>
            <Text style={[styles.loadMoreText, { color: colors.textSecondary }]}>Load More History</Text>
          </TouchableOpacity>
        }
      />

      <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary }]}>
        <Filter size={24} color="#000" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function getSeverityIcon(severity: string) {
  switch (severity) {
    case 'critical': return <AlertCircle size={20} color="#FF4B4B" />;
    case 'warning': return <AlertTriangle size={20} color="#FFD700" />;
    case 'info': return <Info size={20} color="#f2b90d" />;
    default: return <Info size={20} color="#f2b90d" />;
  }
}

function getSeverityColor(severity: string) {
  switch (severity) {
    case 'critical': return '#FF4B4B';
    case 'warning': return '#FFD700';
    case 'info': return '#f2b90d';
    default: return '#f2b90d';
  }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, gap: 16 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', letterSpacing: -0.5 },
  iconButton: { padding: 8 },
  searchBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, height: 48, borderRadius: 12, gap: 10 },
  searchInput: { flex: 1, fontSize: 14 },
  filterSection: { marginHorizontal: -16 },
  filterScroll: { paddingHorizontal: 16, gap: 8 },
  filterChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  filterChipTextActive: { fontSize: 12, fontWeight: '700', color: '#000' },
  filterChipText: { fontSize: 12, fontWeight: '600' },
  listContent: { padding: 16, gap: 8, paddingBottom: 100 },
  feedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingHorizontal: 4 },
  feedHeaderTitle: { fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  feedCount: { fontSize: 11, fontWeight: '500' },
  logCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 8, gap: 12 },
  iconBox: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  logContent: { flex: 1 },
  logTopLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  logTitle: { fontSize: 14, fontWeight: '600' },
  logTime: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
  logMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  logMetaText: { fontSize: 11, fontWeight: '500' },
  logMetaDivider: { fontSize: 11 },
  loadMoreButton: { marginTop: 16, paddingVertical: 14, borderRadius: 12, borderStyle: 'dashed', borderWidth: 1, alignItems: 'center' },
  loadMoreText: { fontSize: 13, fontWeight: '600' },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 6 }
});
