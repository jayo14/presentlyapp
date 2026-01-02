import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, Search, Filter, Mail, Shield, AlertCircle, Loader, Download, UserX, UserCheck, Key, Eye, MoreVertical, X } from 'lucide-react';
import { Button } from '../Button';
import { Input } from '../Input';
import { User, UserRole } from '../../types';
import apiClient from '../../services/api/client';
import { toast } from 'sonner';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = roleFilter !== 'all' ? { role: roleFilter } : {};
      const response = await apiClient.get('/users/', { params });
      // Handle paginated response from Django REST Framework
      const usersData = response.data.results || response.data;
      setUsers(Array.isArray(usersData) ? usersData : []);
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

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await apiClient.delete(`/users/${id}/`);
      toast.success('User Deleted', {
        description: 'User has been successfully deleted'
      });
      await loadUsers();
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
      await loadUsers();
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
      await loadUsers();
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
        return 'bg-zinc-700 text-zinc-400 border-zinc-600';
    }
  };

  const exportUsers = () => {
    const csv = [
      ['Name', 'Email', 'Role', 'Institution', 'College', 'Onboarding Complete'].join(','),
      ...filteredUsers.map(user => [
        user.name || 'No Name',
        user.email,
        user.role,
        user.institution_id || 'N/A',
        user.college_id || 'N/A',
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-primary" />
          <div>
            <h2 className="text-2xl font-bold text-foreground">User Management</h2>
            <p className="text-sm text-zinc-400">Manage system users and permissions</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
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
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <p className="text-zinc-400 text-sm">Total Users</p>
          <p className="text-2xl font-bold text-foreground">{users.length}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <p className="text-zinc-400 text-sm">Students</p>
          <p className="text-2xl font-bold text-foreground">
            {users.filter(u => u.role === UserRole.STUDENT).length}
          </p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <p className="text-zinc-400 text-sm">Lecturers</p>
          <p className="text-2xl font-bold text-foreground">
            {users.filter(u => u.role === UserRole.LECTURER).length}
          </p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <p className="text-zinc-400 text-sm">Admins</p>
          <p className="text-2xl font-bold text-foreground">
            {users.filter(u => u.role === UserRole.ADMIN).length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <Input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-foreground focus:outline-none focus:border-primary"
        >
          <option value="all">All Roles</option>
          <option value={UserRole.STUDENT}>Students</option>
          <option value={UserRole.LECTURER}>Lecturers</option>
          <option value={UserRole.ADMIN}>Admins</option>
          <option value={UserRole.CLASS_REP}>Class Reps</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-zinc-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-primary font-semibold">
                          {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-foreground">{user.name || 'No Name'}</div>
                        <div className="text-sm text-zinc-400">{user.email}</div>
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
                        className="text-zinc-400 hover:text-zinc-200 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleSendEmail(user.email)}
                        className="text-zinc-400 hover:text-zinc-200 transition-colors"
                        title="Send Email"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleResetPassword(user.id, user.email)}
                        className="text-zinc-400 hover:text-zinc-200 transition-colors"
                        title="Reset Password"
                      >
                        <Key className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleSuspendUser(user.id, user.is_active !== false)}
                        className={`transition-colors ${
                          user.is_active !== false
                            ? 'text-yellow-400 hover:text-yellow-300'
                            : 'text-green-400 hover:text-green-300'
                        }`}
                        title={user.is_active !== false ? 'Suspend User' : 'Activate User'}
                      >
                        {user.is_active !== false ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredUsers.length === 0 && !loading && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-400">No users found</p>
        </div>
      )}

      {/* User Details Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
              <h3 className="text-xl font-bold text-foreground">User Details</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-zinc-400 hover:text-white transition-colors"
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
                  <h4 className="text-lg font-semibold text-foreground">{selectedUser.name || 'No Name'}</h4>
                  <p className="text-zinc-400">{selectedUser.email}</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 border ${getRoleColor(selectedUser.role)}`}>
                    {selectedUser.role}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div>
                  <p className="text-xs text-zinc-500 uppercase">Status</p>
                  <p className="text-foreground font-medium mt-1">
                    {selectedUser.is_active !== false ? 'Active' : 'Suspended'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 uppercase">Onboarding</p>
                  <p className="text-foreground font-medium mt-1">
                    {selectedUser.onboarding_complete ? 'Complete' : 'Pending'}
                  </p>
                </div>
                {selectedUser.matric_number && (
                  <div>
                    <p className="text-xs text-zinc-500 uppercase">Matric Number</p>
                    <p className="text-foreground font-medium mt-1">{selectedUser.matric_number}</p>
                  </div>
                )}
                {selectedUser.level && (
                  <div>
                    <p className="text-xs text-zinc-500 uppercase">Level</p>
                    <p className="text-foreground font-medium mt-1">{selectedUser.level}</p>
                  </div>
                )}
                {selectedUser.department && (
                  <div className="col-span-2">
                    <p className="text-xs text-zinc-500 uppercase">Department</p>
                    <p className="text-foreground font-medium mt-1">{selectedUser.department}</p>
                  </div>
                )}
                {selectedUser.college && (
                  <div className="col-span-2">
                    <p className="text-xs text-zinc-500 uppercase">College</p>
                    <p className="text-foreground font-medium mt-1">{selectedUser.college}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-6 pt-4 border-t border-zinc-800">
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
