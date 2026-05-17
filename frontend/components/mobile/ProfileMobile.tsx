import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CaretLeft,
  Settings,
  Bell,
  Question,
  CaretRight,
  User,
  SignOut
} from '@phosphor-icons/react';
import { useCurrentUser, useLogout } from '../../hooks/useAuth';

export const ProfileMobile: React.FC = () => {
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();
  const logout = useLogout();

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen pb-24">
      <div className="relative flex h-full min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden">
        {/* TopAppBar */}
        <div className="flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-900 dark:text-white flex size-12 shrink-0 items-center justify-center rounded-full active:bg-gray-200 dark:active:bg-white/10 transition-colors"
          >
            <CaretLeft size={24} weight="bold" />
          </button>
          <h2 className="text-gray-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">Profile</h2>
        </div>

        {/* ProfileHeader */}
        <div className="flex p-4">
          <div className="flex w-full flex-col gap-4 items-center">
            <div className="flex gap-4 flex-col items-center">
              <div
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full border-4 border-primary/20 min-h-32 w-32"
                style={{ backgroundImage: `url(${user?.profile_picture || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=256&h=256&auto=format&fit=crop'})` }}
              />
              <div className="flex flex-col items-center justify-center">
                <p className="text-gray-900 dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em] text-center">{user?.full_name || 'Alex Johnson'}</p>
                <p className="text-gray-600 dark:text-[#ccbf8e] text-base font-normal leading-normal text-center">U2023-4452</p>
              </div>
            </div>
          </div>
        </div>

        {/* ProfileStats */}
        <div className="flex flex-wrap gap-3 px-4 py-3">
          <div className="flex min-w-[111px] flex-1 basis-[fit-content] flex-col gap-2 rounded-xl border border-gray-200 dark:border-[#6a5d2f] p-4 items-center text-center bg-white dark:bg-transparent">
            <p className="text-primary tracking-light text-2xl font-bold leading-tight">92%</p>
            <div className="flex items-center gap-2">
              <p className="text-gray-600 dark:text-[#ccbf8e] text-sm font-normal leading-normal">Avg Attendance</p>
            </div>
          </div>
          <div className="flex min-w-[111px] flex-1 basis-[fit-content] flex-col gap-2 rounded-xl border border-gray-200 dark:border-[#6a5d2f] p-4 items-center text-center bg-white dark:bg-transparent">
            <p className="text-primary tracking-light text-2xl font-bold leading-tight">6</p>
            <div className="flex items-center gap-2">
              <p className="text-gray-600 dark:text-[#ccbf8e] text-sm font-normal leading-normal">Courses</p>
            </div>
          </div>
        </div>

        {/* ListItems */}
        <div className="mt-4 flex flex-col gap-1">
          {[
            { label: 'Settings', icon: Settings, path: '/dashboard/settings' },
            { label: 'Notifications', icon: Bell, path: '/dashboard/notifications' },
            { label: 'Help & Support', icon: Question, path: '/help' }
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className="flex items-center gap-4 bg-background-light dark:bg-background-dark px-4 min-h-16 justify-between active:bg-gray-100 dark:active:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="text-primary flex items-center justify-center rounded-lg bg-primary/10 shrink-0 size-11">
                  <item.icon size={22} weight="duotone" />
                </div>
                <p className="text-gray-900 dark:text-white text-base font-medium leading-normal flex-1 truncate">{item.label}</p>
              </div>
              <div className="shrink-0 text-gray-400 dark:text-white/50">
                <CaretRight size={20} />
              </div>
            </button>
          ))}
        </div>

        {/* Logout Button */}
        <div className="mt-8 px-4">
          <button
            onClick={() => logout.mutate()}
            className="w-full py-4 text-red-500 dark:text-red-400 font-semibold text-center rounded-xl bg-red-50 dark:bg-red-500/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <SignOut size={20} weight="bold" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};
