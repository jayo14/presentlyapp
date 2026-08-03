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

  const bottomPosition = Platform.OS === 'ios' ? 20 : Math.max(12, insets.bottom);
  const dockRadius = 28;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: isDark ? '#9e9474' : '#94A3B8',
        tabBarStyle: {
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          height: Platform.OS === 'ios' ? 88 : 76,
          paddingBottom: Platform.OS === 'ios' ? 26 : 12,
          paddingTop: 8,
          position: 'absolute',
          bottom: bottomPosition,
          left: 12,
          right: 12,
          paddingHorizontal: 8,
          borderRadius: dockRadius,
          elevation: 6,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.12,
          shadowRadius: 14,
          borderWidth: 1,
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
          overflow: 'hidden',
        },
        tabBarBackground: () => (
          <View style={{ ...StyleSheet.absoluteFillObject, borderRadius: dockRadius, overflow: 'hidden' }}>
            <BlurView intensity={85} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFillObject} />
            <View style={[StyleSheet.absoluteFillObject, { backgroundColor: isDark ? 'rgba(35, 30, 15, 0.78)' : 'rgba(255,255,255,0.82)' }]} />
          </View>
        ),
        tabBarLabelStyle: {
          fontSize: 9,
          fontFamily: 'Lexend_500Medium',
          marginTop: 2,
          marginBottom: 2,
          letterSpacing: 0.3,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
        tabBarItemStyle: {
          borderRadius: 16,
          marginHorizontal: 2,
          paddingVertical: 4,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Overview',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} strokeWidth={2.2} />,
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: 'Users',
          tabBarIcon: ({ color, size }) => <Users size={size} color={color} strokeWidth={2.2} />,
        }}
      />
      <Tabs.Screen
        name="institutions/index"
        options={{
          title: 'Institutions',
          tabBarIcon: ({ color, size }) => <School size={size} color={color} strokeWidth={2.2} />,
        }}
      />
      <Tabs.Screen
        name="courses/index"
        options={{
          title: 'Courses',
          tabBarIcon: ({ color, size }) => <BookOpen size={size} color={color} strokeWidth={2.2} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color, size }) => <MoreHorizontal size={size} color={color} strokeWidth={2.2} />,
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
