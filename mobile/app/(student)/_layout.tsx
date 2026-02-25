import { Redirect, Tabs } from 'expo-router';
import { Home, BarChart3, User, BookOpen, QrCode, Bell } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { Platform, View, StyleSheet } from 'react-native';
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
          backgroundColor: isDark ? '#231e0f' : '#FFFFFF',
          borderTopColor: isDark ? 'rgba(255,255,255,0.05)' : '#E2E8F0',
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 96 : 78,
          paddingBottom: Platform.OS === 'ios' ? 30 : 18,
          paddingTop: 12,
          elevation: 0,
        },
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
      <Tabs.Screen name="courses/register" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
      <Tabs.Screen name="courses/search" options={{ href: null }} />
      <Tabs.Screen name="courses/success" options={{ href: null }} />
      <Tabs.Screen name="courses/drop-confirmation" options={{ href: null }} />
      <Tabs.Screen name="courses/drop-success" options={{ href: null }} />
      <Tabs.Screen name="courses/department/[id]" options={{ href: null }} />
      <Tabs.Screen name="courses/[id]" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 6,
    elevation: 3,
  }
});
