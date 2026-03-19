import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Dimensions, ActivityIndicator, RefreshControl, Modal, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { ChevronLeft, MoreHorizontal, QrCode, StopCircle, MapPin, CheckCircle2, XCircle, Flag, FileText, Copy, X } from 'lucide-react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Fonts from '@/constants/fonts';
import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import * as Clipboard from 'expo-clipboard';
import QRCode from 'react-native-qrcode-svg';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

const { width, height } = Dimensions.get('window');

export default function SessionScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { colors, isDark } = useTheme();
    const tabBarHeight = useBottomTabBarHeight();
    const insets = useSafeAreaInsets();
    const bottomDockOffset = tabBarHeight + insets.bottom;
  const [session, setSession] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [showQRModal, setShowQRModal] = useState(false);

  const loadData = async () => {
    try {
        if (id) {
            const [sessionData, analyticsData] = await Promise.all([
                api.sessions.get(id as string),
                api.analytics.getSessionAnalytics(id as string)
            ]);
            setSession(sessionData);
            setAnalytics(analyticsData);
        }
    } catch (e) {
        console.error('Failed to load session data', e);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    let interval: any;
    if (session?.is_active) {
        interval = setInterval(loadData, 10000);
    }
    return () => clearInterval(interval);
  }, [id, session?.is_active]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied', 'Session code copied to clipboard');
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (session?.is_active) {
      return renderActiveSession();
  }

  return renderSessionSummary();

  function renderActiveSession() {
      const courseTitle = session?.course_name || 'Class Session';
      const courseCode = session?.course_code || 'CS';
      const displayCode = session?.session_code || '--- ---';
      const presentCount = session?.attendee_count || 0;
      const totalCount = session?.enrolled_students_count || 100;
      const venue = session?.venue_name || 'Location Not Specified';

      return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ChevronLeft size={28} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Active Session Control</Text>
                <TouchableOpacity style={styles.moreButton}>
                    <MoreHorizontal size={24} color={colors.text} />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomDockOffset + 24 }]}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
            >
                <Text style={[styles.courseHeadline, { color: colors.text }]}>{courseCode}: {courseTitle}</Text>

                <View style={styles.codeSection}>
                    <Text style={[styles.codeLabel, { color: colors.primary }]}>SESSION CODE</Text>
                    <TouchableOpacity
                        style={styles.codeRow}
                        onPress={() => copyToClipboard(displayCode)}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.codeValue, { color: colors.primary }]}>{displayCode}</Text>
                        <View style={[styles.copyIconBox, { backgroundColor: colors.primary + '1A' }]}>
                            <Copy size={20} color={colors.primary} />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.qrToggleBtn, { backgroundColor: colors.primary + '33', borderColor: colors.primary + '4D' }]}
                        onPress={() => setShowQRModal(true)}
                    >
                        <QrCode size={20} color={colors.primary} />
                        <Text style={[styles.qrToggleText, { color: colors.primary }]}>Show QR Code</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.counterSection}>
                    <View style={[styles.counterCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#E2E8F0' }]}>
                        <View style={styles.counterHeaderRow}>
                            <Text style={[styles.presentNum, { color: colors.primary }]}>{presentCount}</Text>
                            <Text style={[styles.totalNum, { color: isDark ? '#94A3B8' : '#666666' }]}> / {totalCount}</Text>
                        </View>
                        <Text style={[styles.counterLabel, { color: isDark ? '#94A3B8' : '#666666' }]}>Students Present</Text>
                        <View style={[styles.progressBg, { backgroundColor: isDark ? '#231e0f' : '#F1F5F9' }]}>
                            <View style={[styles.progressFill, { width: `${Math.min(100, (presentCount/totalCount)*100)}%`, backgroundColor: colors.primary }]} />
                        </View>
                    </View>
                </View>

                <View style={styles.actionSection}>
                    <TouchableOpacity
                        style={[styles.endSessionBtn, { backgroundColor: '#EF4444' }]}
                        onPress={async () => {
                            try {
                                await api.sessions.end(id as string);
                                loadData();
                            } catch (e) {
                                console.error(e);
                            }
                        }}
                    >
                        <StopCircle size={24} color="#FFFFFF" />
                        <Text style={styles.endSessionText}>End Session</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>

            <Modal visible={showQRModal} transparent animationType="slide">
                <View style={styles.qrModalOverlay}>
                    <SafeAreaView style={[styles.qrModalContent, { backgroundColor: isDark ? '#1A1A1A' : '#FFF' }]}>
                        <View style={styles.qrModalHeader}>
                            <TouchableOpacity onPress={() => setShowQRModal(false)} style={styles.closeBtn}>
                                <X size={28} color={colors.text} />
                            </TouchableOpacity>
                            <Text style={[styles.qrModalTitle, { color: colors.text }]}>Attendance QR</Text>
                            <View style={{ width: 44 }} />
                        </View>

                        <View style={styles.qrMain}>
                            <Text style={[styles.qrCourse, { color: colors.text }]}>{courseCode}: {courseTitle}</Text>
                            <View style={[styles.qrWrapper, { backgroundColor: '#FFF', padding: 24, borderRadius: 24 }]}>
                                <QRCode
                                    value={displayCode}
                                    size={width * 0.7}
                                    color="#000"
                                    backgroundColor="#FFF"
                                />
                            </View>
                            <Text style={[styles.qrHint, { color: isDark ? '#999' : '#666' }]}>Ask students to scan this code via the app</Text>

                            <View style={[styles.qrCodeBox, { backgroundColor: colors.primary + '1A' }]}>
                                <Text style={[styles.qrCodeLabel, { color: isDark ? colors.primary + 'B3' : colors.primary }]}>SESSION CODE</Text>
                                <Text style={[styles.qrCodeText, { color: colors.primary }]}>{displayCode}</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.qrCloseBtn, { backgroundColor: colors.primary }]}
                            onPress={() => setShowQRModal(false)}
                        >
                            <Text style={styles.qrCloseBtnText}>Close Scanner</Text>
                        </TouchableOpacity>
                    </SafeAreaView>
                </View>
            </Modal>
        </SafeAreaView>
      );
  }

  function renderSessionSummary() {
    const attendanceRate = analytics?.attendance_rate || 94;
    const presentCount = analytics?.present_count || 42;
    const absentCount = analytics?.absent_count || 3;
    const flaggedCount = analytics?.flagged_count || 0;
    const qrScans = analytics?.verification_methods?.qr || 35;
    const codeEntry = analytics?.verification_methods?.pin || 7;
    const absentStudents = analytics?.absent_students || [];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={styles.summaryHeader}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialIcons name="arrow-back-ios" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text, flex: 1, textAlign: 'center', marginRight: 44 }]}>Session Summary</Text>
            </View>

            <ScrollView
                contentContainerStyle={[styles.summaryContent, { paddingBottom: bottomDockOffset + 24 }]}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
            >
                <View style={[styles.heroCard, { backgroundColor: colors.primary + '1A', borderColor: colors.primary + '33' }]}>
                    <Text style={[styles.heroLabel, { color: isDark ? colors.primary + 'CC' : '#666' }]}>Attendance Rate</Text>
                    <Text style={[styles.heroValue, { color: colors.primary }]}>{attendanceRate}%</Text>
                    <Text style={[styles.heroSub, { color: isDark ? colors.primary + '99' : '#999' }]}>EXCELLENT ENGAGEMENT</Text>
                </View>

                <View style={styles.statsGrid}>
                    <View style={[styles.statItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FFF', borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#E2E8F0' }]}>
                        <CheckCircle2 size={24} color="#10B981" />
                        <View style={{ alignItems: 'center' }}>
                            <Text style={[styles.statNum, { color: colors.text }]}>{presentCount}</Text>
                            <Text style={styles.statLabel}>Present</Text>
                        </View>
                    </View>
                    <View style={[styles.statItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FFF', borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#E2E8F0' }]}>
                        <XCircle size={24} color="#EF4444" />
                        <View style={{ alignItems: 'center' }}>
                            <Text style={[styles.statNum, { color: colors.text }]}>{absentCount}</Text>
                            <Text style={styles.statLabel}>Absent</Text>
                        </View>
                    </View>
                    <View style={[styles.statItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FFF', borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#E2E8F0' }]}>
                        <Flag size={24} color="#F59E0B" />
                        <View style={{ alignItems: 'center' }}>
                            <Text style={[styles.statNum, { color: colors.text }]}>{flaggedCount}</Text>
                            <Text style={styles.statLabel}>Flagged</Text>
                        </View>
                    </View>
                </View>

                <Text style={[styles.sectionTitle, { color: colors.text }]}>Verification Method Split</Text>
                <View style={[styles.chartCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FFF', borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#E2E8F0' }]}>
                    <View style={styles.chartHeader}>
                        <View>
                            <Text style={[styles.chartTotal, { color: colors.text }]}>{presentCount}</Text>
                            <Text style={styles.chartSub}>Verified Students</Text>
                        </View>
                        <Text style={[styles.chartHint, { color: colors.primary }]}>QR Scans Preferred</Text>
                    </View>

                    <View style={styles.chartArea}>
                        <View style={styles.barWrap}>
                            <View style={[styles.bar, { backgroundColor: colors.primary, height: 120 }]} />
                            <Text style={styles.barLabel}>QR SCAN</Text>
                            <Text style={styles.barValue}>{qrScans} users</Text>
                        </View>
                        <View style={styles.barWrap}>
                            <View style={[styles.bar, { backgroundColor: colors.primary + '4D', height: 40 }]} />
                            <Text style={styles.barLabel}>CODE ENTRY</Text>
                            <Text style={styles.barValue}>{codeEntry} users</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.listHeaderRow}>
                    <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>Absent Students</Text>
                    <TouchableOpacity onPress={() => router.push(`/(lecturer)/session/override/${id}`)}>
                        <Text style={[styles.viewAll, { color: colors.primary }]}>View All</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.absentList}>
                    {absentStudents.length > 0 ? absentStudents.slice(0, 3).map((student: any, idx: number) => (
                        <View key={student.id || idx} style={[styles.absentCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FFF', borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#E2E8F0' }]}>
                            <View style={styles.absentAvatar}>
                                {student.profile_picture ? (
                                    <Image source={{ uri: student.profile_picture }} style={styles.absentImg} />
                                ) : (
                                    <Text style={[styles.absentInitial, { color: colors.text }]}>{(student.name || 'U')[0]}</Text>
                                )}
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.absentName, { color: colors.text }]}>{student.name || student.full_name}</Text>
                                <Text style={styles.absentId}>ID: {student.matric_number || student.matricNumber || student.id}</Text>
                            </View>
                            <TouchableOpacity style={[styles.notifyBtn, { borderColor: colors.primary }]}>
                                <Text style={[styles.notifyText, { color: colors.primary }]}>Notify</Text>
                            </TouchableOpacity>
                        </View>
                    )) : (
                        <Text style={styles.emptyText}>No absent students</Text>
                    )}
                </View>

                <TouchableOpacity style={[styles.pdfBtn, { backgroundColor: colors.primary }]}>
                    <FileText size={20} color="#0A0A0A" />
                    <Text style={styles.pdfBtnText}>Download PDF Report</Text>
                </TouchableOpacity>

                <View style={{ height: 100 }} />
            </ScrollView>
        </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  summaryHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  backButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontFamily: Fonts.lexend.bold },
  moreButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { paddingTop: 20 },
  summaryContent: { paddingHorizontal: 16, paddingTop: 12 },
  courseHeadline: { fontSize: 24, fontFamily: Fonts.lexend.bold, textAlign: 'center', paddingHorizontal: 20, marginBottom: 32 },
  codeSection: { alignItems: 'center', marginBottom: 40 },
  codeLabel: { fontSize: 14, fontFamily: Fonts.lexend.bold, letterSpacing: 4, marginBottom: 12 },
  codeRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
  codeValue: { fontSize: 42, fontFamily: Fonts.lexend.bold, letterSpacing: 8 },
  copyIconBox: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  qrToggleBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, height: 48, borderRadius: 16, borderWidth: 1, gap: 10 },
  qrToggleText: { fontSize: 14, fontFamily: Fonts.lexend.bold },
  counterSection: { paddingHorizontal: 16, marginBottom: 32 },
  counterCard: { borderRadius: 24, padding: 24, alignItems: 'center', borderWidth: 1 },
  counterHeaderRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 4 },
  presentNum: { fontSize: 40, fontFamily: Fonts.lexend.bold },
  totalNum: { fontSize: 20, fontFamily: Fonts.lexend.regular, marginBottom: 6 },
  counterLabel: { fontSize: 14, fontFamily: Fonts.lexend.medium, marginBottom: 16 },
  progressBg: { height: 8, width: '100%', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  actionSection: { paddingHorizontal: 16 },
  endSessionBtn: { height: 64, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, shadowColor: '#EF4444', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 4 },
  endSessionText: { fontSize: 18, fontFamily: Fonts.lexend.bold, color: '#FFFFFF' },
  heroCard: { borderRadius: 24, padding: 32, alignItems: 'center', borderWidth: 1, marginBottom: 16 },
  heroLabel: { fontSize: 16, fontFamily: Fonts.lexend.medium },
  heroValue: { fontSize: 64, fontFamily: Fonts.lexend.bold, marginVertical: 8 },
  heroSub: { fontSize: 10, fontFamily: Fonts.lexend.bold, letterSpacing: 2 },
  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statItem: { flex: 1, borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, gap: 8 },
  statNum: { fontSize: 20, fontFamily: Fonts.lexend.bold },
  statLabel: { fontSize: 12, fontFamily: Fonts.lexend.regular, color: '#999' },
  sectionTitle: { fontSize: 18, fontFamily: Fonts.lexend.bold, marginBottom: 16 },
  chartCard: { borderRadius: 24, padding: 24, borderWidth: 1, marginBottom: 24 },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 },
  chartTotal: { fontSize: 32, fontFamily: Fonts.lexend.bold },
  chartSub: { fontSize: 14, fontFamily: Fonts.lexend.regular, color: '#999' },
  chartHint: { fontSize: 12, fontFamily: Fonts.lexend.bold },
  chartArea: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 160 },
  barWrap: { alignItems: 'center', gap: 12, width: 100 },
  bar: { width: 48, borderRadius: 8 },
  barLabel: { fontSize: 10, fontFamily: Fonts.lexend.bold, color: '#999' },
  barValue: { fontSize: 10, fontFamily: Fonts.lexend.regular, color: '#666' },
  listHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  viewAll: { fontSize: 14, fontFamily: Fonts.lexend.medium },
  absentList: { gap: 12, marginBottom: 24 },
  absentCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 16, borderWidth: 1, gap: 12 },
  absentAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  absentImg: { width: '100%', height: '100%' },
  absentInitial: { fontSize: 16, fontFamily: Fonts.lexend.bold },
  absentName: { fontSize: 14, fontFamily: Fonts.lexend.semiBold },
  absentId: { fontSize: 12, fontFamily: Fonts.lexend.regular, color: '#999' },
  notifyBtn: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  notifyText: { fontSize: 12, fontFamily: Fonts.lexend.bold },
  pdfBtn: { height: 60, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, shadowColor: '#f9c406', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 4 },
  pdfBtnText: { fontSize: 16, fontFamily: Fonts.lexend.bold, color: '#0A0A0A' },
  emptyText: { textAlign: 'center', color: '#999', fontFamily: Fonts.lexend.medium },
  qrModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)' },
  qrModalContent: { flex: 1 },
  qrModalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  closeBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  qrModalTitle: { fontSize: 20, fontFamily: Fonts.lexend.bold },
  qrMain: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: 32 },
  qrCourse: { fontSize: 22, fontFamily: Fonts.lexend.bold, textAlign: 'center' },
  qrWrapper: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
  qrHint: { fontSize: 15, fontFamily: Fonts.lexend.medium, textAlign: 'center' },
  qrCodeBox: { paddingVertical: 20, paddingHorizontal: 40, borderRadius: 20, alignItems: 'center', gap: 8 },
  qrCodeLabel: { fontSize: 12, fontFamily: Fonts.lexend.bold, letterSpacing: 2 },
  qrCodeText: { fontSize: 32, fontFamily: Fonts.lexend.bold, letterSpacing: 4 },
  qrCloseBtn: { margin: 40, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  qrCloseBtnText: { fontSize: 18, fontFamily: Fonts.lexend.bold, color: '#0A0A0A' }
});
