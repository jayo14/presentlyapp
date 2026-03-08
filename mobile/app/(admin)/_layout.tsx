import { Redirect, Tabs } from 'expo-router';
import { Home, Users, School, BookOpen, MoreHorizontal } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { Platform, View, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminLayout() {
  const { colors, isDark } = useTheme();
  const { user, isLoading } = useAuth();

  if (!isLoading && user && user.role !== 'admin') {
    const destination = user.role === 'lecturer' ? '/(lecturer)' : '/(student)';
    return <Redirect href={destination} />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
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
          fontSize: 11,
          fontWeight: '700',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
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
