import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { UserRole } from '../../types';
import { Button } from '../Button';
import { Switch } from '../Switch';
import {
  User, Bell, Shield, Moon, Sun, Lock, Key, ChevronRight, Settings as SettingsIcon, Laptop, Fingerprint
} from 'lucide-react';
import { useCurrentUser } from '../../hooks/useAuth';
import ChangePasswordModal from './ChangePasswordModal';
import { SEO } from '../SEO';
import { useTheme } from '../ThemeProvider';
import { DashboardPage } from '../../src/components/layout-primitives/DashboardPage';
import { ModernCard } from '../ModernCard';
import { cn } from '../../src/components/ui/utils';

export const SettingsPage: React.FC = () => {
  const { data: user, isLoading } = useCurrentUser();
  const context = useOutletContext<{ onLogout: () => void }>();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('profile');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const { resolvedTheme, setTheme } = useTheme();
  const darkMode = resolvedTheme === 'dark';

  if (isLoading && !user) return <div className="h-96 flex items-center justify-center">Loading settings...</div>;

  const sidebarItems = [
    { id: 'profile', label: 'Account Profile', icon: User },
    { id: 'appearance', label: 'Interface & Theme', icon: Moon },
    { id: 'security', label: 'Security & Access', icon: Shield },
    { id: 'notifications', label: 'Notification Rules', icon: Bell },
  ];

  return (
    <DashboardPage
      title="User Preferences"
      description="Customize your presently experience and manage security credentials."
      seoTitle="Settings | Presently"
    >
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
        {/* Sub-navigation */}
        <aside className="w-full lg:w-72 shrink-0">
           <nav className="flex flex-col gap-2 sticky top-24">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "flex items-center justify-between px-6 py-4 rounded-2xl transition-all group",
                    activeTab === item.id
                      ? "bg-sungold text-presently-black shadow-gold font-bold"
                      : "text-on-surface-variant hover:bg-surface-highest/40 hover:translate-x-1"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <item.icon size={18} className={activeTab === item.id ? "text-presently-black" : "text-on-surface-variant group-hover:text-on-surface"} />
                    <span className="text-sm">{item.label}</span>
                  </div>
                  {activeTab === item.id && <ChevronRight size={14} />}
                </button>
              ))}
           </nav>
        </aside>

        {/* Dynamic Content Area */}
        <main className="flex-1 min-w-0 max-w-4xl space-y-12">
          {activeTab === 'profile' && (
            <div className="space-y-12">
               <ModernCard padding="lg" className="border-outline/30 space-y-8">
                  <div className="flex items-center gap-3 border-b border-outline pb-4">
                    <User className="w-5 h-5 text-sungold" />
                    <h3 className="text-xl font-bold font-display text-presently-black">Personal Details</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Display Name</label>
                        <input disabled value={user?.full_name} className="w-full h-14 px-6 bg-surface-highest/20 border border-outline rounded-2xl text-sm font-bold opacity-60" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Email Address</label>
                        <input disabled value={user?.email} className="w-full h-14 px-6 bg-surface-highest/20 border border-outline rounded-2xl text-sm font-bold opacity-60" />
                     </div>
                  </div>
               </ModernCard>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-12">
               <ModernCard padding="lg" className="border-outline/30 space-y-10">
                  <div className="flex items-center gap-3 border-b border-outline pb-4">
                    <Sun className="w-5 h-5 text-sungold" />
                    <h3 className="text-xl font-bold font-display text-presently-black">Visual Experience</h3>
                  </div>
                  <div className="flex items-center justify-between group">
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-presently-black">Dark Interface Mode</p>
                      <p className="text-xs text-on-surface-variant">Switch between light and dark visual styles.</p>
                    </div>
                    <Switch checked={darkMode} onCheckedChange={(val) => setTheme(val ? 'dark' : 'light')} />
                  </div>
                  <div className="flex items-center justify-between group opacity-40">
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-presently-black">High Contrast Mode</p>
                      <p className="text-xs text-on-surface-variant">Accessibility optimization for readability.</p>
                    </div>
                    <Switch checked={false} disabled />
                  </div>
               </ModernCard>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-12">
               <ModernCard padding="lg" className="border-outline/30 space-y-10">
                  <div className="flex items-center gap-3 border-b border-outline pb-4">
                    <Shield className="w-5 h-5 text-sky-teal" />
                    <h3 className="text-xl font-bold font-display text-presently-black">Authentication & Privacy</h3>
                  </div>
                  <div className="flex items-center justify-between">
                     <div className="space-y-1">
                        <p className="text-sm font-bold text-presently-black">Account Password</p>
                        <p className="text-xs text-on-surface-variant">Last updated 3 months ago.</p>
                     </div>
                     <Button variant="outline" size="sm" className="h-10 px-6 font-bold tracking-widest text-[10px]" onClick={() => setIsPasswordModalOpen(true)}>
                        <Key size={14} className="mr-2" /> Change Password
                     </Button>
                  </div>
                  <div className="flex items-center justify-between">
                     <div className="space-y-1">
                        <p className="text-sm font-bold text-presently-black">Two-Factor Authentication</p>
                        <p className="text-xs text-on-surface-variant">Secure your account with MFA.</p>
                     </div>
                     <Badge variant="secondary">DISABLED</Badge>
                  </div>
               </ModernCard>

               <ModernCard padding="lg" className="border-outline/30 bg-warm-ivory/5 space-y-8">
                  <div className="flex items-center gap-3 border-b border-outline pb-4">
                    <Laptop className="w-5 h-5 text-on-surface-variant" />
                    <h3 className="text-xl font-bold font-display text-presently-black">Active Sessions</h3>
                  </div>
                  <div className="space-y-4">
                     <div className="flex items-center justify-between p-4 bg-white border border-outline rounded-2xl">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-surface-highest/40 flex items-center justify-center">
                              <Laptop size={18} />
                           </div>
                           <div>
                              <p className="text-sm font-bold text-presently-black">MacBook Pro • Chrome</p>
                              <p className="text-[10px] font-bold text-moss-green uppercase tracking-widest">Current Session</p>
                           </div>
                        </div>
                        <p className="text-xs font-bold text-on-surface-variant">Lagos, NG</p>
                     </div>
                  </div>
               </ModernCard>
            </div>
          )}
        </main>
      </div>

      <ChangePasswordModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} />
    </DashboardPage>
  );
};

export default SettingsPage;
