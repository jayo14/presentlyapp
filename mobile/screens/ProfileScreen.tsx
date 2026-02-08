import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { 
  ArrowLeft, 
  Share2, 
  Settings as SettingsIcon, 
  Bell, 
  HelpCircle,
  LogOut,
  ChevronRight
} from 'lucide-react-native';

// Mock user data
const USER_DATA = {
  name: 'Dr. Sarah Smith',
  role: 'Senior Lecturer - Computer Science',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
  activeCourses: 6,
  totalSessions: 124,
};

export default function ProfileScreen({ navigation }: any) {
  return (
    <View className="flex-1 bg-background">
      <SafeAreaView className="flex-1">
        <ScrollView 
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {/* Header */}
          <View className="px-6 pt-4 pb-6 flex-row items-center justify-between">
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              className="w-10 h-10 items-center justify-center -ml-2"
            >
              <ArrowLeft size={24} color="#fafafa" />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">Profile</Text>
            <TouchableOpacity className="w-10 h-10 items-center justify-center -mr-2">
              <Share2 size={24} color="#fafafa" />
            </TouchableOpacity>
          </View>

          {/* Profile Section */}
          <View className="items-center px-6 mb-8">
            {/* Avatar with gold border */}
            <View className="w-44 h-44 rounded-full overflow-hidden border-4 border-primary mb-6">
              <Image 
                source={{ uri: USER_DATA.avatar }}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>

            {/* User Info */}
            <Text className="text-white text-3xl font-bold mb-2 text-center">
              {USER_DATA.name}
            </Text>
            <Text className="text-text-secondary text-base text-center">
              {USER_DATA.role}
            </Text>
          </View>

          {/* Stats Cards */}
          <View className="px-6 flex-row gap-4 mb-8">
            <View className="flex-1 bg-surface border border-primary/30 rounded-3xl py-6 items-center">
              <Text className="text-white text-4xl font-bold mb-1">
                {USER_DATA.activeCourses}
              </Text>
              <Text className="text-text-secondary text-sm">
                Active Courses
              </Text>
            </View>

            <View className="flex-1 bg-surface border border-primary/30 rounded-3xl py-6 items-center">
              <Text className="text-white text-4xl font-bold mb-1">
                {USER_DATA.totalSessions}
              </Text>
              <Text className="text-text-secondary text-sm">
                Total Sessions
              </Text>
            </View>
          </View>

          {/* Account Section */}
          <View className="px-6 mb-8">
            <Text className="text-white text-2xl font-bold mb-4">Account</Text>

            <View className="gap-3">
              {/* Settings */}
              <TouchableOpacity 
                onPress={() => navigation.navigate('Settings')}
                className="bg-surface rounded-2xl p-4 flex-row items-center"
              >
                <View className="w-12 h-12 rounded-xl bg-zinc-800 items-center justify-center mr-4">
                  <SettingsIcon size={24} color="#C1B66D" />
                </View>
                <Text className="flex-1 text-white font-semibold text-base">
                  Settings
                </Text>
                <ChevronRight size={20} color="#71717a" />
              </TouchableOpacity>

              {/* Notifications */}
              <TouchableOpacity 
                onPress={() => navigation.navigate('Notifications')}
                className="bg-surface rounded-2xl p-4 flex-row items-center"
              >
                <View className="w-12 h-12 rounded-xl bg-zinc-800 items-center justify-center mr-4">
                  <Bell size={24} color="#C1B66D" />
                </View>
                <Text className="flex-1 text-white font-semibold text-base">
                  Notifications
                </Text>
                <ChevronRight size={20} color="#71717a" />
              </TouchableOpacity>

              {/* Help & Support */}
              <TouchableOpacity className="bg-surface rounded-2xl p-4 flex-row items-center">
                <View className="w-12 h-12 rounded-xl bg-zinc-800 items-center justify-center mr-4">
                  <HelpCircle size={24} color="#C1B66D" />
                </View>
                <Text className="flex-1 text-white font-semibold text-base">
                  Help & Support
                </Text>
                <ChevronRight size={20} color="#71717a" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Logout Button */}
          <View className="px-6">
            <TouchableOpacity 
              onPress={() => navigation.navigate('Login')}
              className="bg-primary/10 border border-destructive/30 rounded-2xl py-4 flex-row items-center justify-center"
            >
              <LogOut size={20} color="#ef4444" className="mr-2" />
              <Text className="text-destructive font-bold text-base ml-2">
                Logout
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
