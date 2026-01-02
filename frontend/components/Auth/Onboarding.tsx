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
    darkMode: true
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
      setInstitutions(data.filter(inst => inst.is_active));
    } catch (err) {
      console.error('Error fetching institutions:', err);
    }
  };

  const fetchColleges = async (institutionId: number) => {
    try {
      const data = await institutionsApi.getCollegesByInstitution(institutionId);
      setColleges(data.filter(col => col.is_active));
    } catch (err) {
      console.error('Error fetching colleges:', err);
    }
  };

  const fetchDepartments = async (collegeId: number) => {
    try {
      const data = await institutionsApi.getDepartmentsByCollege(collegeId);
      setDepartments(data.filter(dept => dept.is_active));
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  const fetchCourses = async () => {
    try {
      setCoursesLoading(true);
      setCoursesError('');
      const data = await coursesApi.getAllCourses();
      setCourses(data.filter(course => course.is_active));
    } catch (err: any) {
      setCoursesError(err.message || 'Failed to load courses');
      console.error('Error fetching courses:', err);
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
        <p className="text-zinc-500">Let's set up your profile.</p>
      </div>

      <div className="flex flex-col items-center mb-8 gap-4">
        <div className="relative group cursor-pointer">
           <div className="w-28 h-28 rounded-full bg-zinc-800 overflow-hidden border-4 border-zinc-900 ring-2 ring-zinc-800 group-hover:ring-primary transition-all">
              {pendingImage ? (
                  <img src={pendingImage} alt="Preview" className="w-full h-full object-cover opacity-80" />
              ) : profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-600">
                      <User size={40} />
                  </div>
              )}
           </div>
           
           {!pendingImage && (
             <label className="absolute bottom-0 right-0 bg-primary text-black p-2 rounded-full cursor-pointer hover:bg-primary-hover shadow-lg transition-transform hover:scale-110">
                <Camera size={16} />
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
             </label>
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
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Academic Info</h2>
        <p className="text-zinc-500">
           {selectedRole === UserRole.LECTURER ? 'Tell us about your teaching role.' : 'Tell us about your course of study.'}
        </p>
      </div>

      <div className="space-y-4">
        {/* Institution Selection */}
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1.5">Institution</label>
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
            className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg p-3 focus:ring-1 focus:ring-primary outline-none"
          >
            <option value="">Select Institution</option>
            {institutions.map(inst => (
              <option key={inst.id} value={inst.id}>
                {inst.short_name} - {inst.full_name}
              </option>
            ))}
          </select>
        </div>

        {/* College Selection */}
        {selectedInstitution && (
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">College/Faculty</label>
            <select
              value={selectedCollege || ''}
              onChange={(e) => {
                const value = e.target.value ? Number(e.target.value) : null;
                setSelectedCollege(value);
                setSelectedDepartment(null);
                setDepartments([]);
              }}
              className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg p-3 focus:ring-1 focus:ring-primary outline-none"
            >
              <option value="">Select College/Faculty</option>
              {colleges.map(col => (
                <option key={col.id} value={col.id}>
                  {col.code} - {col.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Department Selection */}
        {selectedCollege && (
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">Department</label>
            <select
              value={selectedDepartment || ''}
              onChange={(e) => {
                const value = e.target.value ? Number(e.target.value) : null;
                setSelectedDepartment(value);
              }}
              className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg p-3 focus:ring-1 focus:ring-primary outline-none"
            >
              <option value="">Select Department</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.code} - {dept.name}
                </option>
              ))}
            </select>
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
                 <label className="block text-sm font-medium text-zinc-400 mb-1.5">Digital Signature <span className="text-zinc-600 font-normal">(Optional)</span></label>
                 <div className="border border-dashed border-zinc-800 bg-zinc-900/30 rounded-lg h-24 flex flex-col items-center justify-center text-center hover:bg-zinc-900 hover:border-primary/50 cursor-pointer transition-colors group">
                    <Upload className="h-6 w-6 text-zinc-600 group-hover:text-primary mb-2 transition-colors" />
                    <p className="text-xs text-zinc-500 group-hover:text-zinc-300">Upload signature image</p>
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
                    name="department"
                    label="Department" 
                    placeholder="Computer Science" 
                    value={formData.department}
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
        <h2 className="text-2xl font-bold text-white mb-2">Register Courses</h2>
        <p className="text-zinc-500">Select courses to add to your dashboard.</p>
      </div>

      {coursesLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : coursesError ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <p className="text-red-400 text-sm">{coursesError}</p>
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
                                ? 'bg-primary/10 border-primary shadow-lg shadow-primary/5' 
                                : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                        }`}
                    >
                        <div className="text-left">
                            <div className="flex items-center gap-2">
                                 <span className={`text-sm font-bold ${isSelected ? 'text-primary' : 'text-white'}`}>{course.code}</span>
                                 {course.level && (
                                   <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">{course.level}L</span>
                                 )}
                            </div>
                            <p className="text-xs text-zinc-400 mt-1">{course.title}</p>
                            {course.lecturer_name && (
                              <p className="text-[10px] text-zinc-600 mt-0.5">{course.lecturer_name}</p>
                            )}
                        </div>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-colors ${
                            isSelected ? 'bg-primary border-primary text-black' : 'border-zinc-600 bg-transparent'
                        }`}>
                            {isSelected ? <Check size={14} /> : <Plus size={14} className="text-zinc-500" />}
                        </div>
                    </button>
                );
            })}
          </div>
          
          <div className="text-center text-xs text-zinc-600 pt-2">
            You selected {selectedCourses.length} courses.
          </div>
        </>
      )}
    </div>
  );

  const renderPreferences = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Permissions</h2>
        <p className="text-zinc-500">Customize your app experience.</p>
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
                        ? 'bg-zinc-900 border-primary/30' 
                        : 'bg-zinc-900/50 border-transparent hover:bg-zinc-900'
                    }`}
            >
                <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg transition-colors ${item.state ? 'bg-primary text-black' : 'bg-zinc-800 text-zinc-400'}`}>
                        <item.icon size={20} />
                    </div>
                    <div className="text-left">
                        <p className={`font-medium transition-colors ${item.state ? 'text-white' : 'text-zinc-400'}`}>{item.label}</p>
                        <p className="text-xs text-zinc-500">{item.desc}</p>
                    </div>
                </div>
                <div className={`w-12 h-6 rounded-full p-1 flex items-center transition-colors ${item.state ? 'bg-primary justify-end' : 'bg-zinc-700 justify-start'}`}>
                    <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                </div>
            </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header Logo */}
        <div className="flex justify-center mb-8">
            <Logo />
        </div>

        <div className="bg-zinc-950 border border-zinc-900 p-6 md:p-8 rounded-3xl shadow-2xl relative overflow-hidden">
             {/* Error Display */}
             {error && (
               <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-start gap-3">
                 <div className="flex-1">{error}</div>
                 <button onClick={() => setError('')} className="text-red-400 hover:text-red-300">
                   <X size={16} />
                 </button>
               </div>
             )}
             
             {/* Progress Bar */}
             <div className="flex gap-2 mb-8 px-2">
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <div key={i} className="flex-1 h-1.5 rounded-full bg-zinc-900 overflow-hidden">
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

                <div className="flex gap-4 mt-8 pt-6 border-t border-zinc-900">
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
        
        <p className="text-center text-zinc-600 text-xs mt-6">
            Step {step} of {totalSteps}
        </p>
      </div>
    </div>
  );
};
