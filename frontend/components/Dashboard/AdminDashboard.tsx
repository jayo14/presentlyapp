import React, { useState, useEffect } from 'react';
import { Users, Map as MapIcon, ShieldAlert, Activity, RefreshCw, Terminal, Bell, TrendingUp } from 'lucide-react';
import { InstitutionManagement } from '../Admin/InstitutionManagement';
import { UserManagement } from '../Admin/UserManagement';
import { VenueManagement } from '../Admin/VenueManagement';
import { DepartmentManagement } from '../Admin/DepartmentManagement';
import { CourseManagement } from '../Admin/CourseManagement';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { systemApi, SystemStats, SystemActivity, SystemLog } from '../../services/api/system';
import { SEO } from '../SEO';
import { DashboardCard } from './DashboardCard';
import { PageContainer } from './PageContainer';
import { Button } from '../Button';
import { Badge } from '../../src/components/ui/badge';
import { cn } from '../../src/components/ui/utils';

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
      const data = await systemApi.getLogs({ page });
      setLogs(data.results);
    } catch (error) {
      console.error('Failed to load logs');
    }
  };

  if (view === 'institutions') return <InstitutionManagement />;
  if (view === 'users') return <UserManagement />;
  if (view === 'venues') return <VenueManagement />;
  if (view === 'departments') return <DepartmentManagement />;
  if (view === 'courses') return <CourseManagement />;

  return (
    <PageContainer>
      <SEO title="Admin Control Center | Presently" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-2">
        <div>
           <Badge variant="present" className="px-3 py-1 font-bold mb-2 bg-sungold/10 text-sungold border-sungold/20">SYSTEM OVERSEER</Badge>
           <h2 className="text-3xl font-bold text-on-surface tracking-tight">
             System Overview
           </h2>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="rounded-xl border-outline h-11" onClick={loadSystemData}>
              <RefreshCw size={18} className={cn(statsLoading && "animate-spin")} />
           </Button>
           <Button className="rounded-xl bg-on-surface text-background h-11 px-6 font-bold shadow-sm">
              <Terminal size={18} className="mr-2" />
              Diagnostics
           </Button>
        </div>
      </div>

      {/* STATS GRID */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Enrolled', value: systemStats.total_users, icon: Users, color: 'text-sungold', bg: 'bg-sungold/10' },
          { label: 'Active Venues', value: systemStats.active_venues, icon: MapIcon, color: 'text-moss-green', bg: 'bg-moss-green/10' },
          { label: 'Total Sessions', value: systemStats.total_sessions, icon: Activity, color: 'text-sky-teal', bg: 'bg-sky-teal/10' },
          { label: 'Security Alerts', value: systemStats.security_alerts, icon: ShieldAlert, color: 'text-soft-coral', bg: 'bg-soft-coral/10' },
        ].map((stat, i) => (
          <DashboardCard key={i} className="group relative overflow-hidden">
            <div className="flex justify-between items-start">
               <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500", stat.bg, stat.color)}>
                 <stat.icon size={22} />
               </div>
               {stat.label === 'Security Alerts' && stat.value > 0 && (
                 <div className="flex h-2 w-2 rounded-full bg-soft-coral animate-ping" />
               )}
            </div>
            <div className="mt-6">
               <p className="text-3xl font-bold text-on-surface leading-none mb-1 tracking-tight">{stat.value.toLocaleString()}</p>
               <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{stat.label}</p>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500">
              <stat.icon size={100} />
            </div>
          </DashboardCard>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* ACTIVITY CHART */}
         <DashboardCard className="lg:col-span-2" padding="lg">
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-sungold/10 flex items-center justify-center text-sungold">
                    <TrendingUp size={20} />
                 </div>
                 <h3 className="text-xl font-bold text-on-surface tracking-tight">Usage Trends</h3>
               </div>
               <div className="flex bg-surface-highest rounded-lg p-1">
                  <button className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-colors bg-surface shadow-sm">7D</button>
                  <button className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-colors text-on-surface-variant hover:text-on-surface">30D</button>
               </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData}>
                  <defs>
                    <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F5C518" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#F5C518" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '16px',
                      border: '1px solid rgba(0,0,0,0.05)',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                      backgroundColor: 'var(--surface)'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#F5C518"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorUsage)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
         </DashboardCard>

         {/* SYSTEM ALERTS */}
         <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-on-surface tracking-tight">Live Activity</h3>
              <Badge variant="outline" className="text-[10px] font-bold border-outline">REAL-TIME</Badge>
            </div>
            <div className="space-y-4">
               {logs.slice(0, 5).map((log, i) => (
                  <div key={log.id} className="flex gap-4 p-4 bg-surface-highest/30 border border-outline/50 rounded-2xl hover:bg-surface-highest transition-all duration-300 group cursor-default">
                     <div className={cn(
                       "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                       log.level === 'ERROR' ? "bg-soft-coral/10 text-soft-coral" : "bg-sungold/10 text-sungold"
                     )}>
                        <Bell size={18} />
                     </div>
                     <div className="min-w-0">
                        <p className="text-xs font-bold text-on-surface truncate leading-tight mb-1">{log.message}</p>
                        <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest opacity-70">
                           {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {log.user_name || 'System'}
                        </p>
                     </div>
                  </div>
               ))}
               <Button variant="outline" fullWidth className="h-12 border-outline/50 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-surface-highest transition-all">
                  Browse All Logs
               </Button>
            </div>
         </div>
      </div>
    </PageContainer>
  );
};
