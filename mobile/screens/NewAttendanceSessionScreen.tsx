import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Switch } from 'react-native';
import { 
  ArrowLeft, 
  ChevronDown, 
  MapPin,
  QrCode as QrCodeIcon,
  Hash,
  Crosshair
} from 'lucide-react-native';
import { cn } from '../utils/cn';

export default function NewAttendanceSessionScreen({ navigation }: any) {
  const [qrEnabled, setQrEnabled] = useState(true);
  const [digitCodeEnabled, setDigitCodeEnabled] = useState(false);
  const [gpsEnabled, setGpsEnabled] = useState(true);
  const [geofenceRadius, setGeofenceRadius] = useState(250);

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
            New Attendance Session
          </Text>
        </View>

        <ScrollView 
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 140 }}
        >
          {/* Course Selection */}
          <View className="pt-6 pb-5">
            <Text className="text-white text-xl font-bold mb-3">Course Selection</Text>
            <TouchableOpacity className="bg-surface border border-primary/40 rounded-3xl p-5 flex-row items-center justify-between">
              <Text className="text-text-secondary text-base">Search course...</Text>
              <ChevronDown size={24} color="#71717a" />
            </TouchableOpacity>
          </View>

          {/* Lecture Hall */}
          <View className="pb-6">
            <Text className="text-white text-xl font-bold mb-3">Lecture Hall</Text>
            <TouchableOpacity className="bg-surface border border-primary/40 rounded-3xl p-5 flex-row items-center justify-between">
              <Text className="text-text-secondary text-base">Select location</Text>
              <MapPin size={24} color="#71717a" />
            </TouchableOpacity>
          </View>

          {/* Verification Methods */}
          <View className="pb-6">
            <Text className="text-white text-xl font-bold mb-4">Verification Methods</Text>

            <View className="gap-3">
              {/* QR Code */}
              <View className="bg-surface rounded-2xl p-4 flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View className="w-10 h-10 rounded-xl bg-primary/20 items-center justify-center mr-3">
                    <QrCodeIcon size={20} color="#C1B66D" />
                  </View>
                  <Text className="text-white font-semibold text-base">
                    QR Code
                  </Text>
                </View>
                <Switch
                  value={qrEnabled}
                  onValueChange={setQrEnabled}
                  trackColor={{ false: '#3e3e3e', true: '#C1B66D' }}
                  thumbColor={qrEnabled ? '#ffffff' : '#f4f3f4'}
                  ios_backgroundColor="#3e3e3e"
                />
              </View>

              {/* 8-Digit Code */}
              <View className="bg-surface rounded-2xl p-4 flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View className="w-10 h-10 rounded-xl bg-primary/20 items-center justify-center mr-3">
                    <Hash size={20} color="#C1B66D" />
                  </View>
                  <Text className="text-white font-semibold text-base">
                    8-Digit Code
                  </Text>
                </View>
                <Switch
                  value={digitCodeEnabled}
                  onValueChange={setDigitCodeEnabled}
                  trackColor={{ false: '#3e3e3e', true: '#C1B66D' }}
                  thumbColor={digitCodeEnabled ? '#ffffff' : '#f4f3f4'}
                  ios_backgroundColor="#3e3e3e"
                />
              </View>

              {/* GPS Verification */}
              <View className="bg-surface rounded-2xl p-4 flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View className="w-10 h-10 rounded-xl bg-primary/20 items-center justify-center mr-3">
                    <Crosshair size={20} color="#C1B66D" />
                  </View>
                  <Text className="text-white font-semibold text-base">
                    GPS Verification
                  </Text>
                </View>
                <Switch
                  value={gpsEnabled}
                  onValueChange={setGpsEnabled}
                  trackColor={{ false: '#3e3e3e', true: '#C1B66D' }}
                  thumbColor={gpsEnabled ? '#ffffff' : '#f4f3f4'}
                  ios_backgroundColor="#3e3e3e"
                />
              </View>
            </View>
          </View>

          {/* Geofence Radius Slider */}
          {gpsEnabled && (
            <View className="pb-8">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-white text-xl font-bold">Geofence Radius</Text>
                <Text className="text-primary text-xl font-bold">{geofenceRadius}m</Text>
              </View>

              {/* Custom Slider */}
              <View className="relative">
                {/* Track */}
                <View className="h-2 bg-zinc-700 rounded-full">
                  {/* Filled Track */}
                  <View 
                    className="h-2 bg-primary rounded-full"
                    style={{ width: `${((geofenceRadius - 50) / 450) * 100}%` }}
                  />
                </View>

                {/* Thumb */}
                <View 
                  className="absolute w-8 h-8 bg-primary rounded-full -top-3"
                  style={{ 
                    left: `${((geofenceRadius - 50) / 450) * 100}%`,
                    marginLeft: -16
                  }}
                />

                {/* Labels */}
                <View className="flex-row justify-between mt-3">
                  <Text className="text-text-muted text-xs">50m</Text>
                  <Text className="text-text-muted text-xs">500m</Text>
                </View>
              </View>

              {/* Slider Controls (Hidden native slider for functionality) */}
              <View className="absolute bottom-0 left-0 right-0 opacity-0">
                {/* We'd use a proper slider library here in production */}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Create Session Button - Fixed at bottom */}
        <View className="absolute bottom-0 left-0 right-0 px-6 pb-6 pt-4 bg-background border-t border-zinc-800">
          <TouchableOpacity 
            className="bg-primary rounded-3xl py-5 items-center justify-center"
            onPress={() => {
              // Handle session creation
              navigation.goBack();
            }}
          >
            <Text className="text-black text-lg font-bold">
              Create Session
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}
