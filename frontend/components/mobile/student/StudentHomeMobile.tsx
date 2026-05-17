import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  QrCode,
  Check,
  X,
  ArrowRight
} from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { useCurrentUser } from '../../../hooks/useAuth';

export const StudentHomeMobile: React.FC = () => {
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display antialiased pb-24 min-h-screen">
      {/* Top App Bar */}
      <header className="sticky top-0 z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center px-4 py-3 justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                className="bg-center bg-no-repeat bg-cover rounded-full size-10 border-2 border-primary"
                style={{ backgroundImage: `url(${user?.avatar_url || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=256&h=256&auto=format&fit=crop'})` }}
              />
              <div className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full border-2 border-background-light dark:border-background-dark"></div>
            </div>
            <div>
              <p className="text-xs text-text-secondary-light dark:text-text-secondary font-medium">Welcome back</p>
              <h2 className="text-lg font-bold leading-tight tracking-tight">Hello, {user?.full_name?.split(' ')[0] || 'Alex'}!</h2>
            </div>
          </div>
          <button
            onClick={() => navigate('/dashboard/notifications')}
            className="relative p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <Bell size={24} />
            <span className="absolute top-2.4 right-2.4 size-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col gap-8 px-6 py-5">
        {/* Live Class Card */}
        <section>
          <div className="flex items-center justify-between mb-2 px-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary">Happening Now</h3>
            <span className="flex items-center gap-1.5 text-xs font-bold text-red-500 animate-pulse">
              <span className="size-2 bg-red-500 rounded-full"></span>
              LIVE
            </span>
          </div>
          <div className="relative overflow-hidden rounded-[28px] bg-surface-light dark:bg-surface-dark shadow-xl border border-gray-100 dark:border-white/5">
            {/* Background Image Overlay */}
            <div
              className="absolute inset-0 opacity-10 dark:opacity-20 pointer-events-none"
              style={{
                backgroundImage: 'url("https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1000&auto=format&fit=crop")',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
            <div className="relative p-6 flex flex-col gap-5 z-10">
              <div className="flex justify-between items-start">
                <div>
                  <div className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary/20 text-yellow-700 dark:text-yellow-400 text-xs font-bold mb-2">
                    Lecture Hall B
                  </div>
                  <h2 className="text-2xl font-bold leading-tight">CS101 - Algorithm Design</h2>
                  <p className="text-text-secondary-light dark:text-text-secondary text-sm mt-1">Prof. Sarah Jenkins • 10:00 AM - 11:30 AM</p>
                </div>
                <div className="bg-surface-highlight/30 rounded-lg p-2 text-center min-w-[60px]">
                  <span className="block text-xs uppercase opacity-70">Rem</span>
                  <span className="block text-lg font-bold font-mono">15m</span>
                </div>
              </div>
              <div className="mt-2">
                <button
                  onClick={() => navigate('/dashboard/scanner')}
                  className="w-full relative group overflow-hidden rounded-xl bg-primary hover:bg-yellow-400 text-black font-bold h-12 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(249,196,6,0.3)] transition-all transform active:scale-[0.98]"
                >
                  <QrCode size={24} weight="bold" />
                  <span>Mark Attendance</span>
                  {/* Shine effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover:animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent z-20 w-1/2 h-full skew-x-12"></div>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Attendance Summary */}
        <section>
          <h3 className="text-lg font-bold px-1 mb-3">Attendance Summary</h3>
          <div className="rounded-[28px] bg-surface-light dark:bg-surface-dark shadow-md p-6 border border-gray-100 dark:border-white/5">
            <div className="flex flex-col gap-8 items-center">
              {/* Circular Progress */}
              <div className="relative size-36 shrink-0">
                <svg className="size-full rotate-[-90deg]" viewBox="0 0 100 100">
                  {/* Track */}
                  <circle
                    className="text-gray-200 dark:text-surface-highlight"
                    cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8"
                  />
                  {/* Progress: 90.5% */}
                  {/* Circumference = 2 * PI * 40 = ~251.2 */}
                  {/* 90.5% of 251.2 = ~227.3 */}
                  <circle
                    className="text-primary transition-all duration-1000 ease-out"
                    cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8"
                    strokeDasharray="227.3 251.2" strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold tracking-tight">90.5%</span>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-text-secondary-light dark:text-text-secondary">Overall</span>
                </div>
              </div>
              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3 w-full">
                <div className="flex flex-col gap-1.5 items-center justify-center p-4 rounded-2xl bg-background-light dark:bg-background-dark border border-gray-200 dark:border-surface-highlight">
                  <span className="text-2xl font-bold text-slate-800 dark:text-white">42</span>
                  <span className="text-xs text-text-secondary-light dark:text-text-secondary">Classes</span>
                </div>
                <div className="flex flex-col gap-1.5 items-center justify-center p-4 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30">
                  <span className="text-2xl font-bold text-green-600 dark:text-green-400">38</span>
                  <span className="text-xs text-green-700/70 dark:text-green-400/70">Attended</span>
                </div>
                <div className="flex flex-col gap-1.5 items-center justify-center p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30">
                  <span className="text-2xl font-bold text-red-600 dark:text-red-400">4</span>
                  <span className="text-xs text-red-700/70 dark:text-red-400/70">Missed</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Activity List */}
        <section>
          <div className="flex justify-between items-end mb-3 px-1">
            <h3 className="text-lg font-bold">Recent Activity</h3>
            <button
              onClick={() => navigate('/dashboard/analytics')}
              className="text-sm font-medium text-primary hover:text-yellow-500"
            >
              View All
            </button>
          </div>
          <div className="flex flex-col gap-4">
            {/* Item 1 */}
            <div className="group flex items-center justify-between p-5 rounded-2xl bg-surface-light dark:bg-surface-dark shadow-sm border border-gray-100 dark:border-white/5 hover:border-primary/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center">
                  <Check size={20} weight="bold" />
                </div>
                <div className="flex flex-col">
                  <p className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-primary transition-colors">ENG202 - Adv. Composition</p>
                  <p className="text-xs text-text-secondary-light dark:text-text-secondary">Today, 09:00 AM</p>
                </div>
              </div>
              <div className="px-2.5 py-1 rounded-lg text-xs font-bold bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400">
                Present
              </div>
            </div>
            {/* Item 2 */}
            <div className="group flex items-center justify-between p-5 rounded-2xl bg-surface-light dark:bg-surface-dark shadow-sm border border-gray-100 dark:border-white/5 hover:border-primary/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center">
                  <Check size={20} weight="bold" />
                </div>
                <div className="flex flex-col">
                  <p className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-primary transition-colors">HIS101 - World History</p>
                  <p className="text-xs text-text-secondary-light dark:text-text-secondary">Yesterday, 2:00 PM</p>
                </div>
              </div>
              <div className="px-2.5 py-1 rounded-lg text-xs font-bold bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400">
                Present
              </div>
            </div>
            {/* Item 3 */}
            <div className="group flex items-center justify-between p-5 rounded-2xl bg-surface-light dark:bg-surface-dark shadow-sm border border-gray-100 dark:border-white/5 hover:border-primary/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center">
                  <X size={20} weight="bold" />
                </div>
                <div className="flex flex-col">
                  <p className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-primary transition-colors">MAT104 - Calculus I</p>
                  <p className="text-xs text-text-secondary-light dark:text-text-secondary">Mon, 11:00 AM</p>
                </div>
              </div>
              <div className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400">
                Missed
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
