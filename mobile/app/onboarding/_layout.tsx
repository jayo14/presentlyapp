import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="role-selection" />
      <Stack.Screen name="personal-info" />
      <Stack.Screen name="school-info" />
      <Stack.Screen name="success" />
    </Stack>
  );
}
