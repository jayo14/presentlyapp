import React, { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Logo } from '../components/Logo';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Mail, Lock, User } from 'lucide-react-native';

export default function SignUpScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = () => {
    setIsLoading(true);
    // Simulate sign up delay
    setTimeout(() => {
      setIsLoading(false);
      console.log('Sign up with:', name, email, password);
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
            <Text className="text-white text-2xl font-bold mt-6">Create an account</Text>
            <Text className="text-text-muted mt-2">Get started with Presently</Text>
          </View>

          <View className="gap-4">
            <Input
              label="Full Name"
              placeholder="John Doe"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              icon={<User size={20} color="#71717a" />}
            />

            <Input
              label="Email"
              placeholder="name@example.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              icon={<Mail size={20} color="#71717a" />}
            />
            
            <Input
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              icon={<Lock size={20} color="#71717a" />}
            />

            <Button 
              onPress={handleSignUp} 
              isLoading={isLoading}
              className="mt-2"
            >
              Sign Up
            </Button>
          </View>

          <View className="flex-row justify-center mt-8">
            <Text className="text-text-muted">Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text className="text-primary font-medium">Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
