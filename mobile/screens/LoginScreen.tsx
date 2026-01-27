import React, { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Logo } from '../components/Logo';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Mail, Lock } from 'lucide-react-native';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    setIsLoading(true);
    // Simulate login delay
    setTimeout(() => {
      setIsLoading(false);
      // Navigate to MainApp (tab navigator)
      navigation.replace('MainApp');
      console.log('Login with:', email, password);
    }, 1500);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 p-6 justify-center">
          <View className="items-center mb-10">
            <Logo size={40} />
            <Text className="text-white text-2xl font-bold mt-6">Welcome back</Text>
            <Text className="text-text-muted mt-2">Sign in to your account</Text>
          </View>

          <View className="gap-4">
            <Input
              label="Email"
              placeholder="name@example.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              icon={<Mail size={20} color="#71717a" />}
            />
            
            <View>
              <Input
                label="Password"
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                icon={<Lock size={20} color="#71717a" />}
              />
              <TouchableOpacity 
                className="self-end mt-2"
                onPress={() => navigation.navigate('ForgotPassword')}
              >
                <Text className="text-primary text-sm font-medium">Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            <Button 
              onPress={handleLogin} 
              isLoading={isLoading}
              className="mt-2"
            >
              Sign In
            </Button>
          </View>

          <View className="flex-row justify-center mt-8">
            <Text className="text-text-muted">Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text className="text-primary font-medium">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
