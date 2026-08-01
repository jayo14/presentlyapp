import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { ArrowLeft, Share2, Mail, Star, Calendar, Users, CheckCircle, ArrowRight, ShieldCheck, Trash2 } from 'lucide-react-native';
import Fonts from '@/constants/fonts';
import { useState, useEffect } from 'react';
import { api } from '@/services/api';

export default function CourseDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { colors, isDark } = useTheme();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  const bgColor = isDark ? '#1a160b' : colors.background;
  const cardColor = isDark ? '#2c2614' : '#FFFFFF';

  useEffect(() => {
    loadCourseDetails();
  }, [id]);

  const loadCourseDetails = async () => {
    try {
        const data = await api.courses.get(id as string);
        setCourse(data);
    } catch (e) {
        console.error('Failed to load course details', e);
    } finally {
        setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!course) return;
    setEnrolling(true);
    try {
        await api.courses.register(id as string);
        router.push({
            pathname: '/(student)/courses/success',
            params: { code: course.code, title: course.title, credits: course.credit_units }
        });
    } catch (e) {
        console.error('Enrollment failed', e);
    } finally {
        setEnrolling(false);
    }
  };

  const handleDrop = () => {
    router.push({
        pathname: '/(student)/courses/drop-confirmation',
        params: { id: id as string, code: course?.code, title: course?.title },
    });
  };

  if (loading) {
      return (
          <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
              <ActivityIndicator color="#f9c406" style={{ flex: 1 }} />
          </SafeAreaView>
      );
  }

  if (!course) {
    return (
        <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace("/")} style={styles.backButton}>
                    <ArrowLeft size={24} color={isDark ? '#FFFFFF' : '#111418'} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : colors.text }]}>NOT FOUND</Text>
                <View style={{ width: 40 }} />
            </View>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                <Text style={{ color: colors.text, fontFamily: Fonts.lexend.bold, fontSize: 18, textAlign: 'center' }}>
                    Course not found or has been removed.
                </Text>
            </View>
        </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDark ? 'rgba(26, 22, 11, 0.8)' : 'rgba(248, 248, 245, 0.8)', borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : '#E2E8F0' }]}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace("/")} style={styles.backButton}>
            <ArrowLeft size={24} color={isDark ? '#FFFFFF' : '#111418'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : colors.text }]}>COURSE DETAILS</Text>
        <TouchableOpacity style={styles.shareButton}>
            <Share2 size={24} color={isDark ? '#FFFFFF' : '#111418'} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
            <View style={styles.badgeRow}>
                <View style={[styles.badge, { backgroundColor: 'rgba(249, 196, 6, 0.2)' }]}>
                    <Text style={[styles.badgeText, { color: '#f9c406' }]}>{(course.department_name ? course.department_name.split(',')[0] : 'GENERAL')}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#F1F5F9' }]}>
                    <Text style={[styles.badgeText, { color: isDark ? '#94A3B8' : '#666666' }]}>CORE MODULE</Text>
                </View>
            </View>

            <Text style={[styles.courseTitle, { color: isDark ? '#FFFFFF' : colors.text }]}>{course.code} - {course.title}</Text>

            <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                    <Star size={18} color="#f9c406" />
                    <Text style={[styles.metaText, { color: isDark ? '#FFFFFF' : colors.text }]}>{course.credit_units}.0 Credits</Text>
                </View>
                <View style={styles.metaItem}>
                    <Calendar size={18} color="#f9c406" />
                    <Text style={[styles.metaText, { color: isDark ? '#FFFFFF' : colors.text }]}>{course.semester === 'FIRST' ? 'Semester 1' : 'Semester 2'}</Text>
                </View>
            </View>

            {/* Instructor Section */}
            <View style={[styles.instructorCard, { backgroundColor: isDark ? 'rgba(44, 38, 20, 0.5)' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9' }]}>
                <View style={styles.instructorLeft}>
                    <Image
                        source={{ uri: course.lecturer_avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuD3k7_JVVjYQ2x-MpXINmP7rD3QSmwqF7Kz5KdfXq-iU-341pE7Q4LvjVJOt0dXeD2Nl3ckyXJrXBgZEmvoOtfgheT6BVKJV7kbhpcNb_5osa84-wLFofw3vSH6kcFnNZyHqFU5RikDwdaiQLDcQWJJc6QBJ8Z6zKq7XnHrAuTmIUa0aJkfkaLKOgMXOzSnJ132vUj-_UyARU7JZe0FhjN0NuRVu2SVBkYTdb9eJyTMXCfqjUliwOkTAih9PN3yAkQ1HAj2cHHiXNN1' }}
                        style={styles.instructorImg}
                    />
                    <View style={styles.onlineBadge} />
                </View>
                <View style={styles.instructorInfo}>
                    <Text style={styles.instructorLabel}>LEAD INSTRUCTOR</Text>
                    <Text style={[styles.instructorName, { color: isDark ? '#FFFFFF' : colors.text }]}>{course.lecturer_name || 'Dr. Sarah Jenkins'}</Text>
                    <Text style={styles.instructorTitle}>PhD, Applied Artificial Intelligence</Text>
                </View>
                <TouchableOpacity style={[styles.mailBtn, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0' }]}>
                    <Mail size={20} color="#94A3B8" />
                </TouchableOpacity>
            </View>

            {/* About Section */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : colors.text }]}>About this course</Text>
                <Text style={[styles.sectionDesc, { color: isDark ? '#CBD5E1' : '#475569' }]}>
                    {course.description || "This advanced course explores the philosophical, legal, and social implications of artificial intelligence. Students will analyze contemporary case studies ranging from algorithmic bias in healthcare to the existential risks of AGI."}
                </Text>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
                <View style={[styles.statBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC' }]}>
                    <ShieldCheck size={24} color="#f9c406" />
                    <Text style={[styles.statTitle, { color: isDark ? '#FFFFFF' : colors.text }]}>Attendance</Text>
                    <Text style={styles.statValue}>80% Required</Text>
                </View>
                <View style={[styles.statBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC' }]}>
                    <Users size={24} color="#f9c406" />
                    <Text style={[styles.statTitle, { color: isDark ? '#FFFFFF' : colors.text }]}>Class Size</Text>
                    <Text style={styles.statValue}>{course.enrolled_count || 45} Students</Text>
                </View>
            </View>
        </View>
        <View style={{ height: 160 }} />
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.footer}>
        {course.is_enrolled ? (
          <>
            <View style={styles.enrolledBadge}>
              <CheckCircle size={18} color="#10B981" />
              <Text style={styles.enrolledBadgeText}>You are enrolled</Text>
            </View>
            <TouchableOpacity
                style={styles.dropBtn}
                onPress={handleDrop}
            >
                <Trash2 size={18} color="#F43F5E" />
                <Text style={styles.dropBtnText}>Drop Course</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
              style={[styles.confirmBtn, { opacity: enrolling ? 0.7 : 1 }]}
              onPress={handleEnroll}
              disabled={enrolling}
          >
              {enrolling ? (
                  <ActivityIndicator color="#1a160b" />
              ) : (
                  <>
                      <Text style={styles.confirmBtnText}>Confirm Enrollment</Text>
                      <ArrowRight size={22} color="#1a160b" strokeWidth={3} />
                  </>
              )}
          </TouchableOpacity>
        )}
      </View>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontFamily: Fonts.lexend.bold,
    letterSpacing: 3,
  },
  shareButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingTop: 24,
  },
  content: {
    paddingHorizontal: 24,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: Fonts.lexend.bold,
    letterSpacing: 1,
  },
  courseTitle: {
    fontSize: 32,
    fontFamily: Fonts.lexend.bold,
    lineHeight: 38,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 32,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 14,
    fontFamily: Fonts.lexend.medium,
  },
  instructorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 32,
  },
  instructorLeft: {
    position: 'relative',
  },
  instructorImg: {
    width: 56,
    height: 56,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(249, 196, 6, 0.3)',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#2c2614',
  },
  instructorInfo: {
    flex: 1,
    marginLeft: 16,
  },
  instructorLabel: {
    fontSize: 10,
    fontFamily: Fonts.lexend.bold,
    color: '#94A3B8',
    letterSpacing: 1,
    marginBottom: 2,
  },
  instructorName: {
    fontSize: 18,
    fontFamily: Fonts.lexend.bold,
  },
  instructorTitle: {
    fontSize: 12,
    fontFamily: Fonts.lexend.regular,
    color: '#94A3B8',
  },
  mailBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: Fonts.lexend.bold,
    marginBottom: 12,
  },
  sectionDesc: {
    fontSize: 15,
    fontFamily: Fonts.lexend.regular,
    lineHeight: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  statTitle: {
    fontSize: 14,
    fontFamily: Fonts.lexend.bold,
    marginTop: 8,
  },
  statValue: {
    fontSize: 12,
    fontFamily: Fonts.lexend.regular,
    color: '#94A3B8',
    marginTop: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 40,
  },
  confirmBtn: {
    height: 64,
    backgroundColor: '#f9c406',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#f9c406',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  confirmBtnText: {
    fontSize: 18,
    fontFamily: Fonts.lexend.bold,
    color: '#1a160b',
  },
  enrolledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    marginBottom: 12,
  },
  enrolledBadgeText: {
    fontSize: 16,
    fontFamily: Fonts.lexend.semiBold,
    color: '#10B981',
  },
  dropBtn: {
    height: 52,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#F43F5E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dropBtnText: {
    fontSize: 16,
    fontFamily: Fonts.lexend.semiBold,
    color: '#F43F5E',
  },
});
