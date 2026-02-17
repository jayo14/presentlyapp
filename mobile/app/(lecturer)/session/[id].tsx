import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Dimensions, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { ChevronLeft, MoreHorizontal, QrCode, StopCircle, MapPin } from 'lucide-react-native';
import Fonts from '@/constants/fonts';
import { useState, useEffect } from 'react';
import { api } from '@/services/api';

const { width } = Dimensions.get('window');

export default function ActiveSessionScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { colors, isDark } = useTheme();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
        if (id) {
            const data: any = await api.sessions.get(id as string);
            setSession(data);
        }
    } catch (e) {
        console.error('Failed to load active session', e);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const courseTitle = session?.courseName || 'Operating Systems';
  const courseCode = session?.courseCode || 'CS302';
  const displayCode = session?.sessionCode || '8294 1053';
  const presentCount = session?.presentCount || 42;
  const totalCount = session?.totalCount || 50;
  const venue = session?.venueName || 'Main Engineering Block';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Top App Bar */}
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
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <Text style={[styles.courseHeadline, { color: colors.text }]}>{courseCode}: {courseTitle}</Text>

        {/* Code Section */}
        <View style={styles.codeSection}>
            <Text style={[styles.codeLabel, { color: colors.primary }]}>SESSION CODE</Text>
            <Text style={[styles.codeValue, { color: colors.primary }]}>{displayCode}</Text>
            <TouchableOpacity style={[styles.qrToggleBtn, { backgroundColor: colors.primary + '33', borderColor: colors.primary + '4D' }]}>
                <QrCode size={20} color={colors.primary} />
                <Text style={[styles.qrToggleText, { color: colors.primary }]}>Show QR Code</Text>
            </TouchableOpacity>
        </View>

        {/* Attendance Counter Card */}
        <View style={styles.counterSection}>
            <View style={[styles.counterCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#E2E8F0' }]}>
                <View style={styles.counterRow}>
                    <Text style={[styles.presentNum, { color: colors.primary }]}>{presentCount}</Text>
                    <Text style={[styles.totalNum, { color: isDark ? '#94A3B8' : '#666666' }]}> / {totalCount}</Text>
                </View>
                <Text style={[styles.counterLabel, { color: isDark ? '#94A3B8' : '#666666' }]}>Students Present</Text>
                <View style={[styles.progressBg, { backgroundColor: isDark ? '#231e0f' : '#F1F5F9' }]}>
                    <View style={[styles.progressFill, { width: `${(presentCount/totalCount)*100}%`, backgroundColor: colors.primary }]} />
                </View>
            </View>
        </View>

        {/* Map View Section */}
        <View style={styles.mapSection}>
            <View style={styles.mapHeader}>
                <Text style={[styles.mapTitle, { color: colors.text }]}>ACTIVE GEOFENCE ZONE</Text>
                <View style={[styles.liveBadge, { backgroundColor: colors.primary + '1A' }]}>
                    <Text style={[styles.liveBadgeText, { color: colors.primary }]}>LIVE</Text>
                </View>
            </View>
            <View style={[styles.mapContainer, { backgroundColor: isDark ? '#352e18' : '#E5E7EB', borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0' }]}>
                <Image
                    source={{ uri: 'https://placeholder.pics/svg/300' }}
                    style={[styles.mapPlaceholder, { opacity: 0.5 }]}
                />
                <View style={styles.geofenceOverlay}>
                    <View style={[styles.geofenceCircle, { backgroundColor: colors.primary + '4D', borderColor: colors.primary }]} />
                    <View style={[styles.userMarker, { backgroundColor: colors.primary }]} />
                </View>
            </View>
            <View style={styles.mapFooter}>
                <MapPin size={14} color={isDark ? '#94A3B8' : '#666666'} />
                <Text style={[styles.venueText, { color: isDark ? '#94A3B8' : '#666666' }]}>
                    {venue} • 50m radius active
                </Text>
            </View>
        </View>

        {/* End Session Button */}
        <View style={styles.actionSection}>
            <TouchableOpacity
                style={[styles.endSessionBtn, { backgroundColor: '#EF4444' }]}
                onPress={() => router.push(`/(lecturer)/session/summary/${id}`)}
            >
                <StopCircle size={24} color="#FFFFFF" />
                <Text style={styles.endSessionText}>End Session</Text>
            </TouchableOpacity>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

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
  moreButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingTop: 20,
  },
  courseHeadline: {
    fontSize: 24,
    fontFamily: Fonts.lexend.bold,
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  codeSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  codeLabel: {
    fontSize: 14,
    fontFamily: Fonts.lexend.bold,
    letterSpacing: 4,
    marginBottom: 12,
  },
  codeValue: {
    fontSize: 42,
    fontFamily: Fonts.lexend.bold,
    letterSpacing: 8,
    marginBottom: 24,
  },
  qrToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
  },
  qrToggleText: {
    fontSize: 14,
    fontFamily: Fonts.lexend.bold,
  },
  counterSection: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  counterCard: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 4,
  },
  presentNum: {
    fontSize: 40,
    fontFamily: Fonts.lexend.bold,
  },
  totalNum: {
    fontSize: 20,
    fontFamily: Fonts.lexend.regular,
    marginBottom: 6,
  },
  counterLabel: {
    fontSize: 14,
    fontFamily: Fonts.lexend.medium,
    marginBottom: 16,
  },
  progressBg: {
    height: 8,
    width: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  mapSection: {
    paddingHorizontal: 16,
    marginBottom: 40,
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  mapTitle: {
    fontSize: 13,
    fontFamily: Fonts.lexend.bold,
    letterSpacing: 1,
  },
  liveBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  liveBadgeText: {
    fontSize: 10,
    fontFamily: Fonts.lexend.bold,
  },
  mapContainer: {
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholder: {
    width: '100%',
    height: '100%',
  },
  geofenceOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  geofenceCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
  },
  userMarker: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  mapFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 4,
  },
  venueText: {
    fontSize: 12,
    fontFamily: Fonts.lexend.medium,
  },
  actionSection: {
    paddingHorizontal: 16,
  },
  endSessionBtn: {
    height: 64,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  endSessionText: {
    fontSize: 18,
    fontFamily: Fonts.lexend.bold,
    color: '#FFFFFF',
  }
});
