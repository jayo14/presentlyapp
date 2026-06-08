import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Platform, ActivityIndicator } from 'react-native';
import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import {
  Settings, Bell, Shield, Database,
  Smartphone, Globe, Moon, Lock,
  ChevronRight, LogOut, Trash2, Info,
  CheckCircle2, AlertTriangle, Cloud,
  Building, Activity, Download, Gauge,
  ShieldCheck, LayoutGrid, HelpCircle,
  FileText
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import Fonts from '@/constants/fonts';
import * as Animatable from 'react-native-animatable';

export default function AdminMoreScreen() {
  const { colors, isDark } = useTheme();
  const { signOut, user } = useAuth();
  const router = useRouter();

  const [isGoldTheme, setIsGoldTheme] = useState(isDark);

  const handleToggleTheme = () => {
    setIsGoldTheme(!isGoldTheme);
    // In a real app, this would trigger a theme context change
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerTitleContainer}>
            <LayoutGrid size={24} color={colors.primary} />
            <Text style={[styles.title, { color: colors.text }]}>Admin Console</Text>
          </View>
          <TouchableOpacity
            style={[styles.gaAvatar, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/(admin)/profile')}
          >
            <Text style={styles.gaText}>{user?.fullName?.[0] || 'A'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Profile Snapshot */}
        <View style={[styles.profileCard, { backgroundColor: isDark ? '#352e18' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#E2E8F0' }]}>
          <View style={styles.adminInfo}>
            <View style={[styles.adminAvatar, { borderColor: colors.primary }]}>
                <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary + '22' }]}>
                    <ShieldCheck size={32} color={colors.primary} />
                </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.adminName, { color: colors.text }]}>{user?.fullName || 'System Administrator'}</Text>
              <Text style={[styles.adminRole, { color: colors.textSecondary }]}>Global Access • {user?.email || 'admin@getpresently.com.ng'}</Text>
            </View>
          </View>

          <View style={[styles.themeToggle, { backgroundColor: colors.primary + '0D', borderColor: colors.primary + '33' }]}>
            <View style={styles.themeToggleLeft}>
              <Moon size={20} color={colors.primary} />
              <Text style={[styles.themeToggleText, { color: colors.text }]}>Premium Dark Theme</Text>
            </View>
            <Switch
              value={isGoldTheme}
              onValueChange={handleToggleTheme}
              trackColor={{ false: '#767577', true: colors.primary }}
              thumbColor={Platform.OS === 'ios' ? undefined : '#fff'}
            />
          </View>
        </View>

        {/* System Management */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>SYSTEM MANAGEMENT</Text>
          <View style={[styles.configBox, { backgroundColor: colors.cardBg, borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#E2E8F0' }]}>
            <ConfigRow
            <ConfigRow
              icon={<BookOpen size={20} color="#8B5CF6" />}
              title="University Blog"
              subtitle="Read latest news & updates"
              onPress={() => router.push("/blog")}
              colors={colors}
            />
              icon={<Building size={20} color="#3B82F6" />}
              title="Institution Hierarchy"
              subtitle="Colleges, faculties & departments"
              onPress={() => router.push('/(admin)/institutions')}
              colors={colors}
            />
            <ConfigRow
              icon={<Activity size={20} color="#10B981" />}
              title="System Audit Logs"
              subtitle="Security & access history"
              onPress={() => router.push('/(admin)/logs')}
              colors={colors}
            />
            <ConfigRow
              icon={<Smartphone size={20} color="#F59E0B" />}
              title="App Configuration"
              subtitle="Global settings & preferences"
              onPress={() => router.push('/(admin)/settings')}
              colors={colors}
              isLast
            />
          </View>
        </View>

        {/* Infrastructure Health */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>INFRASTRUCTURE HEALTH</Text>
          <View style={styles.healthGrid}>
            <View style={[styles.healthCard, { backgroundColor: colors.cardBg, borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#E2E8F0' }]}>
              <View style={styles.healthCardHeader}>
                <Text style={[styles.healthLabel, { color: colors.textSecondary }]}>API STATUS</Text>
                <Animatable.View
                  animation="pulse"
                  iterationCount="infinite"
                  style={[styles.statusPulse, { backgroundColor: '#10B981' }]}
                />
              </View>
              <Text style={[styles.healthValue, { color: colors.text }]}>99.9%</Text>
              <Text style={[styles.healthSub, { color: colors.textSecondary }]}>Uptime (Last 24h)</Text>
            </View>
            <View style={[styles.healthCard, { backgroundColor: colors.cardBg, borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#E2E8F0' }]}>
              <View style={styles.healthCardHeader}>
                <Text style={[styles.healthLabel, { color: colors.textSecondary }]}>LATENCY</Text>
                <Gauge size={14} color={colors.primary} />
              </View>
              <Text style={[styles.healthValue, { color: colors.text }]}>42ms</Text>
              <Text style={[styles.healthSub, { color: colors.textSecondary }]}>Global average</Text>
            </View>
          </View>
        </View>

        {/* Support & Legal */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>SUPPORT & LEGAL</Text>
          <View style={[styles.configBox, { backgroundColor: colors.cardBg, borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#E2E8F0' }]}>
            <ConfigRow
              icon={<HelpCircle size={20} color="#8B5CF6" />}
              title="Help & Documentation"
              subtitle="Admin guides & tutorials"
              colors={colors}
            />
            <ConfigRow
              icon={<FileText size={20} color="#64748B" />}
              title="Privacy & Terms"
              subtitle="Data processing agreements"
              colors={colors}
              isLast
            />
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity
            style={[styles.logoutBtn, { borderColor: '#EF444433' }]}
            onPress={signOut}
        >
            <LogOut size={20} color="#EF4444" />
            <Text style={styles.logoutText}>Secure Logout</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            PRESENTLY ADMIN v1.0.42 • STABLE BUILD
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function ConfigRow({ icon, title, subtitle, colors, isLast, onPress }: any) {
  return (
    <TouchableOpacity
        style={[styles.configRow, !isLast && { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' }]}
        onPress={onPress}
        activeOpacity={0.7}
    >
      <View style={styles.configRowLeft}>
        <View style={[styles.configIconBox, { backgroundColor: colors.primary + '1A' }]}>
          {icon}
        </View>
        <View>
          <Text style={[styles.configRowTitle, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.configRowSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
        </View>
      </View>
      <ChevronRight size={18} color={colors.textSecondary} opacity={0.3} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 24, paddingVertical: 16 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitleContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontSize: 24, fontFamily: Fonts.lexend.bold, letterSpacing: -0.5 },
  gaAvatar: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  gaText: { color: '#000', fontFamily: Fonts.lexend.bold, fontSize: 16 },
  scrollContent: { padding: 20, gap: 24, paddingBottom: 160 },
  profileCard: { padding: 20, borderRadius: 24, borderWidth: 1, gap: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 12, elevation: 2 },
  adminInfo: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  adminAvatar: { width: 64, height: 64, borderRadius: 22, borderWidth: 2, overflow: 'hidden', padding: 3 },
  avatarPlaceholder: { width: '100%', height: '100%', borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  adminName: { fontSize: 18, fontFamily: Fonts.lexend.bold },
  adminRole: { fontSize: 12, fontFamily: Fonts.lexend.regular, marginTop: 2 },
  themeToggle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderRadius: 16, borderWidth: 1 },
  themeToggleLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  themeToggleText: { fontSize: 14, fontFamily: Fonts.lexend.medium },
  section: { gap: 12 },
  sectionTitle: { fontSize: 10, fontFamily: Fonts.lexend.bold, letterSpacing: 1.5, paddingHorizontal: 4 },
  configBox: { borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
  configRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  configRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  configIconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  configRowTitle: { fontSize: 15, fontFamily: Fonts.lexend.bold },
  configRowSubtitle: { fontSize: 12, fontFamily: Fonts.lexend.regular, marginTop: 2, opacity: 0.7 },
  healthGrid: { flexDirection: 'row', gap: 12 },
  healthCard: { flex: 1, padding: 16, borderRadius: 20, borderWidth: 1, gap: 12 },
  healthCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  healthLabel: { fontSize: 10, fontFamily: Fonts.lexend.bold },
  statusPulse: { width: 8, height: 8, borderRadius: 4 },
  healthValue: { fontSize: 28, fontFamily: Fonts.lexend.bold },
  healthSub: { fontSize: 10, fontFamily: Fonts.lexend.medium, opacity: 0.6 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 18, borderRadius: 20, borderWidth: 1, borderStyle: 'dashed' },
  logoutText: { fontSize: 16, fontFamily: Fonts.lexend.bold, color: '#EF4444' },
  footer: { alignItems: 'center', marginTop: 12 },
  footerText: { fontSize: 10, fontFamily: Fonts.lexend.bold, letterSpacing: 2, opacity: 0.3 }
});
