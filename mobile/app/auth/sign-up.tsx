import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/contexts/AuthContext';
import { validation } from '@/utils/validation';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { ChevronLeft, Apple, Chrome } from 'lucide-react-native';
import { SvgXml } from 'react-native-svg';
import googleLogo from '../../assets/images/google-logo';
import appleLogo from '../../assets/images/apple-logo';

export default function SignUpScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { signUp } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSignUp = async () => {
    const newErrors: Record<string, string> = {};

    if (!validation.fullName(formData.fullName)) {
      newErrors.fullName = 'Please enter your full name (min 3 characters)';
    }

    if (!validation.email(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    const passwordValidation = validation.password(formData.password);
    if (!passwordValidation.valid) {
      newErrors.password = passwordValidation.error || 'Invalid password';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setLoading(true);
    const result = await signUp({
      full_name: formData.fullName,
      email: formData.email,
      password: formData.password,
      password2: formData.confirmPassword,
    });
    setLoading(false);

    if (result.success && result.requiresVerification) {
      router.push({ pathname: '/auth/verify-email', params: { mode: 'signup', step: 'otp' } });
    } else if (result.error) {
      Alert.alert('Error', result.error);
    }
  };

  const handleGoogleSignUp = async () => {
    Alert.alert('Coming Soon', 'Google Sign In will be available soon');
  };

  const handleAppleSignUp = async () => {
    Alert.alert('Coming Soon', 'Apple Sign In will be available soon');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.headerBar}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Sign up to get started
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Full Name"
              value={formData.fullName}
              onChangeText={(text) => handleInputChange('fullName', text)}
              placeholder="John Doe"
              error={errors.fullName}
            />

            <Input
              label="Email"
              value={formData.email}
              onChangeText={(text) => handleInputChange('email', text)}
              placeholder="your.email@university.edu"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />

            <Input
              label="Password"
              value={formData.password}
              onChangeText={(text) => handleInputChange('password', text)}
              placeholder="Min 8 characters"
              secureTextEntry
              error={errors.password}
            />

            <Input
              label="Confirm Password"
              value={formData.confirmPassword}
              onChangeText={(text) => handleInputChange('confirmPassword', text)}
              placeholder="Repeat your password"
              secureTextEntry
              error={errors.confirmPassword}
            />

            <Button
              title="Create Account"
              onPress={handleSignUp}
              loading={loading}
            />

            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.textSecondary }]}>or</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>

            <View style={styles.socialButtons}>
              <TouchableOpacity
                style={[styles.socialButton, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
                onPress={handleGoogleSignUp}
                activeOpacity={0.7}
              >
                <SvgXml xml={googleLogo} width={24} height={24} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.socialButton, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
                onPress={handleAppleSignUp}
                activeOpacity={0.7}
              >
                <SvgXml xml={appleLogo} width={24} height={24} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Text style={[styles.signInText, { color: colors.primary }]}>
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  headerBar: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    gap: 20,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 14,
    fontWeight: '500',
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: {
    fontSize: 15,
  },
  signInText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
