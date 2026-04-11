import React, { useReducer, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '../Button';
import { Input } from '../Input';
import { Logo } from '../Logo';
import { UserRole, Course, Institution, College, Department } from '../../types';
import { useCompleteOnboarding, useCurrentUser } from '../../hooks/useAuth';
import { coursesApi } from '../../services/api';
import { authApi } from '../../services/api/auth';
import { institutionsApi } from '../../services/api/institutions';
import {
  User, Bell, MapPin, Check, Upload,
  Moon, Sun, Camera, Smartphone, ChevronRight, ChevronLeft,
  GraduationCap, Briefcase, UserCheck, X, Plus, Loader, RefreshCw, AlertCircle, Sparkles
} from 'lucide-react';
import { AuthBackground } from './AuthBackground';
import { ThemeToggle } from '../ThemeToggle';

const CACHE_KEYS = {
  institutions: 'presently_institutions',
  colleges: 'presently_colleges',
  departments: 'presently_departments',
  onboarding: 'presently_onboarding_progress'
};

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

interface CachedData<T> {
  data: T;
  timestamp: number;
}

interface OnboardingState {
  step: number;
  direction: number;
  selectedRole: UserRole | null;
  profileImage: string | null;
  pendingImage: string | null;
  error: string;
  photoError: string;

  courses: Course[];
  coursesLoading: boolean;
  coursesError: string;

  institutions: Institution[];
  institutionsLoading: boolean;
  institutionsError: string;
  colleges: College[];
  collegesLoading: boolean;
  departments: Department[];
  departmentsLoading: boolean;

  selectedInstitution: number | null;
  selectedCollege: number | null;
  selectedDepartment: number | null;

  formData: {
    phoneNumber: string;
    matricNumber: string;
    department: string;
    level: string;
    staffId: string;
    courses: string;
    assignedLecturer: string;
  };

  selectedCourses: number[];

  permissions: {
    notifications: boolean;
    location: boolean;
    darkMode: boolean;
  };

  validationErrors: Record<string, string>;
}

type OnboardingAction =
  | { type: 'SET_STEP'; payload: number; direction: number }
  | { type: 'SET_ROLE'; payload: UserRole }
  | { type: 'SET_PROFILE_IMAGE'; payload: string | null }
  | { type: 'SET_PENDING_IMAGE'; payload: string | null }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'SET_PHOTO_ERROR'; payload: string }
  | { type: 'SET_COURSES'; payload: Course[] }
  | { type: 'SET_COURSES_LOADING'; payload: boolean }
  | { type: 'SET_COURSES_ERROR'; payload: string }
  | { type: 'SET_INSTITUTIONS'; payload: Institution[] }
  | { type: 'SET_INSTITUTIONS_LOADING'; payload: boolean }
  | { type: 'SET_INSTITUTIONS_ERROR'; payload: string }
  | { type: 'SET_COLLEGES'; payload: College[] }
  | { type: 'SET_COLLEGES_LOADING'; payload: boolean }
  | { type: 'SET_DEPARTMENTS'; payload: Department[] }
  | { type: 'SET_DEPARTMENTS_LOADING'; payload: boolean }
  | { type: 'SET_SELECTED_INSTITUTION'; payload: number | null }
  | { type: 'SET_SELECTED_COLLEGE'; payload: number | null }
  | { type: 'SET_SELECTED_DEPARTMENT'; payload: number | null }
  | { type: 'UPDATE_FORM_DATA'; payload: Partial<OnboardingState['formData']> }
  | { type: 'TOGGLE_COURSE'; payload: number }
  | { type: 'TOGGLE_PERMISSION'; payload: keyof OnboardingState['permissions'] }
  | { type: 'SET_VALIDATION_ERROR'; payload: { field: string; error: string } }
  | { type: 'CLEAR_VALIDATION_ERRORS' }
  | { type: 'RESTORE_STATE'; payload: Partial<OnboardingState> };

const initialState: OnboardingState = {
  step: 1,
  direction: 0,
  selectedRole: null,
  profileImage: null,
  pendingImage: null,
  error: '',
  photoError: '',

  courses: [],
  coursesLoading: false,
  coursesError: '',

  institutions: [],
  institutionsLoading: false,
  institutionsError: '',
  colleges: [],
  collegesLoading: false,
  departments: [],
  departmentsLoading: false,

  selectedInstitution: null,
  selectedCollege: null,
  selectedDepartment: null,

  formData: {
    phoneNumber: '',
    matricNumber: '',
    department: '',
    level: '',
    staffId: '',
    courses: '',
    assignedLecturer: ''
  },

  selectedCourses: [],

  permissions: {
    notifications: false,
    location: false,
    darkMode: false
  },

  validationErrors: {}
};

function onboardingReducer(state: OnboardingState, action: OnboardingAction): OnboardingState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.payload, direction: action.direction };
    case 'SET_ROLE':
      return { ...state, selectedRole: action.payload };
    case 'SET_PROFILE_IMAGE':
      return { ...state, profileImage: action.payload, pendingImage: null };
    case 'SET_PENDING_IMAGE':
      return { ...state, pendingImage: action.payload, photoError: '' };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_PHOTO_ERROR':
      return { ...state, photoError: action.payload };
    case 'SET_COURSES':
      return { ...state, courses: action.payload, coursesError: '' };
    case 'SET_COURSES_LOADING':
      return { ...state, coursesLoading: action.payload };
    case 'SET_COURSES_ERROR':
      return { ...state, coursesError: action.payload };
    case 'SET_INSTITUTIONS':
      return { ...state, institutions: action.payload, institutionsError: '' };
    case 'SET_INSTITUTIONS_LOADING':
      return { ...state, institutionsLoading: action.payload };
    case 'SET_INSTITUTIONS_ERROR':
      return { ...state, institutionsError: action.payload };
    case 'SET_COLLEGES':
      return { ...state, colleges: action.payload };
    case 'SET_COLLEGES_LOADING':
      return { ...state, collegesLoading: action.payload };
    case 'SET_DEPARTMENTS':
      return { ...state, departments: action.payload };
    case 'SET_DEPARTMENTS_LOADING':
      return { ...state, departmentsLoading: action.payload };
    case 'SET_SELECTED_INSTITUTION':
      return {
        ...state,
        selectedInstitution: action.payload,
        selectedCollege: null,
        selectedDepartment: null,
        colleges: [],
        departments: []
      };
    case 'SET_SELECTED_COLLEGE':
      return {
        ...state,
        selectedCollege: action.payload,
        selectedDepartment: null,
        departments: []
      };
    case 'SET_SELECTED_DEPARTMENT':
      return { ...state, selectedDepartment: action.payload };
    case 'UPDATE_FORM_DATA':
      return { ...state, formData: { ...state.formData, ...action.payload } };
    case 'TOGGLE_COURSE':
      return {
        ...state,
        selectedCourses: state.selectedCourses.includes(action.payload)
          ? state.selectedCourses.filter(id => id !== action.payload)
          : [...state.selectedCourses, action.payload]
      };
    case 'TOGGLE_PERMISSION':
      return {
        ...state,
        permissions: { ...state.permissions, [action.payload]: !state.permissions[action.payload] }
      };
    case 'SET_VALIDATION_ERROR':
      return {
        ...state,
        validationErrors: { ...state.validationErrors, [action.payload.field]: action.payload.error }
      };
    case 'CLEAR_VALIDATION_ERRORS':
      return { ...state, validationErrors: {} };
    case 'RESTORE_STATE':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

export const Onboarding: React.FC = () => {
  const [state, dispatch] = useReducer(onboardingReducer, initialState);
  const { data: user } = useCurrentUser();
  const completeOnboardingMutation = useCompleteOnboarding();
  const navigate = useNavigate();

  // Redirect users who have already completed onboarding
  useEffect(() => {
    if (user?.onboarding_complete) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // Cache utilities
  const getFromCache = <T,>(key: string): T | null => {
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;

      const { data, timestamp }: CachedData<T> = JSON.parse(cached);
      if (Date.now() - timestamp > CACHE_DURATION) {
        localStorage.removeItem(key);
        return null;
      }
      return data;
    } catch {
      return null;
    }
  };

  const saveToCache = <T,>(key: string, data: T) => {
    try {
      const cached: CachedData<T> = { data, timestamp: Date.now() };
      localStorage.setItem(key, JSON.stringify(cached));
    } catch (err) {
      console.warn('Failed to cache data:', err);
    }
  };

  const saveOnboardingProgress = useCallback(() => {
    try {
      localStorage.setItem(CACHE_KEYS.onboarding, JSON.stringify({
        step: state.step,
        selectedRole: state.selectedRole,
        profileImage: state.profileImage,
        formData: state.formData,
        selectedInstitution: state.selectedInstitution,
        selectedCollege: state.selectedCollege,
        selectedDepartment: state.selectedDepartment,
        selectedCourses: state.selectedCourses,
        permissions: state.permissions
      }));
    } catch (err) {
      console.warn('Failed to save onboarding progress:', err);
    }
  }, [state]);

  // Restore onboarding progress on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CACHE_KEYS.onboarding);
      if (saved) {
        const parsed = JSON.parse(saved);
        dispatch({ type: 'RESTORE_STATE', payload: parsed });
      }
    } catch (err) {
      console.warn('Failed to restore onboarding progress:', err);
    }
  }, []);

  // Auto-save progress whenever state changes
  useEffect(() => {
    saveOnboardingProgress();
  }, [saveOnboardingProgress]);

  // Fetch institutions on mount
  useEffect(() => {
    fetchInstitutions();
  }, []);

  // Fetch colleges when institution is selected
  useEffect(() => {
    if (state.selectedInstitution) {
      fetchColleges(state.selectedInstitution);
    }
  }, [state.selectedInstitution]);

  // Fetch departments when college is selected
  useEffect(() => {
    if (state.selectedCollege) {
      fetchDepartments(state.selectedCollege);
    }
  }, [state.selectedCollege]);

  // Fetch courses when user selects student role and reaches course selection step
  useEffect(() => {
    if (state.selectedRole === UserRole.STUDENT && state.step === 4) {
      fetchCourses();
    }
  }, [state.selectedRole, state.step]);

  const fetchInstitutions = async () => {
    const cached = getFromCache<Institution[]>(CACHE_KEYS.institutions);
    if (cached && cached.length > 0) {
      dispatch({ type: 'SET_INSTITUTIONS', payload: cached });
    }

    try {
      dispatch({ type: 'SET_INSTITUTIONS_LOADING', payload: true });
      dispatch({ type: 'SET_INSTITUTIONS_ERROR', payload: '' });
      const data = await institutionsApi.getAllInstitutions();
      const institutionList = Array.isArray(data) ? data : (data.results || data.data || []);
      const activeInstitutions = Array.isArray(institutionList) ? institutionList.filter(inst => inst.is_active !== false) : [];
      dispatch({ type: 'SET_INSTITUTIONS', payload: activeInstitutions });
      saveToCache(CACHE_KEYS.institutions, activeInstitutions);
    } catch (err) {
      console.error('Error fetching institutions:', err);
      if (!cached || cached.length === 0) {
        dispatch({ type: 'SET_INSTITUTIONS', payload: [] });
        dispatch({ type: 'SET_INSTITUTIONS_ERROR', payload: 'Failed to load institutions. Please retry.' });
      }
    } finally {
      dispatch({ type: 'SET_INSTITUTIONS_LOADING', payload: false });
    }
  };


  const fetchColleges = async (institutionId: number) => {
    const cacheKey = `${CACHE_KEYS.colleges}_${institutionId}`;
    const cached = getFromCache<College[]>(cacheKey);
    if (cached) {
      dispatch({ type: 'SET_COLLEGES', payload: cached });
      return;
    }

    try {
      dispatch({ type: 'SET_COLLEGES_LOADING', payload: true });
      const data = await institutionsApi.getCollegesByInstitution(institutionId);
      const collegeList = Array.isArray(data) ? data : (data.results || data.data || []);
      const activeColleges = Array.isArray(collegeList) ? collegeList.filter(col => col.is_active) : [];
      dispatch({ type: 'SET_COLLEGES', payload: activeColleges });
      saveToCache(cacheKey, activeColleges);
    } catch (err) {
      console.error('Error fetching colleges:', err);
      dispatch({ type: 'SET_COLLEGES', payload: [] });
    } finally {
      dispatch({ type: 'SET_COLLEGES_LOADING', payload: false });
    }
  };

  const fetchDepartments = async (collegeId: number) => {
    const cacheKey = `${CACHE_KEYS.departments}_${collegeId}`;
    const cached = getFromCache<Department[]>(cacheKey);
    if (cached) {
      dispatch({ type: 'SET_DEPARTMENTS', payload: cached });
      return;
    }

    try {
      dispatch({ type: 'SET_DEPARTMENTS_LOADING', payload: true });
      const data = await institutionsApi.getDepartmentsByCollege(collegeId);
      const departmentList = Array.isArray(data) ? data : (data.results || data.data || []);
      const activeDepartments = Array.isArray(departmentList) ? departmentList.filter(dept => dept.is_active) : [];
      dispatch({ type: 'SET_DEPARTMENTS', payload: activeDepartments });
      saveToCache(cacheKey, activeDepartments);
    } catch (err) {
      console.error('Error fetching departments:', err);
      dispatch({ type: 'SET_DEPARTMENTS', payload: [] });
    } finally {
      dispatch({ type: 'SET_DEPARTMENTS_LOADING', payload: false });
    }
  };

  const fetchCourses = async () => {
    try {
      dispatch({ type: 'SET_COURSES_LOADING', payload: true });
      dispatch({ type: 'SET_COURSES_ERROR', payload: '' });
      const data = await coursesApi.getAllCourses();
      const courseList = Array.isArray(data) ? data : (data.results || data.data || []);
      const activeCourses = Array.isArray(courseList) ? courseList.filter(course => course.is_active) : [];
      dispatch({ type: 'SET_COURSES', payload: activeCourses });
    } catch (err: any) {
      dispatch({ type: 'SET_COURSES_ERROR', payload: err.message || 'Failed to load courses' });
      console.error('Error fetching courses:', err);
      dispatch({ type: 'SET_COURSES', payload: [] });
    } finally {
      dispatch({ type: 'SET_COURSES_LOADING', payload: false });
    }
  };

  // Calculate total steps based on role
  const totalSteps = state.selectedRole === UserRole.STUDENT ? 5 : 4;

  // Validation function
  const validateStep = (): boolean => {
    dispatch({ type: 'CLEAR_VALIDATION_ERRORS' });

    if (state.step === 1 && !state.selectedRole) {
      dispatch({ type: 'SET_ERROR', payload: 'Please select a role to continue' });
      return false;
    }

    if (state.step === 2) {
      if (state.formData.phoneNumber && state.formData.phoneNumber.trim()) {
        // More restrictive phone validation: must start with + and have at least 10 digits
        const phoneRegex = /^\+?\d{10,15}$/;
        const cleanedPhone = state.formData.phoneNumber.replace(/[\s\-\(\)]/g, '');
        if (!phoneRegex.test(cleanedPhone)) {
          dispatch({ type: 'SET_VALIDATION_ERROR', payload: { field: 'phoneNumber', error: 'Invalid phone number. Must be 10-15 digits, optionally starting with +' } });
          return false;
        }
      }
    }

    if (state.step === 3) {
      if (!state.selectedInstitution) {
        dispatch({ type: 'SET_VALIDATION_ERROR', payload: { field: 'institution', error: 'Please select an institution' } });
        return false;
      }
      if (!state.selectedCollege) {
        dispatch({ type: 'SET_VALIDATION_ERROR', payload: { field: 'college', error: 'Please select a college/faculty' } });
        return false;
      }
      if (!state.selectedDepartment) {
        dispatch({ type: 'SET_VALIDATION_ERROR', payload: { field: 'department', error: 'Please select a department' } });
        return false;
      }

      if (state.selectedRole === UserRole.STUDENT || state.selectedRole === UserRole.CLASS_REP) {
        if (!state.formData.matricNumber.trim()) {
          dispatch({ type: 'SET_VALIDATION_ERROR', payload: { field: 'matricNumber', error: 'Matriculation number is required' } });
          return false;
        }
        if (!state.formData.level.trim()) {
          dispatch({ type: 'SET_VALIDATION_ERROR', payload: { field: 'level', error: 'Level is required' } });
          return false;
        }
      }

      if (state.selectedRole === UserRole.LECTURER) {
        if (!state.formData.staffId.trim()) {
          dispatch({ type: 'SET_VALIDATION_ERROR', payload: { field: 'staffId', error: 'Staff ID is required' } });
          return false;
        }
      }
    }

    return true;
  };

  const handleNext = async () => {
    if (!validateStep()) {
      return;
    }

    if (state.step < totalSteps) {
      dispatch({ type: 'SET_STEP', payload: state.step + 1, direction: 1 });
    } else {
      // Complete onboarding
      if (state.selectedRole) {
        dispatch({ type: 'SET_ERROR', payload: '' });

        // If the profile image is a base64 data-URI, upload it to Cloudinary first
        let avatarUrl: string | undefined;
        if (state.profileImage) {
          if (state.profileImage.startsWith('data:')) {
            try {
              avatarUrl = await authApi.uploadAvatar(state.profileImage);
            } catch (err: any) {
              dispatch({ type: 'SET_ERROR', payload: err.message || 'Failed to upload profile photo. Please try again.' });
              return;
            }
          } else {
            // Already a remote URL (e.g. Google avatar)
            avatarUrl = state.profileImage;
          }
        }

        // Prepare onboarding data
        const onboardingData = {
          role: state.selectedRole,
          first_name: user?.full_name || user?.name || undefined,
          phone_number: state.formData.phoneNumber || undefined,
          matric_number: state.formData.matricNumber || undefined,
          department: state.selectedDepartment?.toString() || state.formData.department || undefined,
          level: state.formData.level || undefined,
          staff_id: state.formData.staffId || undefined,
          courses: state.selectedCourses.length > 0 ? state.selectedCourses.join(',') : undefined,
          assigned_lecturer: state.formData.assignedLecturer || undefined,
          institution: state.selectedInstitution || undefined,
          college: state.selectedCollege || undefined,
          avatar_url: avatarUrl,
          notifications_enabled: state.permissions.notifications,
          location_enabled: state.permissions.location,
          dark_mode: state.permissions.darkMode,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        };

        completeOnboardingMutation.mutate(onboardingData);

        // Clear saved progress after successful completion
        localStorage.removeItem(CACHE_KEYS.onboarding);
      }
    }
  };

  const handleBack = () => {
    if (state.step > 1) {
      dispatch({ type: 'SET_STEP', payload: state.step - 1, direction: -1 });
    }
  };

  const togglePermission = (key: 'notifications' | 'location' | 'darkMode') => {
    dispatch({ type: 'TOGGLE_PERMISSION', payload: key });
    if (key === 'darkMode') {
      document.documentElement.classList.toggle('dark', !state.permissions.darkMode);
    }
  };

  const toggleCourseSelection = (courseId: number) => {
    dispatch({ type: 'TOGGLE_COURSE', payload: courseId });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'UPDATE_FORM_DATA', payload: { [e.target.name]: e.target.value } });
    // Clear validation error for this field
    if (state.validationErrors[e.target.name]) {
      const newErrors = { ...state.validationErrors };
      delete newErrors[e.target.name];
      dispatch({ type: 'SET_VALIDATION_ERROR', payload: { field: e.target.name, error: '' } });
    }
  };

  const handleImageUpload = async (e?: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_PHOTO_ERROR', payload: '' });

    if (e && e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        dispatch({ type: 'SET_PHOTO_ERROR', payload: 'Image size must be less than 5MB' });
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        dispatch({ type: 'SET_PHOTO_ERROR', payload: 'Please select a valid image file' });
        return;
      }

      const reader = new FileReader();
      reader.onerror = () => {
        dispatch({ type: 'SET_PHOTO_ERROR', payload: 'Failed to read image file' });
      };
      reader.onload = (event) => {
        if (event.target?.result) {
          dispatch({ type: 'SET_PENDING_IMAGE', payload: event.target.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraClick = async () => {
    try {
      dispatch({ type: 'SET_PHOTO_ERROR', payload: '' });
      const { CameraService } = await import('../../services/camera');
      const photoData = await CameraService.capturePhoto({
        quality: 80,
        allowEditing: true,
        width: 512,
        height: 512,
      });

      if (photoData) {
        dispatch({ type: 'SET_PENDING_IMAGE', payload: photoData });
      }
    } catch (error: any) {
      console.error('Camera error:', error);
      dispatch({ type: 'SET_PHOTO_ERROR', payload: error.message || 'Failed to capture photo. Try uploading from gallery.' });

      // Fallback to file input if camera fails
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.onchange = (e) => handleImageUpload(e as React.ChangeEvent<HTMLInputElement>);
      fileInput.click();
    }
  };

  const confirmImage = () => {
    dispatch({ type: 'SET_PROFILE_IMAGE', payload: state.pendingImage });
  };

  const cancelImage = () => {
    dispatch({ type: 'SET_PENDING_IMAGE', payload: null });
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 50 : -50,
      opacity: 0
    })
  };

  // --- Step Content Renderers ---

  const renderRoleSelection = () => {
    const roles = [
      {
        id: UserRole.STUDENT,
        icon: GraduationCap,
        label: 'Student',
        desc: 'I want to track my attendance, grades and academic progress.',
        features: ['View schedule', 'Submit assignments', 'Track grades']
      },
      {
        id: UserRole.LECTURER,
        icon: Briefcase,
        label: 'Lecturer',
        desc: 'I want to manage classes, record attendance, and export reports.',
        features: ['Create sessions', 'Generate reports', 'Manage courses']
      },
    ];

    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="font-headline text-2xl font-bold text-text mb-2">How will you use Presently?</h2>
          <p className="text-textMuted">Select your role to get started</p>
          <p className="text-xs text-textMuted mt-2">Step 1 of {totalSteps}</p>
        </div>

        <div className="grid gap-4">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => dispatch({ type: 'SET_ROLE', payload: role.id })}
              className={`flex flex-col p-5 rounded-xl border transition-all w-full text-left group hover:shadow-md
                ${state.selectedRole === role.id
                  ? 'border-primary bg-primary/10 shadow-md'
                  : 'border-outline/40 bg-surfaceLow hover:border-primary/30'
                }`}
            >
              <div className="flex items-start gap-4 mb-3">
                <div className={`p-3 rounded-xl transition-colors ${state.selectedRole === role.id ? 'bg-primary text-on-primary-fixed' : 'bg-surfaceVariant text-textMuted group-hover:bg-primary/20 group-hover:text-primary'}`}>
                  <role.icon size={28} />
                </div>
                <div className="flex-1">
                  <p className={`text-lg font-bold transition-colors mb-1 ${state.selectedRole === role.id ? 'text-primary' : 'text-text'}`}>
                    {role.label}
                  </p>
                  <p className="text-sm text-textMuted leading-relaxed">{role.desc}</p>
                </div>
                <div className={`w-6 h-6 rounded-full border-border flex items-center justify-center transition-all flex-shrink-0 ${state.selectedRole === role.id ? 'border-primary bg-primary' : 'border-outline'}`}>
                  {state.selectedRole === role.id && <Check size={16} className="text-text" />}
                </div>
              </div>

              {/* Features List */}
              <div className="flex flex-wrap gap-2 ml-16">
                {role.features.map((feature, idx) => (
                  <span
                    key={idx}
                    className={`text-xs px-2 py-1 rounded-full ${state.selectedRole === role.id ? 'bg-primary/20 text-primary' : 'bg-surfaceVariant/50 text-textMuted'}`}
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderPersonalDetails = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="font-headline text-2xl font-bold text-text mb-2">
          Welcome, {user?.full_name || user?.name || 'there'}!
        </h2>
        <p className="text-textMuted">Let's set up your profile.</p>
      </div>

      <div className="flex flex-col items-center mb-8 gap-4">
        <div className="relative group cursor-pointer">
          <div
            className="w-28 h-28 rounded-full bg-surfaceLow overflow-hidden border-2 border-outline ring-2 ring-outline group-hover:ring-primary transition-all"
            aria-hidden="true"
          >
            {state.pendingImage ? (
              <img src={state.pendingImage} alt="Preview" className="w-full h-full object-cover opacity-80" />
            ) : state.profileImage ? (
              <img src={state.profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-textMuted">
                <User size={40} />
              </div>
            )}
          </div>

          {!state.pendingImage && (
            <button
              type="button"
              onClick={handleCameraClick}
              aria-label="Upload profile photo"
              className="absolute bottom-0 right-0 bg-primary text-text p-2 rounded-full cursor-pointer hover:bg-primary-hover shadow-lg transition-transform hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <Camera size={16} />
            </button>
          )}
        </div>

        {state.pendingImage && (
          <div className="flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <Button size="sm" variant="secondary" onClick={cancelImage} className="h-8">
              <X size={14} className="mr-1" /> Cancel
            </Button>
            <Button size="sm" onClick={confirmImage} className="h-8">
              <Check size={14} className="mr-1" /> Confirm Photo
            </Button>
          </div>
        )}

        {state.photoError && (
          <div className="flex items-center gap-2 text-error text-sm bg-error/10 px-3 py-2 rounded-full animate-in fade-in">
            <AlertCircle size={16} />
            <span>{state.photoError}</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <Input
            name="phoneNumber"
            label="Phone Number"
            placeholder="+234 800 000 0000"
            icon={<Smartphone size={16} />}
            value={state.formData.phoneNumber}
            onChange={handleInputChange}
          />
          {state.validationErrors.phoneNumber && (
            <p className="text-error text-xs mt-1 ml-4 font-medium">{state.validationErrors.phoneNumber}</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderAcademicDetails = () => (
    <div className="space-y-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-headline text-xl font-bold text-primary">
            Institutional Details
          </h2>
          <span className="text-base font-semibold text-primary">
            3 of 3
          </span>
        </div>

        <h3 className="font-headline text-3xl md:text-4xl font-black text-primary mb-3">
          Link your Institution
        </h3>
        <p className="text-sm text-textMuted">
          Almost there! Select your specific academic location to finalize your profile.
        </p>
      </div>

      <div className="space-y-4">
        {/* Institution Selection */}
        <div>
          <label
            htmlFor="institution-select"
            className="block text-base font-semibold text-primary mb-2"
          >
            Select University
          </label>
          {state.institutionsLoading ? (
            <div className="w-full h-14 bg-surfaceLow rounded-2xl animate-pulse" aria-hidden="true" />
          ) : (
            <div className="relative">
              <select
                id="institution-select"
                value={state.selectedInstitution || ''}
                onChange={(e) => {
                  const value = e.target.value ? Number(e.target.value) : null;
                  dispatch({ type: 'SET_SELECTED_INSTITUTION', payload: value });
                }}
                aria-required="true"
                aria-label="Select your university or institution"
                className="w-full bg-surface border border-outline/20 text-text rounded-2xl p-4 pl-4 pr-12 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all appearance-none cursor-pointer hover:border-primary/50"
              >
                <option value="" className="bg-surface">Select your institution</option>
                {state.institutions.map(inst => (
                  <option key={inst.id} value={inst.id} className="bg-surface">
                    {inst.short_name} - {inst.full_name}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-0.5 pointer-events-none">
                <ChevronRight size={14} className="text-textMuted -rotate-90" strokeWidth={2.5} />
                <ChevronRight size={14} className="text-textMuted rotate-90" strokeWidth={2.5} />
              </div>
            </div>
          )}
          {!state.institutionsLoading && state.institutionsError && (
            <div className="mt-2 flex items-center gap-2">
              <p className="text-error text-xs font-medium">{state.institutionsError}</p>
              <button
                type="button"
                onClick={fetchInstitutions}
                className="text-xs text-primary font-bold hover:underline"
              >
                Retry
              </button>
            </div>
          )}
          {!state.institutionsLoading && !state.institutionsError && state.institutions.length === 0 && (
            <div className="mt-2 flex items-center gap-2">
              <p className="text-textMuted text-xs font-medium">No institutions available yet.</p>
              <button
                type="button"
                onClick={fetchInstitutions}
                className="text-xs text-primary font-bold hover:underline"
              >
                Refresh
              </button>
            </div>
          )}
          {state.validationErrors.institution && (
            <p className="text-error text-xs mt-1 ml-4 font-medium">{state.validationErrors.institution}</p>
          )}
        </div>

        {/* College Selection */}
        {state.selectedInstitution && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <label
              htmlFor="college-select"
              className="block text-base font-semibold text-primary mb-2"
            >
              Select Faculty
            </label>
            {state.collegesLoading ? (
              <div className="w-full h-14 bg-surfaceLow rounded-2xl animate-pulse" aria-hidden="true" />
            ) : (
              <div className="relative">
                <select
                  id="college-select"
                  value={state.selectedCollege || ''}
                  onChange={(e) => {
                    const value = e.target.value ? Number(e.target.value) : null;
                    dispatch({ type: 'SET_SELECTED_COLLEGE', payload: value });
                  }}
                  disabled={state.colleges.length === 0}
                  aria-required="true"
                  aria-label="Select your faculty or college"
                  aria-disabled={state.colleges.length === 0}
                  className="w-full bg-surface border border-outline/20 text-text rounded-2xl p-4 pl-4 pr-12 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all appearance-none cursor-pointer hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="" className="bg-surface">Select college/faculty</option>
                  {state.colleges.map(col => (
                    <option key={col.id} value={col.id} className="bg-surface">
                      {col.code} - {col.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-0.5 pointer-events-none">
                  <ChevronRight size={14} className="text-textMuted -rotate-90" strokeWidth={2.5} />
                  <ChevronRight size={14} className="text-textMuted rotate-90" strokeWidth={2.5} />
                </div>
              </div>
            )}
            {state.validationErrors.college && (
              <p className="text-error text-xs mt-1 ml-4 font-medium">{state.validationErrors.college}</p>
            )}
          </div>
        )}

        {/* Department Selection */}
        {state.selectedCollege && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <label
              htmlFor="department-select"
              className="block text-base font-semibold text-primary mb-2"
            >
              Select Department
            </label>
            {state.departmentsLoading ? (
              <div className="w-full h-14 bg-surfaceLow rounded-2xl animate-pulse" aria-hidden="true" />
            ) : (
              <div className="relative">
                <select
                  id="department-select"
                  value={state.selectedDepartment || ''}
                  onChange={(e) => {
                    const value = e.target.value ? Number(e.target.value) : null;
                    dispatch({ type: 'SET_SELECTED_DEPARTMENT', payload: value });
                  }}
                  disabled={state.departments.length === 0}
                  aria-required="true"
                  aria-label="Select your department"
                  aria-disabled={state.departments.length === 0}
                  className="w-full bg-surface border border-outline/20 text-text rounded-2xl p-4 pl-4 pr-12 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all appearance-none cursor-pointer hover:border-primary/50"
                >
                  <option value="" className="bg-surface">Select department</option>
                  {state.departments.map(dept => (
                    <option key={dept.id} value={dept.id} className="bg-surface">
                      {dept.code} - {dept.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-0.5 pointer-events-none">
                  <ChevronRight size={14} className="text-textMuted -rotate-90" strokeWidth={2.5} />
                  <ChevronRight size={14} className="text-textMuted rotate-90" strokeWidth={2.5} />
                </div>
              </div>
            )}
            {state.validationErrors.department && (
              <p className="text-error text-xs mt-1 ml-4 font-medium">{state.validationErrors.department}</p>
            )}
          </div>
        )}

        {(state.selectedRole === UserRole.STUDENT || state.selectedRole === UserRole.CLASS_REP) && (
          <>
            <div>
              <Input
                name="matricNumber"
                label="Matriculation Number"
                placeholder="e.g. ENG/2021/001"
                value={state.formData.matricNumber}
                onChange={handleInputChange}
              />
              {state.validationErrors.matricNumber && (
                <p className="text-error text-xs mt-1 ml-4 font-medium">{state.validationErrors.matricNumber}</p>
              )}
            </div>
            <div>
              <Input
                name="level"
                label="Level"
                placeholder="e.g. 100, 200, 300, 400"
                value={state.formData.level}
                onChange={handleInputChange}
              />
              {state.validationErrors.level && (
                <p className="text-error text-xs mt-1 ml-4 font-medium">{state.validationErrors.level}</p>
              )}
            </div>
          </>
        )}

        {state.selectedRole === UserRole.STUDENT && (
          <div className="w-full">
            <label className="block text-sm font-medium text-textMuted mb-1.5">Digital Signature <span className="text-textMuted font-normal">(Optional)</span></label>
            <div className="border border-dashed border-outline bg-surfaceLow rounded-lg h-24 flex flex-col items-center justify-center text-center hover:bg-surfaceLow hover:border-primary/50 cursor-pointer transition-colors group">
              <Upload className="h-6 w-6 text-textMuted group-hover:text-primary mb-2 transition-colors" />
              <p className="text-xs text-textMuted group-hover:text-text">Upload signature image</p>
            </div>
          </div>
        )}

        {state.selectedRole === UserRole.CLASS_REP && (
          <Input
            name="assignedLecturer"
            label="Assigned Lecturer / Course"
            placeholder="Dr. Smith - CS402"
            value={state.formData.assignedLecturer}
            onChange={handleInputChange}
          />
        )}

        {state.selectedRole === UserRole.LECTURER && (
          <>
            <div>
              <Input
                name="staffId"
                label="Staff ID"
                placeholder="e.g. STF/001"
                value={state.formData.staffId}
                onChange={handleInputChange}
              />
              {state.validationErrors.staffId && (
                <p className="text-red-600 text-xs mt-1 ml-4">{state.validationErrors.staffId}</p>
              )}
            </div>
            <Input
              name="courses"
              label="Courses Taught"
              placeholder="CS101, CS202..."
              value={state.formData.courses}
              onChange={handleInputChange}
            />
          </>
        )}
      </div>
    </div>
  );

  const renderCourseRegistration = () => (
    <div className="space-y-6 h-full flex flex-col">
      <div className="text-center mb-4">
        <h2 className="font-headline text-2xl font-bold text-text mb-2">Register Courses</h2>
        <p className="text-textMuted">Select courses to add to your dashboard.</p>
      </div>

      {state.coursesLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : state.coursesError ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-4 py-3 rounded-xl">
            <AlertCircle size={20} />
            <p>{state.coursesError}</p>
          </div>
          <Button size="sm" onClick={fetchCourses} className="flex items-center gap-2">
            <RefreshCw size={16} />
            Retry Loading Courses
          </Button>
        </div>
      ) : state.courses.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-textMuted text-sm">No courses available at the moment.</p>
        </div>
      ) : (
        <>
          <div
            className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-3 max-h-[400px]"
            role="listbox"
            aria-label="Available courses"
            aria-multiselectable="true"
          >
            {state.courses.map((course) => {
              const isSelected = state.selectedCourses.includes(course.id);
              return (
                <button
                  key={course.id}
                  onClick={() => toggleCourseSelection(course.id)}
                  role="option"
                  aria-selected={isSelected}
                  aria-label={`${isSelected ? 'Deselect' : 'Select'} course ${course.code} – ${course.title}`}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                            isSelected
                                ? 'bg-primary/10 border-primary shadow-md'
                                : 'bg-surfaceContainer/50 border-outline/20 hover:border-primary/30 hover:shadow-sm'
                        }`}
                    >
                        <div className="text-left">
                            <div className="flex items-center gap-2">
                                 <span className={`text-sm font-bold ${isSelected ? 'text-primary' : 'text-text'}`}>{course.code}</span>
                                 {course.level && (
                                   <span className="text-[10px] bg-surfaceVariant text-textMuted px-1.5 py-0.5 rounded" aria-label={`${course.level} level`}>{course.level}L</span>
                                 )}
                            </div>
                            <p className="text-xs text-textMuted mt-1">{course.title}</p>
                            {course.lecturer_name && (
                              <p className="text-[10px] text-textMuted mt-0.5">{course.lecturer_name}</p>
                            )}
                        </div>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-colors ${
                            isSelected ? 'bg-primary border-primary text-on-primary-fixed' : 'border-outline/40 bg-transparent'
                        }`} aria-hidden="true">
                            {isSelected ? <Check size={14} /> : <Plus size={14} className="text-textMuted" />}
                        </div>
                    </button>
              );
            })}
          </div>

          <div className="text-center text-xs text-textMuted pt-2" aria-live="polite" aria-atomic="true">
            You selected {state.selectedCourses.length} course{state.selectedCourses.length !== 1 ? 's' : ''}.
          </div>
        </>
      )}
    </div>
  );

  const renderPreferences = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="font-headline text-2xl font-bold text-text mb-2">Permissions</h2>
        <p className="text-textMuted">Customize your app experience.</p>
      </div>

      <div className="space-y-3" role="group" aria-label="App permissions">
        {[
          {
            id: 'location',
            label: 'Location Access',
            desc: 'Required for GPS attendance verification.',
            icon: MapPin,
            state: state.permissions.location
          },
          {
            id: 'notifications',
            label: 'Notifications',
            desc: 'Get alerts for classes and attendance.',
            icon: Bell,
            state: state.permissions.notifications
          },
          {
            id: 'darkMode',
            label: 'Dark Mode',
            desc: 'Easier on the eyes in low light.',
            icon: state.permissions.darkMode ? Moon : Sun,
            state: state.permissions.darkMode
          }
        ].map((item) => (
          <div
            key={item.id}
            onClick={() => togglePermission(item.id as any)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                togglePermission(item.id as any);
              }
            }}
            role="switch"
            aria-checked={item.state}
            tabIndex={0}
            aria-label={`${item.label}: ${item.state ? 'enabled' : 'disabled'}. ${item.desc}`}
            className={`flex items-center justify-between p-4 rounded-xl cursor-pointer border transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary
                    ${item.state
                        ? 'bg-primary/5 border-primary/30 shadow-sm'
                        : 'bg-surfaceContainer/30 border-outline/20 hover:bg-surfaceContainer/50'
                    }`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-lg transition-colors ${item.state ? 'bg-primary text-on-primary-fixed' : 'bg-surfaceVariant text-textMuted'}`} aria-hidden="true">
                <item.icon size={20} />
              </div>
              <div className="text-left">
                <p className={`font-medium transition-colors ${item.state ? 'text-text' : 'text-text'}`}>{item.label}</p>
                <p className="text-xs text-textMuted">{item.desc}</p>
              </div>
            </div>
            <div
              className={`w-12 h-6 rounded-full p-1 flex items-center transition-colors ${item.state ? 'bg-primary justify-end' : 'bg-surfaceVariant justify-start'}`}
              aria-hidden="true"
            >
              <div className="w-4 h-4 rounded-full bg-surface shadow-sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <AuthBackground />
      
      {/* Header bar */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20">
        <div className="flex items-center gap-2">
            <Logo />
        </div>
        <ThemeToggle />
      </div>

      <div className="w-full max-w-lg relative z-10">
        {/* Screen-reader live region – announces step changes */}
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          Step {state.step} of {totalSteps}:{' '}
          {state.step === 1 && 'Choose your role'}
          {state.step === 2 && 'Personal details'}
          {state.step === 3 && 'Institutional details'}
          {state.step === 4 && state.selectedRole === UserRole.STUDENT && 'Course registration'}
          {state.step === (state.selectedRole === UserRole.STUDENT ? 5 : 4) && 'Permissions'}
        </div>

        <div
          className="glass-panel border-outline/20 p-6 md:p-8 rounded-[2rem] shadow-2xl relative overflow-hidden backdrop-blur-3xl animate-reveal"
          role="main"
        >
          {/* Header Title */}
          <div className="mb-8 text-center space-y-2">
             <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-bold uppercase tracking-wider mb-2">
                <Sparkles size={12} />
                <span>Onboarding Stage {state.step}</span>
             </div>
             <h1 className="text-3xl font-headline font-bold tracking-tight">Complete your profile</h1>
          </div>

          {/* Error Display */}
          {state.error && (
            <div
              role="alert"
              className="mb-6 p-4 bg-error/10 border border-error/20 rounded-2xl text-error text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2"
            >
              <AlertCircle size={20} className="flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div className="flex-1 font-medium">{state.error}</div>
              <button
                onClick={() => dispatch({ type: 'SET_ERROR', payload: '' })}
                className="text-error/60 hover:text-error transition-colors p-1"
                aria-label="Dismiss error"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          )}

          {/* Progress Bar */}
          <div
            className="flex gap-2 mb-10 px-2"
            role="progressbar"
            aria-label="Onboarding progress"
            aria-valuenow={state.step}
            aria-valuemin={1}
            aria-valuemax={totalSteps}
          >
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} className="flex-1 h-2 rounded-full bg-surfaceVariant/30 overflow-hidden">
                <div
                  className={`h-full bg-primary transition-all duration-700 ease-out shadow-[0_0_12px_rgba(253,185,19,0.3)] ${state.step >= i + 1 ? 'w-full' : 'w-0'}`}
                />
              </div>
            ))}
          </div>

          <div className="min-h-[420px] flex flex-col">
            <AnimatePresence mode="wait" custom={state.direction}>
              <motion.div
                key={state.step}
                custom={state.direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="flex-1"
              >
                {state.step === 1 && renderRoleSelection()}
                {state.step === 2 && renderPersonalDetails()}
                {state.step === 3 && renderAcademicDetails()}
                {state.step === 4 && state.selectedRole === UserRole.STUDENT && renderCourseRegistration()}
                {state.step === (state.selectedRole === UserRole.STUDENT ? 5 : 4) && renderPreferences()}
              </motion.div>
            </AnimatePresence>

            <div className="flex gap-4 mt-8 pt-8 border-t border-outline/10">
              {state.step > 1 && (
                <button
                  onClick={handleBack}
                  aria-label="Go back to previous step"
                  className="w-14 h-14 bg-surfaceLow border border-outline/20 text-textMuted rounded-2xl hover:bg-surfaceVariant transition-all flex items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <ChevronLeft size={24} aria-hidden="true" />
                </button>
              )}
              <button
                className="btn-presently-primary flex-1 h-14 flex items-center justify-center gap-2 group text-on-primary-fixed"
                onClick={handleNext}
                disabled={(state.step === 1 && !state.selectedRole) || (state.pendingImage !== null) || completeOnboardingMutation.isPending}
                aria-busy={completeOnboardingMutation.isPending}
              >
                {completeOnboardingMutation.isPending ? (
                  <>
                    <Loader size={20} className="animate-spin text-on-primary-fixed" />
                    <span>Finalizing...</span>
                  </>
                ) : (
                  <>
                    <span className="text-lg">
                      {state.step === totalSteps ? 'Complete Profile' : 'Next Step'}
                    </span>
                    {state.step < totalSteps && (
                      <ChevronRight 
                        size={20} 
                        className="ml-1 group-hover:translate-x-1 transition-transform" 
                        strokeWidth={3} 
                        aria-hidden="true" 
                      />
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-textMuted text-xs mt-8 font-medium" aria-hidden="true">
          Step {state.step} of {totalSteps} &bull; Progress saved automatically
        </p>
      </div>
    </div>
  );
};
