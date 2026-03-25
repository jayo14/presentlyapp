import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, Alert, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { ChevronLeft, ShieldCheck, Download, AlertCircle, CheckCircle2, X } from 'lucide-react-native';
import Fonts from '@/constants/fonts';
import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import Svg, { Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');

export default function ExamClearanceScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [clearances, setClearances] = useState<any[]>([]);

  useEffect(() => {
    fetchClearances();
  }, []);

  const fetchClearances = async () => {
    try {
      setLoading(true);
      const data: any = await api.examClearance.list();
      setClearances(Array.isArray(data) ? data : (data.results || []));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const calculateCertificate = async (id: string) => {
      try {
          const resp: any = await api.examClearance.getCertificate(id);
          if (resp.url) {
              Linking.openURL(resp.url);
          } else {
             Alert.alert('Processing', 'Your certificate is being generated. Please check back in a moment.');
          }
      } catch {
          Alert.alert('Error', 'Failed to generate certificate.');
      }
  };

  const circumference = 2 * Math.PI * 40;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Exam Clearance</Text>
        <View style={{ width: 44 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : clearances.length === 0 ? (
        <View style={styles.center}>
          <ShieldCheck size={64} color={colors.textSecondary} opacity={0.3} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No Clearance Found</Text>
          <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>Your attendance records have not been analyzed for exam clearance yet.</Text>
          <TouchableOpacity style={[styles.refreshBtn, { backgroundColor: colors.primary }]} onPress={fetchClearances}>
              <Text style={styles.refreshBtnText}>Refresh Status</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={[styles.infoCard, { backgroundColor: isDark ? '#1A1A1A' : '#F9FAFB' }]}>
              <AlertCircle size={20} color={colors.primary} />
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                  You need a minimum of 75% attendance to qualify for each exam.
              </Text>
          </View>

          {clearances.map((c, i) => {
            const percentage = Math.round(c.attendance_percentage || 0);
            const isCleared = c.status === 'CLEARED' || percentage >= 75;
            const strokeDashoffset = circumference - (percentage / 100) * circumference;

            return (
              <View key={i} style={[styles.card, { backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#E2E8F0' }]}>
                <View style={styles.cardMain}>
                    <View style={styles.progressContainer}>
                        <Svg width="60" height="60" viewBox="0 0 100 100">
                            <Circle cx="50" cy="50" r="40" stroke={isDark ? '#333' : '#F1F5F9'} strokeWidth="8" fill="none" />
                            <Circle 
                                cx="50" cy="50" r="40" 
                                stroke={isCleared ? colors.primary : '#EF4444'} 
                                strokeWidth="8" fill="none" 
                                strokeDasharray={`${circumference} ${circumference}`}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round" transform="rotate(-90 50 50)" 
                            />
                        </Svg>
                        <View style={styles.progressTextOverlay}>
                            <Text style={[styles.progressValText, { color: colors.text }]}>{percentage}%</Text>
                        </View>
                    </View>
                    
                    <View style={styles.cardInfo}>
                        <Text style={[styles.courseCode, { color: colors.text }]}>{c.course_code}</Text>
                        <Text style={[styles.courseName, { color: colors.textSecondary }]} numberOfLines={1}>{c.course_name}</Text>
                        <View style={styles.badgeRow}>
                            <View style={[styles.statusBadge, { backgroundColor: isCleared ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)' }]}>
                                {isCleared ? <CheckCircle2 size={12} color="#10B981" /> : <X size={12} color="#EF4444" />}
                                <Text style={[styles.statusText, { color: isCleared ? '#10B981' : '#EF4444' }]}>
                                    {isCleared ? 'Cleared' : 'Not Cleared'}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {isCleared && (
                        <TouchableOpacity 
                            style={[styles.downloadBtn, { backgroundColor: colors.primary + '15' }]}
                            onPress={() => calculateCertificate(c.id)}
                        >
                            <Download size={22} color={colors.primary} />
                        </TouchableOpacity>
                    )}
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  backButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontFamily: Fonts.lexend.bold },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyTitle: { fontSize: 20, fontFamily: Fonts.lexend.bold, marginTop: 20 },
  emptyDesc: { fontSize: 14, fontFamily: Fonts.lexend.regular, textAlign: 'center', marginTop: 8 },
  refreshBtn: { marginTop: 32, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  refreshBtnText: { color: '#0A0A0A', fontFamily: Fonts.lexend.bold },
  scrollContent: { padding: 20 },
  infoCard: { flexDirection: 'row', gap: 12, padding: 16, borderRadius: 16, marginBottom: 24, alignItems: 'center' },
  infoText: { flex: 1, fontSize: 13, fontFamily: Fonts.lexend.medium, lineHeight: 18 },
  card: { borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
  cardMain: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  progressContainer: { width: 60, height: 60, alignItems: 'center', justifyContent: 'center' },
  progressTextOverlay: { position: 'absolute' },
  progressValText: { fontSize: 12, fontFamily: Fonts.lexend.bold },
  cardInfo: { flex: 1 },
  courseCode: { fontSize: 16, fontFamily: Fonts.lexend.bold, marginBottom: 2 },
  courseName: { fontSize: 13, fontFamily: Fonts.lexend.regular, marginBottom: 8 },
  badgeRow: { flexDirection: 'row' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 11, fontFamily: Fonts.lexend.bold },
  downloadBtn: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
});
