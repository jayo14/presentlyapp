import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Switch } from 'react-native';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Bell, 
  Moon, 
  Shield,
  Database,
  ChevronRight
} from 'lucide-react-native';

export default function LecturerSettingsScreen({ navigation }: any) {
  const [darkMode, setDarkMode] = useState(true);

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="px-6 pt-4 pb-6 flex-row items-center border-b border-zinc-800">
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            className="w-10 h-10 items-center justify-center -ml-2"
          >
            <ArrowLeft size={24} color="#fafafa" />
          </TouchableOpacity>
          <Text className="flex-1 text-white text-xl font-bold ml-2">
            Lecturer Settings
          </Text>
        </View>

        <ScrollView 
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {/* Account Section */}
          <View className="px-6 pt-8 pb-6">
            <Text className="text-white text-2xl font-bold mb-4">Account</Text>

            <View className="gap-3">
              {/* Edit Profile */}
              <TouchableOpacity className="bg-surface rounded-2xl p-4 flex-row items-center">
                <View className="w-12 h-12 rounded-xl bg-zinc-800 items-center justify-center mr-4">
                  <User size={24} color="#fafafa" />
                </View>
                <Text className="flex-1 text-white font-semibold text-base">
                  Edit Profile
                </Text>
                <ChevronRight size={20} color="#71717a" />
              </TouchableOpacity>

              {/* Change Phone Number */}
              <TouchableOpacity className="bg-surface rounded-2xl p-4 flex-row items-center">
                <View className="w-12 h-12 rounded-xl bg-zinc-800 items-center justify-center mr-4">
                  <Phone size={24} color="#fafafa" />
                </View>
                <Text className="flex-1 text-white font-semibold text-base">
                  Change Phone Number
                </Text>
                <ChevronRight size={20} color="#71717a" />
              </TouchableOpacity>

              {/* Notification Preferences */}
              <TouchableOpacity className="bg-surface rounded-2xl p-4 flex-row items-center">
                <View className="w-12 h-12 rounded-xl bg-zinc-800 items-center justify-center mr-4">
                  <Bell size={24} color="#fafafa" />
                </View>
                <Text className="flex-1 text-white font-semibold text-base">
                  Notification Preferences
                </Text>
                <ChevronRight size={20} color="#71717a" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Appearance Section */}
          <View className="px-6 pb-6">
            <Text className="text-white text-2xl font-bold mb-4">Appearance</Text>

            <View className="bg-surface rounded-2xl p-4 flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="w-12 h-12 rounded-xl bg-zinc-800 items-center justify-center mr-4">
                  <Moon size={24} color="#fafafa" />
                </View>
                <Text className="text-white font-semibold text-base">
                  Dark Mode
                </Text>
              </View>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: '#3e3e3e', true: '#C1B66D' }}
                thumbColor={darkMode ? '#ffffff' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
              />
            </View>
          </View>

          {/* Privacy & Security Section */}
          <View className="px-6 pb-6">
            <Text className="text-white text-2xl font-bold mb-4">Privacy & Security</Text>

            <View className="gap-3">
              {/* Two-Factor Authentication */}
              <TouchableOpacity className="bg-surface rounded-2xl p-4 flex-row items-center">
                <View className="w-12 h-12 rounded-xl bg-zinc-800 items-center justify-center mr-4">
                  <Shield size={24} color="#fafafa" />
                </View>
                <Text className="flex-1 text-white font-semibold text-base">
                  Two-Factor Authentication
                </Text>
                <ChevronRight size={20} color="#71717a" />
              </TouchableOpacity>

              {/* Data Export Preferences */}
              <TouchableOpacity className="bg-surface rounded-2xl p-4 flex-row items-center">
                <View className="w-12 h-12 rounded-xl bg-zinc-800 items-center justify-center mr-4">
                  <Database size={24} color="#fafafa" />
                </View>
                <Text className="flex-1 text-white font-semibold text-base">
                  Data Export Preferences
                </Text>
                <ChevronRight size={20} color="#71717a" />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
