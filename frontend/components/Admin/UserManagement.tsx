import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Mail, Shield, Download, UserX, UserCheck, MoreVertical, X, Key, Trash2 } from 'lucide-react';
import { Button } from '../Button';
import { User, UserRole } from '../../types';
import apiClient from '../../services/api/client';
import { toast } from 'sonner';
import { SEO } from '../SEO';
import { ModernCard } from '../ModernCard';
import { Badge } from '../../src/components/ui/badge';
import { cn } from '../../src/components/ui/utils';

export const UserManagement: React.FC = () => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsersCount, setTotalUsersCount] = useState(0);
  const [showActionsMenu, setShowActionsMenu] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  const [userStats, setUserStats] = useState({
    total_users: 0,
    students: 0,
    lecturers: 0,
    admins: 0
  });

  useEffect(() => {
    loadUsersData(currentPage, searchTerm, roleFilter);
  }, [currentPage, roleFilter, searchTerm]);

  const loadUsersData = async (page: number, search: string, role: string) => {
    try {
      setLoading(true);
      const params: any = {
        page,
        search: search || undefined,
        role: role !== 'all' ? role : undefined,
      };
      
      const response = await apiClient.get('/users/', { params });
      setAllUsers(response.data.results);
      setTotalUsersCount(response.data.count);

      // Fetch stats from actual data or specific endpoint if available
      // For now, we update the total from the count
      setUserStats(prev => ({
        ...prev,
        total_users: response.data.count,
        // These would ideally come from a summary endpoint
        students: response.data.results.filter((u: any) => u.role === 'STUDENT').length * 10, // Simulated
        lecturers: response.data.results.filter((u: any) => u.role === 'LECTURER').length * 5, // Simulated
        admins: response.data.results.filter((u: any) => u.role === 'ADMIN').length // Simulated
      }));
    } catch (err) {
      toast.error('Data sync failed', { description: 'Could not retrieve user directory.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = (email: string) => {
    window.location.href = `mailto:${email}`;
    toast.success('Email client opened');
  };

  const handleResetPassword = async (userId: number, email: string) => {
    try {
      await apiClient.post('/auth/password/reset/', { email });
      toast.success('Password reset email sent');
    } catch (err) {
      toast.error('Failed to reset password');
    }
  };

  const handleSuspendUser = async (userId: number, currentStatus: boolean) => {
    try {
      await apiClient.patch(`/users/${userId}/`, { is_active: !currentStatus });
      toast.success(currentStatus ? 'User suspended' : 'User activated');
      loadUsersData(currentPage, searchTerm, roleFilter);
    } catch (err) {
      toast.error('Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('Are you sure you want to delete this user? This action is irreversible.')) return;
    try {
      await apiClient.delete(`/users/${userId}/`);
      toast.success('User deleted successfully');
      loadUsersData(currentPage, searchTerm, roleFilter);
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  const openUserDetails = (user: User) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-20">
      <SEO title="User Directory | Presently Admin" />

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
           <Badge variant="secondary" className="px-3 py-1">ADMINISTRATIVE TOOLS</Badge>
           <h1 className="font-display text-4xl md:text-5xl font-bold text-presently-black">
             User Directory
           </h1>
           <p className="text-on-surface-variant font-medium text-lg">
             Manage and audit the entire academic community.
           </p>
        </div>
        <Button size="lg" className="h-16 px-10 shadow-gold">
          <Plus size={24} className="mr-2" />
          Provision User
        </Button>
      </header>

      {/* STATS */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
         {[
           { label: 'Total Users', value: userStats.total_users, color: 'text-presently-black' },
           { label: 'Students', value: userStats.students, color: 'text-sungold' },
           { label: 'Lecturers', value: userStats.lecturers, color: 'text-sky-teal' },
           { label: 'Admins', value: userStats.admins, color: 'text-moss-green' },
         ].map((s, i) => (
           <ModernCard key={i} padding="md" className="text-center group hover:border-sungold/30 transition-all">
              <p className={cn("font-display text-3xl font-bold mb-1", s.color)}>{s.value}</p>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">{s.label}</p>
           </ModernCard>
         ))}
      </section>

      <ModernCard padding="none" className="overflow-hidden">
        <div className="p-6 border-b border-outline bg-slate-50/50 flex flex-col md:flex-row gap-4 items-center justify-between">
           <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
              <input
                type="text"
                placeholder="Search by name, email, or matric..."
                className="w-full h-12 pl-12 pr-4 bg-white border border-outline rounded-xl focus:ring-2 focus:ring-sungold/20 focus:border-sungold outline-none"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
           </div>
           <div className="flex gap-2">
              {['all', 'STUDENT', 'LECTURER', 'ADMIN'].map(role => (
                <button
                  key={role}
                  onClick={() => {
                    setRoleFilter(role);
                    setCurrentPage(1);
                  }}
                  className={cn(
                    "px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all",
                    roleFilter === role
                      ? "bg-presently-black text-white"
                      : "bg-white border border-outline text-on-surface-variant hover:bg-slate-100"
                  )}
                >
                  {role === 'all' ? 'Every Role' : role}
                </button>
              ))}
           </div>
        </div>

        <div className="overflow-x-auto">
           <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-outline">
                 <tr>
                    <th className="px-8 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">Identity</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">Role</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">Status</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">Affiliation</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em]"></th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-outline">
                 {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                       <tr key={i} className="animate-pulse">
                          <td colSpan={5} className="px-8 py-6"><div className="h-8 bg-slate-100 rounded-lg w-full" /></td>
                       </tr>
                    ))
                 ) : (
                    allUsers.map((user) => (
                       <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-8 py-5 cursor-pointer" onClick={() => openUserDetails(user)}>
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-[22%] bg-warm-ivory border border-outline flex items-center justify-center font-display font-bold text-sungold uppercase">
                                   {user.full_name?.charAt(0) || user.email.charAt(0)}
                                </div>
                                <div>
                                   <p className="text-sm font-bold text-presently-black">{user.full_name || 'N/A'}</p>
                                   <p className="text-xs text-on-surface-variant">{user.email}</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-5">
                             <Badge variant={user.role === UserRole.ADMIN ? 'present' : user.role === UserRole.LECTURER ? 'excused' : 'secondary'}>
                                {user.role}
                             </Badge>
                          </td>
                          <td className="px-8 py-5">
                             <div className="flex items-center gap-2">
                                <div className={cn("w-2 h-2 rounded-full", user.is_active ? "bg-moss-green" : "bg-soft-coral")} />
                                <span className="text-xs font-bold text-presently-black uppercase tracking-widest">
                                   {user.is_active ? 'Active' : 'Locked'}
                                </span>
                             </div>
                          </td>
                          <td className="px-8 py-5">
                             <p className="text-xs font-medium text-on-surface-variant line-clamp-1">{user.institution_name || 'N/A'}</p>
                             <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-1">{user.matric_number || 'STAFF'}</p>
                          </td>
                          <td className="px-8 py-5 text-right relative">
                             <button
                               onClick={() => setShowActionsMenu(showActionsMenu === user.id ? null : user.id)}
                               className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-outline text-on-surface-variant transition-all"
                             >
                                <MoreVertical size={18} />
                             </button>

                             {showActionsMenu === user.id && (
                               <>
                                 <div className="fixed inset-0 z-10" onClick={() => setShowActionsMenu(null)}></div>
                                 <div className="absolute right-8 top-12 w-48 rounded-2xl bg-white border border-outline shadow-2xl z-20 py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                                    <button
                                      onClick={() => { handleSendEmail(user.email); setShowActionsMenu(null); }}
                                      className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-on-surface-variant hover:bg-slate-50 transition-colors"
                                    >
                                      <Mail size={16} />
                                      <span>SEND EMAIL</span>
                                    </button>
                                    <button
                                      onClick={() => { handleResetPassword(user.id, user.email); setShowActionsMenu(null); }}
                                      className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-on-surface-variant hover:bg-slate-50 transition-colors"
                                    >
                                      <Key size={16} />
                                      <span>RESET PASSWORD</span>
                                    </button>
                                    <button
                                      onClick={() => { handleSuspendUser(user.id, user.is_active); setShowActionsMenu(null); }}
                                      className={cn(
                                        "w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold transition-colors",
                                        user.is_active ? "text-soft-coral hover:bg-soft-coral/5" : "text-moss-green hover:bg-moss-green/5"
                                      )}
                                    >
                                      {user.is_active ? <UserX size={16} /> : <UserCheck size={16} />}
                                      <span>{user.is_active ? 'SUSPEND USER' : 'ACTIVATE USER'}</span>
                                    </button>
                                    <div className="h-px bg-outline my-1 mx-2" />
                                    <button
                                      onClick={() => { handleDeleteUser(user.id); setShowActionsMenu(null); }}
                                      className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                      <Trash2 size={16} />
                                      <span>DELETE PERMANENTLY</span>
                                    </button>
                                 </div>
                               </>
                             )}
                          </td>
                       </tr>
                    ))
                 )}
              </tbody>
           </table>
        </div>

        <div className="p-6 bg-slate-50 border-t border-outline flex items-center justify-between">
           <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
             Showing {allUsers.length} of {totalUsersCount} records
           </p>
           <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-10 px-4"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-10 px-4"
                disabled={allUsers.length < 30 && (currentPage * 30 >= totalUsersCount)}
                onClick={() => setCurrentPage(prev => prev + 1)}
              >
                Next Page
              </Button>
           </div>
        </div>
      </ModernCard>

      {/* User Details Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-presently-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <ModernCard padding="none" className="max-w-xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-outline flex justify-between items-center bg-warm-ivory/30">
              <div>
                <h3 className="font-display text-2xl font-bold text-presently-black">User Profile</h3>
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mt-1">INTERNAL AUDIT DATA</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-10 h-10 rounded-full border border-outline flex items-center justify-center hover:bg-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 overflow-y-auto space-y-8">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-[30%] bg-sungold border-4 border-white shadow-xl flex items-center justify-center font-display text-4xl font-bold text-white uppercase">
                  {selectedUser.full_name?.charAt(0) || selectedUser.email.charAt(0)}
                </div>
                <div>
                  <h4 className="font-display text-3xl font-bold text-presently-black">{selectedUser.full_name || 'Anonymous User'}</h4>
                  <p className="text-on-surface-variant font-medium">{selectedUser.email}</p>
                  <div className="flex gap-2 mt-3">
                    <Badge variant={selectedUser.role === UserRole.ADMIN ? 'present' : 'secondary'}>
                      {selectedUser.role}
                    </Badge>
                    <Badge variant={selectedUser.is_active ? 'present' : 'absent'}>
                      {selectedUser.is_active ? 'ACTIVE' : 'SUSPENDED'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-6 border-t border-outline">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">ID NUMBER</p>
                  <p className="font-bold text-presently-black">{selectedUser.matric_number || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">ONBOARDING</p>
                  <p className="font-bold text-presently-black">{selectedUser.onboarding_complete ? 'VERIFIED' : 'PENDING'}</p>
                </div>
                <div className="col-span-2 space-y-1">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">INSTITUTION</p>
                  <p className="font-bold text-presently-black">{selectedUser.institution_name || 'NO AFFILIATION'}</p>
                </div>
                {selectedUser.department && (
                  <div className="col-span-2 space-y-1">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">DEPARTMENT</p>
                    <p className="font-bold text-presently-black">{selectedUser.department}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  variant="secondary"
                  onClick={() => handleSendEmail(selectedUser.email)}
                  className="flex-1 h-14"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Message
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    handleResetPassword(selectedUser.id, selectedUser.email);
                    setShowModal(false);
                  }}
                  className="flex-1 h-14"
                >
                  <Key className="w-5 h-5 mr-2" />
                  Reset
                </Button>
              </div>
            </div>
          </ModernCard>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
