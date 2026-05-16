import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCurrentUser } from '../../../hooks/useAuth';
import { CalendarBlank, CheckCircle, WarningCircle, Clock, XCircle, ClipboardText, ArrowRight, BookOpen, Plus } from '@phosphor-icons/react';
import { getStatusBadge } from '../../../utils/statusBadge';

export const StudentHomeMobile: React.FC = () => {
  const { data: user } = useCurrentUser();
  const navigate = useNavigate();

  // Mock data for the UI
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const dayStr = now.toLocaleDateString('en-US', { weekday: 'long' });
  const hour = now.getHours();
  
  let timeOfDay = 'morning';
  if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
  else if (hour >= 17) timeOfDay = 'evening';

  const firstName = user?.full_name?.split(' ')[0] || 'Student';

  const activeSession = {
    courseCode: 'CSC 401',
    courseName: 'Intro to Artificial Intelligence',
    venue: 'Main Auditorium',
    timeRemaining: '45 mins left',
    progress: 40
  };

  const stats = {
    overall: 87,
    sessions: 24,
    flagged: 2
  };

  const recentSessions = [
    { id: 1, code: 'CSC 401', name: 'Intro to Artificial Intelligence', date: 'Today, 10:00 AM', status: 'present' as const },
    { id: 2, code: 'MTH 302', name: 'Advanced Calculus', date: 'Yesterday, 2:00 PM', status: 'absent' as const },
    { id: 3, code: 'PHY 205', name: 'Quantum Mechanics', date: 'Monday, 9:00 AM', status: 'flagged' as const },
  ];

  const upcomingSessions = [
    { id: 1, day: 'Tomorrow', time: '10:00 AM', name: 'Software Engineering', venue: 'Lab 2', code: 'SWE 404' },
    { id: 2, day: 'Tomorrow', time: '2:00 PM', name: 'Database Systems', venue: 'Hall B', code: 'CSC 302' },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Greeting */}
      <div className="px-5 pt-2 pb-2">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
          {dayStr}, {dateStr}
        </p>
        <h1 className="text-[28px] font-bold text-presently-black dark:text-white tracking-tight mt-1">
          Good {timeOfDay}, {firstName} 👋
        </h1>
      </div>

      {/* 2. Active Session Card */}
      {activeSession ? (
        <div className="px-4">
          <div className="relative rounded-[24px] bg-presently-black dark:bg-charcoal p-5 shadow-gold overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-sungold" />
            
            <div className="flex items-center gap-2 mb-3">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sungold opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sungold"></span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-sungold">
                Live Now
              </span>
            </div>

            <h3 className="text-white text-[20px] font-bold tracking-tight mb-1">
              {activeSession.courseCode}: {activeSession.courseName}
            </h3>
            <p className="text-slate-400 text-[13px] font-medium mb-5">
              {activeSession.venue} • {activeSession.timeRemaining}
            </p>

            <button 
              onClick={() => navigate('/dashboard/scanner')}
              className="w-full h-[52px] bg-sungold text-presently-black rounded-2xl font-black text-base active:scale-[0.97] transition-transform shadow-sm flex items-center justify-center gap-2"
            >
              <div className="w-2 h-2 rounded-full bg-presently-black" />
              Mark Attendance <ArrowRight size={16} weight="bold" />
            </button>

            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${activeSession.progress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-sungold" 
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="px-4">
           <div className="rounded-[24px] border border-dashed border-slate-200 dark:border-white/10 p-6 flex flex-col items-center justify-center text-center">
             <CalendarBlank size={32} weight="duotone" className="text-slate-400 mb-3" />
             <h3 className="text-presently-black dark:text-white font-bold text-[15px]">No active class right now</h3>
             <p className="text-slate-400 text-[12px] mt-1">Your next class is tomorrow at 10:00 AM</p>
           </div>
        </div>
      )}

      {/* 3. Attendance Summary Row */}
      <div className="px-4 overflow-x-auto no-scrollbar">
        <div className="flex gap-3 min-w-max pb-2">
          {/* Overall */}
          <motion.div 
            initial={{ x: -12, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0 }}
            className="bg-white dark:bg-charcoal/80 border border-slate-100 dark:border-white/10 rounded-full px-4 py-2.5 shadow-sm flex items-center gap-2"
          >
            <CheckCircle size={14} weight="fill" className="text-moss-green" />
            <div>
              <div className="text-[20px] leading-none font-black tracking-tight text-presently-black dark:text-white">{stats.overall}%</div>
              <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">Overall Att.</div>
            </div>
          </motion.div>
          {/* Sessions */}
          <motion.div 
            initial={{ x: -12, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.06 }}
            className="bg-white dark:bg-charcoal/80 border border-slate-100 dark:border-white/10 rounded-full px-4 py-2.5 shadow-sm flex items-center gap-2"
          >
            <BookOpen size={14} weight="fill" className="text-sky-teal" />
            <div>
              <div className="text-[20px] leading-none font-black tracking-tight text-presently-black dark:text-white">{stats.sessions}</div>
              <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">Sessions</div>
            </div>
          </motion.div>
          {/* Flagged */}
          <motion.div 
            initial={{ x: -12, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.12 }}
            className="bg-white dark:bg-charcoal/80 border border-slate-100 dark:border-white/10 rounded-full px-4 py-2.5 shadow-sm flex items-center gap-2"
          >
            <WarningCircle size={14} weight="fill" className="text-soft-coral" />
            <div>
              <div className="text-[20px] leading-none font-black tracking-tight text-presently-black dark:text-white">{stats.flagged}</div>
              <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">Flagged</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 4. Recent Attendance Sessions */}
      <div className="px-4">
        <div className="flex justify-between items-end mb-3">
          <h2 className="text-[17px] font-bold text-presently-black dark:text-white">Recent Sessions</h2>
          <button 
            onClick={() => navigate('/dashboard/courses')}
            className="text-[12px] font-bold text-sungold flex items-center gap-1"
          >
            See all <ArrowRight size={12} weight="bold" />
          </button>
        </div>
        
        <div className="space-y-3">
          {recentSessions.length > 0 ? recentSessions.map(session => {
            const badge = getStatusBadge(session.status);
            return (
              <div key={session.id} className="bg-white dark:bg-charcoal rounded-[20px] p-4 shadow-sm flex items-center gap-3">
                <div className="w-11 h-11 bg-slate-100 dark:bg-white/5 rounded-xl flex items-center justify-center shrink-0 font-display font-bold text-presently-black dark:text-white">
                  {session.code.split(' ')[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">{session.code}</p>
                  <p className="text-[15px] font-bold text-presently-black dark:text-white truncate mt-0.5">{session.name}</p>
                  <p className="text-[12px] text-slate-400 font-medium mt-0.5">{session.date}</p>
                </div>
                <div className={`${badge.bg} ${badge.text} px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide flex items-center gap-1 shrink-0`}>
                  <badge.icon size={12} weight="bold" />
                  {badge.label}
                </div>
              </div>
            );
          }) : (
            <div className="bg-white dark:bg-charcoal border border-dashed border-slate-200 dark:border-white/10 rounded-[20px] p-6 text-center">
              <ClipboardText size={40} weight="duotone" className="text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-[14px]">No attendance yet</p>
              <p className="text-[12px] text-slate-400 mt-1">Your sessions will appear here.</p>
            </div>
          )}
        </div>
      </div>

      {/* 5. Upcoming Sessions */}
      <div className="px-4">
        <h2 className="text-[17px] font-bold text-presently-black dark:text-white mb-3">Upcoming</h2>
        <div className="space-y-3">
          {upcomingSessions.map(session => (
            <div key={session.id} onClick={() => navigate(`/dashboard/courses/${session.code}`)} className="bg-white dark:bg-charcoal rounded-2xl p-3 shadow-sm flex items-center gap-3 border border-slate-100 dark:border-white/5 active:scale-[0.98] transition-transform cursor-pointer">
              <div className="bg-pale-honey text-amber-800 px-3 py-1.5 rounded-xl flex flex-col items-center justify-center shrink-0">
                <span className="text-[9px] font-black uppercase tracking-wider">{session.day}</span>
                <span className="text-[12px] font-black">{session.time}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-bold text-presently-black dark:text-white truncate">{session.name}</p>
                <p className="text-[12px] text-slate-400 font-medium">{session.venue}</p>
              </div>
              <ArrowRight size={16} weight="bold" className="text-slate-300 shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* 6. Quick Actions */}
      <div className="px-4 pt-2">
        <div className="grid grid-cols-2 gap-3">
          <button className="bg-white dark:bg-charcoal border border-slate-100 dark:border-white/8 rounded-2xl p-4 flex flex-col gap-2 items-start text-left active:scale-95 transition-transform">
            <Plus size={24} weight="duotone" className="text-sungold" />
            <div>
              <span className="block font-bold text-[13px] text-presently-black dark:text-white">Register Course</span>
              <span className="block text-[11px] text-slate-400 mt-0.5">Add a new class</span>
            </div>
          </button>
          <button 
            onClick={() => navigate('/dashboard/courses')}
            className="bg-white dark:bg-charcoal border border-slate-100 dark:border-white/8 rounded-2xl p-4 flex flex-col gap-2 items-start text-left active:scale-95 transition-transform"
          >
            <BookOpen size={24} weight="duotone" className="text-sungold" />
            <div>
              <span className="block font-bold text-[13px] text-presently-black dark:text-white">View Courses</span>
              <span className="block text-[11px] text-slate-400 mt-0.5">Manage enrollment</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
