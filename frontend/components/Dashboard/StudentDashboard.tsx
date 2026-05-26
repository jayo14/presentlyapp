import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { studentApi } from '../../services/api/student';
import { StudentDashboardPage } from './DashboardPages';
import { SEO } from '../SEO';

interface StudentDashboardProps {
  userName: string;
  view?: string;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ userName, view }) => {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['studentDashboard'],
    queryFn: () => studentApi.getStudentDashboard(),
  });

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center text-on-surface-variant font-bold uppercase tracking-widest text-xs animate-pulse">
        Syncing Student Record...
      </div>
    );
  }

  return (
    <>
      <SEO title="Student Dashboard | Presently" />
      <StudentDashboardPage userName={userName} />
    </>
  );
};

export default StudentDashboard;
