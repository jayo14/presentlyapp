import React from 'react';
import { motion } from 'framer-motion';
import { 
  UserCircle, Envelope, Phone, 
  MapPin, Buildings, Gear, 
  Bell, Question, SignOut,
  Camera, ShareNetwork, CaretRight,
  GraduationCap, BookBookmark, ChartPie
} from '@phosphor-icons/react';
import { useCurrentUser, useLogout } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../../types';

export const ProfileMobile: React.FC = () => {
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();
  const logout = useLogout();

  if (!user) return null;

  const stats = [
    { label: 'Attendance', value: '88%', icon: ChartPie, color: 'text-success' },
    { label: 'Courses', value: user.active_courses_count || 0, icon: BookBookmark, color: 'text-primary' },
    { label: 'Level', value: '400', icon: GraduationCap, color: 'text-sungold' },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header with Share */}
      <div className="flex items-center justify-between">
         <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
         <button className="w-12 h-12 rounded-2xl bg-surface-container border border-outline flex items-center justify-center active:scale-90 transition-transform">
            <ShareNetwork size={24} weight="bold" />
         </button>
      </div>

      {/* Avatar Section */}
      <section className="flex flex-col items-center py-6">
        <div className="relative">
           <div className="w-32 h-32 rounded-[40px] bg-sungold/10 border-4 border-white dark:border-[#0D0D0D] shadow-2xl overflow-hidden">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sungold text-4xl font-bold">
                  {user.full_name?.charAt(0)}
                </div>
              )}
           </div>
           <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-presently-black text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-transform">
              <Camera size={20} weight="fill" />
           </button>
        </div>
        <h2 className="mt-6 text-2xl font-bold">{user.full_name}</h2>
        <p className="text-on-surface-variant font-medium">
          {user.role === UserRole.STUDENT ? 'Undergraduate Student' : 'Senior Faculty'}
        </p>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="p-4 rounded-3xl bg-surface border border-outline shadow-sm flex flex-col items-center text-center">
             <stat.icon size={24} weight="duotone" className={stat.color} />
             <span className="mt-2 text-lg font-black">{stat.value}</span>
             <span className="text-[8px] font-bold uppercase tracking-widest text-on-surface-variant">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Info Section */}
      <section className="space-y-4">
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-on-surface-variant px-1">Information</h3>
        <div className="bg-surface-container rounded-[32px] p-2 space-y-1">
           {[
             { label: 'Email', value: user.email, icon: Envelope },
             { label: 'Phone', value: user.phone || 'Not set', icon: Phone },
             { label: 'Department', value: user.department_name || 'Comp Sci', icon: Buildings },
           ].map((item) => (
             <div key={item.label} className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center text-on-surface-variant">
                   <item.icon size={20} weight="duotone" />
                </div>
                <div className="flex-1 min-w-0">
                   <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest leading-none mb-1">{item.label}</p>
                   <p className="text-sm font-bold truncate">{item.value}</p>
                </div>
             </div>
           ))}
        </div>
      </section>

      {/* Account Settings */}
      <section className="space-y-4">
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-on-surface-variant px-1">Account</h3>
        <div className="space-y-3">
           {[
             { label: 'Settings', icon: Gear, path: '/dashboard/settings' },
             { label: 'Notifications', icon: Bell, path: '/dashboard/notifications' },
             { label: 'Help & Support', icon: Question, path: '/documentation' },
           ].map((item) => (
             <button 
               key={item.label}
               onClick={() => navigate(item.path)}
               className="w-full p-4 rounded-3xl bg-surface border border-outline flex items-center gap-4 active:scale-[0.98] transition-all"
             >
                <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center text-primary">
                   <item.icon size={24} weight="duotone" />
                </div>
                <span className="flex-1 text-left font-bold">{item.label}</span>
                <CaretRight size={20} weight="bold" className="text-on-surface-variant" />
             </button>
           ))}

           <button 
             onClick={() => logout.mutate()}
             className="w-full p-5 rounded-3xl bg-error/5 border border-error/10 text-error flex items-center justify-center gap-3 font-bold active:scale-[0.98] transition-all"
           >
              <SignOut size={24} weight="duotone" />
              Sign Out
           </button>
        </div>
      </section>
    </div>
  );
};
