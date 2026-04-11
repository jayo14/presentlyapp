import React, { useState, useEffect, useMemo } from 'react';
import { Users, Plus, Edit2, Trash2, Search, Filter, Mail, Shield, AlertCircle, Loader, Download, UserX, UserCheck, Key, Eye, MoreVertical, X } from 'lucide-react';
import { Button } from '../Button';
import { Input } from '../Input';
import { User, UserRole } from '../../types';
import apiClient from '../../services/api/client';
import { toast } from 'sonner';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';
import { SEO } from '../SEO';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [onboardingFilter, setOnboardingFilter] = useState<string>('all');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [userStats, setUserStats] = useState({
    total_users: 0,
    students: 0,
    lecturers: 0,
    admins: 0
  });

  const { modalProps } = useModalAccessibility(showModal, () => setShowModal(false));

  useEffect(() => {
    setCurrentPage(1);
  }, [roleFilter, searchTerm, activeFilter, onboardingFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers(currentPage);
    }, 300); // Standard debounce for typing and pagination
    return () => clearTimeout(timer);
  }, [roleFilter, searchTerm, activeFilter, onboardingFilter, currentPage]);

  const loadUsers = async (page: number) => {
    try {
      setLoading(true);
      const params: any = { page };
      if (roleFilter !== 'all') {
        params.role = roleFilter;
      }
      if (searchTerm) {
        params.search = searchTerm;
      }
      if (activeFilter !== 'all') {
        params.active = activeFilter;
      }
      if (onboardingFilter !== 'all') {
        params.onboarding = onboardingFilter;
      }

      // Fetch users and stats in parallel
      const [usersRes, statsRes] = await Promise.all([
        apiClient.get('/users/', { params }),
        apiClient.get('/users/stats/', { params })
      ]);
      
      setUsers(usersRes.data.results || []);
      const count = usersRes.data.count || 0;
      setTotalUsers(count);
      // Calculate total pages based on count and PAGE_SIZE (30)
      setTotalPages(Math.ceil(count / 30) || 1);

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

  // Real-time local filtering with regex support
  const displayUsers = useMemo(() => {
    let filtered = users;

    // Apply local regex search if searchTerm exists
    if (searchTerm) {
      try {
        const regex = new RegExp(searchTerm, 'i');
        filtered = filtered.filter(user => 
          regex.test(user.name || '') || 
          regex.test(user.email || '') ||
          regex.test(user.matric_number || '')
        );
      } catch (e) {
        const lowerSearch = searchTerm.toLowerCase();
        filtered = filtered.filter(user => 
          (user.name || '').toLowerCase().includes(lowerSearch) || 
          (user.email || '').toLowerCase().includes(lowerSearch) ||
          (user.matric_number || '').toLowerCase().includes(lowerSearch)
        );
      }
    }

    // Apply local filters for role, active, and onboarding (as fallback/additional layer)
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }
    if (activeFilter !== 'all') {
      filtered = filtered.filter(user => 
        (activeFilter === 'true' ? user.is_active !== false : user.is_active === false)
      );
    }
    if (onboardingFilter !== 'all') {
      filtered = filtered.filter(user => 
        (onboardingFilter === 'true' ? user.onboarding_complete : !user.onboarding_complete)
      );
    }

    return filtered;
  }, [users, searchTerm, roleFilter, activeFilter, onboardingFilter]);

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await apiClient.delete(`/users/${id}/`);
      toast.success('User Deleted', {
        description: 'User has been successfully deleted'
      });
      await loadUsers(currentPage);
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
      await loadUsers(currentPage);
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
      await loadUsers(currentPage);
    } catch (err: any) {
      toast.error('Action Failed', {
        description: err.response?.data?.error || `Failed to ${suspend ? 'suspend' : 'activate'} user`
      });
      console.error(err);
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
        user.name || 'No Name',
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

  if (loading && users.length === 0) {
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
                          {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-text">{user.name || 'No Name'}</div>
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
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.onboarding_complete
                        ? 'bg-green-500/10 text-green-500'
                        : 'bg-yellow-500/10 text-yellow-500'
                    }`}>
                      {user.onboarding_complete ? 'Active' : 'Pending'}
                    </span>
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
                            <div className="absolute right-0 mt-2 w-48 rounded-xl bg-surface border border-outline shadow-2xl z-20 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-right">
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
            Showing {displayUsers.length} of {totalUsers} users
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
                  <h4 className="font-headline text-lg font-semibold text-text">{selectedUser.name || 'No Name'}</h4>
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
    </div>
  );
};

export default UserManagement;
