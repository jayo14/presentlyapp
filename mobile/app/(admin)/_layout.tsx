import { Redirect, Tabs } from 'expo-router';
import { Home, Users, School, BookOpen, MoreHorizontal } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { Platform } from 'react-native';
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
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 85 : 65,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          paddingTop: 12,
          paddingHorizontal: 16,
          elevation: 0,
          shadowColor: colors.text,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: isDark ? 0.3 : 0.1,
          shadowRadius: 8,
        },
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
      <Tabs.Screen name="institutions/new" options={{ href: null }} />
      <Tabs.Screen name="institutions/[id]/index" options={{ href: null }} />
      <Tabs.Screen name="institutions/[id]/faculties" options={{ href: null }} />
      <Tabs.Screen name="institutions/[id]/departments" options={{ href: null }} />
      <Tabs.Screen name="institutions/[id]/admins" options={{ href: null }} />
      <Tabs.Screen name="institutions/[id]/analytics" options={{ href: null }} />
      <Tabs.Screen name="institutions/[id]/settings" options={{ href: null }} />
    </Tabs>
  );
}
