import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronLeft, ChevronRight, User, Smartphone, Moon, Shield, FileText } from 'lucide-react-native';
import Fonts from '@/constants/fonts';

export default function SettingsScreen() {
  const router = useRouter();
  const { colors, isDark, toggleTheme } = useTheme();
  const { user } = useAuth();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <View style={[styles.header, { borderBottomColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>App Settings</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>
        <View style={styles.section}>
            <SettingsItem
                icon={<User size={20} color={colors.text} />}
                label="Edit Profile"
                colors={colors}
                isDark={isDark}
            />
            <SettingsItem
                icon={<Smartphone size={20} color={colors.text} />}
                label="Change Phone Number"
                colors={colors}
                isDark={isDark}
            />
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
        <View style={styles.section}>
            <View style={[styles.item, { backgroundColor: colors.background }]}>
                <View style={styles.itemLeft}>
                    <View style={[styles.iconBox, { backgroundColor: isDark ? '#4a4121' : '#E5E7EB' }]}>
                        <Moon size={20} color={colors.text} />
                    </View>
                    <Text style={[styles.itemLabel, { color: colors.text }]}>Dark Mode</Text>
                </View>
                <Switch
                    value={isDark}
                    onValueChange={toggleTheme}
                    trackColor={{ false: '#E5E7EB', true: colors.primary }}
                    thumbColor="#FFFFFF"
                />
            </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Privacy & Security</Text>
        <View style={styles.section}>
            <SettingsItem
                icon={<Shield size={20} color={colors.text} />}
                label="Security Settings"
                colors={colors}
                isDark={isDark}
            />
            <SettingsItem
                icon={<FileText size={20} color={colors.text} />}
                label="Privacy Policy"
                colors={colors}
                isDark={isDark}
            />
        </View>

        <View style={styles.versionSection}>
            <Text style={[styles.versionText, { color: colors.textSecondary }]}>v1.0.4</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingsItem({ icon, label, colors, isDark }: any) {
    return (
        <TouchableOpacity
            style={[styles.item, { backgroundColor: colors.background }]}
            activeOpacity={0.6}
        >
            <View style={styles.itemLeft}>
                <View style={[styles.iconBox, { backgroundColor: isDark ? '#4a4121' : '#E5E7EB' }]}>
                    {icon}
                </View>
                <Text style={[styles.itemLabel, { color: colors.text }]}>{label}</Text>
            </View>
            <ChevronRight size={22} color={isDark ? '#FFFFFF' : '#94A3B8'} />
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
    borderBottomWidth: 1,
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
  scrollContent: {
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: Fonts.lexend.bold,
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 8,
  },
  section: {
    marginTop: 4,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    minHeight: 56,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemLabel: {
    fontSize: 16,
    fontFamily: Fonts.lexend.regular,
    flex: 1,
  },
  versionSection: {
    marginTop: 'auto',
    paddingVertical: 32,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 14,
    fontFamily: Fonts.lexend.regular,
  }
});
