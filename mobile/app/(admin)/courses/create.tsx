import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { X, ChevronDown, ArrowRight, Minus, Plus, Users, Upload, RefreshCw, ChevronRight, CheckCircle, ShieldCheck } from 'lucide-react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Fonts from '@/constants/fonts';
import { api } from '@/services/api';
import Slider from '@react-native-community/slider';

const { width } = Dimensions.get('window');

export default function CreateCourseScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    facultyId: '',
    departmentId: '',
    creditUnits: 3,
    semester: '1st',
    autoEnroll: true,
    attendanceThreshold: 75,
    enrollmentMethod: 'manual',
  });

  // Master Data
  const [faculties, setFaculties] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [showFacultyPicker, setShowFacultyPicker] = useState(false);
  const [showDeptPicker, setShowDeptPicker] = useState(false);

  useEffect(() => {
    loadMasterData();
  }, []);

  const loadMasterData = async () => {
    try {
      const [facData, deptData] = await Promise.all([
        api.colleges.list(),
        api.departments.list()
      ]) as [any, any];
      setFaculties(Array.isArray(facData) ? facData : (facData.results || []));
      setDepartments(Array.isArray(deptData) ? deptData : (deptData.results || []));
    } catch (e) {
      console.error('Failed to load master data', e);
    }
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else handleCreate();
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else router.canGoBack() ? router.back() : router.replace("/");
  };

  const handleCreate = async () => {
    try {
      setLoading(true);
      const payload = {
        name: formData.title,
        code: formData.code,
        department: formData.departmentId,
        credit_units: formData.creditUnits,
        semester: formData.semester === '1st' ? 1 : 2,
        attendance_threshold: formData.attendanceThreshold,
        is_active: true,
      };
      await api.courses.create(payload);
      Alert.alert('Success', 'Course created successfully');
      router.canGoBack() ? router.back() : router.replace("/");
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: isDark ? 'rgba(255,255,255,0.7)' : '#666' }]}>Course Title</Text>
        <TextInput
          style={[styles.input, { backgroundColor: isDark ? '#1A1A1A' : '#F3F4F6', color: colors.text }]}
          placeholder="e.g. Advanced Software Engineering"
          placeholderTextColor={isDark ? 'rgba(255,255,255,0.2)' : '#999'}
          value={formData.title}
          onChangeText={(v) => setFormData({ ...formData, title: v })}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: isDark ? 'rgba(255,255,255,0.7)' : '#666' }]}>Course Code</Text>
        <TextInput
          style={[styles.input, { backgroundColor: isDark ? '#1A1A1A' : '#F3F4F6', color: colors.text, textTransform: 'uppercase' }]}
          placeholder="e.g. CSC 401"
          placeholderTextColor={isDark ? 'rgba(255,255,255,0.2)' : '#999'}
          value={formData.code}
          onChangeText={(v) => setFormData({ ...formData, code: v })}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: isDark ? 'rgba(255,255,255,0.7)' : '#666' }]}>Faculty/College</Text>
        <TouchableOpacity
            style={[styles.input, styles.pickerTrigger, { backgroundColor: isDark ? '#1A1A1A' : '#F3F4F6' }]}
            onPress={() => setShowFacultyPicker(true)}
        >
          <Text style={{ color: formData.facultyId ? colors.text : (isDark ? 'rgba(255,255,255,0.2)' : '#999') }}>
            {faculties.find(f => f.id === formData.facultyId)?.name || 'Search faculty...'}
          </Text>
          <ChevronDown size={20} color={isDark ? 'rgba(255,255,255,0.4)' : '#666'} />
        </TouchableOpacity>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: isDark ? 'rgba(255,255,255,0.7)' : '#666' }]}>Department</Text>
        <TouchableOpacity
            style={[styles.input, styles.pickerTrigger, { backgroundColor: isDark ? '#1A1A1A' : '#F3F4F6' }]}
            onPress={() => setShowDeptPicker(true)}
        >
          <Text style={{ color: formData.departmentId ? colors.text : (isDark ? 'rgba(255,255,255,0.2)' : '#999') }}>
            {departments.find(d => d.id === formData.departmentId)?.name || 'Search department...'}
          </Text>
          <ChevronDown size={20} color={isDark ? 'rgba(255,255,255,0.4)' : '#666'} />
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.label, { color: isDark ? 'rgba(255,255,255,0.7)' : '#666' }]}>Credit Units</Text>
          <View style={[styles.counter, { backgroundColor: isDark ? '#1A1A1A' : '#F3F4F6' }]}>
            <TouchableOpacity onPress={() => setFormData({...formData, creditUnits: Math.max(1, formData.creditUnits - 1)})} style={styles.counterBtn}>
              <Minus size={20} color={isDark ? 'rgba(255,255,255,0.5)' : '#666'} />
            </TouchableOpacity>
            <Text style={[styles.counterText, { color: colors.text }]}>{formData.creditUnits}</Text>
            <TouchableOpacity onPress={() => setFormData({...formData, creditUnits: formData.creditUnits + 1})} style={styles.counterBtn}>
              <Plus size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.label, { color: isDark ? 'rgba(255,255,255,0.7)' : '#666' }]}>Semester</Text>
          <View style={[styles.semesterToggle, { backgroundColor: isDark ? '#1A1A1A' : '#F3F4F6' }]}>
            <TouchableOpacity
                style={[styles.semBtn, formData.semester === '1st' && { backgroundColor: colors.primary }]}
                onPress={() => setFormData({...formData, semester: '1st'})}
            >
              <Text style={[styles.semBtnText, { color: formData.semester === '1st' ? '#0A0A0A' : (isDark ? 'rgba(255,255,255,0.4)' : '#666') }]}>1st</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.semBtn, formData.semester === '2nd' && { backgroundColor: colors.primary }]}
                onPress={() => setFormData({...formData, semester: '2nd'})}
            >
              <Text style={[styles.semBtnText, { color: formData.semester === '2nd' ? '#0A0A0A' : (isDark ? 'rgba(255,255,255,0.4)' : '#666') }]}>2nd</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
        <Text style={[styles.stepTitle, { color: colors.text }]}>Enrollment Settings</Text>
        <Text style={[styles.stepSubtitle, { color: isDark ? 'rgba(255,255,255,0.6)' : '#666' }]}>Choose how students will be added to your course roster.</Text>

        <View style={styles.optionsList}>
            <TouchableOpacity style={[styles.optionCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FFF', borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }]}>
                <View style={[styles.optionIcon, { backgroundColor: colors.primary + '1A' }]}>
                    <Users size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.optionName, { color: colors.text }]}>Manual Entry</Text>
                    <Text style={styles.optionDesc}>Type names individually</Text>
                </View>
                <ChevronRight size={20} color={isDark ? 'rgba(255,255,255,0.2)' : '#999'} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.optionCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FFF', borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }]}>
                <View style={[styles.optionIcon, { backgroundColor: colors.primary + '1A' }]}>
                    <Upload size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.optionName, { color: colors.text }]}>Bulk CSV Upload</Text>
                    <Text style={styles.optionDesc}>Upload a student list</Text>
                </View>
                <ChevronRight size={20} color={isDark ? 'rgba(255,255,255,0.2)' : '#999'} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.optionCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FFF', borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }]}>
                <View style={[styles.optionIcon, { backgroundColor: colors.primary + '1A' }]}>
                    <RefreshCw size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.optionName, { color: colors.text }]}>Institutional Sync</Text>
                    <Text style={styles.optionDesc}>Connect to university DB</Text>
                </View>
                <ChevronRight size={20} color={isDark ? 'rgba(255,255,255,0.2)' : '#999'} />
            </TouchableOpacity>
        </View>

        <View style={[styles.autoEnrollBox, { backgroundColor: colors.primary + '0D', borderColor: colors.primary + '1A' }]}>
            <View>
                <Text style={[styles.optionName, { color: colors.text }]}>Auto-Enrollment</Text>
                <Text style={[styles.optionDesc, { color: colors.primary + '99' }]}>Allow join via course code</Text>
            </View>
            <TouchableOpacity
                style={[styles.toggleTrack, { backgroundColor: formData.autoEnroll ? colors.primary + '4D' : (isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB') }]}
                onPress={() => setFormData({...formData, autoEnroll: !formData.autoEnroll})}
            >
                <View style={[styles.toggleThumb, {
                    backgroundColor: formData.autoEnroll ? colors.primary : '#FFF',
                    transform: [{ translateX: formData.autoEnroll ? 24 : 0 }]
                }]} />
            </TouchableOpacity>
        </View>

        <View style={styles.thresholdSection}>
            <View style={styles.thresholdHeader}>
                <View>
                    <Text style={[styles.optionName, { color: colors.text }]}>Attendance Threshold</Text>
                    <Text style={styles.optionDesc}>Minimum sessions required to pass</Text>
                </View>
                <Text style={[styles.thresholdValue, { color: colors.primary }]}>{formData.attendanceThreshold}%</Text>
            </View>
            <Slider
                style={{ width: '100%', height: 40 }}
                minimumValue={0}
                maximumValue={100}
                step={1}
                value={formData.attendanceThreshold}
                onValueChange={(v) => setFormData({ ...formData, attendanceThreshold: v })}
                minimumTrackTintColor={colors.primary}
                maximumTrackTintColor={isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB'}
                thumbTintColor={colors.primary}
            />
            <View style={styles.thresholdLabels}>
                <Text style={styles.labelSmall}>0%</Text>
                <Text style={styles.labelSmall}>50%</Text>
                <Text style={styles.labelSmall}>100%</Text>
            </View>
        </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
        <Text style={[styles.stepTitle, { color: colors.text }]}>Review Details</Text>
        <Text style={[styles.stepSubtitle, { color: isDark ? 'rgba(255,255,255,0.6)' : '#666' }]}>Please verify the course information before finalizing the creation.</Text>

        <View style={[styles.reviewCard, { backgroundColor: colors.primary + '0D', borderColor: colors.primary + '33' }]}>
            <View style={styles.reviewItem}>
                <Text style={[styles.reviewLabel, { color: colors.primary + '99' }]}>COURSE NAME</Text>
                <Text style={[styles.reviewValue, { color: colors.text }]}>{formData.title}</Text>
            </View>
            <View style={styles.reviewGrid}>
                <View style={styles.reviewItem}>
                    <Text style={[styles.reviewLabel, { color: colors.primary + '99' }]}>COURSE CODE</Text>
                    <Text style={[styles.reviewValue, { color: colors.text }]}>{formData.code}</Text>
                </View>
                <View style={styles.reviewItem}>
                    <Text style={[styles.reviewLabel, { color: colors.primary + '99' }]}>THRESHOLD</Text>
                    <Text style={[styles.reviewValue, { color: colors.text }]}>{formData.attendanceThreshold}% Attendance</Text>
                </View>
            </View>
            <View style={styles.reviewItem}>
                <Text style={[styles.reviewLabel, { color: colors.primary + '99' }]}>DEPARTMENT</Text>
                <Text style={[styles.reviewValue, { color: colors.text }]}>
                    {departments.find(d => d.id === formData.departmentId)?.name || 'Not specified'}
                </Text>
            </View>
        </View>

        <View style={styles.lecturerSection}>
            <Text style={[styles.reviewLabel, { color: colors.primary + '99', marginBottom: 12 }]}>PRIMARY LECTURER</Text>
            <View style={[styles.lecturerCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FFF', borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }]}>
                <View style={styles.lecturerAvatar}>
                    <ShieldCheck size={24} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.optionName, { color: colors.text }]}>Dr. Julian Sterling</Text>
                    <Text style={styles.optionDesc}>Head of Department (CS)</Text>
                </View>
                <CheckCircle size={20} color={colors.primary + '66'} />
            </View>
        </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0A0A0A' : '#f8f8f5' }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.closeBtn}>
          {step === 1 ? <X size={24} color={colors.text} /> : <MaterialIcons name="arrow-back-ios" size={24} color={colors.primary} />}
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={[styles.headerSubtitle, { color: colors.primary }]}>Step {step} of 3</Text>
          {step < 3 ? (
            <View style={styles.progressRow}>
                <View style={[styles.progressDot, { width: 32, backgroundColor: step >= 1 ? colors.primary : (isDark ? '#1A1A1A' : '#E5E7EB') }]} />
                <View style={[styles.progressDot, { width: 32, backgroundColor: step >= 2 ? colors.primary : (isDark ? '#1A1A1A' : '#E5E7EB') }]} />
                <View style={[styles.progressDot, { width: 32, backgroundColor: step >= 3 ? colors.primary : (isDark ? '#1A1A1A' : '#E5E7EB') }]} />
            </View>
          ) : (
            <View style={styles.stepperContainer}>
                <View style={[styles.stepperCircle, { backgroundColor: colors.primary }]}>
                    <Text style={styles.stepperText}>1</Text>
                </View>
                <View style={[styles.stepperLine, { backgroundColor: colors.primary }]} />
                <View style={[styles.stepperCircle, { backgroundColor: colors.primary }]}>
                    <Text style={styles.stepperText}>2</Text>
                </View>
                <View style={[styles.stepperLine, { backgroundColor: colors.primary }]} />
                <View style={[styles.stepperCircle, { backgroundColor: colors.primary, borderWidth: 4, borderColor: colors.primary + '33' }]}>
                    <Text style={styles.stepperText}>3</Text>
                </View>
            </View>
          )}
        </View>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {step === 1 && (
          <>
            <View style={styles.titleSection}>
              <Text style={[styles.pageTitle, { color: colors.text }]}>Create New Course</Text>
              <Text style={[styles.pageSubtitle, { color: isDark ? 'rgba(255,255,255,0.5)' : '#666' }]}>Enter the fundamental details of your course.</Text>
            </View>
            {renderStep1()}
          </>
        )}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: isDark ? 'transparent' : '#f8f8f5' }]}>
        <View style={styles.footerBtns}>
          {step > 1 && (
            <TouchableOpacity
              style={[styles.prevBtn, { borderColor: colors.primary + '4D' }]}
              onPress={handleBack}
            >
              <Text style={[styles.prevBtnText, { color: colors.primary }]}>Previous</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
              style={[styles.mainBtn, { backgroundColor: colors.primary, flex: step > 1 ? 2 : 1 }]}
              onPress={handleNext}
              disabled={loading}
          >
            {loading ? (
                <ActivityIndicator color="#0A0A0A" />
            ) : (
                <>
                  <Text style={styles.mainBtnText}>
                      {step === 1 ? 'Continue to Details' : step === 2 ? 'Next Step' : 'Finalize & Create Course'}
                  </Text>
                  <ArrowRight size={20} color="#0A0A0A" />
                </>
            )}
          </TouchableOpacity>
        </View>
        {step === 3 && (
            <Text style={styles.agreement}>BY CREATING THIS COURSE YOU AGREE TO THE FACULTY GUIDELINES</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10 },
  closeBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  headerTitleWrap: { alignItems: 'center', flex: 1 },
  headerSubtitle: { fontSize: 10, fontFamily: Fonts.lexend.bold, textTransform: 'uppercase', letterSpacing: 2 },
  progressRow: { flexDirection: 'row', gap: 6, marginTop: 8 },
  progressDot: { height: 4, borderRadius: 2 },
  stepperContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 12, width: 160, justifyContent: 'center' },
  stepperCircle: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  stepperText: { fontSize: 10, fontFamily: Fonts.lexend.bold, color: '#0A0A0A' },
  stepperLine: { flex: 1, height: 2, marginHorizontal: 4 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 120 },
  titleSection: { marginBottom: 32 },
  pageTitle: { fontSize: 24, fontFamily: Fonts.lexend.bold },
  pageSubtitle: { fontSize: 14, fontFamily: Fonts.lexend.regular, marginTop: 4 },
  stepContainer: { gap: 24 },
  inputGroup: { gap: 8 },
  label: { fontSize: 14, fontFamily: Fonts.lexend.medium, marginLeft: 4 },
  input: { height: 56, borderRadius: 16, paddingHorizontal: 20, fontSize: 15, fontFamily: Fonts.lexend.regular, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  pickerTrigger: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  row: { flexDirection: 'row', gap: 16 },
  counter: { height: 56, borderRadius: 16, flexDirection: 'row', alignItems: 'center', padding: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  counterBtn: { width: 48, height: '100%', alignItems: 'center', justifyContent: 'center' },
  counterText: { flex: 1, textAlign: 'center', fontSize: 18, fontFamily: Fonts.lexend.bold },
  semesterToggle: { height: 56, borderRadius: 16, flexDirection: 'row', padding: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  semBtn: { flex: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  semBtnText: { fontSize: 12, fontFamily: Fonts.lexend.bold, textTransform: 'uppercase' },
  footer: { position: 'absolute', bottom: 0, width: '100%', padding: 24, paddingBottom: 40 },
  footerBtns: { flexDirection: 'row', gap: 12 },
  prevBtn: { flex: 1, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  prevBtnText: { fontSize: 16, fontFamily: Fonts.lexend.bold },
  mainBtn: { height: 64, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, shadowColor: '#FFCA0D', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 30, elevation: 8 },
  mainBtnText: { fontSize: 16, fontFamily: Fonts.lexend.bold, color: '#0A0A0A' },
  stepTitle: { fontSize: 24, fontFamily: Fonts.lexend.bold, marginBottom: 8 },
  stepSubtitle: { fontSize: 14, fontFamily: Fonts.lexend.regular, opacity: 0.6, marginBottom: 16 },
  optionsList: { gap: 16 },
  optionCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, borderWidth: 1, gap: 16 },
  optionIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  optionName: { fontSize: 16, fontFamily: Fonts.lexend.bold },
  optionDesc: { fontSize: 12, fontFamily: Fonts.lexend.regular, opacity: 0.4 },
  autoEnrollBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderRadius: 20, borderWidth: 1, marginTop: 8 },
  toggleTrack: { width: 52, height: 28, borderRadius: 14, padding: 2 },
  toggleThumb: { width: 24, height: 24, borderRadius: 12 },
  thresholdSection: { marginTop: 8 },
  thresholdHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 },
  thresholdValue: { fontSize: 24, fontFamily: Fonts.lexend.bold },
  thresholdLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  labelSmall: { fontSize: 10, fontFamily: Fonts.lexend.medium, opacity: 0.2 },
  reviewCard: { padding: 24, borderRadius: 24, borderWidth: 1, gap: 24 },
  reviewItem: { gap: 4 },
  reviewLabel: { fontSize: 10, fontFamily: Fonts.lexend.bold, letterSpacing: 2 },
  reviewValue: { fontSize: 18, fontFamily: Fonts.lexend.bold },
  reviewGrid: { flexDirection: 'row', gap: 24 },
  lecturerSection: { marginTop: 8 },
  lecturerCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, borderWidth: 1, gap: 16 },
  lecturerAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,202,13,0.2)' },
  agreement: { textAlign: 'center', fontSize: 10, fontFamily: Fonts.lexend.bold, opacity: 0.4, marginTop: 16, letterSpacing: 1 }
});
