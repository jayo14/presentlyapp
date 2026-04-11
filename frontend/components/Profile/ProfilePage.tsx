import React, { useState } from 'react';
import {
  ArrowLeft, Share2, Settings, Bell, HelpCircle, LogOut, ChevronRight, Loader,
  BookOpen, Calendar, PlusCircle, Edit, User, Mail, Phone, MapPin, Award, TrendingUp,
  Clock, CheckCircle, Camera, FileText, Upload, Building2
} from 'lucide-react';
import { dashboardApi } from '../../services/api/dashboard';
import { useNavigate } from 'react-router-dom';
import { useCurrentUser, useLogout } from '../../hooks/useAuth';
import { useAvatarUpload } from '../../hooks/useAvatarUpload';
import { UserRole } from '../../types';
import { Button } from '../Button';
import { ResponsiveContainer } from '../layouts/ResponsiveContainer';
import { SEO } from '../SEO';
import { authApi } from '../../services/api/auth';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../services/api/queryClient';

interface ProfilePageProps {
  userRole?: UserRole;
  userName?: string;
  onLogout?: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  userRole: propUserRole,
  userName: propUserName,
  onLogout: propOnLogout
}) => {
  const navigate = useNavigate();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { data: user, isLoading } = useCurrentUser();
  const logoutMutation = useLogout();
  const queryClient = useQueryClient();
  const { uploadAvatar, isUploading: uploadingAvatar } = useAvatarUpload();
  const [showShareMenu, setShowShareMenu] = useState(false);
  const signatureInputRef = React.useRef<HTMLInputElement>(null);
  const [uploadingSignature, setUploadingSignature] = useState(false);

  const userName = user?.full_name || propUserName || 'User';
  const userAvatar = user?.avatar_url;
  const userEmail = user?.email || 'user@getpresently.com.ng';
  const userInitials = userName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'U';
  const userRole = user?.role || propUserRole || UserRole.STUDENT;
  const userRoleDisplay = userRole === UserRole.LECTURER
    ? `Senior Lecturer - ${user?.department_name || 'Academic'}`
    : user?.department_name || user?.department || 'Computer Science';

  const stats = {
    activeCourses: user?.active_courses_count || 0,
    totalSessions: user?.total_sessions_count || 0,
    attendanceRate: user?.attendance_rate || 0,
    completedCourses: user?.completed_courses_count || 0
  };

  const handleAvatarUpdate = async () => {
    await uploadAvatar();
  };

  const handleLogout = () => {
    if (propOnLogout) {
      propOnLogout();
    } else {
      logoutMutation.mutate();
    }
  };

  const handleShare = () => {
    setShowShareMenu(!showShareMenu);
    if (navigator.share) {
      navigator.share({
        title: 'My Presently Profile',
        text: `Check out ${userName}'s profile on Presently`,
        url: window.location.href,
      }).catch(() => { });
    }
  };

  const handleSignatureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingSignature(true);
      await dashboardApi.uploadSignature(file);
      toast.success('Digital signature uploaded successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.currentUser });
    } catch (err) {
      console.error('Signature upload error:', err);
      toast.error('Failed to upload signature');
    } finally {
      setUploadingSignature(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const mobileLayout = (
    <div className="min-h-screen bg-surfaceLow pb-24">
      {/* <div className="flex items-center justify-between p-4 border-b border-outline bg-surface/50 backdrop-blur-md sticky top-0 z-20">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-surfaceLow rounded-lg transition-colors"
        >
          <ArrowLeft size={24} className="text-text" />
        </button>
        <h1 className="font-headline text-xl font-bold text-text">Profile</h1>
        <button 
          onClick={handleShare}
          className="p-2 hover:bg-surfaceLow rounded-full transition-colors"
        >
          <Share2 size={24} className="text-textMuted" />
        </button>
      </div> */}

      <div className="flex flex-col items-center pt-8 pb-6 px-4">
        <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-primary mb-4 shadow-lg group">
          {uploadingAvatar && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
              <Loader className="w-8 h-8 animate-spin text-text" />
            </div>
          )}
          {userAvatar ? (
            <img
              src={userAvatar}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-surface flex items-center justify-center text-text text-3xl font-bold">
              {userInitials}
            </div>
          )}
          <button
            onClick={handleAvatarUpdate}
            disabled={uploadingAvatar}
            className="absolute bottom-1 right-3 bg-primary text-background p-2 rounded-full shadow-lg hover:bg-primary/90 transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed z-10"
            aria-label="Update profile picture"
          >
            <Camera size={16} />
          </button>
        </div>

        <h2 className="font-headline text-2xl font-bold text-text mb-2 text-center">
          {userName}
        </h2>
        <p className="text-textMuted text-sm text-center">
          {userRoleDisplay}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 px-4 mb-8">
        {[
          { icon: BookOpen, val: stats.activeCourses, label: 'Active Courses', color: 'primary' },
          { icon: Calendar, val: stats.totalSessions, label: 'Total Sessions', color: 'blue-500' },
          { icon: TrendingUp, val: `${stats.attendanceRate}%`, label: 'Attendance', color: 'green-500' },
          { icon: Award, val: stats.completedCourses, label: 'Completed', color: 'purple-500' }
        ].map((item, i) => (
          <div key={i} className="bg-surface border border-outline rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
            <div className={`p-1.5 bg-${item.color}/10 rounded-lg w-fit mb-2`}>
              <item.icon size={18} className={`text-${item.color}`} />
            </div>
            <span className="text-text text-3xl font-bold block mb-1">{item.val}</span>
            <span className="text-textMuted text-xs">{item.label}</span>
          </div>
        ))}
      </div>

      <div className="px-4 mb-8">
        <h3 className="font-headline text-text text-lg font-semibold mb-4">Contact Information</h3>
        <div className="bg-surface rounded-2xl border border-outline p-4 space-y-3 shadow-sm">
          {[
            { icon: Mail, label: 'Email', val: userEmail },
            { icon: Phone, label: 'Phone', val: user?.phone, hide: !user?.phone },
            { icon: MapPin, label: 'Department', val: user?.department_name, hide: !user?.department_name },
            { icon: Building2, label: 'College', val: user?.college_name, hide: !user?.college_name }
          ].filter(i => !i.hide).map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <item.icon size={18} className="text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-textMuted">{item.label}</p>
                <p className="text-sm text-text font-medium">{item.val}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 mb-8">
        <h3 className="font-headline text-text text-lg font-semibold mb-4">Account</h3>
        <div className="space-y-3">
          {[
            { id: 'settings', icon: Settings, label: 'Settings', path: '/dashboard/settings' },
            { id: 'notifications', icon: Bell, label: 'Notifications', path: '/dashboard/notifications' },
            { id: 'help', icon: HelpCircle, label: 'Help & Support', path: 'mailto:support@getpresently.com.ng', isEmail: true }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => item.isEmail ? window.location.href = item.path : navigate(item.path)}
              className="w-full bg-surface border border-outline rounded-2xl p-4 flex items-center hover:bg-surfaceLow transition-colors shadow-sm"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mr-4">
                <item.icon size={22} className="text-primary" />
              </div>
              <span className="flex-1 text-text font-medium text-base text-left">
                {item.label}
              </span>
              <ChevronRight size={20} className="text-textMuted" />
            </button>
          ))}
        </div>
      </div>

      {userRole === UserRole.LECTURER && (
        <div className="px-4 mb-8">
          <h3 className="font-headline text-text text-lg font-semibold mb-4">Digital Signature</h3>
          <div className="bg-surface rounded-2xl border border-outline p-6 flex flex-col items-center gap-4 shadow-sm">
            <div className="w-full h-32 bg-surfaceLow border-outline border-dashed border rounded-xl flex items-center justify-center relative overflow-hidden group">
              {user?.signature_url ? (
                <img src={user.signature_url} alt="Digital Signature" className="max-h-full object-contain dark:invert transition-all" />
              ) : (
                <div className="text-center">
                  <FileText size={32} className="text-textMuted mx-auto mb-2" />
                  <p className="text-xs text-textMuted">No signature uploaded</p>
                </div>
              )}
              {uploadingSignature && (
                <div className="absolute inset-0 bg-surface/60 backdrop-blur-sm flex items-center justify-center z-10">
                  <Loader className="w-8 h-8 animate-spin text-primary" />
                </div>
              )}
            </div>
            <input type="file" ref={signatureInputRef} className="hidden" accept="image/*" onChange={handleSignatureUpload} />
            <Button variant="secondary" className="w-full" onClick={() => signatureInputRef.current?.click()} disabled={uploadingSignature}>
              <Upload size={18} className="mr-2" />
              {user?.signature_url ? 'Update Signature' : 'Upload Signature'}
            </Button>
            <p className="text-[10px] text-textMuted text-center px-4">
              Used for validating and signing attendance reports.
            </p>
          </div>
        </div>
      )}

      <div className="px-4">
        <button
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          className="w-full bg-red-500/10 border border-red-500/20 rounded-2xl py-4 flex items-center justify-center hover:bg-red-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed group shadow-sm"
        >
          <LogOut size={20} className="text-red-500 mr-2 group-hover:scale-110 transition-transform" />
          <span className="text-red-500 font-semibold text-base">
            {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
          </span>
        </button>
      </div>
    </div>
  );

  const desktopLayout = (
    <div className="max-w-3xl mx-auto min-h-screen pb-24 md:pb-8 animate-in fade-in duration-500 px-4 md:px-0">
      {/* <div className="flex items-center justify-between mb-8 pt-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-surface rounded-lg transition-colors text-text">
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-headline text-2xl font-bold text-text">Profile</h1>
        <button onClick={handleShare} className="p-2 hover:bg-surface rounded-full transition-colors text-textMuted">
          <Share2 size={24} />
        </button>
      </div> */}

      <div className="relative mb-12 flex flex-col items-center">
        <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-primary shadow-xl group">
          {uploadingAvatar && (
            <div className="absolute inset-0 bg-surface/60 backdrop-blur-sm flex items-center justify-center z-10">
              <Loader className="w-10 h-10 animate-spin text-primary" />
            </div>
          )}
          {userAvatar ? (
            <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-surface flex items-center justify-center text-text text-4xl font-bold">
              {userInitials}
            </div>
          )}
          <button
            onClick={handleAvatarUpdate}
            disabled={uploadingAvatar}
            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
          >
            <Camera size={32} />
          </button>
        </div>

        <div className="text-center mt-6">
          <h2 className="font-headline text-3xl font-bold text-text mb-2">{userName}</h2>
          <p className="text-textMuted text-lg mb-3">{userRoleDisplay}</p>
          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-primary/10 text-primary uppercase tracking-wider">
            {userRole.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {[
          { icon: BookOpen, val: stats.activeCourses, label: 'Courses', color: 'primary' },
          { icon: Calendar, val: stats.totalSessions, label: 'Sessions', color: 'blue-500' },
          { icon: TrendingUp, val: `${stats.attendanceRate}%`, label: 'Attendance', color: 'green-500' },
          { icon: Award, val: stats.completedCourses, label: 'Completed', color: 'purple-500' }
        ].map((item, i) => (
          <div key={i} className="bg-surface border border-outline rounded-2xl p-6 flex flex-col items-center shadow-sm hover:shadow-md transition-all hover:scale-[1.02]">
            <div className={`bg-${item.color}/10 p-2.5 rounded-xl mb-3`}>
              <item.icon size={24} className={`text-${item.color}`} />
            </div>
            <span className="text-text text-3xl font-bold mb-1">{item.val}</span>
            <span className="text-textMuted text-sm text-center font-medium">{item.label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-surface border border-outline rounded-3xl p-8 shadow-sm h-full">
          <h3 className="font-headline text-text text-xl font-bold mb-6">Information</h3>
          <div className="space-y-6">
            {[
              { icon: Mail, label: 'Email Address', val: userEmail },
              { icon: Phone, label: 'Phone Number', val: user?.phone, hide: !user?.phone },
              { icon: MapPin, label: 'Main Department', val: user?.department_name, hide: !user?.department_name },
              { icon: Building2, label: 'Current College', val: user?.college_name, hide: !user?.college_name }
            ].filter(i => !i.hide).map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                  <item.icon size={20} className="text-primary" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-textMuted uppercase tracking-tight">{item.label}</p>
                  <p className="text-text font-semibold">{item.val}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface border border-outline rounded-3xl p-8 shadow-sm h-full flex flex-col">
          <h3 className="font-headline text-text text-xl font-bold mb-6">Account</h3>
          <div className="space-y-4 flex-1">
            {[
              { id: 'settings', icon: Settings, label: 'Settings', path: '/dashboard/settings' },
              { id: 'notifs', icon: Bell, label: 'Notifications', path: '/dashboard/notifications', badge: 3 },
              { id: 'help', icon: HelpCircle, label: 'Support', path: 'mailto:support@getpresently.com.ng', isEmail: true }
            ].map((action) => (
              <button
                key={action.id}
                onClick={() => action.isEmail ? window.location.href = action.path : navigate(action.path)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-surfaceLow transition-all border border-transparent hover:border-outline group"
              >
                <div className="w-10 h-10 rounded-xl bg-surfaceLow flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <action.icon size={18} className="text-primary" />
                </div>
                <span className="text-text font-bold flex-1 text-left">{action.label}</span>
                {action.badge && (
                  <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full mr-2">
                    {action.badge}
                  </span>
                )}
                <ChevronRight size={16} className="text-textMuted group-hover:text-primary" />
              </button>
            ))}
          </div>
          <button
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="mt-8 w-full py-4 rounded-2xl border border-red-500/20 bg-red-500/5 text-red-500 font-bold hover:bg-red-500/10 transition-all flex items-center justify-center gap-2 group"
          >
            <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
            Logout Account
          </button>
        </div>
      </div>

      {userRole === UserRole.LECTURER && (
        <div className="bg-surface border border-outline rounded-3xl p-8 shadow-sm mb-12">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1">
              <h3 className="font-headline text-text text-xl font-bold mb-3">Digital Signature</h3>
              <p className="text-textMuted text-sm mb-6 max-w-sm">
                Used to authenticate attendance records. Recommended: PNG with transparent background.
              </p>
              <Button variant="outline" onClick={() => signatureInputRef.current?.click()} disabled={uploadingSignature}>
                <Upload size={18} className="mr-2" />
                Change Signature
              </Button>
            </div>
            <div className="w-full md:w-80 h-40 bg-surfaceLow border-outline border-dashed border-2 rounded-2xl flex items-center justify-center relative overflow-hidden">
              {user?.signature_url ? (
                <img src={user.signature_url} alt="Signature Preview" className="max-h-[80%] object-contain dark:invert transition-all" />
              ) : (
                <div className="text-center opacity-40">
                  <FileText size={40} className="mx-auto mb-2" />
                  <p className="text-xs font-bold">No Signature</p>
                </div>
              )}
              {uploadingSignature && (
                <div className="absolute inset-0 bg-surface/80 backdrop-blur-md flex items-center justify-center z-10 transition-all">
                  <Loader className="w-8 h-8 animate-spin text-primary" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <SEO
        title={`${userName} | Profile | Presently`}
        description={`View ${userName}'s profile, courses, and attendance statistics on Presently`}
      />
      <ResponsiveContainer mobileChildren={mobileLayout}>
        {desktopLayout}
      </ResponsiveContainer>
    </>
  );
};
