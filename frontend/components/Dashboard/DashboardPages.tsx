import React from 'react';
import { BarChart3, Users, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '../Button';
import { Badge } from '../../src/components/ui/badge';

export const StudentDashboardPage: React.FC<{ userName: string }> = ({ userName }) => {
  return (
    <div className="space-y-8 max-w-6xl">
      {/* Welcome Section */}
      <section className="space-y-2">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-on-surface">
          Welcome back, {userName.split(' ')[0]}!
        </h1>
        <p className="text-textMuted text-lg">
          Here's your attendance overview for today.
        </p>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 rounded-2xl border border-outline bg-surface p-8 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-textMuted text-sm font-semibold uppercase">Attendance Rate</p>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp size={20} className="text-primary" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-4xl font-bold text-on-surface">92.4%</p>
            <p className="text-xs text-textMuted">+2.1% from last week</p>
          </div>
        </div>

        <div className="col-span-1 rounded-2xl border border-outline bg-surface p-8 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-textMuted text-sm font-semibold uppercase">Classes Attended</p>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users size={20} className="text-primary" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-4xl font-bold text-on-surface">24/26</p>
            <p className="text-xs text-textMuted">2 classes missed</p>
          </div>
        </div>

        <div className="col-span-1 rounded-2xl border border-outline bg-surface p-8 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-textMuted text-sm font-semibold uppercase">Next Class</p>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <AlertCircle size={20} className="text-primary" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-4xl font-bold text-on-surface">2:00 PM</p>
            <p className="text-xs text-textMuted">Advanced Algorithms</p>
          </div>
        </div>
      </section>

      {/* Recent Attendance */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-on-surface">Recent Sessions</h2>
        <div className="rounded-2xl border border-outline bg-surface overflow-hidden">
          <table className="w-full">
            <thead className="bg-surface-container border-b border-outline">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-on-surface">Course</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-on-surface">Date</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-on-surface">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline">
              {[1, 2, 3].map((i) => (
                <tr key={i} className="hover:bg-surface-container/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-on-surface font-medium">Data Structures</td>
                  <td className="px-6 py-4 text-sm text-textMuted">May {10 + i}, 2024</td>
                  <td className="px-6 py-4">
                    <Badge variant="default" className="bg-green-500/20 text-green-600">Present</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export const LecturerDashboardPage: React.FC<{ userName: string }> = ({ userName }) => {
  return (
    <div className="space-y-8 max-w-6xl">
      {/* Welcome Section */}
      <section className="space-y-2">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-on-surface">
          Hello, Dr. {userName.split(' ').pop()}
        </h1>
        <p className="text-textMuted text-lg">
          Manage your sessions and track student attendance.
        </p>
      </section>

      {/* Quick Actions */}
      <section className="flex gap-4 flex-wrap">
        <Button className="h-12">+ Create Session</Button>
        <Button variant="outline" className="h-12">Download Report</Button>
        <Button variant="outline" className="h-12">View Analytics</Button>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Active Sessions', value: '12', icon: BarChart3 },
          { label: 'Students', value: '234', icon: Users },
          { label: 'Attendance Rate', value: '94%', icon: TrendingUp },
          { label: 'Alerts', value: '3', icon: AlertCircle },
        ].map((stat, i) => (
          <div key={i} className="rounded-2xl border border-outline bg-surface p-6 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-textMuted text-xs font-semibold uppercase">{stat.label}</p>
              <stat.icon size={18} className="text-primary" />
            </div>
            <p className="text-3xl font-bold text-on-surface">{stat.value}</p>
          </div>
        ))}
      </section>

      {/* Upcoming Sessions */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-on-surface">Upcoming Sessions</h2>
        <div className="rounded-2xl border border-outline bg-surface overflow-hidden">
          <table className="w-full">
            <thead className="bg-surface-container border-b border-outline">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-on-surface">Course</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-on-surface">Time</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-on-surface">Room</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-on-surface">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline">
              {[1, 2, 3].map((i) => (
                <tr key={i} className="hover:bg-surface-container/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-on-surface font-medium">Database Systems</td>
                  <td className="px-6 py-4 text-sm text-textMuted">Today, 2:00 PM</td>
                  <td className="px-6 py-4 text-sm text-textMuted">Lab 101</td>
                  <td className="px-6 py-4">
                    <Button size="sm" className="h-8">Start</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export const AdminDashboardPage: React.FC<{ userName: string }> = ({ userName }) => {
  return (
    <div className="space-y-8 max-w-7xl">
      {/* Welcome Section */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Badge className="w-fit">SYSTEM OVERSEER</Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-on-surface">
              Control Center
            </h1>
            <p className="text-textMuted text-lg">
              Visibility across every faculty, every day.
            </p>
          </div>
          <Button className="h-12">
            <RefreshCw size={18} className="mr-2" />
            Refresh
          </Button>
        </div>
      </section>

      {/* System Stats */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Users', value: '2,543', icon: Users, color: 'bg-blue-500' },
          { label: 'Active Venues', value: '12', icon: BarChart3, color: 'bg-green-500' },
          { label: 'Total Sessions', value: '8,921', icon: TrendingUp, color: 'bg-purple-500' },
          { label: 'Security Alerts', value: '3', icon: AlertCircle, color: 'bg-red-500' },
        ].map((stat, i) => (
          <div key={i} className="rounded-2xl border border-outline bg-surface p-8 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-textMuted text-sm font-semibold uppercase">{stat.label}</p>
              <div className={`w-12 h-12 rounded-lg ${stat.color} bg-opacity-20 flex items-center justify-center`}>
                <stat.icon size={20} className={stat.color.replace('bg-', 'text-')} />
              </div>
            </div>
            <p className="text-4xl font-bold text-on-surface">{stat.value}</p>
          </div>
        ))}
      </section>

      {/* System Activities */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-on-surface">System Activity</h2>
        <div className="rounded-2xl border border-outline bg-surface overflow-hidden">
          <table className="w-full">
            <thead className="bg-surface-container border-b border-outline">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-on-surface">Action</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-on-surface">User</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-on-surface">Timestamp</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-on-surface">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="hover:bg-surface-container/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-on-surface font-medium">User Login</td>
                  <td className="px-6 py-4 text-sm text-textMuted">admin@presently.io</td>
                  <td className="px-6 py-4 text-sm text-textMuted">May 11, 2:34 PM</td>
                  <td className="px-6 py-4">
                    <Badge variant="default" className="bg-green-500/20 text-green-600">Success</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
