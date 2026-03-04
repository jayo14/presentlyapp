import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Search, Filter, MoreVertical, Trash2, Plus, Timer, Users } from 'lucide-react';
import { Button } from '../Button';
import { Input } from '../Input';
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

  useEffect(() => {
    fetchSessions();
  }, []);

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
      <SEO
        title="Sessions | Dashboard"
        description="View and manage all your attendance sessions on Presently."
        noIndex
      />
      <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} aria-label="Back to dashboard">
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Attendance Sessions</h2>
            <p className="text-zinc-500">History of all created attendance sessions.</p>
          </div>
        </div>
        <Button onClick={() => navigate('/dashboard/sessions/new')}>
          <Plus size={18} className="mr-2"/> Create New Session
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <Input 
            placeholder="Search by course code, name or session code..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" className="gap-2">
            <Filter size={18} />
            <span>Filter</span>
          </Button>
          <Button variant="secondary" onClick={fetchSessions} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Sessions Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-48 bg-zinc-100 dark:bg-zinc-800/50 animate-pulse rounded-2xl border border-zinc-200 dark:border-zinc-800"></div>
          ))}
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-zinc-900 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
          <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar className="text-zinc-300 dark:text-zinc-600" size={32} />
          </div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">No sessions found</h3>
          <p className="text-zinc-500 mb-8 max-w-sm mx-auto">
            {searchTerm ? `We couldn't find any sessions matching "${searchTerm}"` : "You haven't created any attendance sessions yet."}
          </p>
          {!searchTerm && (
            <Button onClick={() => navigate('/dashboard/sessions/new')}>
              Create Your First Session
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSessions.map(session => (
            <div 
              key={session.id}
              onClick={() => setSelectedSession(session)}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 hover:shadow-xl hover:border-primary/30 transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-zinc-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  {session.course_code?.substring(0, 2) || 'CS'}
                </div>
                <div className="flex gap-2">
                  {(() => {
                      const isExpired = session.is_active && new Date(session.end_time) < new Date();
                      return (
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider ${session.is_active && !isExpired ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                            {session.is_active ? (isExpired ? 'EXPIRED' : 'ACTIVE') : 'ENDED'}
                          </span>
                      );
                  })()}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSessionToDelete(session.id);
                      setIsDeleteModalOpen(true);
                    }}
                    className="p-1 text-zinc-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-1 mb-6">
                <h4 className="font-bold text-lg text-zinc-900 dark:text-white group-hover:text-primary transition-colors line-clamp-1">{session.course_name}</h4>
                <div className="flex items-center gap-2 text-zinc-500 font-mono text-sm">
                  <span className="font-bold text-primary">{session.course_code}</span>
                  <span>•</span>
                  <span>{session.session_code}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-zinc-100 dark:border-zinc-800 pt-4">
                <div className="flex items-center gap-2 text-sm text-zinc-500">
                  <Calendar size={14} />
                  <span>{new Date(session.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-500 justify-end">
                  <Users size={14} />
                  <span>{session.attendee_count || 0} students</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {selectedSession && (
        <SessionDetailDialog 
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
          onSessionEnded={() => {
            fetchSessions();
          }}
        />
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div 
            {...deleteModalProps}
            aria-labelledby="delete-session-title"
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-sm p-8 shadow-2xl animate-in zoom-in-95 outline-none"
          >
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-full flex items-center justify-center mx-auto">
                <Trash2 size={32} />
              </div>
              <div>
                <h3 id="delete-session-title" className="text-xl font-bold text-zinc-900 dark:text-white">Delete Session?</h3>
                <p className="text-zinc-500 mt-2 text-sm leading-relaxed">
                  This will permanently remove the attendance session and all associated records.
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <Button variant="secondary" className="flex-1 h-12 rounded-xl" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
              <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white border-none shadow-none h-12 rounded-xl" onClick={handleDeleteSession}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
};
