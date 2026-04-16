import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, FlatList, KeyboardAvoidingView, Platform, Modal, ActivityIndicator, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { ChevronLeft, Search, Check, ChevronDown, ArrowRight, CheckCircle2 } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import Fonts from '@/constants/fonts';

type InstitutionOption = {
  id: string;
  name: string;
};

type CollegeOption = {
  id: string;
  name: string;
  institution?: string | number;
  institution_id?: string | number;
};

type DepartmentOption = {
  id: string;
  name: string;
  college?: string | number;
  college_id?: string | number;
};

const asArray = (payload: any): any[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.data?.results)) return payload.data.results;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export default function SchoolInfoScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { user, isLoading, onboarding, checkAuth } = useAuth();
  
  const [selectedSchool, setSelectedSchool] = useState<InstitutionOption | null>(null);
  const [selectedCollege, setSelectedCollege] = useState<CollegeOption | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [idNumber, setIdNumber] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [dataLoading, setDataLoading] = useState<boolean>(false);

  const [showSchoolPicker, setShowSchoolPicker] = useState<boolean>(false);
  const [showCollegePicker, setShowCollegePicker] = useState<boolean>(false);
  const [showDepartmentPicker, setShowDepartmentPicker] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [schools, setSchools] = useState<InstitutionOption[]>([]);
  const [colleges, setColleges] = useState<CollegeOption[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);

  const filteredSchools = schools.filter(school =>
    school.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/auth/sign-up');
      return;
    }
  }, [isLoading, router, user]);

  useEffect(() => {
    if (user) {
      loadInstitutions();
    }
  }, [user]);

  const loadInstitutions = async () => {
    try {
      setDataLoading(true);
      const response: any = await api.institutions.list();
      const rows = asArray(response);
      setSchools(
        rows.map((item: any) => ({
          id: String(item.id),
          name: item.name || item.institution_name || 'Unnamed Institution',
        }))
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to load institutions');
    } finally {
      setDataLoading(false);
    }
  };

  const loadColleges = async (institutionId: string) => {
    try {
      setDataLoading(true);
      const response: any = await api.colleges.list({ institution: institutionId });
      const rows = asArray(response);
      const filteredRows = rows.filter((item: any) => {
        const linkedInstitution = String(item.institution_id ?? item.institution ?? '');
        return !linkedInstitution || linkedInstitution === institutionId;
      });
      setColleges(
        filteredRows.map((item: any) => ({
          id: String(item.id),
          name: item.name || item.college_name || 'Unnamed College',
          institution: item.institution,
          institution_id: item.institution_id,
        }))
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to load faculties/colleges');
    } finally {
      setDataLoading(false);
    }
  };

  const loadDepartments = async (collegeId: string) => {
    try {
      setDataLoading(true);
      const response: any = await api.departments.list({ college: collegeId });
      const rows = asArray(response);
      const filteredRows = rows.filter((item: any) => {
        const linkedCollege = String(item.college_id ?? item.college ?? '');
        return !linkedCollege || linkedCollege === collegeId;
      });
      setDepartments(
        filteredRows.map((item: any) => ({
          id: String(item.id),
          name: item.name || item.department_name || 'Unnamed Department',
          college: item.college,
          college_id: item.college_id,
        }))
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to load departments');
    } finally {
      setDataLoading(false);
    }
  };

  const isVerified = idNumber.trim().length >= 8;

  const handleComplete = async () => {
    if (!user || !selectedSchool || !selectedCollege || !selectedDepartment || !idNumber) return;

    setLoading(true);
    try {
      const onboardingData = {
        institution: selectedSchool.name,
        college: selectedCollege.name,
        department: selectedDepartment,
        matric_number: user.role === 'lecturer' ? '' : idNumber,
        staff_id: user.role === 'lecturer' ? idNumber : '',
        role: user.role,
        phone_number: user.phoneNumber || '',
        onboarding_complete: true,
      };

      const result = await onboarding(onboardingData);

      if (result.success) {
        await checkAuth();
        router.replace('/onboarding/success');
      } else {
        Alert.alert('Error', result.error || 'Failed to save onboarding data');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred during onboarding');
    } finally {
      setLoading(false);
    }
  };

  const isFormComplete = selectedSchool && selectedCollege && selectedDepartment && idNumber.length >= 8 && isVerified;

  const isLecturer = user?.role === 'lecturer';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <View style={styles.headerBar}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backButton, { backgroundColor: isDark ? colors.cardBg : '#FFFFFF' }]}
            activeOpacity={0.7}
          >
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.stepText, { color: colors.textSecondary }]}>Step 3 of 4</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { backgroundColor: colors.primary, width: '75%' }]} />
            <View style={[styles.progressBarBackground, { backgroundColor: colors.primary + '33' }]} />
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.titleSection}>
            <Text style={[styles.title, { color: colors.text }]}>Academic Profile</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {isLecturer
                ? 'Tell us where you teach to personalize your dashboard.'
                : 'Provide your academic details to join your classes.'}
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>INSTITUTION</Text>
              <TouchableOpacity
                style={[styles.picker, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.1)' : colors.border }]}
                onPress={() => setShowSchoolPicker(true)}
                activeOpacity={0.7}
              >
                <Text style={[styles.pickerText, { color: selectedSchool ? colors.text : colors.textSecondary }]}>
                  {selectedSchool?.name || 'Select institution'}
                </Text>
                <ChevronDown size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>FACULTY / COLLEGE</Text>
              <TouchableOpacity
                style={[styles.picker, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.1)' : colors.border }]}
                onPress={() => selectedSchool ? setShowCollegePicker(true) : null}
                activeOpacity={0.7}
                disabled={!selectedSchool}
              >
                <Text style={[styles.pickerText, { color: selectedCollege ? colors.text : colors.textSecondary }]}>
                  {selectedCollege?.name || 'Select faculty/college'}
                </Text>
                <ChevronDown size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>DEPARTMENT</Text>
              <TouchableOpacity
                style={[styles.picker, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.1)' : colors.border }]}
                onPress={() => selectedCollege ? setShowDepartmentPicker(true) : null}
                activeOpacity={0.7}
                disabled={!selectedCollege}
              >
                <Text style={[styles.pickerText, { color: selectedDepartment ? colors.text : colors.textSecondary }]}>
                  {selectedDepartment || 'Select department'}
                </Text>
                <ChevronDown size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                {isLecturer ? 'STAFF ID NUMBER' : 'MATRIC NUMBER'}
              </Text>
              <View style={styles.idInputWrapper}>
                <TextInput
                  style={[styles.idInput, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF', borderColor: isVerified ? colors.primary : (isDark ? 'rgba(255,255,255,0.1)' : colors.border), color: colors.text }]}
                  placeholder={isLecturer ? "e.g. STF-12345" : "e.g. 240303010090"}
                  placeholderTextColor={isDark ? '#6a5d2f' : '#CBD5E1'}
                  value={idNumber}
                  onChangeText={setIdNumber}
                  autoCapitalize="characters"
                />
                <View style={styles.idStatusContainer}>
                  {isVerified && (
                    <View style={styles.verifiedBadge}>
                        <Text style={[styles.verifiedText, { color: colors.primary }]}>VERIFIED</Text>
                        <CheckCircle2 size={16} color={colors.primary} />
                    </View>
                  )}
                </View>
              </View>
              <Text style={[styles.helperText, { color: colors.textSecondary }]}>
                Enter a valid ID (minimum 8 characters)
              </Text>
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.finishButton, { backgroundColor: colors.primary }]}
            onPress={handleComplete}
            activeOpacity={0.8}
            disabled={!isFormComplete || loading}
          >
            <Text style={[styles.finishButtonText, { color: '#231f10' }]}>Finish Setup</Text>
            <ArrowRight size={20} color="#231f10" strokeWidth={3} />
          </TouchableOpacity>
          <View style={[styles.homeIndicator, { backgroundColor: isDark ? '#FFFFFF33' : '#00000033' }]} />
        </View>
      </KeyboardAvoidingView>

      {/* Institution Picker Modal */}
      <Modal visible={showSchoolPicker} transparent animationType="slide">
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Select Institution</Text>
              <TouchableOpacity onPress={() => setShowSchoolPicker(false)}>
                <Text style={[styles.modalDone, { color: colors.primary }]}>Done</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.searchBar, { backgroundColor: isDark ? '#1e1a0d' : '#F1F5F9' }]}>
              <Search size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.searchText, { color: colors.text }]}
                placeholder="Search institutions..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <FlatList
              data={filteredSchools}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={
                dataLoading
                  ? <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 16 }} />
                  : <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No institutions found</Text>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.listItem, selectedSchool?.id === item.id && { backgroundColor: colors.primary + '1A' }]}
                    onPress={() => {
                      setSelectedSchool(item);
                      setSelectedCollege(null);
                      setColleges([]);
                      setDepartments([]);
                      setSelectedDepartment('');
                      setShowSchoolPicker(false);
                      setSearchQuery('');
                      loadColleges(item.id);
                    }}
                >
                  <Text style={[styles.listItemText, { color: colors.text }]}>{item.name}</Text>
                  {selectedSchool?.id === item.id && <Check size={20} color={colors.primary} />}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* College Picker Modal */}
      <Modal visible={showCollegePicker} transparent animationType="slide">
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Select Faculty / College</Text>
              <TouchableOpacity onPress={() => setShowCollegePicker(false)}>
                <Text style={[styles.modalDone, { color: colors.primary }]}>Done</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={colleges}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={
                dataLoading
                  ? <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 16 }} />
                  : <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No faculties/colleges found</Text>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.listItem, selectedCollege?.id === item.id && { backgroundColor: colors.primary + '1A' }]}
                  onPress={() => {
                    setSelectedCollege(item);
                    setSelectedDepartment('');
                    setShowCollegePicker(false);
                    loadDepartments(item.id);
                  }}
                >
                  <Text style={[styles.listItemText, { color: colors.text }]}>{item.name}</Text>
                  {selectedCollege?.id === item.id && <Check size={20} color={colors.primary} />}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Department Picker Modal */}
      <Modal visible={showDepartmentPicker} transparent animationType="slide">
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Select Department</Text>
              <TouchableOpacity onPress={() => setShowDepartmentPicker(false)}>
                <Text style={[styles.modalDone, { color: colors.primary }]}>Done</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={departments}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={
                dataLoading
                  ? <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 16 }} />
                  : <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No departments found</Text>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.listItem, selectedDepartment === item.name && { backgroundColor: colors.primary + '1A' }]}
                  onPress={() => {
                    setSelectedDepartment(item.name);
                    setShowDepartmentPicker(false);
                  }}
                >
                  <Text style={[styles.listItemText, { color: colors.text }]}>{item.name}</Text>
                  {selectedDepartment === item.name && <Check size={20} color={colors.primary} />}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      <View style={[styles.glowTop, { backgroundColor: colors.primary + '10' }]} />
    </SafeAreaView>
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
    paddingHorizontal: 24,
    paddingTop: 8,
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    fontSize: 14,
    fontFamily: Fonts.lexend.medium,
  },
  progressContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  progressBarContainer: {
    height: 6,
    width: '100%',
    borderRadius: 3,
    overflow: 'hidden',
    position: 'relative',
  },
  progressBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: 6,
    borderRadius: 3,
    zIndex: 1,
  },
  progressBarBackground: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: 6,
    width: '100%',
    borderRadius: 3,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  titleSection: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontFamily: Fonts.lexend.bold,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: Fonts.lexend.regular,
    lineHeight: 24,
  },
  form: {
    gap: 32,
  },
  inputGroup: {
    gap: 10,
  },
  label: {
    fontSize: 11,
    fontFamily: Fonts.lexend.bold,
    letterSpacing: 0.5,
    marginLeft: 4,
  },
  picker: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  pickerText: {
    fontSize: 15,
    fontFamily: Fonts.lexend.medium,
    flex: 1,
  },
  idInputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  idInput: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingRight: 100,
    fontSize: 15,
    fontFamily: Fonts.lexend.bold,
  },
  idStatusContainer: {
    position: 'absolute',
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    fontSize: 10,
    fontFamily: Fonts.lexend.bold,
    letterSpacing: -0.5,
  },
  helperText: {
    fontSize: 11,
    fontFamily: Fonts.lexend.regular,
    marginLeft: 4,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 12,
    paddingTop: 16,
  },
  finishButton: {
    width: '100%',
    height: 64,
    borderRadius: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#f9c815',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  finishButtonText: {
    fontSize: 18,
    fontFamily: Fonts.lexend.bold,
  },
  homeIndicator: {
    width: 120,
    height: 5,
    borderRadius: 2.5,
    alignSelf: 'center',
    marginTop: 24,
    marginBottom: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '80%',
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: Fonts.lexend.bold,
  },
  modalDone: {
    fontSize: 16,
    fontFamily: Fonts.lexend.bold,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 20,
    height: 52,
    borderRadius: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  searchText: {
    flex: 1,
    fontSize: 15,
    fontFamily: Fonts.lexend.regular,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 18,
  },
  listItemText: {
    fontSize: 16,
    fontFamily: Fonts.lexend.medium,
    flex: 1,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: Fonts.lexend.medium,
    textAlign: 'center',
    marginTop: 16,
  },
  glowTop: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 300,
    height: 300,
    borderRadius: 150,
    // @ts-ignore
    filter: 'blur(100px)',
    zIndex: -1,
  }
});
