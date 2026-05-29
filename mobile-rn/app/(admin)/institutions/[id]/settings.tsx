import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Switch } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { api } from '@/services/api';
import { ChevronLeft, Clock, Trash2, UnfoldVertical } from 'lucide-react-native';

export default function InstitutionalSettingsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { colors, isDark } = useTheme();
  const [gpsEnabled, setGpsEnabled] = useState(true);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    loadSettings();
  }, [id]);

  const loadSettings = async () => {
    try {
      const response = await api.institutions.get(id as string);
      setSettings(response);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleUpdate = async (data: any) => {
    try {
      await api.institutions.partialUpdate(id as string, data);
      loadSettings();
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.primary + '1A', borderBottomWidth: 1 }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={24} color={colors.primary} />
          </TouchableOpacity>
          <View style={[styles.saveBadge, { backgroundColor: '#10B9811A' }]}>
            <View style={[styles.saveDot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.saveText}>Changes Auto-saved</Text>
          </View>
        </View>
        <Text style={[styles.title, { color: colors.text }]}>Institutional Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Identity Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>IDENTITY</Text>
          <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <View style={styles.identityRow}>
              <View style={[styles.logoBox, { backgroundColor: colors.primary + '1A', borderColor: colors.primary + '33' }]}>
                <Image
                  source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDaM4-QW-ZavJ9GGXTe7_WO7Po7oUSdJ1PvaiV65wIZVKeLU2HvhLb1v3jISd-N2yolh2p_hz0tJcWXmFmPL-AQot-cBv41NAqZmQLPFNa29KlRRrEpxJ9bqdKQBVZyxhsBfKwABw44-W6WiN02lNk1XynkNs5DB9APeOqgutKxHwAYepQtTrp4lsdSv2DiEQ-4hLPDEtX4azz5kuJyjBXZhap6ma5hmoAm8D2vyqqfCeU2FQpl9bCuRNNZclH3Pa0Zg9MHSdQ2ibNa' }}
                  style={styles.logoImage}
                />
              </View>
              <View style={styles.identityInfo}>
                <Text style={[styles.identityTitle, { color: colors.text }]}>Institution Logo</Text>
                <Text style={[styles.identitySubtitle, { color: colors.textSecondary }]}>Update university branding</Text>
              </View>
              <TouchableOpacity style={[styles.updateBtn, { backgroundColor: colors.primary + '1A' }]}>
                <Text style={[styles.updateBtnText, { color: colors.primary }]}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Academic Policies Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>ACADEMIC POLICIES</Text>
          <View style={[styles.cardList, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <View style={[styles.settingRow, { borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : '#f0f0f0', borderBottomWidth: 1 }]}>
              <View>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Attendance Threshold</Text>
                <Text style={[styles.settingSublabel, { color: colors.textSecondary }]}>Minimum % for credit</Text>
              </View>
              <View style={styles.inputWrapper}>
                <TextInput style={[styles.miniInput, { backgroundColor: isDark ? '#121212' : '#f9f9f9', color: colors.text }]} value="75" keyboardType="numeric" />
                <Text style={[styles.percentSign, { color: colors.textSecondary }]}>%</Text>
              </View>
            </View>
            <View style={styles.settingRow}>
              <View>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Default Session Duration</Text>
                <Text style={[styles.settingSublabel, { color: colors.textSecondary }]}>Auto-filled for new classes</Text>
              </View>
              <TouchableOpacity style={[styles.selector, { backgroundColor: isDark ? '#121212' : '#f9f9f9' }]}>
                <Text style={[styles.selectorText, { color: colors.text }]}>60 min</Text>
                <UnfoldVertical size={14} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Security & Compliance Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>SECURITY & COMPLIANCE</Text>
          <View style={[styles.cardList, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <View style={[styles.settingRow, { borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : '#f0f0f0', borderBottomWidth: 1 }]}>
              <View>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Enable GPS Enforcement</Text>
                <Text style={[styles.settingSublabel, { color: colors.textSecondary }]}>Verify check-ins on campus</Text>
              </View>
              <Switch
                value={gpsEnabled}
                onValueChange={setGpsEnabled}
                trackColor={{ false: '#333', true: colors.primary }}
                thumbColor="#fff"
              />
            </View>
            <View style={[styles.settingRow, { borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : '#f0f0f0', borderBottomWidth: 1 }]}>
              <View>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Staff Multi-factor Auth</Text>
                <Text style={[styles.settingSublabel, { color: colors.textSecondary }]}>Require MFA for admins</Text>
              </View>
              <Switch
                value={mfaEnabled}
                onValueChange={setMfaEnabled}
                trackColor={{ false: '#333', true: colors.primary }}
                thumbColor="#fff"
              />
            </View>
            <View style={styles.settingRow}>
              <View>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Automatic Logout</Text>
                <Text style={[styles.settingSublabel, { color: colors.textSecondary }]}>Session timeout period</Text>
              </View>
              <TouchableOpacity style={[styles.selector, { backgroundColor: isDark ? '#121212' : '#f9f9f9' }]}>
                <Text style={[styles.selectorText, { color: colors.text }]}>24 hrs</Text>
                <Clock size={14} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Danger Zone */}
        <TouchableOpacity style={[styles.dangerBtn, { backgroundColor: '#EF44440D', borderColor: '#EF444433' }]}>
          <Trash2 size={20} color="#EF4444" />
          <Text style={styles.dangerBtnText}>Reset Institutional Data</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, gap: 12 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  saveBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  saveDot: { width: 6, height: 6, borderRadius: 3 },
  saveText: { fontSize: 10, fontWeight: '600', color: '#10B981' },
  title: { fontSize: 28, fontWeight: '700', letterSpacing: -0.5 },
  scrollContent: { padding: 16, gap: 24, paddingBottom: 100 },
  section: { gap: 12 },
  sectionTitle: { fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginLeft: 4 },
  card: { padding: 16, borderRadius: 16, borderWidth: 1 },
  identityRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  logoBox: { width: 56, height: 56, borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  logoImage: { width: '100%', height: '100%' },
  identityInfo: { flex: 1 },
  identityTitle: { fontSize: 14, fontWeight: '600' },
  identitySubtitle: { fontSize: 12, marginTop: 2 },
  updateBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  updateBtnText: { fontSize: 12, fontWeight: '700' },
  cardList: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  settingLabel: { fontSize: 14, fontWeight: '500' },
  settingSublabel: { fontSize: 12, marginTop: 2 },
  inputWrapper: { position: 'relative', justifyContent: 'center' },
  miniInput: { width: 80, height: 40, borderRadius: 8, textAlign: 'right', paddingRight: 30, fontSize: 14, fontWeight: '700' },
  percentSign: { position: 'absolute', right: 12, fontSize: 12, fontWeight: '600' },
  selector: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  selectorText: { fontSize: 14, fontWeight: '700' },
  dangerBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 16, borderRadius: 16, borderWidth: 1, marginTop: 12 },
  dangerBtnText: { color: '#EF4444', fontSize: 14, fontWeight: '600' }
});
