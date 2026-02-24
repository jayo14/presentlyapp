import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform, ScrollView, Dimensions, Alert, Modal } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useAttendance } from '@/contexts/AttendanceContext';
import { ChevronLeft, CheckCircle, Keyboard, QrCode as QrIcon, Camera, X } from 'lucide-react-native';
import { CustomModal } from '@/components/CustomModal';
import Fonts from '@/constants/fonts';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { api } from '@/services/api';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');

export default function MarkAttendanceScreen() {
  const router = useRouter();
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const { colors, isDark } = useTheme();
  const { refreshData } = useAttendance();
  const [activeTab, setActiveTab] = useState<'qr' | 'code'>(tab === 'code' ? 'code' : 'qr');
  const [permission, requestPermission] = useCameraPermissions();
  
    const [sessionCode, setSessionCode] = useState<string[]>(new Array(8).fill(''));
  const [processing, setProcessing] = useState<boolean>(false);
  const inputs = useRef<TextInput[]>([]);

  const [scannedSession, setScannedSession] = useState<any>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

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

  const handleBarcodeScanned = async ({ data }: { data?: string }) => {
    if (processing || showConfirmModal) return;
    const code = (data || '').trim();
    if (!code) return;

    await verifyAndPrepareCheckIn(code);
  };

  const verifyAndPrepareCheckIn = async (code: string) => {
    try {
        setProcessing(true);
        const sessionInfo = await api.checkIn.get(code);
        setScannedSession({ ...sessionInfo, code });
        setShowConfirmModal(true);
    } catch (e: any) {
        console.error(e);
        showAlert('Error', e.response?.data?.detail || 'Invalid session code or session expired', 'error');
    } finally {
        setProcessing(false);
    }
  };

  const handleFinalCheckIn = async () => {
    if (!scannedSession || processing) return;

    try {
        setProcessing(true);

        let locationData = undefined;
        if (scannedSession.require_gps) {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                showAlert('Permission Denied', 'Location access is required for this session', 'error');
                setProcessing(false);
                return;
            }
            const loc = await Location.getCurrentPositionAsync({});
            locationData = {
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude
            };
        }

        const response = await api.checkIn.mark(scannedSession.code, { location: locationData });

        if (response.success || response.id) {
            refreshData();
            router.push({
              pathname: '/(student)/attendance-success',
              params: {
                courseCode: scannedSession.course_code,
                courseName: scannedSession.course_name,
                location: scannedSession.venue_name || 'Assigned Venue',
                time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
              },
            });
        }
    } catch (e: any) {
        console.error(e);
        showAlert('Verification Failed', e.response?.data?.detail || 'Could not verify your presence. Please ensure you are within the venue.', 'error');
    } finally {
        setProcessing(false);
    }
  };

  const fullCode = sessionCode.join('');
    const isValidCode = fullCode.length === 8;

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

            {permission?.granted ? (
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
                    <TouchableOpacity style={[styles.permBtn, { backgroundColor: colors.primary }]} onPress={requestPermission}>
                        <Text style={styles.permBtnText}>Grant Access</Text>
                    </TouchableOpacity>
                </SafeAreaView>
            )}

            <SafeAreaView style={styles.qrOverlay}>
                <View style={styles.qrHeader}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.iconCircle}>
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

            <Modal visible={showConfirmModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.confirmCard, { backgroundColor: isDark ? '#2d281a' : '#FFF' }]}>
                        <View style={styles.confirmHeader}>
                            <View style={[styles.iconWrap, { backgroundColor: colors.primary + '1A' }]}>
                                <CheckCircle size={32} color={colors.primary} />
                            </View>
                            <TouchableOpacity onPress={() => setShowConfirmModal(false)}>
                                <X size={24} color="#999" />
                            </TouchableOpacity>
                        </View>

                        <Text style={[styles.confirmTitle, { color: colors.text }]}>Confirm Attendance</Text>
                        <View style={styles.sessionDetails}>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Course</Text>
                                <Text style={[styles.detailValue, { color: colors.text }]}>{scannedSession?.course_code} - {scannedSession?.course_name}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Venue</Text>
                                <Text style={[styles.detailValue, { color: colors.text }]}>{scannedSession?.venue_name || 'Main Campus'}</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.confirmBtn, { backgroundColor: colors.primary }]}
                            onPress={handleFinalCheckIn}
                            disabled={processing}
                        >
                            {processing ? <ActivityIndicator color="#0A0A0A" /> : <Text style={styles.confirmBtnText}>Confirm Presence</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Session Code</Text>
        <TouchableOpacity onPress={() => setActiveTab('qr')} style={styles.iconCircleGray}>
            <QrIcon size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            <Text style={[styles.headline, { color: colors.text }]}>Enter 8-Digit Code</Text>
            <Text style={[styles.subtext, { color: isDark ? 'rgba(255,255,255,0.6)' : '#666' }]}>
                Ask your lecturer for the unique code to confirm your attendance manually.
            </Text>

            <View style={styles.codeInputContainer}>
                <View style={styles.codeRow}>
                    {sessionCode.map((digit, i) => (
                        <TextInput
                            key={i}
                            ref={el => { if (el) inputs.current[i] = el; }}
                            style={[styles.digitInput, { color: colors.text, borderBottomColor: digit ? colors.primary : (isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB') }]}
                            maxLength={1}
                            value={digit}
                            onChangeText={(text) => handleCodeChange(text, i)}
                            onKeyPress={(e) => handleKeyPress(e, i)}
                            autoCapitalize="characters"
                        />
                    ))}
                </View>
            </View>

            <TouchableOpacity
                style={[styles.verifyBtn, { backgroundColor: colors.primary, opacity: isValidCode ? 1 : 0.6 }]}
                onPress={() => verifyAndPrepareCheckIn(fullCode)}
                disabled={!isValidCode || processing}
            >
                {processing ? <ActivityIndicator color="#0A0A0A" /> : <Text style={styles.verifyBtnText}>Verify Code</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={styles.switchTextBtn} onPress={() => setActiveTab('qr')}>
                <Text style={[styles.switchText, { color: colors.primary }]}>Switch to QR Scanner</Text>
            </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={showConfirmModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.confirmCard, { backgroundColor: isDark ? '#2d281a' : '#FFF' }]}>
                        <View style={styles.confirmHeader}>
                            <View style={[styles.iconWrap, { backgroundColor: colors.primary + '1A' }]}>
                                <CheckCircle size={32} color={colors.primary} />
                            </View>
                            <TouchableOpacity onPress={() => setShowConfirmModal(false)}>
                                <X size={24} color="#999" />
                            </TouchableOpacity>
                        </View>

                        <Text style={[styles.confirmTitle, { color: colors.text }]}>Confirm Attendance</Text>
                        <View style={styles.sessionDetails}>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Course</Text>
                                <Text style={[styles.detailValue, { color: colors.text }]}>{scannedSession?.course_code} - {scannedSession?.course_name}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Venue</Text>
                                <Text style={[styles.detailValue, { color: colors.text }]}>{scannedSession?.venue_name || 'Main Campus'}</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.confirmBtn, { backgroundColor: colors.primary }]}
                            onPress={handleFinalCheckIn}
                            disabled={processing}
                        >
                            {processing ? <ActivityIndicator color="#0A0A0A" /> : <Text style={styles.confirmBtnText}>Confirm Presence</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
  headline: { fontSize: 28, fontFamily: Fonts.lexend.bold, textAlign: 'center', marginBottom: 12 },
  subtext: { fontSize: 15, fontFamily: Fonts.lexend.regular, textAlign: 'center', lineHeight: 22, marginBottom: 48 },
  codeInputContainer: { width: '100%', marginBottom: 40 },
  codeRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  digitInput: { width: width * 0.12, height: 56, borderBottomWidth: 3, fontSize: 28, fontFamily: Fonts.lexend.bold, textAlign: 'center' },
  verifyBtn: { width: '100%', height: 60, borderRadius: 16, alignItems: 'center', justifyContent: 'center', shadowColor: '#f9c406', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 4 },
  verifyBtnText: { fontSize: 18, fontFamily: Fonts.lexend.bold, color: '#0A0A0A' },
  switchTextBtn: { marginTop: 24 },
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
  corner: { position: 'absolute', width: 40, height: 40, borderWidth: 4 },
  tl: { top: height * 0.3, left: width * 0.2, borderRightWidth: 0, borderBottomWidth: 0 },
  tr: { top: height * 0.3, right: width * 0.2, borderLeftWidth: 0, borderBottomWidth: 0 },
  bl: { bottom: height * 0.3, left: width * 0.2, borderRightWidth: 0, borderTopWidth: 0 },
  br: { bottom: height * 0.3, right: width * 0.2, borderLeftWidth: 0, borderTopWidth: 0 },
  qrFooter: { padding: 40, alignItems: 'center', gap: 24 },
  qrHint: { color: '#FFF', textAlign: 'center', opacity: 0.8, fontSize: 14, fontFamily: Fonts.lexend.medium },
  switchBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 30, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  switchBtnText: { color: '#FFF', fontFamily: Fonts.lexend.bold, fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 24 },
  confirmCard: { borderRadius: 24, padding: 24, gap: 16 },
  confirmHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  iconWrap: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  confirmTitle: { fontSize: 22, fontFamily: Fonts.lexend.bold, marginTop: 8 },
  sessionDetails: { gap: 12, marginVertical: 12 },
  detailRow: { gap: 4 },
  detailLabel: { fontSize: 10, fontFamily: Fonts.lexend.bold, color: '#999', textTransform: 'uppercase' },
  detailValue: { fontSize: 16, fontFamily: Fonts.lexend.medium },
  confirmBtn: { height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  confirmBtnText: { fontSize: 16, fontFamily: Fonts.lexend.bold, color: '#0A0A0A' }
});
