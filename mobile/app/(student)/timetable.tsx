import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { ChevronLeft, Calendar, Clock, MapPin, Search } from 'lucide-react-native';
import Fonts from '@/constants/fonts';
import { useState, useEffect } from 'react';
import { api } from '@/services/api';

export default function TimetableScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [timetables, setTimetables] = useState<any[]>([]);

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      const data: any = await api.timetables.list();
      setTimetables(Array.isArray(data) ? data : (data.results || []));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace("/")} style={styles.backButton}>
          <ChevronLeft size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Class Timetable</Text>
        <TouchableOpacity style={styles.iconCircle}>
          <Search size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : timetables.length === 0 ? (
        <View style={styles.center}>
          <Calendar size={64} color={colors.textSecondary} opacity={0.3} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No Timetable Found</Text>
          <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>Your department has not uploaded a timetable yet.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {days.map((day) => {
            const sessions = timetables.filter(t => t.day === day);
            if (sessions.length === 0) return null;

            return (
              <View key={day} style={styles.daySection}>
                <Text style={[styles.dayTitle, { color: colors.primary }]}>{day.toUpperCase()}</Text>
                {sessions.map((item, idx) => (
                  <View key={idx} style={[styles.card, { backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#E2E8F0' }]}>
                    <View style={styles.cardHeader}>
                      <Text style={[styles.courseCode, { color: colors.text }]}>{item.course_code}</Text>
                      <View style={[styles.timeBadge, { backgroundColor: colors.primary + '20' }]}>
                        <Clock size={14} color={colors.primary} />
                        <Text style={[styles.timeText, { color: colors.primary }]}>{item.start_time.slice(0, 5)} - {item.end_time.slice(0, 5)}</Text>
                      </View>
                    </View>
                    <Text style={[styles.courseName, { color: colors.textSecondary }]}>{item.course_name}</Text>
                    <View style={styles.footer}>
                      <View style={styles.footerItem}>
                        <MapPin size={16} color={colors.textSecondary} />
                        <Text style={[styles.footerText, { color: colors.textSecondary }]}>{item.venue_name || 'TBA'}</Text>
                      </View>
                      <Text style={[styles.lecturer, { color: colors.textSecondary }]}>{item.lecturer_name}</Text>
                    </View>
                  </View>
                ))}
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
  iconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.05)', alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyTitle: { fontSize: 20, fontFamily: Fonts.lexend.bold, marginTop: 20 },
  emptyDesc: { fontSize: 14, fontFamily: Fonts.lexend.regular, textAlign: 'center', marginTop: 8 },
  scrollContent: { padding: 20 },
  daySection: { marginBottom: 24 },
  dayTitle: { fontSize: 12, fontFamily: Fonts.lexend.bold, letterSpacing: 1, marginBottom: 12 },
  card: { borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  courseCode: { fontSize: 16, fontFamily: Fonts.lexend.bold },
  timeBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  timeText: { fontSize: 12, fontFamily: Fonts.lexend.bold },
  courseName: { fontSize: 14, fontFamily: Fonts.lexend.medium, marginBottom: 12 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)', paddingTop: 12 },
  footerItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  footerText: { fontSize: 12, fontFamily: Fonts.lexend.regular },
  lecturer: { fontSize: 12, fontFamily: Fonts.lexend.medium },
});
