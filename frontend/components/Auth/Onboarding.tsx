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
    </div>
  );

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        {/* ... onboarding steps UI ... */}
        </div>
    );
};