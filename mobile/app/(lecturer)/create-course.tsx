import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Dimensions, Animated, Slider } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { X, ArrowRight, ArrowLeft, Minus, Plus, UnfoldVertical, Landmark, Hub, GraduationCap, Layers, User, Lock, Search, Info, CheckCircle2 } from 'lucide-react-native';
import Fonts from '@/constants/fonts';
import { useState, useRef, useEffect } from 'react';
import { api } from '@/services/api';

const { width } = Dimensions.get('window');

export default function CreateCourseScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
      title: '',
      code: '',
      level: '100',
      credits: 3,
      semester: 'FIRST',
      faculty: 'Sciences',
      department: 'Computer Science',
      coLecturer: '',
      threshold: 75,
      colorTag: '#FFCA0D',
  });

  const bgColor = isDark ? '#0A0A0A' : colors.background;

  const handleNext = () => {
    if (step < 3) {
        setStep(step + 1);
    } else {
        handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
        setStep(step - 1);
    } else {
        router.back();
    }
  };

  const handleSubmit = async () => {
    try {
        // In a real scenario, we'd have the department objects with IDs.
        // For this implementation, we'll try to find a matching department or use a fallback.
        const depts = await api.departments.list();
        const matchingDept = depts.results?.find((d: any) => d.name === formData.department) || depts[0];

        const payload = {
            title: formData.title,
            code: formData.code,
            level: formData.level,
            credit_units: formData.credits,
            semester: formData.semester,
            department: matchingDept ? [matchingDept.id] : [],
        };

        const res = await api.courses.create(payload);
        router.push({
            pathname: '/(lecturer)/courses/create-success',
            params: { id: res.id, code: res.code, title: res.title }
        });
    } catch (e) {
        console.error('Failed to create course', e);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDark ? 'rgba(10, 10, 10, 0.95)' : 'rgba(255, 255, 255, 0.95)' }]}>
        <View style={styles.headerTop}>
            <TouchableOpacity onPress={handleBack} style={styles.iconBtn}>
                {step === 1 ? <X size={20} color="#FFFFFF" /> : <ArrowLeft size={20} color="#FFFFFF" />}
            </TouchableOpacity>
            <View style={styles.stepIndicator}>
                <Text style={styles.stepText}>Step {step} of 3</Text>
                <View style={styles.dotsRow}>
                    <View style={[styles.dot, step >= 1 ? styles.activeDot : styles.inactiveDot]} />
                    <View style={[styles.dot, step >= 2 ? styles.activeDot : styles.inactiveDot]} />
                    <View style={[styles.dot, step >= 3 ? styles.activeDot : styles.inactiveDot]} />
                </View>
            </View>
            {step === 1 ? <View style={{ width: 40 }} /> : (
                 <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
                    <X size={20} color="#FFFFFF" />
                </TouchableOpacity>
            )}
        </View>

        <View style={styles.headerTitleContainer}>
            <Text style={[styles.title, { color: isDark ? '#FFFFFF' : colors.text }]}>
                {step === 1 ? 'Basic Info' : step === 2 ? 'Institutional Hierarchy' : 'Assignment & Rules'}
            </Text>
            <Text style={styles.subtitle}>
                {step === 1 ? 'Start by defining the core course identity.' : step === 2 ? 'Define where this course sits within the organization.' : 'Finalize course instructors and management rules.'}
            </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {step === 1 && <Step1 formData={formData} setFormData={setFormData} />}
        {step === 2 && <Step2 formData={formData} setFormData={setFormData} />}
        {step === 3 && <Step3 formData={formData} setFormData={setFormData} />}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
            <Text style={styles.nextBtnText}>
                {step === 1 ? 'Continue to Course Details' : step === 2 ? 'Continue to Schedule' : 'Finalize & Create Course'}
            </Text>
            {step < 3 ? <ArrowRight size={20} color="#0A0A0A" strokeWidth={3} /> : <CheckCircle2 size={20} color="#0A0A0A" strokeWidth={3} />}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function Step1({ formData, setFormData }: any) {
    const levels = ['100', '200', '300', '400', '500'];
    return (
        <View style={styles.stepContainer}>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>COURSE TITLE</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g. Advanced Software Engineering"
                    placeholderTextColor="rgba(255,255,255,0.2)"
                    value={formData.title}
                    onChangeText={(v) => setFormData({ ...formData, title: v })}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>COURSE CODE</Text>
                <TextInput
                    style={[styles.input, { textTransform: 'uppercase' }]}
                    placeholder="CSC 401"
                    placeholderTextColor="rgba(255,255,255,0.2)"
                    value={formData.code}
                    onChangeText={(v) => setFormData({ ...formData, code: v })}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>ACADEMIC LEVEL</Text>
                <View style={styles.levelRow}>
                    {levels.map(l => (
                        <TouchableOpacity
                            key={l}
                            style={[styles.levelBtn, formData.level === l && styles.activeLevelBtn]}
                            onPress={() => setFormData({ ...formData, level: l })}
                        >
                            <Text style={[styles.levelBtnText, formData.level === l && styles.activeLevelBtnText]}>{l}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                    <Text style={styles.label}>CREDIT UNITS</Text>
                    <View style={styles.counter}>
                        <TouchableOpacity style={styles.counterBtn} onPress={() => setFormData({ ...formData, credits: Math.max(1, formData.credits - 1) })}>
                            <Minus size={20} color="rgba(255,255,255,0.6)" />
                        </TouchableOpacity>
                        <Text style={styles.counterValue}>{formData.credits}</Text>
                        <TouchableOpacity style={[styles.counterBtn, { backgroundColor: 'rgba(255, 202, 13, 0.1)' }]} onPress={() => setFormData({ ...formData, credits: formData.credits + 1 })}>
                            <Plus size={20} color="#FFCA0D" />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                    <Text style={styles.label}>SEMESTER</Text>
                    <View style={styles.semesterRow}>
                        <TouchableOpacity
                            style={[styles.semesterBtn, formData.semester === 'FIRST' && styles.activeSemesterBtn]}
                            onPress={() => setFormData({ ...formData, semester: 'FIRST' })}
                        >
                            <Text style={[styles.semesterBtnText, formData.semester === 'FIRST' && styles.activeSemesterBtnText]}>1ST</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.semesterBtn, formData.semester === 'SECOND' && styles.activeSemesterBtn]}
                            onPress={() => setFormData({ ...formData, semester: 'SECOND' })}
                        >
                            <Text style={[styles.semesterBtnText, formData.semester === 'SECOND' && styles.activeSemesterBtnText]}>2ND</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>FACULTY / COLLEGE</Text>
                <TouchableOpacity style={styles.selectInput}>
                    <Text style={styles.selectText}>{formData.faculty}</Text>
                    <UnfoldVertical size={20} color="#FFCA0D" />
                </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>DEPARTMENT</Text>
                <TouchableOpacity style={styles.selectInput}>
                    <Text style={styles.selectText}>{formData.department}</Text>
                    <UnfoldVertical size={20} color="#FFCA0D" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

function Step2({ formData, setFormData }: any) {
    return (
        <View style={styles.stepContainer}>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>UNIVERSITY / CAMPUS</Text>
                <View style={styles.selectInputWithIcon}>
                    <Landmark size={20} color="rgba(255,255,255,0.3)" style={{ marginRight: 12 }} />
                    <Text style={styles.selectText}>Main Campus - City Center</Text>
                    <UnfoldVertical size={20} color="rgba(255,255,255,0.4)" style={{ marginLeft: 'auto' }} />
                </View>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>DEPARTMENT</Text>
                <View style={styles.inputWithIcons}>
                    <Hub size={20} color="rgba(255,255,255,0.3)" style={{ marginRight: 12 }} />
                    <TextInput
                        style={[styles.transparentInput, { flex: 1 }]}
                        value={formData.department}
                        onChangeText={(v) => setFormData({ ...formData, department: v })}
                    />
                    <Search size={18} color="rgba(255,255,255,0.4)" />
                </View>
                <View style={styles.matchBadge}>
                    <Text style={styles.matchBadgeText}>MATCH FOUND</Text>
                </View>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>FACULTY / COLLEGE</Text>
                <View style={[styles.inputWithIcons, { backgroundColor: 'rgba(26, 26, 26, 0.5)', borderColor: '#FFCA0D' }]}>
                    <GraduationCap size={20} color="rgba(255, 202, 13, 0.6)" style={{ marginRight: 12 }} />
                    <Text style={[styles.selectText, { color: '#FFFFFF' }]}>Faculty of Computing & IT</Text>
                    <Info size={18} color="#FFCA0D" style={{ marginLeft: 'auto' }} />
                </View>
                <Text style={styles.infoSubtitle}>Automatically mapped based on department</Text>
            </View>

            <View style={styles.hierarchyCard}>
                <View style={styles.hierarchyTop}>
                    <View style={styles.layersIcon}>
                        <Layers size={18} color="rgba(255,255,255,0.4)" />
                    </View>
                    <View>
                        <Text style={styles.hierarchyTitle}>Hierarchy Context</Text>
                        <Text style={styles.hierarchySubtitle}>Level 4 Academic Structure</Text>
                    </View>
                </View>
                <View style={styles.hierarchyDivider} />
                <View style={styles.hierarchyBottom}>
                    <Text style={styles.reportingLabel}>Reporting to:</Text>
                    <Text style={styles.reportingValue}>Academic Board - Region A</Text>
                </View>
            </View>
        </View>
    );
}

function Step3({ formData, setFormData }: any) {
    const colorsArr = ['#FFCA0D', '#3B82F6', '#10B981', '#A855F7', '#F43F5E'];
    return (
        <View style={styles.stepContainer}>
            <View style={styles.inputGroup}>
                <Text style={[styles.label, { fontSize: 14, textTransform: 'none', color: 'rgba(255,255,255,0.7)' }]}>Main Lecturer</Text>
                <View style={styles.lecturerBox}>
                    <View style={styles.lecturerAvatar}>
                        <User size={14} color="#FFCA0D" />
                    </View>
                    <Text style={styles.lecturerName}>Dr. Sarah Jenkins (You)</Text>
                    <Lock size={12} color="rgba(255,255,255,0.4)" style={{ marginLeft: 'auto' }} />
                </View>
            </View>

            <View style={styles.inputGroup}>
                <Text style={[styles.label, { fontSize: 14, textTransform: 'none', color: 'rgba(255,255,255,0.7)' }]}>Co-Lecturer</Text>
                <View style={styles.inputWithIcons}>
                    <Search size={20} color="rgba(255,255,255,0.4)" style={{ marginRight: 12 }} />
                    <TextInput
                        style={[styles.transparentInput, { flex: 1 }]}
                        placeholder="Search by name or email..."
                        placeholderTextColor="rgba(255,255,255,0.2)"
                        value={formData.coLecturer}
                        onChangeText={(v) => setFormData({ ...formData, coLecturer: v })}
                    />
                </View>
            </View>

            <View style={styles.inputGroup}>
                <View style={styles.thresholdHeader}>
                    <View>
                        <Text style={[styles.label, { fontSize: 14, textTransform: 'none', color: 'rgba(255,255,255,0.7)', marginBottom: 0 }]}>Attendance Threshold</Text>
                        <Text style={styles.infoSubtitle}>Minimum required to sit for exams</Text>
                    </View>
                    <Text style={styles.thresholdValue}>{formData.threshold}%</Text>
                </View>
                {/* Slider - simple workaround as standard Slider is deprecated and community one might not be installed */}
                <View style={styles.sliderMock}>
                    <View style={styles.sliderTrack}>
                        <View style={[styles.sliderFill, { width: `${formData.threshold}%` }]} />
                        <View style={[styles.sliderThumb, { left: `${formData.threshold}%`, marginLeft: -12 }]} />
                    </View>
                </View>
                <View style={styles.sliderLabels}>
                    <Text style={styles.sliderLabel}>0%</Text>
                    <Text style={styles.sliderLabel}>50%</Text>
                    <Text style={styles.sliderLabel}>100%</Text>
                </View>
            </View>

            <View style={styles.inputGroup}>
                <Text style={[styles.label, { fontSize: 14, textTransform: 'none', color: 'rgba(255,255,255,0.7)' }]}>Course Color Tag</Text>
                <View style={styles.colorSelector}>
                    <View style={styles.colorsRow}>
                        {colorsArr.map(c => (
                            <TouchableOpacity
                                key={c}
                                style={[styles.colorCircle, { backgroundColor: c }, formData.colorTag === c && styles.activeColorCircle]}
                                onPress={() => setFormData({ ...formData, colorTag: c })}
                            />
                        ))}
                    </View>
                    <Text style={styles.selectionLabel}>SELECTION</Text>
                </View>
            </View>

            <View style={styles.finalInfo}>
                <Info size={18} color="#FFCA0D" />
                <Text style={styles.finalInfoText}>
                    By finalizing, students will be able to find this course using the code <Text style={{ color: '#FFCA0D', fontWeight: 'bold' }}>{formData.code || 'CSC 401'}</Text>.
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
    zIndex: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIndicator: {
    alignItems: 'center',
  },
  stepText: {
    fontSize: 10,
    fontFamily: Fonts.lexend.bold,
    color: '#FFCA0D',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  dot: {
    height: 1.5,
    width: 40,
    borderRadius: 1,
  },
  activeDot: {
    backgroundColor: '#FFCA0D',
    shadowColor: '#FFCA0D',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  inactiveDot: {
    backgroundColor: '#1A1A1A',
  },
  headerTitleContainer: {
    marginTop: 8,
  },
  title: {
    fontSize: 28,
    fontFamily: Fonts.lexend.bold,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: Fonts.lexend.regular,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 4,
  },
  scrollContent: {
    paddingTop: 32,
  },
  stepContainer: {
    paddingHorizontal: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 11,
    fontFamily: Fonts.lexend.bold,
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: 1.5,
    marginBottom: 10,
    marginLeft: 4,
  },
  input: {
    height: 56,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: Fonts.lexend.medium,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  levelRow: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 6,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  levelBtn: {
    flex: 1,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  activeLevelBtn: {
    backgroundColor: '#FFCA0D',
  },
  levelBtnText: {
    fontSize: 14,
    fontFamily: Fonts.lexend.bold,
    color: 'rgba(255,255,255,0.4)',
  },
  activeLevelBtnText: {
    color: '#0A0A0A',
  },
  row: {
    flexDirection: 'row',
  },
  counter: {
    height: 56,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  counterBtn: {
    width: 48,
    height: '100%',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterValue: {
    fontSize: 20,
    fontFamily: Fonts.lexend.bold,
    color: '#FFCA0D',
  },
  semesterRow: {
    height: 56,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    flexDirection: 'row',
    padding: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  semesterBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  activeSemesterBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  semesterBtnText: {
    fontSize: 12,
    fontFamily: Fonts.lexend.bold,
    color: 'rgba(255,255,255,0.3)',
  },
  activeSemesterBtnText: {
    color: '#FFFFFF',
  },
  selectInput: {
    height: 56,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  selectInputWithIcon: {
    height: 56,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  inputWithIcons: {
    height: 56,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  selectText: {
    fontSize: 14,
    fontFamily: Fonts.lexend.medium,
    color: '#FFFFFF',
  },
  matchBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 202, 13, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 202, 13, 0.2)',
  },
  matchBadgeText: {
    fontSize: 10,
    fontFamily: Fonts.lexend.bold,
    color: '#FFCA0D',
  },
  infoSubtitle: {
    fontSize: 10,
    fontFamily: Fonts.lexend.regular,
    color: 'rgba(255, 202, 13, 0.6)',
    fontStyle: 'italic',
    marginTop: 4,
    marginLeft: 4,
  },
  transparentInput: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: Fonts.lexend.medium,
  },
  hierarchyCard: {
    marginTop: 16,
    padding: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(26, 26, 26, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  hierarchyTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  layersIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hierarchyTitle: {
    fontSize: 12,
    fontFamily: Fonts.lexend.bold,
    color: 'rgba(255,255,255,0.8)',
  },
  hierarchySubtitle: {
    fontSize: 10,
    fontFamily: Fonts.lexend.medium,
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
  },
  hierarchyDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginVertical: 12,
  },
  hierarchyBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reportingLabel: {
    fontSize: 11,
    fontFamily: Fonts.lexend.regular,
    color: 'rgba(255,255,255,0.4)',
  },
  reportingValue: {
    fontSize: 11,
    fontFamily: Fonts.lexend.medium,
    color: 'rgba(255,255,255,0.8)',
  },
  lecturerBox: {
    height: 56,
    backgroundColor: 'rgba(26, 26, 26, 0.5)',
    borderRadius: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  lecturerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 202, 13, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  lecturerName: {
    fontSize: 14,
    fontFamily: Fonts.lexend.medium,
    color: 'rgba(255,255,255,0.4)',
  },
  thresholdHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  thresholdValue: {
    fontSize: 20,
    fontFamily: Fonts.lexend.bold,
    color: '#FFCA0D',
  },
  sliderMock: {
    height: 30,
    justifyContent: 'center',
  },
  sliderTrack: {
    height: 6,
    backgroundColor: '#1A1A1A',
    borderRadius: 3,
    position: 'relative',
  },
  sliderFill: {
    height: 6,
    backgroundColor: '#FFCA0D',
    borderRadius: 3,
  },
  sliderThumb: {
    position: 'absolute',
    top: -9,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFCA0D',
    borderWidth: 4,
    borderColor: '#0A0A0A',
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  sliderLabel: {
    fontSize: 10,
    fontFamily: Fonts.lexend.bold,
    color: 'rgba(255,255,255,0.2)',
  },
  colorSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  colorsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  activeColorCircle: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
    transform: [{ scale: 1.1 }],
  },
  selectionLabel: {
    fontSize: 10,
    fontFamily: Fonts.lexend.bold,
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 1,
  },
  finalInfo: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 202, 13, 0.05)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 202, 13, 0.1)',
    gap: 12,
    marginTop: 8,
  },
  finalInfoText: {
    flex: 1,
    fontSize: 12,
    fontFamily: Fonts.lexend.regular,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 18,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 40,
  },
  nextBtn: {
    height: 64,
    backgroundColor: '#FFCA0D',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#FFCA0D',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  nextBtnText: {
    fontSize: 16,
    fontFamily: Fonts.lexend.bold,
    color: '#0A0A0A',
  }
});
