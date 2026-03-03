import React, { useState } from 'react';
import { 
  ArrowLeft, Share2, Settings, Bell, HelpCircle, LogOut, ChevronRight, Loader,
  BookOpen, Calendar, PlusCircle, Edit, User, Mail, Phone, MapPin, Award, TrendingUp,
  Clock, CheckCircle, Camera
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCurrentUser, useLogout } from '../../hooks/useAuth';
import { UserRole } from '../../types';
import { Button } from '../Button';
import { ResponsiveContainer } from '../layouts/ResponsiveContainer';
import { SEO } from '../SEO';
import { authApi } from '../../services/api/auth';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../hooks/useAuth';

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
  const { data: user, isLoading } = useCurrentUser();
  const logoutMutation = useLogout();
  const queryClient = useQueryClient();
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
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
    try {
      setUploadingAvatar(true);
      
      // Import CameraService dynamically
      const { CameraService } = await import('../../services/camera');
      
      // Get photo from user
      const photoData = await CameraService.promptForPhoto({
        quality: 80,
        allowEditing: true,
        width: 512,
        height: 512,
      });

      if (!photoData) {
        toast.error('No image selected');
        return;
      }

      // Upload to backend
      const avatarUrl = await authApi.uploadAvatar(photoData);
      
      // Update local user data
      if (user) {
        const updatedUser = { ...user, avatar_url: avatarUrl };
        queryClient.setQueryData(queryKeys.currentUser, updatedUser);
      }

      toast.success('Profile picture updated successfully');
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      toast.error('Failed to update profile picture', {
        description: error.message || 'Please try again'
      });
    } finally {
      setUploadingAvatar(false);
    }
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

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Mobile Layout (matching the dark theme design)
  const mobileLayout = (
    <div className="min-h-screen bg-zinc-950 pb-24">
      {/* Mobile Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-800">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} className="text-white" />
        </button>
        <h1 className="text-xl font-bold text-white">Profile</h1>
        <button 
          onClick={handleShare}
          className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
        >
          <Share2 size={24} className="text-zinc-400" />
        </button>
      </div>

      {/* Profile Section */}
      <div className="flex flex-col items-center pt-8 pb-6 px-4">
        {/* Avatar with gold border and camera button */}
        <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-primary mb-4 shadow-lg group">
          {uploadingAvatar && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
              <Loader className="w-8 h-8 animate-spin text-white" />
            </div>
          )}
          {userAvatar ? (
            <img 
              src={userAvatar}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-white text-3xl font-bold">
              {userInitials}
            </div>
          )}
          {/* Camera button overlay */}
          <button
            onClick={handleAvatarUpdate}
            disabled={uploadingAvatar}
            className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full shadow-lg hover:bg-primary-hover transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Update profile picture"
          >
            <Camera size={16} />
          </button>
        </div>

        {/* User Info */}
        <h2 className="text-2xl font-bold text-white mb-2 text-center">
          {userName}
        </h2>
        <p className="text-zinc-400 text-sm text-center">
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
          <span className="text-white text-3xl font-bold block mb-1">{stats.activeCourses}</span>
          <span className="text-zinc-400 text-xs">Active Courses</span>
        </div>
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-900/80 border border-blue-500/30 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-blue-500/20 rounded-lg">
              <Calendar size={18} className="text-blue-400" />
            </div>
          </div>
          <span className="text-white text-3xl font-bold block mb-1">{stats.totalSessions}</span>
          <span className="text-zinc-400 text-xs">Total Sessions</span>
        </div>
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-900/80 border border-green-500/30 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-green-500/20 rounded-lg">
              <TrendingUp size={18} className="text-green-400" />
            </div>
          </div>
          <span className="text-white text-3xl font-bold block mb-1">{stats.attendanceRate}%</span>
          <span className="text-zinc-400 text-xs">Attendance Rate</span>
        </div>
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-900/80 border border-purple-500/30 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-purple-500/20 rounded-lg">
              <Award size={18} className="text-purple-400" />
            </div>
          </div>
          <span className="text-white text-3xl font-bold block mb-1">{stats.completedCourses}</span>
          <span className="text-zinc-400 text-xs">Completed</span>
        </div>
      </div>

      {/* User Details Section */}
      <div className="px-4 mb-8">
        <h3 className="text-white text-lg font-semibold mb-4">Contact Information</h3>
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Mail size={18} className="text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-zinc-500">Email</p>
              <p className="text-sm text-white font-medium">{userEmail}</p>
            </div>
          </div>
          {user?.phone && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Phone size={18} className="text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-zinc-500">Phone</p>
                <p className="text-sm text-white font-medium">{user.phone}</p>
              </div>
            </div>
          )}
          {user?.department && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <MapPin size={18} className="text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-zinc-500">Department</p>
                <p className="text-sm text-white font-medium">{user.department}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Account Section */}
      <div className="px-4 mb-8">
        <h3 className="text-white text-lg font-semibold mb-4">Account</h3>
        
        <div className="space-y-3">
          {/* Settings */}
          <button 
            onClick={() => navigate('/dashboard/settings')}
            className="w-full bg-zinc-900 rounded-2xl p-4 flex items-center hover:bg-zinc-800 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mr-4">
              <Settings size={22} className="text-primary" />
            </div>
            <span className="flex-1 text-white font-medium text-base text-left">
              Settings
            </span>
            <ChevronRight size={20} className="text-zinc-600" />
          </button>

          {/* Notifications */}
          <button 
            onClick={() => navigate('/dashboard/notifications')}
            className="w-full bg-zinc-900 rounded-2xl p-4 flex items-center hover:bg-zinc-800 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mr-4">
              <Bell size={22} className="text-primary" />
            </div>
            <span className="flex-1 text-white font-medium text-base text-left">
              Notifications
            </span>
            <ChevronRight size={20} className="text-zinc-600" />
          </button>

          {/* Help & Support */}
          <button 
            onClick={() => window.location.href = 'mailto:support@presently.app'}
            className="w-full bg-zinc-900 rounded-2xl p-4 flex items-center hover:bg-zinc-800 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mr-4">
              <HelpCircle size={22} className="text-primary" />
            </div>
            <span className="flex-1 text-white font-medium text-base text-left">
              Help & Support
            </span>
            <ChevronRight size={20} className="text-zinc-600" />
          </button>
        </div>
      </div>

      {/* Logout Button */}
      <div className="px-4">
        <button 
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          className="w-full bg-blue-900/30 border border-red-500/50 rounded-2xl py-4 flex items-center justify-center hover:bg-red-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LogOut size={20} className="text-red-500 mr-2" />
          <span className="text-red-500 font-semibold text-base">
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
          className="p-2 hover:bg-surface dark:hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} className="text-text-primary" />
        </button>
        <h1 className="text-xl font-bold text-text-primary">Profile</h1>
        <button 
          onClick={handleShare}
          className="p-2 hover:bg-surface dark:hover:bg-zinc-800 rounded-full transition-colors"
        >
          <Share2 size={24} className="text-text-primary" />
        </button>
      </div>

      {/* Profile Header with Edit Button */}
      <div className="relative mb-8 px-4 md:px-6">
        <div className="flex flex-col items-center">
          {/* Avatar with gold border - Larger per spec (120px) */}
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-primary mb-4 shadow-lg">
            {userAvatar ? (
              <img 
                src={userAvatar}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-white text-3xl font-bold">
                {userInitials}
              </div>
            )}
          </div>

          {/* Edit button floating top-right of avatar */}
          <button
            onClick={() => navigate('/dashboard/settings')}
            className="absolute top-0 right-4 md:right-6 bg-primary text-white p-2.5 rounded-full shadow-lg hover:bg-primary-hover transition-all hover:scale-110"
            aria-label="Edit Profile"
          >
            <Edit size={20} />
          </button>

          {/* User Info */}
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-2 text-center">
            {userName}
          </h2>
          <p className="text-text-secondary text-base text-center mb-1">
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
        <div className="bg-surface dark:bg-zinc-900 border border-primary/30 dark:border-primary/20 rounded-2xl p-5 flex flex-col items-center shadow-md hover:shadow-lg transition-all hover:scale-105">
          <div className="bg-primary/10 dark:bg-primary/20 p-2 rounded-lg mb-2">
            <BookOpen size={20} className="text-primary" />
          </div>
          <span className="text-text-primary text-3xl font-bold mb-1">{stats.activeCourses}</span>
          <span className="text-text-secondary text-sm text-center">Active Courses</span>
        </div>

        <div className="bg-surface dark:bg-zinc-900 border border-blue-500/30 dark:border-blue-500/20 rounded-2xl p-5 flex flex-col items-center shadow-md hover:shadow-lg transition-all hover:scale-105">
          <div className="bg-blue-500/10 dark:bg-blue-500/20 p-2 rounded-lg mb-2">
            <Calendar size={20} className="text-blue-500" />
          </div>
          <span className="text-text-primary text-3xl font-bold mb-1">{stats.totalSessions}</span>
          <span className="text-text-secondary text-sm text-center">Total Sessions</span>
        </div>

        <div className="bg-surface dark:bg-zinc-900 border border-green-500/30 dark:border-green-500/20 rounded-2xl p-5 flex flex-col items-center shadow-md hover:shadow-lg transition-all hover:scale-105">
          <div className="bg-green-500/10 dark:bg-green-500/20 p-2 rounded-lg mb-2">
            <TrendingUp size={20} className="text-green-500" />
          </div>
          <span className="text-text-primary text-3xl font-bold mb-1">{stats.attendanceRate}%</span>
          <span className="text-text-secondary text-sm text-center">Attendance</span>
        </div>

        <div className="bg-surface dark:bg-zinc-900 border border-purple-500/30 dark:border-purple-500/20 rounded-2xl p-5 flex flex-col items-center shadow-md hover:shadow-lg transition-all hover:scale-105">
          <div className="bg-purple-500/10 dark:bg-purple-500/20 p-2 rounded-lg mb-2">
            <Award size={20} className="text-purple-500" />
          </div>
          <span className="text-text-primary text-3xl font-bold mb-1">{stats.completedCourses}</span>
          <span className="text-text-secondary text-sm text-center">Completed</span>
        </div>
      </div>

      {/* Contact Information Section */}
      <div className="px-4 md:px-6 mb-8">
        <h3 className="text-text-primary text-lg font-semibold mb-4">Contact Information</h3>
        <div className="bg-surface dark:bg-zinc-900 border border-border dark:border-zinc-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
              <Mail size={18} className="text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-text-secondary">Email</p>
              <p className="text-sm text-text-primary font-medium">{userEmail}</p>
            </div>
          </div>
          {user?.phone && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                <Phone size={18} className="text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-text-secondary">Phone</p>
                <p className="text-sm text-text-primary font-medium">{user.phone}</p>
              </div>
            </div>
          )}
          {user?.department && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                <MapPin size={18} className="text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-text-secondary">Department</p>
                <p className="text-sm text-text-primary font-medium">{user.department}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions - for lecturers */}
      {userRole === UserRole.LECTURER && (
        <div className="mb-8 px-4 md:px-6">
          <h3 className="text-text-primary text-lg font-semibold mb-3">Quick Actions</h3>
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
        <h3 className="text-text-primary text-lg font-semibold mb-4">Account</h3>

        <div className="space-y-3">
          {/* Settings */}
          <button 
            onClick={() => navigate('/dashboard/settings')}
            className="w-full bg-surface dark:bg-zinc-900 border border-border dark:border-zinc-800 rounded-2xl p-4 flex items-center hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all hover:shadow-md group"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center mr-4 group-hover:bg-primary/20 transition-colors">
              <Settings size={22} className="text-primary" />
            </div>
            <span className="flex-1 text-text-primary font-medium text-base text-left">
              Settings
            </span>
            <ChevronRight size={20} className="text-text-secondary group-hover:text-primary transition-colors" />
          </button>

          {/* Notifications */}
          <button 
            onClick={() => navigate('/dashboard/notifications')}
            className="w-full bg-surface dark:bg-zinc-900 border border-border dark:border-zinc-800 rounded-2xl p-4 flex items-center hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all hover:shadow-md group relative"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center mr-4 group-hover:bg-primary/20 transition-colors">
              <Bell size={22} className="text-primary" />
            </div>
            <span className="flex-1 text-text-primary font-medium text-base text-left">
              Notifications
            </span>
            {/* Badge for unread notifications */}
            <div className="absolute top-3 right-14 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              3
            </div>
            <ChevronRight size={20} className="text-text-secondary group-hover:text-primary transition-colors" />
          </button>

          {/* Help & Support */}
          <button 
            onClick={() => window.location.href = 'mailto:support@presently.app'}
            className="w-full bg-surface dark:bg-zinc-900 border border-border dark:border-zinc-800 rounded-2xl p-4 flex items-center hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all hover:shadow-md group"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center mr-4 group-hover:bg-primary/20 transition-colors">
              <HelpCircle size={22} className="text-primary" />
            </div>
            <span className="flex-1 text-text-primary font-medium text-base text-left">
              Help & Support
            </span>
            <ChevronRight size={20} className="text-text-secondary group-hover:text-primary transition-colors" />
          </button>
        </div>
      </div>

      {/* Logout Button */}
      <div className="px-4 md:px-6">
        <button 
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          className="w-full bg-transparent border-2 border-red-500/30 dark:border-red-500/30 rounded-2xl py-4 flex items-center justify-center hover:bg-red-500/10 dark:hover:bg-red-500/10 transition-all hover:border-red-500 disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          <LogOut size={20} className="text-red-500 mr-2 group-hover:scale-110 transition-transform" />
          <span className="text-red-500 font-semibold text-base">
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
