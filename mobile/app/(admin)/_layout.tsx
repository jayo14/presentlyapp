import { Redirect, Tabs } from 'expo-router';
import { Home, Users, School, BookOpen, MoreHorizontal } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { Platform, View, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { useAuth } from '@/contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AdminLayout() {
  const { colors, isDark } = useTheme();
  const { user, isLoading } = useAuth();
  const insets = useSafeAreaInsets();

  if (!isLoading && user && user.role !== 'admin') {
    const destination = user.role === 'lecturer' ? '/(lecturer)' : '/(student)';
    return <Redirect href={destination} />;
  }

  // Calculate bottom position accounting for Android navigation bar
  const bottomPosition = Platform.OS === 'ios' ? 24 : Math.max(16, insets.bottom);
  const dockRadius = 36;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarActiveBackgroundColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.82)',
        tabBarStyle: {
          backgroundColor: Platform.OS === 'ios' ? 'transparent' : (isDark ? 'rgba(24, 21, 14, 0.66)' : 'rgba(255, 255, 255, 0.66)'),
          borderTopWidth: 0,
          height: Platform.OS === 'ios' ? 98 : 84,
          paddingBottom: Platform.OS === 'ios' ? 32 : 14,
          paddingTop: 8,
          position: 'absolute',
          bottom: bottomPosition,
          left: 14,
          right: 14,
          paddingHorizontal: 6,
          borderRadius: dockRadius,
          elevation: 14,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.22,
          shadowRadius: 20,
          borderWidth: 1,
          borderColor: isDark ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.78)',
          overflow: 'hidden',
        },
        tabBarBackground: () => (
          <View style={{ ...StyleSheet.absoluteFillObject, borderRadius: dockRadius, overflow: 'hidden' }}>
            <BlurView intensity={100} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFillObject} />
            <View style={[StyleSheet.absoluteFillObject, { backgroundColor: isDark ? 'rgba(34, 30, 20, 0.32)' : 'rgba(255,255,255,0.35)' }]} />
            <View style={[styles.glassHighlight, { backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.72)' }]} />
            <View style={[styles.glassDepth, { backgroundColor: isDark ? 'rgba(8, 8, 8, 0.22)' : 'rgba(148, 163, 184, 0.12)' }]} />
          </View>
        ),
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: 'Lexend_700Bold',
          marginTop: 1,
          marginBottom: 1,
          letterSpacing: 0.2,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
        tabBarItemStyle: {
          borderRadius: 20,
          marginHorizontal: 4,
          marginTop: 3,
          marginBottom: 2,
          paddingVertical: 2,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Overview',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: 'Users',
          tabBarIcon: ({ color, size }) => <Users size={size} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="institutions/index"
        options={{
          title: 'Institutions',
          tabBarIcon: ({ color, size }) => <School size={size} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="courses"
        options={{
          title: 'Courses',
          tabBarIcon: ({ color, size }) => <BookOpen size={size} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color, size }) => <MoreHorizontal size={size} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="venues" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
      <Tabs.Screen name="logs" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
      <Tabs.Screen name="courses/create" options={{ href: null }} />
      <Tabs.Screen name="institutions/new" options={{ href: null }} />
      <Tabs.Screen name="institutions/[id]/index" options={{ href: null }} />
      <Tabs.Screen name="institutions/[id]/faculties" options={{ href: null }} />
      <Tabs.Screen name="institutions/[id]/departments" options={{ href: null }} />
      <Tabs.Screen name="institutions/[id]/admins" options={{ href: null }} />
      <Tabs.Screen name="institutions/[id]/analytics" options={{ href: null }} />
      <Tabs.Screen name="institutions/[id]/settings" options={{ href: null }} />
      <Tabs.Screen name="edit-photo" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  glassHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '48%',
  },
  glassDepth: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '46%',
  },
});
