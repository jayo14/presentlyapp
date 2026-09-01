import React, { useState, useEffect, useMemo } from 'react';
import { Users, Plus, Edit2, Trash2, Search, Filter, Mail, Shield, AlertCircle, Loader, Download, UserX, UserCheck, Key, Eye, MoreVertical, X, ShieldAlert, AlertTriangle } from 'lucide-react';
import { Button } from '../Button';
import { Input } from '../Input';
import { User, UserRole } from '../../types';
import apiClient from '../../services/api/client';
import { toast } from 'sonner';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';
import { SEO } from '../SEO';

const RESTRICTION_REASONS = [
  { value: 'SUSPICIOUS_ACTIVITY', label: 'Suspicious activity or anomalous behavior detected' },
  { value: 'SECURITY_FLAG', label: 'Security verification flag / Identity discrepancy' },
  { value: 'POTENTIAL_FRAUD', label: 'Potential fraudulent activity or policy violation' },
  { value: 'ACADEMIC_MISCONDUCT', label: 'Academic integrity investigation or policy breach' },
  { value: 'ADMINISTRATIVE_HOLD', label: 'Administrative hold / Pending review by institution' },
  { value: 'OTHER', label: 'Other administrative reason' },
];

export const UserManagement: React.FC = () => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [onboardingFilter, setOnboardingFilter] = useState<string>('all');

  // Restriction modal state
  const [showRestrictModal, setShowRestrictModal] = useState(false);
  const [restrictTargetUser, setRestrictTargetUser] = useState<User | null>(null);
  const [restrictionReason, setRestrictionReason] = useState<string>('SUSPICIOUS_ACTIVITY');
  const [restrictionNote, setRestrictionNote] = useState<string>('');
  const [isSubmittingRestriction, setIsSubmittingRestriction] = useState(false);

  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsersCount, setTotalUsersCount] = useState(0);
  const pageSize = 30;
  
  const [userStats, setUserStats] = useState({
    total_users: 0,
    students: 0,
    lecturers: 0,
    admins: 0
  });

  const { modalProps } = useModalAccessibility(showModal, () => setShowModal(false));

  // Removed redundant loadAllUsers call; handled by the effect with dependencies below.

  useEffect(() => {
    setCurrentPage(1);
  }, [roleFilter, searchTerm, activeFilter, onboardingFilter]);

  const loadUsersData = async (page: number, search: string, role: string, active: string, onboarding: string) => {
    try {
      setLoading(true);
      
      const params: any = {
        page,
        search: search || undefined,
        role: role !== 'all' ? role : undefined,
        active: active !== 'all' ? active : undefined,
        onboarding: onboarding !== 'all' ? onboarding : undefined
      };

      const [usersRes, statsRes] = await Promise.all([
        apiClient.get('/users/', { params }),
        apiClient.get('/users/stats/')
      ]);
      
      setAllUsers(usersRes.data.results || []);
      setTotalUsersCount(usersRes.data.count || 0);

      if (statsRes.data.success) {
        setUserStats(statsRes.data.data);
      }
      
      setError(null);
    } catch (err: any) {
      const errorMsg = 'Failed to load users';
      setError(errorMsg);
      toast.error('Load Error', {
        description: errorMsg
      });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsersData(currentPage, searchTerm, roleFilter, activeFilter, onboardingFilter);
  }, [currentPage, searchTerm, roleFilter, activeFilter, onboardingFilter]);

  const loadAllUsers = () => {
    loadUsersData(currentPage, searchTerm, roleFilter, activeFilter, onboardingFilter);
  };

  const loadUsers = async () => {
    await loadUsersData(currentPage, searchTerm, roleFilter, activeFilter, onboardingFilter);
  };

  // Logic for display
  const totalPages = Math.ceil(totalUsersCount / pageSize) || 1;
  const displayUsers = allUsers; // Now directly from the server
  const filteredUsersCount = totalUsersCount; // Server-side count

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await apiClient.delete(`/users/${id}/`);
      toast.success('User Deleted', {
        description: 'User has been successfully deleted'
      });
      await loadAllUsers();
    } catch (err: any) {
      toast.error('Delete Failed', {
        description: err.response?.data?.error || 'Failed to delete user'
      });
      console.error(err);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: UserRole) => {
    try {
      await apiClient.patch(`/users/${userId}/`, { role: newRole });
      toast.success('Role Updated', {
        description: 'User role has been updated successfully'
      });
      await loadAllUsers();
    } catch (err: any) {
      toast.error('Update Failed', {
        description: err.response?.data?.error || 'Failed to update user role'
      });
      console.error(err);
    }
  };

  const handleSuspendUser = async (userId: string, suspend: boolean) => {
    try {
      await apiClient.patch(`/users/${userId}/`, { is_active: !suspend });
      toast.success(suspend ? 'User Suspended' : 'User Activated', {
        description: `User has been ${suspend ? 'suspended' : 'activated'} successfully`
      });
      await loadAllUsers();
    } catch (err: any) {
      toast.error('Action Failed', {
        description: err.response?.data?.error || `Failed to ${suspend ? 'suspend' : 'activate'} user`
      });
      console.error(err);
    }
  };

  const handleOpenRestrictionModal = (user: User) => {
    setRestrictTargetUser(user);
    setRestrictionReason(user.restriction_reason || 'SUSPICIOUS_ACTIVITY');
    setRestrictionNote(user.restriction_note || '');
    setShowRestrictModal(true);
  };

  const handleConfirmToggleRestriction = async () => {
    if (!restrictTargetUser) return;
    try {
      setIsSubmittingRestriction(true);
      const isRestricting = !restrictTargetUser.is_restricted;
      const res = await apiClient.post(`/users/${restrictTargetUser.id}/toggle-restriction/`, {
        restrict: isRestricting,
        reason: isRestricting ? restrictionReason : undefined,
        note: isRestricting ? restrictionNote : undefined,
      });

      if (res.data.success) {
        toast.success(isRestricting ? 'User Access Restricted' : 'Restriction Lifted', {
          description: res.data.message
        });
        setShowRestrictModal(false);
        setRestrictTargetUser(null);
        await loadAllUsers();
      }
    } catch (err: any) {
      toast.error('Restriction Update Failed', {
        description: err.response?.data?.error || 'Failed to update restriction state'
      });
      console.error(err);
    } finally {
      setIsSubmittingRestriction(false);
    }
  };


  const handleResetPassword = async (userId: string, email: string) => {
    if (!confirm(`Send password reset email to ${email}?`)) {
      return;
    }

    try {
      await apiClient.post(`/users/${userId}/reset-password/`);
      toast.success('Reset Email Sent', {
        description: 'Password reset instructions have been sent to the user'
      });
    } catch (err: any) {
      toast.error('Send Failed', {
        description: err.response?.data?.error || 'Failed to send reset email'
      });
      console.error(err);
    }
  };

  const handleSendEmail = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'bg-purple-500/10 text-purple-500 border-purple-500/30';
      case UserRole.LECTURER:
        return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
      case UserRole.CLASS_REP:
        return 'bg-green-500/10 text-green-500 border-green-500/30';
      default:
        return 'bg-surfaceHigh text-muted-foreground border-zinc-600';
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setRoleFilter('all');
    setActiveFilter('all');
    setOnboardingFilter('all');
    setCurrentPage(1);
  };

  const exportUsers = () => {
    const csv = [
      ['Name', 'Email', 'Role', 'Institution', 'College', 'Onboarding Complete'].join(','),
      ...displayUsers.map(user => [
        user.full_name || user.name || 'No Name',
        user.email,
        user.role,
        user.institution || user.institution_id || 'N/A',
        user.college || user.college_id || 'N/A',
        user.onboarding_complete ? 'Yes' : 'No'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${new Date().toISOString()}.csv`;
    a.click();
  };

  if (loading && allUsers.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SEO title="Users | Admin | Presently" description="Manage system users and their roles and permissions." />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-primary" />
          <div>
            <h2 className="font-headline text-2xl font-bold text-text">User Management</h2>
            <p className="text-sm text-textMuted">Manage system users and permissions</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {(searchTerm || roleFilter !== 'all' || activeFilter !== 'all' || onboardingFilter !== 'all') && (
            <Button onClick={clearFilters} variant="ghost" className="gap-2 text-textMuted hover:text-text">
              <X className="w-4 h-4" />
              Clear Filters
            </Button>
          )}
          <Button onClick={exportUsers} variant="secondary" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-red-500 font-semibold">Error</p>
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface border border-outline rounded-lg p-4">
          <p className="text-textMuted text-sm">Total Users</p>
          <p className="text-2xl font-bold text-text">{userStats.total_users}</p>
        </div>
        <div className="bg-surface border border-outline rounded-lg p-4">
          <p className="text-textMuted text-sm">Students</p>
          <p className="text-2xl font-bold text-text">{userStats.students}</p>
        </div>
        <div className="bg-surface border border-outline rounded-lg p-4">
          <p className="text-textMuted text-sm">Lecturers</p>
          <p className="text-2xl font-bold text-text">{userStats.lecturers}</p>
        </div>
        <div className="bg-surface border border-outline rounded-lg p-4">
          <p className="text-textMuted text-sm">Admins</p>
          <p className="text-2xl font-bold text-text">{userStats.admins}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-surface p-4 border border-outline rounded-lg">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-textMuted" />
          <Input
            type="text"
            placeholder="Search name, email, matric..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10 text-sm"
          />
        </div>
        
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-textMuted z-10" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-surfaceHigh border border-outline rounded-lg text-sm text-text focus:outline-none focus:border-primary appearance-none cursor-pointer h-10"
          >
            <option value="all">Any Role</option>
            <option value={UserRole.STUDENT}>Students</option>
            <option value={UserRole.LECTURER}>Lecturers</option>
            <option value={UserRole.ADMIN}>Admins</option>
            <option value={UserRole.CLASS_REP}>Class Reps</option>
          </select>
        </div>

        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-textMuted z-10">
            <Shield className="w-full h-full" />
          </div>
          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-surfaceHigh border border-outline rounded-lg text-sm text-text focus:outline-none focus:border-primary appearance-none cursor-pointer h-10"
          >
            <option value="all">Any Status</option>
            <option value="true">Active Only</option>
            <option value="false">Suspended Only</option>
          </select>
        </div>

        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-textMuted z-10">
            <AlertCircle className="w-full h-full" />
          </div>
          <select
            value={onboardingFilter}
            onChange={(e) => setOnboardingFilter(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-surfaceHigh border border-outline rounded-lg text-sm text-text focus:outline-none focus:border-primary appearance-none cursor-pointer h-10"
          >
            <option value="all">Any Onboarding</option>
            <option value="true">Completed</option>
            <option value="false">Pending</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-surface border border-outline rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surfaceHigh">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-textMuted uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-textMuted uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-textMuted uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-textMuted uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {displayUsers.map(user => (
                <tr key={user.id} className="hover:bg-surfaceHigh/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-primary font-semibold">
                          {(user.full_name || user.name || user.email || 'U').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-text">{user.full_name || user.name || 'No Name'}</div>
                        <div className="text-sm text-textMuted">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={user.role}
                      onChange={(e) => handleUpdateRole(user.id, e.target.value as UserRole)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(user.role)} bg-transparent`}
                    >
                      <option value={UserRole.STUDENT}>Student</option>
                      <option value={UserRole.LECTURER}>Lecturer</option>
                      <option value={UserRole.ADMIN}>Admin</option>
                      <option value={UserRole.CLASS_REP}>Class Rep</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1 items-start">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.onboarding_complete
                          ? 'bg-green-500/10 text-green-500'
                          : 'bg-yellow-500/10 text-yellow-500'
                      }`}>
                        {user.onboarding_complete ? 'Active' : 'Pending'}
                      </span>
                      {user.is_restricted && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/10 text-red-500 border border-red-500/30 flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3" /> Restricted
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleViewUser(user)}
                        className="p-2 text-textMuted hover:text-text hover:bg-surfaceLow rounded-lg transition-all"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      <div className="relative">
                        <button
                          onClick={() => setShowActionsMenu(showActionsMenu === user.id ? null : user.id)}
                          className={`p-2 rounded-lg transition-all ${
                            showActionsMenu === user.id 
                              ? 'bg-primary text-background' 
                              : 'text-muted-foreground hover:text-background hover:bg-surfaceHigh'
                          }`}
                          title="More Actions"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {showActionsMenu === user.id && (
                          <>
                            <div 
                              className="fixed inset-0 z-10" 
                              onClick={() => setShowActionsMenu(null)}
                            ></div>
                            <div className="absolute right-0 mt-2 w-52 rounded-xl bg-surface border border-outline shadow-2xl z-20 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                              <button
                                onClick={() => {
                                  handleSendEmail(user.email);
                                  setShowActionsMenu(null);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-textMuted hover:bg-surfaceHigh transition-colors"
                              >
                                <Mail className="w-4 h-4" />
                                <span>Send Email</span>
                              </button>
                              <button
                                onClick={() => {
                                  handleResetPassword(user.id, user.email);
                                  setShowActionsMenu(null);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-textMuted hover:bg-surfaceHigh transition-colors"
                              >
                                <Key className="w-4 h-4" />
                                <span>Reset Password</span>
                              </button>

                              <button
                                onClick={() => {
                                  handleOpenRestrictionModal(user);
                                  setShowActionsMenu(null);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                                  user.is_restricted
                                    ? 'text-emerald-500 hover:bg-emerald-500/10'
                                    : 'text-red-500 hover:bg-red-500/10'
                                }`}
                              >
                                <ShieldAlert className="w-4 h-4" />
                                <span>{user.is_restricted ? 'Lift Restriction' : 'Restrict Access'}</span>
                              </button>

                              <button
                                onClick={() => {
                                  handleSuspendUser(user.id, user.is_active !== false);
                                  setShowActionsMenu(null);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                                  user.is_active !== false
                                    ? 'text-yellow-500 hover:bg-yellow-500/10'
                                    : 'text-green-500 hover:bg-green-500/10'
                                }`}
                              >

                                {user.is_active !== false ? (
                                  <>
                                    <UserX className="w-4 h-4" />
                                    <span>Suspend User</span>
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="w-4 h-4" />
                                    <span>Activate User</span>
                                  </>
                                )}
                              </button>
                              <div className="h-px bg-surfaceHigh my-1"></div>
                              <button
                                onClick={() => {
                                  handleDeleteUser(user.id);
                                  setShowActionsMenu(null);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>Delete User</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between p-4">
          <span className="text-sm text-textMuted">
            Showing {displayUsers.length} of {totalUsersCount} users
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm rounded-md border border-outline bg-surfaceHigh text-text hover:bg-surfaceLow disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-textMuted px-2">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm rounded-md border border-outline bg-surfaceHigh text-text hover:bg-surfaceLow disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
      {displayUsers.length === 0 && !loading && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-textMuted mx-auto mb-4" />
          <p className="text-textMuted">No users found</p>
        </div>
      )}

      {/* User Details Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div 
            {...modalProps}
            aria-labelledby="user-details-title"
            className="bg-surface border border-outline rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto outline-none"
          >
            <div className="p-6 border-b border-outline flex justify-between items-center">
              <h3 id="user-details-title" className="font-headline text-xl font-bold text-text">User Details</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-textMuted hover:text-text transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-semibold text-2xl">
                    {selectedUser.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <h4 className="font-headline text-lg font-semibold text-text">{selectedUser.full_name || selectedUser.name || 'No Name'}</h4>
                  <p className="text-textMuted">{selectedUser.email}</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 border ${getRoleColor(selectedUser.role)}`}>
                    {selectedUser.role}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div>
                  <p className="text-xs text-textMuted uppercase">Status</p>
                  <p className="text-text font-medium mt-1">
                    {selectedUser.is_active !== false ? 'Active' : 'Suspended'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-textMuted uppercase">Onboarding</p>
                  <p className="text-text font-medium mt-1">
                    {selectedUser.onboarding_complete ? 'Complete' : 'Pending'}
                  </p>
                </div>
                {selectedUser.matric_number && (
                  <div>
                    <p className="text-xs text-textMuted uppercase">Matric Number</p>
                    <p className="text-text font-medium mt-1">{selectedUser.matric_number}</p>
                  </div>
                )}
                {selectedUser.level && (
                  <div>
                    <p className="text-xs text-textMuted uppercase">Level</p>
                    <p className="text-text font-medium mt-1">{selectedUser.level}</p>
                  </div>
                )}
                {selectedUser.department && (
                  <div className="col-span-2">
                    <p className="text-xs text-textMuted uppercase">Department</p>
                    <p className="text-text font-medium mt-1">{selectedUser.department}</p>
                  </div>
                )}
                {selectedUser.college && (
                  <div className="col-span-2">
                    <p className="text-xs text-textMuted uppercase">College</p>
                    <p className="text-text font-medium mt-1">{selectedUser.college}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-6 pt-4 border-t border-outline">
                <Button
                  variant="secondary"
                  onClick={() => handleSendEmail(selectedUser.email)}
                  className="flex-1"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Send Email
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    handleResetPassword(selectedUser.id, selectedUser.email);
                    setShowModal(false);
                  }}
                  className="flex-1"
                >
                  <Key className="w-4 h-4 mr-2" />
                  Reset Password
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Restriction Dialog / Modal */}
      {showRestrictModal && restrictTargetUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-surface border border-outline rounded-xl max-w-md w-full overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-outline flex justify-between items-center bg-surfaceLow">
              <div className="flex items-center gap-3">
                <ShieldAlert className={`w-6 h-6 ${restrictTargetUser.is_restricted ? 'text-emerald-500' : 'text-red-500'}`} />
                <h3 className="font-headline text-lg font-bold text-text">
                  {restrictTargetUser.is_restricted ? 'Lift User Restriction' : 'Restrict Account Access'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowRestrictModal(false);
                  setRestrictTargetUser(null);
                }}
                className="text-textMuted hover:text-text"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 bg-surfaceHigh rounded-lg border border-outline text-xs space-y-1">
                <p className="text-text font-medium">{restrictTargetUser.full_name || restrictTargetUser.name || 'User'}</p>
                <p className="text-textMuted">{restrictTargetUser.email}</p>
              </div>

              {!restrictTargetUser.is_restricted ? (
                <>
                  <div>
                    <label className="block text-xs font-medium text-textMuted uppercase mb-2">
                      Restriction Reason
                    </label>
                    <select
                      value={restrictionReason}
                      onChange={(e) => setRestrictionReason(e.target.value)}
                      className="w-full px-3 py-2 bg-surfaceHigh border border-outline rounded-lg text-sm text-text focus:outline-none focus:border-primary"
                    >
                      {RESTRICTION_REASONS.map((reason) => (
                        <option key={reason.value} value={reason.value}>
                          {reason.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-textMuted uppercase mb-2">
                      Internal / Custom Admin Note (Optional)
                    </label>
                    <textarea
                      value={restrictionNote}
                      onChange={(e) => setRestrictionNote(e.target.value)}
                      placeholder="Add details for the user or internal administrative notes..."
                      className="w-full px-3 py-2 bg-surfaceHigh border border-outline rounded-lg text-sm text-text focus:outline-none focus:border-primary h-24 resize-none"
                    />
                  </div>

                  <p className="text-xs text-red-400 leading-relaxed">
                    Restricting this account will immediately block dashboard access for this user and display a tailored restriction dialog with contact instructions.
                  </p>
                </>
              ) : (
                <p className="text-sm text-textMuted leading-relaxed">
                  Are you sure you want to lift the restriction for <span className="font-semibold text-text">{restrictTargetUser.email}</span>? They will regain full dashboard access.
                </p>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-outline">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowRestrictModal(false);
                    setRestrictTargetUser(null);
                  }}
                  disabled={isSubmittingRestriction}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleConfirmToggleRestriction}
                  isLoading={isSubmittingRestriction}
                  className={restrictTargetUser.is_restricted ? 'bg-emerald-600 hover:bg-emerald-700 text-white gap-2' : 'bg-red-600 hover:bg-red-700 text-white gap-2'}
                >

                  {restrictTargetUser.is_restricted ? 'Lift Restriction' : 'Apply Restriction'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default UserManagement;
