import React, { useState } from 'react';
import { ArrowLeft, User, Phone, Bell, Moon, Shield, Database, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Switch } from '../Switch';

export const LecturerSettingsPageRedesign: React.FC = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(true);

  return (
    <div className="max-w-3xl mx-auto min-h-screen pb-8">
      {/* Header */}
      <div className="flex items-center mb-8 pt-4 pb-6 border-b border-zinc-800">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-zinc-800 rounded-lg transition-colors -ml-2"
        >
          <ArrowLeft size={24} className="text-white" />
        </button>
        <h1 className="flex-1 text-white text-xl font-bold ml-2">
          Lecturer Settings
        </h1>
      </div>

      {/* Account Section */}
      <div className="px-6 mb-8">
        <h3 className="text-white text-2xl font-bold mb-4">Account</h3>

        <div className="space-y-3">
          {/* Edit Profile */}
          <button className="w-full bg-surface rounded-2xl p-4 flex items-center hover:bg-zinc-800 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center mr-4">
              <User size={24} className="text-white" />
            </div>
            <span className="flex-1 text-white font-semibold text-base text-left">
              Edit Profile
            </span>
            <ChevronRight size={20} className="text-text-muted" />
          </button>

          {/* Change Phone Number */}
          <button className="w-full bg-surface rounded-2xl p-4 flex items-center hover:bg-zinc-800 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center mr-4">
              <Phone size={24} className="text-white" />
            </div>
            <span className="flex-1 text-white font-semibold text-base text-left">
              Change Phone Number
            </span>
            <ChevronRight size={20} className="text-text-muted" />
          </button>

          {/* Notification Preferences */}
          <button className="w-full bg-surface rounded-2xl p-4 flex items-center hover:bg-zinc-800 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center mr-4">
              <Bell size={24} className="text-white" />
            </div>
            <span className="flex-1 text-white font-semibold text-base text-left">
              Notification Preferences
            </span>
            <ChevronRight size={20} className="text-text-muted" />
          </button>
        </div>
      </div>

      {/* Appearance Section */}
      <div className="px-6 mb-8">
        <h3 className="text-white text-2xl font-bold mb-4">Appearance</h3>

        <div className="bg-surface rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center flex-1">
            <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center mr-4">
              <Moon size={24} className="text-white" />
            </div>
            <span className="text-white font-semibold text-base">
              Dark Mode
            </span>
          </div>
          <Switch 
            checked={darkMode}
            onCheckedChange={setDarkMode}
          />
        </div>
      </div>

      {/* Privacy & Security Section */}
      <div className="px-6 mb-8">
        <h3 className="text-white text-2xl font-bold mb-4">Privacy & Security</h3>

        <div className="space-y-3">
          {/* Two-Factor Authentication */}
          <button className="w-full bg-surface rounded-2xl p-4 flex items-center hover:bg-zinc-800 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center mr-4">
              <Shield size={24} className="text-white" />
            </div>
            <span className="flex-1 text-white font-semibold text-base text-left">
              Two-Factor Authentication
            </span>
            <ChevronRight size={20} className="text-text-muted" />
          </button>

          {/* Data Export Preferences */}
          <button className="w-full bg-surface rounded-2xl p-4 flex items-center hover:bg-zinc-800 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center mr-4">
              <Database size={24} className="text-white" />
            </div>
            <span className="flex-1 text-white font-semibold text-base text-left">
              Data Export Preferences
            </span>
            <ChevronRight size={20} className="text-text-muted" />
          </button>
        </div>
      </div>
    </div>
  );
};
