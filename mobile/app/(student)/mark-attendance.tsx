import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform, ScrollView, Dimensions, Alert, Linking } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useAttendance } from '@/contexts/AttendanceContext';
import { ChevronLeft, Keyboard, QrCode as QrIcon, Camera, X, Clipboard as ClipboardIcon, MapPin, ShieldCheck, AlertCircle } from 'lucide-react-native';
import { CustomModal } from '@/components/CustomModal';
import Fonts from '@/constants/fonts';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { api } from '@/services/api';
import { enrollmentsService } from '@/services/enrollments';
import * as Location from 'expo-location';
import * as Clipboard from 'expo-clipboard';
import { useAttendanceSession } from '@/hooks/useAttendanceSession';
import type { SessionConfig } from '@/utils/attendanceScoring';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

const { width, height } = Dimensions.get('window');

export default function MarkAttendanceScreen() {
  const router = useRouter();
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const { colors, isDark } = useTheme();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const bottomDockOffset = tabBarHeight + insets.bottom;
  const { refreshData } = useAttendance();
  
  const [activeTab, setActiveTab] = useState<'qr' | 'code'>(tab === 'code' ? 'code' : 'qr');
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [locationPermission, setLocationPermission] = useState<Location.LocationPermissionResponse | null>(null);

  const [sessionCode, setSessionCode] = useState<string>('');
  const [sessionConfig, setSessionConfig] = useState<SessionConfig | null>(null);
  const [fetchingSession, setFetchingSession] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<any>(null);

  const {
    status,
    windowProgress,
    sampleCount,
    error,
    startSession,
    cancelSession,
  } = useAttendanceSession(sessionConfig);

  const inputRef = useRef<TextInput>(null);

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

  useEffect(() => {
    (async () => {
      const resp = await Location.getForegroundPermissionsAsync();
      setLocationPermission(resp);
    })();
  }, []);

  useEffect(() => {
    if (status === 'submitted') {
      refreshData();
      router.push({
        pathname: '/(student)/attendance-success',
        params: {
          courseCode: sessionInfo?.course_code || 'COURSE',
          courseName: sessionInfo?.course_name || 'Verification Complete',
          location: sessionInfo?.venue_name || 'Assigned Venue',
          time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        },
      });
    } else if (status === 'queued') {
        showAlert('Saved Offline', 'You are offline. Your attendance has been queued and will be submitted once you are back online.', 'success');
        router.canGoBack() ? router.back() : router.replace("/");
    }
  }, [status]);

  const handleCodeChange = (text: string) => {
    const cleaned = text.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
    setSessionCode(cleaned);
  };

  const handleBarcodeScanned = async ({ data }: { data?: string }) => {
    if (status !== 'idle' || fetchingSession) return;
    let code = (data || '').trim();
    if (!code) return;

    if (code.includes('/check-in/')) {
        const parts = code.split('/check-in/');
        if (parts.length > 1) {
            code = parts[1].split(/[?#/]/)[0];
        }
    }
    code = code.toUpperCase();
    await initializeSession(code);
  };

  const initializeSession = async (code: string) => {
    try {
      setFetchingSession(true);
      const normalizedCode = code.toUpperCase().trim();
      const info: any = await api.checkIn.get(normalizedCode);
      setSessionInfo(info);

      // Enrollment Check
      try {
        const enrollData = await enrollmentsService.list({ course: info.course_id });
        const enrollments: any[] = enrollData.results ?? (Array.isArray(enrollData) ? enrollData : []);
        if (!enrollments.some((e: any) => e.is_active === true)) {
          showAlert('Not Enrolled', 'You are not registered for this course. Please register first.', 'error');
          setFetchingSession(false);
          return;
        }
      } catch { /* let server handle it */ }

      const config: SessionConfig = {
        sessionId: info.uuid || info.id || info.session_id,
        sessionCode: normalizedCode,
        lecturerCoordinates: {
          lat: info.lecturer_latitude || info.latitude,
          lng: info.lecturer_longitude || info.longitude,
        },
        allowedRadiusMeters: info.allowed_radius || 100,
        requiredPresenceWindowMs: info.required_presence_window || 15000,
        minSamples: info.min_samples || 3,
        strictMode: info.strict_mode || false,
      };

      setSessionConfig(config);
      // Wait for hook to receive config in next render
      setTimeout(() => startSession(), 100);
    } catch (e: any) {
      const rawMsg = e.response?.data?.detail || e.response?.data?.reason || e.response?.data?.error || 'Invalid session code or session expired';
      const status = e.response?.status;
      let userFriendlyMsg = rawMsg;

      if (status === 429) {
        userFriendlyMsg = 'Too many check-in attempts. Please wait a moment and try again.';
      } else if (rawMsg.toLowerCase().includes('distance') || rawMsg.toLowerCase().includes('radius') || rawMsg.toLowerCase().includes('far from venue') || rawMsg.toLowerCase().includes('outside geofence') || rawMsg.toLowerCase().includes('outside area')) {
        userFriendlyMsg = 'Be in class and try again';
      } else if (rawMsg.toLowerCase().includes('closed') || rawMsg.toLowerCase().includes('expired') || rawMsg.toLowerCase().includes('ended') || rawMsg.toLowerCase().includes('no longer active')) {
        userFriendlyMsg = 'Attendance session has closed, ask your lecturers for more information';
      }

      showAlert('Error', userFriendlyMsg, 'error');
    } finally {
      setFetchingSession(false);
    }
  };

  const openSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  // 1. Permission Rationale
  if (!locationPermission?.granted) {
      return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.permissionContent}>
                <View style={[styles.iconBox, { backgroundColor: colors.primary + '20' }]}>
                    <MapPin size={40} color={colors.primary} />
                </View>
                <Text style={[styles.headline, { color: colors.text, marginTop: 24 }]}>Location Access</Text>
                <Text style={[styles.subtext, { color: isDark ? 'rgba(255,255,255,0.6)' : '#666', marginTop: 12 }]}>
                    Presently uses high-precision GPS to verify you are physically present in the lecture hall. Your location is only accessed during the 15-second verification window.
                </Text>
                
                <View style={styles.benefitRow}>
                    <ShieldCheck size={20} color={colors.primary} />
                    <Text style={[styles.benefitText, { color: colors.text }]}>Privacy-first: No continuous tracking</Text>
                </View>
                <View style={styles.benefitRow}>
                    <ShieldCheck size={20} color={colors.primary} />
                    <Text style={[styles.benefitText, { color: colors.text }]}>Encrypted: Signals are secured</Text>
                </View>

                <TouchableOpacity 
                    style={[styles.verifyBtn, { backgroundColor: colors.primary, marginTop: 40 }]}
                    onPress={async () => {
                        const resp = await Location.requestForegroundPermissionsAsync();
                        setLocationPermission(resp);
                        if (!resp.granted && !resp.canAskAgain) {
                            Alert.alert('Permission Required', 'Please enable location in settings to proceed.', [
                                { text: 'Open Settings', onPress: openSettings },
                                { text: 'Cancel', style: 'cancel' }
                            ]);
                        }
                    }}
                >
                    <Text style={styles.verifyBtnText}>Enable Location</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ marginTop: 20 }} onPress={() => router.canGoBack() ? router.back() : router.replace("/")}>
                    <Text style={{ color: colors.primary, fontFamily: Fonts.lexend.bold }}>Maybe Later</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
      );
  }

  // 2. Collection / Processing Overlay
  if (status === 'collecting' || status === 'processing') {
      return (
          <View style={[styles.container, { backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', padding: 30 }]}>
              <View style={styles.verifyingCard}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={styles.verifyingTitle}>
                      {status === 'collecting' ? 'Scanning Presence...' : 'Analyzing Signals...'}
                  </Text>
                  
                  <View style={styles.progressBarBg}>
                      <View style={[styles.progressBarFill, { backgroundColor: colors.primary, width: `${windowProgress}%` }]} />
                  </View>
                  
                  <Text style={styles.verifyingDesc}>
                      {status === 'collecting' 
                        ? `Collecting GPS samples (${sampleCount}/${sessionConfig?.minSamples || 3})` 
                        : 'Authenticating verification payload...'}
                  </Text>
                  
                  <View style={styles.warningBox}>
                      <AlertCircle size={16} color="#F9C406" />
                      <Text style={styles.warningText}>Keep the app open and stay in the lecture hall.</Text>
                  </View>

                  <TouchableOpacity style={styles.cancelBtn} onPress={cancelSession}>
                      <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
              </View>
          </View>
      );
  }

  if (activeTab === 'qr') {
    return (
      <View style={[styles.container, { backgroundColor: '#000' }]}>
        <CustomModal
          visible={alertConfig.visible}
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
          onConfirm={alertConfig.onConfirm}
        />

        {cameraPermission?.granted ? (
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            onBarcodeScanned={handleBarcodeScanned}
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          />
        ) : (
          <SafeAreaView style={styles.permissionScreen}>
            <Camera size={64} color={colors.primary} />
            <Text style={styles.permTitle}>Camera access required</Text>
            <Text style={styles.permDesc}>We need your camera to scan the session QR code.</Text>
            <TouchableOpacity style={[styles.permBtn, { backgroundColor: colors.primary }]} onPress={requestCameraPermission}>
              <Text style={styles.permBtnText}>Grant Access</Text>
            </TouchableOpacity>
          </SafeAreaView>
        )}

        <SafeAreaView style={styles.qrOverlay}>
          <View style={styles.qrHeader}>
            <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace("/")} style={styles.iconCircle}>
              <ChevronLeft size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.qrTitle}>Scan QR Code</Text>
            <View style={{ width: 44 }} />
          </View>

          <View style={styles.scannerTarget}>
            <View style={[styles.corner, styles.tl, { borderColor: colors.primary }]} />
            <View style={[styles.corner, styles.tr, { borderColor: colors.primary }]} />
            <View style={[styles.corner, styles.bl, { borderColor: colors.primary }]} />
            <View style={[styles.corner, styles.br, { borderColor: colors.primary }]} />
            
            {fetchingSession && (
                <View style={styles.processingOverlay}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.processingText}>Fetching Session...</Text>
                </View>
            )}
          </View>

          <View style={styles.qrFooter}>
            <Text style={styles.qrHint}>Position the QR code within the frame to automatically scan</Text>
            <TouchableOpacity
              style={[styles.switchBtn, { backgroundColor: 'rgba(255,255,255,0.1)' }]}
              onPress={() => setActiveTab('code')}
            >
              <Keyboard size={20} color="#FFF" />
              <Text style={styles.switchBtnText}>Switch to Code Entry</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

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
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace("/")} style={styles.backButton}>
          <ChevronLeft size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Session Code</Text>
        <TouchableOpacity onPress={() => setActiveTab('qr')} style={styles.iconCircleGray}>
          <QrIcon size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomDockOffset + 24 }]} keyboardShouldPersistTaps="handled">
          <Text style={[styles.headline, { color: colors.text }]}>Enter Session Code</Text>
          <Text style={[styles.subtext, { color: isDark ? 'rgba(255,255,255,0.6)' : '#666' }]}>
            Ask your lecturer for the unique code to confirm your attendance manually.
          </Text>

          <TouchableOpacity 
            style={styles.codeInputContainer} 
            onPress={() => inputRef.current?.focus()}
            activeOpacity={1}
            accessible={true}
            accessibilityLabel={`Session code input. Current value: ${sessionCode || 'empty'}`}
            accessibilityHint="Double tap to edit"
          >
            <View style={styles.codeRow}>
              {[...Array(8)].map((_, i) => (
                <View 
                  key={i} 
                  style={[
                    styles.digitBox, 
                    { 
                        borderBottomColor: sessionCode[i] ? colors.primary : (isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB'),
                        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'
                    }
                  ]}
                >
                  <Text style={[styles.digitText, { color: colors.text }]}>
                    {sessionCode[i] || ''}
                  </Text>
                </View>
              ))}
            </View>
            
            <TextInput
              ref={inputRef}
              style={styles.hiddenInput}
              value={sessionCode}
              onChangeText={handleCodeChange}
              maxLength={8}
              autoCapitalize="characters"
              autoCorrect={false}
              autoComplete="off"
              keyboardType="default"
              textContentType="none"
              caretHidden
            />
          </TouchableOpacity>

          <View style={styles.actionsContainer}>
            <TouchableOpacity 
                style={[styles.pasteBtn, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }]} 
                onPress={async () => {
                    const text = await Clipboard.getStringAsync();
                    if (text) handleCodeChange(text);
                }}
                accessibilityLabel="Paste code from clipboard"
            >
                <ClipboardIcon size={18} color={colors.text} />
                <Text style={[styles.pasteBtnText, { color: colors.text }]}>Paste Code</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.verifyBtn, { backgroundColor: colors.primary, opacity: sessionCode.length >= 6 ? 1 : 0.6 }]}
                onPress={() => initializeSession(sessionCode)}
                disabled={sessionCode.length < 6 || fetchingSession}
                accessibilityLabel="Mark Attendance"
                accessibilityRole="button"
            >
                {fetchingSession ? (
                    <ActivityIndicator color="#0A0A0A" size="small" />
                ) : (
                    <Text style={styles.verifyBtnText}>Mark Attendance</Text>
                )}
            </TouchableOpacity>
          </View>

          {error && (
              <View style={[styles.errorBox, { backgroundColor: colors.error + '15' }]}>
                  <AlertCircle size={18} color={colors.error} />
                  <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
              </View>
          )}

          <TouchableOpacity style={styles.switchTextBtn} onPress={() => setActiveTab('qr')}>
            <Text style={[styles.switchText, { color: colors.primary }]}>Switch to QR Scanner</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  backButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontFamily: Fonts.lexend.bold },
  iconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center' },
  iconCircleGray: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.05)', alignItems: 'center', justifyContent: 'center' },
  scrollContent: { paddingHorizontal: 24, alignItems: 'center', paddingTop: 60, paddingBottom: 40 },
  headline: { fontSize: 26, fontFamily: Fonts.lexend.bold, textAlign: 'center', marginBottom: 12 },
  subtext: { fontSize: 15, fontFamily: Fonts.lexend.regular, textAlign: 'center', lineHeight: 22, marginBottom: 40 },
  codeInputContainer: { width: '100%', marginBottom: 24, position: 'relative' },
  codeRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  digitBox: { width: width * 0.1, height: 56, borderBottomWidth: 3, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  digitText: { fontSize: 24, fontFamily: Fonts.lexend.bold, textAlign: 'center' },
  hiddenInput: { position: 'absolute', opacity: 0, width: '100%', height: '100%' },
  actionsContainer: { width: '100%', gap: 16, marginBottom: 24 },
  pasteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed' },
  pasteBtnText: { fontSize: 14, fontFamily: Fonts.lexend.medium },
  verifyBtn: { width: '100%', height: 60, borderRadius: 16, alignItems: 'center', justifyContent: 'center', shadowColor: '#f9c406', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 4 },
  verifyBtnText: { fontSize: 18, fontFamily: Fonts.lexend.bold, color: '#0A0A0A' },
  switchTextBtn: { marginTop: 8 },
  switchText: { fontSize: 14, fontFamily: Fonts.lexend.bold },
  permissionScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  permTitle: { fontSize: 20, fontFamily: Fonts.lexend.bold, color: '#FFF', marginTop: 24 },
  permDesc: { fontSize: 14, fontFamily: Fonts.lexend.regular, color: '#999', textAlign: 'center', marginTop: 8 },
  permBtn: { marginTop: 32, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  permBtnText: { color: '#0A0A0A', fontFamily: Fonts.lexend.bold },
  qrOverlay: { flex: 1 },
  qrHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10 },
  qrTitle: { color: '#FFF', fontSize: 18, fontFamily: Fonts.lexend.bold },
  scannerTarget: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  processingOverlay: { backgroundColor: 'rgba(0,0,0,0.7)', padding: 24, borderRadius: 20, alignItems: 'center', gap: 12 },
  processingText: { color: '#FFF', fontFamily: Fonts.lexend.medium, fontSize: 14 },
  corner: { position: 'absolute', width: 40, height: 40, borderWidth: 4 },
  tl: { top: height * 0.3, left: width * 0.2, borderRightWidth: 0, borderBottomWidth: 0 },
  tr: { top: height * 0.3, right: width * 0.2, borderLeftWidth: 0, borderBottomWidth: 0 },
  bl: { bottom: height * 0.3, left: width * 0.2, borderRightWidth: 0, borderTopWidth: 0 },
  br: { bottom: height * 0.3, right: width * 0.2, borderLeftWidth: 0, borderTopWidth: 0 },
  qrFooter: { padding: 40, paddingBottom: Platform.OS === 'ios' ? 140 : 120, alignItems: 'center', gap: 24 },
  qrHint: { color: '#FFF', textAlign: 'center', opacity: 0.8, fontSize: 14, fontFamily: Fonts.lexend.medium },
  switchBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 30, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  switchBtnText: { color: '#FFF', fontFamily: Fonts.lexend.bold, fontSize: 14 },
  permissionContent: { flex: 1, padding: 32, alignItems: 'center', justifyContent: 'center' },
  iconBox: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: 12, width: '100%', marginTop: 16, paddingHorizontal: 16 },
  benefitText: { fontSize: 14, fontFamily: Fonts.lexend.medium, opacity: 0.9 },
  verifyingCard: { backgroundColor: '#1A1A1A', width: '100%', borderRadius: 24, padding: 32, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  verifyingTitle: { color: '#FFF', fontSize: 20, fontFamily: Fonts.lexend.bold, marginTop: 20, marginBottom: 24 },
  progressBarBg: { width: '100%', height: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden', marginBottom: 12 },
  progressBarFill: { height: '100%', borderRadius: 4 },
  verifyingDesc: { color: '#AAA', fontSize: 14, fontFamily: Fonts.lexend.medium, textAlign: 'center' },
  warningBox: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(249, 196, 6, 0.1)', padding: 12, borderRadius: 12, marginTop: 32, width: '100%' },
  warningText: { color: '#F9C406', fontSize: 12, fontFamily: Fonts.lexend.medium, flex: 1 },
  cancelBtn: { marginTop: 32, paddingVertical: 10, paddingHorizontal: 20 },
  cancelBtnText: { color: '#FF4444', fontFamily: Fonts.lexend.bold, fontSize: 14 },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16, borderRadius: 12, width: '100%', marginBottom: 24 },
  errorText: { fontSize: 14, fontFamily: Fonts.lexend.medium, flex: 1 },
});
