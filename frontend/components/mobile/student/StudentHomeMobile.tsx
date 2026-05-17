import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentUser } from '../../../hooks/useAuth';
import { CalendarBlank, ArrowRight } from '@phosphor-icons/react';

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
  };

  const upcomingSessions = [
    { id: 1, day: 'Tomorrow', time: '10:00 AM', name: 'Software Engineering', venue: 'Lab 2', code: 'SWE 404' },
    { id: 2, day: 'Tomorrow', time: '2:00 PM', name: 'Database Systems', venue: 'Hall B', code: 'CSC 302' },
  ];

  return (
    <div className="space-y-[72px] pb-[120px]">
      
      {/* 1. Greeting */}
      <div className="px-8 pt-12">
        <div className="inline-block px-4 py-2 bg-slate-100 dark:bg-white/5 rounded-full mb-6">
          <p className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            {dayStr}, {dateStr}
          </p>
        </div>
        <h1 className="text-[44px] font-bold text-presently-black dark:text-white tracking-tighter leading-[1.05]">
          Good {timeOfDay},<br/>{firstName} 👋
        </h1>
      </div>

      {/* 2. Active Session Card */}
      <div className="px-8">
        <div className="flex items-center justify-between mb-8">
           <h2 className="text-[22px] font-bold text-presently-black dark:text-white">Right Now</h2>
        </div>
        
        {activeSession ? (
          <div className="relative rounded-[48px] bg-presently-black dark:bg-charcoal p-10 shadow-2xl overflow-hidden">
            {/* Decorative background glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-sungold/15 rounded-full blur-[60px] -mr-20 -mt-20 pointer-events-none" />
            
            <div className="flex items-center gap-3 mb-8">
              <div className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sungold opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-sungold"></span>
              </div>
              <span className="text-[14px] font-black uppercase tracking-widest text-sungold">
                Live Class
              </span>
            </div>

            <h3 className="text-white text-[32px] font-bold tracking-tight mb-4 leading-tight">
              {activeSession.courseName}
            </h3>
            <p className="text-slate-400 text-[18px] font-medium mb-12 flex items-center gap-2">
              {activeSession.venue} <span className="w-1 h-1 rounded-full bg-slate-600" /> {activeSession.timeRemaining}
            </p>

            <button 
              onClick={() => navigate('/dashboard/scanner')}
              className="w-full h-[76px] bg-sungold text-presently-black rounded-[28px] font-black text-xl active:scale-[0.98] transition-transform shadow-lg flex items-center justify-center gap-3"
            >
              Mark Attendance <ArrowRight size={24} weight="bold" />
            </button>
          </div>
        ) : (
           <div className="rounded-[48px] border-[3px] border-dashed border-slate-200 dark:border-white/10 p-16 flex flex-col items-center justify-center text-center">
             <div className="w-24 h-24 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-8">
                <CalendarBlank size={40} weight="duotone" className="text-slate-400 dark:text-slate-500" />
             </div>
             <h3 className="text-presently-black dark:text-white font-bold text-[24px] mb-2 tracking-tight">No active class right now</h3>
             <p className="text-slate-500 text-[18px] font-medium">Enjoy your free time!</p>
           </div>
        )}
      </div>

      {/* 3. Upcoming Sessions */}
      <div className="px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-[22px] font-bold text-presently-black dark:text-white">Upcoming Schedule</h2>
        </div>
        
        <div className="space-y-6">
          {upcomingSessions.map(session => (
            <div key={session.id} onClick={() => navigate(`/dashboard/courses/${session.code}`)} className="bg-white dark:bg-charcoal rounded-[40px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] flex items-center gap-6 border border-slate-100 dark:border-white/5 active:scale-[0.98] transition-transform cursor-pointer">
              <div className="w-[84px] h-[84px] bg-slate-50 dark:bg-white/5 text-slate-500 rounded-[24px] flex flex-col items-center justify-center shrink-0 border border-slate-100 dark:border-white/5">
                <span className="text-[12px] font-black uppercase tracking-wider text-slate-400">{session.day}</span>
                <span className="text-[16px] font-bold text-presently-black dark:text-white mt-1.5">{session.time}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[20px] font-bold text-presently-black dark:text-white truncate tracking-tight">{session.name}</p>
                <p className="text-[16px] text-slate-500 font-medium mt-2">{session.venue}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center shrink-0">
                 <ArrowRight size={20} weight="bold" className="text-slate-400" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

