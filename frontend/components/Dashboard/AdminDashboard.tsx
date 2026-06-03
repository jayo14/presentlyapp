import React, { useState, useEffect } from 'react';
import {
  Users,
  Buildings,
  ShieldWarning,
  Pulse,
  MagnifyingGlass,
  DownloadSimple,
  CheckCircle,
  XCircle,
  Info,
  Warning,
  Clock,
  Layers,
  TrendingUp,
  ArrowUpRight,
  DotsThree,
  ArrowsClockwise
} from '@phosphor-icons/react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { systemApi, SystemStats, SystemActivity, SystemAlert, SystemLog } from '../../services/api/system';
import { SEO } from '../SEO';
import { DashboardPage } from '../layout-primitives/DashboardPage';
import { ResponsiveGrid } from '../layout-primitives/ResponsiveGrid';
import { DashboardCard } from '../layout-primitives/DashboardCard';

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
      if (stats) setSystemStats(stats);
      if (activity) setActivityData(activity);
    } catch (error) {
      console.error('Failed to load system data:', error);
    } finally {
      setTimeout(() => setStatsLoading(false), 800);
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

  // Audit Logs View
  if (view === 'logs') {
    return (
      <DashboardPage
        title="Audit Logs"
        description="Track system activities and security events."
        actions={
          <div className="flex gap-2">
            <button
              onClick={() => loadLogs()}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-textMuted bg-surface text-text border border-outline rounded-lg hover:bg-surfaceHigh hover:text-text transition-colors"
            >
              <ArrowsClockwise size={14} weight="bold" className={logsLoading ? "animate-spin" : ""} />
              Refresh
            </button>
            <button className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-textMuted bg-surface text-text border border-outline rounded-lg hover:bg-surfaceHigh hover:text-text transition-colors">
              <DownloadSimple size={14} weight="bold" />
              Export
            </button>
          </div>
        }
      >
        <SEO title="System Logs | Admin | Presently" description="View and audit system activity logs on Presently." />

        {/* Logs Table Card */}
        <div className="bg-surface text-text border border-outline rounded-xl overflow-hidden">
          {/* Filters */}
          <div className="p-3 border-b border-outline flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={15} />
              <input
                type="text"
                placeholder="Search logs..."
                className="w-full bg-surfaceLow border border-outline rounded-lg pl-9 pr-4 py-2 text-sm text-text placeholder:text-textMuted focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                value={logSearch}
                onChange={(e) => {
                  setLogSearch(e.target.value);
                  loadLogs(1, e.target.value);
                }}
              />
            </div>
            <select
              className="bg-surfaceLow border border-outline text-textMuted text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 outline-none"
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
                <tr className="border-b border-outline">
                  <th className="px-4 py-3 text-xs font-medium text-textMuted uppercase tracking-wider w-12">Type</th>
                  <th className="px-4 py-3 text-xs font-medium text-textMuted uppercase tracking-wider">Action</th>
                  <th className="px-4 py-3 text-xs font-medium text-textMuted uppercase tracking-wider">User</th>
                  <th className="px-4 py-3 text-xs font-medium text-textMuted uppercase tracking-wider">Role</th>
                  <th className="px-4 py-3 text-xs font-medium text-textMuted uppercase tracking-wider text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {logsLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={5} className="px-4 py-3">
                        <div className="h-4 bg-surfaceHigh rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-textMuted">
                      No logs found.
                    </td>
                  </tr>
                ) : logs.map(log => (
                  <tr key={log.id} className="hover:bg-surfaceHigh hover:text-text/50 transition-colors">
                    <td className="px-4 py-3">
                      {log.level === 'info' && <Info size={16} weight="bold" className="text-blue-500" />}
                      {log.level === 'warning' && <Warning size={16} weight="bold" className="text-amber-500" />}
                      {log.level === 'error' && <XCircle size={16} weight="bold" className="text-red-500" />}
                      {log.level === 'success' && <CheckCircle size={16} weight="bold" className="text-emerald-500" />}
                    </td>
                    <td className="px-4 py-3 text-text font-medium">{log.action}</td>
                    <td className="px-4 py-3 text-textMuted">{log.user_name || log.ip_address || 'System'}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 bg-surfaceHigh text-textMuted rounded text-xs font-medium">
                        {log.user_role || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-textMuted font-mono text-xs">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      <br />
                      <span className="text-textMuted text-[10px]">{new Date(log.timestamp).toLocaleDateString()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {logCount > 0 && (
            <div className="px-4 py-3 border-t border-outline flex items-center justify-between">
              <p className="text-xs text-textMuted">
                Showing <span className="font-medium text-textMuted">{logs.length}</span> of <span className="font-medium text-textMuted">{logCount}</span>
              </p>
              <div className="flex gap-2">
                <button
                  disabled={logPage === 1 || logsLoading}
                  onClick={() => loadLogs(logPage - 1)}
                  className="px-3 py-1.5 text-sm font-medium text-textMuted bg-surface text-text border border-outline rounded-lg hover:bg-surfaceHigh hover:text-text transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  disabled={logs.length < 30 || (logPage * 30) >= logCount || logsLoading}
                  onClick={() => loadLogs(logPage + 1)}
                  className="px-3 py-1.5 text-sm font-medium text-textMuted bg-surface text-text border border-outline rounded-lg hover:bg-surfaceHigh hover:text-text transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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

  // Default Admin Dashboard Overview
  const statCards = [
    { label: "Total Users", value: systemStats.total_users.toLocaleString(), icon: Users, iconClassName: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400" },
    { label: "Active Venues", value: systemStats.active_venues.toString(), icon: Buildings, iconClassName: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" },
    { label: "Total Sessions", value: systemStats.total_sessions.toLocaleString(), icon: Pulse, iconClassName: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400" },
    { label: "Security Alerts", value: systemStats.security_alerts.toString(), icon: ShieldWarning, iconClassName: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400" },
  ];

  return (
    <DashboardPage
      title={`Welcome back, ${userName.split(' ')[0]}`}
      description={
        <>
          <span>Here's what's happening with your platform.</span>
          <span className="ml-2 px-2 py-0.5 text-[10px] font-black bg-sungold/20 text-presently-black rounded-full tracking-widest uppercase">
            SYSTEM OVERSEER
          </span>
        </>
      }
    >
      <SEO title="Admin Dashboard | Presently" description="System overview and health check for Presently administrators." />

      {/* Stats Grid */}
      <ResponsiveGrid>
        {statCards.map((stat, i) => (
          <DashboardCard
            key={i}
            title={stat.label}
            value={stat.value}
            icon={stat.icon}
            iconClassName={stat.iconClassName}
          />
        ))}
      </ResponsiveGrid>

      {/* System Activity Chart */}
      <div className="bg-surface text-text border border-outline rounded-xl overflow-hidden mt-6">
        <div className="px-5 py-4 border-b border-outline flex items-center justify-between">
          <div>
            <h3 className="font-headline text-sm font-semibold text-text">System Activity</h3>
            <p className="text-xs text-textMuted mt-0.5">Active users and sessions over time</p>
          </div>
          <button
            onClick={loadSystemData}
            className="p-2 text-textMuted hover:text-text rounded-lg hover:bg-surfaceHigh hover:text-text transition-colors"
          >
            <ArrowsClockwise size={14} weight="bold" className={statsLoading ? "animate-spin" : ""} />
          </button>
        </div>
        <div className="p-5">
          <div className="h-64 w-full min-h-[256px] relative">
            <ResponsiveContainer width="100%" height="100%" minHeight={256} minWidth={0}>
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f5c518" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f5c518" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" strokeOpacity={0.5} />
                <XAxis dataKey="name" stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} dy={8} />
                <YAxis stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} width={32} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--tooltip-bg, #18181b)',
                    border: '1px solid var(--tooltip-border, #27272a)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="active" stroke="#f5c518" fillOpacity={1} fill="url(#colorActive)" strokeWidth={2} name="Active Users" />
                <Area type="monotone" dataKey="sessions" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSessions)" strokeWidth={2} name="Sessions" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </DashboardPage>
  );
};
