import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/api/client';

// Types
interface Report {
  id: number;
  title: string;
  report_type: 'ATTENDANCE' | 'EXAM_CLEARANCE' | 'SESSION' | 'STUDENT' | 'COURSE' | 'DEPARTMENT';
  format: 'PDF' | 'EXCEL' | 'CSV';
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  file_path?: string;
  created_at: string;
  completed_at?: string;
}

interface ScheduledReport {
  id: number;
  name: string;
  report_type: string;
  format: string;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'SEMESTER';
  is_active: boolean;
  next_run?: string;
}

interface GenerateReportParams {
  title: string;
  format: 'PDF' | 'EXCEL' | 'CSV';
  filters?: {
    start_date?: string;
    end_date?: string;
    course_id?: number;
    student_id?: string;
    department_id?: number;
  };
}

// Queries
export const useReports = () => {
  return useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      const response = await apiClient.get('/reports/');
      return response.data as Report[];
    },
  });
};

export const useReport = (reportId: number) => {
  return useQuery({
    queryKey: ['reports', reportId],
    queryFn: async () => {
      const response = await apiClient.get(`/reports/${reportId}/`);
      return response.data as Report;
    },
    enabled: !!reportId,
  });
};

export const useScheduledReports = () => {
  return useQuery({
    queryKey: ['reports', 'scheduled'],
    queryFn: async () => {
      const response = await apiClient.get('/reports/scheduled/');
      return response.data as ScheduledReport[];
    },
  });
};

// Mutations - Generate Reports
export const useGenerateAttendanceReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: GenerateReportParams) => {
      const response = await apiClient.post('/reports/generate/attendance/', params);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
};

export const useGenerateExamClearanceReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: GenerateReportParams) => {
      const response = await apiClient.post('/reports/generate/exam-clearance/', params);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
};

export const useGenerateSessionReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: GenerateReportParams) => {
      const response = await apiClient.post('/reports/generate/session/', params);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
};

export const useGenerateStudentReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: GenerateReportParams) => {
      const response = await apiClient.post('/reports/generate/student/', params);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
};

export const useGenerateCourseReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: GenerateReportParams) => {
      const response = await apiClient.post('/reports/generate/course/', params);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
};

export const useGenerateDepartmentReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: GenerateReportParams) => {
      const response = await apiClient.post('/reports/generate/department/', params);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
};

// Quick Exports
export const useQuickExportAttendance = () => {
  return useMutation({
    mutationFn: async (params: { format: 'PDF' | 'EXCEL' | 'CSV'; filters?: any }) => {
      const response = await apiClient.post('/reports/export/attendance/', params, {
        responseType: 'blob',
      });
      return response.data;
    },
  });
};

export const useQuickExportStudents = () => {
  return useMutation({
    mutationFn: async (params: { format: 'PDF' | 'EXCEL' | 'CSV'; filters?: any }) => {
      const response = await apiClient.post('/reports/export/students/', params, {
        responseType: 'blob',
      });
      return response.data;
    },
  });
};

// Download Report
export const useDownloadReport = () => {
  return useMutation({
    mutationFn: async (reportId: number) => {
      const response = await apiClient.get(`/reports/${reportId}/download/`, {
        responseType: 'blob',
      });
      return response.data;
    },
  });
};

// Delete Report
export const useDeleteReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (reportId: number) => {
      const response = await apiClient.delete(`/reports/${reportId}/delete/`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
};

// Scheduled Reports
export const useCreateScheduledReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      name: string;
      report_type: string;
      format: string;
      frequency: string;
      filters?: any;
      scheduled_time?: string;
    }) => {
      const response = await apiClient.post('/reports/scheduled/create/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports', 'scheduled'] });
    },
  });
};

export const useToggleScheduledReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (reportId: number) => {
      const response = await apiClient.post(`/reports/scheduled/${reportId}/toggle/`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports', 'scheduled'] });
    },
  });
};
