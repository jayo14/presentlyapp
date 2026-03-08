import { Redirect, Tabs } from 'expo-router';
import { Home, BookOpen, Calendar, User, BarChart3 } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { Platform, ActivityIndicator, View, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { useAuth } from '@/contexts/AuthContext';

export default function LecturerLayout() {
  const { colors, isDark } = useTheme();
  const { user, isLoading } = useAuth();

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

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: isDark ? '#ccbf8e' : '#94A3B8',
        tabBarStyle: {
          backgroundColor: Platform.OS === 'ios' ? 'transparent' : (isDark ? 'rgba(25, 22, 12, 0.85)' : 'rgba(255, 255, 255, 0.85)'),
          borderTopWidth: 0,
          height: Platform.OS === 'ios' ? 92 : 76,
          paddingBottom: Platform.OS === 'ios' ? 32 : 12,
          paddingTop: 12,
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 24 : 16,
          left: 16,
          right: 16,
          borderRadius: 32,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 16,
          borderWidth: 1,
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
        },
        tabBarBackground: () => (
          Platform.OS === 'ios' ? (
            <BlurView intensity={95} tint={isDark ? "dark" : "light"} style={{ ...StyleSheet.absoluteFillObject, borderRadius: 32, overflow: 'hidden' }} />
          ) : (
            <View style={{ ...StyleSheet.absoluteFillObject, borderRadius: 32, backgroundColor: isDark ? 'rgba(30, 27, 20, 0.85)' : 'rgba(255, 255, 255, 0.85)' }} />
          )
        ),
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: 'Lexend_700Bold',
          marginTop: 2,
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
