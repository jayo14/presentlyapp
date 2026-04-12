import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
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
import { Switch } from '../Switch';
import { AccessibleCombobox } from '../AccessibleCombobox';

const EMPTY_COURSES: Course[] = [];

export const CreateSessionPage: React.FC = () => {
    const navigate = useNavigate();
    const { data: user } = useCurrentUser();

    // Data State (Institutions and Venues are handled by React Query)
    const [colleges, setColleges] = useState<College[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);

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

    // Data Preloading via React Query
    const { data: institutions = [], isLoading: loadingInstitutions } = useQuery({
        queryKey: ['institutions'],
        queryFn: async () => {
            const data = await institutionsApi.getAllInstitutions();
            return Array.isArray(data) ? data : [];
        },
        staleTime: 10 * 60 * 1000
    });

    const { data: venues = [], isLoading: loadingVenues } = useQuery({
        queryKey: ['venues'],
        queryFn: async () => {
            const data = await venueApi.getAll();
            return Array.isArray(data) ? data : [];
        },
        staleTime: 10 * 60 * 1000
    });

    const { data: lecturerCoursesRaw, isLoading: loadingLecturerCourses } = useQuery({
        queryKey: ['lecturerCourses'],
        queryFn: async () => {
            // Fetch all courses for this lecturer
            const data = await courseApi.getAll();
            return Array.isArray(data) ? data : [];
        },
        staleTime: 5 * 60 * 1000
    });
    const lecturerCourses = lecturerCoursesRaw || EMPTY_COURSES;

    // Initial Load & Defaults
    useEffect(() => {
        // Smart Pre-fill from fetched profile
        if (user?.institution && !selectedInstitution) {
            setSelectedInstitution(user.institution);
            if (user.college) setSelectedCollege(user.college);
            if (user.department) {
                setSelectedDepartments([user.department]);
                setIsHierarchyExpanded(false);
            }
        }
    }, [user, selectedInstitution]);

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
        } else {
            setDepartments([]);
        }
        setSelectedDepartments([]);
    }, [selectedCollege]);

    useEffect(() => {
        if (selectedDepartments.length > 0) {
            loadCoursesForDepartments(selectedDepartments);
        } else if (courses !== lecturerCourses) {
            // Only set if they are not already effectively the same reference or data
            setCourses(lecturerCourses);
        }
    }, [selectedDepartments, lecturerCourses]);



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

    const selectAllDepartments = () => {
        setSelectedDepartments(filteredDepartments.map(d => d.id));
    };

    const deselectAllDepartments = () => {
        setSelectedDepartments([]);
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
                is_active: true,
                location_radius: gpsEnabled ? geofenceRadius : undefined,
                qr_enabled: qrCodeEnabled,
                digit_enabled: digitCodeEnabled,
                gps_enabled: gpsEnabled
            } as any);

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
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${duration === mins.toString() && durationUnit === 'minutes'
                ? 'bg-primary text-black ring-2 ring-primary/20'
                : 'bg-inputccent text-muted-foreground hover:bg-zinc-200 dark:hover:bg-surfaceHigh'
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
        <div className="min-h-screen bg-background pb-24" onKeyDown={handleKeyDown}>
            {createdSession && (
                <SessionDetailDialog
                    session={createdSession as any}
                    onClose={() => navigate('/dashboard')}
                />
            )}

            {/* Mobile Header */}
            <div className="flex items-center p-4 border-b border-outline">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-surfaceHigh rounded-lg transition-colors mr-3"
                >
                    <ArrowLeft size={24} className="text-text" />
                </button>
                <h1 className="font-headline text-xl font-bold text-text">New Attendance Session</h1>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-6">
                {/* Location Hierarchy */}
                <div className="bg-surfaceLow/30 border border-outline rounded-2xl p-4 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <MapPin size={18} className="text-primary" />
                        <h3 className="font-semibold text-text">Location Context</h3>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-textMuted uppercase mb-1">Institution</label>
                        <Input
                            value={institutions.find(i => i.id === selectedInstitution)?.full_name || 'Loading...'}
                            readOnly
                            className="bg-surface border-outline/50 opacity-80"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-textMuted uppercase mb-1">College</label>
                        <select
                            value={selectedCollege || ''}
                            onChange={(e) => setSelectedCollege(e.target.value ? Number(e.target.value) : null)}
                            className="w-full bg-surface border border-outline rounded-xl p-3 text-text text-sm outline-none appearance-none pr-10"
                            required
                        >
                            <option value="">Select College</option>
                            {colleges.map(col => (
                                <option key={col.id} value={col.id}>{col.name}</option>
                            ))}
                        </select>
                    </div>

                    {selectedCollege && (
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-[10px] font-bold text-textMuted uppercase">Departments</label>
                                <button
                                    type="button"
                                    onClick={selectedDepartments.length === filteredDepartments.length ? deselectAllDepartments : selectAllDepartments}
                                    className="text-[10px] font-bold text-primary px-2 py-1 bg-primary/10 rounded-lg"
                                >
                                    {selectedDepartments.length === filteredDepartments.length ? 'Deselect All' : 'Select All'}
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pt-1">
                                {filteredDepartments.map(dept => {
                                    const isSelected = selectedDepartments.includes(dept.id);
                                    return (
                                        <button
                                            key={dept.id}
                                            type="button"
                                            onClick={() => toggleDepartment(dept.id)}
                                            className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all ${isSelected
                                                ? 'bg-primary border-primary text-black'
                                                : 'bg-surface border-outline text-textMuted'
                                                }`}
                                        >
                                            {dept.code}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Course Selection */}
                <div>
                    <label className="block text-text text-sm font-semibold mb-3">Course Selection</label>
                    <div className="relative">
                        <select
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                            className="w-full bg-surface border border-outline rounded-xl p-4 text-text text-base outline-none appearance-none pr-10"
                            required
                            disabled={selectedDepartments.length === 0}
                        >
                            <option value="">{selectedDepartments.length === 0 ? 'Select departments first' : 'Select course...'}</option>
                            {courses.map(course => (
                                <option key={course.id} value={course.id}>{course.code} - {course.title}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-primary pointer-events-none" size={20} />
                    </div>
                </div>

                {/* Lecture Hall */}
                <div>
                    <label className="block text-text text-sm font-semibold mb-3">Lecture Hall</label>
                    <div className="relative">
                        <select
                            value={selectedVenue}
                            onChange={(e) => setSelectedVenue(e.target.value)}
                            className="w-full bg-surface border border-outline rounded-xl p-4 text-text text-base outline-none appearance-none pr-10"
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
                    <h2 className="font-headline text-2xl font-bold text-text">Create Session</h2>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* 1. Location / Context Section */}
                <div className="bg-surface text-text border border-outline rounded-2xl overflow-hidden shadow-sm transition-all duration-300">
                    {/* Collapsed View (Summary) */}
                    {!isHierarchyExpanded && selectedDepartments.length > 0 ? (
                        <div className="p-4 flex items-center justify-between bg-surfaceLow/50">
                            <div className="flex items-center gap-3">
                                <div className="bg-primary/10 p-2.5 rounded-xl text-primary">
                                    <Building2 size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-textMuted uppercase tracking-wide font-bold">Departments</p>
                                    <p className="font-semibold text-text flex items-center gap-2">
                                        {selectedDepartments.length} Selected
                                    </p>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setIsHierarchyExpanded(true)} type="button" className="text-textMuted hover:text-text">
                                <Edit2 size={14} className="mr-2" /> Change
                            </Button>
                        </div>
                    ) : (
                        /* Expanded View (Form) */
                        <div className="p-6 space-y-5 animate-in slide-in-from-top-2">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="bg-surfaceLow p-2 rounded-lg text-textMuted">
                                        <MapPin size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-headline font-semibold text-text">Location Context</h3>
                                        <p className="text-xs text-textMuted">Where does this course belong?</p>
                                    </div>
                                </div>
                                {selectedDepartments.length > 0 && (
                                    <Button variant="ghost" size="icon" onClick={() => setIsHierarchyExpanded(false)} type="button" className="h-8 w-8 -mt-2 -mr-2 text-textMuted">
                                        <X size={16} />
                                    </Button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-textMuted uppercase mb-1.5">Institution</label>
                                    <div className="relative">
                                        <select
                                            value={selectedInstitution || ''}
                                            onChange={(e) => setSelectedInstitution(e.target.value ? Number(e.target.value) : null)}
                                            className="w-full bg-surfaceLow/50 border border-outline rounded-lg p-2.5 text-sm outline-none cursor-not-allowed opacity-80 appearance-none"
                                            disabled={true}
                                        >
                                            <option value="">{loadingInstitutions ? 'Loading...' : 'Select Institution'}</option>
                                            {institutions.map(inst => (
                                                <option key={inst.id} value={inst.id}>{inst.full_name}</option>
                                            ))}
                                        </select>
                                        <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted/50 pointer-events-none" size={14} />
                                    </div>
                                    <p className="text-[10px] text-textMuted mt-1 flex items-center gap-1">
                                        <CheckCircle2 size={10} className="text-primary" /> Auto-fetched from your profile
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-textMuted uppercase mb-1.5">College</label>
                                    <div className="relative">
                                        <select
                                            value={selectedCollege || ''}
                                            onChange={(e) => setSelectedCollege(e.target.value ? Number(e.target.value) : null)}
                                            className="w-full bg-surfaceLow border border-outline rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none disabled:opacity-50"
                                            disabled={!selectedInstitution}
                                            required
                                        >
                                            <option value="">Select College</option>
                                            {colleges.map(col => (
                                                <option key={col.id} value={col.id}>{col.name}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted pointer-events-none" size={14} />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-xs font-medium text-textMuted uppercase">Select Departments</label>
                                    <div className="flex items-center gap-2">
                                        {departments.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={selectedDepartments.length === filteredDepartments.length ? deselectAllDepartments : selectAllDepartments}
                                                className="text-[10px] font-bold uppercase tracking-wider text-primary hover:text-primary/80 transition-colors bg-primary/5 px-2 py-1 rounded-md border border-primary/20"
                                            >
                                                {selectedDepartments.length === filteredDepartments.length ? 'Deselect All' : 'Select All'}
                                            </button>
                                        )}
                                        <span className="text-xs text-textMuted font-medium">{selectedDepartments.length} selected</span>
                                    </div>
                                </div>
                                {selectedCollege ? (
                                    <div className="space-y-3">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={16} />
                                            <input
                                                type="text"
                                                placeholder="Filter departments..."
                                                value={deptSearchTerm}
                                                onChange={(e) => setDeptSearchTerm(e.target.value)}
                                                className="w-full bg-surfaceLow border border-outline rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                                            {filteredDepartments.map(dept => {
                                                const isSelected = selectedDepartments.includes(dept.id);
                                                return (
                                                    <div
                                                        key={dept.id}
                                                        onClick={() => toggleDepartment(dept.id)}
                                                        className={`cursor-pointer p-3 rounded-xl border transition-all relative group ${isSelected
                                                            ? 'bg-primary/10 border-primary shadow-sm'
                                                            : 'bg-zinc-50 dark:bg-zinc-950 border-border hover:border-zinc-300 dark:hover:border-outline'
                                                            }`}
                                                    >
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h4 className={`font-headline font-semibold text-sm ${isSelected ? 'text-primary' : 'text-foreground'}`}>{dept.name}</h4>
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
                                                <div className="col-span-full text-center py-6 text-textMuted text-sm italic bg-surfaceLow rounded-xl border border-dashed border-outline">
                                                    No departments found.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-surfaceLow border border-dashed border-outline rounded-lg p-6 text-center text-textMuted text-sm">
                                        Please select a college first to view departments.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* 2. Core Session Details */}
                <div className="bg-surface text-text border border-outline rounded-2xl p-6 shadow-sm space-y-6">
                    <div>
                        <AccessibleCombobox
                            id="course-selection"
                            label="Select Course"
                            placeholder="Search course code or title..."
                            options={courses.map(c => ({
                                id: c.id,
                                name: `${c.code} - ${c.title}`,
                                description: c.department_name || ''
                            }))}
                            value={selectedCourse}
                            onChange={(val) => setSelectedCourse(val.toString())}
                            required
                        />
                        {selectedDepartments.length === 0 && courses.length === 0 && (
                            <p className="text-xs text-muted-foregroundmber-500 mt-2 flex items-center gap-1">
                                <AlertCircle size={12} /> Please select at least one department above first or check your teaching profile.
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-1">
                            <AccessibleCombobox
                                id="venue-selection"
                                label="Lecture Hall"
                                placeholder="Search location..."
                                options={venues.map(v => ({
                                    id: v.id,
                                    name: v.name,
                                    description: `${v.capacity} seats • ${v.code || ''}`
                                }))}
                                value={selectedVenue}
                                onChange={(val) => setSelectedVenue(val.toString())}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-text mb-2">Duration</label>
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
                                        className="w-full h-[42px] bg-surfaceLow border border-outline rounded-lg px-3 text-sm focus:ring-primary focus:border-primary outline-none appearance-none"
                                        value={durationUnit}
                                        onChange={(e) => setDurationUnit(e.target.value as any)}
                                    >
                                        <option value="minutes">Mins</option>
                                        <option value="hours">Hours</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted pointer-events-none" size={14} />
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
                    <div className="bg-surface/80 backdrop-blur-lg border border-outline p-4 rounded-2xl shadow-xl flex items-center justify-between gap-4">
                        <div className="hidden sm:block">
                            <p className="text-sm font-medium text-text">Ready to start?</p>
                            <p className="text-xs text-textMuted">Students can join immediately.</p>
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