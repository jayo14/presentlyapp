import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { attendanceApi, lecturerApi } from '../../services/api/attendance';
import { LecturerDashboardPage } from './DashboardPages';
import { SEO } from '../SEO';

interface LecturerDashboardProps {
  userName: string;
  userProfile?: any;
  view?: 'default' | 'analytics' | 'reports' | 'courses' | 'timetable';
}

export const LecturerDashboard: React.FC<LecturerDashboardProps> = ({ userName, view = 'default' }) => {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['lecturerDashboard'],
    queryFn: () => lecturerApi.getLecturerDashboard(),
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ['lecturerSessions'],
    queryFn: () => attendanceApi.getSessions({ lecturer_only: true }),
  });

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center text-on-surface-variant font-bold uppercase tracking-widest text-xs animate-pulse">
        Initializing Academic Dashboard...
      </div>
    );
  }

  return (
    <>
      <SEO title="Lecturer Command Center | Presently" />
      <LecturerDashboardPage userName={userName} />
    </>
  );
};

export default LecturerDashboard;
