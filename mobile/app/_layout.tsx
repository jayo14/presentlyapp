import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, usePathname, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AttendanceProvider } from "@/contexts/AttendanceContext";
import {
  useFonts,
  Lexend_300Light,
  Lexend_400Regular,
  Lexend_500Medium,
  Lexend_600SemiBold,
  Lexend_700Bold,
} from '@expo-google-fonts/lexend';
import {
  NotoSans_400Regular,
  NotoSans_700Bold,
} from '@expo-google-fonts/noto-sans';
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const topSegment = segments[0];
    const secondSegment = segments[1];
    const inAuth = topSegment === "auth";
    const inOnboarding = topSegment === "onboarding";
    const inSplash = topSegment === "splash";
    const inProtected = ["(student)", "(lecturer)", "(admin)", "(tabs)"].includes(topSegment || "");
    const inUserOnboarding =
      inOnboarding &&
      ["role-selection", "personal-info", "school-info", "success"].includes(secondSegment || "");
    const inPreOnboarding = inOnboarding && !inUserOnboarding;

    if (!user) {
      if (inUserOnboarding) {
        router.replace("/auth/sign-up");
        return;
      }
      if (inProtected && pathname !== "/auth/sign-in") {
        router.replace("/auth/sign-in");
      }
      return;
    }

    if (!user.emailVerified) {
      if (pathname !== "/auth/verify-email") {
        router.replace("/auth/verify-email");
      }
      return;
    }

    if (!user.onboardingCompleted) {
      if (inPreOnboarding) {
        router.replace("/onboarding/role-selection");
        return;
      }
      if (!inUserOnboarding) {
        router.replace("/onboarding/role-selection");
      }
      return;
    }

    const roleRoot =
      user.role === "admin"
        ? "/(admin)"
        : user.role === "lecturer"
          ? "/(lecturer)"
          : "/(student)";

    const inWrongRoleGroup =
      (topSegment === "(admin)" && user.role !== "admin") ||
      (topSegment === "(lecturer)" && user.role !== "lecturer") ||
      (topSegment === "(student)" && user.role !== "student");

    if (inAuth || inOnboarding || inSplash || topSegment === "(tabs)" || inWrongRoleGroup) {
      if (pathname !== roleRoot) {
        router.replace(roleRoot as any);
      }
    }
  }, [isLoading, pathname, router, segments, user]);

  return <>{children}</>;
}

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="splash" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="(student)" options={{ headerShown: false }} />
      <Stack.Screen name="(lecturer)" options={{ headerShown: false }} />
      <Stack.Screen name="(admin)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Lexend_300Light,
    Lexend_400Regular,
    Lexend_500Medium,
    Lexend_600SemiBold,
    Lexend_700Bold,
    NotoSans_400Regular,
    NotoSans_700Bold,
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider>
          <AuthProvider>
            <AuthGate>
              <AttendanceProvider>
                <StatusBar style="auto" />
                <RootLayoutNav />
              </AttendanceProvider>
            </AuthGate>
          </AuthProvider>
        </ThemeProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
