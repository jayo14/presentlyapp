import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  CaretRight,
  Moon,
  ShieldCheck,
  ShieldSlash,
  DeviceMobile
} from '@phosphor-icons/react';
import { useColorMode } from '../../../src/components/ui/color-mode';

export const SettingsMobile: React.FC = () => {
  const navigate = useNavigate();
  const { colorMode, toggleColorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white transition-colors duration-200 min-h-screen">
      <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto overflow-x-hidden border-x border-gray-200 dark:border-gray-800 pb-24">
        {/* TopAppBar */}
        <div className="flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between sticky top-0 z-10 border-b border-gray-200/50 dark:border-gray-800/50">
          <button 
            onClick={() => navigate(-1)}
            className="text-slate-900 dark:text-white flex size-12 shrink-0 items-center justify-start cursor-pointer"
          >
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">App Settings</h2>
        </div>

        <div className="flex flex-col flex-1">
          {/* SectionHeader: Account */}
          <h3 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-6">Account</h3>
          {/* ListItem: Edit Profile */}
          <button className="flex items-center gap-4 bg-background-light dark:bg-background-dark px-4 min-h-14 justify-between hover:bg-gray-100 dark:hover:bg-primary/5 cursor-pointer w-full text-left">
            <div className="flex items-center gap-4">
              <div className="text-slate-900 dark:text-white flex items-center justify-center rounded-lg bg-gray-200 dark:bg-[#4a4121] shrink-0 size-10">
                <User size={20} />
              </div>
              <p className="text-slate-900 dark:text-white text-base font-normal leading-normal flex-1 truncate">Edit Profile</p>
            </div>
            <div className="shrink-0">
              <CaretRight size={20} className="text-gray-400 dark:text-white" />
            </div>
          </button>
          {/* ListItem: Change Phone */}
          <button className="flex items-center gap-4 bg-background-light dark:bg-background-dark px-4 min-h-14 justify-between hover:bg-gray-100 dark:hover:bg-primary/5 cursor-pointer mt-1 w-full text-left">
            <div className="flex items-center gap-4">
              <div className="text-slate-900 dark:text-white flex items-center justify-center rounded-lg bg-gray-200 dark:bg-[#4a4121] shrink-0 size-10">
                <DeviceMobile size={20} />
              </div>
              <p className="text-slate-900 dark:text-white text-base font-normal leading-normal flex-1 truncate">Change Phone Number</p>
            </div>
            <div className="shrink-0">
              <CaretRight size={20} className="text-gray-400 dark:text-white" />
            </div>
          </button>

          {/* SectionHeader: Preferences */}
          <h3 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-6">Appearance</h3>
          {/* ListItem: Theme Toggle */}
          <div className="flex items-center gap-4 bg-background-light dark:bg-background-dark px-4 min-h-14 justify-between">
            <div className="flex items-center gap-4">
              <div className="text-slate-900 dark:text-white flex items-center justify-center rounded-lg bg-gray-200 dark:bg-[#4a4121] shrink-0 size-10">
                <Moon size={20} />
              </div>
              <p className="text-slate-900 dark:text-white text-base font-normal leading-normal flex-1 truncate">Dark Mode</p>
            </div>
            <div className="shrink-0">
              {/* Gold Switch */}
              <button
                onClick={toggleColorMode}
                className={`w-12 h-6 rounded-full relative cursor-pointer shadow-inner transition-colors ${isDarkMode ? 'bg-primary' : 'bg-gray-300'}`}
              >
                <div className={`absolute top-1 bg-white size-4 rounded-full transition-all ${isDarkMode ? 'right-1' : 'left-1'}`}></div>
              </button>
            </div>
          </div>

          {/* SectionHeader: Security */}
          <h3 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-6">Privacy & Security</h3>
          <button className="flex items-center gap-4 bg-background-light dark:bg-background-dark px-4 min-h-14 justify-between hover:bg-gray-100 dark:hover:bg-primary/5 cursor-pointer w-full text-left">
            <div className="flex items-center gap-4">
              <div className="text-slate-900 dark:text-white flex items-center justify-center rounded-lg bg-gray-200 dark:bg-[#4a4121] shrink-0 size-10">
                <ShieldCheck size={20} />
              </div>
              <p className="text-slate-900 dark:text-white text-base font-normal leading-normal flex-1 truncate">Security Settings</p>
            </div>
            <div className="shrink-0">
              <CaretRight size={20} className="text-gray-400 dark:text-white" />
            </div>
          </button>
          <button className="flex items-center gap-4 bg-background-light dark:bg-background-dark px-4 min-h-14 justify-between hover:bg-gray-100 dark:hover:bg-primary/5 cursor-pointer mt-1 w-full text-left">
            <div className="flex items-center gap-4">
              <div className="text-slate-900 dark:text-white flex items-center justify-center rounded-lg bg-gray-200 dark:bg-[#4a4121] shrink-0 size-10">
                <ShieldSlash size={20} />
              </div>
              <p className="text-slate-900 dark:text-white text-base font-normal leading-normal flex-1 truncate">Privacy Policy</p>
            </div>
            <div className="shrink-0">
              <CaretRight size={20} className="text-gray-400 dark:text-white" />
            </div>
          </button>

          {/* Version Info */}
          <div className="mt-auto px-4 py-8 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm font-normal">v1.0.4</p>
          </div>
        </div>
      </div>
    </div>
  );
};
