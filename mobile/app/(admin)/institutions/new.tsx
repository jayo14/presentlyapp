import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Platform } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { ChevronLeft, Camera, Edit2, Mail, CheckCircle } from 'lucide-react-native';
import { api } from '@/services/api';

export default function NewInstitutionScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    acronym: '',
    email: '',
    country: 'United States',
    state: 'California'
  });

  const handleSave = async () => {
    if (!formData.name || !formData.email) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await api.institutions.create(formData);
      router.canGoBack() ? router.back() : router.replace("/");
    } catch (error) {
      console.error('Error creating institution:', error);
      Alert.alert('Error', 'Failed to create institution');
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: isDark ? '#27272a' : '#f4f4f5', borderBottomWidth: 1 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.canGoBack() ? router.back() : router.replace("/")}>
          <ChevronLeft size={28} color={colors.primary} />
          <Text style={[styles.backText, { color: colors.primary }]}>Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>New Institution</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Logo Upload Section */}
        <View style={styles.logoSection}>
          <TouchableOpacity style={[styles.logoCircle, { backgroundColor: isDark ? '#27272a' : '#f9fafb', borderColor: colors.primary + '33' }]}>
            <Camera size={48} color={colors.primary} />
            <View style={[styles.editBadge, { backgroundColor: colors.primary, borderColor: isDark ? '#18181b' : '#fff' }]}>
              <Edit2 size={12} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={[styles.logoTitle, { color: colors.text }]}>Institution Logo</Text>
          <Text style={[styles.logoSubtitle, { color: colors.textSecondary }]}>Upload high-res PNG or JPG</Text>
        </View>

        {/* Registration Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>LEGAL INSTITUTION NAME</Text>
            <TextInput
              style={[styles.input, { backgroundColor: isDark ? '#27272a' : '#fff', borderColor: isDark ? '#3f3f46' : '#e4e4e7', color: colors.text }]}
              placeholder="e.g. Global Academy of Sciences"
              placeholderTextColor={isDark ? '#52525b' : '#d4d4d8'}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>ACRONYM</Text>
            <TextInput
              style={[styles.input, { backgroundColor: isDark ? '#27272a' : '#fff', borderColor: isDark ? '#3f3f46' : '#e4e4e7', color: colors.text }]}
              placeholder="e.g. GAS"
              placeholderTextColor={isDark ? '#52525b' : '#d4d4d8'}
              value={formData.acronym}
              onChangeText={(text) => setFormData({ ...formData, acronym: text })}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>COUNTRY</Text>
              <View style={[styles.input, { backgroundColor: isDark ? '#27272a' : '#fff', borderColor: isDark ? '#3f3f46' : '#e4e4e7', justifyContent: 'center' }]}>
                <Text style={{ color: colors.text }}>United States</Text>
              </View>
            </View>
            <View style={{ width: 16 }} />
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>STATE</Text>
              <View style={[styles.input, { backgroundColor: isDark ? '#27272a' : '#fff', borderColor: isDark ? '#3f3f46' : '#e4e4e7', justifyContent: 'center' }]}>
                <Text style={{ color: colors.text }}>California</Text>
              </View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>ADMIN CONTACT EMAIL</Text>
            <View style={[styles.inputContainer, { backgroundColor: isDark ? '#27272a' : '#fff', borderColor: isDark ? '#3f3f46' : '#e4e4e7' }]}>
              <Mail size={20} color={isDark ? '#52525b' : '#a1a1aa'} style={{ marginLeft: 12 }} />
              <TextInput
                style={[styles.flexInput, { color: colors.text }]}
                placeholder="admin@institution.edu"
                placeholderTextColor={isDark ? '#52525b' : '#d4d4d8'}
                keyboardType="email-address"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
              />
            </View>
          </View>

          <Text style={[styles.termsText, { color: isDark ? '#71717a' : '#a1a1aa' }]}>
            By registering, you agree to our <Text style={{ color: colors.primary }}>Terms of Service</Text> and <Text style={{ color: colors.primary }}>Data Protection Policy</Text> for academic institutions.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={[styles.footer, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.primary }]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>{loading ? 'Saving...' : 'Save Institution'}</Text>
          {!loading && <CheckCircle size={24} color="#fff" />}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16 },
  backButton: { flexDirection: 'row', alignItems: 'center', width: 80 },
  backText: { fontSize: 18, fontWeight: '500', marginLeft: -4 },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  scrollContent: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 120 },
  logoSection: { alignItems: 'center', marginBottom: 40 },
  logoCircle: { width: 128, height: 128, borderRadius: 64, borderWidth: 4, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  editBadge: { position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderRadius: 16, borderWidth: 4, alignItems: 'center', justifyContent: 'center' },
  logoTitle: { fontSize: 20, fontWeight: '600', marginTop: 16 },
  logoSubtitle: { fontSize: 14, marginTop: 4 },
  form: { gap: 24 },
  inputGroup: { gap: 8 },
  label: { fontSize: 10, fontWeight: '800', letterSpacing: 1, color: '#a1a1aa', marginLeft: 4 },
  input: { height: 56, borderRadius: 12, borderWidth: 1, paddingHorizontal: 16, fontSize: 16 },
  inputContainer: { height: 56, borderRadius: 12, borderWidth: 1, flexDirection: 'row', alignItems: 'center' },
  flexInput: { flex: 1, height: '100%', paddingHorizontal: 12, fontSize: 16 },
  row: { flexDirection: 'row' },
  termsText: { fontSize: 11, textAlign: 'center', lineHeight: 18, marginTop: 16, paddingHorizontal: 16 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24 },
  saveButton: { height: 64, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 8 },
  saveButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' }
});
