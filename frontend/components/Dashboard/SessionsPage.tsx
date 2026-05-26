import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, RefreshCw, Users, BookOpen, Clock, Trash2, Calendar } from 'lucide-react';
import { sessionApi } from '../../services/api/attendance';
import { Session } from '../../types';
import { toast } from 'sonner';
import { SEO } from '../SEO';
import { Button } from '../Button';
import { ModernCard } from '../ModernCard';
import { Badge } from '../../src/components/ui/badge';
import { cn } from '../../src/components/ui/utils';
import { DashboardPage } from '../../src/components/layout-primitives/DashboardPage';
import { ResponsiveGrid } from '../../src/components/layout-primitives/ResponsiveGrid';

export const SessionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const data = await sessionApi.getAll();
      setSessions(data);
    } catch (err) {
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const filteredSessions = sessions.filter(s =>
    s.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.venue_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardPage
      title="Attendance Sessions"
      description="Historical log of active and completed attendance tracking events."
      seoTitle="Sessions | Presently"
      action={
        <Button size="lg" className="shadow-gold" onClick={() => navigate('/dashboard/sessions/new')}>
          <Plus size={24} className="mr-2" /> Start New
        </Button>
      }
    >
      <div className="space-y-16 lg:space-y-32">
        <div className="flex flex-col md:flex-row items-center gap-6">
           <div className="relative flex-1 max-w-2xl group w-full">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-on-surface-variant transition-colors group-focus-within:text-sungold" size={20} />
              <input
                type="text"
                placeholder="Search by course or venue..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-16 pl-14 pr-6 bg-white border border-outline rounded-2xl text-presently-black font-bold text-sm focus:ring-4 focus:ring-sungold/10 outline-none transition-all shadow-sm"
              />
           </div>
           <Button variant="outline" className="h-16 px-8 rounded-2xl" onClick={fetchSessions}>
             <RefreshCw className={cn("w-5 h-5 mr-2", loading && "animate-spin")} /> Refresh
           </Button>
        </div>

        <ResponsiveGrid columns={3} gap={32}>
           {loading ? (
             Array.from({ length: 6 }).map((_, i) => (
               <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-[2rem]" />
             ))
           ) : (
             filteredSessions.map((session) => (
               <ModernCard key={session.id} padding="lg" className="hoverable border border-outline/30 flex flex-col justify-between h-full">
                  <div className="space-y-6 flex flex-col h-full">
                     <div className="flex items-start justify-between">
                        <div className="w-14 h-14 rounded-[30%] bg-sungold/10 text-sungold flex items-center justify-center shadow-sm">
                           <BookOpen size={28} weight="bold" />
                        </div>
                        <Badge variant={session.is_active ? 'present' : 'secondary'} className="font-bold">
                           {session.is_active ? 'LIVE NOW' : 'COMPLETED'}
                        </Badge>
                     </div>

                     <div className="flex-grow">
                        <h3 className="font-display text-2xl font-bold text-presently-black leading-tight mb-2">
                           {session.course_name}
                        </h3>
                        <div className="flex items-center gap-2">
                           <Calendar size={14} className="text-sungold" />
                           <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                             {new Date(session.start_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                           </span>
                        </div>
                     </div>

                     <div className="pt-6 border-t border-outline/40 space-y-4 mt-auto">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-2">
                              <Users size={16} weight="bold" className="text-sungold" />
                              <span className="text-sm font-bold text-presently-black tabular-nums">{session.attendance_count || 0}</span>
                              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Students</span>
                           </div>
                           <div className="flex items-center gap-2">
                              <Clock size={16} weight="bold" className="text-sungold" />
                              <span className="text-xs font-bold text-on-surface-variant tabular-nums">
                                {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                           </div>
                        </div>
                     </div>
                  </div>
               </ModernCard>
             ))
           )}
        </ResponsiveGrid>

        {!loading && filteredSessions.length === 0 && (
          <div className="text-center py-32 bg-surface-highest/20 rounded-[3rem] border-2 border-dashed border-outline/40">
            <BookOpen className="w-24 h-24 text-outline mx-auto mb-6 opacity-20" />
            <h4 className="font-display text-3xl font-bold text-presently-black">No Sessions Found</h4>
            <p className="text-on-surface-variant font-medium mt-3 max-w-sm mx-auto">Active and past attendance sessions will appear here.</p>
          </div>
        )}
      </div>
    </DashboardPage>
  );
};

export default SessionsPage;
