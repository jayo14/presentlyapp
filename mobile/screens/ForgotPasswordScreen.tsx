import React, { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Logo } from '../components/Logo';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react-native';

export default function ForgotPasswordScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSendLink = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSent(true);
    }, 1500);
  };

  if (isSent) {
    return (
      <View className="flex-1 bg-background p-6 justify-center items-center">
        <View className="bg-primary/10 p-4 rounded-full mb-6">
          <CheckCircle2 size={48} color="#C1B66D" />
        </View>
        <Text className="text-white text-2xl font-bold mb-2">Check your email</Text>
        <Text className="text-text-muted text-center mb-10">
          We've sent a password reset link to {email}
        </Text>
        <Button 
          onPress={() => navigation.navigate('Login')}
          className="w-full"
        >
          Back to Login
        </Button>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 p-6">
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            className="mt-4 mb-8 flex-row items-center"
          >
            <ArrowLeft size={20} color="#71717a" />
            <Text className="text-text-muted ml-2">Back</Text>
          </TouchableOpacity>

          <View className="items-center mb-10">
            <Logo size={40} />
            <Text className="text-white text-2xl font-bold mt-6">Forgot password?</Text>
            <Text className="text-text-muted mt-2 text-center">
              No worries, we'll send you reset instructions.
            </Text>
          </View>

          <View className="gap-6">
            <Input
              label="Email"
              placeholder="name@example.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              icon={<Mail size={20} color="#71717a" />}
            />

            <Button 
              onPress={handleSendLink} 
              isLoading={isLoading}
            >
              Send Reset Link
            </Button>
          </View>

          <View className="flex-row justify-center mt-8">
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text className="text-primary font-medium">Back to Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
