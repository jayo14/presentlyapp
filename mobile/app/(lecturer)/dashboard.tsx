import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, RefreshControl, ActivityIndicator, ImageBackground, Modal, FlatList, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, Clock,MapPin, BookOpen, Calendar, TrendingUp, CheckCircle, AlertCircle, Mail, ChevronRight, Plus, X, QrCode, Hash, Navigation, ShieldCheck, Edit, ArrowRight, Radio } from 'lucide-react-native';
import Fonts from '@/constants/fonts';
import { useState, useCallback } from 'react';
import { useLecturerDashboard, useUpcomingSessions } from '@/hooks/useLecturerDashboard';
import { api } from '@/services/api';
import Slider from '@react-native-community/slider';
import { MaterialIcons } from '@expo/vector-icons';

export default function LecturerDashboard() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { user } = useAuth();

  const {
    data: dashboardData,
    isLoading: statsLoading,
    refetch: refetchStats,
    isRefetching: isRefetchingStats
  } = useLecturerDashboard();

  const {
    data: upcomingSessionsData,
    isLoading: upcomingLoading,
    refetch: refetchUpcoming
  } = useUpcomingSessions();

  // Session Creation State
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [creationStep, setCreationStep] = useState(1);
  const [courses, setCourses] = useState<any[]>([]);
  const [venues, setVenues] = useState<any[]>([]);
  const [creationLoading, setCreationLoading] = useState(false);
  
  // Form State
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [selectedVenue, setSelectedVenue] = useState<any | null>(null);
  const [methods, setMethods] = useState({ qr: true, pin: false, gps: true });
  const [radius, setRadius] = useState(150);
  
  // Modals
  const [showCoursePicker, setShowCoursePicker] = useState(false);
  const [showVenuePicker, setShowVenuePicker] = useState(false);

  const onRefresh = useCallback(async () => {
    await Promise.all([refetchStats(), refetchUpcoming()]);
  }, [refetchStats, refetchUpcoming]);

  const nextSession = upcomingSessionsData?.[0] || upcomingSessionsData?.results?.[0];
  const refreshing = isRefetchingStats;

  const startSessionCreation = async () => {
    try {
      const [coursesData, venuesData] = await Promise.all([
        api.courses.list(),
        api.venues.list()
      ]);
      setCourses(Array.isArray(coursesData) ? coursesData : ((coursesData as any)?.results || []));
      setVenues(Array.isArray(venuesData) ? venuesData : ((venuesData as any)?.results || []));
      setIsCreatingSession(true);
      setCreationStep(1);
    } catch(e) {
      Alert.alert('Error', 'Failed to load courses and venues');
      console.error(e);
    }
  };

  const handleNextStep = () => {
    if (creationStep === 1) {
      if (!selectedCourse) {
        Alert.alert('Required', 'Please select a course first');
        return;
      }
    }
    if (creationStep < 3) setCreationStep(creationStep + 1);
    else handleCreateSession();
  };

  const handleBackStep = () => {
    if (creationStep > 1) setCreationStep(creationStep - 1);
    else setIsCreatingSession(false);
  };

  const handleCreateSession = async () => {
    try {
      setCreationLoading(true);
      const sessionData = {
        course: selectedCourse.id,
        venue: selectedVenue?.id,
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 1.5 * 60 * 60 * 1000).toISOString(),
        is_active: true,
        verification_radius: radius,
        require_qr: methods.qr,
        require_gps: methods.gps,
        require_pin: methods.pin,
      };

      const response = await api.sessions.create(sessionData);
      Alert.alert('Success', 'Session created successfully');
      setIsCreatingSession(false);
      setCreationStep(1);
      setSelectedCourse(null);
      setSelectedVenue(null);
      refetchUpcoming();
      router.push(`/(lecturer)/session/${response.id}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to create session');
      console.error(error);
    } finally {
      setCreationLoading(false);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.creationHeader}>
        <Text style={[styles.creationTitle, { color: colors.text }]}>Create New Session</Text>
        <Text style={styles.creationSubtitle}>Fill in the details for today's lecture.</Text>
      </View>

      <View style={styles.formSection}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Select Course</Text>
          <TouchableOpacity
            style={[styles.pickerBox, { backgroundColor: isDark ? '#1A1A1A' : '#f8f8f5', borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }]}
            onPress={() => setShowCoursePicker(true)}
          >
            <MaterialIcons name="search" size={20} color={isDark ? '#666' : '#999'} style={{ marginRight: 12 }} />
            <Text style={[styles.pickerText, { color: selectedCourse ? colors.text : '#999' }]}>
              {selectedCourse ? `${selectedCourse.code} - ${selectedCourse.title || selectedCourse.name}` : 'Select a course'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Venue (Optional)</Text>
          <TouchableOpacity
            style={[styles.pickerBox, { backgroundColor: colors.primary + '1A', borderColor: colors.primary + '4D' }]}
            onPress={() => setShowVenuePicker(true)}
          >
            <MaterialIcons name="location-on" size={20} color={colors.primary} style={{ marginRight: 12 }} />
            <Text style={[styles.pickerText, { color: selectedVenue ? colors.text : colors.primary }]}>
              {selectedVenue ? selectedVenue.name : 'Select Venue'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.creationHeader}>
        <Text style={[styles.creationTitle, { color: colors.text }]}>Verification Methods</Text>
        <Text style={styles.creationSubtitle}>Choose how students will verify their attendance.</Text>
      </View>

      <View style={styles.formSection}>
        <View style={[styles.methodCard, { backgroundColor: methods.qr ? (isDark ? colors.primary + '0D' : '#FFF') : 'transparent', borderColor: methods.qr ? colors.primary + '33' : (isDark ? 'rgba(255,255,255,0.05)' : '#E5E7EB') }]}>
          <View style={styles.methodHeader}>
            <View style={styles.methodTitleRow}>
              <View style={[styles.methodIconBox, { backgroundColor: colors.primary + '1A' }]}>
                <QrCode size={20} color={colors.primary} />
              </View>
              <Text style={[styles.methodName, { color: colors.text }]}>QR Code</Text>
            </View>
            <TouchableOpacity onPress={() => setMethods({...methods, qr: !methods.qr})}>
              <MaterialIcons name={methods.qr ? "check-circle" : "circle-outline"} size={24} color={methods.qr ? colors.primary : '#999'} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.methodCard, { backgroundColor: methods.pin ? (isDark ? colors.primary + '0D' : '#FFF') : 'transparent', borderColor: methods.pin ? colors.primary + '33' : (isDark ? 'rgba(255,255,255,0.05)' : '#E5E7EB') }]}>
          <View style={styles.methodHeader}>
            <View style={styles.methodTitleRow}>
              <View style={[styles.methodIconBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f8f8f5' }]}>
                <Hash size={20} color={isDark ? '#666' : '#999'} />
              </View>
              <Text style={[styles.methodName, { color: colors.text }]}>Session Code</Text>
            </View>
            <TouchableOpacity onPress={() => setMethods({...methods, pin: !methods.pin})}>
              <MaterialIcons name={methods.pin ? "check-circle" : "circle-outline"} size={24} color={methods.pin ? colors.primary : '#999'} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.methodCard, { backgroundColor: methods.gps ? (isDark ? colors.primary + '0D' : '#FFF') : 'transparent', borderColor: methods.gps ? colors.primary + '33' : (isDark ? 'rgba(255,255,255,0.05)' : '#E5E7EB') }]}>
          <View style={styles.methodHeader}>
            <View style={styles.methodTitleRow}>
              <View style={[styles.methodIconBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f8f8f5' }]}>
                <Navigation size={20} color={isDark ? '#666' : '#999'} />
              </View>
              <View>
                <Text style={[styles.methodName, { color: colors.text }]}>GPS Geofencing</Text>
                <Text style={[styles.methodType, { color: '#999' }]}>Radius: {radius}m</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setMethods({...methods, gps: !methods.gps})}>
              <MaterialIcons name={methods.gps ? "check-circle" : "circle-outline"} size={24} color={methods.gps ? colors.primary : '#999'} />
            </TouchableOpacity>
          </View>
          {methods.gps && (
            <View style={styles.radiusControl}>
              <Slider
                style={{ width: '100%', height: 40 }}
                minimumValue={50}
                maximumValue={500}
                step={50}
                value={radius}
                onValueChange={setRadius}
                minimumTrackTintColor={colors.primary}
                maximumTrackTintColor={isDark ? '#333' : '#CCC'}
                thumbTintColor={colors.primary}
              />
            </View>
          )}
        </View>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.creationHeader}>
        <Text style={[styles.creationTitle, { color: colors.text }]}>Review & Start</Text>
        <Text style={styles.creationSubtitle}>Double check before broadcasting to students.</Text>
      </View>

      <View style={styles.formSection}>
        <View style={[styles.reviewCard, { backgroundColor: isDark ? colors.primary + '0D' : '#FFF', borderColor: isDark ? colors.primary + '33' : '#E5E7EB' }]}>
          <View style={styles.reviewItem}>
            <BookOpen size={22} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.reviewLabel}>COURSE</Text>
              <Text style={[styles.reviewValue, { color: colors.text }]}>{selectedCourse?.code} - {selectedCourse?.title || selectedCourse?.name}</Text>
            </View>
          </View>
          <View style={styles.reviewDivider} />
          <View style={styles.reviewItem}>
            <MapPin size={22} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.reviewLabel}>VENUE</Text>
              <Text style={[styles.reviewValue, { color: colors.text }]}>{selectedVenue?.name || 'Not specified'}</Text>
            </View>
          </View>
          <View style={styles.reviewDivider} />
          <View style={styles.reviewItem}>
            <ShieldCheck size={22} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.reviewLabel}>VERIFICATION</Text>
              <Text style={[styles.reviewValue, { color: colors.text }]}>
                {[methods.qr && 'QR', methods.gps && `GPS (${radius}m)`, methods.pin && 'PIN'].filter(Boolean).join(' • ')}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  if (isCreatingSession) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#231e0f' : '#FFFFFF' }]} edges={['top']}>
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={handleBackStep} style={styles.backBtn}>
            {creationStep === 1 ? <X size={24} color={colors.text} /> : <MaterialIcons name="chevron-left" size={24} color={colors.primary} />}
          </TouchableOpacity>
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.stepIndicatorText}>STEP {creationStep} OF 3</Text>
          </View>
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.progressSection}>
          <View style={[styles.progressStep, { backgroundColor: creationStep >= 1 ? colors.primary : (isDark ? 'rgba(255,255,255,0.1)' : '#F3F4F6') }]} />
          <View style={[styles.progressStep, { backgroundColor: creationStep >= 2 ? colors.primary : (isDark ? 'rgba(255,255,255,0.1)' : '#F3F4F6') }]} />
          <View style={[styles.progressStep, { backgroundColor: creationStep >= 3 ? colors.primary : (isDark ? 'rgba(255,255,255,0.1)' : '#F3F4F6') }]} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {creationStep === 1 && renderStep1()}
          {creationStep === 2 && renderStep2()}
          {creationStep === 3 && renderStep3()}
        </ScrollView>

        <View style={styles.footerAction}>
          <TouchableOpacity 
            style={[styles.continueBtn, { backgroundColor: colors.primary, opacity: creationLoading ? 0.6 : 1 }]} 
            onPress={handleNextStep}
            disabled={creationLoading}
          >
            {creationLoading ? (
              <ActivityIndicator color="#0A0A0A" />
            ) : (
              <>
                <Text style={styles.continueBtnText}>{creationStep === 3 ? 'Start Session' : 'Continue'}</Text>
                {creationStep < 3 && <ArrowRight size={20} color="#0A0A0A" />}
              </>
            )}
          </TouchableOpacity>
        </View>

        <Modal visible={showCoursePicker} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Select Course</Text>
                <TouchableOpacity onPress={() => setShowCoursePicker(false)}>
                  <X size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
              <FlatList
                data={courses}
                keyExtractor={item => item.id?.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.modalItem, { borderBottomColor: colors.border }]}
                    onPress={() => {
                      setSelectedCourse(item);
                      setShowCoursePicker(false);
                    }}
                  >
                    <View style={{flex:1}}>
                      <Text style={[styles.modalItemTitle, { color: colors.text }]}>{item.code}</Text>
                      <Text style={[styles.modalItemSubtitle, { color: '#999' }]}>{item.title || item.name}</Text>
                    </View>
                    {selectedCourse?.id === item.id && <MaterialIcons name="check-circle" size={20} color={colors.primary} />}
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>

        <Modal visible={showVenuePicker} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Select Venue</Text>
                <TouchableOpacity onPress={() => setShowVenuePicker(false)}>
                  <X size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
              <FlatList
                data={venues}
                keyExtractor={item => item.id?.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.modalItem, { borderBottomColor: colors.border }]}
                    onPress={() => {
                      setSelectedVenue(item);
                      setShowVenuePicker(false);
                    }}
                  >
                    <View style={{flex:1}}>
                      <Text style={[styles.modalItemTitle, { color: colors.text }]}>{item.name}</Text>
                      <Text style={[styles.modalItemSubtitle, { color: '#999' }]}>{item.address || item.building_name || 'Location'}</Text>
                    </View>
                    {selectedVenue?.id === item.id && <MaterialIcons name="check-circle" size={20} color={colors.primary} />}
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.profileRow}>
            <TouchableOpacity
                style={[styles.avatarContainer, { borderColor: colors.primary + '4D' }]}
                onPress={() => router.push('/(lecturer)/profile')}
            >
                <Image
                    source={{ uri: user?.profilePicture || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" }}
                    style={styles.avatar}
                />
            </TouchableOpacity>
            <View>
                <Text style={[styles.welcomeSub, { color: isDark ? '#ccbf8e' : '#666666' }]}>GOOD MORNING,</Text>
                <Text style={[styles.userName, { color: colors.text }]}>Prof. {user?.fullName?.split(' ')[0] || 'Lecturer'}</Text>
            </View>
        </View>
        <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: isDark ? '#2d281a' : '#F9FAFB' }]}
            onPress={() => router.push('/(lecturer)/notifications')}
        >
          <Bell size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Next Class Card Section */}
        <View style={styles.section}>
            {nextSession ? (
                <View style={[styles.nextClassCard, { backgroundColor: isDark ? '#352e18' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#E2E8F0' }]}>
                    <Image
                        source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuBlxoJsKgpZimzuMN9_wIy2nQKrP6xfFobHPPC15rReLLYJ7PMTH4lJGYUO7gawKCDatFSRKvtW3W5Q_pYm2C1qvmULm56p9l0uPqnFWg0RbId2dgvNPpL2N93K5OuqLrvC1m-mZ08yHo9ElAVoWDhR0_NEg28ZQZ1WI4xj2Q2tqy3yIy-dzGAUIN7RPK0MxOEKZ3aAT-dQ8cSviIs7HhgdE1QOlj-IPnLnzsjZ4S7JpE5qis-MOWdsTrM2UcvFzShcXtqjTlLZT_Nh" }}
                        style={styles.nextClassImage}
                    />
                    <View style={styles.nextClassContent}>
                        <View style={styles.nextClassHeader}>
                            <View style={styles.liveIndicator}>
                                <View style={styles.liveDot} />
                                <Text style={styles.liveText}>NEXT CLASS</Text>
                            </View>
                        </View>
                        <Text style={[styles.nextClassName, { color: colors.text }]}>{nextSession.course_code} - {nextSession.course_name}</Text>

                        <View style={styles.nextClassFooter}>
                            <View style={styles.nextClassDetails}>
                                <View style={styles.detailRow}>
                                    <Clock size={14} color={isDark ? '#ccbf8e' : '#666666'} />
                                    <Text style={[styles.detailText, { color: isDark ? '#ccbf8e' : '#666666' }]}>
                                        {new Date(nextSession.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(nextSession.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <MapPin size={14} color={isDark ? '#ccbf8e' : '#666666'} />
                                    <Text style={[styles.detailText, { color: isDark ? '#ccbf8e' : '#666666' }]}>{nextSession.venue_name || 'Hall A'}</Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                style={[styles.startSessionBtn, { backgroundColor: colors.primary }]}
                                onPress={() => router.push(`/(lecturer)/session/${nextSession.id}`)}
                            >
                                <Text style={styles.startSessionText}>Start Session</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            ) : !statsLoading && (
                <View style={[styles.noSessionCard, { backgroundColor: isDark ? '#352e18' : '#F9FAFB', borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#E2E8F0' }]}>
                    <Calendar size={32} color={colors.primary} />
                    <Text style={[styles.noSessionText, { color: colors.text }]}>No upcoming classes scheduled</Text>
                    <TouchableOpacity
                        style={[styles.createBtn, { backgroundColor: colors.primary }]}
                        onPress={startSessionCreation}
                    >
                        <Text style={styles.startSessionText}>Create Session Now</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>

        {/* Quick Stats Section */}
        <View style={styles.statsSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Stats</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsScroll}>
                <StatCard
                    icon={<BookOpen size={18} color={colors.primary} />}
                    label="Courses"
                    value={dashboardData?.total_courses?.toString() || "0"}
                    colors={colors}
                    isDark={isDark}
                />
                <StatCard
                    icon={<Calendar size={18} color={colors.primary} />}
                    label="Today"
                    value={dashboardData?.active_sessions_count?.toString() || "0"}
                    colors={colors}
                    isDark={isDark}
                />
                <StatCard
                    icon={<TrendingUp size={18} color={colors.primary} />}
                    label="Attendance"
                    value={`${dashboardData?.avg_attendance_percentage || 0}%`}
                    colors={colors}
                    isDark={isDark}
                />
            </ScrollView>
        </View>

        {/* Recent Activity Section */}
        <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Activity</Text>
            <View style={styles.activityList}>
                {dashboardData?.weekly_overview?.slice(0, 3).map((item, idx) => (
                    <ActivityItem
                        key={idx}
                        icon={<CheckCircle size={20} color="#10B981" />}
                        title="Attendance Recorded"
                        subtitle={`${item.name} Session • ${item.attendees} Students`}
                        badge={`${item.attendees} mark`}
                        colors={colors}
                        isDark={isDark}
                    />
                )) || (
                    <Text style={{ textAlign: 'center', color: colors.textSecondary, marginTop: 10 }}>No recent activity</Text>
                )}
            </View>
        </View>
        <View style={{ height: 130 }} />
      </ScrollView>

      {/* FAB for Create Session */}
      {nextSession && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.primary }]}
          onPress={startSessionCreation}
        >
          <Plus size={28} color="#231e0f" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

function StatCard({ icon, label, value, colors, isDark }: any) {
    return (
        <View style={[styles.statCard, { backgroundColor: isDark ? '#4a4121' : '#FFFFFF', borderColor: isDark ? 'transparent' : '#E2E8F0' }]}>
            <View style={[styles.statIconBox, { backgroundColor: colors.primary + '33' }]}>
                {icon}
            </View>
            <Text style={[styles.statLabel, { color: isDark ? '#ccbf8e' : '#666666' }]}>{label}</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
        </View>
    );
}

function ActivityItem({ icon, title, subtitle, badge, action, chevron, colors, isDark }: any) {
    return (
        <View style={[styles.activityItem, { backgroundColor: isDark ? 'rgba(53,46,24,0.5)' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#E2E8F0' }]}>
            <View style={[styles.activityIconWrap, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F9FAFB' }]}>
                {icon}
            </View>
            <View style={styles.activityContent}>
                <Text style={[styles.activityTitle, { color: colors.text }]}>{title}</Text>
                <Text style={[styles.activitySubtitle, { color: isDark ? '#ccbf8e' : '#666666' }]}>{subtitle}</Text>
            </View>
            {badge && (
                <Text style={[styles.activityBadge, { color: isDark ? '#ccbf8e' : '#94A3B8' }]}>{badge.toUpperCase()}</Text>
            )}
            {action && (
                <TouchableOpacity>
                    <Text style={[styles.activityAction, { color: colors.primary }]}>{action}</Text>
                </TouchableOpacity>
            )}
            {chevron && (
                <ChevronRight size={18} color={isDark ? '#ccbf8e' : '#94A3B8'} />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
  },
  welcomeSub: {
    fontSize: 10,
    fontFamily: Fonts.lexend.bold,
    letterSpacing: 1,
  },
  userName: {
    fontSize: 18,
    fontFamily: Fonts.lexend.bold,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 180,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  nextClassCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  nextClassImage: {
    width: '100%',
    height: 160,
  },
  nextClassContent: {
    padding: 16,
  },
  nextClassHeader: {
    marginBottom: 8,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f9c406',
  },
  liveText: {
    fontSize: 12,
    fontFamily: Fonts.lexend.bold,
    color: '#f9c406',
    letterSpacing: 1,
  },
  nextClassName: {
    fontSize: 20,
    fontFamily: Fonts.lexend.bold,
    marginBottom: 12,
  },
  nextClassFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  nextClassDetails: {
    gap: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    fontFamily: Fonts.lexend.regular,
  },
  startSessionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  startSessionText: {
    fontSize: 14,
    fontFamily: Fonts.lexend.bold,
    color: '#231e0f',
  },
  noSessionCard: {
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    gap: 12
  },
  noSessionText: {
    fontSize: 14,
    fontFamily: Fonts.lexend.medium,
    textAlign: 'center',
    opacity: 0.7
  },
  createBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 8
  },
  statsSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: Fonts.lexend.bold,
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  statsScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  statCard: {
    width: 140,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
  },
  statIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: Fonts.lexend.medium,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontFamily: Fonts.lexend.bold,
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  activityIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontFamily: Fonts.lexend.bold,
  },
  activitySubtitle: {
    fontSize: 12,
    fontFamily: Fonts.lexend.regular,
  },
  activityBadge: {
    fontSize: 10,
    fontFamily: Fonts.lexend.bold,
  },
  activityAction: {
    fontSize: 12,
    fontFamily: Fonts.lexend.bold,
  },
  // Session Creation Styles
  fab: {
    position: 'absolute',
    bottom: 130,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIndicatorText: {
    fontSize: 10,
    fontFamily: Fonts.lexend.bold,
    color: '#999',
    letterSpacing: 1,
  },
  progressSection: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    flexDirection: 'row',
    gap: 8,
  },
  progressStep: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  stepContainer: {
    paddingTop: 20,
  },
  creationHeader: {
    marginBottom: 32,
  },
  creationTitle: {
    fontSize: 24,
    fontFamily: Fonts.lexend.bold,
  },
  creationSubtitle: {
    fontSize: 14,
    fontFamily: Fonts.lexend.regular,
    color: '#999',
    marginTop: 4,
  },
  formSection: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 10,
    fontFamily: Fonts.lexend.bold,
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  pickerBox: {
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  pickerText: {
    flex: 1,
    fontSize: 15,
    fontFamily: Fonts.lexend.medium,
  },
  footerAction: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    right: 24,
  },
  continueBtn: {
    height: 64,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  continueBtnText: {
    fontSize: 16,
    fontFamily: Fonts.lexend.bold,
    color: '#0A0A0A',
  },
  methodCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    gap: 12,
  },
  methodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  methodTitleRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    flex: 1,
  },
  methodIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodName: {
    fontSize: 16,
    fontFamily: Fonts.lexend.bold,
  },
  methodType: {
    fontSize: 10,
    fontFamily: Fonts.lexend.bold,
    opacity: 0.6,
  },
  radiusControl: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  reviewCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    gap: 16,
  },
  reviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  reviewLabel: {
    fontSize: 10,
    fontFamily: Fonts.lexend.bold,
    color: '#999',
    letterSpacing: 1,
  },
  reviewValue: {
    fontSize: 16,
    fontFamily: Fonts.lexend.bold,
    marginTop: 4,
  },
  reviewDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: Fonts.lexend.bold,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  modalItemTitle: {
    fontSize: 15,
    fontFamily: Fonts.lexend.bold,
  },
  modalItemSubtitle: {
    fontSize: 12,
    fontFamily: Fonts.lexend.regular,
    marginTop: 2,
  },
});
