import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { ChevronLeft, MoreHorizontal, CheckCircle, Clock, AlertTriangle, FileText, Calendar, Circle, CheckCircle2 } from 'lucide-react-native';
import Fonts from '@/constants/fonts';
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/services/api';
import { format, isToday, isYesterday, parseISO } from 'date-fns';

export default function StudentNotificationsScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<'All' | 'Unread'>('All');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = useCallback(async () => {
    try {
        const data = await api.notifications.list();
        setNotifications(data.results || data);
    } catch (e) {
        console.error('Failed to load notifications', e);
    } finally {
        setLoading(false);
        setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const onRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  const handleMarkAllRead = async () => {
    try {
        await api.notifications.markAllRead();
        loadNotifications();
    } catch (e) {
        console.error('Failed to mark all read', e);
    }
  };

  const handleRead = async (id: string) => {
    try {
        await api.notifications.read(id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (e) {
        console.error('Failed to mark read', e);
    }
  };

  const filteredNotifications = activeTab === 'All'
    ? notifications
    : notifications.filter(n => !n.is_read);

  const getCategory = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return 'Older';
  };

  const groupedNotifications = filteredNotifications.reduce((acc: any, n: any) => {
    const cat = getCategory(n.created_at);
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(n);
    return acc;
  }, {});

  const renderSection = (title: string, data: any[]) => {
    if (data.length === 0) return null;
    return (
        <View key={title}>
            <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: isDark ? '#ccbf8e' : '#666666' }]}>{title.toUpperCase()}</Text>
            </View>
            {data.map(item => (
                <NotificationItem key={item.id} item={item} colors={colors} isDark={isDark} onRead={handleRead} />
            ))}
        </View>
    );
  };

  const sections = ['Today', 'Yesterday', 'Older'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Top App Bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
        <TouchableOpacity style={styles.moreButton} onPress={handleMarkAllRead}>
          <CheckCircle2 size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={[styles.tabs, { borderBottomColor: isDark ? '#6a5d2f' : '#E2E8F0' }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'All' && { borderBottomColor: colors.primary }]}
          onPress={() => setActiveTab('All')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'All' ? colors.text : (isDark ? '#ccbf8e' : '#666666') }, activeTab === 'All' && styles.activeTabText]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Unread' && { borderBottomColor: colors.primary }]}
          onPress={() => setActiveTab('Unread')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'Unread' ? colors.text : (isDark ? '#ccbf8e' : '#666666') }, activeTab === 'Unread' && styles.activeTabText]}>Unread</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {loading && !refreshing ? (
             <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
            sections.map(section => groupedNotifications[section] ? renderSection(section, groupedNotifications[section]) : null)
        )}
        {!loading && notifications.length === 0 && (
            <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No notifications yet</Text>
            </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function NotificationItem({ item, colors, isDark, onRead }: any) {
    const getIcon = () => {
        const type = item.notification_type;
        if (type === 'SESSION_STARTED' || type === 'ATTENDANCE_SUMMARY') return <CheckCircle size={24} color={colors.primary} />;
        if (type === 'SESSION_ENDING' || type === 'ATTENDANCE_REMINDER') return <Clock size={24} color={colors.primary} />;
        if (type === 'ABSENCE_ALERT' || type === 'EXAM_CLEARANCE') return <AlertTriangle size={24} color={colors.primary} />;
        return <Circle size={24} color={colors.primary} />;
    };

    const timeStr = format(parseISO(item.created_at), 'h:mm a');

    return (
        <TouchableOpacity
            style={[styles.notificationItem, { backgroundColor: colors.background }]}
            activeOpacity={0.7}
            onPress={() => onRead(item.id)}
        >
            <View style={styles.itemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: isDark ? '#4a4121' : colors.primary + '1A' }]}>
                    {getIcon()}
                </View>
                <View style={styles.itemTextContent}>
                    <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
                    <Text style={[styles.itemSubtitle, { color: isDark ? '#ccbf8e' : '#666666' }]} numberOfLines={1}>{item.message} • {timeStr}</Text>
                </View>
            </View>
            {!item.is_read && (
                <View style={styles.unreadDotContainer}>
                    <Circle size={8} color={colors.primary} fill={colors.primary} />
                </View>
            )}
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
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: Fonts.lexend.bold,
  },
  moreButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    gap: 32,
  },
  tab: {
    paddingVertical: 14,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 14,
    fontFamily: Fonts.lexend.regular,
  },
  activeTabText: {
    fontFamily: Fonts.lexend.bold,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: Fonts.lexend.bold,
    letterSpacing: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    minHeight: 80,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTextContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontFamily: Fonts.lexend.medium,
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 14,
    fontFamily: Fonts.lexend.regular,
  },
  unreadDotContainer: {
    marginLeft: 8,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontFamily: Fonts.lexend.medium,
  }
});
