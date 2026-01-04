import React, { useState, useEffect } from 'react';
import { Users, Map as MapIcon, ShieldAlert, Activity, Search, MapPin, Settings, Plus, Edit2, Trash2, CheckCircle, XCircle, FileText, Filter, AlertTriangle, Info, Clock, Download, X, Layers, Building2 } from 'lucide-react';
import { Button } from '../Button';
import { Input } from '../Input';
import { InstitutionManagement } from '../Admin/InstitutionManagement';
import UserManagement from '../Admin/UserManagement';
import VenueManagement from '../Admin/VenueManagement';
import DepartmentManagement from '../Admin/DepartmentManagement';
import CourseManagement from '../Admin/CourseManagement';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { systemApi, SystemStats, SystemActivity, SystemAlert } from '../../services/api/system';

interface AdminDashboardProps {
  userName: string;
  view?: string;
}

// Local Types for Admin Views
interface AdminUser {
    id: string;
    name: string;
    email: string;
    role: 'Student' | 'Lecturer' | 'Admin' | 'Class Rep';
    status: 'Active' | 'Inactive';
    lastActive: string;
}

interface SystemLog {
    id: string;
    action: string;
    user: string;
    role: string;
    timestamp: string;
    type: 'info' | 'warning' | 'error' | 'success';
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ userName, view = 'dashboard' }) => {
  // --- State Management ---
  
  // System Stats State
  const [systemStats, setSystemStats] = useState<SystemStats>({
    total_users: 2543,
    active_venues: 12,
    total_sessions: 8921,
    security_alerts: 3,
  });
  const [activityData, setActivityData] = useState<SystemActivity[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  
  useEffect(() => {
    if (view === 'dashboard') {
      loadSystemData();
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

  // Users State
  const [users, setUsers] = useState<AdminUser[]>([
      { id: '1', name: 'Dr. Sarah Johnson', email: 'sarah.j@uni.edu', role: 'Lecturer', status: 'Active', lastActive: '2 mins ago' },
      { id: '2', name: 'John Doe', email: 'john.d@uni.edu', role: 'Student', status: 'Active', lastActive: '1 hour ago' },
      { id: '3', name: 'Admin User', email: 'admin@uni.edu', role: 'Admin', status: 'Active', lastActive: 'Just now' },
      { id: '4', name: 'Jane Smith', email: 'jane.s@uni.edu', role: 'Student', status: 'Inactive', lastActive: '3 days ago' },
  ]);
  const [userSearch, setUserSearch] = useState('');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  // Logs State (Mock Data)
  const logs: SystemLog[] = [
      { id: '1', action: 'User Login', user: 'Dr. Sarah Johnson', role: 'Lecturer', timestamp: '10:42 AM', type: 'info' },
      { id: '2', action: 'Failed Login Attempt', user: 'Unknown IP', role: '-', timestamp: '10:40 AM', type: 'warning' },
      { id: '3', action: 'System Config Update', user: 'Admin User', role: 'Admin', timestamp: '09:15 AM', type: 'success' },
      { id: '4', action: 'Database Backup', user: 'System', role: 'System', timestamp: '02:00 AM', type: 'info' },
  ];

  // --- Handlers ---

  const handleDeleteUser = (id: string) => {
      if(confirm('Are you sure you want to delete this user?')) {
          setUsers(users.filter(u => u.id !== id));
      }
  };

  const handleSaveUser = (e: React.FormEvent) => {
      e.preventDefault();
      setIsUserModalOpen(false);
      setEditingUser(null);
  };

  const filteredUsers = users.filter(u => 
      u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
      u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  // --- Render Views ---

  // 1. Institution Management View
  if (view === 'institutions') {
    return <InstitutionManagement />;
  }

  // 2. User Management View
  if (view === 'users') {
    return <UserManagement />;
  }

  // 3. Venue Management View
  if (view === 'venues') {
    return <VenueManagement />;
  }

  // 4. Department Management View
  if (view === 'departments') {
    return <DepartmentManagement />;
  }

  // 5. Course Management View
  if (view === 'courses') {
    return <CourseManagement />;
  }

  // 6. Audit Logs View
  if (view === 'logs') {
      return (
          <div className="space-y-6 animate-in fade-in">
              <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">System Logs</h2>
                    <p className="text-zinc-500">Track system activities and security events.</p>
                  </div>
                  <div className="flex gap-2">
                      <Button variant="secondary" size="sm"><Download size={16} className="mr-2"/> Export CSV</Button>
                  </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                  <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex gap-4">
                      <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                          <input type="text" placeholder="Search logs..." className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm text-zinc-900 dark:text-white focus:ring-1 focus:ring-primary outline-none" />
                      </div>
                      <select className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm rounded-lg px-3 focus:ring-primary focus:border-primary outline-none">
                          <option>All Events</option>
                          <option>Info</option>
                          <option>Warnings</option>
                          <option>Errors</option>
                      </select>
                  </div>
                  <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
                      <thead className="bg-zinc-50 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-200">
                          <tr>
                              <th className="p-4 font-medium">Type</th>
                              <th className="p-4 font-medium">Action</th>
                              <th className="p-4 font-medium">User</th>
                              <th className="p-4 font-medium">Role</th>
                              <th className="p-4 font-medium text-right">Timestamp</th>
                          </tr>
                      </thead>
                      <tbody>
                          {logs.map(log => (
                              <tr key={log.id} className="border-b border-zinc-100 dark:border-zinc-800 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                                  <td className="p-4">
                                      {log.type === 'info' && <Info size={18} className="text-blue-500" />}
                                      {log.type === 'warning' && <AlertTriangle size={18} className="text-yellow-500" />}
                                      {log.type === 'error' && <XCircle size={18} className="text-red-500" />}
                                      {log.type === 'success' && <CheckCircle size={18} className="text-green-500" />}
                                  </td>
                                  <td className="p-4 text-zinc-900 dark:text-white font-medium">{log.action}</td>
                                  <td className="p-4">{log.user}</td>
                                  <td className="p-4">
                                      <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-xs">{log.role}</span>
                                  </td>
                                  <td className="p-4 text-right font-mono text-xs">{log.timestamp}</td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      );
  }

  // 6. Default Admin Dashboard Overview
  return (
    <div className="space-y-8 animate-in fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Admin Dashboard</h1>
              <p className="text-zinc-500">System overview and health check.</p>
            </div>
            <div className="flex gap-2">
                <Button variant="secondary">View Reports</Button>
            </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
             {[
                 { label: "Total Users", value: systemStats.total_users.toLocaleString(), icon: Users, color: "text-blue-500" },
                 { label: "Active Venues", value: systemStats.active_venues.toString(), icon: MapIcon, color: "text-green-500" },
                 { label: "Total Sessions", value: systemStats.total_sessions.toLocaleString(), icon: Activity, color: "text-yellow-500" },
                 { label: "Security Alerts", value: systemStats.security_alerts.toString(), icon: ShieldAlert, color: "text-red-500" },
             ].map((stat, i) => (
                 <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-xl flex items-center justify-between shadow-sm">
                     <div>
                         <p className="text-sm text-zinc-500">{stat.label}</p>
                         <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">{stat.value}</p>
                     </div>
                     <div className={`p-3 bg-zinc-100 dark:bg-zinc-950 rounded-lg ${stat.color}`}>
                         <stat.icon size={20} />
                     </div>
                 </div>
             ))}
        </div>

        <div className="grid grid-cols-1 gap-8">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
                <h3 className="font-bold text-zinc-900 dark:text-white mb-4">System Activity</h3>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={activityData}>
                            <defs>
                                <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ffca0d" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#ffca0d" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                            <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                            <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Area type="monotone" dataKey="active" stroke="#ffca0d" fillOpacity={1} fill="url(#colorActive)" strokeWidth={2} name="Active Users" />
                            <Area type="monotone" dataKey="sessions" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSessions)" strokeWidth={2} name="Sessions" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    </div>
  );
};