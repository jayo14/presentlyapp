import React, { useState, useEffect } from 'react';
import { 
  Users, MagnifyingGlass, Funnel, 
  DotsThreeVertical, Envelope, Key, 
  UserCircleMinus, UserCirclePlus, Trash,
  CaretRight, IdentificationCard, Buildings
} from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../../../services/api/client';
import { User, UserRole } from '../../../types';
import { toast } from 'sonner';
import { SEO } from '../../SEO';


export const UserManagementMobile: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => { loadUsers(); }, [currentPage, roleFilter, searchTerm]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        search: searchTerm || undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined,
      };
      const response = await apiClient.get('/users/', { params });
      setUsers(response.data.results);
    } catch (e) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (user: User) => {
    try {
      await apiClient.patch(`/users/${user.id}/`, { is_active: !user.is_active });
      toast.success(user.is_active ? 'User suspended' : 'User activated');
      loadUsers();
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <SEO title="User Directory | Presently Admin" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-3xl font-bold tracking-tight">Directory</h1>
           <p className="text-on-surface-variant font-medium">Manage academic community.</p>
        </div>
        <button className="w-12 h-12 rounded-2xl bg-sungold text-black flex items-center justify-center shadow-gold active:scale-90 transition-transform">
          <Funnel size={24} weight="bold" />
        </button>
      </div>

      {/* Search & Filter */}
      <div className="space-y-4">
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
            <MagnifyingGlass size={20} weight="bold" />
          </div>
          <input 
            type="text"
            placeholder="Search name, email, matric..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-14 pl-12 pr-4 bg-surface-container border border-outline rounded-2xl outline-none focus:border-sungold transition-all"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {['all', 'STUDENT', 'LECTURER', 'ADMIN'].map(role => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                roleFilter === role 
                ? 'bg-presently-black text-white' 
                : 'bg-surface-container text-on-surface-variant border border-outline'
              }`}
            >
              {role === 'all' ? 'All Roles' : role}
            </button>
          ))}
        </div>
      </div>

      {/* User List */}
      <div className="space-y-4">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="h-32 bg-surface-container animate-pulse rounded-3xl" />)
        ) : users.length > 0 ? (
          users.map((user) => (
            <motion.div 
              key={user.id}
              layout
              className="p-5 rounded-[32px] bg-surface border border-outline shadow-sm space-y-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-warm-ivory border border-outline flex items-center justify-center text-sungold font-bold text-xl uppercase">
                   {user.full_name?.charAt(0) || user.email.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                   <h3 className="font-bold text-lg leading-tight truncate">{user.full_name || 'Anonymous'}</h3>
                   <p className="text-xs text-on-surface-variant truncate">{user.email}</p>
                   <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                        user.role === 'ADMIN' ? 'bg-error/10 text-error' : 
                        user.role === 'LECTURER' ? 'bg-primary/10 text-primary' : 
                        'bg-success/10 text-success'
                      }`}>
                        {user.role}
                      </span>
                      {!user.is_active && (
                        <span className="px-2 py-0.5 rounded-lg bg-on-surface-variant/10 text-on-surface-variant text-[8px] font-black uppercase tracking-widest">
                          Suspended
                        </span>
                      )}
                   </div>
                </div>
                <button className="p-2 text-on-surface-variant">
                   <DotsThreeVertical size={24} weight="bold" />
                </button>
              </div>

              <div className="flex gap-2">
                 <button 
                   onClick={() => handleStatusToggle(user)}
                   className={`flex-1 h-11 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all ${
                     user.is_active 
                     ? 'bg-error/5 text-error border border-error/10' 
                     : 'bg-success/5 text-success border border-success/10'
                   }`}
                 >
                    {user.is_active ? <UserCircleMinus size={18} weight="duotone" /> : <UserCirclePlus size={18} weight="duotone" />}
                    {user.is_active ? 'Suspend' : 'Activate'}
                 </button>
                 <button 
                   onClick={() => window.location.href = `mailto:${user.email}`}
                   className="w-11 h-11 flex items-center justify-center rounded-xl text-primary bg-primary/5 border border-primary/10 active:scale-90 transition-all"
                 >
                    <Envelope size={18} weight="duotone" />
                 </button>
                 <button 
                   className="w-11 h-11 flex items-center justify-center rounded-xl text-on-surface-variant bg-surface-container border border-outline active:scale-90 transition-all"
                 >
                    <IdentificationCard size={18} weight="duotone" />
                 </button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-20 bg-surface-container rounded-[40px] border border-dashed border-outline">
             <Users size={64} weight="duotone" className="mx-auto text-on-surface-variant opacity-20 mb-4" />
             <p className="text-sm text-on-surface-variant font-medium">No users found.</p>
          </div>
        )}
      </div>
    </div>
  );
};
