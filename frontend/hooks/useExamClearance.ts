import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/api/client';

// Types
interface ExamClearance {
  id: number;
  student: {
    id: string;
    full_name: string;
    matric_number: string;
  };
  course: {
    id: number;
    code: string;
    title: string;
  };
  total_sessions: number;
  attended_sessions: number;
  attendance_percentage: number;
  status: 'PENDING' | 'CLEARED' | 'NOT_CLEARED' | 'UNDER_REVIEW';
  is_cleared: boolean;
  minimum_attendance_required: number;
  clearance_date?: string;
  remarks?: string;
}

// Queries
export const useExamClearances = (filters?: {
  student_id?: string;
  course_id?: number;
  status?: string;
}) => {
  return useQuery({
    queryKey: ['exam-clearances', filters],
    queryFn: async () => {
      const response = await apiClient.get('/exam-clearance/', { params: filters });
      return response.data as ExamClearance[];
    },
  });
};

export const useExamClearance = (clearanceId: number) => {
  return useQuery({
    queryKey: ['exam-clearances', clearanceId],
    queryFn: async () => {
      const response = await apiClient.get(`/exam-clearance/${clearanceId}/`);
      return response.data as ExamClearance;
    },
    enabled: !!clearanceId,
  });
};

export const useStudentClearances = (studentId: string) => {
  return useQuery({
    queryKey: ['exam-clearances', 'student', studentId],
    queryFn: async () => {
      const response = await apiClient.get(`/exam-clearance/student/${studentId}/`);
      return response.data as ExamClearance[];
    },
    enabled: !!studentId,
  });
};

export const useCourseClearances = (courseId: number) => {
  return useQuery({
    queryKey: ['exam-clearances', 'course', courseId],
    queryFn: async () => {
      const response = await apiClient.get(`/exam-clearance/course/${courseId}/`);
      return response.data as ExamClearance[];
    },
    enabled: !!courseId,
  });
};

export const useClearanceReport = (filters?: any) => {
  return useQuery({
    queryKey: ['exam-clearances', 'report', filters],
    queryFn: async () => {
      const response = await apiClient.get('/exam-clearance/report/', { params: filters });
      return response.data;
    },
  });
};

// Mutations
export const useCalculateClearance = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (clearanceId: number) => {
      const response = await apiClient.post(`/exam-clearance/${clearanceId}/calculate/`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-clearances'] });
    },
  });
};

export const useApproveClearance = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { clearanceId: number; remarks?: string }) => {
      const response = await apiClient.post(
        `/exam-clearance/${data.clearanceId}/approve/`,
        { remarks: data.remarks }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-clearances'] });
    },
  });
};

export const useRejectClearance = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { clearanceId: number; remarks: string }) => {
      const response = await apiClient.post(
        `/exam-clearance/${data.clearanceId}/reject/`,
        { remarks: data.remarks }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-clearances'] });
    },
  });
};

export const useCalculateAllClearances = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params?: { course_id?: number; semester?: string }) => {
      const response = await apiClient.post('/exam-clearance/calculate-all/', params);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-clearances'] });
    },
  });
};

export const useGenerateClearances = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: {
      course_id?: number;
      semester: string;
      academic_year: string;
    }) => {
      const response = await apiClient.post('/exam-clearance/generate/', params);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-clearances'] });
    },
  });
};

export const useGenerateClearanceCertificate = () => {
  return useMutation({
    mutationFn: async (clearanceId: number) => {
      const response = await apiClient.get(`/exam-clearance/${clearanceId}/certificate/`, {
        responseType: 'blob',
      });
      return response.data;
    },
  });
};

// Helper function to download certificate
export const downloadClearanceCertificate = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || 'exam-clearance-certificate.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
