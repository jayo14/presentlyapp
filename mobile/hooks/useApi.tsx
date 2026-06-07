import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';

// Auth hooks
export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      api.auth.login(email, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: (data: {
      fullName: string;
      email: string;
      password: string;
      role?: 'student' | 'lecturer';
      matricNumber?: string;
      department?: string;
      level?: string;
    }) => api.auth.register(data),
  });
};

// User hooks
export const useUsers = (params?: { role?: string; page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => api.users.list(params),
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => api.users.get(id),
    enabled: !!id,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => api.users.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.users.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.id] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => api.users.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

// Course hooks
export const useCourses = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['courses', params],
    queryFn: () => api.courses.list(params),
  });
};

export const useMyCourses = () => {
  return useQuery({
    queryKey: ['courses', 'my-courses'],
    queryFn: () => api.courses.getMyCourses(),
  });
};

export const useCourse = (id: string) => {
  return useQuery({
    queryKey: ['course', id],
    queryFn: () => api.courses.get(id),
    enabled: !!id,
  });
};

export const useCreateCourse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => api.courses.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
};

export const useRegisterCourse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (courseId: string) => api.enrollments.enroll(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['courses', 'my-courses'] });
    },
  });
};

export const useUnregisterCourse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (enrollmentId: string) => api.enrollments.drop(enrollmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['courses', 'my-courses'] });
    },
  });
};

export const useDeleteCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.courses.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
};

export const useEnrollments = () => {
  return useQuery({
    queryKey: ['enrollments'],
    queryFn: () => api.enrollments.list(),
  });
};

export const useEnrollment = (id: string) => {
  return useQuery({
    queryKey: ['enrollment', id],
    queryFn: () => api.enrollments.get(id),
    enabled: !!id,
  });
};

export const useCreateEnrollment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => api.enrollments.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
};

export const useUpdateEnrollment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.enrollments.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['enrollment', variables.id] });
    },
  });
};

export const useDeleteEnrollment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.enrollments.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
    },
  });
};

// Session hooks
export const useSessions = (params?: { status?: string; courseId?: string }) => {
  return useQuery({
    queryKey: ['sessions', params],
    queryFn: () => api.sessions.list(params),
  });
};

export const useActiveSessions = () => {
  return useQuery({
    queryKey: ['sessions', 'active'],
    queryFn: () => api.sessions.getActive(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useUpcomingSessions = () => {
  return useQuery({
    queryKey: ['sessions', 'upcoming'],
    queryFn: () => api.sessions.getUpcoming(),
  });
};

export const useSession = (id: string) => {
  return useQuery({
    queryKey: ['session', id],
    queryFn: () => api.sessions.get(id),
    enabled: !!id,
  });
};

export const useCreateSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => api.sessions.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
};

export const useUpdateSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.sessions.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['session', variables.id] });
    },
  });
};

export const useDeleteSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => api.sessions.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
};

export const useEndSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => api.sessions.end(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['session', id] });
    },
  });
};

// Attendance hooks
export const useMarkAttendance = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      sessionId: string;
      method: 'qr' | 'gps' | 'code';
      location?: { latitude: number; longitude: number };
      qrData?: string;
      sessionCode?: string;
    }) => api.attendance.mark(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-stats'] });
    },
  });
};

export const useAttendanceHistory = (params?: { 
  startDate?: string; 
  endDate?: string; 
  courseId?: string;
}) => {
  return useQuery({
    queryKey: ['attendance', 'history', params],
    queryFn: () => api.attendance.getHistory(params),
  });
};

export const useAttendanceStats = () => {
  return useQuery({
    queryKey: ['attendance-stats'],
    queryFn: () => api.attendance.getStats(),
  });
};

export const useSessionAttendance = (sessionId: string) => {
  return useQuery({
    queryKey: ['attendance', 'session', sessionId],
    queryFn: () => api.attendance.getSessionAttendance(sessionId),
    enabled: !!sessionId,
  });
};

export const useCourseAttendance = (courseId: string) => {
  return useQuery({
    queryKey: ['attendance', 'course', courseId],
    queryFn: () => api.attendance.getCourseAttendance(courseId),
    enabled: !!courseId,
  });
};

// Venue hooks
export const useVenues = () => {
  return useQuery({
    queryKey: ['venues'],
    queryFn: () => api.venues.list(),
  });
};

export const useVenue = (id: string) => {
  return useQuery({
    queryKey: ['venue', id],
    queryFn: () => api.venues.get(id),
    enabled: !!id,
  });
};

export const useCreateVenue = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => api.venues.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues'] });
    },
  });
};

export const useUpdateVenue = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.venues.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['venues'] });
      queryClient.invalidateQueries({ queryKey: ['venue', variables.id] });
    },
  });
};

export const useDeleteVenue = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => api.venues.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues'] });
    },
  });
};

// Institution hooks
export const useInstitutions = () => {
  return useQuery({
    queryKey: ['institutions'],
    queryFn: () => api.institutions.list(),
  });
};

export const useInstitution = (id: string) => {
  return useQuery({
    queryKey: ['institution', id],
    queryFn: () => api.institutions.get(id),
    enabled: !!id,
  });
};

export const useCreateInstitution = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => api.institutions.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institutions'] });
    },
  });
};

export const useUpdateInstitution = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.institutions.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['institutions'] });
      queryClient.invalidateQueries({ queryKey: ['institution', variables.id] });
    },
  });
};

export const useDeleteInstitution = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => api.institutions.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institutions'] });
    },
  });
};

// College hooks
export const useColleges = () => {
  return useQuery({
    queryKey: ['colleges'],
    queryFn: () => api.colleges.list(),
  });
};

export const useCollege = (id: string) => {
  return useQuery({
    queryKey: ['college', id],
    queryFn: () => api.colleges.get(id),
    enabled: !!id,
  });
};

export const useCreateCollege = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => api.colleges.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['colleges'] });
    },
  });
};

export const useUpdateCollege = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.colleges.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['colleges'] });
      queryClient.invalidateQueries({ queryKey: ['college', variables.id] });
    },
  });
};

export const useDeleteCollege = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.colleges.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['colleges'] });
    },
  });
};

// Department hooks
export const useDepartments = () => {
  return useQuery({
    queryKey: ['departments'],
    queryFn: () => api.departments.list(),
  });
};

export const useDepartment = (id: string) => {
  return useQuery({
    queryKey: ['department', id],
    queryFn: () => api.departments.get(id),
    enabled: !!id,
  });
};

export const useCreateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => api.departments.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });
};

export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.departments.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['department', variables.id] });
    },
  });
};

export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.departments.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });
};

// Student hooks
export const useStudents = (params?: { page?: number; limit?: number; courseId?: string }) => {
  return useQuery({
    queryKey: ['students', params],
    queryFn: () => api.students.list(params),
  });
};

export const useStudent = (id: string) => {
  return useQuery({
    queryKey: ['student', id],
    queryFn: () => api.students.get(id),
    enabled: !!id,
  });
};

export const useStudentsByCourse = (courseId: string) => {
  return useQuery({
    queryKey: ['students', 'course', courseId],
    queryFn: () => api.students.getByCourse(courseId),
    enabled: !!courseId,
  });
};
