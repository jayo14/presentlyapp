import React, { useState } from 'react';
import { CaretLeft, Bell, Moon, Sun, Lock, ShieldCheck, Globe, CaretRight } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../../SEO';

export const SettingsMobile: React.FC = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);

  // Note: Actual dark mode toggling logic would use the existing ThemeContext.
  // This is purely the UI implementation for the mobile redesign.

  return (
    <div className="flex flex-col min-h-screen bg-off-white dark:bg-presently-black text-presently-black dark:text-white">
      <SEO title="Settings | Presently" />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-off-white/80 dark:bg-presently-black/80 backdrop-blur-xl border-b border-slate-100 dark:border-white/5 pt-safe">
        <div className="h-14 px-4 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white dark:bg-charcoal flex items-center justify-center active:scale-95 transition-transform shadow-sm"
          >
            <CaretLeft size={20} weight="bold" />
          </button>
          <span className="font-bold text-[17px]">Settings</span>
          <div className="w-10" />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6 space-y-6 pb-32">
        {/* Appearance */}
        <section className="space-y-3">
          <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-400 px-2">Appearance</h3>
          <div className="bg-white dark:bg-charcoal rounded-[32px] p-2 shadow-sm">
             <div className="p-4 flex items-center justify-between bg-slate-50 dark:bg-white/5 rounded-[24px]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-charcoal flex items-center justify-center text-sungold shadow-sm shrink-0">
                     {darkMode ? <Moon size={22} weight="fill" /> : <Sun size={22} weight="fill" />}
                  </div>
                  <span className="font-bold text-[16px]">Dark Mode</span>
                </div>
                {/* Custom Toggle Switch */}
                <button 
                  onClick={() => setDarkMode(!darkMode)}
                  className={`w-14 h-8 rounded-full p-1 transition-colors ${darkMode ? 'bg-sungold' : 'bg-slate-200 dark:bg-white/10'}`}
                >
                  <div className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
             </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="space-y-3">
          <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-400 px-2">Notifications</h3>
          <div className="bg-white dark:bg-charcoal rounded-[32px] p-2 shadow-sm space-y-1">
             <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 shrink-0">
                     <Bell size={22} weight="duotone" />
                  </div>
                  <span className="font-bold text-[16px]">Push Notifications</span>
                </div>
                <button 
                  onClick={() => setPushNotifications(!pushNotifications)}
                  className={`w-14 h-8 rounded-full p-1 transition-colors ${pushNotifications ? 'bg-sungold' : 'bg-slate-200 dark:bg-white/10'}`}
                >
                  <div className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${pushNotifications ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
             </div>
             <div className="h-[1px] bg-slate-100 dark:bg-white/5 mx-6" />
             <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 shrink-0">
                     <Globe size={22} weight="duotone" />
                  </div>
                  <span className="font-bold text-[16px]">Email Notifications</span>
                </div>
                <button 
                  onClick={() => setEmailNotifications(!emailNotifications)}
                  className={`w-14 h-8 rounded-full p-1 transition-colors ${emailNotifications ? 'bg-sungold' : 'bg-slate-200 dark:bg-white/10'}`}
                >
                  <div className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${emailNotifications ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
             </div>
          </div>
        </section>

        {/* Security & Privacy */}
        <section className="space-y-3">
          <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-400 px-2">Security</h3>
          <div className="bg-white dark:bg-charcoal rounded-[32px] p-2 shadow-sm space-y-1">
             <button className="w-full p-4 flex items-center justify-between active:bg-slate-50 dark:active:bg-white/5 transition-colors rounded-[24px]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 shrink-0">
                     <Lock size={22} weight="duotone" />
                  </div>
                  <span className="font-bold text-[16px]">Change Password</span>
                </div>
                <CaretRight size={20} weight="bold" className="text-slate-300" />
             </button>
             <div className="h-[1px] bg-slate-100 dark:bg-white/5 mx-6" />
             <button className="w-full p-4 flex items-center justify-between active:bg-slate-50 dark:active:bg-white/5 transition-colors rounded-[24px]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 shrink-0">
                     <ShieldCheck size={22} weight="duotone" />
                  </div>
                  <span className="font-bold text-[16px]">Privacy Settings</span>
                </div>
                <CaretRight size={20} weight="bold" className="text-slate-300" />
             </button>
          </div>
        </section>
      </main>
    </div>
  );
};
