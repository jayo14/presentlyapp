import React from 'react';
import { motion } from 'framer-motion';
import { 
  Terminal, ShieldWarning, Pulse,
  Users, MapPin, ArrowsClockwise,
  CaretRight, Bell, Sparkle,
  TrendUp
} from '@phosphor-icons/react';

import { useQuery } from '@tanstack/react-query';
import { systemApi } from '../../../services/api/system';
import { useNavigate } from 'react-router-dom';

export const AdminHomeMobile: React.FC = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['systemStats'],
    queryFn: () => systemApi.getStats(),
  });

  if (isLoading) return <div className="p-4 space-y-4">
    <div className="h-40 bg-surface-container animate-pulse rounded-3xl" />
    <div className="grid grid-cols-2 gap-4">
      <div className="h-32 bg-surface-container animate-pulse rounded-3xl" />
      <div className="h-32 bg-surface-container animate-pulse rounded-3xl" />
    </div>
  </div>;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 text-on-surface-variant mb-1">
              <ShieldWarning size={18} weight="duotone" className="text-error" />

              <span className="text-xs font-bold uppercase tracking-widest">Overseer Control</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              Control Center
            </h1>
          </div>
          <button 
            onClick={() => refetch()}
            className="w-12 h-12 rounded-2xl bg-surface-container border border-outline flex items-center justify-center active:scale-90 transition-transform"
          >
             <ArrowsClockwise size={24} weight="bold" />
          </button>
        </div>

        {/* System Health Card */}
        <div className="p-6 rounded-[32px] bg-presently-black text-white shadow-2xl relative overflow-hidden">
           <div className="relative z-10 flex justify-between items-start mb-6">
              <div className="space-y-1">
                 <p className="text-[10px] font-black uppercase tracking-widest text-sungold">System Status</p>
                 <h2 className="text-2xl font-bold">Operational</h2>
              </div>
              <div className="px-3 py-1 bg-success/20 text-success rounded-full text-[10px] font-black uppercase tracking-widest border border-success/30">
                 Stable
              </div>
           </div>

           <div className="relative z-10 grid grid-cols-3 gap-4">
              <div className="text-center">
                 <p className="text-lg font-black">{stats?.total_sessions?.toLocaleString()}</p>
                 <p className="text-[8px] font-bold uppercase tracking-widest text-white/40">Sessions</p>
              </div>
              <div className="text-center border-x border-white/10 px-4">
                 <p className="text-lg font-black">{stats?.active_venues || 12}</p>
                 <p className="text-[8px] font-bold uppercase tracking-widest text-white/40">Venues</p>
              </div>
              <div className="text-center">
                 <p className="text-lg font-black">{stats?.security_alerts || 0}</p>
                 <p className="text-[8px] font-bold uppercase tracking-widest text-white/40">Alerts</p>
              </div>
           </div>

           <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-sungold/10 rounded-full blur-3xl" />
        </div>
      </section>

      {/* Main Stats */}
      <section>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-5 rounded-[28px] bg-surface-container border border-outline flex flex-col justify-between h-40">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Users size={24} weight="duotone" />
            </div>
            <div>
              <p className="text-3xl font-black tracking-tight">{stats?.total_users?.toLocaleString() || '2.5k'}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Total Users</p>
            </div>
          </div>
          
          <div className="p-5 rounded-[28px] bg-surface-container border border-outline flex flex-col justify-between h-40">
            <div className="w-10 h-10 rounded-2xl bg-success/10 flex items-center justify-center text-success">
              <TrendUp size={24} weight="duotone" />
            </div>
            <div>
              <p className="text-3xl font-black tracking-tight">14%</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Week Growth</p>
            </div>
          </div>
        </div>
      </section>

      {/* Management Quick Access */}
      <section className="space-y-4">
        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-on-surface-variant px-1">Management</h2>
        <div className="grid grid-cols-1 gap-3">
           {[
             { label: 'Institutions', icon: Sparkle, path: '/dashboard/institutions', color: 'text-sungold' },
             { label: 'User Directory', icon: Users, path: '/dashboard/users', color: 'text-primary' },
             { label: 'Venue Map', icon: MapPin, path: '/dashboard/venues', color: 'text-error' },
             { label: 'System Config', icon: Terminal, path: '/dashboard/config', color: 'text-on-surface' },
           ].map((item) => (
             <button 
               key={item.label}
               onClick={() => navigate(item.path)}
               className="p-5 rounded-[24px] bg-surface border border-outline shadow-sm flex items-center gap-4 active:scale-[0.98] transition-all"
             >
                <div className={`w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center ${item.color}`}>
                   <item.icon size={24} weight="duotone" />
                </div>
                <div className="flex-1 text-left font-bold">{item.label}</div>
                <CaretRight size={20} weight="bold" className="text-on-surface-variant" />
             </button>
           ))}
        </div>
      </section>

      {/* Live Logs Placeholder */}
      <section>
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-on-surface-variant">System Logs</h2>
          <button className="text-xs font-bold text-sungold">View Terminal</button>
        </div>
        <div className="space-y-3">
          {[1,2,3].map((i) => (
            <div key={i} className="flex gap-4 p-4 rounded-2xl bg-surface-container/30 border border-outline/30">
               <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center shrink-0">
                  <Bell size={18} weight="duotone" className="text-on-surface-variant" />
               </div>
               <div className="min-w-0">
                  <p className="text-xs font-bold truncate">New institution registered: UNILAG</p>
                  <p className="text-[9px] font-bold text-on-surface-variant uppercase mt-1">2 mins ago • System</p>
               </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
