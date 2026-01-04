import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, BookOpen, Clock, Calendar, CheckCircle2, ChevronDown, Search } from 'lucide-react';
import { Button } from '../Button';
import { Input } from '../Input';
import { useCurrentUser } from '../../hooks/useAuth';
import { institutionsApi } from '../../services/api/institutions';
import { courseApi, sessionApi } from '../../services/api/attendance';
import { venueApi } from '../../services/api/venues';
import { Institution, College, Department, Course, Venue } from '../../types';
import { toast } from 'sonner';

export const CreateSessionPage: React.FC = () => {
    const navigate = useNavigate();
    const { data: user } = useCurrentUser();
    
    // Data State
    const [institutions, setInstitutions] = useState<Institution[]>([]);
    const [colleges, setColleges] = useState<College[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [venues, setVenues] = useState<Venue[]>([]);
    
    // Selection State
    const [selectedInstitution, setSelectedInstitution] = useState<number | null>(null);
    const [selectedCollege, setSelectedCollege] = useState<number | null>(null);
    const [selectedDepartment, setSelectedDepartment] = useState<number | null>(null);
    const [selectedCourse, setSelectedCourse] = useState<string>('');
    const [selectedVenue, setSelectedVenue] = useState<string>('');
    
    // Session Details State
    const [duration, setDuration] = useState<string>('60');
    const [durationUnit, setDurationUnit] = useState<'minutes' | 'hours'>('minutes');
    
    // UI State
    const [loading, setLoading] = useState(false);
    const [deptSearchTerm, setDeptSearchTerm] = useState('');

    useEffect(() => {
        loadInitialData();
    }, [user]);

    // Hierarchy Effects
    useEffect(() => {
        if (selectedInstitution) {
            loadColleges(selectedInstitution);
            loadDepartmentsByInstitution(selectedInstitution);
        } else {
            setColleges([]);
            setDepartments([]);
        }
    }, [selectedInstitution]);

    useEffect(() => {
        if (selectedCollege) {
            loadDepartmentsByCollege(selectedCollege);
        } else if (selectedInstitution) {
            loadDepartmentsByInstitution(selectedInstitution);
        }
    }, [selectedCollege]);

    useEffect(() => {
        if (selectedDepartment) {
            loadCourses(selectedDepartment);
        } else {
            // If no department selected, but we have institution, maybe show all? 
            // Or wait for department. For now, clear courses to encourage specific selection.
             setCourses([]);
        }
    }, [selectedDepartment]);

    const loadInitialData = async () => {
        try {
            const [instData, venuesData] = await Promise.all([
                institutionsApi.getAllInstitutions(),
                venueApi.getAll()
            ]);
            
            setInstitutions(Array.isArray(instData) ? instData : []);
            setVenues(Array.isArray(venuesData) ? venuesData : []);

            // Pre-fill if user has data
            if (user?.institution) {
                setSelectedInstitution(user.institution);
                // If user has college, set it (logic depends on if API returns it in profile)
                if (user.college) setSelectedCollege(user.college);
                // Same for department
                if (user.department) setSelectedDepartment(user.department);
            }
        } catch (err) {
            console.error('Failed to load initial data', err);
            toast.error('Failed to load initial data');
        }
    };

    const loadColleges = async (instId: number) => {
        try {
            const data = await institutionsApi.getCollegesByInstitution(instId);
            setColleges(Array.isArray(data) ? data : []);
        } catch (err) { console.error(err); }
    };

    const loadDepartmentsByCollege = async (collegeId: number) => {
        try {
            const data = await institutionsApi.getDepartmentsByCollege(collegeId);
            setDepartments(Array.isArray(data) ? data : []);
        } catch (err) { console.error(err); }
    };

    const loadDepartmentsByInstitution = async (instId: number) => {
        try {
            const data = await institutionsApi.getDepartmentsByInstitution(instId);
            setDepartments(Array.isArray(data) ? data : []);
        } catch (err) { console.error(err); }
    };

    const loadCourses = async (deptId: number) => {
        try {
            // Fetch courses filtered by department
            // Also consider filtering by lecturer if needed, but requirements say "courses for that lecturer's institution and department"
            // We can assume fetching by department is sufficient, or we could filter client-side if the API supported fetching all lecturer courses.
            // Using the existing API:
            const data = await courseApi.getAll({ department: deptId });
            setCourses(Array.isArray(data) ? data : []);
        } catch (err) { console.error(err); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!selectedCourse || !selectedVenue || !duration) {
            toast.error('Please fill in all required fields');
            return;
        }

        setLoading(true);
        try {
            let durationInMinutes = parseInt(duration);
            if (durationUnit === 'hours') {
                durationInMinutes *= 60;
            }

            await sessionApi.create({
                course: parseInt(selectedCourse),
                venue: parseInt(selectedVenue),
                // Calculate end time based on duration? 
                // The API seems to take start/end time usually, but the previous modal took duration.
                // Looking at the previous modal code:
                /* 
                   const endTime = new Date(Date.now() + durationInMs);
                   ... 
                   start_time: new Date().toISOString(),
                   end_time: endTime.toISOString(),
                */
               // So we need to calculate times here.
               start_time: new Date().toISOString(),
               end_time: new Date(Date.now() + durationInMinutes * 60000).toISOString(),
               is_active: true
            });

            toast.success('Session created successfully');
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            toast.error('Failed to create session');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
             // Optional: ask for confirmation if dirty?
             navigate('/dashboard');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-right-4 duration-300 pb-12" onKeyDown={handleKeyDown}>
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} aria-label="Go back">
                    <ArrowLeft size={20} />
                </Button>
                <div>
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Create New Session</h2>
                    <p className="text-zinc-500">Set up a new attendance session for your course.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Context Selection */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Hierarchy Card */}
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                            <div className="bg-blue-500/10 p-2 rounded-lg text-blue-500">
                                <MapPin size={20} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-zinc-900 dark:text-white">Location in Hierarchy</h3>
                                <p className="text-xs text-zinc-500">Select the institutional hierarchy: Institution → College/Faculty → Department</p>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Institution <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <select
                                        value={selectedInstitution || ''}
                                        onChange={(e) => setSelectedInstitution(e.target.value ? Number(e.target.value) : null)}
                                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5 text-zinc-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none"
                                        required
                                    >
                                        <option value="">Select Institution</option>
                                        {institutions.map(inst => (
                                            <option key={inst.id} value={inst.id}>{inst.full_name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={16} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">College / Faculty</label>
                                <div className="relative">
                                    <select
                                        value={selectedCollege || ''}
                                        onChange={(e) => setSelectedCollege(e.target.value ? Number(e.target.value) : null)}
                                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5 text-zinc-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none disabled:opacity-50"
                                        disabled={!selectedInstitution}
                                    >
                                        <option value="">Select College (Optional)</option>
                                        {colleges.map(col => (
                                            <option key={col.id} value={col.id}>{col.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={16} />
                                </div>
                                <p className="text-xs text-zinc-500 mt-1">Optional: Select a college to filter departments</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Department <span className="text-red-500">*</span></label>
                                {selectedInstitution ? (
                                    <div className="space-y-3">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                            <input
                                                type="text"
                                                placeholder="Search departments..."
                                                value={deptSearchTerm}
                                                onChange={(e) => setDeptSearchTerm(e.target.value)}
                                                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                                            {departments
                                                .filter(d => d.name.toLowerCase().includes(deptSearchTerm.toLowerCase()) || d.code.toLowerCase().includes(deptSearchTerm.toLowerCase()))
                                                .map(dept => (
                                                    <button
                                                        key={dept.id}
                                                        type="button"
                                                        onClick={() => setSelectedDepartment(dept.id)}
                                                        className={`text-left p-3 rounded-lg border text-sm transition-all ${
                                                            selectedDepartment === dept.id
                                                            ? 'bg-primary/5 border-primary text-primary shadow-sm' 
                                                            : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
                                                        }`}
                                                    >
                                                        <div className="font-semibold truncate">{dept.name}</div>
                                                        <div className="text-xs opacity-70 font-mono">{dept.code}</div>
                                                    </button>
                                                ))
                                            }
                                            {departments.length === 0 && (
                                                <div className="col-span-full text-center py-4 text-zinc-500 text-sm italic">
                                                    No departments found.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-zinc-50 dark:bg-zinc-950 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg p-6 text-center text-zinc-500 text-sm">
                                        Please select an institution first to view departments.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Session Details Card */}
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                            <div className="bg-primary/10 p-2 rounded-lg text-primary">
                                <BookOpen size={20} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-zinc-900 dark:text-white">Session Details</h3>
                                <p className="text-xs text-zinc-500">Configure the course and timing</p>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Select Course <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <select
                                        value={selectedCourse}
                                        onChange={(e) => setSelectedCourse(e.target.value)}
                                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5 text-zinc-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none disabled:opacity-50"
                                        disabled={!selectedDepartment}
                                        required
                                    >
                                        <option value="">Select a course...</option>
                                        {courses.map(course => (
                                            <option key={course.id} value={course.id}>{course.code} - {course.title}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={16} />
                                </div>
                                {!selectedDepartment && <p className="text-xs text-amber-500 mt-1">Select a department above to see available courses.</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Select Venue <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <select
                                        value={selectedVenue}
                                        onChange={(e) => setSelectedVenue(e.target.value)}
                                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5 text-zinc-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none"
                                        required
                                    >
                                        <option value="">Select a venue...</option>
                                        {venues.map(venue => (
                                            <option key={venue.id} value={venue.id}>{venue.name} ({venue.capacity || 'N/A'} seats)</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={16} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Duration <span className="text-red-500">*</span></label>
                                <div className="flex gap-2">
                                    <Input 
                                        type="number" 
                                        min="1"
                                        className="flex-1" 
                                        placeholder="60" 
                                        value={duration} 
                                        onChange={e => setDuration(e.target.value)} 
                                        required 
                                    />
                                    <div className="relative w-1/3">
                                        <select 
                                            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5 text-zinc-900 dark:text-white text-sm focus:ring-primary focus:border-primary outline-none appearance-none"
                                            value={durationUnit}
                                            onChange={(e) => setDurationUnit(e.target.value as any)}
                                        >
                                            <option value="minutes">Minutes</option>
                                            <option value="hours">Hours</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={14} />
                                    </div>
                                </div>
                                <p className="text-xs text-zinc-500 mt-1">Session will auto-expire after this time.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Summary & Actions */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm sticky top-6">
                        <h3 className="font-semibold text-zinc-900 dark:text-white mb-4">Start Session</h3>
                        
                        <div className="space-y-4 mb-6 text-sm text-zinc-600 dark:text-zinc-400">
                           <p>Please review your details before starting. Once started, students will be able to check in via QR code or geolocation.</p>
                           
                           {selectedCourse && (
                               <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800">
                                   <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Course</div>
                                   <div className="font-semibold text-zinc-900 dark:text-white">
                                       {courses.find(c => c.id.toString() === selectedCourse)?.code}
                                   </div>
                               </div>
                           )}
                           
                           {selectedVenue && (
                               <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800">
                                   <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Venue</div>
                                   <div className="font-semibold text-zinc-900 dark:text-white">
                                       {venues.find(v => v.id.toString() === selectedVenue)?.name}
                                   </div>
                               </div>
                           )}
                        </div>

                        <div className="space-y-3">
                            <Button type="submit" className="w-full justify-center" disabled={loading}>
                                {loading ? 'Creating...' : 'Create & Start'}
                            </Button>
                            <Button variant="secondary" className="w-full justify-center" onClick={() => navigate('/dashboard')} type="button">
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};
