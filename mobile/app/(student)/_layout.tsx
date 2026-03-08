import { Redirect, Tabs } from 'expo-router';
import { Home, BarChart3, User, BookOpen, QrCode, Bell } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { Platform, View, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { useAuth } from '@/contexts/AuthContext';

export default function StudentLayout() {
  const { colors, isDark } = useTheme();
  const { user, isLoading } = useAuth();

  if (!isLoading && user && user.role !== 'student') {
    const destination = user.role === 'admin' ? '/(admin)' : '/(lecturer)';
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
          tabBarLabelStyle: {
            marginTop: 18,
            fontSize: 10,
            fontFamily: 'Lexend_700Bold',
          }
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
    width: 56,
    height: 56,
    borderRadius: 36,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -42,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 6,
    elevation: 3,
  }
});
