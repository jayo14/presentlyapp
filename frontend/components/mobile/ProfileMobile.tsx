import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CaretLeft,
  Gear,
  Bell,
  Question,
  CaretRight,
  SignOut,
  GraduationCap,
  ShieldCheck
} from '@phosphor-icons/react';
import { useCurrentUser, useLogout } from '../../hooks/useAuth';
import { motion } from 'framer-motion';

export const ProfileMobile: React.FC = () => {
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();
  const logout = useLogout();

  const menuItems = [
    { label: 'Settings', icon: Gear, path: '/dashboard/settings', color: 'bg-sungold/15 text-sungold dark:bg-sungold/20' },
    { label: 'Notifications', icon: Bell, path: '/dashboard/notifications', color: 'bg-blue-500/15 text-blue-500 dark:bg-blue-500/20' },
    { label: 'Security & Devices', icon: ShieldCheck, path: '/dashboard/security', color: 'bg-emerald-500/15 text-emerald-500 dark:bg-emerald-500/20' },
    { label: 'Help & Support', icon: Question, path: '/help', color: 'bg-purple-500/15 text-purple-500 dark:bg-purple-500/20' }
  ];

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen pb-36 font-display antialiased">
      {/* Premium Profile Header with Top Banner */}
      <div className="relative w-full overflow-hidden">
        {/* Colorful Elegant Brand Gradient Banner (Taller & abstract glowing circles) */}
        <div className="h-56 w-full bg-gradient-to-tr from-amber-400 via-sungold to-yellow-300 dark:from-amber-500 dark:via-sungold dark:to-yellow-400 relative">
          <div className="absolute inset-0 bg-black/5 dark:bg-black/10 backdrop-blur-[1px]" />
          
          {/* Aesthetic Glowing Blurs for depth */}
          <div className="absolute top-[-30%] left-[-10%] w-[200px] h-[200px] bg-white/20 dark:bg-white/10 rounded-full blur-[50px] pointer-events-none" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[160px] h-[160px] bg-amber-200/40 dark:bg-yellow-300/20 rounded-full blur-[45px] pointer-events-none" />

          {/* Symmetrical Header Back Button */}
          <div className="absolute top-6 left-6 z-20">
            <button
              onClick={() => navigate(-1)}
              className="flex size-12 items-center justify-center rounded-full bg-white/20 dark:bg-black/30 backdrop-blur-lg text-white border border-white/20 active:scale-90 transition-all hover:bg-white/30"
            >
              <CaretLeft size={26} weight="bold" />
            </button>
          </div>
          <div className="absolute top-9 left-0 right-0 text-center z-10">
            <h2 className="text-white text-lg font-black tracking-widest uppercase">My Profile</h2>
          </div>
        </div>

        {/* User Card overlap - Spacious, premium glass card */}
        <div className="px-6 -mt-20 relative z-10">
          <div className="bg-white/90 dark:bg-[#1a170b]/90 backdrop-blur-xl rounded-[36px] p-8 shadow-2xl border border-white/20 dark:border-[#3a321a]/20 flex flex-col items-center">
            {/* Avatar overlapping top with golden gradient glow */}
            <motion.div
              whileTap={{ scale: 0.96 }}
              className="relative -mt-24 mb-5"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-sungold to-yellow-400 rounded-full blur-md scale-105 opacity-80" />
              <div
                className="relative bg-center bg-no-repeat bg-cover rounded-full border-4 border-white dark:border-[#1c180b] shadow-2xl size-32"
                style={{ backgroundImage: `url(${user?.avatar_url || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=256&h=256&auto=format&fit=crop'})` }}
              />
              <div className="absolute bottom-1.5 right-1.5 size-5 bg-green-500 rounded-full border-2 border-white dark:border-[#1c180b] shadow-md animate-pulse" />
            </motion.div>

            {/* Profile Info */}
            <div className="text-center w-full">
              <h2 className="text-slate-900 dark:text-white text-3xl font-black tracking-tight mb-2 leading-tight">
                {user?.full_name || 'Alex Johnson'}
              </h2>
              
              <div className="flex items-center justify-center gap-2 mb-5">
                <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-sungold/15 text-sungold border border-sungold/20">
                  {user?.role?.replace('_', ' ') || 'Student'}
                </span>
                <span className="text-slate-400 dark:text-[#ccbf8e]/70 text-xs font-bold font-mono tracking-wider">
                  {user?.matric_number || 'U2023/4452'}
                </span>
              </div>

              <div className="h-px bg-slate-100 dark:bg-white/5 w-2/3 mx-auto mb-5" />

              <div className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[#2c2614]/40 py-2.5 px-4 rounded-2xl w-fit mx-auto border border-slate-100 dark:border-white/5">
                <GraduationCap size={20} className="text-sungold shrink-0" />
                <span className="font-bold truncate max-w-[220px]">
                  {user?.department || 'Computer Science'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spaced Bento Stats Grid - Modern details, shadows, and spacing */}
      <div className="grid grid-cols-2 gap-5 px-6 mt-8">
        <motion.div 
          whileTap={{ scale: 0.98 }}
          className="flex flex-col gap-3 rounded-[28px] border border-white/20 dark:border-[#3a321a]/20 p-6 bg-white/80 dark:bg-[#1a170b]/60 backdrop-blur-md shadow-md"
        >
          <div className="flex justify-between items-start">
            <p className="text-sungold tracking-tight text-4xl font-black">92.5%</p>
            <span className="size-2 bg-green-500 rounded-full animate-ping mt-1" />
          </div>
          <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-[#ccbf8e]">
            Avg Attendance
          </div>
        </motion.div>
        
        <motion.div 
          whileTap={{ scale: 0.98 }}
          className="flex flex-col gap-3 rounded-[28px] border border-white/20 dark:border-[#3a321a]/20 p-6 bg-white/80 dark:bg-[#1a170b]/60 backdrop-blur-md shadow-md"
        >
          <div className="flex justify-between items-start">
            <p className="text-sungold tracking-tight text-4xl font-black">6</p>
            <div className="size-1.5 bg-sungold rounded-full mt-1" />
          </div>
          <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-[#ccbf8e]">
            Enrolled Courses
          </div>
        </motion.div>
      </div>

      {/* Redesigned Premium Options List - Spacious and modern touch surfaces */}
      <div className="mt-10 px-6 flex flex-col gap-4">
        {menuItems.map((item, index) => (
          <motion.button
            key={item.label}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(item.path)}
            className="flex items-center gap-4 bg-white/80 dark:bg-[#1a170b]/60 backdrop-blur-md px-6 py-5 rounded-[22px] border border-white/20 dark:border-[#3a321a]/10 shadow-sm justify-between hover:border-primary/30 transition-all duration-300"
          >
            <div className="flex items-center gap-4">
              <div className={`flex items-center justify-center rounded-2xl shrink-0 size-12 ${item.color} shadow-inner`}>
                <item.icon size={24} weight="duotone" />
              </div>
              <p className="text-slate-900 dark:text-white text-base font-extrabold tracking-tight">{item.label}</p>
            </div>
            <div className="shrink-0 text-slate-400 dark:text-white/40">
              <CaretRight size={20} weight="bold" className="group-hover:text-primary transition-colors" />
            </div>
          </motion.button>
        ))}
      </div>

      {/* Styled Tactile Logout Button - Clean outline styling */}
      <div className="mt-12 px-6">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => logout.mutate()}
          className="w-full py-5 text-red-500 dark:text-red-400 font-extrabold text-center rounded-[22px] bg-red-500/10 dark:bg-red-500/5 border border-red-500/20 active:bg-red-500/20 transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          <SignOut size={22} weight="bold" />
          Log Out
        </motion.button>
      </div>
    </div>
  );
};
