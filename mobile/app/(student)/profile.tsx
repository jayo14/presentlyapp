import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Hash, Building2, GraduationCap, LogOut, Phone, School, Settings, ChevronRight, User, ShieldCheck, Camera } from 'lucide-react-native';
import { useState } from 'react';
import { CustomModal } from '@/components/CustomModal';
import Fonts from '@/constants/fonts';

export default function ProfileScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { user, signOut } = useAuth();
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  const confirmSignOut = async () => {
    setShowSignOutModal(false);
    await signOut();
    router.replace('/auth/sign-in');
  };

  const initials = user?.fullName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase() || 'ST';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <CustomModal
        visible={showSignOutModal}
        title="Sign Out"
        message="Are you sure you want to sign out?"
        type="confirmation"
        onConfirm={confirmSignOut}
        onCancel={() => setShowSignOutModal(false)}
        confirmText="Sign Out"
      />

      <View style={styles.headerBar}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
        <TouchableOpacity
          onPress={() => router.push('/(student)/settings')}
          style={[styles.iconBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9' }]}
          activeOpacity={0.7}
        >
          <Settings size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={styles.profileSection}>
            <View style={[styles.profileCard, { backgroundColor: isDark ? '#2d2714' : '#FFFFFF', borderColor: isDark ? '#6a5d2f' : '#E5E7EB' }]}>
                <TouchableOpacity
                  style={[styles.avatarWrap, { borderColor: colors.primary }]}
                  onPress={() => router.push('/(student)/edit-photo')}
                  activeOpacity={0.8}
                >
                    <Image
                        source={{ uri: user?.profilePicture || "https://lh3.googleusercontent.com/aida-public/AB6AXuCb1eKfu-webFwjY0bTXYx8AQIXlQS1CjzC-egov9i3U-qHRmSeMk3U4ic0u5zhgOz6EZWHyJLpXvLf4hya-low0fHuH_ifWg4jTPQCOPuyvaUkX-3EweZpFBhmzfa1hhPxKdFVY9xwV3dC9YmLBSBX0mrESrhtSx0ifvXZhX2IxibbmIsVsg1UvSHLkMWvpi97rriSq3NDDqJN0lu2srg4aGcXWMJBu0ENImvXsAEKLVtuA2QW4Ze-KGmUkSHdRjWQKBnQUC3luKS1" }}
                        style={styles.avatar}
                    />
                    <View style={[styles.editPhotoBadge, { backgroundColor: colors.primary }]}>
                        <Camera size={14} color="#000" />
                    </View>
                </TouchableOpacity>
                <View style={styles.profileInfo}>
                    <Text style={[styles.nameText, { color: colors.text }]}>{user?.fullName}</Text>
                    <View style={styles.roleBadge}>
                        <Text style={[styles.roleText, { color: colors.primary }]}>{user?.role?.toUpperCase() || 'STUDENT'}</Text>
                    </View>
                </View>

                <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9' }]} />

                <View style={styles.quickStats}>
                    <View style={styles.quickStatItem}>
                        <Text style={[styles.statVal, { color: colors.text }]}>12</Text>
                        <Text style={[styles.statLab, { color: colors.textSecondary }]}>Courses</Text>
                    </View>
                    <View style={[styles.statDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9' }]} />
                    <View style={styles.quickStatItem}>
                        <Text style={[styles.statVal, { color: colors.text }]}>85%</Text>
                        <Text style={[styles.statLab, { color: colors.textSecondary }]}>Attendance</Text>
                    </View>
                </View>
            </View>
        </View>

        {/* Info Groups */}
        <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>ACADEMIC IDENTITY</Text>
            <View style={[styles.infoList, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9' }]}>
                <InfoItem icon={<School size={20} color={colors.primary} />} label="Institution" value={user?.school || 'University of Oxford'} colors={colors} />
                <InfoItem icon={<Building2 size={20} color={colors.primary} />} label="Faculty" value={user?.college || 'Engineering'} colors={colors} />
                <InfoItem icon={<GraduationCap size={20} color={colors.primary} />} label="Department" value={user?.department || 'Computer Science'} colors={colors} />
                <InfoItem icon={<Hash size={20} color={colors.primary} />} label="Matric Number" value={user?.matricNumber || '240303010090'} colors={colors} isLast />
            </View>
        </View>

        <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>CONTACT DETAILS</Text>
            <View style={[styles.infoList, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9' }]}>
                <InfoItem icon={<Mail size={20} color={colors.primary} />} label="Email" value={user?.email || 'alex@university.edu'} colors={colors} />
                <InfoItem icon={<Phone size={20} color={colors.primary} />} label="Phone" value={user?.phoneNumber || '+234 800 000 0000'} colors={colors} isLast />
            </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.signOutBtn, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#FEF2F2' }]}
            onPress={() => setShowSignOutModal(true)}
            activeOpacity={0.7}
          >
            <LogOut size={20} color="#EF4444" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.versionText, { color: colors.textSecondary }]}>Presently Premium v1.0.4</Text>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoItem({ icon, label, value, colors, isLast }: any) {
    return (
        <View style={[styles.infoItem, !isLast && { borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' }]}>
            <View style={[styles.infoIconWrap, { backgroundColor: colors.primary + '1A' }]}>
                {icon}
            </View>
            <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{label}</Text>
                <Text style={[styles.infoValue, { color: colors.text }]} numberOfLines={1}>{value}</Text>
            </View>
            <ChevronRight size={16} color={colors.textSecondary} opacity={0.5} />
        </View>
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
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: Fonts.lexend.bold,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 160,
  },
  profileSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  profileCard: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  avatarWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    padding: 3,
    marginBottom: 16,
    position: 'relative',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  editPhotoBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  nameText: {
    fontSize: 22,
    fontFamily: Fonts.lexend.bold,
    marginBottom: 6,
  },
  roleBadge: {
    backgroundColor: 'rgba(249, 196, 6, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 100,
  },
  roleText: {
    fontSize: 10,
    fontFamily: Fonts.lexend.bold,
    letterSpacing: 1,
  },
  divider: {
    width: '100%',
    height: 1,
    marginBottom: 20,
  },
  quickStats: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  quickStatItem: {
    alignItems: 'center',
  },
  statVal: {
    fontSize: 18,
    fontFamily: Fonts.lexend.bold,
  },
  statLab: {
    fontSize: 12,
    fontFamily: Fonts.lexend.medium,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: Fonts.lexend.bold,
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  infoList: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  infoIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 10,
    fontFamily: Fonts.lexend.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontFamily: Fonts.lexend.medium,
  },
  signOutBtn: {
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  signOutText: {
    fontSize: 16,
    fontFamily: Fonts.lexend.bold,
    color: '#EF4444',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    fontFamily: Fonts.lexend.regular,
  }
});
