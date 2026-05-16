import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CaretLeft, Bell, WarningCircle, CheckCircle, Info, CalendarBlank } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../../SEO';

type FilterType = 'all' | 'attendance' | 'courses' | 'system';

export const NotificationsMobile: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterType>('all');

  const notifications = [
    {
      id: 1,
      type: 'attendance',
      title: 'Absence Warning',
      message: 'You have missed 2 consecutive classes for CSC 401.',
      time: '2 hours ago',
      unread: true,
      icon: WarningCircle,
      color: 'text-soft-coral bg-soft-coral/10'
    },
    {
      id: 2,
      type: 'attendance',
      title: 'Attendance Logged',
      message: 'Successfully marked present for MTH 302.',
      time: 'Yesterday, 10:45 AM',
      unread: false,
      icon: CheckCircle,
      color: 'text-moss-green bg-moss-green/10'
    },
    {
      id: 3,
      type: 'courses',
      title: 'New Assignment',
      message: 'Prof. Adeyemi uploaded a new assignment for CSC 401.',
      time: 'Yesterday, 2:00 PM',
      unread: true,
      icon: CalendarBlank,
      color: 'text-sky-teal bg-sky-teal/10'
    },
    {
      id: 4,
      type: 'system',
      title: 'System Maintenance',
      message: 'Presently will be offline for maintenance on Sunday 2AM.',
      time: 'Oct 12, 2023',
      unread: false,
      icon: Info,
      color: 'text-sungold bg-sungold/10'
    }
  ];

  const filtered = filter === 'all' 
    ? notifications 
    : notifications.filter(n => n.type === filter);

  return (
    <div className="flex flex-col min-h-screen bg-off-white dark:bg-presently-black text-presently-black dark:text-white">
      <SEO title="Notifications | Presently" />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-off-white/80 dark:bg-presently-black/80 backdrop-blur-xl border-b border-slate-100 dark:border-white/5 pt-safe">
        <div className="h-14 px-4 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white dark:bg-charcoal flex items-center justify-center active:scale-95 transition-transform shadow-sm"
          >
            <CaretLeft size={20} weight="bold" />
          </button>
          <span className="font-bold text-[17px]">Notifications</span>
          <button className="text-[12px] font-bold text-sungold">
            Mark all read
          </button>
        </div>
        
        {/* Filters */}
        <div className="flex overflow-x-auto no-scrollbar gap-2 px-4 py-3">
          {(['all', 'attendance', 'courses', 'system'] as FilterType[]).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`
                px-4 py-2 rounded-full text-[12px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors
                ${filter === type 
                  ? 'bg-sungold text-presently-black' 
                  : 'bg-white dark:bg-charcoal text-slate-400 border border-slate-100 dark:border-white/5'
                }
              `}
            >
              {type}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6 space-y-3 pb-32">
        <AnimatePresence mode="popLayout">
          {filtered.length > 0 ? (
            filtered.map((notification) => (
              <motion.div
                key={notification.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`
                  bg-white dark:bg-charcoal p-4 rounded-[24px] flex gap-4 shadow-sm
                  ${notification.unread ? 'border-2 border-sungold/50' : 'border border-slate-100 dark:border-white/5'}
                `}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${notification.color}`}>
                  <notification.icon size={24} weight="duotone" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-[15px] leading-tight pr-2">{notification.title}</h3>
                    {notification.unread && (
                      <span className="w-2 h-2 rounded-full bg-sungold shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium leading-snug mb-2">
                    {notification.message}
                  </p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 dark:text-slate-500">
                    {notification.time}
                  </p>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Bell size={48} weight="duotone" className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
              <h3 className="font-bold text-[16px]">All caught up!</h3>
              <p className="text-[14px] text-slate-400 mt-1">No notifications in this category.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};
