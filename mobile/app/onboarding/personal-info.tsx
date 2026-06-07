import { View, Text, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Image, Modal, FlatList } from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { ChevronLeft, Plus, ArrowRight, ChevronDown, Check } from 'lucide-react-native';
import { Input } from '@/components/Input';
import { useAuth } from '@/contexts/AuthContext';
import { storage } from '@/utils/storage';
import Fonts from '@/constants/fonts';

const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'];
const COUNTRIES = ['United States', 'United Kingdom', 'Canada', 'Australia', 'Nigeria', 'Germany', 'France'];
const STATES: Record<string, string[]> = {
  'United States': ['New York', 'California', 'Texas', 'Florida'],
  'Nigeria': ['Lagos', 'Abuja', 'Kano', 'Rivers'],
  'United Kingdom': ['London', 'Manchester', 'Birmingham'],
  'Canada': ['Ontario', 'Quebec', 'British Columbia'],
};

export default function PersonalInfoScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { user, isLoading } = useAuth();

  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [country, setCountry] = useState<string>('');
  const [state, setState] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ phoneNumber?: string }>({});

  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showStatePicker, setShowStatePicker] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/auth/sign-up');
    }
  }, [isLoading, router, user]);

  const validateForm = (): boolean => {
    const newErrors: { phoneNumber?: string } = {};

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\+?[\d\s-()]{7,}$/.test(phoneNumber)) {
      newErrors.phoneNumber = 'Invalid phone number format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = async () => {
    if (!validateForm() || !user) return;

    setLoading(true);
    const updatedUser = {
      ...user,
      phoneNumber,
      gender,
      country,
      state
    };
    await storage.setUser(updatedUser);
    setLoading(false);

    router.push('/onboarding/school-info');
  };

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
          <Text style={[styles.stepText, { color: colors.textSecondary }]}>Step 2 of 4</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { backgroundColor: colors.primary, width: '50%' }]} />
            <View style={[styles.progressBarBackground, { backgroundColor: colors.primary + '33' }]} />
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.titleSection}>
            <Text style={[styles.title, { color: colors.text }]}>Personal Info</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Help us customize your experience by providing a few more details.
            </Text>
          </View>

          <View style={styles.avatarSection}>
            <View style={[styles.avatarBorder, { borderColor: colors.primary + '66' }]}>
              <View style={[styles.avatarContainer, { backgroundColor: isDark ? colors.cardBg : '#FFFFFF' }]}>
                <Image
                  source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCb1eKfu-webFwjY0bTXYx8AQIXlQS1CjzC-egov9i3U-qHRmSeMk3U4ic0u5zhgOz6EZWHyJLpXvLf4hya-low0fHuH_ifWg4jTPQCOPuyvaUkX-3EweZpFBhmzfa1hhPxKdFVY9xwV3dC9YmLBSBX0mrESrhtSx0ifvXZhX2IxibbmIsVsg1UvSHLkMWvpi97rriSq3NDDqJN0lu2srg4aGcXWMJBu0ENImvXsAEKLVtuA2QW4Ze-KGmUkSHdRjWQKBnQUC3luKS1' }}
                  style={styles.avatarImage}
                />
              </View>
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: colors.primary, borderColor: colors.background }]}
                activeOpacity={0.8}
              >
                <Plus size={20} color="#FFFFFF" strokeWidth={3} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.uploadLabel, { color: colors.textSecondary }]}>UPLOAD PHOTO</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>PHONE NUMBER</Text>
              <View style={styles.phoneInputContainer}>
                <TouchableOpacity
                  style={[styles.countryPicker, { backgroundColor: isDark ? colors.cardBg : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.1)' : colors.border }]}
                >
                  <Text style={styles.countryFlag}>🇳🇬</Text>
                  <ChevronDown size={16} color={colors.textSecondary} />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                  <Input
                    placeholder="+234 800 000 0000"
                    value={phoneNumber}
                    onChangeText={(text) => {
                      setPhoneNumber(text);
                      if (errors.phoneNumber) {
                        setErrors({ ...errors, phoneNumber: undefined });
                      }
                    }}
                    keyboardType="phone-pad"
                    error={errors.phoneNumber}
                    containerStyle={styles.noMargin}
                  />
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>GENDER</Text>
              <TouchableOpacity
                style={[styles.dropdown, { backgroundColor: isDark ? colors.cardBg : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.1)' : colors.border }]}
                activeOpacity={0.7}
                onPress={() => setShowGenderPicker(true)}
              >
                <Text style={[styles.dropdownText, !gender && { color: colors.textSecondary }, { color: gender ? colors.text : colors.textSecondary }]}>
                  {gender || 'Select gender'}
                </Text>
                <ChevronDown size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>COUNTRY</Text>
              <TouchableOpacity
                style={[styles.dropdown, { backgroundColor: isDark ? colors.cardBg : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.1)' : colors.border }]}
                activeOpacity={0.7}
                onPress={() => setShowCountryPicker(true)}
              >
                <Text style={[styles.dropdownText, !country && { color: colors.textSecondary }, { color: country ? colors.text : colors.textSecondary }]}>
                  {country || 'Select country'}
                </Text>
                <ChevronDown size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>STATE / PROVINCE</Text>
              <TouchableOpacity
                style={[styles.dropdown, { backgroundColor: isDark ? colors.cardBg : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.1)' : colors.border }]}
                activeOpacity={0.7}
                onPress={() => country ? setShowStatePicker(true) : null}
                disabled={!country}
              >
                <Text style={[styles.dropdownText, !state && { color: colors.textSecondary }, { color: state ? colors.text : colors.textSecondary }]}>
                  {state || 'Select state'}
                </Text>
                <ChevronDown size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ height: 40 }} />
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.continueButton, { backgroundColor: colors.primary }]}
            onPress={handleContinue}
            activeOpacity={0.8}
            disabled={loading}
          >
            <Text style={[styles.continueButtonText, { color: '#231f10' }]}>Continue</Text>
            <ArrowRight size={20} color="#231f10" strokeWidth={3} />
          </TouchableOpacity>
          <View style={[styles.homeIndicator, { backgroundColor: isDark ? '#FFFFFF33' : '#00000033' }]} />
        </View>

        {/* Gender Picker Modal */}
        <Modal visible={showGenderPicker} transparent animationType="slide">
          <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
            <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Select Gender</Text>
                <TouchableOpacity onPress={() => setShowGenderPicker(false)}>
                  <Text style={[styles.modalDone, { color: colors.primary }]}>Done</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={GENDERS}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.listItem, gender === item && { backgroundColor: colors.primary + '1A' }]}
                    onPress={() => {
                      setGender(item);
                      setShowGenderPicker(false);
                    }}
                  >
                    <Text style={[styles.listItemText, { color: colors.text }]}>{item}</Text>
                    {gender === item && <Check size={20} color={colors.primary} />}
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>

        {/* Country Picker Modal */}
        <Modal visible={showCountryPicker} transparent animationType="slide">
          <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
            <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Select Country</Text>
                <TouchableOpacity onPress={() => setShowCountryPicker(false)}>
                  <Text style={[styles.modalDone, { color: colors.primary }]}>Done</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={COUNTRIES}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.listItem, country === item && { backgroundColor: colors.primary + '1A' }]}
                    onPress={() => {
                      setCountry(item);
                      setState('');
                      setShowCountryPicker(false);
                    }}
                  >
                    <Text style={[styles.listItemText, { color: colors.text }]}>{item}</Text>
                    {country === item && <Check size={20} color={colors.primary} />}
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>

        {/* State Picker Modal */}
        <Modal visible={showStatePicker} transparent animationType="slide">
          <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
            <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Select State</Text>
                <TouchableOpacity onPress={() => setShowStatePicker(false)}>
                  <Text style={[styles.modalDone, { color: colors.primary }]}>Done</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={STATES[country] || []}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.listItem, state === item && { backgroundColor: colors.primary + '1A' }]}
                    onPress={() => {
                      setState(item);
                      setShowStatePicker(false);
                    }}
                  >
                    <Text style={[styles.listItemText, { color: colors.text }]}>{item}</Text>
                    {state === item && <Check size={20} color={colors.primary} />}
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>

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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: Fonts.lexend.regular,
    lineHeight: 24,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  avatarBorder: {
    width: 132,
    height: 132,
    borderRadius: 66,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    padding: 2,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  addButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  uploadLabel: {
    marginTop: 16,
    fontSize: 12,
    fontFamily: Fonts.lexend.bold,
    letterSpacing: 1.5,
  },
  form: {
    gap: 28,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontFamily: Fonts.lexend.bold,
    letterSpacing: 1,
    marginLeft: 4,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  countryPicker: {
    width: 80,
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  countryFlag: {
    fontSize: 20,
  },
  noMargin: {
    marginBottom: 0,
  },
  dropdown: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  dropdownText: {
    fontSize: 16,
    fontFamily: Fonts.lexend.regular,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 12,
    paddingTop: 16,
  },
  continueButton: {
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
  continueButtonText: {
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
    height: '60%',
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
