import React, { useState } from 'react';
import { 
  ArrowLeft, Share2, Settings, Bell, HelpCircle, LogOut, ChevronRight, Loader,
  BookOpen, Calendar, PlusCircle, Edit, User, Mail, Phone, MapPin, Award, TrendingUp,
  Clock, CheckCircle, Camera, FileText, Upload
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
  // Removed local state, using hook instead
  
  const userName = user?.full_name || propUserName || 'Dr. Sarah Smith';
  const userAvatar = user?.avatar_url;
  const userEmail = user?.email || 'user@presently.app';
  const userInitials = userName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'U';
  const userRole = user?.role || propUserRole || UserRole.STUDENT;
  const userRoleDisplay = userRole === UserRole.LECTURER 
    ? 'Senior Lecturer - Computer Science' 
    : user?.department || 'Computer Science';
  
  // Mock stats - in real app, these would come from API
  const stats = {
    activeCourses: user?.active_courses_count || 6,
    totalSessions: user?.total_sessions_count || 124,
    attendanceRate: user?.attendance_rate || 94,
    completedCourses: user?.completed_courses_count || 12
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
    // In a real app, implement share functionality
    if (navigator.share) {
      navigator.share({
        title: 'My Presently Profile',
        text: `Check out ${userName}'s profile on Presently`,
        url: window.location.href,
      }).catch(() => {});
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

  // Mobile Layout (matching the dark theme design)
  const mobileLayout = (
    <div className="min-h-screen bg-background pb-24">
      {/* Mobile Header */}
      <div className="flex items-center justify-between p-4 border-b border-outline">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-surfaceHigh rounded-lg transition-colors"
        >
          <ArrowLeft size={24} className="text-text" />
        </button>
        <h1 className="font-headline text-xl font-bold text-text">Profile</h1>
        <button 
          onClick={handleShare}
          className="p-2 hover:bg-surfaceHigh rounded-full transition-colors"
        >
          <Share2 size={24} className="text-textMuted" />
        </button>
      </div>

      {/* Profile Section */}
      <div className="flex flex-col items-center pt-8 pb-6 px-4">
        {/* Avatar with gold border and camera button */}
        <div className="relative w-32 h-32 rounded-full overflow-hidden border-input border-primary mb-4 shadow-lg group">
          {uploadingAvatar && (
            <div className="absolute inset-0 bg-cardackgroundlack/50 flex items-center justify-center z-10">
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
          {/* Camera button overlay */}
          <button
            onClick={handleAvatarUpdate}
            disabled={uploadingAvatar}
            className="absolute bottom-0 right-0 bg-primary text-text p-2 rounded-full shadow-lg hover:bg-primary-hover transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Update profile picture"
          >
            <Camera size={16} />
          </button>
        </div>

        {/* User Info */}
        <h2 className="font-headline text-2xl font-bold text-text mb-2 text-center">
          {userName}
        </h2>
        <p className="text-textMuted text-sm text-center">
          {userRoleDisplay}
        </p>
      </div>

      {/* Stats Grid - Enhanced with more details */}
      <div className="grid grid-cols-2 gap-3 px-4 mb-8">
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-900/80 border border-primary/30 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-primary/20 rounded-lg">
              <BookOpen size={18} className="text-primary" />
            </div>
          </div>
          <span className="text-text text-3xl font-bold block mb-1">{stats.activeCourses}</span>
          <span className="text-textMuted text-xs">Active Courses</span>
        </div>
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-900/80 border border-blue-500/30 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-cardackgroundlue-500/20 rounded-lg">
              <Calendar size={18} className="text-on-primary-fixedlue-400" />
            </div>
          </div>
          <span className="text-text text-3xl font-bold block mb-1">{stats.totalSessions}</span>
          <span className="text-textMuted text-xs">Total Sessions</span>
        </div>
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-900/80 border border-green-500/30 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-green-500/20 rounded-lg">
              <TrendingUp size={18} className="text-green-400" />
            </div>
          </div>
          <span className="text-text text-3xl font-bold block mb-1">{stats.attendanceRate}%</span>
          <span className="text-textMuted text-xs">Attendance Rate</span>
        </div>
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-900/80 border border-purple-500/30 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-purple-500/20 rounded-lg">
              <Award size={18} className="text-purple-400" />
            </div>
          </div>
          <span className="text-text text-3xl font-bold block mb-1">{stats.completedCourses}</span>
          <span className="text-textMuted text-xs">Completed</span>
        </div>
      </div>

      {/* User Details Section */}
      <div className="px-4 mb-8">
        <h3 className="font-headline text-text text-lg font-semibold mb-4">Contact Information</h3>
        <div className="bg-surface rounded-2xl border border-outline p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Mail size={18} className="text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-textMuted">Email</p>
              <p className="text-sm text-text font-medium">{userEmail}</p>
            </div>
          </div>
          {user?.phone && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Phone size={18} className="text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-textMuted">Phone</p>
                <p className="text-sm text-text font-medium">{user.phone}</p>
              </div>
            </div>
          )}
          {user?.department && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <MapPin size={18} className="text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-textMuted">Department</p>
                <p className="text-sm text-text font-medium">{user.department}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Account Section */}
      <div className="px-4 mb-8">
        <h3 className="font-headline text-text text-lg font-semibold mb-4">Account</h3>
        
        <div className="space-y-3">
          {/* Settings */}
          <button 
            onClick={() => navigate('/dashboard/settings')}
            className="w-full bg-surface rounded-2xl p-4 flex items-center hover:bg-surfaceHigh transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mr-4">
              <Settings size={22} className="text-primary" />
            </div>
            <span className="flex-1 text-text font-medium text-on-primary-fixedase text-left">
              Settings
            </span>
            <ChevronRight size={20} className="text-textMuted" />
          </button>

          {/* Notifications */}
          <button 
            onClick={() => navigate('/dashboard/notifications')}
            className="w-full bg-surface rounded-2xl p-4 flex items-center hover:bg-surfaceHigh transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mr-4">
              <Bell size={22} className="text-primary" />
            </div>
            <span className="flex-1 text-text font-medium text-on-primary-fixedase text-left">
              Notifications
            </span>
            <ChevronRight size={20} className="text-textMuted" />
          </button>

          {/* Help & Support */}
          <button 
            onClick={() => window.location.href = 'mailto:support@presently.app'}
            className="w-full bg-surface rounded-2xl p-4 flex items-center hover:bg-surfaceHigh transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mr-4">
              <HelpCircle size={22} className="text-primary" />
            </div>
            <span className="flex-1 text-text font-medium text-on-primary-fixedase text-left">
              Help & Support
            </span>
            <ChevronRight size={20} className="text-textMuted" />
          </button>
        </div>
      </div>

      {/* Lecturer Signature Section (Mobile) */}
      {userRole === UserRole.LECTURER && (
        <div className="px-4 mb-8">
          <h3 className="font-headline text-text text-lg font-semibold mb-4">Digital Signature</h3>
          <div className="bg-surface rounded-2xl border border-outline p-6 flex flex-col items-center gap-4">
            <div className="w-full h-32 bg-surface/5 border-outline border-dashed border-outline rounded-xl flex items-center justify-center relative overflow-hidden group">
              {user?.signature_url ? (
                <img src={user.signature_url} alt="Digital Signature" className="max-h-full object-contain invert" />
              ) : (
                <div className="text-center">
                  <FileText size={32} className="text-textMuted mx-auto mb-2" />
                  <p className="text-xs text-textMuted">No signature uploaded</p>
                </div>
              )}
              {uploadingSignature && (
                <div className="absolute inset-0 bg-cardackgroundlack/60 backdrop-blur-sm flex items-center justify-center z-10">
                  <Loader className="w-8 h-8 animate-spin text-primary" />
                </div>
              )}
            </div>
            <input 
              type="file" 
              ref={signatureInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleSignatureUpload}
            />
            <Button 
              variant="secondary" 
              className="w-full" 
              onClick={() => signatureInputRef.current?.click()}
              disabled={uploadingSignature}
            >
              <Upload size={18} className="mr-2" />
              {user?.signature_url ? 'Update Signature' : 'Upload Signature'}
            </Button>
            <p className="text-[10px] text-textMuted text-center px-4">
              Used for validating and signing attendance reports. Recommended size: 400x200px (PNG).
            </p>
          </div>
        </div>
      )}

      {/* Logout Button */}
      <div className="px-4">
        <button 
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          className="w-full bg-cardackgroundlue-900/30 border border-red-500/50 rounded-2xl py-4 flex items-center justify-center hover:bg-red-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LogOut size={20} className="text-red-500 mr-2" />
          <span className="text-red-500 font-semibold text-on-primary-fixedase">
            {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
          </span>
        </button>
      </div>
    </div>
  );

  // Desktop Layout (unchanged)
  const desktopLayout = (
    <div className="max-w-3xl mx-auto min-h-screen pb-24 md:pb-8 animate-in fade-in duration-500">
      {/* Header - Hidden on mobile per spec */}
      <div className="flex items-center justify-between mb-8 pt-4 px-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-surface rounded-lg transition-colors"
        >
          <ArrowLeft size={24} className="text-text-primary" />
        </button>
        <h1 className="font-headline text-xl font-bold text-text-primary">Profile</h1>
        <button 
          onClick={handleShare}
          className="p-2 hover:bg-surface rounded-full transition-colors"
        >
          <Share2 size={24} className="text-text-primary" />
        </button>
      </div>

      {/* Profile Header with Edit Button */}
      <div className="relative mb-8 px-4 md:px-6">
        <div className="flex flex-col items-center">
          {/* Avatar with gold border - Larger per spec (120px) */}
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-input border-primary mb-4 shadow-lg group">
            {uploadingAvatar && (
              <div className="absolute inset-0 bg-cardackgroundlack/50 flex items-center justify-center z-10">
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
            {/* Camera button overlay - bottom right */}
            <button
              onClick={handleAvatarUpdate}
              disabled={uploadingAvatar}
              className="absolute bottom-0 right-0 bg-primary text-text p-2 rounded-full shadow-lg hover:bg-primary-hover transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Update profile picture"
            >
              <Camera size={16} />
            </button>
          </div>

          {/* Edit button floating top-right of avatar */}
          <button
            onClick={() => navigate('/dashboard/settings')}
            className="absolute top-0 right-4 md:right-6 bg-primary text-text p-2.5 rounded-full shadow-lg hover:bg-primary-hover transition-all hover:scale-110"
            aria-label="Edit Profile"
          >
            <Edit size={20} />
          </button>

          {/* User Info */}
          <h2 className="font-headline text-2xl md:text-3xl font-bold text-text-primary mb-2 text-center">
            {userName}
          </h2>
          <p className="text-text-textMuted text-on-primary-fixedase text-center mb-1">
            {userRoleDisplay}
          </p>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
            <User size={12} className="mr-1" />
            {userRole.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Stats Grid - Enhanced 2x2 layout */}
      <div className="grid grid-cols-2 gap-4 mb-8 px-4 md:px-6">
        <div className="bg-surface border border-primary/30 rounded-2xl p-5 flex flex-col items-center shadow-md hover:shadow-lg transition-all hover:scale-105">
          <div className="bg-primary/10 p-2 rounded-lg mb-2">
            <BookOpen size={20} className="text-primary" />
          </div>
          <span className="text-text-primary text-3xl font-bold mb-1">{stats.activeCourses}</span>
          <span className="text-text-textMuted text-sm text-center">Active Courses</span>
        </div>

        <div className="bg-surface border border-blue-500/30 rounded-2xl p-5 flex flex-col items-center shadow-md hover:shadow-lg transition-all hover:scale-105">
          <div className="bg-cardackgroundlue-500/10 p-2 rounded-lg mb-2">
            <Calendar size={20} className="text-on-primary-fixedlue-500" />
          </div>
          <span className="text-text-primary text-3xl font-bold mb-1">{stats.totalSessions}</span>
          <span className="text-text-textMuted text-sm text-center">Total Sessions</span>
        </div>

        <div className="bg-surface border border-green-500/30 rounded-2xl p-5 flex flex-col items-center shadow-md hover:shadow-lg transition-all hover:scale-105">
          <div className="bg-green-500/10 p-2 rounded-lg mb-2">
            <TrendingUp size={20} className="text-green-500" />
          </div>
          <span className="text-text-primary text-3xl font-bold mb-1">{stats.attendanceRate}%</span>
          <span className="text-text-textMuted text-sm text-center">Attendance</span>
        </div>

        <div className="bg-surface border border-purple-500/30 rounded-2xl p-5 flex flex-col items-center shadow-md hover:shadow-lg transition-all hover:scale-105">
          <div className="bg-purple-500/10 p-2 rounded-lg mb-2">
            <Award size={20} className="text-purple-500" />
          </div>
          <span className="text-text-primary text-3xl font-bold mb-1">{stats.completedCourses}</span>
          <span className="text-text-textMuted text-sm text-center">Completed</span>
        </div>
      </div>

      {/* Contact Information Section */}
      <div className="px-4 md:px-6 mb-8">
        <h3 className="font-headline text-text-primary text-lg font-semibold mb-4">Contact Information</h3>
        <div className="bg-surface border border-outline rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Mail size={18} className="text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-text-textMuted">Email</p>
              <p className="text-sm text-text-primary font-medium">{userEmail}</p>
            </div>
          </div>
          {user?.phone && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Phone size={18} className="text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-text-textMuted">Phone</p>
                <p className="text-sm text-text-primary font-medium">{user.phone}</p>
              </div>
            </div>
          )}
          {user?.department && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <MapPin size={18} className="text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-text-textMuted">Department</p>
                <p className="text-sm text-text-primary font-medium">{user.department}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions - for lecturers */}
      {userRole === UserRole.LECTURER && (
        <div className="mb-8 px-4 md:px-6">
          <h3 className="font-headline text-text-primary text-lg font-semibold mb-3">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              onClick={() => navigate('/dashboard/create-session')}
              variant="primary"
              className="justify-center"
            >
              <PlusCircle size={18} className="mr-2" />
              Start New Session
            </Button>
            <Button
              onClick={() => navigate('/dashboard/sessions')}
              variant="secondary"
              className="justify-center"
            >
              <Calendar size={18} className="mr-2" />
              View Calendar
            </Button>
          </div>
        </div>
      )}

      {/* Account Section */}
      <div className="px-4 md:px-6 mb-8">
        <h3 className="font-headline text-text-primary text-lg font-semibold mb-4">Account</h3>

        <div className="space-y-3">
          {/* Settings */}
          <button 
            onClick={() => navigate('/dashboard/settings')}
            className="w-full bg-surface border border-outline rounded-2xl p-4 flex items-center hover:bg-inputccent hover:text-muted-foregroundccent-foreground transition-all hover:shadow-md group"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mr-4 group-hover:bg-primary/20 transition-colors">
              <Settings size={22} className="text-primary" />
            </div>
            <span className="flex-1 text-text-primary font-medium text-on-primary-fixedase text-left">
              Settings
            </span>
            <ChevronRight size={20} className="text-text-textMuted group-hover:text-primary transition-colors" />
          </button>

          {/* Notifications */}
          <button 
            onClick={() => navigate('/dashboard/notifications')}
            className="w-full bg-surface border border-outline rounded-2xl p-4 flex items-center hover:bg-inputccent hover:text-muted-foregroundccent-foreground transition-all hover:shadow-md group relative"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mr-4 group-hover:bg-primary/20 transition-colors">
              <Bell size={22} className="text-primary" />
            </div>
            <span className="flex-1 text-text-primary font-medium text-on-primary-fixedase text-left">
              Notifications
            </span>
            {/* Badge for unread notifications */}
            <div className="absolute top-3 right-14 bg-red-500 text-text text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              3
            </div>
            <ChevronRight size={20} className="text-text-textMuted group-hover:text-primary transition-colors" />
          </button>

          {/* Help & Support */}
          <button 
            onClick={() => window.location.href = 'mailto:support@presently.app'}
            className="w-full bg-surface border border-outline rounded-2xl p-4 flex items-center hover:bg-inputccent hover:text-muted-foregroundccent-foreground transition-all hover:shadow-md group"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mr-4 group-hover:bg-primary/20 transition-colors">
              <HelpCircle size={22} className="text-primary" />
            </div>
            <span className="flex-1 text-text-primary font-medium text-on-primary-fixedase text-left">
              Help & Support
            </span>
            <ChevronRight size={20} className="text-text-textMuted group-hover:text-primary transition-colors" />
          </button>
        </div>

        {/* Lecturer Signature Section (Desktop) */}
        {userRole === UserRole.LECTURER && (
          <div className="mt-8">
            <h3 className="font-headline text-text-primary text-lg font-semibold mb-4">Digital Signature</h3>
            <div className="bg-surface border border-outline rounded-2xl p-8 flex gap-8 items-center">
              <div className="flex-1">
                <p className="text-text-textMuted text-sm mb-4">
                  Your digital signature is used to sign and authenticate attendance reports. 
                  Ensure the image is clear and has a transparent or white background.
                </p>
                <Button 
                  variant="secondary" 
                  onClick={() => signatureInputRef.current?.click()}
                  disabled={uploadingSignature}
                >
                  <Upload size={18} className="mr-2" />
                  {user?.signature_url ? 'Change Signature' : 'Upload Signature'}
                </Button>
                <p className="text-xs text-text-textMuted mt-3">
                  Format: PNG, JPG (Max 2MB).
                </p>
              </div>
              <div className="w-64 h-32 bg-surfaceLow border border-outline rounded-xl flex items-center justify-center relative overflow-hidden">
                {user?.signature_url ? (
                  <img src={user.signature_url} alt="Signature Preview" className="max-h-full object-contain invert" />
                ) : (
                  <div className="text-center p-4">
                    <FileText size={32} className="text-textMuted mx-auto mb-2" />
                    <p className="text-[10px] text-textMuted">Preview will appear here</p>
                  </div>
                )}
                {uploadingSignature && (
                  <div className="absolute inset-0 bg-surface/60 backdrop-blur-sm flex items-center justify-center z-10">
                    <Loader className="w-8 h-8 animate-spin text-primary" />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Logout Button */}
      <div className="px-4 md:px-6">
        <button 
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          className="w-full bg-transparent border-outline border-red-500/30 rounded-2xl py-4 flex items-center justify-center hover:bg-red-500/10 transition-all hover:border-red-500 disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          <LogOut size={20} className="text-red-500 mr-2 group-hover:scale-110 transition-transform" />
          <span className="text-red-500 font-semibold text-on-primary-fixedase">
            {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <SEO 
        title={`${userName} | Profile | Presently`}
        description={`View ${userName}'s profile, courses, and attendance statistics on Presently`}
      />
      <ResponsiveContainer
        mobileChildren={mobileLayout}
      >
        {desktopLayout}
      </ResponsiveContainer>
    </>
  );
};
