import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { AttendanceProvider, useAttendance } from '@/contexts/AttendanceContext';
import { ChevronLeft, CheckCircle, XCircle, Clock } from 'lucide-react-native';

function HistoryContent() {
  const router = useRouter();
  const { colors } = useTheme();
  const { history, courses } = useAttendance();
  const [selectedTab, setSelectedTab] = useState<'all' | 'courses'>('all');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return { color: colors.success, icon: CheckCircle, label: 'Present' };
      case 'LATE':
        return { color: colors.warning, icon: Clock, label: 'Late' };
      case 'ABSENT':
        return { color: colors.error, icon: XCircle, label: 'Absent' };
      default:
        return { color: colors.textSecondary, icon: Clock, label: status };
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Attendance History</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === 'all' && { backgroundColor: colors.primary },
          ]}
          onPress={() => setSelectedTab('all')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.tabText,
              {
                color: selectedTab === 'all' ? colors.background : colors.textSecondary,
              },
            ]}
          >
            All Records
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === 'courses' && { backgroundColor: colors.primary },
          ]}
          onPress={() => setSelectedTab('courses')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.tabText,
              {
                color: selectedTab === 'courses' ? colors.background : colors.textSecondary,
              },
            ]}
          >
            By Course
          </Text>
        </TouchableOpacity>
      </View>

      {selectedTab === 'all' ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {history.length === 0 ? (
            <View style={styles.emptyState}>
              <Clock size={64} color={colors.textSecondary} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No Records Yet</Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Your attendance history will appear here
              </Text>
            </View>
          ) : (
            history.map((record) => {
              const { color, icon: StatusIcon, label } = getStatusConfig(record.status);
              return (
                <View
                  key={record.id}
                  style={[styles.recordCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
                >
                  <View style={styles.recordHeader}>
                    <View style={styles.recordInfo}>
                      <Text style={[styles.recordCourse, { color: colors.text }]}>
                        {record.courseCode}
                      </Text>
                      <Text style={[styles.recordName, { color: colors.textSecondary }]}>
                        {record.courseName}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: color + '20',
                        },
                      ]}
                    >
                      <StatusIcon size={16} color={color} />
                      <Text
                        style={[
                          styles.statusText,
                          {
                            color: color,
                          },
                        ]}
                      >
                        {label}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.recordFooter}>
                    <Text style={[styles.recordDate, { color: colors.textSecondary }]}>
                      {formatDate(record.timestamp)} • {formatTime(record.timestamp)}
                    </Text>
                    <Text style={[styles.recordMethod, { color: colors.primary }]}>
                      {record.method.toUpperCase()}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {courses.map((course) => (
            <View
              key={course.id}
              style={[styles.courseCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
            >
              <View style={styles.courseHeader}>
                <View>
                  <Text style={[styles.courseCode, { color: colors.text }]}>
                    {course.code}
                  </Text>
                  <Text style={[styles.courseName, { color: colors.textSecondary }]}>
                    {course.name}
                  </Text>
                </View>
                <View style={styles.courseStats}>
                  <Text style={[styles.coursePercentage, { color: colors.primary }]}>
                    {course.percentage}%
                  </Text>
                  <Text style={[styles.courseSessions, { color: colors.textSecondary }]}>
                    {course.attendedSessions}/{course.totalSessions}
                  </Text>
                </View>
              </View>
              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        backgroundColor: colors.primary,
                        width: `${course.percentage}%`,
                      },
                    ]}
                  />
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

export default function HistoryScreen() {
  return (
    <AttendanceProvider>
      <HistoryContent />
    </AttendanceProvider>
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
    paddingHorizontal: 20,
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
    fontWeight: '700',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 12,
  },
  recordCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  recordInfo: {
    flex: 1,
    gap: 4,
  },
  recordCourse: {
    fontSize: 18,
    fontWeight: '700',
  },
  recordName: {
    fontSize: 14,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
  },
  recordFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordDate: {
    fontSize: 13,
  },
  recordMethod: {
    fontSize: 13,
    fontWeight: '600',
  },
  courseCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    gap: 16,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  courseCode: {
    fontSize: 18,
    fontWeight: '700',
  },
  courseName: {
    fontSize: 14,
    marginTop: 4,
  },
  courseStats: {
    alignItems: 'flex-end',
    gap: 4,
  },
  coursePercentage: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  courseSessions: {
    fontSize: 13,
  },
  progressContainer: {
    marginTop: 4,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
