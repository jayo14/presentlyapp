import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { ChevronLeft, Settings, PlayCircle, FileText, AlertTriangle, PenTool, RefreshCw, ChevronRight, CheckCircle, Info, Circle } from 'lucide-react-native';
import Fonts from '@/constants/fonts';
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { format, parseISO } from 'date-fns';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

export default function LecturerNotificationsScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const bottomDockOffset = tabBarHeight + insets.bottom;
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'All' | 'Unread' | 'Important'>('All');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = useCallback(async () => {
    try {
        const data = await api.notifications.list() as any;
        setNotifications(data.results || data);
    } catch (e) {
        console.error('Failed to load notifications', e);
    } finally {
        setLoading(false);
        setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
        loadNotifications();
    }
  }, [loadNotifications, isAuthenticated, user]);

  const onRefresh = () => {
    if (isAuthenticated && user) {
        setRefreshing(true);
        loadNotifications();
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

  const filteredNotifications = notifications.filter(n => {
      if (activeTab === 'Unread') return !n.is_read;
      if (activeTab === 'Important') return n.notification_type === 'ABSENCE_ALERT';
      return true;
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Top App Bar */}
      <View style={[styles.header, { borderBottomColor: isDark ? '#4a4121' : '#E2E8F0' }]}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace("/")} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
        <TouchableOpacity style={styles.settingsBtn}>
          <Settings size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={[styles.tabs, { borderBottomColor: isDark ? '#4a4121' : '#E2E8F0' }]}>
        <TabItem label="All" active={activeTab === 'All'} onPress={() => setActiveTab('All')} colors={colors} />
        <TabItem label="Unread" active={activeTab === 'Unread'} onPress={() => setActiveTab('Unread')} colors={colors} />
        <TabItem label="Important" active={activeTab === 'Important'} onPress={() => setActiveTab('Important')} colors={colors} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomDockOffset + 16 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {loading && !refreshing ? (
             <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
            filteredNotifications.map(item => (
                <NotificationItem key={item.id} item={item} colors={colors} isDark={isDark} onRead={handleRead} />
            ))
        )}
        {!loading && filteredNotifications.length === 0 && (
            <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No notifications found</Text>
            </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function TabItem({ label, active, onPress, colors }: any) {
    return (
        <TouchableOpacity
            style={[styles.tab, active && { borderBottomColor: colors.primary }]}
            onPress={onPress}
        >
            <Text style={[styles.tabText, { color: active ? colors.primary : (colors.textSecondary) }, active && styles.activeTabText]}>
                {label}
            </Text>
        </TouchableOpacity>
    );
}

function NotificationItem({ item, colors, isDark, onRead }: any) {
    const getIcon = () => {
        const type = item.notification_type;
        if (type === 'SESSION_STARTED') return <PlayCircle size={24} color={colors.primary} />;
        if (type === 'SYSTEM') return <RefreshCw size={24} color={colors.primary} />;
        if (type === 'ABSENCE_ALERT') return <AlertTriangle size={24} color="#EF4444" />;
        return <Info size={24} color={colors.primary} />;
    };

    const timeStr = format(parseISO(item.created_at), 'h:mm a');

    return (
        <TouchableOpacity
            style={[styles.notificationItem, { borderBottomColor: isDark ? '#332c15' : '#F1F5F9' }]}
            activeOpacity={0.7}
            onPress={() => onRead(item.id)}
        >
            <View style={styles.itemRow}>
                <View style={[styles.iconContainer, { backgroundColor: item.notification_type === 'ABSENCE_ALERT' ? 'rgba(239,68,68,0.1)' : (isDark ? '#4a4121' : colors.primary + '1A') }]}>
                    {getIcon()}
                </View>

                <View style={styles.contentContainer}>
                    <View style={styles.titleRow}>
                        <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
                        {!item.is_read && <View style={[styles.unreadDotMini, { backgroundColor: colors.primary }]} />}
                    </View>
                    <Text style={[styles.itemSummary, { color: isDark ? '#ccbf8e' : '#666666' }]}>{item.message}</Text>
                    <Text style={[styles.itemTime, { color: isDark ? '#ccbf8e' : '#94A3B8' }]}>{timeStr}</Text>
                </View>

                <View style={styles.itemRight}>
                    {!item.is_read && (
                        <View style={[styles.unreadPulse, { backgroundColor: colors.primary }]} />
                    )}
                    <ChevronRight size={20} color={isDark ? '#ccbf8e' : '#94A3B8'} />
                </View>
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
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: Fonts.lexend.bold,
  },
  settingsBtn: {
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
  notificationItem: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  itemTitle: {
    fontSize: 16,
    fontFamily: Fonts.lexend.medium,
    flexShrink: 1,
  },
  unreadDotMini: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  itemSummary: {
    fontSize: 14,
    fontFamily: Fonts.lexend.regular,
    marginTop: 4,
    marginBottom: 4,
    lineHeight: 20,
  },
  itemTime: {
    fontSize: 13,
    fontFamily: Fonts.lexend.regular,
    marginTop: 2,
  },
  itemRight: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 24,
  },
  unreadPulse: {
    width: 12,
    height: 12,
    borderRadius: 6,
    shadowColor: '#f9c406',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
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
