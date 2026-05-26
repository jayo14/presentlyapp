import React, { useState } from 'react';
import {
  Settings, Bell, HelpCircle, LogOut, ChevronRight, Loader,
  Mail, Phone, MapPin, Camera, FileText, Upload, Building2,
  Share2, ShieldCheck, UserCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCurrentUser, useLogout } from '../../hooks/useAuth';
import { useAvatarUpload } from '../../hooks/useAvatarUpload';
import { UserRole } from '../../types';
import { Button } from '../Button';
import { ResponsiveContainer } from '../layouts/ResponsiveContainer';
import { SEO } from '../SEO';
import { toast } from 'sonner';
import { DashboardPage } from '../../src/components/layout-primitives/DashboardPage';
import { ModernCard } from '../ModernCard';
import { ResponsiveGrid } from '../../src/components/layout-primitives/ResponsiveGrid';
import { Badge } from '../../src/components/ui/badge';
import { cn } from '../../src/components/ui/utils';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { data: user, isLoading } = useCurrentUser();
  const logoutMutation = useLogout();
  const { uploadAvatar, isUploading: uploadingAvatar } = useAvatarUpload();
  const signatureInputRef = React.useRef<HTMLInputElement>(null);
  const [uploadingSignature, setUploadingSignature] = useState(false);

  if (isLoading && !user) return <div className="h-96 flex items-center justify-center">Loading...</div>;

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleAvatarUpdate = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          await uploadAvatar(file);
          toast.success('Profile image updated');
        } catch (err) {
          toast.error('Upload failed');
        }
      }
    };
    input.click();
  };

  const desktopLayout = (
    <DashboardPage
      title="Personal Profile"
      description="Manage your identity, security credentials, and system preferences."
      seoTitle="My Profile | Presently"
      action={
        <div className="flex gap-4">
           <Button variant="outline" className="h-14 px-6">
             <Share2 size={18} className="mr-2" /> Share
           </Button>
           <Button variant="secondary" className="h-14 px-6" onClick={() => navigate('/dashboard/settings')}>
             <Settings size={18} className="mr-2" /> Settings
           </Button>
        </div>
      }
    >
      <div className="space-y-16 lg:space-y-32">
        {/* Profile Identity Card */}
        <ModernCard padding="none" className="overflow-hidden border-outline/40 shadow-xl">
           <div className="h-48 bg-sungold/10 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,197,24,0.1),transparent_50%)]" />
           </div>
           <div className="px-12 pb-12 -mt-16 relative z-10 flex flex-col md:flex-row items-end justify-between gap-8">
              <div className="flex flex-col md:flex-row items-end gap-8">
                 <div className="relative group">
                    <div className="w-40 h-40 rounded-[2.5rem] border-8 border-surface bg-white shadow-premium overflow-hidden">
                       {user?.avatar_url ? (
                         <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center bg-surface-highest text-on-surface-variant text-5xl font-display font-bold">
                           {user?.full_name?.charAt(0)}
                         </div>
                       )}
                    </div>
                    <button
                      onClick={handleAvatarUpdate}
                      className="absolute bottom-2 right-2 w-12 h-12 bg-white rounded-2xl shadow-lg border border-outline flex items-center justify-center hover:bg-sungold hover:text-white transition-all"
                    >
                       <Camera size={20} />
                    </button>
                 </div>
                 <div className="pb-2 space-y-2">
                    <div className="flex items-center gap-3">
                       <h2 className="text-4xl font-display font-bold text-presently-black">{user?.full_name}</h2>
                       <ShieldCheck className="text-sky-teal w-6 h-6" />
                    </div>
                    <p className="text-lg text-on-surface-variant font-medium">{user?.email}</p>
                    <div className="flex gap-2 pt-2">
                       <Badge variant="default" className="px-4 py-1.5 font-bold tracking-widest">{user?.role}</Badge>
                       <Badge variant="secondary" className="px-4 py-1.5 font-bold tracking-widest">VERIFIED USER</Badge>
                    </div>
                 </div>
              </div>
              <div className="pb-4">
                 <Button variant="outline" className="h-12 border-red-500/20 text-red-500 hover:bg-red-50" onClick={handleLogout}>
                   <LogOut size={16} className="mr-2" /> Logout
                 </Button>
              </div>
           </div>
        </ModernCard>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
           <div className="lg:col-span-2 space-y-16 lg:space-y-32">
              {/* Stats / Overview */}
              <ResponsiveGrid columns={2} gap={24}>
                 <ModernCard padding="lg" className="flex items-center gap-6 border-outline/30">
                    <div className="w-14 h-14 rounded-2xl bg-sungold/10 text-sungold flex items-center justify-center">
                       <UserCircle size={28} weight="bold" />
                    </div>
                    <div>
                       <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Member Since</p>
                       <p className="text-xl font-bold text-presently-black mt-0.5">May 2024</p>
                    </div>
                 </ModernCard>
                 <ModernCard padding="lg" className="flex items-center gap-6 border-outline/30">
                    <div className="w-14 h-14 rounded-2xl bg-moss-green/10 text-moss-green flex items-center justify-center">
                       <ShieldCheck size={28} weight="bold" />
                    </div>
                    <div>
                       <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Account Status</p>
                       <p className="text-xl font-bold text-presently-black mt-0.5">Active / Regular</p>
                    </div>
                 </ModernCard>
              </ResponsiveGrid>

              {/* Information */}
              <div className="space-y-8">
                 <h3 className="font-display text-2xl font-bold text-presently-black flex items-center gap-3">
                   <UserCircle className="text-sungold" />
                   Profile Information
                 </h3>
                 <ModernCard padding="lg" className="border-outline/30 bg-warm-ivory/5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-16">
                       {[
                         { icon: Mail, label: 'Official Email', val: user?.email },
                         { icon: Phone, label: 'Phone Contact', val: user?.phone || 'Not provided' },
                         { icon: MapPin, label: 'Primary Department', val: user?.department_name || 'N/A' },
                         { icon: Building2, label: 'Affiliated Institution', val: user?.institution_name || 'N/A' }
                       ].map((item, i) => (
                         <div key={i} className="flex items-start gap-5">
                            <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center border border-outline/40 text-on-surface-variant">
                               <item.icon size={18} />
                            </div>
                            <div>
                               <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{item.label}</p>
                               <p className="text-base font-bold text-presently-black mt-1">{item.val}</p>
                            </div>
                         </div>
                       ))}
                    </div>
                 </ModernCard>
              </div>

              {/* Signature (if lecturer) */}
              {user?.role === UserRole.LECTURER && (
                <div className="space-y-8">
                   <h3 className="font-display text-2xl font-bold text-presently-black flex items-center gap-3">
                     <FileText className="text-sungold" />
                     Digital Signature
                   </h3>
                   <ModernCard padding="lg" className="border-outline/30">
                      <div className="flex flex-col md:flex-row gap-12 items-center">
                         <div className="flex-1 space-y-4">
                            <p className="text-on-surface-variant font-medium leading-relaxed">
                               Your signature is used to authenticate digital attendance reports.
                               Upload a clear image on a transparent background.
                            </p>
                            <Button variant="outline" className="h-12" onClick={() => signatureInputRef.current?.click()}>
                               <Upload size={16} className="mr-2" /> Replace Signature
                            </Button>
                            <input type="file" ref={signatureInputRef} className="hidden" accept="image/*" />
                         </div>
                         <div className="w-full md:w-72 h-40 bg-surface-highest/20 border-2 border-dashed border-outline/40 rounded-3xl flex items-center justify-center overflow-hidden">
                            {user?.signature_url ? (
                              <img src={user.signature_url} alt="Signature" className="max-h-[70%] object-contain" />
                            ) : (
                              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest opacity-40">No Signature Found</p>
                            )}
                         </div>
                      </div>
                   </ModernCard>
                </div>
              )}
           </div>

           <div className="space-y-12">
              <h3 className="font-display text-2xl font-bold text-presently-black">Account Controls</h3>
              <div className="space-y-4">
                 {[
                   { id: 'security', icon: ShieldCheck, label: 'Security & Privacy', desc: 'MFA and login history', path: '/dashboard/security' },
                   { id: 'notifs', icon: Bell, label: 'Notifications', desc: 'Alert preferences', path: '/dashboard/notifications' },
                   { id: 'support', icon: HelpCircle, label: 'Get Support', desc: 'Contact technical team', path: 'mailto:support@presently.io' }
                 ].map((action) => (
                   <button
                     key={action.id}
                     onClick={() => action.path.startsWith('mailto') ? window.location.href = action.path : navigate(action.path)}
                     className="w-full text-left p-6 rounded-3xl border border-outline/30 hover:border-sungold/40 hover:bg-sungold/[0.02] transition-all group"
                   >
                      <div className="flex items-center justify-between mb-2">
                         <div className="w-10 h-10 rounded-xl bg-surface-highest/40 flex items-center justify-center text-on-surface-variant group-hover:bg-sungold group-hover:text-white transition-all">
                            <action.icon size={18} weight="bold" />
                         </div>
                         <ChevronRight size={16} className="text-on-surface-variant opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0" />
                      </div>
                      <p className="font-bold text-presently-black">{action.label}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">{action.desc}</p>
                   </button>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </DashboardPage>
  );

  return (
    <>
      <SEO title={`${user?.full_name} | Profile`} />
      <ResponsiveContainer>
        {desktopLayout}
      </ResponsiveContainer>
    </>
  );
};

export default ProfilePage;
