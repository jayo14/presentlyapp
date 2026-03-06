import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import {
  Settings,
  Globe,
  Lock,
  Bell,
  Database,
  Smartphone,
  ShieldCheck,
  Cpu,
  ChevronRight,
  LogOut,
  Save
} from 'lucide-react-native';
import { Button } from '@/components/Button';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminSettingsScreen() {
  const { colors, isDark } = useTheme();
  const { logout } = useAuth();

  const [config, setConfig] = useState({
    maintenanceMode: false,
    strictGps: true,
    pushNotifications: true,
    emailAlerts: true,
    apiCaching: true,
    autoAudit: true
  });

  const toggleConfig = (key: keyof typeof config) => {
    setConfig(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
        <View style={styles.headerLeft}>
          <Settings size={24} color={colors.primary} />
          <Text style={[styles.title, { color: colors.text }]}>System Settings</Text>
        </View>
        <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.primary }]}>
          <Save size={18} color="#000" />
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* General Config */}
        <Section title="GENERAL CONFIGURATION" colors={colors}>
          <SettingItem
            icon={<Globe size={20} color={colors.textSecondary} />}
            label="Maintenance Mode"
            description="Disable user access during updates"
            value={config.maintenanceMode}
            onToggle={() => toggleConfig('maintenanceMode')}
            colors={colors}
          />
          <SettingItem
            icon={<ShieldCheck size={20} color={colors.textSecondary} />}
            label="Strict GPS Verification"
            description="Reject check-ins with low accuracy"
            value={config.strictGps}
            onToggle={() => toggleConfig('strictGps')}
            colors={colors}
          />
        </Section>

        {/* Integration Settings */}
        <Section title="INTEGRATIONS & API" colors={colors}>
           <TouchableOpacity style={[styles.integrationCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f9f9f9', borderColor: colors.border }]}>
             <View style={styles.integrationInfo}>
               <Database size={20} color={colors.primary} />
               <View>
                 <Text style={[styles.integrationTitle, { color: colors.text }]}>Canvas LMS</Text>
                 <Text style={[styles.integrationStatus, { color: '#10B981' }]}>Connected</Text>
               </View>
             </View>
             <ChevronRight size={18} color={colors.textSecondary} />
           </TouchableOpacity>
           <TouchableOpacity style={[styles.integrationCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f9f9f9', borderColor: colors.border, marginTop: 12 }]}>
             <View style={styles.integrationInfo}>
               <Smartphone size={20} color={colors.textSecondary} />
               <View>
                 <Text style={[styles.integrationTitle, { color: colors.text }]}>Firebase Cloud Messaging</Text>
                 <Text style={[styles.integrationStatus, { color: colors.textSecondary }]}>Configure Keys</Text>
               </View>
             </View>
             <ChevronRight size={18} color={colors.textSecondary} />
           </TouchableOpacity>
        </Section>

        {/* Notification Preferences */}
        <Section title="NOTIFICATION PREFERENCES" colors={colors}>
          <SettingItem
            icon={<Bell size={20} color={colors.textSecondary} />}
            label="Push Notifications"
            description="System-wide broadcast alerts"
            value={config.pushNotifications}
            onToggle={() => toggleConfig('pushNotifications')}
            colors={colors}
          />
          <SettingItem
            icon={<Lock size={20} color={colors.textSecondary} />}
            label="Security Email Alerts"
            description="Notify admins on login anomalies"
            value={config.emailAlerts}
            onToggle={() => toggleConfig('emailAlerts')}
            colors={colors}
          />
        </Section>

        {/* System Health */}
        <Section title="SYSTEM PERFORMANCE" colors={colors}>
          <SettingItem
            icon={<Cpu size={20} color={colors.textSecondary} />}
            label="API Response Caching"
            description="Improve performance for static data"
            value={config.apiCaching}
            onToggle={() => toggleConfig('apiCaching')}
            colors={colors}
          />
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>API GATEWAY URL</Text>
            <View style={[styles.inputWrapper, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f0f0f0', borderColor: colors.border }]}>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                defaultValue="https://api.presently.app/v1"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </View>
        </Section>

        {/* Danger Zone */}
        <View style={styles.dangerZone}>
          <Button
            title="Log Out Admin Session"
            onPress={logout}
            variant="outline"
            style={{ borderColor: '#EF4444', borderWidth: 1 }}
            textStyle={{ color: '#EF4444' }}
          />
          <Text style={[styles.versionText, { color: colors.textSecondary }]}>Presently Admin v2.4.0 (Build 892)</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children, colors }: any) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.primary }]}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
}

function SettingItem({ icon, label, description, value, onToggle, colors }: any) {
  return (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <View style={[styles.settingIcon, { backgroundColor: colors.primary + '0D' }]}>
          {icon}
        </View>
        <View style={styles.settingInfo}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>{label}</Text>
          <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>{description}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#3f3f3f', true: colors.primary }}
        thumbColor={value ? '#000' : '#f4f3f4'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontSize: 22, fontWeight: '700', letterSpacing: -0.5 },
  saveButton: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  saveText: { fontSize: 14, fontWeight: '800' },
  scrollContent: { padding: 20, paddingBottom: 60 },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginBottom: 16 },
  sectionContent: { gap: 16 },
  settingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 },
  settingIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  settingInfo: { flex: 1 },
  settingLabel: { fontSize: 16, fontWeight: '600' },
  settingDescription: { fontSize: 12, marginTop: 2 },
  integrationCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1 },
  integrationInfo: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  integrationTitle: { fontSize: 15, fontWeight: '700' },
  integrationStatus: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  inputGroup: { marginTop: 8 },
  inputLabel: { fontSize: 10, fontWeight: '800', marginBottom: 8 },
  inputWrapper: { height: 52, borderRadius: 12, borderWidth: 1, paddingHorizontal: 16, justifyContent: 'center' },
  input: { fontSize: 14, fontWeight: '500' },
  dangerZone: { marginTop: 20, gap: 16, alignItems: 'center' },
  versionText: { fontSize: 11, fontWeight: '500' }
});