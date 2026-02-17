import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { ChevronLeft, Settings, PlayCircle, FileText, AlertTriangle, PenTool, RefreshCw, ChevronRight, CheckCircle, Info } from 'lucide-react-native';
import Fonts from '@/constants/fonts';
import { useState } from 'react';

type Notification = {
  id: string;
  type: 'session' | 'export' | 'warning' | 'reminder' | 'update';
  title: string;
  subtitle: string;
  time: string;
  isUnread: boolean;
  isImportant?: boolean;
  summary?: string;
};

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'session',
    title: 'Session Started: CS101',
    subtitle: '10 minutes ago',
    time: '10:30 AM',
    isUnread: true,
  },
  {
    id: '2',
    type: 'export',
    title: 'Export Completed: Semester A Reports',
    subtitle: '1 hour ago',
    time: '09:45 AM',
    isUnread: false,
  },
  {
    id: '3',
    type: 'warning',
    title: 'Low Attendance Warning: CS402 (62%)',
    subtitle: '2 hours ago',
    time: 'Yesterday',
    isUnread: true,
    isImportant: true,
    summary: 'Attendance dropped below 70% threshold for the current semester.'
  },
  {
    id: '4',
    type: 'reminder',
    title: 'Grading Deadline: Intro to AI',
    subtitle: '4 hours ago',
    time: 'Yesterday',
    isUnread: false,
  },
  {
    id: '5',
    type: 'update',
    title: 'System Update Scheduled',
    subtitle: 'Today, 11:00 PM',
    time: 'Oct 12',
    isUnread: false,
  }
];

export default function LecturerNotificationsScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<'All' | 'Unread' | 'Important'>('All');

  const filteredNotifications = MOCK_NOTIFICATIONS.filter(n => {
      if (activeTab === 'Unread') return n.isUnread;
      if (activeTab === 'Important') return n.isImportant;
      return true;
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Top App Bar */}
      <View style={[styles.header, { borderBottomColor: isDark ? '#4a4121' : '#E2E8F0' }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
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

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {filteredNotifications.map(item => (
            <NotificationItem key={item.id} item={item} colors={colors} isDark={isDark} />
        ))}
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

function NotificationItem({ item, colors, isDark }: { item: Notification, colors: any, isDark: boolean }) {
    const getIcon = () => {
        switch(item.type) {
            case 'session': return <PlayCircle size={24} color={colors.primary} />;
            case 'export': return <FileText size={24} color={colors.primary} />;
            case 'warning': return <AlertTriangle size={24} color="#EF4444" />;
            case 'reminder': return <PenTool size={24} color={colors.primary} />;
            case 'update': return <RefreshCw size={24} color={colors.primary} />;
            default: return <Info size={24} color={colors.primary} />;
        }
    };

    return (
        <TouchableOpacity
            style={[styles.notificationItem, { borderBottomColor: isDark ? '#332c15' : '#F1F5F9' }]}
            activeOpacity={0.7}
        >
            <View style={styles.itemRow}>
                <View style={[styles.iconContainer, { backgroundColor: item.type === 'warning' ? 'rgba(239,68,68,0.1)' : (isDark ? '#4a4121' : colors.primary + '1A') }]}>
                    {getIcon()}
                </View>

                <View style={styles.contentContainer}>
                    <View style={styles.titleRow}>
                        <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
                        {item.type === 'warning' && <View style={[styles.unreadDotMini, { backgroundColor: colors.primary }]} />}
                    </View>
                    {item.summary && (
                        <Text style={[styles.itemSummary, { color: isDark ? '#ccbf8e' : '#666666' }]}>{item.summary}</Text>
                    )}
                    <Text style={[styles.itemTime, { color: isDark ? '#ccbf8e' : '#94A3B8' }]}>{item.subtitle}</Text>
                </View>

                <View style={styles.itemRight}>
                    {item.isUnread && item.type !== 'warning' && (
                        <View style={[styles.unreadPulse, { backgroundColor: colors.primary }]} />
                    )}
                    {item.type === 'export' && !item.isUnread && (
                        <CheckCircle size={18} color={isDark ? '#4a4121' : '#E2E8F0'} />
                    )}
                    {(item.type === 'reminder' || item.type === 'warning') && (
                        <ChevronRight size={20} color={isDark ? '#ccbf8e' : '#94A3B8'} />
                    )}
                    {item.type === 'update' && (
                        <Info size={20} color={isDark ? '#ccbf8e' : '#94A3B8'} />
                    )}
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
  }
});
