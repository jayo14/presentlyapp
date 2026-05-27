import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, RefreshCw, Plus } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '../Button';
import { staffApi, StaffInvitation, StaffProfile, StaffRole } from '../../services/api/staff';
import { DashboardPage } from '../../src/components/layout-primitives/DashboardPage';
import { ModernCard } from '../ModernCard';
import { Badge } from '../../src/components/ui/badge';
import { cn } from '../../src/components/ui/utils';

const STATUS_BADGE: Record<string, string> = {
  ACTIVE: 'bg-green-500/15 text-green-600',
  PENDING: 'bg-amber-500/15 text-amber-600',
  SUSPENDED: 'bg-red-500/15 text-red-600',
  REVOKED: 'bg-red-500/15 text-red-600',
  ACCEPTED: 'bg-green-500/15 text-green-600',
  EXPIRED: 'bg-slate-100 text-slate-500',
};

export const StaffManagement: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profiles, setProfiles] = useState<StaffProfile[]>([]);
  const [invitations, setInvitations] = useState<StaffInvitation[]>([]);
  const [roles, setRoles] = useState<StaffRole[]>([]);
  const [groups, setGroups] = useState<Record<string, Array<{ codename: string; name: string; dangerous: boolean }>>>({});

  const [form, setForm] = useState({
    email: '',
    full_name: '',
    role_id: '',
    permissions: [] as string[],
  });

  const groupedPermissions = useMemo(() => groups || {}, [groups]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [catalog, staff, invites] = await Promise.all([
        staffApi.getPermissionsCatalog(),
        staffApi.getStaffProfiles(),
        staffApi.getStaffInvitations(),
      ]);

      setGroups(catalog.groups || {});
      setRoles(catalog.roles || []);
      setProfiles(staff.results || []);
      setInvitations(invites.results || []);
    } catch (error: any) {
      toast.error('Failed to load staff data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const togglePermission = (perm: string) => {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter((p) => p !== perm)
        : [...prev.permissions, perm],
    }));
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await staffApi.inviteStaff({
        ...form,
        role_id: form.role_id ? parseInt(form.role_id) : undefined,
      });

      toast.success('Invitation sent');
      setForm({ email: '', full_name: '', role_id: '', permissions: [] });
      await loadData();
    } catch (error: any) {
      toast.error('Failed to send invitation', {
        description: error?.response?.data?.error || 'Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async (invitationId: number) => {
    try {
      await staffApi.resendInvitation(invitationId);
      toast.success('Invitation resent');
      await loadData();
    } catch (error: any) {
      toast.error('Failed to resend invitation');
    }
  };

  const handleRevoke = async (invitationId: number) => {
    try {
      await staffApi.revokeInvitation(invitationId);
      toast.success('Invitation revoked');
      await loadData();
    } catch (error: any) {
      toast.error('Failed to revoke invitation');
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center text-on-surface-variant">
        <RefreshCw className="w-6 h-6 mr-3 animate-spin" />
        <span className="font-bold uppercase tracking-widest text-xs">Loading Secure Directory...</span>
      </div>
    );
  }

  return (
    <DashboardPage
      title="Staff & Permissions"
      description="Invite staff, assign role presets, and override access permissions."
      seoTitle="Staff Management | Presently Admin"
      action={
        <Button variant="outline" size="lg" onClick={() => void loadData()} className="h-16 px-8">
          <RefreshCw className="w-5 h-5 mr-2" /> Refresh
        </Button>
      }
    >
      <div className="space-y-16 lg:space-y-32">
        {/* Invite Form */}
        <ModernCard padding="lg" className="bg-warm-ivory/10 border-outline/40">
          <form onSubmit={handleInvite} className="space-y-12">
            <div className="flex items-center gap-3 mb-4">
              <Plus className="w-5 h-5 text-sungold" />
              <h3 className="text-2xl font-bold text-presently-black font-display">Invite New Staff</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Full Name</label>
                <input
                  placeholder="John Doe"
                  value={form.full_name}
                  onChange={(e) => setForm((prev) => ({ ...prev, full_name: e.target.value }))}
                  required
                  className="w-full h-16 px-6 bg-white border border-outline rounded-2xl text-sm font-bold text-presently-black focus:ring-4 focus:ring-sungold/10 outline-none transition-all"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Email Address</label>
                <input
                  type="email"
                  placeholder="staff@university.edu"
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  required
                  className="w-full h-16 px-6 bg-white border border-outline rounded-2xl text-sm font-bold text-presently-black focus:ring-4 focus:ring-sungold/10 outline-none transition-all"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Role Preset</label>
                <select
                  value={form.role_id}
                  onChange={(e) => setForm((prev) => ({ ...prev, role_id: e.target.value }))}
                  className="w-full h-16 px-6 bg-white border border-outline rounded-2xl text-sm font-bold text-presently-black focus:ring-4 focus:ring-sungold/10 outline-none appearance-none cursor-pointer transition-all"
                >
                  <option value="">Custom role (permissions only)</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-6">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Permission Overrides</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(groupedPermissions).map(([group, perms]) => (
                  <div key={group} className="bg-white border border-outline rounded-3xl p-8 shadow-sm">
                    <p className="text-[10px] font-bold text-sungold uppercase tracking-[0.2em] mb-6 border-b border-outline/50 pb-4">
                      {group.replaceAll('_', ' ')}
                    </p>
                    <div className="space-y-4">
                      {perms.map((perm) => (
                        <label key={perm.codename} className="flex items-center gap-4 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={form.permissions.includes(perm.codename)}
                            onChange={() => togglePermission(perm.codename)}
                            className="w-5 h-5 rounded-lg border-outline text-sungold focus:ring-sungold/20"
                          />
                          <span className="text-xs font-bold text-on-surface group-hover:text-presently-black transition-colors">{perm.name}</span>
                          {perm.dangerous ? <AlertCircle className="w-3.5 h-3.5 text-soft-coral" /> : null}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={submitting} className="h-20 px-16 shadow-gold">
                {submitting ? 'Processing...' : 'Send Invitation'}
              </Button>
            </div>
          </form>
        </ModernCard>

        {/* Staff Directory */}
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-outline/40 pb-6">
            <h3 className="font-display text-3xl font-bold text-presently-black">Active Staff Directory</h3>
            <Badge variant="secondary" className="px-5 py-1.5 font-bold tracking-widest">{profiles.length} MEMBERS</Badge>
          </div>

          <ModernCard padding="none" className="overflow-hidden border-outline/30 shadow-xl">
             <div className="overflow-x-auto no-scrollbar">
                <table className="w-full border-collapse">
                   <thead>
                      <tr className="bg-slate-50/50 border-b border-outline/40">
                         <th className="px-10 py-6 text-left text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">Profile</th>
                         <th className="px-10 py-6 text-left text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">Access Role</th>
                         <th className="px-10 py-6 text-left text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">Status</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-outline/30">
                      {profiles.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-10 py-20 text-center text-on-surface-variant font-medium">
                            No registered staff members found.
                          </td>
                        </tr>
                      ) : (
                        profiles.map((profile) => (
                          <tr key={profile.user.id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-10 py-6">
                               <div className="flex items-center gap-5">
                                  <div className="w-12 h-12 rounded-[30%] bg-warm-ivory border border-outline flex items-center justify-center font-display text-lg font-bold text-sungold uppercase shadow-sm">
                                     {profile.user.full_name?.charAt(0) || profile.user.email.charAt(0)}
                                  </div>
                                  <div>
                                     <p className="font-bold text-presently-black">{profile.user.full_name}</p>
                                     <p className="text-xs font-medium text-on-surface-variant">{profile.user.email}</p>
                                  </div>
                               </div>
                            </td>
                            <td className="px-10 py-6">
                               <Badge variant="secondary" className="bg-slate-100 text-[10px] tracking-widest font-bold">
                                  {profile.role?.name ?? 'CUSTOM'}
                                </Badge>
                            </td>
                            <td className="px-10 py-6">
                               <span className={cn("inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase", STATUS_BADGE[profile.status])}>
                                  {profile.status}
                               </span>
                            </td>
                          </tr>
                        ))
                      )}
                   </tbody>
                </table>
             </div>
          </ModernCard>
        </div>

        {/* Pending Invitations */}
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-outline/40 pb-6">
            <h3 className="font-display text-3xl font-bold text-presently-black">Pending Invitations</h3>
            <Badge variant="secondary" className="px-5 py-1.5 font-bold tracking-widest">{invitations.length} TOTAL</Badge>
          </div>

          <ModernCard padding="none" className="overflow-hidden border-outline/30 shadow-xl">
             <div className="overflow-x-auto no-scrollbar">
                <table className="w-full border-collapse">
                   <thead>
                      <tr className="bg-slate-50/50 border-b border-outline/40">
                         <th className="px-10 py-6 text-left text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">Candidate</th>
                         <th className="px-10 py-6 text-left text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">Target Role</th>
                         <th className="px-10 py-6 text-left text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">Status</th>
                         <th className="px-10 py-6 text-right text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-outline/30">
                      {invitations.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-10 py-20 text-center text-on-surface-variant font-medium">
                            No active invitations.
                          </td>
                        </tr>
                      ) : (
                        invitations.map((invitation) => (
                          <tr key={invitation.id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-10 py-6">
                               <div>
                                  <p className="font-bold text-presently-black">{invitation.full_name}</p>
                                  <p className="text-xs font-medium text-on-surface-variant">{invitation.email}</p>
                               </div>
                            </td>
                            <td className="px-10 py-6">
                               <Badge variant="secondary" className="bg-slate-100 text-[10px] tracking-widest font-bold">
                                  {invitation.role?.name ?? 'CUSTOM'}
                                </Badge>
                            </td>
                            <td className="px-10 py-6">
                               <span className={cn("inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase", STATUS_BADGE[invitation.status])}>
                                  {invitation.status === 'ACCEPTED' && <CheckCircle2 className="w-3.5 h-3.5" />}
                                  {invitation.status}
                               </span>
                            </td>
                            <td className="px-10 py-6 text-right">
                              <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-11 px-6 text-[10px] font-bold tracking-widest uppercase"
                                  onClick={() => void handleResend(invitation.id)}
                                  disabled={invitation.status !== 'PENDING'}
                                >
                                  Resend
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-11 px-6 text-[10px] font-bold tracking-widest uppercase text-soft-coral hover:bg-soft-coral/10"
                                  onClick={() => void handleRevoke(invitation.id)}
                                  disabled={invitation.status !== 'PENDING'}
                                >
                                  Revoke
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                   </tbody>
                </table>
             </div>
          </ModernCard>
        </div>
      </div>
    </DashboardPage>
  );
};
