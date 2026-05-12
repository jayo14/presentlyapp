import React, { useState, useEffect } from 'react';
import { Users, Map as MapIcon, ShieldAlert, Activity, Building2, TrendingUp, RefreshCw, Terminal, Bell } from 'lucide-react';
import { InstitutionManagement } from '../Admin/InstitutionManagement';
import { UserManagement } from '../Admin/UserManagement';
import { VenueManagement } from '../Admin/VenueManagement';
import { DepartmentManagement } from '../Admin/DepartmentManagement';
import { CourseManagement } from '../Admin/CourseManagement';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { systemApi, SystemStats, SystemActivity, SystemLog } from '../../services/api/system';
import { SEO } from '../SEO';
import { ModernCard } from '../ModernCard';
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
    <div className="space-y-10 max-w-7xl mx-auto pb-20">
      <SEO title="Admin Control Center | Presently" />

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
           <Badge variant="present" className="px-3 py-1 font-bold">SYSTEM OVERSEER</Badge>
           <h1 className="font-display text-4xl md:text-5xl font-bold text-on-surface">
             Control Center
           </h1>
           <p className="text-on-surface-variant font-medium text-lg">
             Visibility across every faculty, every day.
           </p>
        </div>
        <div className="flex gap-3">
           <Button variant="outline" className="h-14 px-6 border-outline">
              <RefreshCw size={20} className={cn("mr-2", statsLoading && "animate-spin")} />
              Refresh
           </Button>
           <Button className="h-14 px-8 shadow-gold" onClick={() => loadSystemData()}>
              <Terminal size={20} className="mr-2" />
              Run Diagnostics
           </Button>
        </div>
      </header>

      {/* STATS GRID */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Enrolled', value: systemStats.total_users, icon: Users, variant: 'default' as const },
          { label: 'Active Venues', value: systemStats.active_venues, icon: MapIcon, variant: 'excused' as const },
          { label: 'Total Sessions', value: systemStats.total_sessions, icon: Activity, variant: 'present' as const },
          { label: 'Security Alerts', value: systemStats.security_alerts, icon: ShieldAlert, variant: 'absent' as const },
        ].map((stat, i) => (
          <ModernCard key={i} padding="md" className="group hover:border-primary/30 transition-all bg-surface">
            <div className="flex justify-between items-start mb-4">
               <div className="w-12 h-12 rounded-xl bg-surfaceHigh flex items-center justify-center text-on-surface border border-outline group-hover:bg-primary/10 transition-colors">
                 <stat.icon size={24} />
               </div>
               {stat.variant === 'absent' && stat.value > 0 && <Badge variant="absent" className="animate-pulse">CRITICAL</Badge>}
            </div>
            <div>
               <p className="font-display text-4xl font-bold text-on-surface leading-none mb-1">{stat.value.toLocaleString()}</p>
               <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">{stat.label}</p>
            </div>
          </ModernCard>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* ACTIVITY CHART */}
         <ModernCard className="lg:col-span-2 overflow-hidden" padding="lg">
            <div className="flex items-center justify-between mb-8">
               <h3 className="font-display text-2xl font-bold text-on-surface">Usage Trends</h3>
               <div className="flex gap-2">
                  <Badge variant="outline">7 Days</Badge>
                  <Badge variant="secondary">30 Days</Badge>
               </div>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData}>
                  <defs>
                    <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F5C518" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#F5C518" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#64748B' }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#64748B' }}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#F5C518"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorUsage)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
         </ModernCard>

         {/* SYSTEM ALERTS */}
         <div className="space-y-6">
            <h3 className="font-display text-2xl font-bold text-on-surface">Live Feed</h3>
            <div className="space-y-4">
               {logs.slice(0, 6).map((log, i) => (
                  <div key={log.id} className="flex gap-4 p-4 bg-surface border border-outline rounded-2xl hover:bg-surfaceHigh transition-all cursor-default">
                     <div className={cn(
                       "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                       log.level === 'ERROR' ? "bg-soft-coral/10 text-soft-coral" : "bg-sungold/10 text-sungold"
                     )}>
                        <Bell size={18} />
                     </div>
                     <div className="min-w-0">
                        <p className="text-xs font-bold text-on-surface truncate">{log.message}</p>
                        <p className="text-[10px] text-on-surface-variant font-medium mt-1 uppercase tracking-widest">
                           {new Date(log.timestamp).toLocaleTimeString()} • {log.user_name || 'System'}
                        </p>
                     </div>
                  </div>
               ))}
               <Button variant="outline" fullWidth className="h-12 border-outline text-xs font-bold uppercase tracking-widest">
                  View Full Logs
               </Button>
            </div>
         </div>
      </div>
    </div>
  );
};
