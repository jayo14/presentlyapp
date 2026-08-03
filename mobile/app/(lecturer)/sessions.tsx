import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ScrollView, Switch, Modal, ActivityIndicator, RefreshControl, Image, Dimensions } from 'react-native';
import { useState, useCallback, useEffect } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Clock, MapPin, Calendar, X, ChevronDown, BookOpen, QrCode, Hash, Navigation, ArrowRight, CheckCircle, Radio, ShieldCheck, Edit, ChevronLeft } from 'lucide-react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Fonts from '@/constants/fonts';
import Slider from '@react-native-community/slider';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function LecturerSessionsScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
    const tabBarHeight = useBottomTabBarHeight();
    const insets = useSafeAreaInsets();
    const bottomDockOffset = tabBarHeight + insets.bottom;
  const [sessions, setSessions] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [venues, setVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [creationStep, setCreationStep] = useState(1);

  // Form State
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [selectedVenue, setSelectedVenue] = useState<any | null>(null);
  const [sessionDate, setSessionDate] = useState('Oct 24, 2023');
  const [startTime, setStartTime] = useState('10:30 AM');
  const [autoAttendance, setAutoAttendance] = useState(true);
  const [methods, setMethods] = useState({
    qr: true,
    pin: false,
    gps: true,
  });
  const [radius, setRadius] = useState(150);

  // Modals
  const [showCoursePicker, setShowCoursePicker] = useState(false);
  const [showVenuePicker, setShowVenuePicker] = useState(false);

  const loadData = async () => {
    try {
        const [sessionsData, coursesData, venuesData] = await Promise.all([
          api.sessions.list(),
          api.courses.list(),
          api.venues.list()
        ]);

        setSessions(Array.isArray(sessionsData) ? sessionsData : ((sessionsData as any)?.results || []));
        setCourses(Array.isArray(coursesData) ? coursesData : ((coursesData as any)?.results || []));
        setVenues(Array.isArray(venuesData) ? venuesData : ((venuesData as any)?.results || []));
    } catch (e) {
        console.error('Failed to load sessions data', e);
    } finally {
        setLoading(false);
        setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleNextStep = () => {
    if (creationStep === 1) {
        if (!selectedCourse) {
            Alert.alert('Required', 'Please select a course first');
            return;
        }
    }
    if (creationStep < 3) setCreationStep(creationStep + 1);
    else handleLaunch();
  };

  const handleBackStep = () => {
    if (creationStep > 1) setCreationStep(creationStep - 1);
    else setIsCreating(false);
  };

  const handleLaunch = async () => {
    try {
      setLoading(true);
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
      Alert.alert('Success', 'Session broadcasted successfully');
      setIsCreating(false);
      setCreationStep(1);
      loadData();
      router.push(`/(lecturer)/session/${response.uuid || response.id}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to create session');
      console.error(error);
    } finally {
      setLoading(false);
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
                <MaterialIcons name="expand-more" size={24} color={isDark ? '#666' : '#999'} />
            </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Venue</Text>
            <TouchableOpacity
                style={[styles.pickerBox, { backgroundColor: colors.primary + '1A', borderColor: colors.primary + '4D' }]}
                onPress={() => setShowVenuePicker(true)}
            >
                <MaterialIcons name="location-on" size={20} color={colors.primary} style={{ marginRight: 12 }} />
                <Text style={[styles.pickerText, { color: selectedVenue ? colors.text : colors.primary }]}>
                    {selectedVenue ? selectedVenue.name : 'Select Venue'}
                </Text>
                {selectedVenue && <MaterialIcons name="check-circle" size={18} color={colors.primary} />}
            </TouchableOpacity>
        </View>

        <View style={styles.row}>
            <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Date</Text>
                <TouchableOpacity style={[styles.dateTimeBox, { backgroundColor: isDark ? '#1A1A1A' : '#f8f8f5', borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }]}>
                    <MaterialIcons name="calendar-today" size={20} color={isDark ? '#444' : '#CCC'} />
                    <Text style={[styles.dateTimeText, { color: colors.text }]}>{sessionDate}</Text>
                </TouchableOpacity>
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Start Time</Text>
                <TouchableOpacity style={[styles.dateTimeBox, { backgroundColor: isDark ? '#1A1A1A' : '#f8f8f5', borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }]}>
                    <MaterialIcons name="schedule" size={20} color={isDark ? '#444' : '#CCC'} />
                    <Text style={[styles.dateTimeText, { color: colors.text }]}>{startTime}</Text>
                </TouchableOpacity>
            </View>
        </View>

        <View style={[styles.reminderBox, { backgroundColor: isDark ? '#1A1A1A' : '#f8f8f5' }]}>
            <View style={[styles.reminderIcon, { backgroundColor: colors.primary + '33' }]}>
                <Radio size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={[styles.reminderTitle, { color: colors.text }]}>Auto-Attendance</Text>
                <Text style={styles.reminderSubtitle}>Bluetooth & GPS validation active</Text>
            </View>
            <Switch
                value={autoAttendance}
                onValueChange={setAutoAttendance}
                trackColor={{ false: '#6a5d2f', true: colors.primary }}
                thumbColor="#FFF"
            />
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
                    <View>
                        <Text style={[styles.methodName, { color: colors.text }]}>QR Code</Text>
                        <View style={styles.recommendedBadge}>
                            <Text style={styles.recommendedText}>RECOMMENDED</Text>
                        </View>
                    </View>
                </View>
                <Switch
                    value={methods.qr}
                    onValueChange={(v) => setMethods({...methods, qr: v})}
                    trackColor={{ false: '#6a5d2f', true: colors.primary }}
                    thumbColor="#FFF"
                />
            </View>
            <Text style={styles.methodDesc}>Generates a dynamic encrypted QR code for students to scan via the mobile app.</Text>
        </View>

        <View style={[styles.methodCard, { backgroundColor: methods.pin ? (isDark ? colors.primary + '0D' : '#FFF') : 'transparent', borderColor: methods.pin ? colors.primary + '33' : (isDark ? 'rgba(255,255,255,0.05)' : '#E5E7EB') }]}>
            <View style={styles.methodHeader}>
                <View style={styles.methodTitleRow}>
                    <View style={[styles.methodIconBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f8f8f5' }]}>
                        <Hash size={20} color={isDark ? '#666' : '#999'} />
                    </View>
                    <View>
                        <Text style={[styles.methodName, { color: colors.text }]}>Session Code</Text>
                        <Text style={[styles.methodType, { color: colors.primary }]}>Alphanumeric</Text>
                    </View>
                </View>
                <Switch
                    value={methods.pin}
                    onValueChange={(v) => setMethods({...methods, pin: v})}
                    trackColor={{ false: '#6a5d2f', true: colors.primary }}
                    thumbColor="#FFF"
                />
            </View>
            <Text style={styles.methodDesc}>Students enter a unique 6-digit code provided during the session.</Text>
        </View>

        <View style={[styles.methodCard, { backgroundColor: methods.gps ? (isDark ? colors.primary + '0D' : '#FFF') : 'transparent', borderColor: methods.gps ? colors.primary + '33' : (isDark ? 'rgba(255,255,255,0.05)' : '#E5E7EB') }]}>
            <View style={styles.methodHeader}>
                <View style={styles.methodTitleRow}>
                    <View style={[styles.methodIconBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f8f8f5' }]}>
                        <Navigation size={20} color={isDark ? '#666' : '#999'} />
                    </View>
                    <View>
                        <Text style={[styles.methodName, { color: colors.text }]}>GPS Geofencing</Text>
                        <Text style={styles.methodType}>Location verification</Text>
                    </View>
                </View>
                <Switch
                    value={methods.gps}
                    onValueChange={(v) => setMethods({...methods, gps: v})}
                    trackColor={{ false: '#6a5d2f', true: colors.primary }}
                    thumbColor="#FFF"
                />
            </View>

            <View style={styles.mapPreview}>
                <Image
                    source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuBOCFiFVSgnwV7ZdSV6io4bbCch-skOTcf41l2LSdNMq-lp3hbZXs2x4Z4nQhpyMpPvvzczg8hVwVvJcu7-bPbAx1LuJyXZgAs24kCrDwyyXvL_23_IRMWe7KvRNa6CKe0mXkLa4kprsvGZ-H91R6ijl0JpFOo2Pz0dXIQfFYOwsmoknWFlAgi4U9pEY8ScXzGbaO6yaQ4VWXfDYu7kglLlVlCbmcHsexRObQF37HhDXcUTAT5iGOwKE7T7yKPcBsVHJDRvPo8CiQY-" }}
                    style={[styles.mapImage, { grayscale: 1 } as any]}
                />
                <View style={styles.mapOverlay}>
                    <View style={[styles.mapCircle, { borderColor: colors.primary, backgroundColor: colors.primary + '33' }]}>
                        <View style={[styles.mapDot, { backgroundColor: colors.primary }]} />
                    </View>
                </View>
            </View>

            <View style={styles.radiusRow}>
                <Text style={[styles.radiusLabel, { color: colors.text }]}>Verification Radius</Text>
                <Text style={[styles.radiusValue, { color: colors.primary }]}>{radius}m</Text>
            </View>
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
            <View style={styles.radiusLabels}>
                <Text style={styles.radiusLabelSmall}>50M</Text>
                <Text style={styles.radiusLabelSmall}>150M</Text>
                <Text style={styles.radiusLabelSmall}>300M</Text>
                <Text style={styles.radiusLabelSmall}>500M</Text>
            </View>
        </View>

        <View style={styles.securityNote}>
            <ShieldCheck size={16} color="#999" />
            <Text style={styles.securityNoteText}>Multiple methods increase security</Text>
        </View>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.creationHeader}>
        <Text style={[styles.creationTitle, { color: colors.text }]}>Review & Broadcast</Text>
        <Text style={styles.creationSubtitle}>Everything looks ready. Double check the details before going live to your students.</Text>
      </View>

      <View style={styles.formSection}>
        <View style={[styles.reviewCard, { backgroundColor: isDark ? colors.primary + '0D' : '#FFF', borderColor: isDark ? colors.primary + '33' : '#E5E7EB' }]}>
            <View style={styles.reviewItem}>
                <View style={[styles.reviewIconBox, { backgroundColor: colors.primary + '33' }]}>
                    <BookOpen size={22} color={colors.primary} />
                </View>
                <View>
                    <Text style={styles.reviewLabel}>COURSE</Text>
                    <Text style={[styles.reviewValue, { color: colors.text }]}>{selectedCourse?.code || 'CS401'} - {selectedCourse?.title || selectedCourse?.name || 'AI Ethics'}</Text>
                    <Text style={styles.reviewSub}>Section A • {user?.fullName || 'Prof. Henderson'}</Text>
                </View>
            </View>
            <View style={styles.reviewDivider} />
            <View style={styles.reviewItem}>
                <View style={[styles.reviewIconBox, { backgroundColor: colors.primary + '33' }]}>
                    <MapPin size={22} color={colors.primary} />
                </View>
                <View>
                    <Text style={styles.reviewLabel}>VENUE</Text>
                    <Text style={[styles.reviewValue, { color: colors.text }]}>{selectedVenue?.name || 'Lecture Hall B-12'}</Text>
                    <Text style={styles.reviewSub}>{selectedVenue?.building_name || 'Main Campus, North Wing'}</Text>
                </View>
            </View>
            <View style={styles.reviewDivider} />
            <View style={styles.reviewItem}>
                <View style={[styles.reviewIconBox, { backgroundColor: colors.primary + '33' }]}>
                    <Clock size={22} color={colors.primary} />
                </View>
                <View>
                    <Text style={styles.reviewLabel}>TIME SLOT</Text>
                    <Text style={[styles.reviewValue, { color: colors.text }]}>Now — 12:00 PM</Text>
                    <Text style={styles.reviewSub}>Duration: 90 Minutes</Text>
                </View>
            </View>
            <View style={styles.reviewDivider} />
            <View style={styles.reviewItem}>
                <View style={[styles.reviewIconBox, { backgroundColor: colors.primary + '33' }]}>
                    <ShieldCheck size={22} color={colors.primary} />
                </View>
                <View>
                    <Text style={styles.reviewLabel}>VERIFICATION</Text>
                    <Text style={[styles.reviewValue, { color: colors.text }]}>
                        {[methods.qr && 'QR', methods.gps && 'GPS', methods.pin && 'PIN'].filter(Boolean).join(' & ')}
                    </Text>
                    <View style={styles.securityRow}>
                        <View style={[styles.securityDot, { backgroundColor: '#10B981' }]} />
                        <Text style={styles.reviewSub}>High Security Mode</Text>
                    </View>
                </View>
            </View>
            <TouchableOpacity style={styles.editBtn} onPress={() => setCreationStep(1)}>
                <Edit size={16} color={colors.primary} />
                <Text style={[styles.editBtnText, { color: colors.primary }]}>EDIT SELECTION</Text>
            </TouchableOpacity>
        </View>

        <View style={styles.broadcastActions}>
            <TouchableOpacity
                style={[styles.launchBtn, { backgroundColor: colors.primary }]}
                onPress={handleLaunch}
                disabled={loading}
            >
                {loading ? <ActivityIndicator color="#0A0A0A" /> : (
                    <>
                        <Radio size={22} color="#0A0A0A" />
                        <Text style={styles.launchBtnText}>Start & Broadcast</Text>
                    </>
                )}
            </TouchableOpacity>
            <TouchableOpacity style={[styles.scheduleBtn, { borderColor: colors.primary + '4D' }]}>
                <Text style={[styles.scheduleBtnText, { color: colors.primary }]}>Schedule for Later</Text>
            </TouchableOpacity>
        </View>

        <Text style={styles.broadcastNote}>BY BROADCASTING, NOTIFICATION WILL BE SENT TO {selectedCourse?.enrolled_students_count || 48} STUDENTS</Text>
      </View>
    </View>
  );

  if (isCreating) {
    return (
        <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#231e0f' : '#FFFFFF' }]} edges={['top']}>
            <View style={styles.headerBar}>
                <TouchableOpacity onPress={handleBackStep} style={styles.backBtn}>
                    {creationStep === 1 ? <X size={24} color={colors.text} /> : <ChevronLeft size={24} color={colors.primary} />}
                </TouchableOpacity>
                <View style={{ alignItems: 'center' }}>
                    <Text style={styles.stepIndicatorText}>STEP {creationStep} OF 3</Text>
                    <Text style={[styles.stepIndicatorTitle, { color: colors.text }]}>
                        {creationStep === 1 ? 'Setup' : creationStep === 2 ? 'Verification' : 'Final Review'}
                    </Text>
                </View>
                <View style={{ width: 44 }} />
            </View>

            <View style={styles.progressSection}>
                <View style={[styles.progressStep, { backgroundColor: creationStep >= 1 ? colors.primary : (isDark ? 'rgba(255,255,255,0.1)' : '#F3F4F6') }]} />
                <View style={[styles.progressStep, { backgroundColor: creationStep >= 2 ? colors.primary : (isDark ? 'rgba(255,255,255,0.1)' : '#F3F4F6') }]} />
                <View style={[styles.progressStep, { backgroundColor: creationStep >= 3 ? colors.primary : (isDark ? 'rgba(255,255,255,0.1)' : '#F3F4F6') }]} />
            </View>

            <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomDockOffset + 120 }]}>
                {creationStep === 1 && renderStep1()}
                {creationStep === 2 && renderStep2()}
                {creationStep === 3 && renderStep3()}
            </ScrollView>

            {creationStep < 3 && (
                <View style={[styles.footerAction, { bottom: bottomDockOffset + 16 }]}>
                    <TouchableOpacity style={[styles.continueBtn, { backgroundColor: colors.primary }]} onPress={handleNextStep}>
                        <Text style={styles.continueBtnText}>Continue</Text>
                        <ArrowRight size={20} color="#0A0A0A" />
                    </TouchableOpacity>
                </View>
            )}

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
                            keyExtractor={item => item.id.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[styles.modalItem, { borderBottomColor: colors.border }]}
                                    onPress={() => {
                                        setSelectedCourse(item);
                                        setShowCoursePicker(false);
                                    }}
                                >
                                    <BookOpen size={20} color={colors.textSecondary} style={{ marginRight: 12 }} />
                                    <View>
                                        <Text style={[styles.modalItemTitle, { color: colors.text }]}>{item.code}</Text>
                                        <Text style={[styles.modalItemSubtitle, { color: colors.textSecondary }]}>{item.title || item.name}</Text>
                                    </View>
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
                            keyExtractor={item => item.id.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[styles.modalItem, { borderBottomColor: colors.border }]}
                                    onPress={() => {
                                        setSelectedVenue(item);
                                        setShowVenuePicker(false);
                                    }}
                                >
                                    <MapPin size={20} color={colors.textSecondary} style={{ marginRight: 12 }} />
                                    <View>
                                        <Text style={[styles.modalItemTitle, { color: colors.text }]}>{item.name}</Text>
                                        <Text style={[styles.modalItemSubtitle, { color: colors.textSecondary }]}>{item.address || item.building_name}</Text>
                                    </View>
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
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Sessions</Text>
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => {
              setIsCreating(true);
              setCreationStep(1);
          }}
        >
          <Plus size={24} color="#231e0f" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={sessions}
        keyExtractor={item => item.id.toString()}
                contentContainerStyle={[styles.listContent, { paddingBottom: bottomDockOffset + 56 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListEmptyComponent={() => (
            <View style={{ alignItems: 'center', marginTop: 100 }}>
                {loading ? <ActivityIndicator color={colors.primary} /> : <Text style={{ color: colors.textSecondary }}>No sessions found</Text>}
            </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { backgroundColor: isDark ? '#2d281a' : '#FFFFFF', borderColor: colors.border }]}
            onPress={() => router.push(`/(lecturer)/session/${item.uuid || item.id}`)}
          >
            <View style={styles.cardHeader}>
                <View style={styles.cardIcon}>
                    <Clock size={24} color={colors.primary} />
                </View>
                <View style={styles.cardInfo}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>{item.course_code || item.courseCode}</Text>
                    <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>{item.course_name || item.courseName}</Text>
                </View>
                <View style={[
                    styles.statusBadge, 
                    { backgroundColor: item.is_active ? colors.primary + '20' : colors.border + '20' }
                ]}>
                    <Text style={{ 
                        color: item.is_active ? colors.primary : colors.textSecondary,
                        fontWeight: '700',
                        fontSize: 10
                    }}>
                        {item.is_active ? 'ACTIVE' : 'ENDED'}
                    </Text>
                </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  stepIndicatorText: { fontSize: 10, fontFamily: Fonts.lexend.bold, color: '#999', letterSpacing: 1 },
  stepIndicatorTitle: { fontSize: 14, fontFamily: Fonts.lexend.semiBold },
  progressSection: { paddingHorizontal: 24, paddingVertical: 12, flexDirection: 'row', gap: 8 },
  progressStep: { flex: 1, height: 4, borderRadius: 2 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 160 },
  stepContainer: { paddingTop: 20 },
  creationHeader: { marginBottom: 32 },
  creationTitle: { fontSize: 24, fontFamily: Fonts.lexend.bold },
  creationSubtitle: { fontSize: 14, fontFamily: Fonts.lexend.regular, color: '#999', marginTop: 4 },
  formSection: { gap: 24 },
  inputGroup: { gap: 8 },
  inputLabel: { fontSize: 10, fontFamily: Fonts.lexend.bold, color: '#999', textTransform: 'uppercase', letterSpacing: 1, marginLeft: 4 },
  pickerBox: { height: 56, borderRadius: 16, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, borderWidth: 1 },
  pickerText: { flex: 1, fontSize: 15, fontFamily: Fonts.lexend.medium },
  row: { flexDirection: 'row', gap: 16 },
  dateTimeBox: { height: 96, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1, gap: 8 },
  dateTimeText: { fontSize: 14, fontFamily: Fonts.lexend.semiBold },
  reminderBox: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, gap: 12 },
  reminderIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  reminderTitle: { fontSize: 12, fontFamily: Fonts.lexend.bold },
  reminderSubtitle: { fontSize: 10, fontFamily: Fonts.lexend.regular, color: '#999' },
  footerAction: { position: 'absolute', bottom: 40, left: 24, right: 24 },
  continueBtn: { height: 64, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  continueBtnText: { fontSize: 16, fontFamily: Fonts.lexend.bold, color: '#0A0A0A' },
  methodCard: { padding: 20, borderRadius: 20, borderWidth: 1, gap: 12 },
  methodHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  methodTitleRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  methodIconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  methodName: { fontSize: 18, fontFamily: Fonts.lexend.bold },
  recommendedBadge: { backgroundColor: '#f9c406', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginTop: 4 },
  recommendedText: { fontSize: 8, fontFamily: Fonts.lexend.bold, color: '#0A0A0A' },
  methodType: { fontSize: 10, fontFamily: Fonts.lexend.bold, opacity: 0.6 },
  methodDesc: { fontSize: 14, fontFamily: Fonts.lexend.regular, color: '#999', lineHeight: 20 },
  mapPreview: { height: 128, borderRadius: 12, overflow: 'hidden', marginTop: 8 },
  mapImage: { width: '100%', height: '100%' },
  mapOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  mapCircle: { width: 64, height: 64, borderRadius: 32, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  mapDot: { width: 8, height: 8, borderRadius: 4 },
  radiusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  radiusLabel: { fontSize: 14, fontFamily: Fonts.lexend.bold },
  radiusValue: { fontSize: 14, fontFamily: Fonts.lexend.bold },
  radiusLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  radiusLabelSmall: { fontSize: 10, fontFamily: Fonts.lexend.bold, color: '#999' },
  securityNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 12 },
  securityNoteText: { fontSize: 12, fontFamily: Fonts.lexend.medium, color: '#999', fontStyle: 'italic' },
  reviewCard: { borderRadius: 24, borderWidth: 1, overflow: 'hidden' },
  reviewItem: { flexDirection: 'row', gap: 16, padding: 24 },
  reviewIconBox: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  reviewLabel: { fontSize: 10, fontFamily: Fonts.lexend.bold, color: '#999', letterSpacing: 2 },
  reviewValue: { fontSize: 18, fontFamily: Fonts.lexend.medium, marginTop: 2 },
  reviewSub: { fontSize: 12, fontFamily: Fonts.lexend.regular, color: '#999', marginTop: 2 },
  reviewDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginHorizontal: 24 },
  securityRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  securityDot: { width: 8, height: 8, borderRadius: 4 },
  editBtn: { height: 48, backgroundColor: 'rgba(255,255,255,0.03)', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  editBtnText: { fontSize: 11, fontFamily: Fonts.lexend.bold, letterSpacing: 2 },
  broadcastActions: { gap: 16, marginTop: 8 },
  launchBtn: { height: 64, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  launchBtnText: { fontSize: 18, fontFamily: Fonts.lexend.bold, color: '#0A0A0A' },
  scheduleBtn: { height: 56, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  scheduleBtnText: { fontSize: 16, fontFamily: Fonts.lexend.semiBold },
  broadcastNote: { textAlign: 'center', fontSize: 10, fontFamily: Fonts.lexend.bold, color: '#999', letterSpacing: 2, marginTop: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  title: { fontSize: 28, fontFamily: Fonts.lexend.bold },
  addButton: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  listContent: { padding: 20, paddingBottom: 160 },
  card: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.05)', alignItems: 'center', justifyContent: 'center' },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 18, fontFamily: Fonts.lexend.bold },
  cardSubtitle: { fontSize: 14, fontFamily: Fonts.lexend.regular },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, height: '60%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontFamily: Fonts.lexend.bold },
  modalItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1 },
  modalItemTitle: { fontSize: 16, fontFamily: Fonts.lexend.bold },
  modalItemSubtitle: { fontSize: 14, fontFamily: Fonts.lexend.regular }
});
