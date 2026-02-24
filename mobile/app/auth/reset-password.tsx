import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { ChevronLeft, CheckCircle2, Circle, Check } from 'lucide-react-native';
import Fonts from '@/constants/fonts';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { resetPassword } = useAuth();
  const params = useLocalSearchParams<{ token?: string }>();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (!params.token) {
      Alert.alert('Error', 'Reset token is missing. Please use the link from your email.');
      return;
    }

    setLoading(true);
    const result = await resetPassword(String(params.token), password);
    setLoading(false);

    if (result.success) {
      setIsSuccess(true);
      return;
    }

    Alert.alert('Error', result.error || 'Failed to reset password');
  };

  if (isSuccess) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.successContent}>
          <Text style={[styles.headerMinimal, { color: colors.textSecondary }]}>ACCOUNT RECOVERY</Text>

          <View style={styles.successIconSection}>
            <View style={styles.glowOuterSuccess} />
            <View style={styles.glowInnerSuccess} />
            <View style={[styles.successIconCircle, { borderColor: colors.primary + '33', backgroundColor: colors.primary + '1A' }]}>
              <Check size={64} color={colors.primary} strokeWidth={3} />
            </View>
          </View>

          <View style={styles.successTextSection}>
            <Text style={[styles.successTitle, { color: colors.text }]}>
                Password Reset{'\n'}Successful!
            </Text>
            <Text style={[styles.successSubtitle, { color: colors.textSecondary }]}>
                You can now use your new password to log in to the university attendance portal.
            </Text>
          </View>

          <Button
            title="Back to Login"
            onPress={() => router.replace('/auth/sign-in')}
            style={styles.backToLoginButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Reset Password</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Create new password</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Your new password must be different from previous used passwords.
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="New Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter new password"
              secureTextEntry
            />

            <View style={styles.validationRow}>
              <View style={styles.validationItem}>
                <CheckCircle2 size={16} color={colors.primary} />
                <Text style={[styles.validationText, { color: colors.primary }]}>8+ chars</Text>
              </View>
              <View style={styles.validationItem}>
                <CheckCircle2 size={16} color={colors.primary} />
                <Text style={[styles.validationText, { color: colors.primary }]}>1 number</Text>
              </View>
              <View style={styles.validationItem}>
                <Circle size={16} color={colors.textSecondary} />
                <Text style={[styles.validationText, { color: colors.textSecondary }]}>1 special char</Text>
              </View>
            </View>

            <Input
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Re-enter new password"
              secureTextEntry
            />
            <Text style={[styles.hintText, { color: colors.textSecondary }]}>Both passwords must match.</Text>

            <Button
              title="Update Password"
              onPress={handleResetPassword}
              loading={loading}
              style={styles.updateButton}
            />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: Fonts.lexend.bold,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    marginTop: 20,
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontFamily: Fonts.lexend.bold || Fonts.lexend.bold,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: Fonts.lexend.regular,
    lineHeight: 24,
  },
  form: {
    gap: 20,
  },
  validationRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: -8,
    paddingHorizontal: 4,
  },
  validationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  validationText: {
    fontSize: 12,
    fontFamily: Fonts.lexend.medium,
  },
  hintText: {
    fontSize: 12,
    fontFamily: Fonts.lexend.regular,
    marginTop: -12,
    paddingHorizontal: 4,
  },
  updateButton: {
    marginTop: 24,
    height: 56,
  },
  successContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  headerMinimal: {
    fontSize: 12,
    fontFamily: Fonts.lexend.medium,
    letterSpacing: 1.5,
    position: 'absolute',
    top: 20,
  },
  successIconSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  glowOuterSuccess: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(249, 196, 6, 0.05)',
    // @ts-ignore
    filter: 'blur(30px)',
  },
  glowInnerSuccess: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(249, 196, 6, 0.1)',
    // @ts-ignore
    filter: 'blur(20px)',
  },
  successIconCircle: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTextSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  successTitle: {
    fontSize: 30,
    fontFamily: Fonts.lexend.bold,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 38,
  },
  successSubtitle: {
    fontSize: 16,
    fontFamily: Fonts.lexend.regular,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.7,
  },
  backToLoginButton: {
    height: 56,
    borderRadius: 28,
  },
});
