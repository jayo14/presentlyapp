// ...existing code...
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { LogOut } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { api } from '@/services/api';
import { ShieldAlert, Search, Moon, Building, Bell, Lock, Database, Download, ChevronRight, Activity, Gauge } from 'lucide-react-native';
import * as Animatable from 'react-native-animatable';
// ...existing code...

export default function MoreScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const [isGoldTheme, setIsGoldTheme] = useState(isDark);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const statsData = await api.system.getStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading settings data:', error);
    }
  };

  const handleToggleTheme = () => {
    setIsGoldTheme(!isGoldTheme);
    toggleTheme();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.primary + '1A', borderBottomWidth: 1 }]}>
        <View style={styles.headerTop}>
          <View style={styles.headerTitleContainer}>
            <ShieldAlert size={24} color={colors.primary} />
            <Text style={[styles.title, { color: colors.text }]}>System Settings</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={[styles.iconButton, { backgroundColor: colors.primary + '1A' }]}>
              <Search size={20} color={colors.primary} />
            </TouchableOpacity>
            <View style={[styles.gaAvatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.gaText}>GA</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Sign Out Button */}
                <TouchableOpacity
                  style={[styles.toolButton, { backgroundColor: colors.primary, marginBottom: 16 }]}
                  onPress={async () => {
                    await signOut();
                    router.replace('/login');
                  }}
                >
                  <LogOut size={20} color="#000" />
                  <Text style={styles.toolButtonText}>Sign Out</Text>
                </TouchableOpacity>
        {/* Profile & Theme Toggle */}
        <View style={[styles.profileCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#fff', borderColor: 'rgba(255,255,255,0.08)' }]}>
          <View style={styles.adminInfo}>
            <View style={[styles.adminAvatar, { borderColor: colors.primary + '66' }]}>
              <Image
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDGuyms_cPIHvZQR1fhwpK9AQOpwo9GEB2zmbE3F9kQB3v9Rq_csgOwaePs7IJn5yBnmCrU_UYATofciwZ7J7-K4gpuxQBdjM-onNMoeT3UU4gm4EsigCiIBmmOGS3iBM6sFUP_rCNnXHXRAj0dZytVcmxGZVxAvoZLSDbSkjyAQMOHj4c8KIcbHF0wevPwPqKGm8nlPk2V33jmvL2Ij9-5an0R4WgHTX1ZtO1hydoFX_tQ0wnV0kgbX2UTzFUGXwuskWT1f_ROEGnM' }}
                style={styles.adminImage}
              />
            </View>
            <View>
              <Text style={[styles.adminName, { color: colors.text }]}>Global Administrator</Text>
              <Text style={[styles.adminRole, { color: colors.textSecondary }]}>System Configuration & Preferences</Text>
            </View>
          </View>

          <View style={[styles.themeToggle, { backgroundColor: colors.primary + '0D', borderColor: colors.primary + '33' }]}>
            <View style={styles.themeToggleLeft}>
              <Moon size={20} color={colors.primary} />
              <Text style={[styles.themeToggleText, { color: colors.text }]}>Gold Theme (Dark Mode)</Text>
            </View>
            <Switch
              value={isGoldTheme}
              onValueChange={handleToggleTheme}
              trackColor={{ false: '#767577', true: colors.primary }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* General Configuration */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>GENERAL CONFIGURATION</Text>
          <View style={[styles.configBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#fff', borderColor: 'rgba(255,255,255,0.08)' }]}>
            <ConfigRow
              icon={<Building size={20} color={colors.primary} />}
              title="Institution Config"
              subtitle="Manage 12 linked entities"
              colors={colors}
            />
            <ConfigRow
              icon={<Bell size={20} color={colors.primary} />}
              title="Notification Alerts"
              subtitle="System wide broadcast rules"
              colors={colors}
            />
            <ConfigRow
              icon={<Lock size={20} color={colors.primary} />}
              title="Security & MFA"
              subtitle="Two-factor & session policies"
              colors={colors}
              isLast
            />
          </View>
        </View>

        {/* Infrastructure Health */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>INFRASTRUCTURE HEALTH</Text>
          <View style={styles.healthGrid}>
            <View style={[styles.healthCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#fff', borderColor: 'rgba(255,255,255,0.08)' }]}>
              <View style={styles.healthCardHeader}>
                <Text style={[styles.healthLabel, { color: colors.textSecondary }]}>API STATUS</Text>
                <Animatable.View
                  animation="pulse"
                  iterationCount="infinite"
                  style={[styles.statusPulse, { backgroundColor: '#10B981' }]}
                />
              </View>
              <Text style={[styles.healthValue, { color: colors.primary }]}>{stats?.api_uptime || '99.9%'}</Text>
              <Text style={[styles.healthSub, { color: colors.textSecondary }]}>Uptime (Last 24h)</Text>
            </View>
            <View style={[styles.healthCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#fff', borderColor: 'rgba(255,255,255,0.08)' }]}>
              <View style={styles.healthCardHeader}>
                <Text style={[styles.healthLabel, { color: colors.textSecondary }]}>LATENCY</Text>
                <Gauge size={14} color={colors.primary} />
              </View>
              <Text style={[styles.healthValue, { color: colors.primary }]}>{stats?.latency || '42ms'}</Text>
              <Text style={[styles.healthSub, { color: colors.textSecondary }]}>Global average</Text>
            </View>
          </View>
        </View>

        {/* Management Tools */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>MANAGEMENT TOOLS</Text>
          <View style={[styles.toolsCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#fff', borderColor: 'rgba(255,255,255,0.08)' }]}>
            <View style={styles.toolsHeader}>
              <View style={[styles.toolIconBox, { backgroundColor: colors.primary + '1A' }]}>
                <Database size={24} color={colors.primary} />
              </View>
              <View style={styles.toolsText}>
                <Text style={[styles.toolTitle, { color: colors.text }]}>Data Export</Text>
                <Text style={[styles.toolSubtitle, { color: colors.textSecondary }]}>Generate a comprehensive audit trail and system snapshot for compliance.</Text>
              </View>
            </View>
            <View style={styles.toolsActions}>
              <TouchableOpacity style={[styles.toolButton, { backgroundColor: colors.primary }]}>
                <Download size={18} color="#000" />
                <Text style={styles.toolButtonText}>Export CSV</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.toolButtonOutline, { borderColor: colors.primary + '66' }]}>
                <Activity size={18} color={colors.primary} />
                <Text style={[styles.toolButtonTextOutline, { color: colors.primary }]}>API Logs</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Footer Info */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary + '66' }]}>
            BUILD 4.12.0 • LAST BACKUP: 2H AGO
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ConfigRow({ icon, title, subtitle, colors, isLast }: any) {
  return (
    <TouchableOpacity style={[styles.configRow, !isLast && { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' }]}>
      <View style={styles.configRowLeft}>
        <View style={[styles.configIconBox, { backgroundColor: colors.primary + '1A' }]}>
          {icon}
        </View>
        <View>
          <Text style={[styles.configRowTitle, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.configRowSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
        </View>
      </View>
      <ChevronRight size={18} color={colors.textSecondary + '66'} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingVertical: 12 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitleContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { fontSize: 20, fontWeight: '700', letterSpacing: -0.5 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  gaAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  gaText: { color: '#000', fontWeight: '800', fontSize: 14 },
  scrollContent: { padding: 16, gap: 24, paddingBottom: 100 },
  profileCard: { padding: 16, borderRadius: 20, borderWidth: 1, gap: 24 },
  adminInfo: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  adminAvatar: { width: 64, height: 64, borderRadius: 32, borderWidth: 2, overflow: 'hidden', padding: 2 },
  adminImage: { width: '100%', height: '100%', borderRadius: 30 },
  adminName: { fontSize: 18, fontWeight: '700' },
  adminRole: { fontSize: 13, marginTop: 2 },
  themeToggle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1 },
  themeToggleLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  themeToggleText: { fontSize: 14, fontWeight: '600' },
  section: { gap: 12 },
  sectionTitle: { fontSize: 10, fontWeight: '800', letterSpacing: 1.5, paddingHorizontal: 4 },
  configBox: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  configRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  configRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  configIconBox: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  configRowTitle: { fontSize: 14, fontWeight: '600' },
  configRowSubtitle: { fontSize: 12, marginTop: 2 },
  healthGrid: { flexDirection: 'row', gap: 12 },
  healthCard: { flex: 1, padding: 16, borderRadius: 16, borderWidth: 1, gap: 12 },
  healthCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  healthLabel: { fontSize: 10, fontWeight: '800' },
  statusPulse: { width: 8, height: 8, borderRadius: 4 },
  healthValue: { fontSize: 24, fontWeight: '700' },
  healthSub: { fontSize: 10, fontWeight: '600' },
  toolsCard: { padding: 20, borderRadius: 16, borderWidth: 1, gap: 20 },
  toolsHeader: { flexDirection: 'row', gap: 16 },
  toolIconBox: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  toolsText: { flex: 1 },
  toolTitle: { fontSize: 14, fontWeight: '700' },
  toolSubtitle: { fontSize: 12, marginTop: 4, lineHeight: 18 },
  toolsActions: { flexDirection: 'row', gap: 12 },
  toolButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 44, borderRadius: 10 },
  toolButtonText: { color: '#000', fontWeight: '700', fontSize: 14 },
  toolButtonOutline: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 44, borderRadius: 10, borderWidth: 1 },
  toolButtonTextOutline: { fontWeight: '700', fontSize: 14 },
  footer: { alignItems: 'center', marginTop: 8 },
  footerText: { fontSize: 10, fontWeight: '800', letterSpacing: 2 }
});
