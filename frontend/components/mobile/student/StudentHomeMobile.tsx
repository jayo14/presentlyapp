import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentUser } from '../../../hooks/useAuth';
import { Bell, QrCode, Check, X } from '@phosphor-icons/react';

export const StudentHomeMobile: React.FC = () => {
  const { data: user } = useCurrentUser();
  const navigate = useNavigate();

  const firstName = user?.full_name?.split(' ')[0] || 'Student';

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display antialiased overflow-x-hidden pb-32 min-h-screen">
      {/* Top App Bar */}
      <header className="sticky top-0 z-40 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center px-6 py-5 justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div
                className="bg-center bg-no-repeat bg-cover rounded-full w-12 h-12 border-[3px] border-primary shadow-sm"
                title="Profile picture"
                style={{ backgroundImage: `url(${user?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + firstName})` }}
              />
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-[3px] border-background-light dark:border-background-dark"></div>
            </div>
            <div>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary font-semibold mb-0.5">Welcome back</p>
              <h2 className="text-xl font-bold leading-tight tracking-tight">Hello, {firstName}!</h2>
            </div>
          </div>
          <button className="relative p-3 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
            <Bell size={28} weight="bold" />
            <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-background-light dark:border-background-dark"></span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col gap-8 p-5">
        {/* Live Class Card */}
        <section>
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-base font-bold uppercase tracking-widest text-text-secondary-light dark:text-text-secondary">Happening Now</h3>
            <span className="flex items-center gap-2 text-sm font-bold text-red-500 animate-pulse px-3 py-1 bg-red-50 dark:bg-red-500/10 rounded-full">
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span>
              LIVE
            </span>
          </div>
          <div className="relative overflow-hidden rounded-[2rem] bg-surface-light dark:bg-surface-dark shadow-2xl border border-gray-100 dark:border-white/5">
            {/* Background Image Overlay */}
            <div
              className="absolute inset-0 opacity-10 dark:opacity-20 pointer-events-none"
              style={{
                backgroundImage: 'url("https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80")',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            ></div>
            <div className="relative p-7 flex flex-col gap-6 z-10">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/20 text-yellow-700 dark:text-yellow-400 text-xs font-bold mb-3">
                    Lecture Hall B
                  </div>
                  <h2 className="text-[28px] font-bold leading-tight tracking-tight mb-1.5">CS101 - Algorithm Design</h2>
                  <p className="text-text-secondary-light dark:text-text-secondary text-base font-medium">Prof. Sarah Jenkins • 10:00 AM - 11:30 AM</p>
                </div>
                <div className="bg-surface-highlight/30 rounded-2xl p-3 text-center min-w-[72px] shadow-inner">
                  <span className="block text-[11px] font-bold uppercase tracking-wider opacity-70 mb-1">Rem</span>
                  <span className="block text-xl font-bold font-mono">15m</span>
                </div>
              </div>

              <div className="mt-2">
                <button
                  onClick={() => navigate('/dashboard/scanner')}
                  className="w-full relative group overflow-hidden rounded-2xl bg-primary hover:bg-yellow-400 text-black font-bold h-16 flex items-center justify-center gap-3 shadow-[0_8px_30px_rgba(249,196,6,0.35)] transition-all transform active:scale-[0.98] text-lg"
                >
                  <QrCode size={28} weight="bold" />
                  <span>Mark Attendance</span>
                  {/* Shine effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent z-20 w-1/2 h-full skew-x-12"></div>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Attendance Summary */}
        <section>
          <h3 className="text-xl font-bold px-1 mb-4">Attendance Summary</h3>
          <div className="rounded-[2rem] bg-surface-light dark:bg-surface-dark shadow-xl p-7 border border-gray-100 dark:border-white/5">
            <div className="flex flex-col items-center gap-8">
              {/* Circular Progress */}
              {/* <div className="relative w-44 h-44 shrink-0">
                <svg className="w-full h-full -rotate-90 drop-shadow-md" viewBox="0 0 100 100">
                  <circle className="text-gray-100 dark:text-surface-highlight" cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="10"></circle>
                  <circle className="text-primary transition-all duration-1000 ease-out" cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="10" strokeDasharray="227.3 251.2" strokeLinecap="round"></circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black tracking-tight mb-0.5">90.5%</span>
                  <span className="text-xs uppercase tracking-[0.15em] font-bold text-text-secondary-light dark:text-text-secondary">Overall</span>
                </div>
              </div> */}

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 w-full">
                <div className="flex flex-col gap-1.5 items-center justify-center p-4 rounded-2xl bg-background-light dark:bg-background-dark border border-gray-200 dark:border-surface-highlight shadow-sm">
                  <span className="text-[28px] font-black tracking-tight text-slate-800 dark:text-white leading-none">42</span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary">Classes</span>
                </div>
                <div className="flex flex-col gap-1.5 items-center justify-center p-4 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30 shadow-sm">
                  <span className="text-[28px] font-black tracking-tight text-green-600 dark:text-green-400 leading-none">38</span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-green-700/80 dark:text-green-400/80">Attended</span>
                </div>
                <div className="flex flex-col gap-1.5 items-center justify-center p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 shadow-sm">
                  <span className="text-[28px] font-black tracking-tight text-red-600 dark:text-red-400 leading-none">4</span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-red-700/80 dark:text-red-400/80">Missed</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Activity List */}
        <section>
          <div className="flex justify-between items-end mb-4 px-1">
            <h3 className="text-xl font-bold">Recent Activity</h3>
            <button className="text-sm font-bold text-primary hover:text-yellow-500 transition-colors bg-primary/10 px-4 py-2 rounded-full">View All</button>
          </div>

          <div className="flex flex-col gap-4">
            {/* Item 1 */}
            <div className="group flex items-center justify-between p-5 rounded-[1.25rem] bg-surface-light dark:bg-surface-dark shadow-md border border-gray-100 dark:border-white/5 hover:border-primary/50 transition-all active:scale-[0.98]">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center shrink-0">
                  <Check size={24} weight="bold" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <p className="font-bold text-base text-slate-900 dark:text-white group-hover:text-primary transition-colors tracking-tight">ENG202 - Adv. Composition</p>
                  <p className="text-sm font-medium text-text-secondary-light dark:text-text-secondary">Today, 09:00 AM</p>
                </div>
              </div>
              <div className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 shrink-0">
                Present
              </div>
            </div>

            {/* Item 2 */}
            <div className="group flex items-center justify-between p-5 rounded-[1.25rem] bg-surface-light dark:bg-surface-dark shadow-md border border-gray-100 dark:border-white/5 hover:border-primary/50 transition-all active:scale-[0.98]">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center shrink-0">
                  <Check size={24} weight="bold" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <p className="font-bold text-base text-slate-900 dark:text-white group-hover:text-primary transition-colors tracking-tight">HIS101 - World History</p>
                  <p className="text-sm font-medium text-text-secondary-light dark:text-text-secondary">Yesterday, 2:00 PM</p>
                </div>
              </div>
              <div className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 shrink-0">
                Present
              </div>
            </div>

            {/* Item 3 */}
            <div className="group flex items-center justify-between p-5 rounded-[1.25rem] bg-surface-light dark:bg-surface-dark shadow-md border border-gray-100 dark:border-white/5 hover:border-primary/50 transition-all active:scale-[0.98]">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                  <X size={24} weight="bold" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <p className="font-bold text-base text-slate-900 dark:text-white group-hover:text-primary transition-colors tracking-tight">MAT104 - Calculus I</p>
                  <p className="text-sm font-medium text-text-secondary-light dark:text-text-secondary">Mon, 11:00 AM</p>
                </div>
              </div>
              <div className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 shrink-0">
                Missed
              </div>
            </div>
          </div>
        </section>
      </main>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-150%) skewX(12deg) }
          100% { transform: translateX(150%) skewX(12deg) }
        }
      `}</style>
    </div>
  );
};
