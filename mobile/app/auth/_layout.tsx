import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthLayout() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (!isLoading && user && !user.emailVerified) {
    return <Redirect href="/auth/verify-email" />;
  }

  if (!isLoading && isAuthenticated && user) {
    const role = user.role ?? 'student';
    const destination =
      role === 'admin'
        ? '/(admin)'
        : role === 'lecturer'
          ? '/(lecturer)'
          : '/(student)';

    return <Redirect href={destination} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="verify-email" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="reset-password" />
    </Stack>
  );
}
