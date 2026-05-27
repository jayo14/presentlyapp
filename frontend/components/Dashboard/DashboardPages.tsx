import React from 'react';
import {
  ChartLineUp,
  Users,
  Clock,
  ChartBar,
  Bell,
  ArrowsClockwise,
  Buildings,
  ShieldCheck
} from '@phosphor-icons/react';
import { Button } from '../Button';
import { Badge } from '../../src/components/ui/badge';
import { DashboardPage } from '../../src/components/layout-primitives/DashboardPage';
import { ResponsiveGrid } from '../../src/components/layout-primitives/ResponsiveGrid';
import { DashboardCard } from './DashboardCard';

export const StudentDashboardPage: React.FC<{ userName: string }> = ({ userName }) => {
  return (
    <DashboardPage
      title={`Welcome back, ${userName.split(' ')[0]}!`}
      description="Here's your attendance overview for today."
    >
      <div className="space-y-32">
        {/* Stats Grid */}
        <ResponsiveGrid columns={3}>
          <DashboardCard padding="lg" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-on-surface-variant text-sm font-bold uppercase tracking-widest">Attendance Rate</p>
              <div className="w-12 h-12 rounded-2xl bg-sungold/10 flex items-center justify-center">
                <ChartLineUp size={24} weight="bold" className="text-sungold" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-bold text-on-surface tracking-tight">92.4%</p>
              <p className="text-xs text-on-surface-variant font-medium opacity-60">+2.1% from last week</p>
            </div>
          </DashboardCard>

          <DashboardCard padding="lg" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-on-surface-variant text-sm font-bold uppercase tracking-widest">Classes Attended</p>
              <div className="w-12 h-12 rounded-2xl bg-sky-teal/10 flex items-center justify-center">
                <Users size={24} weight="bold" className="text-sky-teal" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-bold text-on-surface tracking-tight">24/26</p>
              <p className="text-xs text-on-surface-variant font-medium opacity-60">2 classes missed</p>
            </div>
          </DashboardCard>

          <DashboardCard padding="lg" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-on-surface-variant text-sm font-bold uppercase tracking-widest">Next Class</p>
              <div className="w-12 h-12 rounded-2xl bg-moss-green/10 flex items-center justify-center">
                <Clock size={24} weight="bold" className="text-moss-green" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-bold text-on-surface tracking-tight">2:00 PM</p>
              <p className="text-xs text-on-surface-variant font-medium opacity-60">Advanced Algorithms</p>
            </div>
          </DashboardCard>
        </ResponsiveGrid>

        {/* Recent Attendance */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-on-surface font-display tracking-tight">Recent Sessions</h2>
          <DashboardCard padding="none" className="overflow-hidden">
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
          </DashboardCard>
        </div>
      </div>
    </DashboardPage>
  );
};

export const LecturerDashboardPage: React.FC<{ userName: string }> = ({ userName }) => {
  return (
    <DashboardPage
      title={`Hello, Dr. ${userName.split(' ').pop()}`}
      description="Manage your sessions and track student attendance."
      action={
        <div className="flex gap-4 flex-wrap">
          <Button className="h-12">+ Create Session</Button>
          <Button variant="outline" className="h-12">Download Report</Button>
          <Button variant="outline" className="h-12">View Analytics</Button>
        </div>
      }
    >
      <div className="space-y-32">
        {/* Stats Grid */}
        <ResponsiveGrid columns={4}>
          {[
            { label: 'Active Sessions', value: '12', icon: ChartBar, color: 'text-sungold', bg: 'bg-sungold/10' },
            { label: 'Students', value: '234', icon: Users, color: 'text-sky-teal', bg: 'bg-sky-teal/10' },
            { label: 'Attendance Rate', value: '94%', icon: ChartLineUp, color: 'text-moss-green', bg: 'bg-moss-green/10' },
            { label: 'Alerts', value: '3', icon: Bell, color: 'text-soft-coral', bg: 'bg-soft-coral/10' },
          ].map((stat, i) => (
            <DashboardCard key={i} padding="lg" className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-on-surface-variant text-sm font-bold uppercase tracking-widest">{stat.label}</p>
                <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon size={24} weight="bold" className={stat.color} />
                </div>
              </div>
              <p className="text-4xl font-bold text-on-surface tracking-tight">{stat.value}</p>
            </DashboardCard>
          ))}
        </ResponsiveGrid>

        {/* Upcoming Sessions */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-on-surface font-display tracking-tight">Upcoming Sessions</h2>
          <DashboardCard padding="none" className="overflow-hidden">
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
          </DashboardCard>
        </div>
      </div>
    </DashboardPage>
  );
};

export const AdminDashboardPage: React.FC<{ userName: string }> = ({ userName }) => {
  return (
    <DashboardPage
      title="Control Center"
      description={
        <div className="space-y-4">
          <Badge className="bg-sungold/20 text-presently-black border-sungold/30 font-bold tracking-widest text-[10px]">SYSTEM OVERSEER</Badge>
          <p>Visibility across every faculty, every day.</p>
        </div>
      }
      action={
        <Button className="h-12">
          <ArrowsClockwise size={18} weight="bold" className="mr-2" />
          Refresh
        </Button>
      }
    >
      <div className="space-y-32">
        {/* System Stats */}
        <ResponsiveGrid columns={4}>
          {[
            { label: 'Total Users', value: '2,543', icon: Users, color: 'text-sky-teal', bg: 'bg-sky-teal/10' },
            { label: 'Active Venues', value: '12', icon: Buildings, color: 'text-moss-green', bg: 'bg-moss-green/10' },
            { label: 'Total Sessions', value: '8,921', icon: ChartLineUp, color: 'text-sungold', bg: 'bg-sungold/10' },
            { label: 'Security Alerts', value: '3', icon: ShieldCheck, color: 'text-soft-coral', bg: 'bg-soft-coral/10' },
          ].map((stat, i) => (
            <DashboardCard key={i} padding="lg" className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-on-surface-variant text-sm font-bold uppercase tracking-widest">{stat.label}</p>
                <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon size={24} weight="bold" className={stat.color} />
                </div>
              </div>
              <p className="text-4xl font-bold text-on-surface tracking-tight">{stat.value}</p>
            </DashboardCard>
          ))}
        </ResponsiveGrid>

        {/* System Activities */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-on-surface font-display tracking-tight">System Activity</h2>
          <DashboardCard padding="none" className="overflow-hidden">
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
          </DashboardCard>
        </div>
      </div>
    </DashboardPage>
  );
};
