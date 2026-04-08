import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, FlatList, ActivityIndicator, Share as RNShare,
  Platform, Alert,
} from 'react-native';
import { useState, useEffect, useCallback, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { systemService } from '@/services/system';
import {
  Share, Search, AlertCircle, AlertTriangle, Info, CheckCircle,
  ChevronRight, User, Filter, Calendar, Download, RefreshCw,
} from 'lucide-react-native';
import Fonts from '@/constants/fonts';

// ─── Types ───────────────────────────────────────────────────────────────────
interface SystemLog {
  id: string;
  event_type: string;
  level: 'info' | 'warning' | 'error' | 'success';
  action: string;
  user_name: string | null;
  user_email: string | null;
  user_role: string | null;
  ip_address: string | null;
  details: string | null;
  timestamp: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatTimestamp(ts: string) {
  try {
    const d = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH}h ago`;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return ts;
  }
}

function getLevelColor(level: string) {
  switch (level) {
    case 'error': return '#FF4B4B';
    case 'warning': return '#FFD700';
    case 'success': return '#22C55E';
    default: return '#f2b90d';
  }
}

function getLevelIcon(level: string, size = 20) {
  switch (level) {
    case 'error': return <AlertCircle size={size} color="#FF4B4B" />;
    case 'warning': return <AlertTriangle size={size} color="#FFD700" />;
    case 'success': return <CheckCircle size={size} color="#22C55E" />;
    default: return <Info size={size} color="#f2b90d" />;
  }
}

// ─── Constants ────────────────────────────────────────────────────────────────
const LEVEL_FILTERS = ['All', 'info', 'warning', 'error', 'success'];
const ROLE_FILTERS = ['All', 'STUDENT', 'LECTURER', 'ADMIN'];
const EVENT_FILTERS = ['All', 'AUTH', 'SYSTEM', 'CONFIG', 'SECURITY', 'ERROR'];
const DATE_PRESETS = [
  { label: 'All time', value: null },
  { label: 'Last 24h', value: 1 },
  { label: 'Last 7d', value: 7 },
  { label: 'Last 30d', value: 30 },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AuditLogsScreen() {
  const { colors, isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedRole, setSelectedRole] = useState('All');
  const [selectedEvent, setSelectedEvent] = useState('All');
  const [selectedDatePreset, setSelectedDatePreset] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const buildFilters = useCallback(() => {
    const filters: Record<string, any> = {};
    if (searchQuery.trim()) filters.search = searchQuery.trim();
    if (selectedLevel !== 'All') filters.level = selectedLevel;
    if (selectedRole !== 'All') filters.role = selectedRole;
    if (selectedEvent !== 'All') filters.event_type = selectedEvent;
    if (selectedDatePreset) {
      const d = new Date();
      d.setDate(d.getDate() - selectedDatePreset);
      filters.date_from = d.toISOString().split('T')[0];
    }
    return filters;
  }, [searchQuery, selectedLevel, selectedRole, selectedEvent, selectedDatePreset]);

  const loadLogs = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const response: any = await systemService.getLogs(buildFilters());
      const items: SystemLog[] = response?.results || (Array.isArray(response) ? response : []);
      setLogs(items);
      setTotalCount(response?.count ?? items.length);
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [buildFilters]);

  // Reload whenever filters change
  useEffect(() => {
    loadLogs();
  }, [selectedLevel, selectedRole, selectedEvent, selectedDatePreset]);

  // Debounced search
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      loadLogs();
    }, 400);
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [searchQuery]);

  const onRefresh = () => {
    setRefreshing(true);
    loadLogs(false);
  };

  const handleExportCsv = async () => {
    try {
      Alert.alert(
        'Export Logs',
        'CSV export of filtered audit logs will be downloaded.',
        [{ text: 'OK' }],
      );
      // On web / further integration, call systemService.exportLogsCsv(buildFilters())
    } catch (e) {
      console.error('Export error', e);
    }
  };

  const s = makeStyles(colors, isDark);

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[s.header, { borderBottomColor: isDark ? 'rgba(255,255,255,0.1)' : '#e0e0e0', borderBottomWidth: 1 }]}>
        <View style={s.headerTop}>
          <Text style={[s.title, { color: colors.text }]}>System Audit Logs</Text>
          <View style={s.headerActions}>
            <TouchableOpacity style={s.iconButton} onPress={onRefresh}>
              <RefreshCw size={20} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={s.iconButton} onPress={handleExportCsv}>
              <Download size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search */}
        <View style={[s.searchBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f0f0f0' }]}>
          <Search size={18} color={colors.textSecondary} />
          <TextInput
            style={[s.searchInput, { color: colors.text }]}
            placeholder="Search actions, users, IPs..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={{ color: colors.textSecondary, fontSize: 16 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Level quick-filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterScroll}>
          {LEVEL_FILTERS.map(lvl => {
            const active = selectedLevel === lvl;
            return (
              <TouchableOpacity
                key={lvl}
                onPress={() => setSelectedLevel(lvl)}
                style={[
                  s.filterChip,
                  active
                    ? { backgroundColor: colors.primary }
                    : { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f0f0f0', borderWidth: 1, borderColor: isDark ? colors.border : '#e0e0e0' },
                ]}
              >
                <Text style={[s.filterChipText, { color: active ? '#000' : colors.textSecondary }]}>
                  {lvl === 'All' ? 'All Levels' : lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Advanced filters toggle */}
        <TouchableOpacity
          style={[s.advancedToggle, { borderColor: colors.border }]}
          onPress={() => setShowFilters(v => !v)}
        >
          <Filter size={14} color={colors.primary} />
          <Text style={[s.advancedToggleText, { color: colors.primary }]}>
            {showFilters ? 'Hide Filters' : 'Advanced Filters'}
          </Text>
        </TouchableOpacity>

        {showFilters && (
          <View style={s.advancedFilters}>
            {/* Role filter */}
            <Text style={[s.filterGroupLabel, { color: colors.textSecondary }]}>Role</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterScroll}>
              {ROLE_FILTERS.map(r => {
                const active = selectedRole === r;
                return (
                  <TouchableOpacity
                    key={r}
                    onPress={() => setSelectedRole(r)}
                    style={[s.filterChip, active ? { backgroundColor: colors.primary } : { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f0f0f0', borderWidth: 1, borderColor: isDark ? colors.border : '#e0e0e0' }]}
                  >
                    <Text style={[s.filterChipText, { color: active ? '#000' : colors.textSecondary }]}>{r}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Event type filter */}
            <Text style={[s.filterGroupLabel, { color: colors.textSecondary }]}>Event Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterScroll}>
              {EVENT_FILTERS.map(ev => {
                const active = selectedEvent === ev;
                return (
                  <TouchableOpacity
                    key={ev}
                    onPress={() => setSelectedEvent(ev)}
                    style={[s.filterChip, active ? { backgroundColor: colors.primary } : { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f0f0f0', borderWidth: 1, borderColor: isDark ? colors.border : '#e0e0e0' }]}
                  >
                    <Text style={[s.filterChipText, { color: active ? '#000' : colors.textSecondary }]}>{ev}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Date preset filter */}
            <Text style={[s.filterGroupLabel, { color: colors.textSecondary }]}>Date Range</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterScroll}>
              {DATE_PRESETS.map(preset => {
                const active = selectedDatePreset === preset.value;
                return (
                  <TouchableOpacity
                    key={preset.label}
                    onPress={() => setSelectedDatePreset(preset.value)}
                    style={[s.filterChip, active ? { backgroundColor: colors.primary } : { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f0f0f0', borderWidth: 1, borderColor: isDark ? colors.border : '#e0e0e0' }]}
                  >
                    <Calendar size={12} color={active ? '#000' : colors.textSecondary} />
                    <Text style={[s.filterChipText, { color: active ? '#000' : colors.textSecondary }]}>{preset.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}
      </View>

      {loading && !refreshing ? (
        <View style={s.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={logs}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={s.listContent}
          onRefresh={onRefresh}
          refreshing={refreshing}
          ListHeaderComponent={
            <View style={s.feedHeader}>
              <Text style={[s.feedHeaderTitle, { color: colors.textSecondary }]}>CHRONOLOGICAL FEED</Text>
              <Text style={[s.feedCount, { color: colors.textSecondary }]}>{totalCount} events</Text>
            </View>
          }
          ListEmptyComponent={
            <Text style={[s.emptyText, { color: colors.textSecondary }]}>No logs found.</Text>
          }
          renderItem={({ item }) => <LogCard item={item} colors={colors} isDark={isDark} />}
        />
      )}
    </SafeAreaView>
  );
}

// ─── Log Card ─────────────────────────────────────────────────────────────────
function LogCard({ item, colors, isDark }: { item: SystemLog; colors: any; isDark: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const levelColor = getLevelColor(item.level);

  return (
    <TouchableOpacity
      onPress={() => setExpanded(v => !v)}
      style={[
        logCardStyles.card,
        { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f9f9f9' },
        { borderLeftColor: levelColor, borderLeftWidth: 4 },
      ]}
      activeOpacity={0.8}
    >
      <View style={[logCardStyles.iconBox, { backgroundColor: levelColor + '1A' }]}>
        {getLevelIcon(item.level)}
      </View>
      <View style={logCardStyles.content}>
        <View style={logCardStyles.topLine}>
          <Text style={[logCardStyles.title, { color: colors.text }]} numberOfLines={expanded ? undefined : 1}>
            {item.action}
          </Text>
          <Text style={[logCardStyles.time, { color: colors.textSecondary }]}>
            {formatTimestamp(item.timestamp)}
          </Text>
        </View>
        <View style={logCardStyles.meta}>
          <User size={12} color={colors.textSecondary} />
          <Text style={[logCardStyles.metaText, { color: colors.textSecondary }]}>
            {item.user_name || 'System'}
          </Text>
          {item.user_role ? (
            <>
              <Text style={[logCardStyles.dot, { color: colors.textSecondary }]}>•</Text>
              <Text style={[logCardStyles.metaText, { color: colors.textSecondary }]}>{item.user_role}</Text>
            </>
          ) : null}
          {item.ip_address ? (
            <>
              <Text style={[logCardStyles.dot, { color: colors.textSecondary }]}>•</Text>
              <Text style={[logCardStyles.metaText, { color: colors.textSecondary }]}>{item.ip_address}</Text>
            </>
          ) : null}
          <Text style={[logCardStyles.dot, { color: colors.textSecondary }]}>•</Text>
          <Text style={[logCardStyles.metaText, { color: colors.textSecondary }]}>{item.event_type}</Text>
        </View>
        {expanded && item.details ? (
          <Text style={[logCardStyles.details, { color: colors.textSecondary }]}>{item.details}</Text>
        ) : null}
        {expanded && item.user_email ? (
          <Text style={[logCardStyles.details, { color: colors.textSecondary }]}>{item.user_email}</Text>
        ) : null}
      </View>
      <ChevronRight
        size={18}
        color={colors.textSecondary}
        style={{ transform: [{ rotate: expanded ? '90deg' : '0deg' }] }}
      />
    </TouchableOpacity>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const logCardStyles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'flex-start', padding: 12, borderRadius: 8, gap: 12, marginBottom: 8 },
  iconBox: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  content: { flex: 1 },
  topLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  title: { fontSize: 14, fontWeight: '600', flex: 1, marginRight: 8 },
  time: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
  meta: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4 },
  metaText: { fontSize: 11, fontWeight: '500' },
  dot: { fontSize: 11 },
  details: { fontSize: 12, marginTop: 6, lineHeight: 18 },
});

function makeStyles(colors: any, isDark: boolean) {
  return StyleSheet.create({
    container: { flex: 1 },
    header: { padding: 16, gap: 12 },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontSize: 22, fontWeight: '700', letterSpacing: -0.5 },
    headerActions: { flexDirection: 'row', gap: 4 },
    iconButton: { padding: 8 },
    searchBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, height: 48, borderRadius: 12, gap: 10 },
    searchInput: { flex: 1, fontSize: 14 },
    filterScroll: { paddingVertical: 4, gap: 8 },
    filterChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
    filterChipText: { fontSize: 12, fontWeight: '600' },
    advancedToggle: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
    advancedToggleText: { fontSize: 12, fontWeight: '600' },
    advancedFilters: { gap: 8, paddingTop: 4 },
    filterGroupLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5, paddingLeft: 2 },
    listContent: { padding: 16, paddingBottom: 100 },
    feedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingHorizontal: 4 },
    feedHeaderTitle: { fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
    feedCount: { fontSize: 11, fontWeight: '500' },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { textAlign: 'center', marginTop: 40, fontSize: 14 },
  });
}
