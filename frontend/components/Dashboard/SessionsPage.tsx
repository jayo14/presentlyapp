import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Search, Filter, Trash2, Plus, Timer, Users, RefreshCw } from 'lucide-react';
import { sessionApi, AttendanceSession } from '../../services/api/attendance';
import { SessionDetailDialog } from '../Attendance/SessionDetailDialog';
import { toast } from 'sonner';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';
import { SEO } from '../SEO';

export const SessionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSession, setSelectedSession] = useState<AttendanceSession | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<number | null>(null);

  const { modalProps: deleteModalProps } = useModalAccessibility(isDeleteModalOpen, () => setIsDeleteModalOpen(false));

  useEffect(() => { fetchSessions(); }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const data = await sessionApi.getAll();
      setSessions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching sessions:', err);
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
      setIsDeleteModalOpen(false);
      setSessionToDelete(null);
      fetchSessions();
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
    <>
      <SEO title="Sessions | Dashboard" description="View and manage all your attendance sessions on Presently." noIndex />
      <div className="space-y-6 animate-in fade-in duration-300 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              aria-label="Back to dashboard"
              className="p-2 text-textMuted hover:text-text rounded-lg hover:bg-surfaceHigh hover:text-text transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h2 className="font-headline text-xl font-semibold text-text">Attendance Sessions</h2>
              <p className="text-sm text-textMuted mt-0.5">History of all created attendance sessions.</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/dashboard/sessions/new')}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-primary text-black rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus size={16} />
            New Session
          </button>
        </div>

        {/* Search & Filters */}
        <div className="bg-surface text-text border border-outline rounded-xl p-3 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={15} />
            <input
              type="text"
              placeholder="Search by course code, name or session code..."
              className="w-full bg-surfaceLow border border-outline rounded-lg pl-9 pr-4 py-2 text-sm text-text placeholder:text-textMuted focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-textMuted bg-surface text-text border border-outline rounded-lg hover:bg-surfaceHigh hover:text-text transition-colors">
              <Filter size={14} />
              Filter
            </button>
            <button
              onClick={fetchSessions}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-textMuted bg-surface text-text border border-outline rounded-lg hover:bg-surfaceHigh hover:text-text transition-colors disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Sessions Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-44 bg-surfaceHigh/50 animate-pulse rounded-xl border border-outline" />
            ))}
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="text-center py-20 bg-surface text-text border border-dashed border-outline rounded-xl">
            <div className="w-14 h-14 bg-surfaceHigh rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="text-textMuted" size={24} />
            </div>
            <h3 className="font-headline text-base font-semibold text-text mb-1">No sessions found</h3>
            <p className="text-sm text-textMuted mb-6 max-w-sm mx-auto">
              {searchTerm ? `No sessions matching "${searchTerm}"` : "You haven't created any attendance sessions yet."}
            </p>
            {!searchTerm && (
              <button
                onClick={() => navigate('/dashboard/sessions/new')}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-primary text-black rounded-lg hover:bg-primary/90 transition-colors"
              >
                Create Your First Session
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSessions.map(session => {
              const isExpired = session.is_active && new Date(session.end_time) < new Date();
              const status = session.is_active ? (isExpired ? 'EXPIRED' : 'ACTIVE') : 'ENDED';
              const statusStyles: Record<string, string> = {
                'ACTIVE': 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
                'EXPIRED': 'bg-inputmber-50 text-muted-foregroundmber-700 dark:bg-inputmber-500/10 dark:text-muted-foregroundmber-400',
                'ENDED': 'bg-muted text-muted-foreground',
              };

              return (
                <div
                  key={session.id}
                  onClick={() => setSelectedSession(session)}
                  className="bg-surface text-text border border-outline rounded-xl p-4 hover:border-outline hover:shadow-sm transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-10 h-10 rounded-lg bg-surfaceHigh flex items-center justify-center text-xs font-bold text-textMuted group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      {session.course_code?.substring(0, 2) || 'CS'}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-semibold px-2 py-1 rounded-md uppercase tracking-wider ${statusStyles[status]}`}>
                        {status}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSessionToDelete(session.id);
                          setIsDeleteModalOpen(true);
                        }}
                        className="p-1 text-textMuted hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="mb-3">
                    <h4 className="font-headline text-sm font-semibold text-text group-hover:text-primary transition-colors line-clamp-1">{session.course_name}</h4>
                    <div className="flex items-center gap-2 text-xs text-textMuted font-mono mt-0.5">
                      <span className="font-semibold text-primary">{session.course_code}</span>
                      <span>•</span>
                      <span>{session.session_code}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-3 border-t border-outline text-xs text-textMuted">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} />
                      <span>{new Date(session.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users size={12} />
                      <span>{session.attendee_count || 0} students</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Session Detail Dialog */}
        {selectedSession && (
          <SessionDetailDialog
            session={selectedSession}
            onClose={() => setSelectedSession(null)}
            onSessionEnded={() => { fetchSessions(); }}
          />
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-4">
            <div
              {...deleteModalProps}
              aria-labelledby="delete-session-title"
              className="bg-surface text-text border border-outline rounded-none md:rounded-xl w-full h-[100dvh] md:h-auto md:max-w-sm p-6 shadow-xl animate-in zoom-in-95 outline-none overflow-y-auto"
            >
              <div className="text-center space-y-3">
                <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
                  <Trash2 size={24} />
                </div>
                <div>
                  <h3 id="delete-session-title" className="font-headline text-base font-semibold text-text">Delete Session?</h3>
                  <p className="text-sm text-textMuted mt-1.5 leading-relaxed">
                    This will permanently remove the session and all associated records.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-textMuted bg-surfaceHigh rounded-lg hover:bg-surfaceHigh transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteSession}
                  className="flex-1 px-4 py-2.5 text-sm font-medium bg-red-600 text-text rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
