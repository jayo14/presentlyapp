import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, ScrollView, Animated, KeyboardAvoidingView, Platform } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronLeft, Mail, CheckCircle, MailCheck, ClipboardPaste as ClipboardIcon } from 'lucide-react-native';
import Fonts from '@/constants/fonts';
import { Button } from '@/components/Button';
import * as Clipboard from 'expo-clipboard';


export default function VerifyEmailScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { verifyEmail, resendOTP, user } = useAuth();
  const params = useLocalSearchParams<{ step?: string; mode?: string }>();

  const [step, setStep] = useState<'sent' | 'otp'>(params.step === 'otp' ? 'otp' : 'sent');
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState<boolean>(false);
  const [timer, setTimer] = useState(59);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (params.step === 'otp') {
      setStep('otp');
    }
  }, [params.step]);

  useEffect(() => {
    if (step === 'otp') {
      const interval = setInterval(() => {
        setTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step]);

  const handleOtpChange = (index: number, value: string) => {
    // Handle paste or multiple digits
    if (value.length > 1) {
      const pastedData = value.replace(/\D/g, '').slice(0, 6);
      if (pastedData.length > 0) {
        const newOtp = [...otp];
        pastedData.split('').forEach((digit, i) => {
          if (i < 6) newOtp[i] = digit;
        });
        setOtp(newOtp);
        // Focus the last filled input or the first empty one
        const nextIndex = Math.min(pastedData.length, 5);
        inputRefs.current[nextIndex]?.focus();
      }
      return;
    }

    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = async () => {
    try {
      const clipboardContent = await Clipboard.getStringAsync();
      const pastedData = clipboardContent.replace(/\D/g, '').slice(0, 6);
      if (pastedData.length > 0) {
        const newOtp = [...otp];
        pastedData.split('').forEach((digit, i) => {
          if (i < 6) newOtp[i] = digit;
        });
        setOtp(newOtp);
        const nextIndex = Math.min(pastedData.length, 5);
        inputRefs.current[nextIndex]?.focus();
      } else {
        Alert.alert('Invalid Code', 'No valid numbers found in clipboard.');
      }
    } catch (e) {
      console.log('Paste error', e);
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) {
      Alert.alert('Error', 'Please enter the 6-digit code');
      return;
    }

    setLoading(true);
    const result = await verifyEmail(code);
    setLoading(false);

    if (result.success) {
      const destination = '/onboarding/role-selection';

      router.replace(destination);
    } else {
      Alert.alert('Error', result.error || 'Invalid code');
    }
  };

  if (step === 'sent') {
      return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={styles.headerBar}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <ChevronLeft size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Verification</Text>
                <TouchableOpacity onPress={() => {}} style={styles.helpButton}>
                    <Text style={[styles.helpText, { color: colors.primary }]}>Help</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.sentContent}>
                <View style={styles.iconContainer}>
                    <View style={styles.glowCircle} />
                    <View style={[styles.iconCircle, { backgroundColor: colors.primary + '1A', borderColor: colors.primary + '4D' }]}>
                        <Mail size={64} color={colors.primary} strokeWidth={1.5} />
                    </View>
                </View>

                <View style={styles.textSection}>
                    <Text style={[styles.sentTitle, { color: colors.primary }]}>Verify your Email</Text>
                    <Text style={[styles.sentSubtitle, { color: colors.textSecondary }]}>
                        We{"'"}ve sent a secure verification link to your university email address.
                    </Text>
                </View>

                <View style={styles.buttonSection}>
                    <Button
                        title="Check Inbox"
                        onPress={() => setStep('otp')}
                        style={styles.primaryBtn}
                    />
                    <TouchableOpacity
                        style={[styles.secondaryBtn, { borderColor: colors.border }]}
                        onPress={() => resendOTP()}
                    >
                        <Text style={[styles.secondaryBtnText, { color: colors.text }]}>Resend Email</Text>
                    </TouchableOpacity>
                </View>

                <Text style={[styles.footerNote, { color: colors.textSecondary }]}>
                    Didn{"'"}t receive the email? Check your spam folder or <Text style={{ color: colors.primary, textDecorationLine: 'underline' }}>contact support</Text>.
                </Text>
            </View>
        </SafeAreaView>
      );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => setStep('sent')} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Verification</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Enter the 6-digit code</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          We sent a code to your registered device.
        </Text>

        <TouchableOpacity 
          style={[styles.pasteButton, { backgroundColor: colors.surfaceHigh }]} 
          onPress={handlePaste}
          activeOpacity={0.7}
        >
          <ClipboardIcon size={16} color={colors.text} />
          <Text style={[styles.pasteButtonText, { color: colors.text }]}>Paste Code</Text>
        </TouchableOpacity>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => { if (ref) inputRefs.current[index] = ref; }}
              style={[
                styles.otpInput,
                {
                  backgroundColor: colors.input,
                  color: colors.text,
                  borderColor: digit || index === 0 ? colors.primary : 'rgba(255,255,255,0.1)',
                  borderWidth: 1,
                },
              ]}
              value={digit}
              onChangeText={(text) => handleOtpChange(index, text)}
              onKeyPress={({ nativeEvent: { key } }) => handleKeyPress(index, key)}
              keyboardType="number-pad"
              maxLength={index === 0 ? 6 : 1}
              accessible={true}
              accessibilityLabel={`OTP Digit ${index + 1}`}
              accessibilityHint="Enter one digit of the verification code"
              selectTextOnFocus
            />
          ))}
        </View>

        <View style={styles.timerContainer}>
          <Text style={[styles.timerText, { color: colors.textSecondary }]}>Resend code in </Text>
          <Text style={[styles.timerValue, { color: colors.primary }]}>
            00:{timer < 10 ? `0${timer}` : timer}
          </Text>
        </View>

        <Button
            title="Verify"
            onPress={handleVerify}
            loading={loading}
        />
      </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
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
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: Fonts.lexend.bold,
  },
  helpButton: {
      paddingHorizontal: 8,
  },
  helpText: {
      fontSize: 16,
      fontFamily: Fonts.lexend.bold,
  },
  sentContent: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
  },
  iconContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 32,
  },
  glowCircle: {
      position: 'absolute',
      width: 200,
      height: 200,
      borderRadius: 100,
      backgroundColor: 'rgba(249, 196, 6, 0.05)',
      // @ts-ignore
      filter: 'blur(30px)',
  },
  iconCircle: {
      width: 128,
      height: 128,
      borderRadius: 64,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
  },
  textSection: {
      alignItems: 'center',
      marginBottom: 40,
  },
  sentTitle: {
      fontSize: 28,
      fontFamily: Fonts.lexend.bold,
      marginBottom: 12,
  },
  sentSubtitle: {
      fontSize: 16,
      fontFamily: Fonts.lexend.regular,
      textAlign: 'center',
      lineHeight: 24,
      maxWidth: 300,
  },
  buttonSection: {
      width: '100%',
      gap: 16,
      marginBottom: 32,
  },
  primaryBtn: {
      height: 56,
      borderRadius: 16,
  },
  secondaryBtn: {
      height: 56,
      borderRadius: 16,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
  },
  secondaryBtnText: {
      fontSize: 16,
      fontFamily: Fonts.lexend.bold,
  },
  footerNote: {
      fontSize: 14,
      fontFamily: Fonts.lexend.regular,
      textAlign: 'center',
      paddingHorizontal: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontFamily: Fonts.lexend.bold,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: Fonts.lexend.regular,
    textAlign: 'center',
    marginBottom: 40,
    opacity: 0.6,
  },
  pasteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 24,
  },
  pasteButtonText: {
    fontSize: 14,
    fontFamily: Fonts.lexend.medium,
  },
  otpContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 40,
  },
  otpInput: {
    width: 44,
    height: 56,
    borderRadius: 12,
    fontSize: 20,
    fontFamily: Fonts.lexend.bold,
    textAlign: 'center',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  timerText: {
    fontSize: 14,
    fontFamily: Fonts.lexend.regular,
  },
  timerValue: {
    fontSize: 14,
    fontFamily: Fonts.lexend.bold,
  },
});
