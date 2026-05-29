# API Integration Guide

This document provides examples of how to use the API service and React Query hooks in the Presently mobile app.

## Environment Configuration

Configure the API endpoint using environment variables:

```env
# .env
EXPO_PUBLIC_API_BASE_URL=https://presently.koyeb.com
EXPO_PUBLIC_API_TIMEOUT=30000
EXPO_PUBLIC_USE_MOCK_DATA=false
```

## Font Usage

Use the Outfit font globally:

```typescript
import Fonts from '@/constants/fonts';

const styles = StyleSheet.create({
  title: {
    fontFamily: Fonts.bold,
    fontSize: 24,
  },
  body: {
    fontFamily: Fonts.regular,
    fontSize: 16,
  },
});
```

Available font weights:
- Fonts.light - Outfit_300Light
- Fonts.regular - Outfit_400Regular
- Fonts.medium - Outfit_500Medium
- Fonts.semiBold - Outfit_600SemiBold
- Fonts.bold - Outfit_700Bold

## API Service Usage

```typescript
import { api } from '@/services/api';

// Auth
await api.auth.login('email@example.com', 'password');
await api.auth.register({ fullName, email, password, role: 'student' });

// Courses
const courses = await api.courses.list();
await api.courses.register('course-id');

// Sessions
const activeSessions = await api.sessions.getActive();

// Attendance
await api.attendance.mark({ sessionId, method: 'qr' });
const stats = await api.attendance.getStats();
```

## React Query Hooks

```typescript
import { useCourses, useMarkAttendance } from '@/hooks/useApi';

function MyComponent() {
  const { data: courses, isLoading } = useCourses();
  const markAttendance = useMarkAttendance();
  
  const handleMark = async () => {
    await markAttendance.mutateAsync({ sessionId, method: 'qr' });
  };
}
```

## Context Usage

### Auth Context
```typescript
import { useAuth } from '@/contexts/AuthContext';

const { signIn, user, isAuthenticated } = useAuth();
await signIn('email@example.com', 'password');
```

### Theme Context
```typescript
import { useTheme } from '@/contexts/ThemeContext';

const { colors, toggleTheme, isDark } = useTheme();
```

### Attendance Context
```typescript
import { useAttendance } from '@/contexts/AttendanceContext';

const { sessions, stats, markAttendance } = useAttendance();
```

## Offline Mode

The app supports offline mode with automatic fallback to mock data when the API is unavailable.
