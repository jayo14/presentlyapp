import React, { useState, useEffect } from 'react';
import {
  Users as PhosphorUsers,
  MapTrifold,
  ShieldCheck,
  Pulse,
  MagnifyingGlass,
  DownloadSimple,
  CheckCircle as PhosphorCheckCircle,
  XCircle as PhosphorXCircle,
  Info as PhosphorInfo,
  Warning,
  Clock as PhosphorClock,
  Stack,
  Buildings,
  ChartLineUp,
  ArrowUpRight as PhosphorArrowUpRight,
  DotsThreeOutline,
  ArrowsClockwise
} from '@phosphor-icons/react';
import { InstitutionManagement } from '../Admin/InstitutionManagement';
import UserManagement from '../Admin/UserManagement';
import VenueManagement from '../Admin/VenueManagement';
import DepartmentManagement from '../Admin/DepartmentManagement';
import CourseManagement from '../Admin/CourseManagement';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { systemApi, SystemStats, SystemActivity, SystemAlert, SystemLog } from '../../services/api/system';
import { SEO } from '../SEO';
import { DashboardPage } from '@/components/layout-primitives/DashboardPage';
import { ResponsiveGrid } from '@/components/layout-primitives/ResponsiveGrid';

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
  const [logCount, setLogCount] = useState(0);
  const [logPage, setLogPage] = useState(1);
  const [logType, setLogType] = useState('All Events');
  const [statsLoading, setStatsLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logSearch, setLogSearch] = useState('');

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
      const [stats, activity] = await Promise.all([
        systemApi.getStats(),
        systemApi.getActivity(),
      ]);
      setSystemStats(stats);
      setActivityData(activity);
    } catch (error) {
      console.error('Failed to load system data:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const loadLogs = async (page: number = 1, search?: string, type?: string) => {
    try {
      setLogsLoading(true);
      const currentSearch = search !== undefined ? search : logSearch;
      const currentType = type !== undefined ? type : logType;

      const response = await systemApi.getLogs({
        page,
        action: currentSearch,
        event_type: currentType !== 'All Events' ? currentType.toUpperCase() : undefined
      });
      setLogs(response.results);
      setLogCount(response.count);
      setLogPage(page);
    } catch (error) {
      console.error('Failed to load logs:', error);
    } finally {
      setLogsLoading(false);
    }
  };

  // Delegate to sub-components for management views
  if (view === 'institutions') {
    return (
      <React.Fragment>
        <SEO title="Institutions | Admin | Presently" description="Manage educational institutions on Presently." />
        <InstitutionManagement />
      </React.Fragment>
    );
  }

  if (view === 'users') {
    return (
      <React.Fragment>
        <SEO title="Users | Admin | Presently" description="Manage users and roles on Presently." />
        <UserManagement />
      </React.Fragment>
    );
  }

  if (view === 'venues') {
    return (
      <React.Fragment>
        <SEO title="Venues | Admin | Presently" description="Manage and map campus venues on Presently." />
        <VenueManagement />
      </React.Fragment>
    );
  }

  if (view === 'departments') {
    return (
      <React.Fragment>
        <SEO title="Departments | Admin | Presently" description="Manage academic departments on Presently." />
        <DepartmentManagement />
      </React.Fragment>
    );
  }

  if (view === 'courses') {
    return (
      <React.Fragment>
        <SEO title="Courses | Admin | Presently" description="Manage courses offered on Presently." />
        <CourseManagement />
      </React.Fragment>
    );
  }

  // Audit Logs View
  if (view === 'logs') {
    return (
      <DashboardPage
        title="Audit Logs"
        description="Track system activities and security events."
        badge="SYSTEM OVERSEER"
        headerIcon={<Stack size={24} weight="bold" />}
        actions={
          <div className="flex gap-2">
            <button
              onClick={() => loadLogs()}
              className="inline-flex items-center gap-2 px-4 h-11 text-sm font-bold text-text bg-surface border border-outline rounded-xl hover:bg-surfaceHigh transition-all ease-premium"
            >
              <ArrowsClockwise size={18} weight="bold" />
              Refresh
            </button>
            <button className="inline-flex items-center gap-2 px-4 h-11 text-sm font-bold text-text bg-surface border border-outline rounded-xl hover:bg-surfaceHigh transition-all ease-premium">
              <DownloadSimple size={18} weight="bold" />
              Export
            </button>
          </div>
        }
      >
        <SEO title="System Logs | Admin | Presently" description="View and audit system activity logs on Presently." />

        {/* Logs Table Card */}
        <div className="bg-surface text-text border border-outline rounded-2xl overflow-hidden shadow-sm">
          {/* Filters */}
          <div className="p-4 border-b border-outline flex flex-col sm:flex-row gap-4 bg-surfaceLow/30">
            <div className="relative flex-1">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={18} weight="bold" />
              <input
                type="text"
                placeholder="Search logs..."
                className="w-full h-11 bg-surface border border-outline rounded-xl pl-10 pr-4 text-sm text-text placeholder:text-textMuted focus:ring-2 focus:ring-sungold/20 focus:border-sungold outline-none transition-all ease-premium skeuo-input"
                value={logSearch}
                onChange={(e) => {
                  setLogSearch(e.target.value);
                  loadLogs(1, e.target.value);
                }}
              />
            </div>
            <select
              className="h-11 bg-surface border border-outline text-text font-medium text-sm rounded-xl px-4 focus:ring-2 focus:ring-sungold/20 outline-none transition-all ease-premium"
              value={logType}
              onChange={(e) => {
                setLogType(e.target.value);
                loadLogs(1, undefined, e.target.value);
              }}
            >
              <option>All Events</option>
              <option>Auth</option>
              <option>System</option>
              <option>Config</option>
              <option>Security</option>
              <option>Error</option>
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-outline bg-surfaceLow/20">
                  <th className="px-6 py-4 text-xs font-bold text-textMuted uppercase tracking-widest w-12 text-center">Type</th>
                  <th className="px-6 py-4 text-xs font-bold text-textMuted uppercase tracking-widest">Action</th>
                  <th className="px-6 py-4 text-xs font-bold text-textMuted uppercase tracking-widest">User</th>
                  <th className="px-6 py-4 text-xs font-bold text-textMuted uppercase tracking-widest">Role</th>
                  <th className="px-6 py-4 text-xs font-bold text-textMuted uppercase tracking-widest text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/5">
                {logsLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={5} className="px-6 py-4">
                        <div className="h-4 bg-surfaceHigh rounded-full animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-textMuted font-medium">
                      No logs found.
                    </td>
                  </tr>
                ) : logs.map(log => (
                  <tr key={log.id} className="hover:bg-surfaceHigh/40 transition-colors group">
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        {log.level === 'info' && <PhosphorInfo size={18} weight="bold" className="text-blue-500" />}
                        {log.level === 'warning' && <Warning size={18} weight="bold" className="text-amber-500" />}
                        {log.level === 'error' && <PhosphorXCircle size={18} weight="bold" className="text-red-500" />}
                        {log.level === 'success' && <PhosphorCheckCircle size={18} weight="bold" className="text-emerald-500" />}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-presently-black dark:text-soft-cream font-bold">{log.action}</td>
                    <td className="px-6 py-4 text-textMuted font-medium">{log.user_name || log.ip_address || 'System'}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 bg-surfaceHigh text-textMuted rounded-lg text-[10px] font-bold uppercase tracking-wider">
                        {log.user_role || 'SYSTEM'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-textMuted font-mono text-xs">
                      <div className="font-bold">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      <div className="text-[10px] opacity-70 tracking-tight">{new Date(log.timestamp).toLocaleDateString()}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {logCount > 0 && (
            <div className="px-6 py-4 border-t border-outline flex items-center justify-between bg-surfaceLow/10">
              <p className="text-xs text-textMuted font-medium">
                Showing <span className="text-presently-black dark:text-soft-cream font-bold">{logs.length}</span> of <span className="text-presently-black dark:text-soft-cream font-bold">{logCount}</span> entries
              </p>
              <div className="flex gap-2">
                <button
                  disabled={logPage === 1 || logsLoading}
                  onClick={() => loadLogs(logPage - 1)}
                  className="px-4 py-2 text-xs font-bold text-text bg-surface border border-outline rounded-xl hover:bg-surfaceHigh transition-all disabled:opacity-30 disabled:cursor-not-allowed skeuo-button-gold h-auto"
                >
                  Previous
                </button>
                <button
                  disabled={logs.length < 30 || (logPage * 30) >= logCount || logsLoading}
                  onClick={() => loadLogs(logPage + 1)}
                  className="px-4 py-2 text-xs font-bold text-text bg-surface border border-outline rounded-xl hover:bg-surfaceHigh transition-all disabled:opacity-30 disabled:cursor-not-allowed skeuo-button-gold h-auto"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </DashboardPage>
    );
  }

  const statCards = [
    { label: "Total Users", value: systemStats.total_users.toLocaleString(), icon: PhosphorUsers, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10" },
    { label: "Active Venues", value: systemStats.active_venues.toString(), icon: MapTrifold, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
    { label: "Total Sessions", value: systemStats.total_sessions.toLocaleString(), icon: Pulse, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/10" },
    { label: "Security Alerts", value: systemStats.security_alerts.toString(), icon: ShieldCheck, color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-500/10" },
  ];

  return (
    <DashboardPage
      title={`Welcome back, ${userName.split(' ')[0]}`}
      description="Here's what's happening with your platform today."
      badge="SYSTEM OVERSEER"
      headerIcon={<Pulse size={24} weight="bold" />}
    >
      <SEO title="Admin Dashboard | Presently" description="System overview and health check for Presently administrators." />

      <div className="flex flex-col gap-8">
        {/* Stats Grid */}
        <ResponsiveGrid columns={4} gap="md">
          {statCards.map((stat, i) => (
            <div key={i} className="bg-surface text-text border border-outline rounded-2xl p-6 transition-all hover:shadow-md hover:border-sungold/30 group relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl ${stat.bg} flex items-center justify-center transition-transform group-hover:scale-110`}>
                  <stat.icon size={22} weight="bold" className={stat.color} />
                </div>
                <div className="p-1.5 rounded-lg bg-surfaceHigh/50 text-textMuted opacity-0 group-hover:opacity-100 transition-opacity">
                  <PhosphorArrowUpRight size={14} weight="bold" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-presently-black dark:text-soft-cream tracking-tight">{stat.value}</p>
                <p className="text-xs font-bold text-textMuted uppercase tracking-widest">{stat.label}</p>
              </div>
              <div className="absolute bottom-0 left-0 h-1 bg-sungold/0 group-hover:bg-sungold/40 w-full transition-all" />
            </div>
          ))}
        </ResponsiveGrid>

        {/* System Activity Chart */}
        <div className="bg-surface text-text border border-outline rounded-3xl overflow-hidden shadow-sm mt-8">
          <div className="px-8 py-6 border-b border-outline flex items-center justify-between bg-surfaceLow/20">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-sungold/10 flex items-center justify-center text-sungold">
                <ChartLineUp size={20} weight="bold" />
              </div>
              <div>
                <h3 className="font-nimbus text-lg font-bold text-presently-black dark:text-soft-cream">System Activity</h3>
                <p className="text-xs font-medium text-textMuted mt-0.5 uppercase tracking-wider">Active users and sessions over 24h</p>
              </div>
            </div>
            <button
              onClick={loadSystemData}
              className="p-2.5 text-textMuted hover:text-presently-black dark:hover:text-soft-cream rounded-xl hover:bg-surfaceHigh transition-all ease-premium"
              aria-label="Refresh stats"
            >
              <ArrowsClockwise size={20} weight="bold" />
            </button>
          </div>
          <div className="p-8">
            <div className="h-80 w-full min-h-[320px] relative">
              <ResponsiveContainer width="100%" height="100%" minHeight={320} minWidth={0}>
                <AreaChart data={activityData}>
                  <defs>
                    <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F5C518" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#F5C518" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0D0D0D" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#0D0D0D" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" strokeOpacity={0.4} />
                  <XAxis
                    dataKey="name"
                    stroke="#a1a1aa"
                    fontSize={11}
                    fontWeight={600}
                    tickLine={false}
                    axisLine={false}
                    dy={12}
                  />
                  <YAxis
                    stroke="#a1a1aa"
                    fontSize={11}
                    fontWeight={600}
                    tickLine={false}
                    axisLine={false}
                    width={40}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--surface)',
                      border: '1px solid var(--outline)',
                      borderRadius: '16px',
                      fontSize: '12px',
                      fontWeight: 700,
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                    itemStyle={{ color: 'var(--text)' }}
                    cursor={{ stroke: 'var(--sungold)', strokeWidth: 2, strokeDasharray: '5 5' }}
                  />
                  <Area type="monotone" dataKey="active" stroke="#F5C518" fillOpacity={1} fill="url(#colorActive)" strokeWidth={3} name="Active Users" />
                  <Area type="monotone" dataKey="sessions" stroke="#0D0D0D" fillOpacity={1} fill="url(#colorSessions)" strokeWidth={3} name="Sessions" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </DashboardPage>
  );
};
