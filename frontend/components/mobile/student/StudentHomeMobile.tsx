import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCurrentUser } from '../../../hooks/useAuth';
import { CalendarBlank, Clock, ClipboardText, ArrowRight, BookOpen, Plus } from '@phosphor-icons/react';
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

  const upcomingSessions = [
    { id: 1, day: 'Tomorrow', time: '10:00 AM', name: 'Software Engineering', venue: 'Lab 2', code: 'SWE 404' },
    { id: 2, day: 'Tomorrow', time: '2:00 PM', name: 'Database Systems', venue: 'Hall B', code: 'CSC 302' },
  ];

  return (
    <div className="space-y-12 pb-10">
      {/* 1. Greeting */}
      <div className="px-6 pt-6">
        <p className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-400">
          {dayStr}, {dateStr}
        </p>
        <h1 className="text-[32px] font-bold text-presently-black dark:text-white tracking-tight mt-2 leading-none">
          Good {timeOfDay},<br/>{firstName} 👋
        </h1>
      </div>

      {/* 2. Active Session Card */}
      <div className="px-6">
        <h2 className="text-[18px] font-bold text-presently-black dark:text-white mb-4">Right Now</h2>
        {activeSession ? (
          <div className="relative rounded-[32px] bg-presently-black dark:bg-charcoal p-6 shadow-xl overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-sungold/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
            
            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sungold opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sungold"></span>
              </div>
              <span className="text-[11px] font-black uppercase tracking-widest text-sungold">
                Live Class
              </span>
            </div>

            <h3 className="text-white text-[24px] font-bold tracking-tight mb-2 leading-tight">
              {activeSession.courseName}
            </h3>
            <p className="text-slate-400 text-[15px] font-medium mb-8">
              {activeSession.venue} • {activeSession.timeRemaining}
            </p>

            <button 
              onClick={() => navigate('/dashboard/scanner')}
              className="w-full h-[60px] bg-sungold text-presently-black rounded-2xl font-black text-lg active:scale-[0.98] transition-transform shadow-md flex items-center justify-center gap-2"
            >
              Mark Attendance <ArrowRight size={20} weight="bold" />
            </button>
          </div>
        ) : (
           <div className="rounded-[32px] border-2 border-dashed border-slate-200 dark:border-white/10 p-8 flex flex-col items-center justify-center text-center">
             <CalendarBlank size={48} weight="duotone" className="text-slate-300 dark:text-slate-600 mb-4" />
             <h3 className="text-presently-black dark:text-white font-bold text-[18px]">No active class right now</h3>
             <p className="text-slate-400 text-[14px] mt-2">Enjoy your free time!</p>
           </div>
        )}
      </div>

      {/* 3. Upcoming Sessions */}
      <div className="px-6">
        <h2 className="text-[18px] font-bold text-presently-black dark:text-white mb-4">Upcoming Schedule</h2>
        <div className="space-y-4">
          {upcomingSessions.map(session => (
            <div key={session.id} onClick={() => navigate(`/dashboard/courses/${session.code}`)} className="bg-white dark:bg-charcoal rounded-[24px] p-4 shadow-sm flex items-center gap-4 border border-slate-100 dark:border-white/5 active:bg-slate-50 dark:active:bg-white/5 transition-colors cursor-pointer">
              <div className="w-16 h-16 bg-slate-50 dark:bg-white/5 text-slate-500 rounded-[16px] flex flex-col items-center justify-center shrink-0 border border-slate-100 dark:border-white/5">
                <span className="text-[10px] font-black uppercase tracking-wider">{session.day}</span>
                <span className="text-[13px] font-bold mt-1">{session.time}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[16px] font-bold text-presently-black dark:text-white truncate">{session.name}</p>
                <p className="text-[14px] text-slate-400 font-medium mt-1">{session.venue}</p>
              </div>
              <ArrowRight size={20} weight="bold" className="text-slate-300 shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* 4. Quick Actions */}
      <div className="px-6 pb-6">
        <h2 className="text-[18px] font-bold text-presently-black dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4">
          <button className="bg-white dark:bg-charcoal border border-slate-100 dark:border-white/5 rounded-[24px] p-5 flex flex-col items-start text-left active:bg-slate-50 dark:active:bg-white/5 transition-colors shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-sungold/10 text-sungold flex items-center justify-center mb-4">
               <Plus size={24} weight="bold" />
            </div>
            <span className="block font-bold text-[15px] text-presently-black dark:text-white">Register Course</span>
            <span className="block text-[12px] text-slate-400 mt-1">Enroll in a new class</span>
          </button>
          <button 
            onClick={() => navigate('/dashboard/courses')}
            className="bg-white dark:bg-charcoal border border-slate-100 dark:border-white/5 rounded-[24px] p-5 flex flex-col items-start text-left active:bg-slate-50 dark:active:bg-white/5 transition-colors shadow-sm"
          >
            <div className="w-12 h-12 rounded-xl bg-sky-teal/10 text-sky-teal flex items-center justify-center mb-4">
               <BookOpen size={24} weight="bold" />
            </div>
            <span className="block font-bold text-[15px] text-presently-black dark:text-white">View Courses</span>
            <span className="block text-[12px] text-slate-400 mt-1">Manage enrollments</span>
          </button>
        </div>
      </div>
    </div>
  );
};

