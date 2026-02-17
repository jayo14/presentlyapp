import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ScrollView, Switch, Modal } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { storage } from '@/utils/storage';
import { useAuth } from '@/contexts/AuthContext';
import { Session, LecturerCourse, Venue } from '@/types';
import { Plus, Clock, MapPin, Calendar, X, ChevronDown, BookOpen, QrCode, Hash, Navigation } from 'lucide-react-native';
import { Button } from '@/components/Button';
import Fonts from '@/constants/fonts';

export default function LecturerSessionsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [courses, setCourses] = useState<LecturerCourse[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form
  const [selectedCourse, setSelectedCourse] = useState<LecturerCourse | null>(null);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [methods, setMethods] = useState({
    qr: true,
    pin: false,
    gps: true,
  });
  const [radius, setRadius] = useState(250);

  // Modals
  const [showCoursePicker, setShowCoursePicker] = useState(false);
  const [showVenuePicker, setShowVenuePicker] = useState(false);

  const loadData = async () => {
    const [loadedSessions, loadedCourses, loadedVenues] = await Promise.all([
      storage.getSessions(),
      storage.getLecturerCourses(),
      storage.getVenues()
    ]);
    setSessions(loadedSessions.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()));
    setCourses(loadedCourses);
    setVenues(loadedVenues);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleCreate = async () => {
    if (!selectedCourse || !selectedVenue) {
      Alert.alert('Error', 'Please select a course and venue');
      return;
    }

    setLoading(true);
    
    const now = new Date();
    const end = new Date(now.getTime() + 60 * 60000); // 1 hour duration

    const newSession: Session = {
      id: Date.now().toString(),
      courseId: selectedCourse.id,
      courseCode: selectedCourse.code,
      courseName: selectedCourse.title,
      lecturerId: user?.id || 'unknown',
      lecturerName: user?.fullName || 'Lecturer',
      venueId: selectedVenue.id,
      venueName: selectedVenue.name,
      startTime: now.toISOString(),
      endTime: end.toISOString(),
      duration: 60,
      location: {
        latitude: selectedVenue.latitude,
        longitude: selectedVenue.longitude,
        radius: radius,
      },
      status: 'active',
      date: now.toISOString().split('T')[0],
      sessionCode: Math.random().toString(36).substring(2, 10).toUpperCase(),
    };

    await storage.saveSession(newSession);
    await loadData();
    setLoading(false);
    setIsCreating(false);
    router.push(`/(lecturer)/session/${newSession.id}`);
  };

  if (isCreating) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => setIsCreating(false)} style={styles.backBtn}>
            <ChevronDown size={28} color={colors.text} style={{ transform: [{ rotate: '90deg' }] }} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>New Attendance Session</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.formScroll} showsVerticalScrollIndicator={false}>
          {/* Course Selection */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Course Selection</Text>
            <TouchableOpacity
                style={[styles.selectBox, { backgroundColor: '#352e18', borderColor: '#6a5d2f' }]}
                onPress={() => setShowCoursePicker(true)}
            >
              <Text style={[styles.selectText, { color: selectedCourse ? colors.text : colors.textSecondary }]}>
                {selectedCourse ? `${selectedCourse.code}: ${selectedCourse.title}` : 'Search course...'}
              </Text>
              <ChevronDown size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Lecture Hall */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Lecture Hall</Text>
            <TouchableOpacity
                style={[styles.selectBox, { backgroundColor: '#352e18', borderColor: '#6a5d2f' }]}
                onPress={() => setShowVenuePicker(true)}
            >
              <Text style={[styles.selectText, { color: selectedVenue ? colors.text : colors.textSecondary }]}>
                {selectedVenue ? selectedVenue.name : 'Select location'}
              </Text>
              <MapPin size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Verification Methods */}
          <View style={styles.methodsSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Verification Methods</Text>

            <MethodToggle
                icon={QrCode}
                label="QR Code"
                value={methods.qr}
                onValueChange={(v: boolean) => setMethods({...methods, qr: v})}
                colors={colors}
            />
            <MethodToggle
                icon={Hash}
                label="8-Digit Code"
                value={methods.pin}
                onValueChange={(v: boolean) => setMethods({...methods, pin: v})}
                colors={colors}
            />
            <MethodToggle
                icon={Navigation}
                label="GPS Verification"
                value={methods.gps}
                onValueChange={(v: boolean) => setMethods({...methods, gps: v})}
                colors={colors}
            />
          </View>

          {/* Geofence Slider */}
          <View style={styles.sliderSection}>
            <View style={styles.sliderHeader}>
              <Text style={[styles.label, { color: colors.text }]}>Geofence Radius</Text>
              <Text style={[styles.radiusValue, { color: colors.primary }]}>{radius}m</Text>
            </View>
            <View style={styles.sliderContainer}>
                <View style={[styles.sliderTrack, { backgroundColor: '#6a5d2f' }]}>
                    <View style={[styles.sliderFill, { backgroundColor: colors.primary, width: `${(radius / 500) * 100}%` }]} />
                </View>
                <TouchableOpacity style={[styles.sliderPlaceholder, { left: `${(radius / 500) * 100}%` }]} />
            </View>
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabelText}>50m</Text>
              <Text style={styles.sliderLabelText}>500m</Text>
            </View>
          </View>

          <Button
            title="Create Session"
            onPress={handleCreate}
            loading={loading}
            style={styles.createBtn}
            textStyle={styles.createBtnText}
          />
        </ScrollView>

        {/* Course Picker Modal */}
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
                keyExtractor={item => item.id}
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
                        <Text style={[styles.modalItemSubtitle, { color: colors.textSecondary }]}>{item.title}</Text>
                    </View>
                    </TouchableOpacity>
                )}
                />
            </View>
            </View>
        </Modal>

        {/* Venue Picker Modal */}
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
                keyExtractor={item => item.id}
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
                        <Text style={[styles.modalItemSubtitle, { color: colors.textSecondary }]}>{item.address}</Text>
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
          onPress={() => setIsCreating(true)}
        >
          <Plus size={24} color="#231e0f" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={sessions}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
            onPress={() => router.push(`/(lecturer)/session/${item.id}`)}
          >
            <View style={styles.cardHeader}>
                <View style={styles.cardIcon}>
                    <Clock size={24} color={colors.primary} />
                </View>
                <View style={styles.cardInfo}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>{item.courseCode}</Text>
                    <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>{item.courseName}</Text>
                </View>
                <View style={[
                    styles.statusBadge, 
                    { backgroundColor: item.status === 'active' ? colors.success + '20' : colors.border }
                ]}>
                    <Text style={{ 
                        color: item.status === 'active' ? colors.success : colors.textSecondary,
                        fontWeight: '700',
                        fontSize: 12
                    }}>
                        {item.status.toUpperCase()}
                    </Text>
                </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

function MethodToggle({ icon: Icon, label, value, onValueChange, colors }: any) {
    return (
        <View style={styles.methodItem}>
            <View style={styles.methodLeft}>
                <Icon size={24} color={colors.primary} />
                <Text style={[styles.methodLabel, { color: colors.text }]}>{label}</Text>
            </View>
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{ false: '#6a5d2f', true: colors.primary }}
                thumbColor={value ? '#FFFFFF' : '#f4f3f4'}
            />
        </View>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: Fonts.lexend.bold,
  },
  formScroll: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontFamily: Fonts.lexend.medium,
    marginBottom: 12,
  },
  selectBox: {
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  selectText: {
    fontSize: 15,
    fontFamily: Fonts.lexend.regular,
  },
  methodsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: Fonts.lexend.bold,
    marginBottom: 16,
  },
  methodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 93, 47, 0.1)',
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  methodLabel: {
    fontSize: 16,
    fontFamily: Fonts.lexend.regular,
  },
  sliderSection: {
    marginBottom: 40,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  radiusValue: {
    fontSize: 16,
    fontFamily: Fonts.lexend.bold,
  },
  sliderContainer: {
    height: 40,
    justifyContent: 'center',
  },
  sliderTrack: {
    height: 8,
    borderRadius: 4,
    width: '100%',
  },
  sliderFill: {
    height: '100%',
    borderRadius: 4,
  },
  sliderPlaceholder: {
      position: 'absolute',
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: '#f9c406',
      borderWidth: 3,
      borderColor: '#231e0f',
      marginLeft: -12,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  sliderLabelText: {
    fontSize: 12,
    fontFamily: Fonts.lexend.regular,
    color: '#ccbf8e',
  },
  createBtn: {
    height: 60,
    borderRadius: 16,
  },
  createBtnText: {
    fontSize: 18,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: Fonts.lexend.bold,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: 20,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
  },
  cardIcon: {
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: 'rgba(0,0,0,0.05)',
      alignItems: 'center',
      justifyContent: 'center',
  },
  cardInfo: {
      flex: 1,
  },
  cardTitle: {
      fontSize: 18,
      fontFamily: Fonts.lexend.bold,
  },
  cardSubtitle: {
      fontSize: 14,
      fontFamily: Fonts.lexend.regular,
  },
  statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    height: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: Fonts.lexend.bold,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalItemTitle: {
    fontSize: 16,
    fontFamily: Fonts.lexend.bold,
  },
  modalItemSubtitle: {
    fontSize: 14,
    fontFamily: Fonts.lexend.regular,
  },
});
