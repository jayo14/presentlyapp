import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { 
  ArrowLeft, 
  Settings, 
  Play, 
  FileText, 
  AlertTriangle,
  Calendar,
  RefreshCw,
  ChevronRight,
  Circle
} from 'lucide-react-native';
import { cn } from '../utils/cn';

// Mock notification data
const NOTIFICATIONS = [
  {
    id: 1,
    type: 'session',
    icon: Play,
    iconBg: '#4a4a2d',
    iconColor: '#C1B66D',
    title: 'Session Started: CS101',
    time: '10 minutes ago',
    unread: true,
  },
  {
    id: 2,
    type: 'export',
    icon: FileText,
    iconBg: '#4a4a2d',
    iconColor: '#C1B66D',
    title: 'Export Completed: Semester A...',
    time: '1 hour ago',
    unread: false,
  },
  {
    id: 3,
    type: 'warning',
    icon: AlertTriangle,
    iconBg: '#4a2d2d',
    iconColor: '#ef4444',
    title: 'Low Attendance Warning: CS402 (62%)',
    description: 'Attendance dropped below 70% threshold for the current semester.',
    time: '2 hours ago',
    unread: true,
    expandable: true,
  },
  {
    id: 4,
    type: 'deadline',
    icon: Calendar,
    iconBg: '#4a4a2d',
    iconColor: '#C1B66D',
    title: 'Grading Deadline: Intro to AI',
    time: '4 hours ago',
    unread: false,
  },
  {
    id: 5,
    type: 'update',
    icon: RefreshCw,
    iconBg: '#4a4a2d',
    iconColor: '#C1B66D',
    title: 'System Update Scheduled',
    time: 'Today, 11:00 PM',
    unread: false,
  },
];

type TabType = 'all' | 'unread' | 'important';

export default function NotificationsScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<TabType>('all');

  const filteredNotifications = NOTIFICATIONS.filter(notif => {
    if (activeTab === 'unread') return notif.unread;
    if (activeTab === 'important') return notif.type === 'warning';
    return true;
  });

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="px-6 pt-4 pb-3 flex-row items-center justify-between border-b border-zinc-800">
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            className="w-10 h-10 items-center justify-center -ml-2"
          >
            <ArrowLeft size={24} color="#fafafa" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Notifications</Text>
          <TouchableOpacity className="w-10 h-10 items-center justify-center -mr-2">
            <Settings size={24} color="#fafafa" />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View className="px-6 pt-6 pb-4 flex-row gap-6">
          <TouchableOpacity onPress={() => setActiveTab('all')}>
            <View className="items-center">
              <Text className={cn(
                "text-base font-bold mb-2",
                activeTab === 'all' ? "text-primary" : "text-text-muted"
              )}>
                All
              </Text>
              {activeTab === 'all' && (
                <View className="w-full h-1 bg-primary rounded-full" />
              )}
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => setActiveTab('unread')}>
            <View className="items-center">
              <Text className={cn(
                "text-base font-bold mb-2",
                activeTab === 'unread' ? "text-text-muted" : "text-text-muted"
              )}>
                Unread
              </Text>
              {activeTab === 'unread' && (
                <View className="w-full h-1 bg-primary rounded-full" />
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setActiveTab('important')}>
            <View className="items-center">
              <Text className={cn(
                "text-base font-bold mb-2",
                activeTab === 'important' ? "text-text-muted" : "text-text-muted"
              )}>
                Important
              </Text>
              {activeTab === 'important' && (
                <View className="w-full h-1 bg-primary rounded-full" />
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Notifications List */}
        <ScrollView 
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {filteredNotifications.map((notification) => {
            const IconComponent = notification.icon;
            
            return (
              <TouchableOpacity
                key={notification.id}
                className={cn(
                  "mb-4 bg-surface rounded-3xl overflow-hidden",
                  notification.expandable ? "py-4" : "py-5"
                )}
              >
                <View className="px-5 flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <View 
                      className="w-14 h-14 rounded-2xl items-center justify-center mr-4"
                      style={{ backgroundColor: notification.iconBg }}
                    >
                      <IconComponent size={28} color={notification.iconColor} />
                    </View>
                    
                    <View className="flex-1">
                      <Text className="text-white font-bold text-base leading-tight mb-1" numberOfLines={2}>
                        {notification.title}
                      </Text>
                      {notification.description && notification.expandable && (
                        <Text className="text-text-secondary text-xs leading-relaxed mt-2 mb-2">
                          {notification.description}
                        </Text>
                      )}
                      <Text className="text-text-muted text-xs mt-1">
                        {notification.time}
                      </Text>
                    </View>
                  </View>

                  {/* Status Indicator or Chevron */}
                  <View className="ml-3">
                    {notification.unread ? (
                      <Circle size={12} color="#C1B66D" fill="#C1B66D" />
                    ) : notification.expandable ? (
                      <ChevronRight size={20} color="#71717a" />
                    ) : (
                      <View className="w-5" />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
