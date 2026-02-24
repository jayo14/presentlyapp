import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform, ScrollView, Dimensions } from 'react-native';
import { useState, useRef } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useAttendance } from '@/contexts/AttendanceContext';
import { ChevronLeft, CheckCircle } from 'lucide-react-native';
import { CustomModal } from '@/components/CustomModal';
import Fonts from '@/constants/fonts';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function MarkAttendanceScreen() {
  const router = useRouter();
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const { colors, isDark } = useTheme();
  const { getActiveSession, markAttendance } = useAttendance();
  const [activeTab, setActiveTab] = useState<'qr' | 'code'>(tab === 'code' ? 'code' : 'qr');
  const [permission, requestPermission] = useCameraPermissions();
  
  const [sessionCode, setSessionCode] = useState<string[]>(new Array(8).fill(''));
  const [processing, setProcessing] = useState<boolean>(false);
  const inputs = useRef<TextInput[]>([]);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scanLocked, setScanLocked] = useState<boolean>(false);

  const activeSession = getActiveSession();

  // Alert State
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'info' | 'error' | 'success';
    onConfirm: () => void;
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: () => {},
  });

  const showAlert = (title: string, message: string, type: 'info' | 'error' | 'success' = 'info') => {
    setAlertConfig({
      visible: true,
      title,
      message,
      type,
      onConfirm: () => setAlertConfig(prev => ({ ...prev, visible: false })),
    });
  };

  const handleCodeChange = (text: string, index: number) => {
    const newCode = [...sessionCode];
    newCode[index] = text.toUpperCase();
    setSessionCode(newCode);

    if (text && index < 7) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !sessionCode[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleBarcodeScanned = ({ data }: { data?: string }) => {
    if (scanLocked) return;
    const value = (data || '').trim();
    if (!value) return;
    setScanLocked(true);
    setScanResult(value.toUpperCase());
  };

  const resetScan = () => {
    setScanLocked(false);
    setScanResult(null);
  };

  const fullCode = sessionCode.join('');
  const isValidCode = fullCode.length === 8;
  const scanCode = (scanResult || '').toUpperCase();
  const isValidScan = scanCode.length === 8;

  const handleVerify = async () => {
    if (!isValidCode || processing) return;
    setProcessing(true);

    const result = await markAttendance(fullCode);
    setProcessing(false);

    if (result.success) {
        router.push({
          pathname: '/(student)/attendance-success',
          params: {
            courseCode: activeSession?.courseCode || 'CS102',
            courseName: activeSession?.courseName || 'Data Structures',
            location: activeSession?.venueName || 'Hall A',
            time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
          },
        });
    } else {
        showAlert('Error', result.error || 'Invalid session code. Please try again.', 'error');
    }
  };

  const handleScanVerify = async () => {
    if (!isValidScan || processing) return;
    setProcessing(true);

    const result = await markAttendance(scanCode);
    setProcessing(false);

    if (result.success) {
        router.push({
          pathname: '/(student)/attendance-success',
          params: {
            courseCode: activeSession?.courseCode || 'CS102',
            courseName: activeSession?.courseName || 'Data Structures',
            location: activeSession?.venueName || 'Hall A',
            time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
          },
        });
    } else {
        showAlert('Error', result.error || 'Invalid QR code. Please try again.', 'error');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <CustomModal
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onConfirm={alertConfig.onConfirm}
      />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Attendance Hub</Text>
        <View style={{ width: 44 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={[styles.tabSwitcher, { backgroundColor: isDark ? '#2d281a' : '#F1F5F9' }]}>            
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'qr' && { backgroundColor: colors.primary }
              ]}
              onPress={() => setActiveTab('qr')}
              activeOpacity={0.85}
            >
              <Text style={[styles.tabText, activeTab === 'qr' && styles.tabTextActive]}>QR Scan</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'code' && { backgroundColor: colors.primary }
              ]}
              onPress={() => setActiveTab('code')}
              activeOpacity={0.85}
            >
              <Text style={[styles.tabText, activeTab === 'code' && styles.tabTextActive]}>Session Code</Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'qr' ? (
            <View style={styles.tabContent}>
              <Text style={[styles.headline, { color: colors.text }]}>Scan QR Code</Text>
              <Text style={[styles.subtext, { color: isDark ? 'rgba(255,255,255,0.7)' : '#666666' }]}>
                Point your camera at the QR code displayed by your lecturer.
              </Text>

              {permission?.granted ? (
                <View style={styles.cameraCard}>
                  <CameraView
                    style={styles.camera}
                    facing="back"
                    onBarcodeScanned={scanLocked ? undefined : handleBarcodeScanned}
                    barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                  />
                  <View style={styles.cameraOverlay}>
                    <View style={[styles.scanFrame, { borderColor: colors.primary }]} />
                    <Text style={[styles.scanHint, { color: colors.text }]}>Align QR inside the frame</Text>
                  </View>
                </View>
              ) : (
                <View style={[styles.permissionCard, { backgroundColor: isDark ? '#2d281a' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#E2E8F0' }]}>                  
                  <Text style={[styles.permissionText, { color: colors.text }]}>Camera access is required to scan QR codes.</Text>
                  <TouchableOpacity
                    style={[styles.permissionBtn, { backgroundColor: colors.primary }]}
                    onPress={() => requestPermission()}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.permissionBtnText}>Enable Camera</Text>
                  </TouchableOpacity>
                </View>
              )}

              {scanCode.length > 0 && (
                <View style={[styles.scanResultCard, { backgroundColor: colors.primary + '14', borderColor: colors.primary + '33' }]}>                  
                  <View style={styles.scanResultRow}>
                    <CheckCircle size={18} color={isValidScan ? colors.primary : '#EF4444'} />
                    <Text style={[styles.scanResultText, { color: colors.text }]}>
                      {isValidScan ? `Scanned: ${scanCode}` : 'Invalid QR code format'}
                    </Text>
                  </View>
                  <View style={styles.scanActionRow}>
                    <TouchableOpacity
                      style={[styles.scanSecondaryBtn, { borderColor: colors.primary }]}
                      onPress={resetScan}
                      activeOpacity={0.85}
                    >
                      <Text style={[styles.scanSecondaryText, { color: colors.primary }]}>Scan Again</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.scanPrimaryBtn, { backgroundColor: colors.primary, opacity: isValidScan ? 1 : 0.6 }]}
                      onPress={handleScanVerify}
                      disabled={!isValidScan || processing}
                      activeOpacity={0.85}
                    >
                      {processing ? (
                        <ActivityIndicator color="#231e0f" />
                      ) : (
                        <Text style={styles.scanPrimaryText}>Confirm</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.tabContent}>
              <Text style={[styles.headline, { color: colors.text }]}>Enter Session Code</Text>
              <Text style={[styles.subtext, { color: isDark ? 'rgba(255,255,255,0.7)' : '#666666' }]}>            
                Ask your lecturer for the 8-digit code to confirm your attendance.
              </Text>

              <View style={styles.codeInputContainer}>
                <View style={styles.codeRow}>
                  {sessionCode.slice(0, 4).map((digit, i) => (
                    <TextInput
                      key={i}
                      ref={el => { if (el) inputs.current[i] = el; }}
                      style={[styles.digitInput, { color: colors.text, borderBottomColor: digit ? colors.primary : colors.primary + '66' }]}
                      maxLength={1}
                      value={digit}
                      onChangeText={(text) => handleCodeChange(text, i)}
                      onKeyPress={(e) => handleKeyPress(e, i)}
                      autoCapitalize="characters"
                    />
                  ))}
                </View>
                <View style={styles.codeRow}>
                  {sessionCode.slice(4, 8).map((digit, i) => (
                    <TextInput
                      key={i + 4}
                      ref={el => { if (el) inputs.current[i + 4] = el; }}
                      style={[styles.digitInput, { color: colors.text, borderBottomColor: digit ? colors.primary : colors.primary + '66' }]}
                      maxLength={1}
                      value={digit}
                      onChangeText={(text) => handleCodeChange(text, i + 4)}
                      onKeyPress={(e) => handleKeyPress(e, i + 4)}
                      autoCapitalize="characters"
                    />
                  ))}
                </View>
              </View>

              {isValidCode && (
                <View style={[styles.validationChip, { backgroundColor: colors.primary + '1A' }]}>
                  <CheckCircle size={18} color={colors.primary} />
                  <Text style={[styles.validationText, { color: colors.primary }]}>Valid code format detected</Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.verifyBtn, { backgroundColor: colors.primary, opacity: isValidCode ? 1 : 0.6 }]}
                onPress={handleVerify}
                disabled={!isValidCode || processing}
                activeOpacity={0.8}
              >
                {processing ? (
                    <ActivityIndicator color="#231e0f" />
                ) : (
                    <Text style={styles.verifyBtnText}>Verify Presence</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
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
  scrollContent: {
    paddingHorizontal: 24,
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 40,
    gap: 28,
  },
  tabSwitcher: {
    width: '100%',
    flexDirection: 'row',
    padding: 6,
    borderRadius: 16,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 13,
    fontFamily: Fonts.lexend.medium,
    color: '#6b7280',
  },
  tabTextActive: {
    color: '#231e0f',
    fontFamily: Fonts.lexend.bold,
  },
  tabContent: {
    width: '100%',
    alignItems: 'center',
  },
  headline: {
    fontSize: 32,
    fontFamily: Fonts.lexend.bold,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtext: {
    fontSize: 16,
    fontFamily: Fonts.lexend.regular,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  codeInputContainer: {
    width: '100%',
    gap: 20,
    marginBottom: 32,
  },
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  digitInput: {
    width: width * 0.15,
    height: 56,
    borderBottomWidth: 3,
    fontSize: 28,
    fontFamily: Fonts.lexend.bold,
    textAlign: 'center',
  },
  validationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
    gap: 8,
    marginBottom: 32,
  },
  validationText: {
    fontSize: 14,
    fontFamily: Fonts.lexend.medium,
  },
  verifyBtn: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#f9c406',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  verifyBtnText: {
    fontSize: 18,
    fontFamily: Fonts.lexend.bold,
    color: '#231e0f',
  },
  cameraCard: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    height: 320,
  },
  camera: {
    width: '100%',
    height: '100%',
  },
  cameraOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.15)',
    paddingBottom: 20,
  },
  scanFrame: {
    width: 180,
    height: 180,
    borderWidth: 2,
    borderRadius: 18,
  },
  scanHint: {
    marginTop: 16,
    fontSize: 14,
    fontFamily: Fonts.lexend.medium,
  },
  permissionCard: {
    width: '100%',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    gap: 16,
  },
  permissionText: {
    fontSize: 15,
    fontFamily: Fonts.lexend.medium,
    textAlign: 'center',
    lineHeight: 22,
  },
  permissionBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
  },
  permissionBtnText: {
    fontSize: 14,
    fontFamily: Fonts.lexend.bold,
    color: '#231e0f',
  },
  scanResultCard: {
    width: '100%',
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 14,
  },
  scanResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  scanResultText: {
    fontSize: 14,
    fontFamily: Fonts.lexend.medium,
    flex: 1,
  },
  scanActionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  scanSecondaryBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  scanSecondaryText: {
    fontSize: 14,
    fontFamily: Fonts.lexend.medium,
  },
  scanPrimaryBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanPrimaryText: {
    fontSize: 14,
    fontFamily: Fonts.lexend.bold,
    color: '#231e0f',
  }
});
