import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Search, Filter, RefreshCw, Calendar, Users, Trash2, BookOpen, Clock } from 'lucide-react';
import { sessionApi } from '../../services/api/attendance';
import { Session } from '../../types';
import { toast } from 'sonner';
import { SEO } from '../SEO';
import { Button } from '../Button';
import { ModernCard } from '../ModernCard';
import { Badge } from '../../src/components/ui/badge';
import { cn } from '../../src/components/ui/utils';
import { SessionDetailDialog } from '../Attendance/SessionDetailDialog';

export const SessionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<number | null>(null);

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

  const handleDeleteSession = async () => {
    if (!sessionToDelete) return;
    try {
      await sessionApi.delete(sessionToDelete);
      toast.success('Session deleted successfully');
      setSessions(sessions.filter(s => s.id !== sessionToDelete));
      setIsDeleteModalOpen(false);
      setSessionToDelete(null);
    } catch (err) {
      toast.error('Failed to delete session');
    }
  };

  const filteredSessions = sessions.filter(session =>
    session.course_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.course_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.session_code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-20">
      <SEO title="Attendance History | Presently" />

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
           <Badge variant="secondary" className="px-3 py-1">SESSION LOGS</Badge>
           <h1 className="font-display text-4xl md:text-5xl font-bold text-presently-black">
             Attendance History
           </h1>
           <p className="text-on-surface-variant font-medium text-lg">
             Audit and manage all your academic sessions.
           </p>
        </div>
        <Button size="lg" className="h-16 px-10 shadow-gold" onClick={() => navigate('/dashboard/sessions/new')}>
          <Plus size={24} className="mr-2" />
          New Session
        </Button>
      </header>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant" size={20} />
          <input
            type="text"
            placeholder="Search by course or code..."
            className="w-full h-14 pl-14 pr-6 bg-white border border-outline rounded-2xl text-presently-black font-medium focus:ring-2 focus:ring-sungold/20 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={fetchSessions}
          disabled={loading}
          className="h-14 px-6 rounded-2xl border border-outline flex items-center gap-3 text-xs font-bold text-on-surface-variant hover:bg-warm-ivory transition-all disabled:opacity-50"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          REFRESH DATA
        </button>
      </div>

      {/* Grid */}
      {loading && sessions.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-3xl" />
          ))}
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="text-center py-24 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-outline">
          <Calendar className="w-20 h-20 text-slate-200 mx-auto mb-6" />
          <h4 className="font-display text-2xl font-bold text-presently-black">No Sessions Found</h4>
          <p className="text-on-surface-variant font-medium mt-2">Create your first attendance session to begin tracking.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredSessions.map(session => {
            const isExpired = session.is_active && new Date(session.end_time) < new Date();
            const status = session.is_active ? (isExpired ? 'EXPIRED' : 'ACTIVE') : 'ENDED';

            return (
              <ModernCard
                key={session.id}
                padding="lg"
                className="group hover:border-sungold/40 transition-all flex flex-col justify-between cursor-pointer"
                onClick={() => setSelectedSession(session)}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-warm-ivory border border-outline flex items-center justify-center text-sungold">
                      <BookOpen size={24} />
                    </div>
                    <div className="flex gap-2">
                       <Badge variant={status === 'ACTIVE' ? 'present' : status === 'EXPIRED' ? 'excused' : 'secondary'}>
                         {status}
                       </Badge>
                       <button
                         onClick={(e) => {
                           e.stopPropagation();
                           setSessionToDelete(session.id);
                           setIsDeleteModalOpen(true);
                         }}
                         className="p-2 hover:bg-red-50 rounded-xl text-soft-coral transition-colors"
                       >
                         <Trash2 size={16} />
                       </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-display text-xl font-bold text-presently-black leading-tight mb-1 group-hover:text-sungold transition-colors line-clamp-1">
                      {session.course_name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-sungold uppercase tracking-widest">{session.course_code}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{session.session_code}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-outline grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-on-surface-variant">
                      <Calendar size={14} className="text-sungold" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{new Date(session.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-on-surface-variant">
                      <Users size={14} className="text-sungold" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{session.attendee_count || 0} STUDENTS</span>
                    </div>
                  </div>
                </div>
              </ModernCard>
            );
          })}
        </div>
      )}

      {selectedSession && (
        <SessionDetailDialog
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
          onSessionEnded={fetchSessions}
        />
      )}

      {/* Delete Confirmation */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-presently-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <ModernCard className="max-w-md w-full animate-in zoom-in-95 duration-300 shadow-2xl">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-soft-coral/10 text-soft-coral rounded-full flex items-center justify-center mx-auto">
                <Trash2 size={32} />
              </div>
              <div>
                <h3 className="font-display text-2xl font-bold text-presently-black">Delete Session?</h3>
                <p className="text-on-surface-variant font-medium mt-2">
                  This will permanently remove the attendance record for this session. This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-4 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 h-14"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleDeleteSession}
                  className="flex-1 h-14 bg-soft-coral hover:bg-red-700 text-white border-none"
                >
                  Confirm Delete
                </Button>
              </div>
            </div>
          </ModernCard>
        </div>
      )}
    </div>
  );
};

export default SessionsPage;
