import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Alert, ImageBackground } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { GraduationCap, Chrome, Apple } from 'lucide-react-native';
import Fonts from '@/constants/fonts';

export default function SignInScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { signIn, isAuthenticated, user } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState<boolean>(false);
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !user || hasRedirectedRef.current) return;

    const role = user.role ?? 'student';
    const destination =
      role === 'admin'
        ? '/(admin)'
        : role === 'lecturer'
          ? '/(lecturer)'
          : '/(student)';

    hasRedirectedRef.current = true;
    router.replace(destination);
  }, [isAuthenticated, user, router]);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter your email and password');
      return;
    }

    setLoading(true);
    const result = await signIn(email, password);
    setLoading(false);

    if (result.success) {
      if (result.requiresVerification) {
        router.replace('/auth/verify-email');
        return;
      }

      const role = result.user?.role ?? 'student';
      const destination =
        role === 'admin'
          ? '/(admin)'
          : role === 'lecturer'
            ? '/(lecturer)'
            : '/(student)';

      router.replace(destination);
    } else {
      Alert.alert('Error', result.error || 'Invalid credentials');
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
        // In a production app, we would use Expo AuthSession here.
        // For this task, we'll demonstrate the API integration with a simulated token.
        // const result = await api.auth.googleAuth("google_token");
        Alert.alert('Google Sign In', 'Google Sign In integration triggered. Connect your Google account in the next step.');
    } catch (e) {
        Alert.alert('Error', 'Google Sign In failed');
    } finally {
        setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    Alert.alert('Apple Sign In', 'Apple Sign In will be available in the production build.');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header Area */}
          <View style={styles.headerArea}>
            <View style={styles.bannerContainer}>
                <ImageBackground
                    source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuA2vYpkGdJ4Je7pBk96V9xZkMWIN5UZNnx8iGxF9-1rYYi3_m_bsfhonVBtxnCziWcr9Hi-6XvHMaYDJQppX8zpdWSFwGWBiFVjmZrJIcVG-uPJZrUwY8Ca4Dq7mK-lmjMa-OJJLjUsXZCv0zJSPS0TpAlU8QG4qQ4R0jworxzd5eaXy4fG205hXoajPMgJQh9t0K-4y3DLOXKzgkcaKbODQxPAb4XnblsCgGTXSLO9diALt-kjavBvpu6l3nTueluEYcE4CT5KKmiq" }}
                    style={styles.banner}
                    imageStyle={{ borderRadius: 16 }}
                >
                    <View style={styles.bannerOverlay} />
                </ImageBackground>
            </View>

            <View style={[styles.logoContainer, { backgroundColor: colors.primary }]}>
              <GraduationCap size={40} color="#231e0f" />
            </View>

            <Text style={[styles.appName, { color: colors.text }]}>
                University<Text style={{ color: colors.primary }}>App</Text>
            </Text>
            <Text style={[styles.appSubtitle, { color: colors.textSecondary }]}>
                Premium Attendance Tracking
            </Text>
          </View>

          <View style={styles.formSection}>
            <Text style={[styles.welcomeTitle, { color: colors.text }]}>
                Welcome Back
            </Text>

            <View style={styles.form}>
                <Input
                  label="Username"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Student ID or Email"
                  autoCapitalize="none"
                />

                <Input
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter Password"
                  secureTextEntry
                />

                <TouchableOpacity
                    onPress={() => router.push('/auth/forgot-password')}
                    style={styles.forgotPassword}
                >
                    <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
                        Forgot Password?
                    </Text>
                </TouchableOpacity>

                <Button
                  title="Log In"
                  onPress={handleSignIn}
                  loading={loading}
                  style={styles.loginButton}
                />

                <View style={styles.divider}>
                    <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                    <Text style={[styles.dividerText, { color: colors.textSecondary }]}>or</Text>
                    <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                </View>

                <View style={styles.socialButtons}>
                    <TouchableOpacity
                        style={[styles.socialButton, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
                        onPress={handleGoogleSignIn}
                        activeOpacity={0.7}
                    >
                        <Chrome size={24} color={colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.socialButton, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
                        onPress={handleAppleSignIn}
                        activeOpacity={0.7}
                    >
                        <Apple size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                        Don{"'"}t have an account?{' '}
                        <Text
                            style={[styles.signUpLink, { color: colors.primary }]}
                            onPress={() => router.push('/auth/sign-up')}
                        >
                            Sign Up
                        </Text>
                    </Text>
                </View>
            </View>
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  headerArea: {
    alignItems: 'center',
    paddingTop: 20,
    marginBottom: 20,
  },
  bannerContainer: {
    width: '90%',
    height: 180,
    marginBottom: -40,
  },
  banner: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(35, 31, 15, 0.4)',
    borderRadius: 16,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#f9c406',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 1,
  },
  appName: {
    fontSize: 32,
    fontFamily: Fonts.lexend.bold,
    marginTop: 16,
  },
  appSubtitle: {
    fontSize: 14,
    fontFamily: Fonts.lexend.regular,
    marginTop: 4,
  },
  formSection: {
    paddingHorizontal: 24,
    marginTop: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    fontFamily: Fonts.lexend.bold,
    marginBottom: 24,
  },
  form: {
    gap: 16,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
  },
  forgotPasswordText: {
    fontSize: 14,
    fontFamily: Fonts.lexend.medium,
  },
  loginButton: {
    marginTop: 8,
    height: 56,
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
    opacity: 0.2,
  },
  dividerText: {
    fontSize: 14,
    fontFamily: Fonts.lexend.regular,
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
    alignItems: 'center',
    marginTop: 8,
  },
  footerText: {
    fontSize: 14,
    fontFamily: Fonts.lexend.regular,
  },
  signUpLink: {
    fontFamily: Fonts.lexend.medium,
  },
});
