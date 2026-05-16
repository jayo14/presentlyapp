import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CaretLeft, BookBookmark, Info, CalendarBlank, MapPin, User, CheckCircle, Warning, XCircle } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { getStatusBadge } from '../../../utils/statusBadge';

export const CourseDetailsMobile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Mock course data
  const course = {
    code: id || 'CSC 401',
    name: 'Intro to Artificial Intelligence',
    lecturer: 'Prof. Adeyemi',
    venue: 'Main Auditorium',
    schedule: 'Mondays, 10:00 AM - 12:00 PM',
    attendance: 88,
    totalSessions: 24,
    attended: 21,
    missed: 3,
  };

  const history = [
    { date: 'Today, 10:00 AM', status: 'present' as const },
    { date: 'Oct 12, 10:00 AM', status: 'present' as const },
    { date: 'Oct 5, 10:00 AM', status: 'flagged' as const },
    { date: 'Sep 28, 10:00 AM', status: 'absent' as const },
    { date: 'Sep 21, 10:00 AM', status: 'present' as const },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-off-white dark:bg-presently-black text-presently-black dark:text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-off-white/80 dark:bg-presently-black/80 backdrop-blur-xl border-b border-slate-100 dark:border-white/5 pt-safe">
        <div className="h-14 px-4 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white dark:bg-charcoal flex items-center justify-center active:scale-95 transition-transform shadow-sm"
          >
            <CaretLeft size={20} weight="bold" />
          </button>
          <span className="font-bold text-[15px]">{course.code}</span>
          <div className="w-10" />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar pb-32">
        {/* Top Section */}
        <div className="px-4 py-6 space-y-6">
          <div className="flex gap-4">
            <div className="w-16 h-16 rounded-[20px] bg-pale-honey text-amber-800 flex items-center justify-center shrink-0">
               <BookBookmark size={32} weight="duotone" />
            </div>
            <div>
               <h1 className="text-[24px] font-bold tracking-tight leading-none mb-2">{course.name}</h1>
               <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sungold/15 text-sungold text-[10px] font-black uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full bg-sungold" />
                  Active Course
               </div>
            </div>
          </div>

          <div className="bg-white dark:bg-charcoal rounded-[24px] p-2 space-y-1 shadow-sm border border-slate-50 dark:border-white/5">
             <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-white/5 rounded-[20px]">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-charcoal flex items-center justify-center text-slate-400">
                   <User size={20} weight="duotone" />
                </div>
                <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Lecturer</p>
                   <p className="text-[14px] font-bold">{course.lecturer}</p>
                </div>
             </div>
             <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-white/5 rounded-[20px]">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-charcoal flex items-center justify-center text-slate-400">
                   <MapPin size={20} weight="duotone" />
                </div>
                <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Venue</p>
                   <p className="text-[14px] font-bold">{course.venue}</p>
                </div>
             </div>
             <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-white/5 rounded-[20px]">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-charcoal flex items-center justify-center text-slate-400">
                   <CalendarBlank size={20} weight="duotone" />
                </div>
                <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Schedule</p>
                   <p className="text-[14px] font-bold">{course.schedule}</p>
                </div>
             </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="px-4 pb-6">
          <div className="bg-presently-black dark:bg-charcoal rounded-[32px] p-6 shadow-gold relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-sungold/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
             <div className="flex justify-between items-end mb-6 relative z-10">
                <div>
                   <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">My Attendance</p>
                   <h2 className="text-[48px] font-black text-white leading-none tracking-tighter">{course.attendance}<span className="text-sungold text-[24px]">%</span></h2>
                </div>
             </div>
             
             <div className="h-2.5 bg-white/10 rounded-full overflow-hidden mb-6">
                <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${course.attendance}%` }}
                   transition={{ duration: 1 }}
                   className="h-full bg-sungold"
                />
             </div>

             <div className="flex justify-between text-white border-t border-white/10 pt-4 relative z-10">
                <div className="text-center">
                   <p className="text-[20px] font-black">{course.attended}</p>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Attended</p>
                </div>
                <div className="w-px bg-white/10" />
                <div className="text-center">
                   <p className="text-[20px] font-black">{course.missed}</p>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Missed</p>
                </div>
                <div className="w-px bg-white/10" />
                <div className="text-center">
                   <p className="text-[20px] font-black">{course.totalSessions}</p>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</p>
                </div>
             </div>
          </div>
        </div>

        {/* History List */}
        <div className="px-4">
          <h2 className="text-[17px] font-bold mb-3 px-2">History</h2>
          <div className="bg-white dark:bg-charcoal rounded-[32px] p-2 shadow-sm">
            {history.map((session, i) => {
              const badge = getStatusBadge(session.status);
              return (
                <div key={i} className={`flex items-center justify-between p-4 ${i !== history.length -1 ? 'border-b border-slate-100 dark:border-white/5' : ''}`}>
                  <div className="flex items-center gap-3">
                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${badge.bg} ${badge.text}`}>
                        <badge.icon size={20} weight="fill" />
                     </div>
                     <p className="font-bold text-[14px]">{session.date}</p>
                  </div>
                  <div className={`${badge.bg} ${badge.text} px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide`}>
                    {badge.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};
