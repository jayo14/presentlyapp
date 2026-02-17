import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { AttendanceProvider, useAttendance } from '@/contexts/AttendanceContext';
import { QrCode, MapPin, Hash, CheckCircle, Clock, Calendar } from 'lucide-react-native';

function SessionsContent() {
  const { colors } = useTheme();
  const { history, refreshData } = useAttendance();
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const getMethodIcon = (method: 'qr' | 'gps' | 'code') => {
    switch (method) {
      case 'qr':
        return QrCode;
      case 'code':
        return Hash;
      case 'gps':
        return MapPin;
      default:
        return QrCode;
    }
  };

  const getMethodLabel = (method: 'qr' | 'gps' | 'code') => {
    switch (method) {
      case 'qr':
        return 'QR Code';
      case 'code':
        return 'Session Code';
      case 'gps':
        return 'GPS Check-in';
      default:
        return 'Unknown';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const groupSessionsByDate = () => {
    const grouped: { [key: string]: typeof history } = {};
    
    history.forEach((session) => {
      const date = new Date(session.timestamp);
      const dateKey = date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(session);
    });

    return grouped;
  };

  const groupedSessions = groupSessionsByDate();
  const dateKeys = Object.keys(groupedSessions).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime();
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>My Sessions</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {history.length} session{history.length !== 1 ? 's' : ''} attended
          </Text>
        </View>

        {history.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.border }]}>
              <Clock size={32} color={colors.textSecondary} strokeWidth={2} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No Sessions Yet
            </Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Your attended sessions will appear here
            </Text>
          </View>
        ) : (
          <View style={styles.sessionsList}>
            {dateKeys.map((dateKey) => (
              <View key={dateKey} style={styles.dateSection}>
                <View style={styles.dateStickyHeader}>
                  <Calendar size={14} color={colors.textSecondary} strokeWidth={2} />
                  <Text style={[styles.dateHeader, { color: colors.textSecondary }]}>
                    {dateKey}
                  </Text>
                </View>

                {groupedSessions[dateKey].map((session) => {
                  const MethodIcon = getMethodIcon(session.method);
                  
                  return (
                    <View
                      key={session.id}
                      style={[
                        styles.sessionCard,
                        { backgroundColor: colors.cardBg, borderColor: colors.border }
                      ]}
                    >
                      <View style={styles.sessionHeader}>
                        <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                          <MethodIcon size={20} color={colors.primary} strokeWidth={2.5} />
                        </View>
                        <View style={styles.sessionInfo}>
                          <Text style={[styles.courseCode, { color: colors.text }]}>
                            {session.courseCode}
                          </Text>
                          <Text style={[styles.courseName, { color: colors.textSecondary }]}>
                            {session.courseName}
                          </Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: colors.success + '20' }]}>
                          <CheckCircle size={16} color={colors.success} strokeWidth={2.5} />
                        </View>
                      </View>

                      <View style={styles.sessionDetails}>
                        <View style={styles.detailRow}>
                          <View style={styles.detailItem}>
                            <Clock size={14} color={colors.textSecondary} strokeWidth={2} />
                            <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                              {formatTime(session.timestamp)}
                            </Text>
                          </View>
                          <View style={[styles.methodBadge, { backgroundColor: colors.primary + '15' }]}>
                            <Text style={[styles.methodText, { color: colors.primary }]}>
                              {getMethodLabel(session.method)}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

export default function SessionsScreen() {
  return (
    <AttendanceProvider>
      <SessionsContent />
    </AttendanceProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  header: {
    marginTop: 8,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
  },
  sessionsList: {
    gap: 24,
  },
  dateSection: {
    gap: 12,
  },
  dateStickyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  dateHeader: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sessionCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionInfo: {
    flex: 1,
    gap: 2,
  },
  courseCode: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  courseName: {
    fontSize: 14,
    lineHeight: 18,
  },
  statusBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    fontWeight: '500',
  },
  methodBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  methodText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
});
