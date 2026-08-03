import { Redirect, Tabs } from 'expo-router';
import { Home, BookOpen, Calendar, User, BarChart3 } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { Platform, ActivityIndicator, View, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { useAuth } from '@/contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LecturerLayout() {
  const { colors, isDark } = useTheme();
  const { user, isLoading } = useAuth();
  const insets = useSafeAreaInsets();

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: isDark ? '#231e0f' : '#FFFFFF' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Redirect to sign-in if not authenticated
  if (!user) {
    return <Redirect href="/auth/sign-in" />;
  }

  // Redirect if not a lecturer
  if (user.role !== 'lecturer') {
    const destination = user.role === 'admin' ? '/(admin)' : '/(student)';
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
        tabBarInactiveTintColor: isDark ? '#ccbf8e' : '#94A3B8',
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
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home size={22} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="sessions"
        options={{
          title: 'Sessions',
          tabBarIcon: ({ color }) => <Calendar size={22} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="courses"
        options={{
          title: 'Courses',
          tabBarIcon: ({ color }) => <BookOpen size={22} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Records',
          tabBarIcon: ({ color }) => <BarChart3 size={22} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User size={22} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen name="dashboard" options={{ href: null }} />
      <Tabs.Screen name="students" options={{ href: null }} />
      <Tabs.Screen name="venues" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
      <Tabs.Screen name="session/[id]" options={{ href: null }} />
      <Tabs.Screen name="session/attendance/[id]" options={{ href: null }} />
      <Tabs.Screen name="session/override/[id]" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
      <Tabs.Screen name="create-course" options={{ href: null }} />
      <Tabs.Screen name="courses/create-success" options={{ href: null }} />
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
