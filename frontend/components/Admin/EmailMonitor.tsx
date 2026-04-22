import React, { useEffect, useMemo, useState } from 'react';
import { Activity, AlertTriangle, CheckCircle2, Download, Mail, RefreshCw, Search, XCircle } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar, Legend } from 'recharts';

import { SEO } from '../SEO';
import { Button } from '../Button';
import { Input } from '../Input';
import {
  EmailDeliveryLog,
  EmailDeliveryOverview,
  systemApi,
} from '../../services/api/system';
import { toast } from 'sonner';

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
      const data = await systemApi.getEmailOverview(filters);
      setOverview(data);
    } catch (error: any) {
      toast.error('Failed to load email overview', {
        description: error?.response?.data?.error || 'Please try again.',
      });
    } finally {
      setLoadingOverview(false);
    }
  };

  const fetchLogs = async (targetPage: number) => {
    try {
      setLoadingLogs(true);
      const response = await systemApi.getEmailLogs({ ...filters, page: targetPage });
      setLogs(response.results || []);
      setCount(response.count || 0);
      setPage(targetPage);
    } catch (error: any) {
      toast.error('Failed to load email logs', {
        description: error?.response?.data?.error || 'Please try again.',
      });
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    void fetchOverview();
    void fetchLogs(1);
  }, [provider, statusFilter, templateKey, dateFrom, dateTo]);

  const handleSearch = () => {
    void fetchOverview();
    void fetchLogs(1);
  };

  const handleReset = () => {
    setProvider('');
    setStatusFilter('');
    setTemplateKey('');
    setSearch('');
    setDateFrom('');
    setDateTo('');
  };

  const exportUrl = systemApi.getEmailLogsExportUrl(filters);
  const summary = overview?.summary;

  return (
    <div className="space-y-6">
      <SEO title="Email Monitor | Admin | Presently" description="Monitor email provider usage, failures, and quota failover in real time." />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Mail className="w-8 h-8 text-primary" />
          <div>
            <h2 className="font-headline text-2xl font-bold text-text">Email Monitor</h2>
            <p className="text-sm text-textMuted">Delivery health, provider failover, and quota exhaustion tracking.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" className="gap-2" onClick={() => { void fetchOverview(); void fetchLogs(page); }}>
            <RefreshCw className="w-4 h-4" /> Refresh
          </Button>
          <a href={exportUrl}>
            <Button variant="secondary" className="gap-2">
              <Download className="w-4 h-4" /> Export CSV
            </Button>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-surface border border-outline rounded-lg p-4">
          <p className="text-textMuted text-sm">Total Attempts</p>
          <p className="text-2xl font-bold text-text">{summary?.total_attempts ?? 0}</p>
        </div>
        <div className="bg-surface border border-outline rounded-lg p-4">
          <p className="text-textMuted text-sm">Sent</p>
          <p className="text-2xl font-bold text-emerald-500">{summary?.sent_count ?? 0}</p>
        </div>
        <div className="bg-surface border border-outline rounded-lg p-4">
          <p className="text-textMuted text-sm">Failed</p>
          <p className="text-2xl font-bold text-red-500">{summary?.failed_count ?? 0}</p>
        </div>
        <div className="bg-surface border border-outline rounded-lg p-4">
          <p className="text-textMuted text-sm">Throttled</p>
          <p className="text-2xl font-bold text-slate-500">{summary?.throttled_count ?? 0}</p>
        </div>
        <div className="bg-surface border border-outline rounded-lg p-4">
          <p className="text-textMuted text-sm">Success Rate</p>
          <p className="text-2xl font-bold text-primary">{summary?.success_rate ?? 0}%</p>
        </div>
      </div>

      <div className="bg-surface border border-outline rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-textMuted absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            className="pl-9"
            placeholder="Search subject, provider, template"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <select value={provider} onChange={(event) => setProvider(event.target.value)} className="px-3 py-2 rounded-lg bg-surfaceHigh border border-outline text-text">
          <option value="">All Providers</option>
          {(overview?.providers || []).map((item) => (
            <option key={item.provider} value={item.provider}>{item.provider}</option>
          ))}
        </select>

        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="px-3 py-2 rounded-lg bg-surfaceHigh border border-outline text-text">
          <option value="">All Statuses</option>
          <option value="sent">Sent</option>
          <option value="failed">Failed</option>
          <option value="quota_exhausted">Quota Exhausted</option>
          <option value="throttled">Throttled</option>
        </select>

        <Input
          placeholder="Template key"
          value={templateKey}
          onChange={(event) => setTemplateKey(event.target.value)}
        />

        <Input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
        <Input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />

        <div className="flex gap-2 xl:col-span-2">
          <Button className="gap-2" onClick={handleSearch}>
            <Activity className="w-4 h-4" /> Apply Filters
          </Button>
          <Button variant="secondary" className="gap-2" onClick={handleReset}>
            <XCircle className="w-4 h-4" /> Reset
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-surface border border-outline rounded-lg p-4">
          <h3 className="text-base font-semibold text-text mb-3">Daily Delivery Trend</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={overview?.daily_trends || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.15} />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="sent" stroke="#10b981" fill="#10b98133" />
                <Area type="monotone" dataKey="failed" stroke="#ef4444" fill="#ef444433" />
                <Area type="monotone" dataKey="quota_exhausted" stroke="#f59e0b" fill="#f59e0b33" />
                <Area type="monotone" dataKey="throttled" stroke="#64748b" fill="#64748b33" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-surface border border-outline rounded-lg p-4">
          <h3 className="text-base font-semibold text-text mb-3">Provider Performance</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overview?.providers || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.15} />
                <XAxis dataKey="provider" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="sent" fill="#10b981" />
                <Bar dataKey="failed" fill="#ef4444" />
                <Bar dataKey="quota_exhausted" fill="#f59e0b" />
                <Bar dataKey="throttled" fill="#64748b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-surface border border-outline rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-outline flex items-center justify-between">
          <h3 className="text-base font-semibold text-text">Delivery Logs</h3>
          <p className="text-xs text-textMuted">{count} total rows</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surfaceHigh border-b border-outline">
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-textMuted">Status</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-textMuted">Provider</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-textMuted">Template</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-textMuted">Subject</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-textMuted">Recipients</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-textMuted">Duration</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-textMuted">Time</th>
              </tr>
            </thead>
            <tbody>
              {loadingLogs ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-textMuted">Loading logs...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-textMuted">No email logs found for this filter.</td>
                </tr>
              ) : logs.map((log) => (
                <tr key={log.id} className="border-b border-outline/40 last:border-b-0 hover:bg-surfaceHigh/40">
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusClassMap[log.status] || 'bg-surfaceHigh text-textMuted border-outline'}`}>
                      {log.status === 'sent' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : null}
                      {log.status === 'failed' ? <XCircle className="w-3 h-3 mr-1" /> : null}
                      {log.status === 'quota_exhausted' ? <AlertTriangle className="w-3 h-3 mr-1" /> : null}
                      {log.status === 'throttled' ? <Activity className="w-3 h-3 mr-1" /> : null}
                      {log.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-text">{log.provider}</td>
                  <td className="px-4 py-3 text-textMuted">{log.template_key || '-'}</td>
                  <td className="px-4 py-3 text-text">{log.subject || '-'}</td>
                  <td className="px-4 py-3 text-textMuted">{log.recipient_count}</td>
                  <td className="px-4 py-3 text-textMuted">{log.duration_ms ? `${log.duration_ms}ms` : '-'}</td>
                  <td className="px-4 py-3 text-textMuted">{new Date(log.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-outline flex items-center justify-between">
          <p className="text-xs text-textMuted">Page {page}</p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              disabled={page <= 1 || loadingLogs}
              onClick={() => { void fetchLogs(page - 1); }}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              disabled={loadingLogs || page * 30 >= count}
              onClick={() => { void fetchLogs(page + 1); }}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {loadingOverview ? <p className="text-sm text-textMuted">Loading email overview...</p> : null}
    </div>
  );
};
