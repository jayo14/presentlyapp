import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { UserRole } from '../../types';
import { Button } from '../Button';
import { Input } from '../Input';
import { Switch } from '../Switch';
import { 
  User, Bell, Shield, HelpCircle, LogOut, 
  Moon, Sun, Lock, Upload, Mail, AlertTriangle, 
  FileText, Laptop, Eye, Check, X, Database, Server, ChevronRight, Phone, Key, Fingerprint, Settings as SettingsIcon
} from 'lucide-react';
import { useCurrentUser } from '../../hooks/useAuth';
import ChangePasswordModal from './ChangePasswordModal';
import { PushNotificationSettings } from '../PushNotifications/PushNotificationSettings';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';
import { SEO } from '../SEO';
import { useTheme } from '../ThemeProvider';

// Premium Card Component adapted to app colors
const Card: React.FC<{ children: React.ReactNode; className?: string; hover?: boolean }> = ({ children, className = "", hover = true }) => (
  <div className={`bg-surface/70 backdrop-blur-xl rounded-[2rem] border border-outline shadow-sm overflow-hidden transition-all duration-300 ${hover ? 'hover:shadow-xl hover:shadow-primary/5' : ''} ${className}`}>
    {children}
  </div>
);

interface SettingsPageProps {
  userRole?: UserRole;
  onLogout?: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ userRole: propUserRole, onLogout: propOnLogout }) => {
  const { data: user, isLoading } = useCurrentUser();
  const context = useOutletContext<{ onLogout: () => void }>();
  
  const userRole = user?.role || propUserRole || UserRole.STUDENT;
  const onLogout = propOnLogout || context?.onLogout || (() => {});
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('profile');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [pendingSignature, setPendingSignature] = useState<string | null>(null);
  
  const { modalProps: reportModalProps } = useModalAccessibility(isReportModalOpen, () => setIsReportModalOpen(false));
  
  const { resolvedTheme, setTheme } = useTheme();
  const darkMode = resolvedTheme === 'dark';
  const [emailNotifs, setEmailNotifs] = useState(user?.notifications_enabled ?? true);
  const [reminderBeforeClass, setReminderBeforeClass] = useState(true);
  const [locationAccess, setLocationAccess] = useState(user?.location_enabled ?? true);
  const [highContrast, setHighContrast] = useState(false);

  const toggleDarkMode = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPendingSignature(event.target.result as string);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const confirmSignature = () => {
    setSignature(pendingSignature);
    setPendingSignature(null);
  };

  const cancelSignature = () => {
    setPendingSignature(null);
  };

  const tabs = [
    { id: 'profile', label: 'Identity', icon: User, color: 'text-primary' },
    { id: 'notifications', label: 'Updates', icon: Bell, color: 'text-amber-500' },
    { id: 'security', label: 'Privacy', icon: Shield, color: 'text-emerald-500' },
    { id: 'appearance', label: 'Visuals', icon: Eye, color: 'text-rose-500' },
    { id: 'help', label: 'Support', icon: HelpCircle, color: 'text-sky-500' },
  ];

  if (userRole === UserRole.ADMIN) {
    tabs.splice(4, 0, { id: 'system', label: 'System', icon: Server, color: 'text-purple-500' });
  }

  const ActiveTabIcon = tabs.find(t => t.id === activeTab)?.icon || SettingsIcon;
  const userInitials = (user?.full_name || 'User').split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() || '').join('') || 'U';

  const renderContent = () => {
    if (isLoading) {
      return <div className="text-center py-20 text-textMuted">Loading settings...</div>;
    }

    switch(activeTab) {
      case 'profile':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="lg:col-span-1 space-y-6">
              <Card className="p-8 text-center relative group">
                <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-primary/10 to-transparent" />
                <div className="relative inline-block mt-4">
                  <div className="w-32 h-32 rounded-[2.5rem] bg-primary p-1 shadow-2xl">
                     <div className="w-full h-full rounded-[2.3rem] overflow-hidden border-4 border-surface bg-surfaceLow flex items-center justify-center text-4xl font-black text-text">
                        {userInitials}
                     </div>
                  </div>
                  <button className="absolute -bottom-2 -right-2 p-3 bg-surface text-text rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all outline-none">
                    <Upload size={18} />
                  </button>
                </div>
                <div className="mt-6">
                  <h3 className="font-headline text-xl font-black text-text">{user?.full_name || 'User'}</h3>
                  <p className="text-sm font-bold text-primary mt-1 uppercase tracking-widest">{userRole.replace('_', ' ')}</p>
                  
                  {userRole !== UserRole.ADMIN && (
                    <div className="mt-6 pt-6 border-t border-outline grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <p className="text-lg font-black text-text leading-none">{user?.attendance_rate || 0}%</p>
                        <p className="text-[10px] font-bold text-textMuted uppercase tracking-widest mt-1">Attendance</p>
                      </div>
                      <div className="text-center border-l border-outline">
                        <p className="text-lg font-black text-text leading-none">{user?.active_courses_count || 0}</p>
                        <p className="text-[10px] font-bold text-textMuted uppercase tracking-widest mt-1">Courses</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <Card className="p-8 space-y-6">
                <h4 className="font-headline text-lg font-black text-text flex items-center gap-2">
                  <Fingerprint className="text-primary" size={20} />
                  General Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="Full Name" defaultValue={user?.full_name || ''} />
                  <Input label="Email" defaultValue={user?.email || ''} disabled />
                  
                  {userRole === UserRole.STUDENT && (
                    <>
                      <Input label="Matric Number" defaultValue={user?.matric_number || ''} disabled />
                      <Input label="Level" defaultValue={user?.level || ''} />
                    </>
                  )}
                  {userRole === UserRole.LECTURER && (
                    <Input label="Staff ID" defaultValue={user?.staff_id || ''} disabled />
                  )}
                  <div className="md:col-span-2">
                    <Input label="Institution" defaultValue={user?.institution_name || ''} disabled />
                  </div>
                  {(user?.department_name || user?.department) && (
                    <div className="md:col-span-2">
                      <Input label="Department" defaultValue={user?.department_name || user?.department} disabled />
                    </div>
                  )}
                </div>
              </Card>

              <Card className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="font-headline text-lg font-black text-text flex items-center gap-2">
                    <Key className="text-amber-500" size={20} />
                    Security
                  </h4>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-surfaceLow border border-outline">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-surface border border-outline flex items-center justify-center">
                        <Lock size={18} className="text-textMuted" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-text">Password</p>
                        <p className="text-xs text-textMuted">Update your password</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setIsPasswordModalOpen(true)}>Change</Button>
                  </div>

                  {userRole === UserRole.STUDENT && (
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-surfaceLow border border-outline">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-surface border border-outline flex items-center justify-center">
                          {signature ? <Check size={18} className="text-emerald-500" /> : <X size={18} className="text-red-500" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-text">Digital Signature</p>
                          <p className="text-xs text-textMuted">{signature ? 'Configured' : 'Not setup'}</p>
                        </div>
                      </div>
                      <label className="cursor-pointer">
                        <Button variant="outline" size="sm" as="span">{signature ? 'Change' : 'Upload'}</Button>
                        <input type="file" accept="image/*" className="hidden" onChange={handleSignatureUpload} />
                      </label>
                    </div>
                  )}
                  
                  {pendingSignature && (
                     <div className="mt-4 p-4 bg-surfaceHigh rounded-2xl border border-outline animate-in fade-in">
                         <p className="text-sm font-medium text-text mb-3 text-center">Confirm new signature?</p>
                         <div className="h-32 bg-surface rounded-lg mb-4 flex items-center justify-center overflow-hidden border border-outline">
                             <img src={pendingSignature} alt="Signature Preview" className="max-h-full max-w-full object-contain" />
                         </div>
                         <div className="flex gap-2">
                             <Button onClick={confirmSignature} className="flex-1"><Check size={16} className="mr-2"/> Confirm</Button>
                             <Button onClick={cancelSignature} variant="secondary" className="flex-1"><X size={16} className="mr-2"/> Cancel</Button>
                         </div>
                     </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
            <Card className="divide-y divide-outline">
              <div className="p-6 md:p-8 flex items-center justify-between hover:bg-surfaceLow transition-all">
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-surfaceHigh flex items-center justify-center text-primary shrink-0">
                    <Mail size={24} />
                  </div>
                  <div>
                    <p className="font-headline text-base md:text-lg font-black text-text">Email Notifications</p>
                    <p className="text-xs md:text-sm text-textMuted font-medium">Receive attendance summaries via email</p>
                  </div>
                </div>
                <Switch checked={emailNotifs} onCheckedChange={setEmailNotifs} />
              </div>
              <div className="p-6 md:p-8 flex items-center justify-between hover:bg-surfaceLow transition-all">
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-surfaceHigh flex items-center justify-center text-amber-500 shrink-0">
                    <Bell size={24} />
                  </div>
                  <div>
                    <p className="font-headline text-base md:text-lg font-black text-text">Class Reminders</p>
                    <p className="text-xs md:text-sm text-textMuted font-medium">Notify me 15 minutes before class</p>
                  </div>
                </div>
                <Switch checked={reminderBeforeClass} onCheckedChange={setReminderBeforeClass} />
              </div>
            </Card>
            <div className="mt-8">
              <h4 className="font-headline text-lg font-black text-text mb-4 px-2">Push Notifications</h4>
              <Card className="p-6 md:p-8">
                <PushNotificationSettings />
              </Card>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-6">
            <Card className="p-6 md:p-8">
               <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
                  <div>
                    <h4 className="font-headline text-lg font-black text-text flex items-center gap-2">
                      <Shield className="text-emerald-500" size={20} />
                      Recognized Devices
                    </h4>
                    <p className="text-sm text-textMuted mt-1">Manage active sessions and devices</p>
                  </div>
                  <Button variant="outline" onClick={() => navigate('/dashboard/security')}>Manage Devices</Button>
               </div>
               
               <div className="flex items-center gap-4 p-4 bg-surfaceLow rounded-2xl border border-outline">
                  <div className="w-12 h-12 rounded-xl bg-surface border border-outline flex items-center justify-center shrink-0">
                     <Laptop size={20} className="text-textMuted" />
                  </div>
                  <div className="flex-1">
                     <p className="text-sm font-bold text-text">Windows PC - Chrome</p>
                     <p className="text-xs text-emerald-500 font-medium">Active now</p>
                  </div>
               </div>
            </Card>

            <Card className="divide-y divide-outline">
              <div className="p-6 md:p-8 flex items-center justify-between hover:bg-surfaceLow transition-all">
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-surfaceHigh flex items-center justify-center text-primary shrink-0">
                    <Phone size={24} />
                  </div>
                  <div>
                    <p className="font-headline text-base md:text-lg font-black text-text">Location Access</p>
                    <p className="text-xs md:text-sm text-textMuted font-medium">Allow GPS for attendance verification</p>
                  </div>
                </div>
                <Switch checked={locationAccess} onCheckedChange={setLocationAccess} />
              </div>
              <div className="p-6 md:p-8 flex items-center justify-between hover:bg-surfaceLow transition-all">
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-surfaceHigh flex items-center justify-center text-zinc-400 shrink-0">
                    <Lock size={24} />
                  </div>
                  <div>
                    <p className="font-headline text-base md:text-lg font-black text-textMuted">Two-Factor Auth</p>
                    <p className="text-xs md:text-sm text-textMuted font-medium">Coming soon</p>
                  </div>
                </div>
              </div>
              <button className="w-full text-left p-6 md:p-8 flex items-center justify-between hover:bg-surfaceLow transition-all">
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-surfaceHigh flex items-center justify-center text-primary shrink-0">
                    <Database size={24} />
                  </div>
                  <div>
                    <p className="font-headline text-base md:text-lg font-black text-text">Data Export</p>
                    <p className="text-xs md:text-sm text-textMuted font-medium">Download your usage data</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-textMuted" />
              </button>
            </Card>
          </div>
        );

      case 'appearance':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-8">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button 
                  onClick={() => toggleDarkMode(false)}
                  className={`relative overflow-hidden group p-8 rounded-[2rem] border-2 transition-all duration-500 text-left ${!darkMode ? 'border-primary bg-surface shadow-2xl scale-[1.02]' : 'border-transparent bg-surfaceLow hover:bg-surface'}`}
                >
                  <Sun className={`mb-4 ${!darkMode ? 'text-amber-500' : 'text-textMuted'}`} size={32} />
                  <h3 className={`text-xl font-black ${!darkMode ? 'text-text' : 'text-textMuted'}`}>Light Theme</h3>
                  <p className="text-sm text-textMuted font-medium mt-1">Optimized for day-time productivity</p>
                </button>
                
                <button 
                  onClick={() => toggleDarkMode(true)}
                  className={`relative overflow-hidden group p-8 rounded-[2rem] border-2 transition-all duration-500 text-left ${darkMode ? 'border-primary bg-surface shadow-2xl scale-[1.02]' : 'border-transparent bg-surfaceLow hover:bg-surface'}`}
                >
                  <Moon className={`mb-4 ${darkMode ? 'text-primary' : 'text-textMuted'}`} size={32} />
                  <h3 className={`text-xl font-black ${darkMode ? 'text-text' : 'text-textMuted'}`}>Dark Theme</h3>
                  <p className="text-sm text-textMuted font-medium mt-1">High contrast dark mode</p>
                </button>
             </div>

             <Card className="p-6 md:p-8 flex items-center justify-between">
                <div>
                   <p className="font-headline text-lg font-black text-text">High Contrast</p>
                   <p className="text-sm text-textMuted font-medium">Increase contrast for better visibility</p>
                </div>
                <Switch checked={highContrast} onCheckedChange={setHighContrast} />
             </Card>
          </div>
        );

      case 'help':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 flex flex-col gap-8 h-full min-h-[400px]">
            <Card className="divide-y divide-outline border-outline/50 shadow-sm flex-shrink-0">
              <button onClick={() => setIsReportModalOpen(true)} className="w-full text-left p-6 md:p-8 flex items-center justify-between hover:bg-surfaceLow transition-all">
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
                    <AlertTriangle size={24} />
                  </div>
                  <div>
                    <p className="font-headline text-base md:text-lg font-black text-text">Report an Issue</p>
                    <p className="text-xs md:text-sm text-textMuted font-medium">Found a bug? Let us know.</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-textMuted" />
              </button>
              
              <button className="w-full text-left p-6 md:p-8 flex items-center justify-between hover:bg-surfaceLow transition-all">
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                    <FileText size={24} />
                  </div>
                  <div>
                    <p className="font-headline text-base md:text-lg font-black text-text">Documentation</p>
                    <p className="text-xs md:text-sm text-textMuted font-medium">Read guides and FAQs.</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-textMuted" />
              </button>
            </Card>

            <div className="flex justify-center mt-auto flex-shrink-0">
              <Button onClick={onLogout} variant="outline" className="w-full max-w-sm gap-2 text-red-500 hover:text-red-600 hover:bg-red-500/10 border-red-500/20">
                  <LogOut size={18} />
                  Log Out
              </Button>
            </div>
          </div>
        );

      case 'system':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
             <Card className="divide-y divide-outline">
                <div className="p-6 md:p-8 flex items-center justify-between hover:bg-surfaceLow transition-all">
                   <div className="flex items-center gap-4 md:gap-6">
                      <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-surfaceHigh flex items-center justify-center text-purple-500 shrink-0">
                         <Server size={24} />
                      </div>
                      <div>
                         <p className="font-headline text-base md:text-lg font-black text-text">Maintenance Mode</p>
                         <p className="text-xs md:text-sm text-textMuted font-medium">Disable access for non-admins</p>
                      </div>
                   </div>
                   <Switch checked={false} onCheckedChange={() => {}} />
                </div>
                
                <div className="p-6 md:p-8 flex items-center justify-between hover:bg-surfaceLow transition-all">
                   <div className="flex items-center gap-4 md:gap-6">
                      <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-surfaceHigh flex items-center justify-center text-primary shrink-0">
                         <Database size={24} />
                      </div>
                      <div>
                         <p className="font-headline text-base md:text-lg font-black text-text">Backup Config</p>
                         <p className="text-xs md:text-sm text-textMuted font-medium">Daily at 02:00 AM</p>
                      </div>
                   </div>
                   <Button variant="outline" size="sm">Configure</Button>
                </div>
             </Card>
          </div>
        );

      default:
        return null;
    }
  };

  const layout = (
    <div className="flex flex-col lg:flex-row max-w-[1400px] mx-auto min-h-screen lg:min-h-[calc(100vh-4rem)] relative">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-72 shrink-0 border-r border-outline sticky top-0 h-[calc(100vh-4rem)]">
        <div className="p-6 lg:p-8 flex flex-col w-full h-full pb-8">
          <nav className="flex flex-col gap-2 flex-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group relative flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all duration-300 ${
                  activeTab === tab.id 
                    ? 'bg-surface border border-outline shadow-xl shadow-primary/5 text-text' 
                    : 'text-textMuted hover:text-text hover:bg-surfaceLow border border-transparent'
                }`}
              >
                <tab.icon size={18} className={`${activeTab === tab.id ? tab.color : 'text-textMuted group-hover:scale-110 transition-transform'}`} />
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute left-0 w-1.5 h-6 bg-primary rounded-r-full" />
                )}
              </button>
            ))}
          </nav>

          <div className="pt-8 mt-auto flex-shrink-0">
            <div className="p-4 rounded-2xl bg-surfaceLow border border-outline flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 border-2 border-surface flex items-center justify-center text-primary font-bold">
                 {userInitials}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-bold text-text truncate">{user?.full_name}</p>
                <p className="text-[10px] text-textMuted font-medium truncate uppercase tracking-widest">{userRole.replace('_', ' ')}</p>
              </div>
              <button onClick={onLogout} className="p-2 text-textMuted hover:text-red-500 transition-colors">
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6 md:p-8 lg:p-12 relative w-full overflow-x-hidden min-h-screen lg:min-h-0 bg-background">
        {/* Mobile Header Tabs */}
        <div className="lg:hidden flex overflow-x-auto gap-3 no-scrollbar pb-4 mb-6 border-b border-outline">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex shrink-0 items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id 
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
                  : 'bg-surface text-textMuted border border-outline'
              }`}
            >
              <tab.icon size={14} className={activeTab === tab.id ? 'text-primary-foreground' : tab.color} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="max-w-4xl mx-auto space-y-8 lg:space-y-10">
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="animate-in fade-in slide-in-from-left-4 duration-700">
              <div className="flex items-center gap-2 text-primary mb-2">
                <ActiveTabIcon size={16} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">User Preferences</span>
              </div>
              <h2 className="text-3xl lg:text-5xl font-black text-text tracking-tight capitalize leading-none">
                {activeTab === 'profile' ? 'Profile Identity' : activeTab}
              </h2>
            </div>
            {activeTab === 'profile' && (
              <Button onClick={() => {}} className="hidden sm:flex">
                Save Changes
              </Button>
            )}
          </header>

          {renderContent()}
        </div>
        
        {/* Fill empty space on mobile to ensure scrolling works pleasantly */}
        <div className="h-32 lg:h-12 w-full" />
      </main>

      {/* Report Issue Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div 
                {...reportModalProps}
                aria-labelledby="report-title"
                className="bg-surface text-text border border-outline rounded-none md:rounded-2xl w-full h-[100dvh] md:h-auto md:max-w-md p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200 outline-none overflow-y-auto"
            >
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 id="report-title" className="font-headline text-xl font-bold text-text">Report an Issue</h3>
                        <p className="text-sm text-textMuted">We appreciate your feedback!</p>
                    </div>
                    <button onClick={() => setIsReportModalOpen(false)} className="text-textMuted hover:text-text cursor-pointer" aria-label="Close dialog">
                        <span className="text-2xl">&times;</span>
                    </button>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-textMuted mb-1.5">Subject</label>
                        <select className="w-full bg-surfaceLow border border-outline rounded-full px-4 py-2.5 text-text text-sm focus:ring-primary focus:border-primary outline-none">
                            <option>Bug Report</option>
                            <option>Feature Request</option>
                            <option>Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-textMuted mb-1.5">Description</label>
                        <textarea 
                            rows={4} 
                            placeholder="Please describe the issue in detail..."
                            className="w-full bg-surfaceLow border border-outline rounded-3xl p-3 text-text text-sm focus:ring-primary focus:border-primary resize-none placeholder:text-textMuted"
                        ></textarea>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <Button className="flex-1" onClick={() => setIsReportModalOpen(false)}>Submit Report</Button>
                        <Button variant="secondary" className="flex-1" onClick={() => setIsReportModalOpen(false)}>Cancel</Button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <ChangePasswordModal onClose={() => setIsPasswordModalOpen(false)} />
      )}

    </div>
  );

  return (
    <>
      <SEO
        title="Settings | Dashboard"
        description="Manage your account settings, notification preferences and privacy options on Presently."
        noIndex
      />
      {layout}
    </>
  );
};

export default SettingsPage;
