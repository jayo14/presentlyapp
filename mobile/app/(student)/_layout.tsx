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
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} strokeWidth={2.2} />,
        }}
      />
      <Tabs.Screen
        name="courses"
        options={{
          title: 'Courses',
          tabBarIcon: ({ color, size }) => <BookOpen size={size} color={color} strokeWidth={2.2} />,
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
                borderColor: isDark ? '#231e0f' : '#FFFFFF',
                shadowColor: colors.primary,
              }
            ]}>
              <QrCode size={24} color="#231e0f" strokeWidth={2.5} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color, size }) => <BarChart3 size={size} color={color} strokeWidth={2.2} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} strokeWidth={2.2} />,
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
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 10,
  },
});
