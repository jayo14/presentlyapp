import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Broadcast, Clock, Users, 
  MapPin, CaretRight, Plus, 
  CheckCircle, ListChecks, Calendar
} from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { attendanceApi } from '../../../services/api/attendance';
import { toast } from 'sonner';
import { SEO } from '../../SEO';


export const LecturerSessionsMobile: React.FC = () => {
  const navigate = useNavigate();
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['lecturerSessions'],
    queryFn: () => attendanceApi.getSessions({ lecturer_only: true }),
  });

  const activeSessions = sessions.filter((s: any) => s.is_active);
  const pastSessions = sessions.filter((s: any) => !s.is_active);

  return (
    <div className="space-y-8 pb-12">
      <SEO title="Manage Sessions | Presently" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-3xl font-bold tracking-tight">Live Sessions</h1>
           <p className="text-on-surface-variant font-medium">Monitor active attendance feeds.</p>
        </div>
        <button 
          onClick={() => navigate('/dashboard/sessions/new')}
          className="w-12 h-12 rounded-2xl bg-sungold text-black flex items-center justify-center shadow-gold active:scale-90 transition-transform"
        >
          <Plus size={24} weight="bold" />
        </button>
      </div>

      {/* Active Sessions */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-1">
           <Broadcast size={20} weight="fill" className="text-success animate-pulse" />
           <h2 className="text-sm font-black uppercase tracking-[0.2em] text-on-surface-variant">Active Now</h2>
        </div>
        {activeSessions.length > 0 ? (
          activeSessions.map((session: any) => (
            <motion.div 
              key={session.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/dashboard/sessions/${session.id}`)}
              className="p-6 rounded-[32px] bg-sungold text-presently-black shadow-gold space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                   <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{session.course_code}</span>
                   <h3 className="text-2xl font-bold leading-tight">{session.course_name}</h3>
                </div>
                <div className="px-3 py-1 bg-black/10 rounded-full text-[10px] font-black uppercase tracking-widest">
                   {session.attendee_count} Joined
                </div>
              </div>
              <div className="flex items-center gap-4 font-bold text-sm">
                 <div className="flex items-center gap-1.5">
                    <Clock size={18} weight="fill" />
                    Started {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                 </div>
                 <div className="flex items-center gap-1.5 text-black/60">
                    <MapPin size={18} weight="fill" />
                    {session.venue_name || 'Main Hall'}
                 </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="p-8 rounded-[32px] bg-surface-container border border-outline border-dashed text-center">
             <p className="text-sm text-on-surface-variant font-bold">No active sessions at the moment.</p>
          </div>
        )}
      </section>

      {/* History */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-1">
           <Calendar size={20} weight="duotone" className="text-on-surface-variant" />
           <h2 className="text-sm font-black uppercase tracking-[0.2em] text-on-surface-variant">Session History</h2>
        </div>
        <div className="space-y-3">
          {isLoading ? (
            [1,2,3].map(i => <div key={i} className="h-20 bg-surface-container animate-pulse rounded-3xl" />)
          ) : pastSessions.length > 0 ? (
            pastSessions.map((session: any) => (
              <div 
                key={session.id}
                onClick={() => navigate(`/dashboard/sessions/${session.id}`)}
                className="p-4 rounded-3xl bg-surface border border-outline flex items-center gap-4 active:bg-surface-container transition-colors"
              >
                <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center text-on-surface-variant font-bold text-xs">
                   {session.course_code.substring(0, 3)}
                </div>
                <div className="flex-1 min-w-0">
                   <h4 className="font-bold text-sm truncate">{session.course_name}</h4>
                   <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                     {new Date(session.start_time).toLocaleDateString()} • {session.attendee_count} Students
                   </p>
                </div>
                <CaretRight size={18} weight="bold" className="text-on-surface-variant" />
              </div>
            ))
          ) : (
            <div className="text-center py-10">
               <ListChecks size={48} weight="duotone" className="mx-auto text-on-surface-variant opacity-20 mb-4" />
               <p className="text-sm text-on-surface-variant font-medium">Your session log is empty.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
