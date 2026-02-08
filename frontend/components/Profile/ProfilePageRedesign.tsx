import React from 'react';
import { ArrowLeft, Share2, Settings, Bell, HelpCircle, LogOut, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCurrentUser } from '../../hooks/useAuth';

export const ProfilePageRedesign: React.FC = () => {
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();
  
  const userAvatar = user?.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400';
  const userName = user?.full_name || 'Dr. Sarah Smith';
  const userRole = user?.role === 'LECTURER' 
    ? 'Senior Lecturer - Computer Science' 
    : user?.department || 'Computer Science';

  return (
    <div className="max-w-3xl mx-auto min-h-screen pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pt-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} className="text-white" />
        </button>
        <h1 className="text-xl font-bold text-white">Profile</h1>
        <button className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
          <Share2 size={24} className="text-white" />
        </button>
      </div>

      {/* Profile Section */}
      <div className="flex flex-col items-center mb-8">
        {/* Avatar with gold border */}
        <div className="w-44 h-44 rounded-full overflow-hidden border-4 border-primary mb-6">
          <img 
            src={userAvatar}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>

        {/* User Info */}
        <h2 className="text-3xl font-bold text-white mb-2 text-center">
          {userName}
        </h2>
        <p className="text-text-secondary text-base text-center">
          {userRole}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="flex gap-4 mb-8 px-6">
        <div className="flex-1 bg-surface border border-primary/30 rounded-3xl py-6 flex flex-col items-center">
          <span className="text-white text-4xl font-bold mb-1">6</span>
          <span className="text-text-secondary text-sm">Active Courses</span>
        </div>

        <div className="flex-1 bg-surface border border-primary/30 rounded-3xl py-6 flex flex-col items-center">
          <span className="text-white text-4xl font-bold mb-1">124</span>
          <span className="text-text-secondary text-sm">Total Sessions</span>
        </div>
      </div>

      {/* Account Section */}
      <div className="px-6 mb-8">
        <h3 className="text-white text-2xl font-bold mb-4">Account</h3>

        <div className="space-y-3">
          {/* Settings */}
          <button 
            onClick={() => navigate('/settings')}
            className="w-full bg-surface rounded-2xl p-4 flex items-center hover:bg-zinc-800 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center mr-4">
              <Settings size={24} className="text-primary" />
            </div>
            <span className="flex-1 text-white font-semibold text-base text-left">
              Settings
            </span>
            <ChevronRight size={20} className="text-text-muted" />
          </button>

          {/* Notifications */}
          <button 
            onClick={() => navigate('/notifications')}
            className="w-full bg-surface rounded-2xl p-4 flex items-center hover:bg-zinc-800 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center mr-4">
              <Bell size={24} className="text-primary" />
            </div>
            <span className="flex-1 text-white font-semibold text-base text-left">
              Notifications
            </span>
            <ChevronRight size={20} className="text-text-muted" />
          </button>

          {/* Help & Support */}
          <button className="w-full bg-surface rounded-2xl p-4 flex items-center hover:bg-zinc-800 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center mr-4">
              <HelpCircle size={24} className="text-primary" />
            </div>
            <span className="flex-1 text-white font-semibold text-base text-left">
              Help & Support
            </span>
            <ChevronRight size={20} className="text-text-muted" />
          </button>
        </div>
      </div>

      {/* Logout Button */}
      <div className="px-6">
        <button 
          onClick={() => navigate('/login')}
          className="w-full bg-transparent border border-red-500/30 rounded-2xl py-4 flex items-center justify-center hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={20} className="text-red-500 mr-2" />
          <span className="text-red-500 font-bold text-base">
            Logout
          </span>
        </button>
      </div>
    </div>
  );
};
