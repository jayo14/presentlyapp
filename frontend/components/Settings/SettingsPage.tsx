import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { UserRole } from '../../types';
import { Button } from '../Button';
import { Input } from '../Input';
import { Switch } from '../Switch';
import { 
  User, Bell, Shield, Smartphone, HelpCircle, LogOut, 
  Moon, Sun, Globe, Lock, Upload, Mail, AlertTriangle, 
  FileText, ChevronRight, Laptop, Eye, Check, X, Database, Server
} from 'lucide-react';
import { useCurrentUser } from '../../hooks/useAuth';
import ChangePasswordModal from './ChangePasswordModal';
import { PushNotificationSettings } from '../PushNotifications/PushNotificationSettings';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';

interface SettingsPageProps {
  userRole?: UserRole;
  onLogout?: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ userRole: propUserRole, onLogout: propOnLogout }) => {
  const { data: user, isLoading } = useCurrentUser();
  const context = useOutletContext<{ onLogout: () => void }>();
  
  const userRole = user?.role || propUserRole || UserRole.STUDENT;
  const onLogout = propOnLogout || context?.onLogout || (() => {});

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [pendingSignature, setPendingSignature] = useState<string | null>(null);
  
  const { modalProps: reportModalProps } = useModalAccessibility(isReportModalOpen, () => setIsReportModalOpen(false));
  
  // Preference States - Initialize from user data when available
  const [darkMode, setDarkMode] = useState(document.documentElement.classList.contains('dark'));
  const [emailNotifs, setEmailNotifs] = useState(user?.notifications_enabled ?? true);
  const [pushNotifs, setPushNotifs] = useState(user?.notifications_enabled ?? false);
  const [locationAccess, setLocationAccess] = useState(user?.location_enabled ?? true);
  const [highContrast, setHighContrast] = useState(false);
  const [reminderBeforeClass, setReminderBeforeClass] = useState(true);

  const toggleDarkMode = (checked: boolean) => {
    setDarkMode(checked);
    if (checked) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
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

  const SectionHeader = ({ icon: Icon, title }: { icon: any, title: string }) => (
    <div className="mb-4">
      <h2 className="text-2xl font-bold text-white">{title}</h2>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto pb-20 animate-in fade-in duration-500">
      
      {/* Header with back button for mobile-like experience */}
      <div className="flex items-center mb-8 pt-4 pb-6 border-b border-zinc-800">
        <h1 className="text-xl font-bold text-white">
          {userRole === UserRole.LECTURER ? 'Lecturer Settings' : 'Settings'}
        </h1>
      </div>
      
      {/* Account Settings - Available to All */}
      <section className="px-6 mb-8">
        <SectionHeader 
          icon={User} 
          title="Account"
        />
        {isLoading ? (
          <div className="text-center py-8 text-zinc-500">Loading user data...</div>
        ) : (
          <div className="space-y-3">
            {/* Edit Profile Button */}
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

            {/* Password Change */}
            <button 
              onClick={() => setIsPasswordModalOpen(true)}
              className="w-full bg-surface rounded-2xl p-4 flex items-center hover:bg-zinc-800 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center mr-4">
                <Lock size={24} className="text-white" />
              </div>
              <span className="flex-1 text-white font-semibold text-base text-left">
                Change Password
              </span>
              <ChevronRight size={20} className="text-text-muted" />
            </button>
          </div>
        )}
      </section>

      {/* Appearance & Accessibility */}
      <section className="px-6 mb-8">
        <SectionHeader 
          icon={Eye} 
          title="Appearance"
        />
        <div className="bg-surface rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center flex-1">
            <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center mr-4">
              {darkMode ? <Moon size={24} className="text-white" /> : <Sun size={24} className="text-white" />}
            </div>
            <span className="text-white font-semibold text-base">
              Dark Mode
            </span>
          </div>
          <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
        </div>
      </section>

      {/* Privacy & Security - Mostly Student/Lecturer */}
      {(userRole === UserRole.STUDENT || userRole === UserRole.LECTURER) && (
      <section className="px-6 mb-8">
        <SectionHeader 
          icon={Shield} 
          title="Privacy & Security"
        />
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
      </section>
      )}

      {/* Legacy detailed sections (collapsed by default) */}
      <details className="px-6 mb-8">
        <summary className="cursor-pointer text-text-secondary hover:text-white transition-colors">
          Show Advanced Settings
        </summary>
        <div className="mt-6 space-y-6">
          {/* Original detailed form fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="Full Name" 
                defaultValue={user?.full_name || ''} 
                placeholder="Your full name"
                className="bg-zinc-50 dark:bg-zinc-950"
              />
              <Input 
                label="Email" 
                defaultValue={user?.email || ''} 
                disabled 
                className="opacity-70 bg-zinc-50 dark:bg-zinc-950"
              />
              {userRole === UserRole.STUDENT && (
                <>
                  <Input 
                    label="Matric Number" 
                    defaultValue={user?.matric_number || ''} 
                    placeholder="Your matric number"
                    className="bg-zinc-50 dark:bg-zinc-950"
                  />
                  <Input 
                    label="Department" 
                    defaultValue={user?.department || ''} 
                    placeholder="Your department"
                    className="bg-zinc-50 dark:bg-zinc-950"
                  />
                  <Input 
                    label="Level" 
                    defaultValue={user?.level || ''} 
                    placeholder="Current level"
                    className="bg-zinc-50 dark:bg-zinc-950"
                  />
                </>
              )}
              {userRole === UserRole.LECTURER && (
                <>
                  <Input 
                    label="Staff ID" 
                    defaultValue={user?.staff_id || ''} 
                    placeholder="Your staff ID"
                    className="bg-zinc-50 dark:bg-zinc-950"
                  />
                  <Input 
                    label="Department" 
                    defaultValue={user?.department || ''} 
                    placeholder="Your department"
                    className="bg-zinc-50 dark:bg-zinc-950"
                  />
                </>
              )}
              <Input 
                label="Institution" 
                defaultValue={user?.institution_name || ''} 
                placeholder="Your institution"
                disabled
                className="opacity-70 bg-zinc-50 dark:bg-zinc-950"
              />
              {user?.college_name && (
                <Input 
                  label="College/Faculty" 
                  defaultValue={user.college_name} 
                  placeholder="Your college"
                  disabled
                />
              )}
              {user?.phone_number && (
                <Input 
                  label="Phone Number" 
                  defaultValue={user.phone_number} 
                  placeholder="Your phone number"
                />
              )}
            </div>
            
            <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
              <div className="flex items-center gap-3">
                <div className="bg-zinc-100 dark:bg-zinc-800 p-2 rounded-full">
                  <Lock size={18} className="text-zinc-500 dark:text-zinc-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">Password</p>
                  <p className="text-xs text-zinc-500">Update your password</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsPasswordModalOpen(true)}
              >
                Change
              </Button>
            </div>

          {/* Student Specific: Digital Signature */}
          {userRole === UserRole.STUDENT && (
            <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <h3 className="text-sm font-medium text-zinc-900 dark:text-white">Digital Signature</h3>
                {pendingSignature ? (
                     <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
                         <p className="text-sm font-medium text-zinc-900 dark:text-white mb-3 text-center">Confirm new signature?</p>
                         <div className="h-32 bg-white rounded-lg mb-4 flex items-center justify-center overflow-hidden border border-zinc-200">
                             <img src={pendingSignature} alt="Signature Preview" className="max-h-full max-w-full object-contain" />
                         </div>
                         <div className="flex gap-2">
                             <Button onClick={confirmSignature} className="flex-1"><Check size={16} className="mr-2"/> Confirm</Button>
                             <Button onClick={cancelSignature} variant="secondary" className="flex-1"><X size={16} className="mr-2"/> Cancel</Button>
                         </div>
                     </div>
                ) : (
                    <label className="border border-dashed border-zinc-300 dark:border-zinc-800 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer group bg-white dark:bg-transparent">
                        <input type="file" accept="image/*" className="hidden" onChange={handleSignatureUpload} />
                        {signature ? (
                            <div className="mb-2 h-16 w-full flex justify-center">
                                <img src={signature} alt="Signature" className="h-full object-contain dark:filter dark:invert" />
                            </div>
                        ) : (
                            <Upload className="mb-2 text-zinc-400 group-hover:text-primary transition-colors" size={24} />
                        )}
                        <p className="text-sm font-medium text-zinc-900 dark:text-white">{signature ? 'Change Digital Signature' : 'Upload Digital Signature'}</p>
                        <p className="text-xs text-zinc-500">Used for signing attendance sheets.</p>
                    </label>
                )}
            </div>
           )}
          </div>
        </div>
      </details>

      {/* Notification Settings - collapsed legacy section */}
      <details className="px-6 mb-8">
        <summary className="cursor-pointer text-text-secondary hover:text-white transition-colors">
          Show Notification Settings
        </summary>
        <div className="mt-6">
          <div className="space-y-2 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 shadow-sm">
              {[
                  { label: 'Email Notifications', desc: 'Receive attendance summaries via email.', state: emailNotifs, setter: setEmailNotifs },
                  { label: 'Class Reminders', desc: 'Notify me 15 minutes before class starts.', state: reminderBeforeClass, setter: setReminderBeforeClass },
              ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors rounded-lg">
                      <div>
                          <p className="text-sm font-medium text-zinc-900 dark:text-white">{item.label}</p>
                          <p className="text-xs text-zinc-500">{item.desc}</p>
                      </div>
                      <Switch checked={item.state} onCheckedChange={item.setter} />
                  </div>
              ))}
          </div>
          
          {/* Push Notification Settings */}
          <PushNotificationSettings />
        </div>
      </section>

      {/* Admin Specific Settings */}
      {userRole === UserRole.ADMIN && (
        <section>
          <SectionHeader 
            icon={Server} 
            title="System Configuration" 
            description="Manage global system settings." 
          />
           <div className="space-y-4">
             <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm">
                <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">Maintenance Mode</p>
                    <p className="text-xs text-zinc-500">Disable access for all non-admin users.</p>
                </div>
                <Switch checked={false} onCheckedChange={() => {}} />
            </div>
             <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm">
                <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">Backup Frequency</p>
                    <p className="text-xs text-zinc-500">Daily at 02:00 AM</p>
                </div>
                <Button variant="outline" size="sm">Configure</Button>
            </div>
          </div>
        </section>
      )}

      {/* Appearance & Accessibility - All Roles */}
      <section>
        <SectionHeader 
          icon={Eye} 
          title="Appearance" 
          description="Customize the look and feel of the application." 
        />
        <div className="space-y-4">
             <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="bg-zinc-100 dark:bg-zinc-800 p-2 rounded-full text-zinc-900 dark:text-white">
                        {darkMode ? <Moon size={18} /> : <Sun size={18} />}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-zinc-900 dark:text-white">Dark Mode</p>
                        <p className="text-xs text-zinc-500">Switch between dark and light themes.</p>
                    </div>
                </div>
                <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
            </div>

            <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm">
                <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">High Contrast</p>
                    <p className="text-xs text-zinc-500">Increase contrast for better visibility.</p>
                </div>
                <Switch checked={highContrast} onCheckedChange={setHighContrast} />
            </div>
        </div>
      </section>

      {/* Privacy & Security - Mostly Student/Lecturer */}
      {(userRole === UserRole.STUDENT || userRole === UserRole.LECTURER) && (
      <section>
        <SectionHeader 
            icon={Shield} 
            title="Privacy & Security" 
            description="Manage your data and security preferences." 
        />
        <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm">
                 <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">Location Access</p>
                    <p className="text-xs text-zinc-500">Allow GPS for attendance verification.</p>
                </div>
                <Switch checked={locationAccess} onCheckedChange={setLocationAccess} />
            </div>
            
            <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                     <div>
                        <p className="text-sm font-medium text-zinc-900 dark:text-white">Active Sessions</p>
                        <p className="text-xs text-zinc-500">Manage devices logged into your account.</p>
                    </div>
                    <Button variant="outline" size="sm">View All</Button>
                </div>
                <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-950 rounded-lg">
                    <Laptop size={18} className="text-zinc-500 dark:text-zinc-400" />
                    <div className="flex-1">
                        <p className="text-sm text-zinc-900 dark:text-white">Windows PC - Chrome</p>
                        <p className="text-xs text-green-500">Active now</p>
                    </div>
                </div>
            </div>
        </div>
      </section>
      )}

      {/* Help & Support - All Roles */}
      <section>
        <SectionHeader 
            icon={HelpCircle} 
            title="Help & Support" 
            description="Get help or report issues." 
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
                onClick={() => setIsReportModalOpen(true)}
                className="flex items-center gap-4 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-left shadow-sm"
            >
                <div className="bg-red-500/10 p-3 rounded-full text-red-500">
                    <AlertTriangle size={20} />
                </div>
                <div>
                    <p className="font-medium text-zinc-900 dark:text-white">Report an Issue</p>
                    <p className="text-xs text-zinc-500">Found a bug? Let us know.</p>
                </div>
            </button>
            <button className="flex items-center gap-4 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-left shadow-sm">
                <div className="bg-blue-500/10 p-3 rounded-full text-blue-500">
                    <FileText size={20} />
                </div>
                <div>
                    <p className="font-medium text-zinc-900 dark:text-white">Documentation</p>
                    <p className="text-xs text-zinc-500">Read guides and FAQs.</p>
                </div>
            </button>
        </div>
      </section>

      {/* Logout */}
      <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800">
        <Button onClick={onLogout} variant="secondary" className="w-full gap-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-400/10 border-red-200 dark:border-red-900/30">
            <LogOut size={18} />
            Log Out
        </Button>
      </div>

      {/* Report Issue Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div 
                {...reportModalProps}
                aria-labelledby="report-title"
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200 outline-none"
            >
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 id="report-title" className="text-xl font-bold text-zinc-900 dark:text-white">Report an Issue</h3>
                        <p className="text-sm text-zinc-500">We appreciate your feedback!</p>
                    </div>
                    <button onClick={() => setIsReportModalOpen(false)} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white" aria-label="Close dialog">
                        <AlertTriangle size={20} className="hidden" /> {/* Dummy to keep imports happy if unused */}
                        <span className="text-2xl">&times;</span>
                    </button>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">Subject</label>
                        <select className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5 text-zinc-900 dark:text-white text-sm focus:ring-primary focus:border-primary outline-none">
                            <option>Bug Report</option>
                            <option>Feature Request</option>
                            <option>Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">Description</label>
                        <textarea 
                            rows={4} 
                            placeholder="Please describe the issue in detail..."
                            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-zinc-900 dark:text-white text-sm focus:ring-primary focus:border-primary resize-none placeholder-zinc-500"
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
};

export default SettingsPage;