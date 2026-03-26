import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error: any) => {
        if (error?.response?.status >= 400 && error?.response?.status < 500) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

// Query keys for consistent cache management
export const queryKeys = {
  // Auth
  currentUser: ['currentUser'] as const,
  
  // Institutions
  institutions: ['institutions'] as const,
  institution: (id: number) => ['institutions', id] as const,
  
  // Colleges
  colleges: (institutionId?: number) => 
    institutionId ? ['colleges', { institutionId }] : ['colleges'] as const,
  college: (id: number) => ['colleges', id] as const,
  
  // Departments
  departments: (filters?: { college?: number; institution?: number }) => 
    ['departments', filters] as const,
  department: (id: number) => ['departments', id] as const,
  
  // Courses
  courses: (filters?: { department?: number; lecturer?: number }) => 
    ['courses', filters] as const,
  course: (id: number) => ['courses', id] as const,
  
  // Sessions
  sessions: (filters?: { course?: number; active?: boolean }) => 
    ['sessions', filters] as const,
  session: (id: number) => ['sessions', id] as const,
  activeSessions: ['sessions', { active: true }] as const,
  
  // Attendance
  attendances: (filters?: { session?: number; student?: string }) => 
    ['attendances', filters] as const,
  attendance: (id: number) => ['attendances', id] as const,
  myAttendances: (studentId: string) => ['attendances', { student: studentId }] as const,
  sessionAttendances: (sessionId: number) => ['attendances', { session: sessionId }] as const,
};
