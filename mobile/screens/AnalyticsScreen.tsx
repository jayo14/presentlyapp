import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import { BarChart3, TrendingUp } from 'lucide-react-native';
import { Button } from '../components/Button';

export default function AnalyticsScreen({ navigation }: any) {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 p-6 justify-center items-center">
        <BarChart3 size={64} color="#C1B66D" className="mb-6" />
        <Text className="text-white text-3xl font-bold mb-2">Performance Analytics</Text>
        <Text className="text-text-muted text-lg text-center mb-10">
          Track your academic progress and attendance trends.
        </Text>
        <Button onPress={() => alert('Analytics features coming soon!')}>
          View Analytics
        </Button>
      </View>
    </SafeAreaView>
  );
}
