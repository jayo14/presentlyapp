import React, { useState, useEffect } from 'react';
import { 
  Users, MagnifyingGlass, Funnel, 
  Envelope, Key,
  UserCircleMinus, UserCirclePlus, Trash,
  IdentificationCard, Buildings
} from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../../../services/api/client';
import { User } from '../../../types';
import { toast } from 'sonner';
import { SEO } from '../../SEO';
import { useBreakpoint } from '../../../hooks/useBreakpoint';
import { UserManagement } from '../../Admin/UserManagement';
import { Badge } from '../../../src/components/ui/badge';
import { cn } from '../../../src/components/ui/utils';

export const UserManagementMobile: React.FC = () => {
  const isDesktop = !useBreakpoint('md');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => { loadUsers(); }, [roleFilter, searchTerm]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = {
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

  if (isDesktop) return <UserManagement />;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <SEO title="User Directory | Presently Mobile" />

      <div className="flex flex-col gap-1">
         <h1 className="text-3xl font-display font-bold text-presently-black">Identity</h1>
         <p className="text-on-surface-variant font-medium text-sm">System directory and access control</p>
      </div>

      <div className="flex flex-col gap-4">
         <div className="relative group">
            <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant transition-colors group-focus-within:text-sungold" size={18} />
            <input
              placeholder="Search users..."
              className="w-full h-12 pl-11 pr-4 bg-surface border border-outline rounded-2xl text-sm font-bold focus:ring-4 focus:ring-sungold/10 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
         <div className="flex bg-surface-highest/20 p-1.5 rounded-2xl border border-outline/30 overflow-x-auto no-scrollbar">
            {['all', 'admin', 'lecturer', 'student'].map(role => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={cn(
                  "px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                  roleFilter === role ? "bg-white text-presently-black shadow-sm" : "text-on-surface-variant"
                )}
              >
                {role}
              </button>
            ))}
         </div>
      </div>

      <div className="space-y-4 pb-24">
         {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 bg-slate-100 animate-pulse rounded-[2rem]" />
            ))
         ) : (
           users.map(user => (
             <div key={user.id} className="p-6 bg-surface border border-outline rounded-[2rem] shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                   <div className="w-12 h-12 rounded-[30%] bg-warm-ivory border border-outline flex items-center justify-center text-sungold font-display font-bold text-lg">
                      {user.full_name?.charAt(0)}
                   </div>
                   <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-presently-black line-clamp-1">{user.full_name || 'Incomplete Profile'}</h3>
                      <p className="text-xs text-on-surface-variant truncate">{user.email}</p>
                   </div>
                   <Badge variant={user.is_active ? 'present' : 'absent'}>
                      {user.is_active ? 'ACTIVE' : 'LOCKED'}
                   </Badge>
                </div>
                <div className="flex items-center justify-between border-t border-outline/40 pt-4">
                   <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                         <IdentificationCard size={14} className="text-sungold" />
                         <span>{user.matric_number || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                         <Buildings size={14} className="text-sungold" />
                         <span className="truncate max-w-[80px]">{user.institution_name || 'SYSTEM'}</span>
                      </div>
                   </div>
                </div>
             </div>
           ))
         )}
      </div>
    </div>
  );
};
