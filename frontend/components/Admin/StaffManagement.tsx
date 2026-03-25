import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, RefreshCw, Shield, Users } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '../Button';
import { Input } from '../Input';
import { SEO } from '../SEO';
import { staffApi, StaffInvitation, StaffProfile, StaffRole } from '../../services/api/staff';

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

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-surface border border-outline rounded-lg p-4">
          <h3 className="text-base font-semibold text-text mb-3">Active Staff</h3>
          <div className="space-y-2 max-h-[420px] overflow-auto">
            {profiles.map((profile) => (
              <div key={profile.user.id} className="flex items-center justify-between p-3 rounded-md border border-outline/60">
                <div>
                  <p className="text-sm font-medium text-text">{profile.user.full_name}</p>
                  <p className="text-xs text-textMuted">{profile.user.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-textMuted">{profile.role?.name || 'No role'}</p>
                  <p className="text-xs text-text">{profile.status}</p>
                </div>
              </div>
            ))}
            {profiles.length === 0 ? <p className="text-sm text-textMuted">No staff profiles yet.</p> : null}
          </div>
        </div>

        <div className="bg-surface border border-outline rounded-lg p-4">
          <h3 className="text-base font-semibold text-text mb-3">Invitations</h3>
          <div className="space-y-2 max-h-[420px] overflow-auto">
            {invitations.map((invitation) => (
              <div key={invitation.id} className="p-3 rounded-md border border-outline/60">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-text">{invitation.full_name}</p>
                    <p className="text-xs text-textMuted">{invitation.email}</p>
                    <p className="text-xs text-textMuted">Role: {invitation.role?.name || 'Custom'}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-surfaceHigh text-text">{invitation.status}</span>
                </div>

                <div className="flex items-center gap-2 mt-3">
                  <Button
                    variant="secondary"
                    className="text-xs"
                    onClick={() => void handleResend(invitation.id)}
                    disabled={invitation.status !== 'PENDING'}
                  >
                    Resend
                  </Button>
                  <Button
                    variant="secondary"
                    className="text-xs"
                    onClick={() => void handleRevoke(invitation.id)}
                    disabled={invitation.status !== 'PENDING'}
                  >
                    Revoke
                  </Button>
                  {invitation.status === 'ACCEPTED' ? (
                    <span className="text-xs text-emerald-500 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Accepted</span>
                  ) : null}
                </div>
              </div>
            ))}
            {invitations.length === 0 ? <p className="text-sm text-textMuted">No invitations found.</p> : null}
          </div>
        </div>
      </div>
    </div>
  );
};
