import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../Button';
import { Input } from '../Input';
import { Logo } from '../Logo';
import { UserRole } from '../../types';
import { PaymentGateway } from './PaymentGateway';
import { useCompleteOnboarding, useCurrentUser } from '../../hooks/useAuth';
import { 
  User, BookOpen, Bell, MapPin, Check, Users, Upload, 
  Moon, Sun, Camera, Smartphone, ChevronRight, ChevronLeft,
  GraduationCap, Briefcase, UserCheck, X, Plus
} from 'lucide-react';

// Mock courses for onboarding selection
const AVAILABLE_COURSES = [
  { id: 'CS402', name: 'Advanced Web Development', level: '400' },
  { id: 'CS301', name: 'Database Systems', level: '300' },
  { id: 'ENG101', name: 'Technical Writing', level: '100' },
  { id: 'MTH202', name: 'Linear Algebra', level: '200' },
  { id: 'PHY101', name: 'General Physics', level: '100' },
  { id: 'GNS101', name: 'Use of English', level: '100' },
  { id: 'CS410', name: 'Software Engineering', level: '400' },
  { id: 'MTH301', name: 'Numerical Analysis', level: '300' },
];

export const Onboarding: React.FC = () => {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(0);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [error, setError] = useState('');
  
  const [showPayment, setShowPayment] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);
  const [isPaymentEnabled, setIsPaymentEnabled] = useState(false);
  
  const { data: user } = useCurrentUser();
  const completeOnboardingMutation = useCompleteOnboarding();

  const [formData, setFormData] = useState({
    phoneNumber: '',
    matricNumber: '',
    department: '',
    level: '',
    staffId: '',
    courses: '',
    assignedLecturer: ''
  });

  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  
  const [permissions, setPermissions] = useState({
    notifications: false,
    location: false,
    darkMode: true
  });

  useEffect(() => {
    const storedSetting = localStorage.getItem('PAYMENT_GATEWAY_ENABLED');
    setIsPaymentEnabled(storedSetting === 'true');
  }, []);

  const totalSteps = selectedRole === UserRole.STUDENT ? 5 : 4;

  const handleNext = async () => {
    if (step === 1 && selectedRole && isPaymentEnabled && !hasPaid) {
        setShowPayment(true);
        return;
    }

    if (step < totalSteps) {
      setDirection(1);
      setStep(step + 1);
    } else {
      if (selectedRole) {
        const onboardingData = {
          role: selectedRole,
          phone_number: formData.phoneNumber || undefined,
          matric_number: formData.matricNumber || undefined,
          department: formData.department || undefined,
          level: formData.level || undefined,
          staff_id: formData.staffId || undefined,
          courses: selectedCourses.length > 0 ? selectedCourses.join(',') : undefined,
          assigned_lecturer: formData.assignedLecturer || undefined,
          avatar_url: profileImage || undefined,
          notifications_enabled: permissions.notifications,
          location_enabled: permissions.location,
          dark_mode: permissions.darkMode,
        };
        completeOnboardingMutation.mutate(onboardingData);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setDirection(-1);
      setStep(step - 1);
    }
  };

  const handlePaymentSuccess = () => {
      setHasPaid(true);
      setShowPayment(false);
      setDirection(1);
      setStep(step + 1);
  };

  const togglePermission = (key: 'notifications' | 'location' | 'darkMode') => {
    setPermissions(prev => ({ ...prev, [key]: !prev[key] }));
    if (key === 'darkMode') {
      document.documentElement.classList.toggle('dark', !permissions.darkMode);
    }
  };

  const toggleCourseSelection = (courseId: string) => {
    setSelectedCourses(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId) 
        : [...prev, courseId]
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPendingImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const confirmImage = () => {
    setProfileImage(pendingImage);
    setPendingImage(null);
  };

  const cancelImage = () => {
    setPendingImage(null);
  };

  const variants = {
    enter: (direction: number) => ({ x: direction > 0 ? 50 : -50, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction < 0 ? 50 : -50, opacity: 0 })
  };

  // --- Step Content Renderers ---
  const renderRoleSelection = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Choose your role</h2>
        <p className="text-zinc-500">How will you use Presently?</p>
      </div>
      
      <div className="grid gap-4">
        {[
          { id: UserRole.STUDENT, icon: GraduationCap, label: 'Student', desc: 'Track attendance & view analytics' },
          { id: UserRole.LECTURER, icon: Briefcase, label: 'Lecturer', desc: 'Manage courses & attendance sessions' },
          { id: UserRole.CLASS_REP, icon: UserCheck, label: 'Class Rep', desc: 'Assist with class management' },
        ].map((role) => (
          <button
            key={role.id}
            onClick={() => setSelectedRole(role.id)}
            className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all w-full text-left group
              ${selectedRole === role.id 
                ? 'border-primary bg-primary/5' 
                : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900'
              }`}
          >
            <div className={`p-3 rounded-xl transition-colors ${selectedRole === role.id ? 'bg-primary text-black' : 'bg-zinc-800 text-zinc-400 group-hover:text-white'}`}>
              <role.icon size={24} />
            </div>
            <div>
              <p className={`font-bold transition-colors ${selectedRole === role.id ? 'text-primary' : 'text-white'}`}>{role.label}</p>
              <p className="text-xs text-zinc-500">{role.desc}</p>
            </div>
            <div className={`ml-auto w-5 h-5 rounded-full border flex items-center justify-center transition-all ${selectedRole === role.id ? 'border-primary bg-primary' : 'border-zinc-600'}`}>
               {selectedRole === role.id && <Check size={14} className="text-black" />}
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderPersonalDetails = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Personal Details</h2>
        <p className="text-zinc-500">Let's set up your profile, {user?.full_name}.</p>
      </div>

      <div className="space-y-4">
        <Input
          label="Phone Number"
          name="phoneNumber"
          type="tel"
          value={formData.phoneNumber}
          onChange={handleInputChange}
          placeholder="+234 800 000 0000"
        />

        {selectedRole === UserRole.STUDENT && (
          <>
            <Input
              label="Matric Number"
              name="matricNumber"
              value={formData.matricNumber}
              onChange={handleInputChange}
              placeholder="e.g., 20/0001"
            />
            <Input
              label="Department"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              placeholder="e.g., Computer Science"
            />
            <Input
              label="Level"
              name="level"
              value={formData.level}
              onChange={handleInputChange}
              placeholder="e.g., 400"
            />
          </>
        )}

        {selectedRole === UserRole.LECTURER && (
          <>
            <Input
              label="Staff ID"
              name="staffId"
              value={formData.staffId}
              onChange={handleInputChange}
              placeholder="e.g., STAFF/2024/001"
            />
            <Input
              label="Department"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              placeholder="e.g., Computer Science"
            />
          </>
        )}

        {selectedRole === UserRole.CLASS_REP && (
          <>
            <Input
              label="Department"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              placeholder="e.g., Computer Science"
            />
            <Input
              label="Assigned Lecturer"
              name="assignedLecturer"
              value={formData.assignedLecturer}
              onChange={handleInputChange}
              placeholder="Lecturer's name"
            />
          </>
        )}
      </div>
    </div>
  );

  const renderProfilePhoto = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Profile Photo</h2>
        <p className="text-zinc-500">Add a photo to personalize your account</p>
      </div>

      <div className="flex flex-col items-center gap-6">
        {pendingImage ? (
          <div className="space-y-4 w-full max-w-xs">
            <div className="w-40 h-40 mx-auto rounded-full overflow-hidden border-4 border-zinc-800">
              <img src={pendingImage} alt="Preview" className="w-full h-full object-cover" />
            </div>
            <div className="flex gap-2">
              <Button onClick={confirmImage} className="flex-1">
                <Check size={16} className="mr-2" /> Confirm
              </Button>
              <Button onClick={cancelImage} variant="secondary" className="flex-1">
                <X size={16} className="mr-2" /> Cancel
              </Button>
            </div>
          </div>
        ) : (
          <label className="cursor-pointer group">
            <div className="w-40 h-40 rounded-full border-2 border-dashed border-zinc-700 hover:border-primary transition-colors flex flex-col items-center justify-center bg-zinc-900/50 hover:bg-zinc-900">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover rounded-full" />
              ) : (
                <>
                  <Camera size={32} className="text-zinc-500 group-hover:text-primary transition-colors mb-2" />
                  <p className="text-sm text-zinc-500 group-hover:text-primary transition-colors">Upload Photo</p>
                </>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </label>
        )}
        <p className="text-xs text-zinc-500 text-center">Optional - you can skip this step</p>
      </div>
    </div>
  );

  const renderCourseSelection = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Select Your Courses</h2>
        <p className="text-zinc-500">Choose the courses you're enrolled in</p>
      </div>

      <div className="grid gap-3 max-h-96 overflow-y-auto pr-2">
        {AVAILABLE_COURSES.map((course) => (
          <button
            key={course.id}
            onClick={() => toggleCourseSelection(course.id)}
            className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
              selectedCourses.includes(course.id)
                ? 'border-primary bg-primary/5'
                : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                selectedCourses.includes(course.id)
                  ? 'border-primary bg-primary'
                  : 'border-zinc-600'
              }`}
            >
              {selectedCourses.includes(course.id) && (
                <Check size={14} className="text-black" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium text-white">{course.id}</p>
              <p className="text-sm text-zinc-500">{course.name}</p>
            </div>
            <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-1 rounded">
              {course.level} Level
            </span>
          </button>
        ))}
      </div>

      {selectedCourses.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <Check size={16} className="text-primary" />
          <span>{selectedCourses.length} course{selectedCourses.length !== 1 ? 's' : ''} selected</span>
        </div>
      )}
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Notification Settings</h2>
        <p className="text-zinc-500">Customize how you receive updates</p>
      </div>

      <div className="space-y-4">
        <div
          onClick={() => togglePermission('notifications')}
          className="flex items-center gap-4 p-4 rounded-xl border-2 border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 transition-all cursor-pointer"
        >
          <div className={`p-3 rounded-xl ${permissions.notifications ? 'bg-primary text-black' : 'bg-zinc-800 text-zinc-400'}`}>
            <Bell size={24} />
          </div>
          <div className="flex-1">
            <p className="font-medium text-white">Push Notifications</p>
            <p className="text-sm text-zinc-500">Get notified about attendance and updates</p>
          </div>
          <div
            className={`w-12 h-6 rounded-full transition-colors ${
              permissions.notifications ? 'bg-primary' : 'bg-zinc-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 mt-0.5 ${
                permissions.notifications ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </div>
        </div>

        <div
          onClick={() => togglePermission('location')}
          className="flex items-center gap-4 p-4 rounded-xl border-2 border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 transition-all cursor-pointer"
        >
          <div className={`p-3 rounded-xl ${permissions.location ? 'bg-primary text-black' : 'bg-zinc-800 text-zinc-400'}`}>
            <MapPin size={24} />
          </div>
          <div className="flex-1">
            <p className="font-medium text-white">Location Access</p>
            <p className="text-sm text-zinc-500">Enable location-based attendance</p>
          </div>
          <div
            className={`w-12 h-6 rounded-full transition-colors ${
              permissions.location ? 'bg-primary' : 'bg-zinc-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 mt-0.5 ${
                permissions.location ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </div>
        </div>

        <div
          onClick={() => togglePermission('darkMode')}
          className="flex items-center gap-4 p-4 rounded-xl border-2 border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 transition-all cursor-pointer"
        >
          <div className={`p-3 rounded-xl ${permissions.darkMode ? 'bg-primary text-black' : 'bg-zinc-800 text-zinc-400'}`}>
            {permissions.darkMode ? <Moon size={24} /> : <Sun size={24} />}
          </div>
          <div className="flex-1">
            <p className="font-medium text-white">Dark Mode</p>
            <p className="text-sm text-zinc-500">Use dark theme throughout the app</p>
          </div>
          <div
            className={`w-12 h-6 rounded-full transition-colors ${
              permissions.darkMode ? 'bg-primary' : 'bg-zinc-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 mt-0.5 ${
                permissions.darkMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (step) {
      case 1:
        return renderRoleSelection();
      case 2:
        return renderPersonalDetails();
      case 3:
        if (selectedRole === UserRole.STUDENT) {
          return renderCourseSelection();
        }
        return renderProfilePhoto();
      case 4:
        if (selectedRole === UserRole.STUDENT) {
          return renderProfilePhoto();
        }
        return renderNotificationSettings();
      case 5:
        return renderNotificationSettings();
      default:
        return renderRoleSelection();
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      {showPayment ? (
        <PaymentGateway
          amount={5000}
          onSuccess={handlePaymentSuccess}
          onCancel={() => setShowPayment(false)}
        />
      ) : (
        <>
          <div className="w-full max-w-md mb-8">
            <Logo />
          </div>

          {/* Progress indicator */}
          <div className="w-full max-w-md mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-zinc-500">
                Step {step} of {totalSteps}
              </span>
              <span className="text-sm text-zinc-500">
                {Math.round((step / totalSteps) * 100)}%
              </span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Main content card */}
          <div className="w-full max-w-md bg-zinc-900 rounded-2xl p-8 border border-zinc-800 shadow-2xl">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                {renderCurrentStep()}
              </motion.div>
            </AnimatePresence>

            {error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-sm text-red-500">{error}</p>
              </div>
            )}
          </div>

          {/* Navigation buttons */}
          <div className="w-full max-w-md mt-6 flex gap-4">
            {step > 1 && (
              <Button
                onClick={handleBack}
                variant="secondary"
                className="flex-1"
              >
                <ChevronLeft size={18} className="mr-2" />
                Back
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={!selectedRole && step === 1}
              className="flex-1"
            >
              {step === totalSteps ? (
                completeOnboardingMutation.isPending ? (
                  'Completing...'
                ) : (
                  'Complete'
                )
              ) : (
                <>
                  Next
                  <ChevronRight size={18} className="ml-2" />
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};