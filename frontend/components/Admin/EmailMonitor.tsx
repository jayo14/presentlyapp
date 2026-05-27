import React, { useEffect, useMemo, useState } from 'react';
import { Activity, AlertTriangle, CheckCircle2, Download, Mail, RefreshCw, Search, XCircle } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar, Legend } from 'recharts';

import { SEO } from '../SEO';
import { Button } from '../Button';
import {
  EmailDeliveryLog,
  EmailDeliveryOverview,
  systemApi,
} from '../../services/api/system';
import { toast } from 'sonner';
import { DashboardPage } from '../../src/components/layout-primitives/DashboardPage';
import { ModernCard } from '../ModernCard';
import { ResponsiveGrid } from '../../src/components/layout-primitives/ResponsiveGrid';
import { Badge } from '../../src/components/ui/badge';
import { cn } from '../../src/components/ui/utils';

const statusClassMap: Record<string, string> = {
  sent: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
  failed: 'bg-red-500/15 text-red-500 border-red-500/30',
  quota_exhausted: 'bg-amber-500/15 text-amber-500 border-amber-500/30',
  throttled: 'bg-slate-500/15 text-slate-500 border-slate-500/30',
};

export const EmailMonitor: React.FC = () => {
  const [overview, setOverview] = useState<EmailDeliveryOverview | null>(null);
  const [logs, setLogs] = useState<EmailDeliveryLog[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const [provider, setProvider] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [templateKey, setTemplateKey] = useState('');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filters = useMemo(
    () => ({
      provider: provider || undefined,
      status: statusFilter || undefined,
      template_key: templateKey || undefined,
      search: search || undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
    }),
    [provider, statusFilter, templateKey, search, dateFrom, dateTo],
  );

  const fetchOverview = async () => {
    try {
      setLoadingOverview(true);
      const data = await systemApi.getEmailDeliveryOverview();
      setOverview(data);
    } catch (err) {
      toast.error('Failed to load email overview');
    } finally {
      setLoadingOverview(false);
    }
  };

  const fetchLogs = async (p = 1) => {
    try {
      setLoadingLogs(true);
      const data = await systemApi.getEmailDeliveryLogs(p, 20, filters);
      setLogs(data.results);
      setCount(data.count);
      setPage(p);
    } catch (err) {
      toast.error('Failed to load delivery logs');
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  useEffect(() => {
    fetchLogs(1);
  }, [filters]);

  const handleRefresh = () => {
    fetchOverview();
    fetchLogs(page);
  };

  return (
    <DashboardPage
      title="Communication Hub"
      description="Monitor system-wide email delivery, template performance, and provider health."
      seoTitle="Email Monitor | Admin"
      action={
        <div className="flex gap-4">
           <Button variant="outline" size="lg" className="h-16 px-8">
             <Download size={20} className="mr-2" /> Export Logs
           </Button>
           <Button size="lg" className="h-16 px-8 shadow-gold" onClick={handleRefresh}>
             <RefreshCw size={20} className={cn("mr-2", loadingOverview && "animate-spin")} /> Refresh Data
           </Button>
        </div>
      }
    >
      <div className="space-y-16 lg:space-y-32">
        {/* Metric Cards */}
        <ResponsiveGrid columns={4} gap={24}>
           {[
             { label: 'Total Volume', value: overview?.total_sent || 0, icon: Mail, color: 'text-sky-teal', bg: 'bg-sky-teal/10' },
             { label: 'Success Rate', value: `${overview?.success_rate || 0}%`, icon: CheckCircle2, color: 'text-moss-green', bg: 'bg-moss-green/10' },
             { label: 'Delivery Failures', value: overview?.total_failed || 0, icon: XCircle, color: 'text-soft-coral', bg: 'bg-soft-coral/10' },
             { label: 'Active Alerts', value: overview?.total_quota_exhausted || 0, icon: AlertTriangle, color: 'text-sungold', bg: 'bg-sungold/10' }
           ].map((stat, i) => (
             <ModernCard key={i} padding="lg" className="flex items-center gap-6 border-outline/30 shadow-sm">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center", stat.bg, stat.color)}>
                  <stat.icon size={24} weight="bold" />
                </div>
                <div>
                   <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{stat.label}</p>
                   <p className="text-2xl font-bold text-presently-black mt-0.5 tabular-nums">{stat.value}</p>
                </div>
             </ModernCard>
           ))}
        </ResponsiveGrid>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
           <ModernCard padding="lg" className="lg:col-span-2 border-outline/30 shadow-sm">
              <div className="flex items-center justify-between mb-10">
                 <h3 className="font-display text-2xl font-bold text-presently-black">Delivery Trends</h3>
                 <Badge variant="secondary">LAST 7 DAYS</Badge>
              </div>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={overview?.delivery_trend || []}>
                    <defs>
                      <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2E9CCA" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#2E9CCA" stopOpacity={0}/>
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
                      contentStyle={{ borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    />
                    <Area type="monotone" dataKey="sent" stroke="#2E9CCA" strokeWidth={3} fillOpacity={1} fill="url(#colorSent)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
           </ModernCard>

           <ModernCard padding="lg" className="border-outline/30 shadow-sm">
              <div className="flex items-center justify-between mb-10">
                 <h3 className="font-display text-2xl font-bold text-presently-black">Providers</h3>
              </div>
              <div className="space-y-8">
                 {overview?.by_provider.map((p, i) => (
                    <div key={i} className="space-y-3">
                       <div className="flex justify-between items-end">
                          <p className="text-sm font-bold text-presently-black uppercase tracking-widest">{p.provider || 'UNKNOWN'}</p>
                          <p className="text-xs font-bold text-on-surface-variant tabular-nums">{p.count} emails</p>
                       </div>
                       <div className="h-2 w-full bg-surface-highest rounded-full overflow-hidden">
                          <div
                            className="h-full bg-sungold"
                            style={{ width: `${(p.count / (overview?.total_sent || 1)) * 100}%` }}
                          />
                       </div>
                    </div>
                 ))}
              </div>
           </ModernCard>
        </div>

        {/* Logs Table */}
        <div className="space-y-8">
           <div className="flex items-center justify-between border-b border-outline/40 pb-6">
              <h3 className="font-display text-3xl font-bold text-presently-black">Real-time Logs</h3>
              <div className="flex items-center gap-4">
                 <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40" size={16} />
                    <input
                      placeholder="Search recipient..."
                      className="h-10 pl-10 pr-4 bg-white border border-outline/60 rounded-xl text-xs font-bold focus:ring-4 focus:ring-sungold/10 outline-none transition-all"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                 </div>
              </div>
           </div>

           <ModernCard padding="none" className="overflow-hidden border-outline/30 shadow-xl">
              <div className="overflow-x-auto no-scrollbar">
                 <table className="w-full border-collapse">
                    <thead>
                       <tr className="bg-slate-50/50 border-b border-outline/40">
                          <th className="px-10 py-6 text-left text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">Timestamp</th>
                          <th className="px-10 py-6 text-left text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">Recipient</th>
                          <th className="px-10 py-6 text-left text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">Template</th>
                          <th className="px-10 py-6 text-left text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">Provider</th>
                          <th className="px-10 py-6 text-right text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">Status</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-outline/30">
                       {loadingLogs && logs.length === 0 ? (
                         Array.from({ length: 5 }).map((_, i) => (
                           <tr key={i} className="animate-pulse">
                              <td colSpan={5} className="px-10 py-8 h-20 bg-slate-50/20" />
                           </tr>
                         ))
                       ) : (
                         logs.map((log) => (
                           <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-10 py-6">
                                 <p className="text-xs font-bold text-presently-black tabular-nums">
                                   {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                 </p>
                                 <p className="text-[10px] text-on-surface-variant font-bold uppercase opacity-60">
                                   {new Date(log.created_at).toLocaleDateString()}
                                 </p>
                              </td>
                              <td className="px-10 py-6">
                                 <p className="text-sm font-bold text-presently-black">{log.recipient}</p>
                              </td>
                              <td className="px-10 py-6">
                                 <Badge variant="secondary" className="font-bold tracking-wider">{log.template_key}</Badge>
                              </td>
                              <td className="px-10 py-6">
                                 <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{log.provider}</p>
                              </td>
                              <td className="px-10 py-6 text-right">
                                 <span className={cn(
                                   "inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                   statusClassMap[log.status] || 'bg-slate-100 text-slate-500'
                                 )}>
                                    {log.status.replace('_', ' ')}
                                 </span>
                              </td>
                           </tr>
                         ))
                       )}
                    </tbody>
                 </table>
              </div>

              <div className="p-8 bg-slate-50/50 border-t border-outline/40 flex items-center justify-between">
                 <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                   Page {page} of {Math.ceil(count / 20)} • {count} records found
                 </p>
                 <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-10 px-4"
                      disabled={page === 1}
                      onClick={() => fetchLogs(page - 1)}
                    >
                      Prev
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-10 px-4"
                      disabled={page * 20 >= count}
                      onClick={() => fetchLogs(page + 1)}
                    >
                      Next
                    </Button>
                 </div>
              </div>
           </ModernCard>
        </div>
      </div>
    </DashboardPage>
  );
};

export default EmailMonitor;
