import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { UserRole } from '../../types';
import { Button } from '../Button';
import { Input } from '../Input';
import { Switch } from '../Switch';
import { 
  User, Bell, Shield, Smartphone, HelpCircle, LogOut, 
  Moon, Sun, Globe, Lock, Upload, Mail, AlertTriangle, 
  FileText, ChevronRight, Laptop, Eye, Check, X, Database, Server, ArrowLeft, Phone
} from 'lucide-react';
import { useCurrentUser } from '../../hooks/useAuth';
import ChangePasswordModal from './ChangePasswordModal';
import { PushNotificationSettings } from '../PushNotifications/PushNotificationSettings';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';
import { ResponsiveContainer } from '../layouts/ResponsiveContainer';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../SEO';

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

  const SectionHeader = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-outline">
      <div className="bg-primary/10 p-2 rounded-lg text-primary">
        <Icon size={24} />
      </div>
      <div>
        <h2 className="font-headline text-xl font-semibold text-text">{title}</h2>
        <p className="text-sm text-textMuted">{description}</p>
      </div>
    </div>
  );

  const navigate = useNavigate();

  // Mobile Layout (matching the dark theme design)
  const mobileLayout = (
    <div className="min-h-screen bg-background pb-24">
      {/* Mobile Header */}
      <div className="flex items-center p-4 border-b border-outline">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-surfaceHigh rounded-lg transition-colors mr-3"
        >
          <ArrowLeft size={24} className="text-text" />
        </button>
        <h1 className="font-headline text-xl font-bold text-text">
          {userRole === UserRole.LECTURER ? 'Lecturer Settings' : 'Settings'}
        </h1>
      </div>

      {/* Account Section */}
      <div className="p-4">
        <h2 className="font-headline text-text text-lg font-semibold mb-4">Account</h2>
        
        <div className="space-y-3">
          {/* Edit Profile */}
          <button 
            onClick={() => {/* Handle edit profile */}}
            className="w-full bg-surface rounded-2xl p-4 flex items-center hover:bg-surfaceHigh transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mr-4">
              <User size={22} className="text-primary" />
            </div>
            <span className="flex-1 text-text font-medium text-base text-left">
              Edit Profile
            </span>
            <ChevronRight size={20} className="text-textMuted" />
          </button>

          {/* Change Phone Number */}
          <button 
            onClick={() => {/* Handle change phone */}}
            className="w-full bg-surface rounded-2xl p-4 flex items-center hover:bg-surfaceHigh transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mr-4">
              <Phone size={22} className="text-primary" />
            </div>
            <span className="flex-1 text-text font-medium text-base text-left">
              Change Phone Number
            </span>
            <ChevronRight size={20} className="text-textMuted" />
          </button>

          {/* Notification Preferences */}
          <button 
            onClick={() => {/* Handle notification prefs */}}
            className="w-full bg-surface rounded-2xl p-4 flex items-center hover:bg-surfaceHigh transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mr-4">
              <Bell size={22} className="text-primary" />
            </div>
            <span className="flex-1 text-text font-medium text-base text-left">
              Notification Preferences
            </span>
            <ChevronRight size={20} className="text-textMuted" />
          </button>
        </div>
      </div>

      {/* Appearance Section */}
      <div className="p-4 mt-6">
        <h2 className="font-headline text-text text-lg font-semibold mb-4">Appearance</h2>
        
        {/* Dark Mode Toggle */}
        <div className="bg-surface rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Moon size={22} className="text-primary" />
            </div>
            <span className="text-text font-medium text-base">
              Dark Mode
            </span>
          </div>
          <div className={`w-12 h-6 rounded-full p-1 flex transition-colors ${darkMode ? 'bg-primary justify-end' : 'bg-zinc-700 justify-start'}`}>
            <div className="w-4 h-4 rounded-full bg-surface shadow-sm" />
          </div>
        </div>
      </div>

      {/* Privacy & Security Section */}
      <div className="p-4 mt-6">
        <h2 className="font-headline text-text text-lg font-semibold mb-4">Privacy & Security</h2>
        
        <div className="space-y-3">
          {/* Two-Factor Authentication */}
          <button 
            onClick={() => {/* Handle 2FA */}}
            className="w-full bg-surface rounded-2xl p-4 flex items-center hover:bg-surfaceHigh transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mr-4">
              <Lock size={22} className="text-primary" />
            </div>
            <span className="flex-1 text-text font-medium text-base text-left">
              Two-Factor Authentication
            </span>
            <ChevronRight size={20} className="text-textMuted" />
          </button>

          {/* Data Export Preferences */}
          <button 
            onClick={() => {/* Handle data export */}}
            className="w-full bg-surface rounded-2xl p-4 flex items-center hover:bg-surfaceHigh transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mr-4">
              <Database size={22} className="text-primary" />
            </div>
            <span className="flex-1 text-text font-medium text-base text-left">
              Data Export Preferences
            </span>
            <ChevronRight size={20} className="text-textMuted" />
          </button>
        </div>
      </div>
    </div>
  );

  // Desktop Layout (unchanged)
  const desktopLayout = (
    <div className="max-w-3xl mx-auto pb-20 animate-in fade-in duration-500">
      
      {/* Header with title matching design */}
      <div className="flex items-center mb-8 pt-4 pb-6 border-b border-outline">
        <h1 className="font-headline text-xl font-bold text-text">
          {userRole === UserRole.LECTURER ? 'Lecturer Settings' : 'Settings'}
        </h1>
      </div>
      
      {/* Account Settings - Available to All */}
      <section className="px-6">
        <h2 className="font-headline text-2xl font-bold text-text mb-4">Account</h2>
        {isLoading ? (
          <div className="text-center py-8 text-textMuted">Loading user data...</div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="Full Name" 
                defaultValue={user?.full_name || ''} 
                placeholder="Your full name"
              />
              <Input 
                label="Email" 
                defaultValue={user?.email || ''} 
                disabled 
              />
              {userRole === UserRole.STUDENT && (
                <>
                  <Input 
                    label="Matric Number" 
                    defaultValue={user?.matric_number || ''} 
                    placeholder="Your matric number"
                  />
                  <Input 
                    label="Department" 
                    defaultValue={user?.department || ''} 
                    placeholder="Your department"
                  />
                  <Input 
                    label="Level" 
                    defaultValue={user?.level || ''} 
                    placeholder="Current level"
                  />
                </>
              )}
              {userRole === UserRole.LECTURER && (
                <>
                  <Input 
                    label="Staff ID" 
                    defaultValue={user?.staff_id || ''} 
                    placeholder="Your staff ID"
                  />
                  <Input 
                    label="Department" 
                    defaultValue={user?.department || ''} 
                    placeholder="Your department"
                  />
                </>
              )}
              <Input 
                label="Institution" 
                defaultValue={user?.institution_name || ''} 
                placeholder="Your institution"
                disabled
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
            
            <div className="flex items-center justify-between p-4 bg-surface text-text border border-outline rounded-xl shadow-sm hover:border-outline transition-colors">
              <div className="flex items-center gap-3">
                <div className="bg-surfaceLow p-2 rounded-full">
                  <Lock size={18} className="text-textMuted" />
                </div>
                <div>
                  <p className="text-sm font-medium text-text">Password</p>
                  <p className="text-xs text-textMuted">Update your password</p>
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
            <div className="space-y-4 pt-4 border-t border-outline">
                <h3 className="font-headline text-sm font-medium text-text">Digital Signature</h3>
                {pendingSignature ? (
                     <div className="bg-surface text-text border border-outline rounded-xl p-4 shadow-sm">
                         <p className="text-sm font-medium text-text mb-3 text-center">Confirm new signature?</p>
                         <div className="h-32 bg-surface rounded-lg mb-4 flex items-center justify-center overflow-hidden border border-outline">
                             <img src={pendingSignature} alt="Signature Preview" className="max-h-full max-w-full object-contain" />
                         </div>
                         <div className="flex gap-2">
                             <Button onClick={confirmSignature} className="flex-1"><Check size={16} className="mr-2"/> Confirm</Button>
                             <Button onClick={cancelSignature} variant="secondary" className="flex-1"><X size={16} className="mr-2"/> Cancel</Button>
                         </div>
                     </div>
                ) : (
                    <label className="border border-dashed border-outline rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-surfaceLow transition-colors cursor-pointer group bg-surface">
                        <input type="file" accept="image/*" className="hidden" onChange={handleSignatureUpload} />
                        {signature ? (
                            <div className="mb-2 h-16 w-full flex justify-center">
                                <img src={signature} alt="Signature" className="h-full object-contain" />
                            </div>
                        ) : (
                            <Upload className="mb-2 text-textMuted group-hover:text-primary transition-colors" size={24} />
                        )}
                        <p className="text-sm font-medium text-text">{signature ? 'Change Digital Signature' : 'Upload Digital Signature'}</p>
                        <p className="text-xs text-textMuted">Used for signing attendance sheets.</p>
                    </label>
                )}
            </div>
          )}
        </div>
        )}
      </section>

      {/* Notification Settings - All Roles */}
      <section>
        <SectionHeader 
          icon={Bell} 
          title="Notifications" 
          description="Control how and when you want to be notified." 
        />
        <div className="space-y-4">
          <div className="space-y-2 bg-surface text-text/50 border border-outline rounded-xl p-2 shadow-sm">
              {[
                  { label: 'Email Notifications', desc: 'Receive attendance summaries via email.', state: emailNotifs, setter: setEmailNotifs },
                  { label: 'Class Reminders', desc: 'Notify me 15 minutes before class starts.', state: reminderBeforeClass, setter: setReminderBeforeClass },
              ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 hover:bg-surfaceLow transition-colors rounded-lg">
                      <div>
                          <p className="text-sm font-medium text-text">{item.label}</p>
                          <p className="text-xs text-textMuted">{item.desc}</p>
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
             <div className="flex items-center justify-between p-4 bg-surface text-text border border-outline rounded-xl shadow-sm">
                <div>
                    <p className="text-sm font-medium text-text">Maintenance Mode</p>
                    <p className="text-xs text-textMuted">Disable access for all non-admin users.</p>
                </div>
                <Switch checked={false} onCheckedChange={() => {}} />
            </div>
             <div className="flex items-center justify-between p-4 bg-surface text-text border border-outline rounded-xl shadow-sm">
                <div>
                    <p className="text-sm font-medium text-text">Backup Frequency</p>
                    <p className="text-xs text-textMuted">Daily at 02:00 AM</p>
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
             <div className="flex items-center justify-between p-4 bg-surface text-text border border-outline rounded-xl shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="bg-surfaceLow p-2 rounded-full text-text">
                        {darkMode ? <Moon size={18} /> : <Sun size={18} />}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-text">Dark Mode</p>
                        <p className="text-xs text-textMuted">Switch between dark and light themes.</p>
                    </div>
                </div>
                <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
            </div>

            <div className="flex items-center justify-between p-4 bg-surface text-text border border-outline rounded-xl shadow-sm">
                <div>
                    <p className="text-sm font-medium text-text">High Contrast</p>
                    <p className="text-xs text-textMuted">Increase contrast for better visibility.</p>
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
            <div className="flex items-center justify-between p-4 bg-surface text-text border border-outline rounded-xl shadow-sm">
                 <div>
                    <p className="text-sm font-medium text-text">Location Access</p>
                    <p className="text-xs text-textMuted">Allow GPS for attendance verification.</p>
                </div>
                <Switch checked={locationAccess} onCheckedChange={setLocationAccess} />
            </div>
            
            <div className="p-4 bg-surface text-text border border-outline rounded-xl space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                     <div>
                        <p className="text-sm font-medium text-text">Active Sessions</p>
                        <p className="text-xs text-textMuted">Manage devices logged into your account.</p>
                    </div>
                    <Button variant="outline" size="sm">View All</Button>
                </div>
                <div className="flex items-center gap-3 p-3 bg-surfaceLow rounded-lg">
                    <Laptop size={18} className="text-textMuted" />
                    <div className="flex-1">
                        <p className="text-sm text-text">Windows PC - Chrome</p>
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
                className="flex items-center gap-4 p-4 bg-surface text-text border border-outline rounded-xl hover:bg-surfaceLow hover:text-textMuted transition-colors text-left shadow-sm"
            >
                <div className="bg-red-500/10 p-3 rounded-full text-red-500">
                    <AlertTriangle size={20} />
                </div>
                <div>
                    <p className="font-medium text-text">Report an Issue</p>
                    <p className="text-xs text-textMuted">Found a bug? Let us know.</p>
                </div>
            </button>
            <button className="flex items-center gap-4 p-4 bg-surface text-text border border-outline rounded-xl hover:bg-surfaceLow hover:text-textMuted transition-colors text-left shadow-sm">
                <div className="bg-blue-500/10 p-3 rounded-full text-blue-500">
                    <FileText size={20} />
                </div>
                <div>
                    <p className="font-medium text-text">Documentation</p>
                    <p className="text-xs text-textMuted">Read guides and FAQs.</p>
                </div>
            </button>
        </div>
      </section>

      {/* Logout */}
      <div className="pt-8 border-t border-outline">
        <Button onClick={onLogout} variant="secondary" className="w-full gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
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
                className="bg-surface text-text border border-outline rounded-2xl w-full max-w-md p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200 outline-none"
            >
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 id="report-title" className="font-headline text-xl font-bold text-text">Report an Issue</h3>
                        <p className="text-sm text-textMuted">We appreciate your feedback!</p>
                    </div>
                    <button onClick={() => setIsReportModalOpen(false)} className="text-textMuted hover:text-text" aria-label="Close dialog">
                        <AlertTriangle size={20} className="hidden" /> {/* Dummy to keep imports happy if unused */}
                        <span className="text-2xl">&times;</span>
                    </button>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-textMuted mb-1.5">Subject</label>
                        <select className="w-full bg-surfaceLow border border-outline rounded-full px-4 p-2.5 text-text text-sm focus:ring-primary focus:border-primary outline-none">
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
      <ResponsiveContainer
        mobileChildren={mobileLayout}
      >
        {desktopLayout}
      </ResponsiveContainer>
    </>
  );
};

export default SettingsPage;
