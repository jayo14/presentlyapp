import { Redirect, Tabs } from 'expo-router';
import { Home, BarChart3, User, BookOpen, QrCode } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { Platform, View, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { useAuth } from '@/contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function StudentLayout() {
  const { colors, isDark } = useTheme();
  const { user, isLoading } = useAuth();
  const insets = useSafeAreaInsets();

  if (!isLoading && user && user.role !== 'student') {
    const destination = user.role === 'admin' ? '/(admin)' : '/(lecturer)';
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
          tabBarIcon: ({ color, size }) => <Home size={22} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="courses"
        options={{
          title: 'Courses',
          tabBarIcon: ({ color, size }) => <BookOpen size={22} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="mark-attendance"
        options={{
          title: 'Mark',
          tabBarLabel: () => null,
          tabBarIcon: ({ color, focused }) => (
            <View style={[
              styles.fabContainer,
              {
                backgroundColor: colors.primary,
                borderColor: isDark ? colors.background : '#FFFFFF'
              }
            ]}>
              <QrCode size={28} color="#231e0f" strokeWidth={2.5} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color, size }) => <BarChart3 size={22} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={22} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen name="dashboard" options={{ href: null }} />
      <Tabs.Screen name="sessions" options={{ href: null }} />
      <Tabs.Screen name="history" options={{ href: null }} />
      <Tabs.Screen name="attendance-success" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
      <Tabs.Screen name="timetable" options={{ href: null }} />
      <Tabs.Screen name="exam-clearance" options={{ href: null }} />
      <Tabs.Screen name="courses/register" options={{ href: null }} />
      <Tabs.Screen name="courses/search" options={{ href: null }} />
      <Tabs.Screen name="courses/success" options={{ href: null }} />
      <Tabs.Screen name="courses/drop-confirmation" options={{ href: null }} />
      <Tabs.Screen name="courses/drop-success" options={{ href: null }} />
      <Tabs.Screen name="courses/department/[id]" options={{ href: null }} />
      <Tabs.Screen name="courses/[id]" options={{ href: null }} />
      <Tabs.Screen name="edit-photo" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 3.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 12,
    elevation: 8,
  },
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
