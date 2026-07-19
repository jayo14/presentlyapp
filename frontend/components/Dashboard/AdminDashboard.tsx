import React, { useState, useEffect } from 'react';
import {
  Users,
  ChalkboardTeacher,
  Buildings,
  MapPin,
  CheckSquare,
  Video,
  ChartLineUp,
  Heartbeat,
  RadioButton,
  Clock,
  XCircle,
  NavigationArrow,
  HourglassHigh,
  Flag,
  Gauge,
  FileText,
  ArrowUp,
  ArrowDown,
  Warning,
  CheckCircle,
  Info,
  MagnifyingGlass,
  DownloadSimple,
  ArrowsClockwise,
  Plus,
  BellRinging,
  UserPlus,
  Export,
  HardDrives,
  Lightning,
  Database,
  Envelope,
  ShieldCheck,
  ArrowUpRight,
  DotsThree,
  Pulse
} from '@phosphor-icons/react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { systemApi, SystemStats, SystemActivity, SystemLog, SystemAlert, PaginatedResponse, AdminDashboardData, AdminLiveSession, AdminAttendanceStats, AdminTodaysNumbers, AdminPlatformHealth, AdminRecentActivity } from '../../services/api/system';
import { useSystemHealth } from '../../hooks/useSystemHealth';
import { SEO } from '../SEO';
import { DashboardPage } from '../layout-primitives/DashboardPage';
import { ResponsiveGrid } from '../layout-primitives/ResponsiveGrid';

// ─── Type aliases from API ────────────────────────────────────────────────────
// Re-use the canonical types from system.ts — no local duplicates needed.
type AttendanceStats = AdminAttendanceStats;
type LiveSession     = AdminLiveSession;
type TodaysNumbers   = AdminTodaysNumbers;
type PlatformHealth  = AdminPlatformHealth;
type RecentActivityItem = AdminRecentActivity;

// ─── Mock / Seed Data ─────────────────────────────────────────────────────────

const MOCK_ATTENDANCE_STATS: AttendanceStats = {
  registered_students: 14_238,
  lecturers: 832,
  institutions: 32,
  active_campuses: 87,
  today_attendance: 9_541,
  today_attendance_delta: 18,
  live_classes: 64,
  attendance_success_rate: 97.6,
  system_health: 'healthy',
};

const MOCK_LIVE_SESSIONS: LiveSession[] = [
  { id: '1', institution: 'LASUSTECH', course_code: 'CSC401', course_name: 'Compiler Construction', started_at: new Date(Date.now() - 28 * 60000).toISOString(), checked_in: 128, total_enrolled: 145, closes_in_minutes: null, status: 'live' },
  { id: '2', institution: 'UNILAG', course_code: 'GST101', course_name: 'Use of English', started_at: new Date(Date.now() - 15 * 60000).toISOString(), checked_in: 64, total_enrolled: 90, closes_in_minutes: 10, status: 'closing_soon' },
  { id: '3', institution: 'LASU', course_code: 'CHM202', course_name: 'Organic Chemistry II', started_at: new Date(Date.now() - 42 * 60000).toISOString(), checked_in: 93, total_enrolled: 110, closes_in_minutes: 12, status: 'closing_soon' },
  { id: '4', institution: 'OAU', course_code: 'MTH301', course_name: 'Mathematical Methods', started_at: new Date(Date.now() - 8 * 60000).toISOString(), checked_in: 77, total_enrolled: 88, closes_in_minutes: null, status: 'live' },
];

const MOCK_TODAYS_NUMBERS: TodaysNumbers = {
  total_checked_in: 9_541,
  rejected_checkins: 214,
  gps_failures: 38,
  late_arrivals: 412,
  classes_completed: 29,
  average_attendance_pct: 83,
};

const MOCK_PLATFORM_HEALTH: PlatformHealth = {
  server_uptime_pct: 99.97,
  realtime_connections: 1_204,
  notification_queue: 7,
  emails_sent_today: 48,
  db_latency_ms: 12,
  storage_used_pct: 41,
};

const MOCK_RECENT_ACTIVITY: RecentActivityItem[] = [
  { id: '1', type: 'success', message: 'Dr. Ade created CSC401 session at LASUSTECH.', timestamp: new Date(Date.now() - 2 * 60000).toISOString() },
  { id: '2', type: 'success', message: 'University of Lagos added to platform.', timestamp: new Date(Date.now() - 5 * 60000).toISOString() },
  { id: '3', type: 'error', message: 'John Doe attempted attendance outside geofence.', timestamp: new Date(Date.now() - 8 * 60000).toISOString() },
  { id: '4', type: 'success', message: '482 students checked in — GST101 (UNILAG).', timestamp: new Date(Date.now() - 11 * 60000).toISOString() },
  { id: '5', type: 'warning', message: 'Attendance nullified for CHM101 due to GPS drift.', timestamp: new Date(Date.now() - 18 * 60000).toISOString() },
  { id: '6', type: 'success', message: 'Staff promoted: Ms. Bello to Department HOD.', timestamp: new Date(Date.now() - 26 * 60000).toISOString() },
  { id: '7', type: 'info', message: 'System backup completed (3.2 GB).', timestamp: new Date(Date.now() - 54 * 60000).toISOString() },
];

const MOCK_ATTENDANCE_TREND: SystemActivity[] = [
  { name: 'Mon', active: 8200, sessions: 58 },
  { name: 'Tue', active: 9800, sessions: 71 },
  { name: 'Wed', active: 7400, sessions: 54 },
  { name: 'Thu', active: 11200, sessions: 82 },
  { name: 'Fri', active: 9541, sessions: 64 },
  { name: 'Sat', active: 1200, sessions: 11 },
  { name: 'Sun', active: 400, sessions: 4 },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface AdminDashboardProps {
  userName: string;
  view?: string;
}

// ─── Utility helpers ──────────────────────────────────────────────────────────

function fmtRelative(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return new Date(iso).toLocaleDateString();
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface HeroStatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  delta?: number; // percentage change
  deltaLabel?: string;
  loading?: boolean;
}

const HeroStatCard: React.FC<HeroStatCardProps> = ({
  label, value, icon: Icon, iconColor, iconBg, delta, deltaLabel, loading
}) => (
  <div className="bg-surface text-text border border-outline rounded-xl p-4 flex flex-col gap-3 hover:shadow-sm transition-shadow">
    <div className="flex items-center justify-between">
      <div className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center`}>
        <Icon size={18} weight="bold" className={iconColor} />
      </div>
      {delta !== undefined && (
        <span className={`inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-full ${delta >= 0 ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'}`}>
          {delta >= 0 ? <ArrowUp size={10} weight="bold" /> : <ArrowDown size={10} weight="bold" />}
          {Math.abs(delta)}%
        </span>
      )}
    </div>
    {loading ? (
      <div className="space-y-1.5">
        <div className="h-7 w-24 bg-surfaceHigh rounded animate-pulse" />
        <div className="h-3 w-16 bg-surfaceHigh rounded animate-pulse" />
      </div>
    ) : (
      <>
        <p className="text-2xl font-semibold text-text tracking-tight leading-none">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        <p className="text-xs text-textMuted">
          {label}
          {deltaLabel && <span className="ml-1 text-textMuted opacity-70">{deltaLabel}</span>}
        </p>
      </>
    )}
  </div>
);

interface LiveSessionCardProps {
  session: LiveSession;
}

const LiveSessionCard: React.FC<LiveSessionCardProps> = ({ session }) => {
  const pct = Math.round((session.checked_in / session.total_enrolled) * 100);
  const isClosingSoon = session.status === 'closing_soon';

  return (
    <div className={`rounded-xl border p-4 flex flex-col gap-3 transition-all ${isClosingSoon ? 'border-amber-300 dark:border-amber-500/40 bg-amber-50/50 dark:bg-amber-500/5' : 'border-outline bg-surface'}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`relative flex h-2.5 w-2.5 mt-0.5`}>
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isClosingSoon ? 'bg-amber-400' : 'bg-emerald-400'}`} />
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isClosingSoon ? 'bg-amber-500' : 'bg-emerald-500'}`} />
          </span>
          <span className={`text-xs font-semibold uppercase tracking-wide ${isClosingSoon ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {isClosingSoon ? 'Closing Soon' : 'Live'}
          </span>
        </div>
        <span className="text-xs text-textMuted font-medium">{session.institution}</span>
      </div>

      {/* Course */}
      <div>
        <p className="text-sm font-semibold text-text">{session.course_code}</p>
        <p className="text-xs text-textMuted truncate">{session.course_name}</p>
      </div>

      {/* Attendance bar */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-textMuted">{session.checked_in} / {session.total_enrolled} checked in</span>
          <span className="text-xs font-semibold text-text">{pct}%</span>
        </div>
        <div className="w-full h-1.5 bg-surfaceHigh rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${isClosingSoon ? 'bg-amber-500' : 'bg-emerald-500'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-textMuted">
        <span>Started {fmtTime(session.started_at)}</span>
        {session.closes_in_minutes !== null && (
          <span className={`font-medium ${isClosingSoon ? 'text-amber-600 dark:text-amber-400' : 'text-textMuted'}`}>
            Closes in {session.closes_in_minutes}m
          </span>
        )}
      </div>
    </div>
  );
};

interface ActivityItemProps {
  item: RecentActivityItem;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ item }) => {
  const cfg = {
    success: { icon: CheckCircle, color: 'text-emerald-500', dot: 'bg-emerald-500' },
    warning: { icon: Warning, color: 'text-amber-500', dot: 'bg-amber-500' },
    error: { icon: XCircle, color: 'text-red-500', dot: 'bg-red-500' },
    info: { icon: Info, color: 'text-blue-500', dot: 'bg-blue-500' },
  }[item.type];
  const Icon = cfg.icon;

  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-outline last:border-0">
      <Icon size={15} weight="fill" className={`${cfg.color} mt-0.5 flex-shrink-0`} />
      <p className="flex-1 text-sm text-text leading-snug">{item.message}</p>
      <span className="text-xs text-textMuted whitespace-nowrap flex-shrink-0">{fmtRelative(item.timestamp)}</span>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ userName, view = 'dashboard' }) => {
  // ── Stats state ──────────────────────────────────────────────────────────
  const [systemStats, setSystemStats] = useState<SystemStats>({
    total_users: 2543,
    active_venues: 12,
    total_sessions: 8921,
    security_alerts: 3,
  });
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats>(MOCK_ATTENDANCE_STATS);
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>(MOCK_LIVE_SESSIONS);
  const [todaysNumbers, setTodaysNumbers] = useState<TodaysNumbers>(MOCK_TODAYS_NUMBERS);
  const [platformHealth, setPlatformHealth] = useState<PlatformHealth>(MOCK_PLATFORM_HEALTH);
  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>(MOCK_RECENT_ACTIVITY);
  const [trendData, setTrendData] = useState<SystemActivity[]>(MOCK_ATTENDANCE_TREND);
  const [chartTab, setChartTab] = useState<'attendance' | 'users' | 'traffic'>('attendance');
  const [statsLoading, setStatsLoading] = useState(true);

  // ── Logs state ───────────────────────────────────────────────────────────
  const [activityData, setActivityData] = useState<SystemActivity[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [logCount, setLogCount] = useState(0);
  const [logPage, setLogPage] = useState(1);
  const [logType, setLogType] = useState('All Events');
  const [logsLoading, setLogsLoading] = useState(false);
  const [logSearch, setLogSearch] = useState('');
  const { data: livePlatformHealth } = useSystemHealth(view === 'dashboard');

  useEffect(() => {
    if (view === 'dashboard') {
      loadDashboardData();
    } else if (view === 'logs') {
      loadLogs(1);
    }
  }, [view]);

  useEffect(() => {
    if (livePlatformHealth) {
      setPlatformHealth(livePlatformHealth);
    }
  }, [livePlatformHealth]);

  const loadDashboardData = async () => {
    try {
      setStatsLoading(true);
      const data = await systemApi.getDashboard();
      setAttendanceStats(data.attendance_stats);
      setLiveSessions(data.live_sessions);
      setTodaysNumbers(data.todays_numbers);
      setPlatformHealth(data.platform_health);
      setRecentActivity(data.recent_activity);
      // Keep the weekly trend from the existing /system/activity/ endpoint
      const activity = await systemApi.getActivity();
      if (activity.length > 0) setTrendData(activity);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
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
        event_type: currentType !== 'All Events' ? currentType.toUpperCase() : undefined,
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

  // ────────────────────────────────────────────────────────────────────────
  // AUDIT LOGS VIEW
  // ────────────────────────────────────────────────────────────────────────
  if (view === 'logs') {
    return (
      <DashboardPage
        title="Audit Logs"
        description="Track system activities and security events."
        actions={
          <div className="flex gap-2">
            <button
              onClick={() => loadLogs()}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-textMuted bg-surface border border-outline rounded-lg hover:bg-surfaceHigh transition-colors"
            >
              <ArrowsClockwise size={14} weight="bold" />
              Refresh
            </button>
            <button className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-textMuted bg-surface border border-outline rounded-lg hover:bg-surfaceHigh transition-colors">
              <DownloadSimple size={14} weight="bold" />
              Export
            </button>
          </div>
        }
      >
        <SEO title="System Logs | Admin | Presently" description="View and audit system activity logs on Presently." />

        <div className="bg-surface text-text border border-outline rounded-xl overflow-hidden">
          <div className="p-3 border-b border-outline flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={15} />
              <input
                type="text"
                placeholder="Search logs..."
                className="w-full bg-surfaceLow border border-outline rounded-lg pl-9 pr-4 py-2 text-sm text-text placeholder:text-textMuted focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                value={logSearch}
                onChange={(e) => { setLogSearch(e.target.value); loadLogs(1, e.target.value); }}
              />
            </div>
            <select
              className="bg-surfaceLow border border-outline text-textMuted text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 outline-none"
              value={logType}
              onChange={(e) => { setLogType(e.target.value); loadLogs(1, undefined, e.target.value); }}
            >
              <option>All Events</option>
              <option>Auth</option>
              <option>System</option>
              <option>Config</option>
              <option>Security</option>
              <option>Error</option>
            </select>
          </div>

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
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
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
                    <td colSpan={5} className="px-4 py-12 text-center text-textMuted">No logs found.</td>
                  </tr>
                ) : logs.map(log => (
                  <tr key={log.id} className="hover:bg-surfaceHigh transition-colors">
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
                      <span className="text-[10px]">{new Date(log.timestamp).toLocaleDateString()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {logCount > 0 && (
            <div className="px-4 py-3 border-t border-outline flex items-center justify-between">
              <p className="text-xs text-textMuted">
                Showing <span className="font-medium">{logs.length}</span> of <span className="font-medium">{logCount}</span>
              </p>
              <div className="flex gap-2">
                <button
                  disabled={logPage === 1 || logsLoading}
                  onClick={() => loadLogs(logPage - 1)}
                  className="px-3 py-1.5 text-sm font-medium text-textMuted bg-surface border border-outline rounded-lg hover:bg-surfaceHigh transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  disabled={logs.length < 30 || (logPage * 30) >= logCount || logsLoading}
                  onClick={() => loadLogs(logPage + 1)}
                  className="px-3 py-1.5 text-sm font-medium text-textMuted bg-surface border border-outline rounded-lg hover:bg-surfaceHigh transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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

  // ────────────────────────────────────────────────────────────────────────
  // MAIN OPERATIONS CONTROL CENTER
  // ────────────────────────────────────────────────────────────────────────
  return (
    <DashboardPage
      title={`Control Center`}
      description={`Good ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, ${userName.split(' ')[0]}. Here's the live state of your platform.`}
      actions={
        <button
          onClick={loadDashboardData}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-textMuted bg-surface border border-outline rounded-lg hover:bg-surfaceHigh transition-colors"
        >
          <ArrowsClockwise size={14} weight="bold" />
          Refresh
        </button>
      }
    >
      <SEO title="Admin Dashboard | Presently" description="Live operations control center for Presently administrators." />

      {/* ── SECTION 1: HERO STATS ──────────────────────────────────────── */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-textMuted mb-3">Platform Overview</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <HeroStatCard
            label="Registered Students"
            value={attendanceStats.registered_students}
            icon={Users}
            iconColor="text-blue-600 dark:text-blue-400"
            iconBg="bg-blue-50 dark:bg-blue-500/10"
            loading={statsLoading}
          />
          <HeroStatCard
            label="Lecturers"
            value={attendanceStats.lecturers}
            icon={ChalkboardTeacher}
            iconColor="text-violet-600 dark:text-violet-400"
            iconBg="bg-violet-50 dark:bg-violet-500/10"
            loading={statsLoading}
          />
          <HeroStatCard
            label="Institutions"
            value={attendanceStats.institutions}
            icon={Buildings}
            iconColor="text-indigo-600 dark:text-indigo-400"
            iconBg="bg-indigo-50 dark:bg-indigo-500/10"
            loading={statsLoading}
          />
          <HeroStatCard
            label="Active Campuses"
            value={attendanceStats.active_campuses}
            icon={MapPin}
            iconColor="text-teal-600 dark:text-teal-400"
            iconBg="bg-teal-50 dark:bg-teal-500/10"
            loading={statsLoading}
          />
        </div>

        {/* Second row: live operational stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
          <HeroStatCard
            label="Today's Attendance"
            value={attendanceStats.today_attendance}
            icon={CheckSquare}
            iconColor="text-emerald-600 dark:text-emerald-400"
            iconBg="bg-emerald-50 dark:bg-emerald-500/10"
            delta={attendanceStats.today_attendance_delta}
            deltaLabel="vs yesterday"
            loading={statsLoading}
          />
          <HeroStatCard
            label="Live Classes Now"
            value={attendanceStats.live_classes}
            icon={Video}
            iconColor="text-rose-600 dark:text-rose-400"
            iconBg="bg-rose-50 dark:bg-rose-500/10"
            loading={statsLoading}
          />
          <HeroStatCard
            label="GPS Success Rate"
            value={`${attendanceStats.attendance_success_rate}%`}
            icon={NavigationArrow}
            iconColor="text-amber-600 dark:text-amber-400"
            iconBg="bg-amber-50 dark:bg-amber-500/10"
            loading={statsLoading}
          />
          {/* System Health */}
          <div className="bg-surface text-text border border-outline rounded-xl p-4 flex flex-col gap-3 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                attendanceStats.system_health === 'healthy' ? 'bg-emerald-50 dark:bg-emerald-500/10' :
                attendanceStats.system_health === 'degraded' ? 'bg-amber-50 dark:bg-amber-500/10' :
                'bg-red-50 dark:bg-red-500/10'
              }`}>
                <Heartbeat size={18} weight="bold" className={
                  attendanceStats.system_health === 'healthy' ? 'text-emerald-600 dark:text-emerald-400' :
                  attendanceStats.system_health === 'degraded' ? 'text-amber-600 dark:text-amber-400' :
                  'text-red-600 dark:text-red-400'
                } />
              </div>
              <span className={`relative flex h-2.5 w-2.5`}>
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  attendanceStats.system_health === 'healthy' ? 'bg-emerald-400' :
                  attendanceStats.system_health === 'degraded' ? 'bg-amber-400' : 'bg-red-400'
                }`} />
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  attendanceStats.system_health === 'healthy' ? 'bg-emerald-500' :
                  attendanceStats.system_health === 'degraded' ? 'bg-amber-500' : 'bg-red-500'
                }`} />
              </span>
            </div>
            <p className="text-2xl font-semibold text-text tracking-tight capitalize leading-none">
              {attendanceStats.system_health}
            </p>
            <p className="text-xs text-textMuted">System Health</p>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: LIVE CAMPUS ACTIVITY + QUICK ACTIONS ───────────── */}
      <section className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Live Sessions */}
        <div className="lg:col-span-2 bg-surface border border-outline rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-outline flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <h3 className="text-sm font-semibold text-text">Live Campus Activity</h3>
            </div>
            <span className="text-xs text-textMuted bg-surfaceHigh px-2 py-0.5 rounded-full">
              {liveSessions.length} active
            </span>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {liveSessions.map(s => <LiveSessionCard key={s.id} session={s} />)}
            {liveSessions.length === 0 && (
              <div className="col-span-2 py-10 text-center text-textMuted text-sm">No live sessions right now.</div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-surface border border-outline rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-outline">
            <h3 className="text-sm font-semibold text-text">Quick Actions</h3>
          </div>
          <div className="p-3 flex flex-col gap-1">
            {[
              { icon: Buildings, label: 'Create Institution', color: 'text-indigo-500' },
              { icon: MapPin, label: 'Add Venue', color: 'text-teal-500' },
              { icon: UserPlus, label: 'Register Staff', color: 'text-violet-500' },
              { icon: BellRinging, label: 'Broadcast Notification', color: 'text-amber-500' },
              { icon: FileText, label: 'Create Blog Post', color: 'text-blue-500' },
              { icon: XCircle, label: 'Suspend User', color: 'text-red-500' },
              { icon: Export, label: 'Export Report', color: 'text-emerald-500' },
              { icon: HardDrives, label: 'System Backup', color: 'text-textMuted' },
            ].map(({ icon: Icon, label, color }) => (
              <button
                key={label}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surfaceHigh transition-colors text-left w-full group"
              >
                <Icon size={16} weight="bold" className={color} />
                <span className="text-sm text-text group-hover:text-text">{label}</span>
                <ArrowUpRight size={13} className="ml-auto text-textMuted opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 3: TODAY'S NUMBERS ────────────────────────────────── */}
      <section className="mt-6">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-textMuted mb-3">Today's Numbers</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "Checked In", value: todaysNumbers.total_checked_in.toLocaleString(), icon: CheckCircle, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
            { label: "Rejected", value: todaysNumbers.rejected_checkins.toLocaleString(), icon: XCircle, color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-500/10" },
            { label: "GPS Failures", value: todaysNumbers.gps_failures.toLocaleString(), icon: NavigationArrow, color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-500/10" },
            { label: "Late Arrivals", value: todaysNumbers.late_arrivals.toLocaleString(), icon: HourglassHigh, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/10" },
            { label: "Classes Done", value: todaysNumbers.classes_completed.toLocaleString(), icon: Flag, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10" },
            { label: "Avg Attendance", value: `${todaysNumbers.average_attendance_pct}%`, icon: Gauge, color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-500/10" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-surface border border-outline rounded-xl p-4 flex flex-col gap-2">
              <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
                <Icon size={16} weight="bold" className={color} />
              </div>
              <p className="text-xl font-semibold text-text leading-none">{value}</p>
              <p className="text-xs text-textMuted">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION 4: PLATFORM HEALTH ───────────────────────────────── */}
      <section className="mt-6">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-textMuted mb-3">Platform Health</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            {
              label: "Server Uptime",
              value: `${platformHealth.server_uptime_pct}%`,
              icon: Lightning,
              color: "text-emerald-600 dark:text-emerald-400",
              bg: "bg-emerald-50 dark:bg-emerald-500/10",
              subtext: "Last 30 days",
            },
            {
              label: "Live Connections",
              value: platformHealth.realtime_connections.toLocaleString(),
              icon: Pulse,
              color: "text-blue-600 dark:text-blue-400",
              bg: "bg-blue-50 dark:bg-blue-500/10",
              subtext: "Realtime",
            },
            {
              label: "Notif. Queue",
              value: platformHealth.notification_queue.toLocaleString(),
              icon: BellRinging,
              color: platformHealth.notification_queue > 50 ? "text-amber-600 dark:text-amber-400" : "text-teal-600 dark:text-teal-400",
              bg: platformHealth.notification_queue > 50 ? "bg-amber-50 dark:bg-amber-500/10" : "bg-teal-50 dark:bg-teal-500/10",
              subtext: "Pending",
            },
            {
              label: "Emails Sent",
              value: platformHealth.emails_sent_today.toLocaleString(),
              icon: Envelope,
              color: "text-indigo-600 dark:text-indigo-400",
              bg: "bg-indigo-50 dark:bg-indigo-500/10",
              subtext: "Today",
            },
            {
              label: "DB Latency",
              value: `${platformHealth.db_latency_ms} ms`,
              icon: Database,
              color: platformHealth.db_latency_ms > 100 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400",
              bg: platformHealth.db_latency_ms > 100 ? "bg-red-50 dark:bg-red-500/10" : "bg-emerald-50 dark:bg-emerald-500/10",
              subtext: "Avg response",
            },
            {
              label: "Storage Used",
              value: `${platformHealth.storage_used_pct}%`,
              icon: HardDrives,
              color: platformHealth.storage_used_pct > 80 ? "text-red-600 dark:text-red-400" : "text-violet-600 dark:text-violet-400",
              bg: platformHealth.storage_used_pct > 80 ? "bg-red-50 dark:bg-red-500/10" : "bg-violet-50 dark:bg-violet-500/10",
              subtext: "Of quota",
            },
          ].map(({ label, value, icon: Icon, color, bg, subtext }) => (
            <div key={label} className="bg-surface border border-outline rounded-xl p-4 flex flex-col gap-2">
              <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
                <Icon size={16} weight="bold" className={color} />
              </div>
              <p className="text-xl font-semibold text-text leading-none">{value}</p>
              <div>
                <p className="text-xs text-textMuted">{label}</p>
                <p className="text-[10px] text-textMuted opacity-70">{subtext}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── ATTENDANCE TREND CHART ────────────────────────────────────── */}
      <section className="mt-6">
        <div className="bg-surface border border-outline rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-outline flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-sm font-semibold text-text">Attendance Trend</h3>
              <p className="text-xs text-textMuted mt-0.5">Weekly breakdown of check-ins and sessions</p>
            </div>
            {/* Chart tabs */}
            <div className="flex items-center gap-1 bg-surfaceLow border border-outline rounded-lg p-1">
              {(['attendance', 'users', 'traffic'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setChartTab(tab)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-colors ${
                    chartTab === tab
                      ? 'bg-surface text-text shadow-sm'
                      : 'text-textMuted hover:text-text'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <div className="p-5">
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                {chartTab === 'attendance' ? (
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="gradCheckedIn" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradSessions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" strokeOpacity={0.5} />
                    <XAxis dataKey="name" stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} dy={8} />
                    <YAxis stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} width={40} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'var(--color-surface, #18181b)', border: '1px solid var(--color-outline, #27272a)', borderRadius: '8px', fontSize: '12px' }}
                      itemStyle={{ color: 'var(--color-text, #fff)' }}
                    />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }} />
                    <Area type="monotone" dataKey="active" stroke="#10b981" fill="url(#gradCheckedIn)" strokeWidth={2} name="Students Checked In" />
                    <Area type="monotone" dataKey="sessions" stroke="#6366f1" fill="url(#gradSessions)" strokeWidth={2} name="Sessions" />
                  </AreaChart>
                ) : chartTab === 'users' ? (
                  <BarChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" strokeOpacity={0.5} />
                    <XAxis dataKey="name" stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} dy={8} />
                    <YAxis stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} width={40} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'var(--color-surface, #18181b)', border: '1px solid var(--color-outline, #27272a)', borderRadius: '8px', fontSize: '12px' }}
                      itemStyle={{ color: 'var(--color-text, #fff)' }}
                    />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }} />
                    <Bar dataKey="active" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Active Users" />
                  </BarChart>
                ) : (
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="gradTraffic" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" strokeOpacity={0.5} />
                    <XAxis dataKey="name" stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} dy={8} />
                    <YAxis stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} width={40} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'var(--color-surface, #18181b)', border: '1px solid var(--color-outline, #27272a)', borderRadius: '8px', fontSize: '12px' }}
                      itemStyle={{ color: 'var(--color-text, #fff)' }}
                    />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }} />
                    <Area type="monotone" dataKey="sessions" stroke="#f59e0b" fill="url(#gradTraffic)" strokeWidth={2} name="Session Traffic" />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* ── RECENT ACTIVITY FEED ─────────────────────────────────────── */}
      <section className="mt-6">
        <div className="bg-surface border border-outline rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-outline flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-text">Recent Activity</h3>
              <p className="text-xs text-textMuted mt-0.5">Live feed of platform events</p>
            </div>
            <button
              onClick={loadDashboardData}
              className="p-2 text-textMuted hover:text-text rounded-lg hover:bg-surfaceHigh transition-colors"
            >
              <ArrowsClockwise size={14} weight="bold" />
            </button>
          </div>
          <div className="px-5 py-2">
            {recentActivity.map(item => (
              <ActivityItem key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>

    </DashboardPage>
  );
};
