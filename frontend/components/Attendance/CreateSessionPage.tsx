import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, BookOpen, Clock, Calendar, CheckCircle2, ChevronDown, Search, Building2, GraduationCap, Edit2, X, AlertCircle, Check, Target } from 'lucide-react';
import { Button } from '../Button';
import { Input } from '../Input';
import { useCurrentUser } from '../../hooks/useAuth';
import { institutionsApi } from '../../services/api/institutions';
import { courseApi, sessionApi } from '../../services/api/attendance';
import { venueApi } from '../../services/api/venues';
import { Institution, College, Department, Course, Venue, Session } from '../../types';
import { toast } from 'sonner';
import { SessionDetailDialog } from './SessionDetailDialog';
import { ResponsiveContainer } from '../layouts/ResponsiveContainer';
import { SEO } from '../SEO';

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
    const [selectedDepartments, setSelectedDepartments] = useState<number[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<string>('');
    const [selectedVenue, setSelectedVenue] = useState<string>('');
    
    // UX State
    const [isHierarchyExpanded, setIsHierarchyExpanded] = useState(true);
    const [deptSearchTerm, setDeptSearchTerm] = useState('');
    
    // Session Details State
    const [duration, setDuration] = useState<string>('60');
    const [durationUnit, setDurationUnit] = useState<'minutes' | 'hours'>('minutes');
    
    // Verification Methods State
    const [qrCodeEnabled, setQrCodeEnabled] = useState(true);
    const [digitCodeEnabled, setDigitCodeEnabled] = useState(false);
    const [gpsEnabled, setGpsEnabled] = useState(true);
    const [geofenceRadius, setGeofenceRadius] = useState(250);
    
    // UI State
    const [loading, setLoading] = useState(false);
    const [createdSession, setCreatedSession] = useState<Session | null>(null);

    // Initial Load & Defaults
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
        setSelectedDepartments([]);
        setCourses([]);
    }, [selectedInstitution]);

    useEffect(() => {
        if (selectedCollege) {
            loadDepartmentsByCollege(selectedCollege);
        } else if (selectedInstitution) {
            loadDepartmentsByInstitution(selectedInstitution);
        }
        setSelectedDepartments([]);
    }, [selectedCollege]);

    useEffect(() => {
        if (selectedDepartments.length > 0) {
            loadCoursesForDepartments(selectedDepartments);
        } else {
             setCourses([]);
        }
    }, [selectedDepartments]);

    const loadInitialData = async () => {
        try {
            const [instData, venuesData] = await Promise.all([
                institutionsApi.getAllInstitutions(),
                venueApi.getAll()
            ]);
            
            setInstitutions(Array.isArray(instData) ? instData : []);
            setVenues(Array.isArray(venuesData) ? venuesData : []);

            // Smart Pre-fill
            if (user?.institution) {
                setSelectedInstitution(user.institution);
                if (user.college) setSelectedCollege(user.college);
                
                if (user.department) {
                    setSelectedDepartments([user.department]);
                    // Only auto-collapse if we have a department. 
                    // But since user might want to add more, maybe don't collapse?
                    // Let's collapse for cleaner default, user can expand to add more.
                    setIsHierarchyExpanded(false); 
                }
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

    const loadCoursesForDepartments = async (deptIds: number[]) => {
        try {
            // Fetch courses for ALL selected departments
            const promises = deptIds.map(id => courseApi.getAll({ department: id }));
            const results = await Promise.all(promises);
            // Flatten and deduplicate by ID
            const allCourses = results.flat();
            const uniqueCourses = Array.from(new Map(allCourses.map(c => [c.id, c])).values());
            setCourses(uniqueCourses);
        } catch (err) { console.error(err); }
    };

    const toggleDepartment = (deptId: number) => {
        setSelectedDepartments(prev => {
            if (prev.includes(deptId)) {
                return prev.filter(id => id !== deptId);
            } else {
                return [...prev, deptId];
            }
        });
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

            const session = await sessionApi.create({
                course: parseInt(selectedCourse),
                venue: parseInt(selectedVenue),
                start_time: new Date().toISOString(),
                end_time: new Date(Date.now() + durationInMinutes * 60000).toISOString(),
                is_active: true
            });

            toast.success('Session created successfully');
            setCreatedSession(session as any);
        } catch (err) {
            console.error(err);
            toast.error('Failed to create session');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
             if (createdSession) {
                 navigate('/dashboard');
             } else {
                 navigate('/dashboard');
             }
        }
    };

    const QuickDurationChip = ({ label, mins }: { label: string, mins: number }) => (
        <button
            type="button"
            onClick={() => { setDuration(mins.toString()); setDurationUnit('minutes'); }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                duration === mins.toString() && durationUnit === 'minutes'
                ? 'bg-primary text-black ring-2 ring-primary/20' 
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
        >
            {label}
        </button>
    );

    const filteredDepartments = departments.filter(d => 
        d.name.toLowerCase().includes(deptSearchTerm.toLowerCase()) || 
        d.code.toLowerCase().includes(deptSearchTerm.toLowerCase())
    );

    // Mobile Layout (matching the dark theme design)
    const mobileLayout = (
        <div className="min-h-screen bg-zinc-950 pb-24" onKeyDown={handleKeyDown}>
            {createdSession && (
                <SessionDetailDialog 
                    session={createdSession as any} 
                    onClose={() => navigate('/dashboard')} 
                />
            )}

            {/* Mobile Header */}
            <div className="flex items-center p-4 border-b border-zinc-800">
                <button 
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-zinc-800 rounded-lg transition-colors mr-3"
                >
                    <ArrowLeft size={24} className="text-white" />
                </button>
                <h1 className="text-xl font-bold text-white">New Attendance Session</h1>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-6">
                {/* Course Selection */}
                <div>
                    <label className="block text-white text-sm font-semibold mb-3">Course Selection</label>
                    <div className="relative">
                        <select
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white text-base outline-none appearance-none pr-10"
                            required
                        >
                            <option value="">Search course...</option>
                            {courses.map(course => (
                                <option key={course.id} value={course.id}>{course.code} - {course.title}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-primary pointer-events-none" size={20} />
                    </div>
                </div>

                {/* Lecture Hall */}
                <div>
                    <label className="block text-white text-sm font-semibold mb-3">Lecture Hall</label>
                    <div className="relative">
                        <select
                            value={selectedVenue}
                            onChange={(e) => setSelectedVenue(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white text-base outline-none appearance-none pr-10"
                            required
                        >
                            <option value="">Select location</option>
                            {venues.map(venue => (
                                <option key={venue.id} value={venue.id}>{venue.name} ({venue.capacity} seats)</option>
                            ))}
                        </select>
                        <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-primary pointer-events-none" size={20} />
                    </div>
                </div>

                {/* Verification Methods */}
                <div>
                    <label className="block text-white text-sm font-semibold mb-3">Verification Methods</label>
                    <div className="space-y-3">
                        {/* QR Code */}
                        <div className="bg-zinc-900 rounded-xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                    <div className="w-6 h-6 grid grid-cols-2 gap-0.5">
                                        <div className="bg-primary rounded-sm"></div>
                                        <div className="bg-primary rounded-sm"></div>
                                        <div className="bg-primary rounded-sm"></div>
                                        <div className="bg-primary rounded-sm"></div>
                                    </div>
                                </div>
                                <span className="text-white font-medium">QR Code</span>
                            </div>
                            <div 
                                onClick={() => setQrCodeEnabled(!qrCodeEnabled)}
                                className={`w-12 h-6 rounded-full p-1 flex transition-colors cursor-pointer ${qrCodeEnabled ? 'bg-primary justify-end' : 'bg-zinc-700 justify-start'}`}
                            >
                                <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                            </div>
                        </div>

                        {/* 8-Digit Code */}
                        <div className="bg-zinc-900 rounded-xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                    <span className="text-primary font-bold text-xs">123</span>
                                </div>
                                <span className="text-white font-medium">8-Digit Code</span>
                            </div>
                            <div 
                                onClick={() => setDigitCodeEnabled(!digitCodeEnabled)}
                                className={`w-12 h-6 rounded-full p-1 flex transition-colors cursor-pointer ${digitCodeEnabled ? 'bg-primary justify-end' : 'bg-zinc-700 justify-start'}`}
                            >
                                <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                            </div>
                        </div>

                        {/* GPS Verification */}
                        <div className="bg-zinc-900 rounded-xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                    <Target size={20} className="text-primary" />
                                </div>
                                <span className="text-white font-medium">GPS Verification</span>
                            </div>
                            <div 
                                onClick={() => setGpsEnabled(!gpsEnabled)}
                                className={`w-12 h-6 rounded-full p-1 flex transition-colors cursor-pointer ${gpsEnabled ? 'bg-primary justify-end' : 'bg-zinc-700 justify-start'}`}
                            >
                                <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Geofence Radius */}
                {gpsEnabled && (
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="block text-white text-sm font-semibold">Geofence Radius</label>
                            <span className="text-primary text-lg font-bold">{geofenceRadius}m</span>
                        </div>
                        <div className="relative">
                            <input
                                type="range"
                                min="50"
                                max="500"
                                step="10"
                                value={geofenceRadius}
                                onChange={(e) => setGeofenceRadius(parseInt(e.target.value))}
                                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer slider-primary"
                                style={{
                                    background: `linear-gradient(to right, #FFD700 0%, #FFD700 ${((geofenceRadius - 50) / 450) * 100}%, #27272a ${((geofenceRadius - 50) / 450) * 100}%, #27272a 100%)`
                                }}
                            />
                            <div className="flex justify-between mt-2 text-xs text-zinc-500">
                                <span>50m</span>
                                <span>500m</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Create Button */}
                <button 
                    type="submit"
                    disabled={loading || !selectedCourse || !selectedVenue}
                    className="w-full bg-primary hover:bg-primary/90 text-black font-bold py-4 rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Creating...' : 'Create Session'}
                </button>
            </form>
        </div>
    );

    // Desktop Layout (unchanged)
    const desktopLayout = (
        <div className="max-w-2xl mx-auto space-y-6 animate-in slide-in-from-right-4 duration-300 pb-12" onKeyDown={handleKeyDown}>
            {createdSession && (
                <SessionDetailDialog 
                    session={createdSession as any} 
                    onClose={() => navigate('/dashboard')} 
                />
            )}
            
            {/* Header */}
            <div className="flex items-center gap-4 mb-2">
                <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} aria-label="Go back">
                    <ArrowLeft size={20} />
                </Button>
                <div>
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Create Session</h2>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* 1. Location / Context Section */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm transition-all duration-300">
                    {/* Collapsed View (Summary) */}
                    {!isHierarchyExpanded && selectedDepartments.length > 0 ? (
                        <div className="p-4 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
                            <div className="flex items-center gap-3">
                                <div className="bg-primary/10 p-2.5 rounded-xl text-primary">
                                    <Building2 size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-zinc-500 uppercase tracking-wide font-bold">Departments</p>
                                    <p className="font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                                        {selectedDepartments.length} Selected
                                    </p>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setIsHierarchyExpanded(true)} type="button" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white">
                                <Edit2 size={14} className="mr-2" /> Change
                            </Button>
                        </div>
                    ) : (
                        /* Expanded View (Form) */
                        <div className="p-6 space-y-5 animate-in slide-in-from-top-2">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="bg-zinc-100 dark:bg-zinc-800 p-2 rounded-lg text-zinc-600 dark:text-zinc-400">
                                        <MapPin size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-zinc-900 dark:text-white">Location Context</h3>
                                        <p className="text-xs text-zinc-500">Where does this course belong?</p>
                                    </div>
                                </div>
                                {selectedDepartments.length > 0 && (
                                    <Button variant="ghost" size="icon" onClick={() => setIsHierarchyExpanded(false)} type="button" className="h-8 w-8 -mt-2 -mr-2 text-zinc-400">
                                        <X size={16} />
                                    </Button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-zinc-500 uppercase mb-1.5">Institution</label>
                                    <div className="relative">
                                        <select
                                            value={selectedInstitution || ''}
                                            onChange={(e) => setSelectedInstitution(e.target.value ? Number(e.target.value) : null)}
                                            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none"
                                        >
                                            <option value="">Select Institution</option>
                                            {institutions.map(inst => (
                                                <option key={inst.id} value={inst.id}>{inst.full_name}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={14} />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-zinc-500 uppercase mb-1.5">College (Optional)</label>
                                    <div className="relative">
                                        <select
                                            value={selectedCollege || ''}
                                            onChange={(e) => setSelectedCollege(e.target.value ? Number(e.target.value) : null)}
                                            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none disabled:opacity-50"
                                            disabled={!selectedInstitution}
                                        >
                                            <option value="">All Colleges</option>
                                            {colleges.map(col => (
                                                <option key={col.id} value={col.id}>{col.name}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={14} />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-xs font-medium text-zinc-500 uppercase">Select Departments</label>
                                    <span className="text-xs text-primary font-medium">{selectedDepartments.length} selected</span>
                                </div>
                                {selectedInstitution ? (
                                    <div className="space-y-3">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                            <input
                                                type="text"
                                                placeholder="Filter departments..."
                                                value={deptSearchTerm}
                                                onChange={(e) => setDeptSearchTerm(e.target.value)}
                                                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                            />
                                        </div>
                                        
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                                            {filteredDepartments.map(dept => {
                                                const isSelected = selectedDepartments.includes(dept.id);
                                                return (
                                                    <div
                                                        key={dept.id}
                                                        onClick={() => toggleDepartment(dept.id)}
                                                        className={`cursor-pointer p-3 rounded-xl border transition-all relative group ${
                                                            isSelected
                                                            ? 'bg-primary/10 border-primary shadow-sm' 
                                                            : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                                                        }`}
                                                    >
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h4 className={`font-semibold text-sm ${isSelected ? 'text-primary' : 'text-zinc-900 dark:text-white'}`}>{dept.name}</h4>
                                                                <p className="text-xs opacity-70 font-mono mt-0.5">{dept.code}</p>
                                                            </div>
                                                            {isSelected && (
                                                                <div className="bg-primary text-black rounded-full p-0.5">
                                                                    <Check size={12} strokeWidth={3} />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            {filteredDepartments.length === 0 && (
                                                <div className="col-span-full text-center py-6 text-zinc-500 text-sm italic bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
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
                    )}
                </div>

                {/* 2. Core Session Details */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-zinc-900 dark:text-white mb-2">Select Course</label>
                        <div className="relative">
                            <select
                                value={selectedCourse}
                                onChange={(e) => setSelectedCourse(e.target.value)}
                                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-base outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none disabled:opacity-50 transition-all"
                                disabled={selectedDepartments.length === 0}
                                required
                            >
                                <option value="">Select a course...</option>
                                {courses.map(course => (
                                    <option key={course.id} value={course.id}>{course.code} - {course.title}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={20} />
                        </div>
                        {selectedDepartments.length === 0 && <p className="text-xs text-amber-500 mt-2 flex items-center gap-1"><AlertCircle size={12}/> Please select at least one department above first.</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-zinc-900 dark:text-white mb-2">Venue</label>
                            <div className="relative">
                                <select
                                    value={selectedVenue}
                                    onChange={(e) => setSelectedVenue(e.target.value)}
                                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none"
                                    required
                                >
                                    <option value="">Select venue...</option>
                                    {venues.map(venue => (
                                        <option key={venue.id} value={venue.id}>{venue.name} ({venue.capacity} seats)</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={16} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-zinc-900 dark:text-white mb-2">Duration</label>
                            <div className="flex gap-2 mb-2">
                                <div className="relative flex-1">
                                    <Input 
                                        type="number" 
                                        min="1"
                                        className="w-full" 
                                        placeholder="60" 
                                        value={duration} 
                                        onChange={e => setDuration(e.target.value)} 
                                        required 
                                    />
                                </div>
                                <div className="relative w-28">
                                    <select 
                                        className="w-full h-[42px] bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 text-sm focus:ring-primary focus:border-primary outline-none appearance-none"
                                        value={durationUnit}
                                        onChange={(e) => setDurationUnit(e.target.value as any)}
                                    >
                                        <option value="minutes">Mins</option>
                                        <option value="hours">Hours</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={14} />
                                </div>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                <QuickDurationChip label="45m" mins={45} />
                                <QuickDurationChip label="1h" mins={60} />
                                <QuickDurationChip label="1.5h" mins={90} />
                                <QuickDurationChip label="2h" mins={120} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Bar */}
                <div className="sticky bottom-4 z-10">
                     <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-lg border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl shadow-xl flex items-center justify-between gap-4">
                        <div className="hidden sm:block">
                            <p className="text-sm font-medium text-zinc-900 dark:text-white">Ready to start?</p>
                            <p className="text-xs text-zinc-500">Students can join immediately.</p>
                        </div>
                        <div className="flex gap-3 w-full sm:w-auto">
                            <Button variant="secondary" className="flex-1 sm:flex-none" onClick={() => navigate('/dashboard')} type="button">
                                Cancel
                            </Button>
                            <Button type="submit" className="flex-1 sm:flex-none min-w-[140px]" disabled={loading}>
                                {loading ? 'Starting...' : 'Create Session'}
                            </Button>
                        </div>
                     </div>
                </div>

            </form>
        </div>
    );

    return (
        <>
        <SEO
          title="Create Attendance Session | Lecturer Dashboard"
          description="Create a new attendance session for your course. Students can check in via QR code or session code on Presently."
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