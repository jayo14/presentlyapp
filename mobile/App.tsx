import './global.css';
import * as React from 'react';
import { TouchableOpacity } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Home, BookOpen, QrCode, Clock, BarChart3, Plus, FileText, Bell, User } from 'lucide-react-native';

import SplashScreen from './screens/SplashScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import ResetPasswordScreen from './screens/ResetPasswordScreen';
import StudentDashboardScreen from './screens/StudentDashboardScreen';
import StudentCoursesScreen from './screens/StudentCoursesScreen';
import SessionsScreen from './screens/SessionsScreen';
import AnalyticsScreen from './screens/AnalyticsScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import ProfileScreen from './screens/ProfileScreen';
import LecturerSettingsScreen from './screens/LecturerSettingsScreen';
import NewAttendanceSessionScreen from './screens/NewAttendanceSessionScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// --- Tab Navigator ---
function MainTabs() {
  const navigation = useNavigation(); // Hook to access navigation object

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#18181b', // surface
          borderTopWidth: 0,
          paddingTop: 8,
          paddingBottom: 8,
          marginHorizontal: 12,
          marginBottom: 12,
          borderRadius: 24,
          height: 70,
          position: 'absolute',
          left: 12,
          right: 12,
          elevation: 0, // Remove shadow for Android
        },
        tabBarActiveTintColor: '#C1B66D', // primary
        tabBarInactiveTintColor: '#71717a', // text-muted
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginTop: -4,
        },
        tabBarItemStyle: {
          paddingTop: 6,
        },
      })}
    >
      {/* Home Tab */}
      <Tab.Screen
        name="Home"
        component={StudentDashboardScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Home size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      {/* Sessions Tab */}
      <Tab.Screen
        name="Sessions"
        component={SessionsScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Clock size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      {/* Courses Tab */}
      <Tab.Screen
        name="Courses"
        component={StudentCoursesScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <BookOpen size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      {/* Records Tab */}
      <Tab.Screen
        name="Records"
        component={AnalyticsScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <FileText size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      {/* Profile Tab */}
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <User size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Helper component for empty screens used as tab placeholders
const EmptyScreen = () => null;


// --- Root Navigator ---
export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: '#09090b',
            },
            animation: 'fade', // Use fade animation for stack transitions
          }}
        >
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          
          {/* Main App Flow - using Stack to manage tabs and other screens */}
          <Stack.Screen name="MainApp" component={MainTabs} />
          
          <Stack.Screen name="StudentCourses" component={StudentCoursesScreen} /> {/* For direct navigation */}
          
          {/* New Screens */}
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Settings" component={LecturerSettingsScreen} />
          <Stack.Screen name="NewAttendanceSession" component={NewAttendanceSessionScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}