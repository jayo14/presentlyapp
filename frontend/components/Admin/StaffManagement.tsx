import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, RefreshCw, Shield, Users } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '../Button';
import { Input } from '../Input';
import { SEO } from '../SEO';
import { staffApi, StaffInvitation, StaffProfile, StaffRole } from '../../services/api/staff';

const STATUS_BADGE: Record<string, string> = {
  ACTIVE: 'bg-green-500/15 text-green-600 dark:text-green-400',
  PENDING: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  SUSPENDED: 'bg-red-500/15 text-red-600 dark:text-red-400',
  REVOKED: 'bg-red-500/15 text-red-600 dark:text-red-400',
  ACCEPTED: 'bg-green-500/15 text-green-600 dark:text-green-400',
  EXPIRED: 'bg-surface text-textMuted',
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
      toast.error('Failed to load staff data', {
        description: error?.response?.data?.error || 'Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const togglePermission = (code: string) => {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(code)
        ? prev.permissions.filter((item) => item !== code)
        : [...prev.permissions, code],
    }));
  };

  const handleInvite = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      await staffApi.inviteStaff({
        email: form.email,
        full_name: form.full_name,
        role_id: form.role_id ? Number(form.role_id) : undefined,
        permissions: form.permissions,
      });

      toast.success('Staff invitation sent');
      setForm({ email: '', full_name: '', role_id: '', permissions: [] });
      await loadData();
    } catch (error: any) {
      toast.error('Failed to send invitation', {
        description: error?.response?.data?.error || 'Please check fields and try again.',
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
      toast.error('Failed to resend invitation', {
        description: error?.response?.data?.error || 'Please try again.',
      });
    }
  };

  const handleRevoke = async (invitationId: number) => {
    try {
      await staffApi.revokeInvitation(invitationId);
      toast.success('Invitation revoked');
      await loadData();
    } catch (error: any) {
      toast.error('Failed to revoke invitation', {
        description: error?.response?.data?.error || 'Please try again.',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-[280px] flex items-center justify-center text-textMuted">
        <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> Loading staff data...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SEO title="Staff Management | Admin | Presently" description="Invite and manage staff roles and permissions." />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-primary" />
          <div>
            <h2 className="font-headline text-2xl font-bold text-text">Staff Management</h2>
            <p className="text-sm text-textMuted">Invite staff, assign role presets, and override permissions.</p>
          </div>
        </div>
        <Button variant="secondary" onClick={() => void loadData()} className="gap-2">
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
      </div>

      {/* Invite Form */}
      <form onSubmit={handleInvite} className="bg-surface border border-outline rounded-lg p-4 space-y-4">
        <h3 className="text-base font-semibold text-text flex items-center gap-2">
          <Users className="w-4 h-4" /> Invite New Staff
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input
            placeholder="Full name"
            value={form.full_name}
            onChange={(e) => setForm((prev) => ({ ...prev, full_name: e.target.value }))}
            required
          />
          <Input
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            required
          />
          <select
            value={form.role_id}
            onChange={(e) => setForm((prev) => ({ ...prev, role_id: e.target.value }))}
            className="px-3 py-2 bg-surfaceHigh border border-outline rounded-lg text-text"
          >
            <option value="">Custom role (permissions only)</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-text">Permission Overrides</p>
          {Object.entries(groupedPermissions).map(([group, perms]) => (
            <div key={group} className="border border-outline/70 rounded-md p-3">
              <p className="text-xs uppercase tracking-wide text-textMuted mb-2">{group.replaceAll('_', ' ')}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {perms.map((perm) => (
                  <label key={perm.codename} className="flex items-center gap-2 text-sm text-text">
                    <input
                      type="checkbox"
                      checked={form.permissions.includes(perm.codename)}
                      onChange={() => togglePermission(perm.codename)}
                    />
                    <span>{perm.name}</span>
                    {perm.dangerous ? <AlertCircle className="w-3 h-3 text-amber-500" /> : null}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Sending...' : 'Send Invitation'}
          </Button>
        </div>
      </form>

      {/* Staff Data Table */}
      <div className="bg-surface border border-outline rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-outline">
          <h3 className="text-base font-semibold text-text">Active Staff</h3>
          <p className="text-xs text-textMuted mt-0.5">{profiles.length} member{profiles.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline bg-surfaceHigh">
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-textMuted">Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-textMuted">Email</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-textMuted">Role</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-textMuted">Status</th>
              </tr>
            </thead>
            <tbody>
              {profiles.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-textMuted text-sm">
                    No staff members yet.
                  </td>
                </tr>
              ) : (
                profiles.map((profile) => (
                  <tr key={profile.user.id} className="border-b border-outline/50 last:border-0 hover:bg-surfaceHigh/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-text">{profile.user.full_name}</td>
                    <td className="px-4 py-3 text-textMuted">{profile.user.email}</td>
                    <td className="px-4 py-3 text-textMuted">{profile.role?.name ?? <span className="italic text-textMuted/60">No role</span>}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[profile.status] ?? 'bg-surface text-textMuted'}`}>
                        {profile.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invitations Table */}
      <div className="bg-surface border border-outline rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-outline">
          <h3 className="text-base font-semibold text-text">Invitations</h3>
          <p className="text-xs text-textMuted mt-0.5">{invitations.length} total</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline bg-surfaceHigh">
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-textMuted">Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-textMuted">Email</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-textMuted">Role</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-textMuted">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-textMuted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invitations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-textMuted text-sm">
                    No invitations found.
                  </td>
                </tr>
              ) : (
                invitations.map((invitation) => (
                  <tr key={invitation.id} className="border-b border-outline/50 last:border-0 hover:bg-surfaceHigh/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-text">{invitation.full_name}</td>
                    <td className="px-4 py-3 text-textMuted">{invitation.email}</td>
                    <td className="px-4 py-3 text-textMuted">{invitation.role?.name ?? <span className="italic text-textMuted/60">Custom</span>}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[invitation.status] ?? 'bg-surface text-textMuted'}`}>
                        {invitation.status === 'ACCEPTED' && <CheckCircle2 className="w-3 h-3" />}
                        {invitation.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="secondary"
                          className="text-xs py-1 px-2 h-auto"
                          onClick={() => void handleResend(invitation.id)}
                          disabled={invitation.status !== 'PENDING'}
                        >
                          Resend
                        </Button>
                        <Button
                          variant="secondary"
                          className="text-xs py-1 px-2 h-auto"
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
      </div>
    </div>
  );
};
