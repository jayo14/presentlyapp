import React, { useState, useEffect } from 'react';
import { Users, Map as MapIcon, ShieldAlert, Activity, RefreshCw, Terminal, Bell, TrendingUp } from 'lucide-react';
import { InstitutionManagement } from '../Admin/InstitutionManagement';
import { UserManagement } from '../Admin/UserManagement';
import { VenueManagement } from '../Admin/VenueManagement';
import { DepartmentManagement } from '../Admin/DepartmentManagement';
import { CourseManagement } from '../Admin/CourseManagement';
import { systemApi, SystemStats, SystemActivity, SystemLog } from '../../services/api/system';
import { SEO } from '../SEO';
import { AdminDashboardPage } from './DashboardPages';

interface AdminDashboardProps {
  userName: string;
  view?: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ userName, view = 'dashboard' }) => {
  const [systemStats, setSystemStats] = useState<SystemStats>({
    total_users: 2543,
    active_venues: 12,
    total_sessions: 8921,
    security_alerts: 3,
  });
  const [activityData, setActivityData] = useState<SystemActivity[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (view === 'dashboard') {
      loadSystemData();
    } else if (view === 'logs') {
      loadLogs(1);
    }
  }, [view]);

  const loadSystemData = async () => {
    try {
      setStatsLoading(true);
      const [stats, history] = await Promise.all([
        systemApi.getStats(),
        systemApi.getActivityHistory()
      ]);
      setSystemStats(stats);
      setActivityData(history);
    } catch (error) {
      console.error('Failed to load system data');
    } finally {
      setStatsLoading(false);
    }
  };

  const loadLogs = async (page: number) => {
     try {
       const res = await systemApi.getLogs(page);
       setLogs(res.results);
     } catch (err) {
       console.error('Failed to load logs');
     }
  };

  const renderContent = () => {
    switch (view) {
      case 'institutions': return <InstitutionManagement />;
      case 'users': return <UserManagement />;
      case 'venues': return <VenueManagement />;
      case 'departments': return <DepartmentManagement />;
      case 'courses': return <CourseManagement />;
      case 'dashboard':
      default:
        return <AdminDashboardPage userName={userName} />;
    }
  };

  return (
    <>
      <SEO title="Admin Control Center | Presently" />
      {renderContent()}
    </>
  );
};
