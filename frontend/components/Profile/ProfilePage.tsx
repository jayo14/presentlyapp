import React from 'react';
import { 
  ArrowLeft, Share2, Settings, Bell, HelpCircle, LogOut, ChevronRight, Loader,
  BookOpen, Calendar, PlusCircle, Edit, User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCurrentUser, useLogout } from '../../hooks/useAuth';
import { UserRole } from '../../types';
import { Button } from '../Button';

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
  
  const userAvatar = user?.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400';
  const userName = user?.full_name || propUserName || 'Dr. Sarah Smith';
  const userRole = user?.role || propUserRole || UserRole.STUDENT;
  const userRoleDisplay = userRole === UserRole.LECTURER 
    ? 'Senior Lecturer - Computer Science' 
    : user?.department || 'Computer Science';

  const handleLogout = () => {
    if (propOnLogout) {
      propOnLogout();
    } else {
      logoutMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto min-h-screen pb-24 md:pb-8 animate-in fade-in duration-500">
      {/* Header - Hidden on mobile per spec */}
      <div className="hidden md:flex items-center justify-between mb-8 pt-4 px-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-surface dark:hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} className="text-text-primary" />
        </button>
        <h1 className="text-xl font-bold text-text-primary">Profile</h1>
        <button className="p-2 hover:bg-surface dark:hover:bg-zinc-800 rounded-lg transition-colors">
          <Share2 size={24} className="text-text-primary" />
        </button>
      </div>

      {/* Profile Header with Edit Button */}
      <div className="relative mb-8 px-4 md:px-6">
        <div className="flex flex-col items-center">
          {/* Avatar with gold border - Larger per spec (120px) */}
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-primary mb-4 shadow-lg">
            <img 
              src={userAvatar}
              alt="Profile"
              className="w-full h-full object-cover"
            />
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

      {/* Stats Cards - Two equal-width cards with subtle elevation */}
      <div className="grid grid-cols-2 gap-4 mb-8 px-4 md:px-6">
        <div className="bg-surface dark:bg-zinc-900 border border-primary/30 dark:border-primary/20 rounded-2xl p-5 flex flex-col items-center shadow-md hover:shadow-lg transition-shadow">
          <div className="bg-primary/10 dark:bg-primary/20 p-2 rounded-lg mb-2">
            <BookOpen size={20} className="text-primary" />
          </div>
          <span className="text-text-primary text-3xl font-bold mb-1">6</span>
          <span className="text-text-secondary text-sm text-center">Active Courses</span>
        </div>

        <div className="bg-surface dark:bg-zinc-900 border border-primary/30 dark:border-primary/20 rounded-2xl p-5 flex flex-col items-center shadow-md hover:shadow-lg transition-shadow">
          <div className="bg-primary/10 dark:bg-primary/20 p-2 rounded-lg mb-2">
            <Calendar size={20} className="text-primary" />
          </div>
          <span className="text-text-primary text-3xl font-bold mb-1">124</span>
          <span className="text-text-secondary text-sm text-center">Total Sessions</span>
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
};
