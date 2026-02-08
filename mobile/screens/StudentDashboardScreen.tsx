import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { 
  QrCode, 
  Clock, 
  MapPin, 
  TrendingUp, 
  BookOpen, 
  Plus, 
  ChevronRight, 
  AlertCircle,
  X,
  Bell
} from 'lucide-react-native';
import { cn } from '../utils/cn';
import { Button } from '../components/Button';

// Mock data to match the web dashboard structure
const MOCK_DATA = {
  userName: "John Doe",
  avgAttendance: 82,
  enrolledCourses: 6,
  nextClass: {
    name: "Advanced Mathematics",
    time: "10:30 AM",
    venue: "Lecture Hall B",
    code: "MTH402"
  },
  lowAttendanceCourses: [
    { code: "PHY201", name: "Physics II" }
  ],
  recentActivity: [
    { id: 1, course_code: "MTH402", timestamp: new Date().toISOString(), status: "PRESENT", type: "attendance" },
    { id: 2, course_code: "CSC401", timestamp: new Date(Date.now() - 86400000).toISOString(), status: "PRESENT", type: "attendance" },
    { id: 3, course_code: "ENG201", timestamp: new Date(Date.now() - 172800000).toISOString(), status: "LATE", type: "attendance" },
  ]
};

export default function StudentDashboardScreen({ navigation }: any) {
  const [isWarningDismissed, setIsWarningDismissed] = useState(false);

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Greeting Header */}
        <View className="flex-row justify-between items-end mt-6 mb-8">
          <View>
            <Text className="text-text-muted text-sm font-medium">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
            </Text>
            <Text className="text-white text-3xl font-bold mt-1">Hello, {MOCK_DATA.userName.split(' ')[0]}</Text>
          </View>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Notifications')}
            className="w-12 h-12 rounded-full bg-surface items-center justify-center border border-zinc-800"
          >
            <Bell size={24} color="#C1B66D" />
          </TouchableOpacity>
        </View>

        {/* Prominent Mark Attendance Hero */}
        <TouchableOpacity 
          activeOpacity={0.9}
          className="w-full bg-primary rounded-[2.5rem] p-8 shadow-xl shadow-primary/20 mb-6 overflow-hidden"
        >
          <View className="flex-row justify-between items-center relative z-10">
            <View>
              <View className="bg-black/10 self-start px-3 py-1 rounded-full mb-3">
                <Text className="text-black text-[10px] font-bold uppercase tracking-wider">Action Required</Text>
              </View>
              <Text className="text-black text-4xl font-black leading-tight">Mark{"\n"}Attendance</Text>
              <Text className="text-black/70 font-medium mt-2">Scan QR or Enter ID</Text>
            </View>
            <View className="bg-white/20 p-5 rounded-3xl">
              <QrCode size={48} color="black" />
            </View>
          </View>
          
          {/* Decorative shapes */}
          <View className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full" />
          <View className="absolute -left-10 -bottom-10 w-32 h-32 bg-black/5 rounded-full" />
        </TouchableOpacity>

        {/* Warning Banner */}
        {MOCK_DATA.lowAttendanceCourses.length > 0 && !isWarningDismissed && (
          <View className="bg-destructive/10 border border-destructive/20 p-4 rounded-2xl flex-row items-center mb-6">
            <View className="bg-destructive/20 p-2 rounded-full mr-3">
              <AlertCircle size={20} color="#ef4444" />
            </View>
            <View className="flex-1">
              <Text className="text-destructive font-bold text-sm">Attendance Warning</Text>
              <Text className="text-destructive/80 text-xs">
                Below 75% in: {MOCK_DATA.lowAttendanceCourses.map(c => c.code).join(', ')}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setIsWarningDismissed(true)}>
              <X size={18} color="#ef4444" />
            </TouchableOpacity>
          </View>
        )}

        <View className="flex-row gap-4 mb-6">
          {/* Next Class Card */}
          <View className="flex-1 bg-surface border border-zinc-800 p-5 rounded-3xl justify-between min-h-[160px]">
            <View>
              <Text className="text-text-muted text-[10px] font-bold uppercase tracking-wider mb-2 flex-row items-center">
                <Clock size={12} color="#C1B66D" /> UP NEXT
              </Text>
              <Text className="text-white font-bold text-lg leading-tight" numberOfLines={2} >
                {MOCK_DATA.nextClass.name}
              </Text>
            </View>
            <View className="mt-4 gap-2">
              <View className="flex-row items-center gap-2">
                <Clock size={14} color="#71717a" />
                <Text className="text-text-secondary text-xs">{MOCK_DATA.nextClass.time}</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <MapPin size={14} color="#71717a" />
                <Text className="text-text-secondary text-xs">{MOCK_DATA.nextClass.venue}</Text>
              </View>
            </View>
          </View>

          {/* Stats Cards Column */}
          <View className="flex-1 gap-4">
            <View className="bg-surface border border-zinc-800 p-4 rounded-3xl flex-1 justify-center">
              <View className="bg-green-500/10 w-8 h-8 rounded-full items-center justify-center mb-2">
                <TrendingUp size={16} color="#22c55e" />
              </View>
              <Text className="text-white text-xl font-bold">{MOCK_DATA.avgAttendance}%</Text>
              <Text className="text-text-muted text-[10px] uppercase">Attendance</Text>
            </View>
            <TouchableOpacity 
              onPress={() => navigation.navigate('StudentCourses')}
              className="bg-surface border border-zinc-800 p-4 rounded-3xl flex-1 justify-center"
            >
              <View className="bg-blue-500/10 w-8 h-8 rounded-full items-center justify-center mb-2">
                <BookOpen size={16} color="#3b82f6" />
              </View>
              <Text className="text-white text-xl font-bold">{MOCK_DATA.enrolledCourses}</Text>
              <Text className="text-text-muted text-[10px] uppercase">Courses</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <TouchableOpacity 
          onPress={() => navigation.navigate('StudentCourses')}
          className="bg-surface border border-zinc-800 p-4 rounded-2xl flex-row items-center justify-between mb-8"
        >
          <View className="flex-row items-center gap-3">
            <View className="bg-zinc-800 p-2 rounded-lg">
              <Plus size={20} color="#C1B66D" />
            </View>
            <View>
              <Text className="text-white font-bold text-sm">Register Courses</Text>
              <Text className="text-text-muted text-xs">Manage your enrollment</Text>
            </View>
          </View>
          <ChevronRight size={20} color="#71717a" />
        </TouchableOpacity>

        {/* Recent Activity */}
        <View className="mb-10">
          <Text className="text-white font-bold text-lg mb-4">Recent Activity</Text>
          <View className="gap-3">
            {MOCK_DATA.recentActivity.map((activity) => (
              <View key={activity.id} className="bg-surface border border-zinc-800 p-4 rounded-2xl flex-row items-center justify-between">
                <View className="flex-row items-center gap-4">
                  <View className="w-10 h-10 rounded-xl bg-zinc-800 items-center justify-center">
                    <Text className="text-text-secondary font-bold text-xs">{activity.course_code.substring(0, 2)}</Text>
                  </View>
                  <View>
                    <Text className="text-white font-bold text-sm">{activity.course_code}</Text>
                    <Text className="text-text-muted text-[10px]">
                      {new Date(activity.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                </View>
                <View className={cn(
                  "px-2 py-1 rounded-md",
                  activity.status === 'PRESENT' ? "bg-green-500/10" : "bg-yellow-500/10"
                )}>
                  <Text className={cn(
                    "text-[10px] font-bold",
                    activity.status === 'PRESENT' ? "text-green-500" : "text-yellow-500"
                  )}>{activity.status}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
