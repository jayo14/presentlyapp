import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../Button';
import { Input } from '../Input';
import { Logo } from '../Logo';
import { UserRole, Course, Institution, College, Department } from '../../types';
import { useCompleteOnboarding, useCurrentUser } from '../../hooks/useAuth';
import { coursesApi } from '../../services/api';
import { institutionsApi } from '../../services/api/institutions';
import { 
  User, Bell, MapPin, Check, Upload, 
  Moon, Sun, Camera, Smartphone, ChevronRight, ChevronLeft,
  GraduationCap, Briefcase, UserCheck, X, Plus, Loader
} from 'lucide-react';

export const Onboarding: React.FC = () => {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(0);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [error, setError] = useState('');
  
  const { data: user } = useCurrentUser();
  const completeOnboardingMutation = useCompleteOnboarding();

  // Courses state
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [coursesError, setCoursesError] = useState('');

  // Institution, College, Department state
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedInstitution, setSelectedInstitution] = useState<number | null>(null);
  const [selectedCollege, setSelectedCollege] = useState<number | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    phoneNumber: '',
    matricNumber: '',
    department: '',
    level: '',
    staffId: '',
    courses: '',
    assignedLecturer: ''
  });

  const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
  
  const [permissions, setPermissions] = useState({
    notifications: false,
    location: false,
    darkMode: false
  });

  // Fetch courses when user selects student role and reaches course selection step
  useEffect(() => {
    if (selectedRole === UserRole.STUDENT && step === 4) {
      fetchCourses();
    }
  }, [selectedRole, step]);

  // Fetch institutions on mount
  useEffect(() => {
    fetchInstitutions();
  }, []);

  // Fetch colleges when institution is selected
  useEffect(() => {
    if (selectedInstitution) {
      fetchColleges(selectedInstitution);
    }
  }, [selectedInstitution]);

  // Fetch departments when college is selected
  useEffect(() => {
    if (selectedCollege) {
      fetchDepartments(selectedCollege);
    }
  }, [selectedCollege]);

  const fetchInstitutions = async () => {
    try {
      const data = await institutionsApi.getAllInstitutions();
      // Handle both array and wrapped responses
      const institutionList = Array.isArray(data) ? data : (data.results || data.data || []);
      setInstitutions(Array.isArray(institutionList) ? institutionList.filter(inst => inst.is_active) : []);
    } catch (err) {
      console.error('Error fetching institutions:', err);
      setInstitutions([]);
    }
  };

  const fetchColleges = async (institutionId: number) => {
    try {
      const data = await institutionsApi.getCollegesByInstitution(institutionId);
      // Handle both array and wrapped responses
      const collegeList = Array.isArray(data) ? data : (data.results || data.data || []);
      setColleges(Array.isArray(collegeList) ? collegeList.filter(col => col.is_active) : []);
    } catch (err) {
      console.error('Error fetching colleges:', err);
      setColleges([]);
    }
  };

  const fetchDepartments = async (collegeId: number) => {
    try {
      const data = await institutionsApi.getDepartmentsByCollege(collegeId);
      // Handle both array and wrapped responses
      const departmentList = Array.isArray(data) ? data : (data.results || data.data || []);
      setDepartments(Array.isArray(departmentList) ? departmentList.filter(dept => dept.is_active) : []);
    } catch (err) {
      console.error('Error fetching departments:', err);
      setDepartments([]);
    }
  };

  const fetchCourses = async () => {
    try {
      setCoursesLoading(true);
      setCoursesError('');
      const data = await coursesApi.getAllCourses();
      // Handle both array and wrapped responses
      const courseList = Array.isArray(data) ? data : (data.results || data.data || []);
      setCourses(Array.isArray(courseList) ? courseList.filter(course => course.is_active) : []);
    } catch (err: any) {
      setCoursesError(err.message || 'Failed to load courses');
      console.error('Error fetching courses:', err);
      setCourses([]);
    } finally {
      setCoursesLoading(false);
    }
  };

  // Calculate total steps based on role
  const totalSteps = selectedRole === UserRole.STUDENT ? 5 : 4;

  const handleNext = async () => {
    if (step < totalSteps) {
      setDirection(1);
      setStep(step + 1);
    } else {
      // Complete onboarding
      if (selectedRole) {
        setError('');
        
        // Prepare onboarding data
        const onboardingData = {
          role: selectedRole,
          phone_number: formData.phoneNumber || undefined,
          matric_number: formData.matricNumber || undefined,
          department: selectedDepartment?.toString() || formData.department || undefined,
          level: formData.level || undefined,
          staff_id: formData.staffId || undefined,
          courses: selectedCourses.length > 0 ? selectedCourses.join(',') : undefined,
          assigned_lecturer: formData.assignedLecturer || undefined,
          institution: selectedInstitution || undefined,
          college: selectedCollege || undefined,
          avatar_url: profileImage || undefined,
          notifications_enabled: permissions.notifications,
          location_enabled: permissions.location,
          dark_mode: permissions.darkMode,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
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

  const togglePermission = (key: 'notifications' | 'location' | 'darkMode') => {
    setPermissions(prev => ({ ...prev, [key]: !prev[key] }));
    if (key === 'darkMode') {
      document.documentElement.classList.toggle('dark', !permissions.darkMode);
    }
  };

  const toggleCourseSelection = (courseId: number) => {
    setSelectedCourses(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId) 
        : [...prev, courseId]
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e?: React.ChangeEvent<HTMLInputElement>) => {
    // If called from file input
    if (e && e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPendingImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleCameraClick = async () => {
    try {
      const { CameraService } = await import('../../services/camera');
      const photoData = await CameraService.capturePhoto({
        quality: 80,
        allowEditing: true,
        width: 512,
        height: 512,
      });
      
      if (photoData) {
        setPendingImage(photoData);
      }
    } catch (error) {
      console.error('Camera error:', error);
      // Fallback to file input if camera fails
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.onchange = (e) => handleImageUpload(e as React.ChangeEvent<HTMLInputElement>);
      fileInput.click();
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
      { 
        id: UserRole.CLASS_REP, 
        icon: UserCheck, 
        label: 'Class Rep', 
        desc: 'I want to assist with class management and student coordination.',
        features: ['View attendance', 'Coordinate classes', 'Send announcements']
      },
    ];

    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">How will you use Presently?</h2>
          <p className="text-zinc-600">Select your role to get started</p>
          <p className="text-xs text-zinc-500 mt-2">Step 1 of {totalSteps}</p>
        </div>
        
        <div className="grid gap-4">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              className={`flex flex-col p-5 rounded-xl border-2 transition-all w-full text-left group hover:shadow-md
                ${selectedRole === role.id 
                  ? 'border-primary bg-primary/10 shadow-md' 
                  : 'border-zinc-200 bg-white hover:border-primary/30'
                }`}
            >
              <div className="flex items-start gap-4 mb-3">
                <div className={`p-3 rounded-xl transition-colors ${selectedRole === role.id ? 'bg-primary text-white' : 'bg-zinc-100 text-zinc-600 group-hover:bg-primary/10 group-hover:text-primary'}`}>
                  <role.icon size={28} />
                </div>
                <div className="flex-1">
                  <p className={`text-lg font-bold transition-colors mb-1 ${selectedRole === role.id ? 'text-primary' : 'text-zinc-900'}`}>
                    {role.label}
                  </p>
                  <p className="text-sm text-zinc-600 leading-relaxed">{role.desc}</p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${selectedRole === role.id ? 'border-primary bg-primary' : 'border-zinc-300'}`}>
                   {selectedRole === role.id && <Check size={16} className="text-white" />}
                </div>
              </div>
              
              {/* Features List */}
              <div className="flex flex-wrap gap-2 ml-16">
                {role.features.map((feature, idx) => (
                  <span 
                    key={idx}
                    className={`text-xs px-2 py-1 rounded-full ${selectedRole === role.id ? 'bg-primary/20 text-primary' : 'bg-zinc-100 text-zinc-600'}`}
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
        <h2 className="text-2xl font-bold text-zinc-900 mb-2">Personal Details</h2>
        <p className="text-zinc-600">Let's set up your profile.</p>
      </div>

      <div className="flex flex-col items-center mb-8 gap-4">
        <div className="relative group cursor-pointer">
           <div className="w-28 h-28 rounded-full bg-zinc-100 overflow-hidden border-4 border-zinc-200 ring-2 ring-zinc-100 group-hover:ring-primary transition-all">
              {pendingImage ? (
                  <img src={pendingImage} alt="Preview" className="w-full h-full object-cover opacity-80" />
              ) : profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-400">
                      <User size={40} />
                  </div>
              )}
           </div>
           
           {!pendingImage && (
             <button 
               type="button"
               onClick={handleCameraClick}
               className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-primary-hover shadow-lg transition-transform hover:scale-110"
             >
                <Camera size={16} />
             </button>
           )}
        </div>

        {pendingImage && (
            <div className="flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <Button size="sm" variant="secondary" onClick={cancelImage} className="h-8">
                    <X size={14} className="mr-1" /> Cancel
                </Button>
                <Button size="sm" onClick={confirmImage} className="h-8">
                    <Check size={14} className="mr-1" /> Confirm Photo
                </Button>
            </div>
        )}
      </div>

      <div className="space-y-4">
        <Input 
          name="phoneNumber"
          label="Phone Number" 
          placeholder="+234 800 000 0000" 
          icon={<Smartphone size={16} />}
          value={formData.phoneNumber}
          onChange={handleInputChange}
        />
      </div>
    </div>
  );

  const renderAcademicDetails = () => (
    <div className="space-y-6">
      {/* Mobile Header */}
      <div className="md:hidden text-center mb-6">
        <p className="text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-2">Institutional Details</p>
        <p className="text-xs text-zinc-500 mb-4">{totalSteps} of {totalSteps}</p>
        <h2 className="text-3xl font-bold text-zinc-900 mb-3">Link your Institution</h2>
        <p className="text-base text-zinc-600 px-2">
          Almost there! Select your specific academic location to finalize your profile.
        </p>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block text-center mb-6">
        <h2 className="text-2xl font-bold text-zinc-900 mb-2">Link your Institution</h2>
        <p className="text-zinc-600">
           {selectedRole === UserRole.LECTURER ? 'Tell us about your teaching role.' : 'Select your academic location.'}
        </p>
        <p className="text-xs text-zinc-500 mt-2">Step 3 of {totalSteps}</p>
      </div>

      <div className="space-y-4">
        {/* Institution Selection */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-2 flex items-center gap-2">
            <span>Institution</span>
            {selectedInstitution && <Check size={16} className="text-green-600" />}
          </label>
          <div className="relative">
            <select
              value={selectedInstitution || ''}
              onChange={(e) => {
                const value = e.target.value ? Number(e.target.value) : null;
                setSelectedInstitution(value);
                setSelectedCollege(null);
                setSelectedDepartment(null);
                setColleges([]);
                setDepartments([]);
              }}
              className="w-full bg-white border-2 border-zinc-300 text-zinc-900 rounded-xl p-3.5 pl-4 pr-10 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all appearance-none cursor-pointer hover:border-zinc-400"
            >
              <option value="">Select your institution</option>
              {institutions.map(inst => (
                <option key={inst.id} value={inst.id}>
                  {inst.short_name} - {inst.full_name}
                </option>
              ))}
            </select>
            <ChevronRight size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none rotate-90" />
          </div>
        </div>

        {/* College Selection */}
        {selectedInstitution && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <label className="block text-sm font-medium text-zinc-700 mb-2 flex items-center gap-2">
              <span>College/Faculty</span>
              {selectedCollege && <Check size={16} className="text-green-600" />}
            </label>
            <div className="relative">
              <select
                value={selectedCollege || ''}
                onChange={(e) => {
                  const value = e.target.value ? Number(e.target.value) : null;
                  setSelectedCollege(value);
                  setSelectedDepartment(null);
                  setDepartments([]);
                }}
                disabled={colleges.length === 0}
                className="w-full bg-white border-2 border-zinc-300 text-zinc-900 rounded-xl p-3.5 pl-4 pr-10 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all appearance-none cursor-pointer hover:border-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Select college/faculty</option>
                {colleges.map(col => (
                  <option key={col.id} value={col.id}>
                    {col.code} - {col.name}
                  </option>
                ))}
              </select>
              <ChevronRight size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none rotate-90" />
            </div>
          </div>
        )}

        {/* Department Selection */}
        {selectedCollege && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <label className="block text-sm font-medium text-zinc-700 mb-2 flex items-center gap-2">
              <span>Department</span>
              {selectedDepartment && <Check size={16} className="text-green-600" />}
            </label>
            <div className="relative">
              <select
                value={selectedDepartment || ''}
                onChange={(e) => {
                  const value = e.target.value ? Number(e.target.value) : null;
                  setSelectedDepartment(value);
                }}
                disabled={departments.length === 0}
                className="w-full bg-white border-2 border-zinc-300 text-zinc-900 rounded-xl p-3.5 pl-4 pr-10 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all appearance-none cursor-pointer hover:border-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Select department</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.code} - {dept.name}
                  </option>
                ))}
              </select>
              <ChevronRight size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none rotate-90" />
            </div>
          </div>
        )}

        {(selectedRole === UserRole.STUDENT || selectedRole === UserRole.CLASS_REP) && (
            <>
                <Input 
                    name="matricNumber"
                    label="Matriculation Number" 
                    placeholder="e.g. ENG/2021/001" 
                    value={formData.matricNumber}
                    onChange={handleInputChange}
                />
                <Input 
                    name="level"
                    label="Level" 
                    placeholder="e.g. 100, 200, 300, 400" 
                    value={formData.level}
                    onChange={handleInputChange}
                />
            </>
        )}

        {selectedRole === UserRole.STUDENT && (
             <div className="w-full">
                 <label className="block text-sm font-medium text-zinc-700 mb-1.5">Digital Signature <span className="text-zinc-500 font-normal">(Optional)</span></label>
                 <div className="border border-dashed border-zinc-300 bg-zinc-50 rounded-lg h-24 flex flex-col items-center justify-center text-center hover:bg-zinc-100 hover:border-primary/50 cursor-pointer transition-colors group">
                    <Upload className="h-6 w-6 text-zinc-400 group-hover:text-primary mb-2 transition-colors" />
                    <p className="text-xs text-zinc-500 group-hover:text-zinc-700">Upload signature image</p>
                 </div>
            </div>
        )}

        {selectedRole === UserRole.CLASS_REP && (
            <Input 
                name="assignedLecturer"
                label="Assigned Lecturer / Course" 
                placeholder="Dr. Smith - CS402" 
                value={formData.assignedLecturer}
                onChange={handleInputChange}
            />
        )}

        {selectedRole === UserRole.LECTURER && (
            <>
                <Input 
                    name="staffId"
                    label="Staff ID" 
                    placeholder="e.g. STF/001" 
                    value={formData.staffId}
                    onChange={handleInputChange}
                />
                 <Input 
                    name="courses"
                    label="Courses Taught" 
                    placeholder="CS101, CS202..." 
                    value={formData.courses}
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
        <h2 className="text-2xl font-bold text-zinc-900 mb-2">Register Courses</h2>
        <p className="text-zinc-600">Select courses to add to your dashboard.</p>
      </div>

      {coursesLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : coursesError ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <p className="text-red-600 text-sm">{coursesError}</p>
          <Button size="sm" onClick={fetchCourses}>
            Retry
          </Button>
        </div>
      ) : courses.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-zinc-500 text-sm">No courses available at the moment.</p>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-3 max-h-[400px]">
            {courses.map((course) => {
                const isSelected = selectedCourses.includes(course.id);
                return (
                    <button
                        key={course.id}
                        onClick={() => toggleCourseSelection(course.id)}
                        className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                            isSelected 
                                ? 'bg-primary/10 border-primary shadow-md' 
                                : 'bg-white border-zinc-300 hover:border-zinc-400 hover:shadow-sm'
                        }`}
                    >
                        <div className="text-left">
                            <div className="flex items-center gap-2">
                                 <span className={`text-sm font-bold ${isSelected ? 'text-primary' : 'text-zinc-900'}`}>{course.code}</span>
                                 {course.level && (
                                   <span className="text-[10px] bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded">{course.level}L</span>
                                 )}
                            </div>
                            <p className="text-xs text-zinc-600 mt-1">{course.title}</p>
                            {course.lecturer_name && (
                              <p className="text-[10px] text-zinc-500 mt-0.5">{course.lecturer_name}</p>
                            )}
                        </div>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-colors ${
                            isSelected ? 'bg-primary border-primary text-white' : 'border-zinc-300 bg-transparent'
                        }`}>
                            {isSelected ? <Check size={14} /> : <Plus size={14} className="text-zinc-400" />}
                        </div>
                    </button>
                );
            })}
          </div>
          
          <div className="text-center text-xs text-zinc-500 pt-2">
            You selected {selectedCourses.length} courses.
          </div>
        </>
      )}
    </div>
  );

  const renderPreferences = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-zinc-900 mb-2">Permissions</h2>
        <p className="text-zinc-600">Customize your app experience.</p>
      </div>

      <div className="space-y-3">
        {[
            { 
                id: 'location', 
                label: 'Location Access', 
                desc: 'Required for GPS attendance verification.', 
                icon: MapPin, 
                state: permissions.location 
            },
            { 
                id: 'notifications', 
                label: 'Notifications', 
                desc: 'Get alerts for classes and attendance.', 
                icon: Bell, 
                state: permissions.notifications 
            },
            { 
                id: 'darkMode', 
                label: 'Dark Mode', 
                desc: 'Easier on the eyes in low light.', 
                icon: permissions.darkMode ? Moon : Sun, 
                state: permissions.darkMode 
            }
        ].map((item) => (
            <div 
                key={item.id}
                onClick={() => togglePermission(item.id as any)}
                className={`flex items-center justify-between p-4 rounded-xl cursor-pointer border transition-all
                    ${item.state 
                        ? 'bg-white border-primary/30 shadow-sm' 
                        : 'bg-zinc-50 border-zinc-200 hover:bg-white'
                    }`}
            >
                <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg transition-colors ${item.state ? 'bg-primary text-white' : 'bg-zinc-200 text-zinc-600'}`}>
                        <item.icon size={20} />
                    </div>
                    <div className="text-left">
                        <p className={`font-medium transition-colors ${item.state ? 'text-zinc-900' : 'text-zinc-600'}`}>{item.label}</p>
                        <p className="text-xs text-zinc-500">{item.desc}</p>
                    </div>
                </div>
                <div className={`w-12 h-6 rounded-full p-1 flex items-center transition-colors ${item.state ? 'bg-primary justify-end' : 'bg-zinc-300 justify-start'}`}>
                    <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                </div>
            </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F5F0] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header Logo */}
        <div className="flex justify-center mb-8">
            <Logo />
        </div>

        <div className="bg-white border border-zinc-200 p-6 md:p-8 rounded-3xl shadow-lg relative overflow-hidden">
             {/* Error Display */}
             {error && (
               <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-3">
                 <div className="flex-1">{error}</div>
                 <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">
                   <X size={16} />
                 </button>
               </div>
             )}
             
             {/* Progress Bar */}
             <div className="flex gap-2 mb-8 px-2">
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <div key={i} className="flex-1 h-1.5 rounded-full bg-zinc-200 overflow-hidden">
                      <div 
                        className={`h-full bg-primary transition-all duration-500 ease-out ${step >= i + 1 ? 'w-full' : 'w-0'}`} 
                      />
                  </div>
                ))}
            </div>

            <div className="min-h-[400px] flex flex-col">
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={step}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="flex-1"
                    >
                        {step === 1 && renderRoleSelection()}
                        {step === 2 && renderPersonalDetails()}
                        {step === 3 && renderAcademicDetails()}
                        {step === 4 && selectedRole === UserRole.STUDENT && renderCourseRegistration()}
                        {step === (selectedRole === UserRole.STUDENT ? 5 : 4) && renderPreferences()}
                    </motion.div>
                </AnimatePresence>

                <div className="flex gap-4 mt-8 pt-6 border-t border-zinc-200">
                    {step > 1 && (
                        <Button variant="secondary" onClick={handleBack} className="px-4">
                            <ChevronLeft size={20} />
                        </Button>
                    )}
                    <Button 
                        className="flex-1" 
                        size="lg" 
                        onClick={handleNext}
                        disabled={(step === 1 && !selectedRole) || (pendingImage !== null) || completeOnboardingMutation.isPending}
                        isLoading={completeOnboardingMutation.isPending}
                    >
                        {step === totalSteps ? 'Finish Setup' : 'Continue'}
                        {step < totalSteps && !completeOnboardingMutation.isPending && <ChevronRight size={18} className="ml-2" />}
                    </Button>
                </div>
            </div>
        </div>
        
        <p className="text-center text-zinc-500 text-xs mt-6">
            Step {step} of {totalSteps}
        </p>
      </div>
    </div>
  );
};
