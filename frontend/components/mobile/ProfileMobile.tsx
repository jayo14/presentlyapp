import React from 'react';
import { motion } from 'framer-motion';
import { 
  UserCircle, Envelope, Phone, 
  MapPin, Buildings, Gear, 
  Bell, Question, SignOut,
  Camera, PencilSimple, CaretRight,
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
    { label: 'Courses', value: user.active_courses_count || 5, icon: BookBookmark, color: 'text-sungold' },
    { label: 'Level', value: '400', icon: GraduationCap, color: 'text-sky-teal' },
  ];

  return (
    <div className="space-y-8 pb-12 pt-4 px-4">
      {/* Header with Edit */}
      <div className="flex items-center justify-between">
         <h1 className="text-[32px] font-bold tracking-tight text-presently-black dark:text-white">Profile</h1>
         <button className="w-12 h-12 rounded-[20px] bg-white dark:bg-charcoal border border-slate-100 dark:border-white/10 flex items-center justify-center active:scale-90 transition-transform shadow-sm">
            <PencilSimple size={24} weight="bold" className="text-presently-black dark:text-white" />
         </button>
      </div>

      {/* Avatar Section */}
      <section className="flex flex-col items-center py-2">
        <div className="relative">
           <div className="w-[120px] h-[120px] rounded-[32px] bg-pale-honey flex items-center justify-center border-4 border-sungold shadow-gold overflow-hidden">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[48px] font-bold text-amber-800">
                  {user.full_name?.charAt(0) || 'U'}
                </span>
              )}
           </div>
           <button className="absolute -bottom-2 -right-2 w-[42px] h-[42px] bg-presently-black dark:bg-white text-white dark:text-presently-black rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-transform">
              <Camera size={20} weight="fill" />
           </button>
        </div>
        <h2 className="mt-6 text-[24px] font-bold text-presently-black dark:text-white">{user.full_name || 'Student Name'}</h2>
        <p className="text-slate-400 font-medium text-[15px] mt-1">
          {user.role === UserRole.STUDENT ? 'Undergraduate Student' : 'Senior Faculty'}
        </p>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="py-5 px-2 rounded-[24px] bg-white dark:bg-charcoal shadow-sm flex flex-col items-center text-center">
             <stat.icon size={28} weight="duotone" className={`${stat.color} mb-3`} />
             <span className="text-[20px] font-black text-presently-black dark:text-white leading-none">{stat.value}</span>
             <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Info Section */}
      <section className="space-y-3">
        <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-400 px-2">Information</h3>
        <div className="bg-white dark:bg-charcoal rounded-[32px] p-2 space-y-1 shadow-sm">
           {[
             { label: 'Email', value: user.email || 'student@university.edu', icon: Envelope },
             { label: 'Phone', value: user.phone || '+1 (555) 000-0000', icon: Phone },
             { label: 'Department', value: user.department_name || 'Computer Science', icon: Buildings },
           ].map((item) => (
             <div key={item.label} className="p-4 flex items-center gap-4 bg-slate-50 dark:bg-white/5 rounded-[24px]">
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-charcoal flex items-center justify-center text-slate-400 shadow-sm shrink-0">
                   <item.icon size={22} weight="duotone" />
                </div>
                <div className="flex-1 min-w-0">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{item.label}</p>
                   <p className="text-[15px] font-bold text-presently-black dark:text-white truncate">{item.value}</p>
                </div>
             </div>
           ))}
        </div>
      </section>

      {/* Account Settings */}
      <section className="space-y-3">
        <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-400 px-2">Account</h3>
        <div className="bg-white dark:bg-charcoal rounded-[32px] p-2 shadow-sm">
           {[
             { label: 'Settings', icon: Gear, path: '/dashboard/settings' },
             { label: 'Notifications', icon: Bell, path: '/dashboard/notifications' },
             { label: 'Help & Support', icon: Question, path: '/documentation' },
           ].map((item, index) => (
             <React.Fragment key={item.label}>
               <button 
                 onClick={() => navigate(item.path)}
                 className="w-full p-4 flex items-center gap-4 active:bg-slate-50 dark:active:bg-white/5 transition-colors rounded-[24px]"
               >
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-presently-black dark:text-white shrink-0">
                     <item.icon size={22} weight="duotone" />
                  </div>
                  <span className="flex-1 text-left font-bold text-[16px] text-presently-black dark:text-white">{item.label}</span>
                  <CaretRight size={20} weight="bold" className="text-slate-300" />
               </button>
               {index < 2 && <div className="h-[1px] bg-slate-100 dark:bg-white/5 mx-6" />}
             </React.Fragment>
           ))}
        </div>

        <button 
          onClick={() => logout.mutate()}
          className="w-full mt-4 p-5 rounded-[24px] bg-soft-coral/10 text-soft-coral flex items-center justify-center gap-3 font-bold active:scale-[0.98] transition-all"
        >
           <SignOut size={22} weight="bold" />
           Sign Out
        </button>
      </section>
    </div>
  );
};
