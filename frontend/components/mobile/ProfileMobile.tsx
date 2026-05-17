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
    <div className="bg-background-light dark:bg-background-dark min-h-screen pb-32">
      {/* Premium Profile Header with Top Banner */}
      <div className="relative w-full overflow-hidden">
        {/* Colorful Elegant Brand Gradient Banner */}
        <div className="h-44 w-full bg-gradient-to-tr from-amber-400 via-sungold to-yellow-300 dark:from-amber-500 dark:via-sungold dark:to-yellow-400 relative">
          <div className="absolute inset-0 bg-black/5 dark:bg-black/10 backdrop-blur-[1px]" />
          {/* Symmetrical Header Back Button */}
          <div className="absolute top-4 left-4 z-20">
            <button
              onClick={() => navigate(-1)}
              className="flex size-11 items-center justify-center rounded-full bg-white/20 dark:bg-black/20 backdrop-blur-md text-white border border-white/20 active:scale-90 transition-transform"
            >
              <CaretLeft size={24} weight="bold" />
            </button>
          </div>
          <div className="absolute top-7 left-0 right-0 text-center z-10">
            <h2 className="text-white text-lg font-bold tracking-tight">Profile</h2>
          </div>
        </div>

        {/* User Card overlap */}
        <div className="px-6 -mt-16 relative z-10">
          <div className="bg-white dark:bg-surface-dark rounded-[32px] p-6 shadow-xl border border-gray-100 dark:border-white/5 flex flex-col items-center">
            {/* Avatar overlapping top with golden border and shadow */}
            <motion.div
              whileTap={{ scale: 0.96 }}
              className="relative -mt-20 mb-4"
            >
              <div
                className="bg-center bg-no-repeat bg-cover rounded-full border-4 border-white dark:border-surface-dark shadow-2xl size-28"
                style={{ backgroundImage: `url(${user?.avatar_url || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=256&h=256&auto=format&fit=crop'})` }}
              />
              <div className="absolute bottom-1 right-1 size-5 bg-green-500 rounded-full border-2 border-white dark:border-surface-dark shadow-md" />
            </motion.div>

            {/* Profile Info */}
            <div className="text-center w-full">
              <h2 className="text-gray-900 dark:text-white text-2xl font-black tracking-tight mb-1">
                {user?.full_name || 'Alex Johnson'}
              </h2>
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-sungold/15 text-sungold">
                  {user?.role?.replace('_', ' ') || 'Student'}
                </span>
                <span className="text-gray-400 dark:text-[#ccbf8e]/70 text-xs font-bold font-mono">
                  {user?.matric_number || 'U2023/4452'}
                </span>
              </div>
              <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <GraduationCap size={16} className="text-sungold" />
                <span className="font-semibold truncate max-w-[200px]">
                  {user?.department || 'Computer Science'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spaced Bento Stats Grid */}
      <div className="grid grid-cols-2 gap-4 px-6 mt-6">
        <motion.div 
          whileTap={{ scale: 0.98 }}
          className="flex flex-col gap-2 rounded-[24px] border border-gray-100 dark:border-white/5 p-5 bg-white dark:bg-surface-dark shadow-sm"
        >
          <p className="text-sungold tracking-tight text-3xl font-black">92.5%</p>
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-[#ccbf8e]">
            <span className="size-2 bg-green-500 rounded-full" />
            Avg Attendance
          </div>
        </motion.div>
        
        <motion.div 
          whileTap={{ scale: 0.98 }}
          className="flex flex-col gap-2 rounded-[24px] border border-gray-100 dark:border-white/5 p-5 bg-white dark:bg-surface-dark shadow-sm"
        >
          <p className="text-sungold tracking-tight text-3xl font-black">6</p>
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-[#ccbf8e]">
            <span className="size-2 bg-sungold rounded-full" />
            Enrolled Courses
          </div>
        </motion.div>
      </div>

      {/* Redesigned Premium Options List */}
      <div className="mt-8 px-6 flex flex-col gap-3">
        {menuItems.map((item, index) => (
          <motion.button
            key={item.label}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(item.path)}
            className="flex items-center gap-4 bg-white dark:bg-surface-dark px-5 py-4 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm justify-between active:bg-gray-50 dark:active:bg-white/5 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className={`flex items-center justify-center rounded-xl shrink-0 size-11 ${item.color}`}>
                <item.icon size={22} weight="duotone" />
              </div>
              <p className="text-gray-900 dark:text-white text-base font-bold tracking-tight">{item.label}</p>
            </div>
            <div className="shrink-0 text-gray-400 dark:text-white/40">
              <CaretRight size={20} weight="bold" />
            </div>
          </motion.button>
        ))}
      </div>

      {/* Styled Tactile Logout Button */}
      <div className="mt-8 px-6">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => logout.mutate()}
          className="w-full py-4 text-red-600 dark:text-red-400 font-bold text-center rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-900/20 active:bg-red-100 dark:active:bg-red-500/20 transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          <SignOut size={20} weight="bold" />
          Log Out
        </motion.button>
      </div>
    </div>
  );
};
