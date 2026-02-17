import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { ChevronLeft, QrCode, Search, Terminal, Palette, Cpu, ChevronRight, Check, X, ArrowRight } from 'lucide-react-native';
import Fonts from '@/constants/fonts';

export default function RegisterCourseScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const [courseCode, setCourseCode] = useState('');
  const [showSuccess, setShowSuccess] = useState(true);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
          >
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Register New Course</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Success Alert */}
          {showSuccess && (
              <View style={[styles.successAlert, { backgroundColor: isDark ? '#122e18' : '#F0FDF4', borderColor: isDark ? '#14532d' : '#BBF7D0' }]}>
                  <View style={[styles.successIcon, { backgroundColor: '#22C55E' }]}>
                      <Check size={14} color="#FFFFFF" strokeWidth={4} />
                  </View>
                  <View style={styles.successTextContainer}>
                      <Text style={[styles.successTitle, { color: isDark ? '#4ade80' : '#166534' }]}>Course Added Successfully</Text>
                      <Text style={[styles.successSubtitle, { color: isDark ? '#22c55e' : '#15803d' }]}>Basic Statistics (STAT201) has been added to your schedule.</Text>
                  </View>
                  <TouchableOpacity onPress={() => setShowSuccess(false)}>
                      <X size={18} color={isDark ? '#22c55e' : '#166534'} />
                  </TouchableOpacity>
              </View>
          )}

          {/* Add via Code */}
          <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Add via Code</Text>
              <Text style={[styles.sectionDesc, { color: colors.textSecondary }]}>Enter the unique 6-digit code provided by your course instructor.</Text>

              <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>Course Code</Text>
                  <View style={styles.inputWrapper}>
                      <TextInput
                        style={[styles.input, { backgroundColor: isDark ? colors.cardBg : '#FFFFFF', borderColor: isDark ? '#352e18' : colors.border, color: colors.text }]}
                        placeholder="e.g. CS101"
                        placeholderTextColor={isDark ? '#6a5d2f' : '#CBD5E1'}
                        value={courseCode}
                        onChangeText={setCourseCode}
                        autoCapitalize="characters"
                      />
                      <TouchableOpacity style={styles.qrIcon}>
                          <QrCode size={24} color={isDark ? '#ccbf8e' : colors.textSecondary} />
                      </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={[styles.registerBtn, { backgroundColor: colors.primary }]}
                    activeOpacity={0.8}
                  >
                      <Text style={styles.registerBtnText}>Register Course</Text>
                      <ArrowRight size={20} color="#231f10" strokeWidth={2.5} />
                  </TouchableOpacity>
              </View>
          </View>

          {/* Divider */}
          <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0' }]} />
              <Text style={[styles.dividerText, { color: colors.textSecondary }]}>OR BROWSE</Text>
              <View style={[styles.dividerLine, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0' }]} />
          </View>

          {/* Browse Department */}
          <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Browse Department</Text>
              <Text style={[styles.sectionDesc, { color: colors.textSecondary }]}>Find open electives and major courses.</Text>

              <View style={[styles.searchBar, { backgroundColor: isDark ? '#1e1a0d' : '#F1F5F9' }]}>
                  <Search size={20} color={colors.textSecondary} />
                  <TextInput
                    style={[styles.searchText, { color: colors.text }]}
                    placeholder="Search for departments..."
                    placeholderTextColor={colors.textSecondary}
                  />
              </View>

              <View style={styles.departmentList}>
                  <DepartmentItem
                    icon={<Terminal size={24} color="#2563EB" />}
                    bg="#EFF6FF"
                    darkBg="rgba(37, 99, 235, 0.1)"
                    name="Computer Science"
                    info="CS • 12 Courses Open"
                    colors={colors}
                    isDark={isDark}
                  />
                  <DepartmentItem
                    icon={<Palette size={24} color="#9333EA" />}
                    bg="#FAF5FF"
                    darkBg="rgba(147, 51, 234, 0.1)"
                    name="Arts & Design"
                    info="AD • 8 Courses Open"
                    colors={colors}
                    isDark={isDark}
                  />
                  <DepartmentItem
                    icon={<Cpu size={24} color="#EA580C" />}
                    bg="#FFF7ED"
                    darkBg="rgba(234, 88, 12, 0.1)"
                    name="Engineering"
                    info="ENG • 15 Courses Open"
                    colors={colors}
                    isDark={isDark}
                  />
              </View>
          </View>
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function DepartmentItem({ icon, name, info, bg, darkBg, colors, isDark }: any) {
    return (
        <TouchableOpacity
            style={[styles.deptItem, { backgroundColor: isDark ? '#2c2614' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9' }]}
            activeOpacity={0.7}
        >
            <View style={styles.deptLeft}>
                <View style={[styles.deptIcon, { backgroundColor: isDark ? darkBg : bg }]}>
                    {icon}
                </View>
                <View>
                    <Text style={[styles.deptName, { color: colors.text }]}>{name}</Text>
                    <Text style={[styles.deptInfo, { color: colors.textSecondary }]}>{info}</Text>
                </View>
            </View>
            <ChevronRight size={20} color={isDark ? '#4a4121' : '#CBD5E1'} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: Fonts.lexend.bold,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  successAlert: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 32,
    alignItems: 'flex-start',
    gap: 12,
  },
  successIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  successTextContainer: {
    flex: 1,
  },
  successTitle: {
    fontSize: 14,
    fontFamily: Fonts.lexend.bold,
  },
  successSubtitle: {
    fontSize: 12,
    fontFamily: Fonts.lexend.regular,
    marginTop: 2,
    lineHeight: 18,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: Fonts.lexend.bold,
    marginBottom: 8,
  },
  sectionDesc: {
    fontSize: 15,
    fontFamily: Fonts.lexend.regular,
    lineHeight: 22,
    marginBottom: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontFamily: Fonts.lexend.bold,
    marginLeft: 4,
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    height: 64,
    borderRadius: 16,
    borderWidth: 2,
    paddingHorizontal: 20,
    fontSize: 20,
    fontFamily: Fonts.lexend.bold,
  },
  qrIcon: {
    position: 'absolute',
    right: 20,
  },
  registerBtn: {
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
    shadowColor: '#f9c406',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  registerBtnText: {
    fontSize: 16,
    fontFamily: Fonts.lexend.bold,
    color: '#231f10',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 10,
    fontFamily: Fonts.lexend.bold,
    letterSpacing: 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 12,
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
  },
  searchText: {
    flex: 1,
    fontSize: 15,
    fontFamily: Fonts.lexend.regular,
  },
  departmentList: {
    gap: 12,
  },
  deptItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  deptLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  deptIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deptName: {
    fontSize: 16,
    fontFamily: Fonts.lexend.bold,
  },
  deptInfo: {
    fontSize: 12,
    fontFamily: Fonts.lexend.medium,
    marginTop: 2,
  }
});
