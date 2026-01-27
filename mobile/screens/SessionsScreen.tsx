import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import { Clock, Calendar } from 'lucide-react-native';
import { Button } from '../components/Button';

export default function SessionsScreen({ navigation }: any) {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 p-6 justify-center items-center">
        <Clock size={64} color="#C1B66D" className="mb-6" />
        <Text className="text-white text-3xl font-bold mb-2">Session Management</Text>
        <Text className="text-text-muted text-lg text-center mb-10">
          View and manage your scheduled sessions.
        </Text>
        <Button onPress={() => alert('Session features coming soon!')}>
          Explore Sessions
        </Button>
      </View>
    </SafeAreaView>
  );
}
