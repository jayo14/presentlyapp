import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronLeft, Share2, Settings, Bell, HelpCircle, LogOut, ChevronRight, Camera } from 'lucide-react-native';
import { useState } from 'react';
import { CustomModal } from '@/components/CustomModal';
import Fonts from '@/constants/fonts';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

export default function LecturerProfileScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { user, signOut } = useAuth();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const bottomDockOffset = tabBarHeight + insets.bottom;
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  const confirmSignOut = async () => {
    setShowSignOutModal(false);
    await signOut();
    router.replace('/auth/sign-in');
  };

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

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace("/")} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
        <TouchableOpacity style={styles.shareButton}>
          <Share2 size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomDockOffset + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
            <TouchableOpacity
              style={[styles.avatarContainer, { borderColor: colors.primary + '33' }]}
              onPress={() => router.push('/(lecturer)/edit-photo')}
              activeOpacity={0.8}
            >
                <Image
                source={{ uri: user?.profilePicture || "https://lh3.googleusercontent.com/aida-public/AB6AXuArYVEE3JQ7abCyj84g5FZspghkA41SrRaPQ7yjLcPLAs35Tx23959JDeeGF4RJPsarjkaUB4Xr27ApgEIb8ygs7Bn02p_ReRH2oRCAQjLZgZ9qTqFGMZphgtq0toT7GeIDjs9gLSrIUU4PXmrusKrZR6us9L2itoMp_EXhQVblnNBYdRWwsadjtLI_Txq4aiykNPV5kv1bla9U4QZyyF2QmDFnvZXxAR4H_UqKyMVyvpo-XnTRGRB9iVTz9uzrh8hIZ9fSytIk3u0h" }}
                style={styles.avatar}
                />
                <View style={[styles.editPhotoBadge, { backgroundColor: colors.primary }]}>
                  <Camera size={13} color="#000" />
                </View>
            </TouchableOpacity>
            <Text style={[styles.userName, { color: colors.text }]}>{user?.fullName || 'Dr. Sarah Smith'}</Text>
            <Text style={[styles.userTitle, { color: isDark ? '#ccbf8e' : '#666666' }]}>
                Senior Lecturer - Computer Science
            </Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
            <View style={[styles.statBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF', borderColor: isDark ? '#6a5d2f' : '#E2E8F0' }]}>
                <Text style={[styles.statValue, { color: colors.text }]}>6</Text>
                <Text style={[styles.statLabel, { color: isDark ? '#ccbf8e' : '#666666' }]}>Active Courses</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF', borderColor: isDark ? '#6a5d2f' : '#E2E8F0' }]}>
                <Text style={[styles.statValue, { color: colors.text }]}>124</Text>
                <Text style={[styles.statLabel, { color: isDark ? '#ccbf8e' : '#666666' }]}>Total Sessions</Text>
            </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
            <Text style={[styles.sectionHeader, { color: colors.text }]}>Account</Text>
            <View style={styles.menuContainer}>
                <MenuItem
                    icon={<Settings size={20} color={colors.primary} />}
                    label="Settings"
                    colors={colors}
                    isDark={isDark}
                    onPress={() => router.push('/(lecturer)/settings')}
                />
                <MenuItem
                    icon={<Bell size={20} color={colors.primary} />}
                    label="Notifications"
                    colors={colors}
                    isDark={isDark}
                    onPress={() => router.push('/(lecturer)/notifications')}
                />
                <MenuItem
                    icon={<HelpCircle size={20} color={colors.primary} />}
                    label="Help & Support"
                    colors={colors}
                    isDark={isDark}
                />
            </View>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <TouchableOpacity
            style={[styles.logoutBtn, { backgroundColor: isDark ? '#231e0f' : '#F1F5F9' }]}
            onPress={() => setShowSignOutModal(true)}
            activeOpacity={0.7}
          >
            <LogOut size={20} color="#EF4444" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: bottomDockOffset + 12 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuItem({ icon, label, colors, isDark, onPress }: any) {
    return (
        <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: 'transparent' }]}
            onPress={onPress}
            activeOpacity={0.6}
        >
            <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconWrap, { backgroundColor: colors.primary + '1A' }]}>
                    {icon}
                </View>
                <Text style={[styles.menuLabel, { color: colors.text }]}>{label}</Text>
            </View>
            <ChevronRight size={20} color={isDark ? '#ccbf8e' : '#94A3B8'} />
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
  shareButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 160,
  },
  profileHeader: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  avatarContainer: {
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 4,
    padding: 4,
    marginBottom: 16,
    position: 'relative',
  },
  editPhotoBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  userName: {
    fontSize: 22,
    fontFamily: Fonts.lexend.bold,
    marginBottom: 6,
  },
  userTitle: {
    fontSize: 15,
    fontFamily: Fonts.lexend.regular,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 40,
  },
  statBox: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontFamily: Fonts.lexend.bold,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    fontFamily: Fonts.lexend.regular,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  sectionHeader: {
    fontSize: 18,
    fontFamily: Fonts.lexend.bold,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  menuContainer: {
    gap: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    height: 64,
    borderRadius: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  menuIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    fontSize: 16,
    fontFamily: Fonts.lexend.regular,
  },
  logoutSection: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  logoutBtn: {
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  logoutText: {
    fontSize: 16,
    fontFamily: Fonts.lexend.bold,
    color: '#EF4444',
  }
});
