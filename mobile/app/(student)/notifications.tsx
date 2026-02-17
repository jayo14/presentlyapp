import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { ChevronLeft, MoreHorizontal, CheckCircle, Clock, AlertTriangle, FileText, Calendar, Circle } from 'lucide-react-native';
import Fonts from '@/constants/fonts';
import { useState } from 'react';

type Notification = {
  id: string;
  type: 'success' | 'info' | 'warning' | 'assignment' | 'event';
  title: string;
  subtitle: string;
  time: string;
  isUnread: boolean;
  category: 'Today' | 'Yesterday' | 'Last Week';
};

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'success',
    title: 'Attendance marked successfully',
    subtitle: 'Mathematics 101',
    time: '10:30 AM',
    isUnread: true,
    category: 'Today'
  },
  {
    id: '2',
    type: 'info',
    title: 'Session ending soon',
    subtitle: 'CS Lab',
    time: '09:45 AM',
    isUnread: true,
    category: 'Today'
  },
  {
    id: '3',
    type: 'warning',
    title: 'Attendance Warning',
    subtitle: 'Physics - Attendance below 75%',
    time: 'Yesterday',
    isUnread: false,
    category: 'Yesterday'
  },
  {
    id: '4',
    type: 'assignment',
    title: 'New Assignment Posted',
    subtitle: 'World History',
    time: 'Yesterday',
    isUnread: false,
    category: 'Yesterday'
  },
  {
    id: '5',
    type: 'event',
    title: 'Holiday Announcement',
    subtitle: 'Oct 12th is a University Holiday',
    time: 'Oct 12',
    isUnread: false,
    category: 'Last Week'
  }
];

export default function StudentNotificationsScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<'All' | 'Unread'>('All');

  const filteredNotifications = activeTab === 'All'
    ? MOCK_NOTIFICATIONS
    : MOCK_NOTIFICATIONS.filter(n => n.isUnread);

  const renderSection = (title: string, data: Notification[]) => {
    if (data.length === 0) return null;
    return (
        <View key={title}>
            <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: isDark ? '#ccbf8e' : '#666666' }]}>{title.toUpperCase()}</Text>
            </View>
            {data.map(item => (
                <NotificationItem key={item.id} item={item} colors={colors} isDark={isDark} />
            ))}
        </View>
    );
  };

  const sections = ['Today', 'Yesterday', 'Last Week'] as const;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Top App Bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
        <TouchableOpacity style={styles.moreButton}>
          <MoreHorizontal size={24} color={colors.text} />
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

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {sections.map(section => renderSection(section, filteredNotifications.filter(n => n.category === section)))}
      </ScrollView>
    </SafeAreaView>
  );
}

function NotificationItem({ item, colors, isDark }: { item: Notification, colors: any, isDark: boolean }) {
    const getIcon = () => {
        switch(item.type) {
            case 'success': return <CheckCircle size={24} color={colors.primary} fill={isDark ? colors.primary + '00' : colors.primary + '00'} />;
            case 'info': return <Clock size={24} color={colors.primary} />;
            case 'warning': return <AlertTriangle size={24} color={colors.primary} />;
            case 'assignment': return <FileText size={24} color={colors.primary} />;
            case 'event': return <Calendar size={24} color={isDark ? '#6a5d2f' : '#94A3B8'} />;
            default: return <Circle size={24} color={colors.primary} />;
        }
    };

    return (
        <TouchableOpacity
            style={[styles.notificationItem, { backgroundColor: colors.background }]}
            activeOpacity={0.7}
        >
            <View style={styles.itemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: item.type === 'event' ? (isDark ? '#322d1a' : '#F1F5F9') : (isDark ? '#4a4121' : colors.primary + '1A') }]}>
                    {getIcon()}
                </View>
                <View style={styles.itemTextContent}>
                    <Text style={[styles.itemTitle, { color: item.type === 'event' ? (isDark ? '#ccbf8e' : '#94A3B8') : colors.text }]} numberOfLines={1}>{item.title}</Text>
                    <Text style={[styles.itemSubtitle, { color: isDark ? '#ccbf8e' : '#666666' }]} numberOfLines={1}>{item.subtitle} • {item.time}</Text>
                </View>
            </View>
            {item.isUnread && (
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
  }
});
