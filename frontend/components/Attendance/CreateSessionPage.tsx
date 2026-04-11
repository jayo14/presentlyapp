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
import { Switch } from '../Switch';

const AccessibleCombobox = ({
    value,
    onChange,
    options,
    placeholder,
    className = ""
}: {
    value: string;
    onChange: (val: string) => void;
    options: { value: string; label: string }[];
    placeholder: string;
    className?: string;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [activeIndex, setActiveIndex] = useState(-1);
    const containerRef = React.useRef<HTMLDivElement>(null);

    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(search.toLowerCase())
    );

    const selectedLabel = options.find(opt => opt.value === value)?.label || '';

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
                setSearch('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen && e.key === 'ArrowDown') {
            setIsOpen(true);
            return;
        }

        if (!isOpen) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setActiveIndex(prev => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setActiveIndex(prev => (prev > 0 ? prev - 1 : prev));
                break;
            case 'Enter':
                e.preventDefault();
                if (activeIndex >= 0 && activeIndex < filteredOptions.length) {
                    onChange(filteredOptions[activeIndex].value);
                    setIsOpen(false);
                    setSearch('');
                }
                break;
            case 'Escape':
                setIsOpen(false);
                break;
        }
    };

    return (
        <div ref={containerRef} className="relative w-full">
            <div
                role="combobox"
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                aria-owns="venue-listbox"
                className="w-full relative"
            >
                <input
                    type="text"
                    className={`w-full bg-surfaceLow border border-outline rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary pr-10 appearance-none ${className}`}
                    placeholder={value ? selectedLabel : placeholder}
                    value={isOpen ? search : selectedLabel}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setIsOpen(true);
                        setActiveIndex(0);
                    }}
                    onClick={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    aria-autocomplete="list"
                    aria-controls="venue-listbox"
                    aria-label={placeholder}
                    aria-activedescendant={activeIndex >= 0 ? `venue-option-${activeIndex}` : undefined}
                />
                <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 text-textMuted pointer-events-none transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} size={16} />
            </div>

            {isOpen && (
                <ul
                    id="venue-listbox"
                    role="listbox"
                    className="absolute z-50 w-full mt-2 max-h-60 overflow-auto bg-surface border border-outline rounded-xl shadow-2xl p-2"
                >
                    {filteredOptions.length === 0 ? (
                        <li className="p-3 text-sm text-textMuted text-center font-medium">No venues found</li>
                    ) : (
                        filteredOptions.map((opt, index) => (
                            <li
                                key={opt.value}
                                id={`venue-option-${index}`}
                                role="option"
                                aria-selected={value === opt.value}
                                className={`p-3 text-sm rounded-lg cursor-pointer flex items-center justify-between transition-colors ${
                                    index === activeIndex ? 'bg-primary/10 text-primary' : 'hover:bg-surfaceLow text-text'
                                }`}
                                onClick={() => {
                                    onChange(opt.value);
                                    setIsOpen(false);
                                    setSearch('');
                                }}
                                onMouseEnter={() => setActiveIndex(index)}
                            >
                                <span className={value === opt.value ? 'font-bold' : 'font-medium'}>{opt.label}</span>
                                {value === opt.value && <Check size={16} className="text-primary" />}
                            </li>
                        ))
                    )}
                </ul>
            )}
        </div>
    );
};

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
            const promises: Promise<any>[] = [
                institutionsApi.getAllInstitutions(),
                venueApi.getAll()
            ];

            if (user?.id) {
                // Fetch the lecturer's own courses automatically regardless of department
                // Assuming user.id handles the string to ID internally on the backend
                promises.push(courseApi.getAll({ lecturer: parseInt(user.id) || user.id as any }));
            }

            const results = await Promise.all(promises);
            const instData = results[0];
            const venuesData = results[1];
            const lecturerCourses = results[2] || [];

            setInstitutions(Array.isArray(instData) ? instData : []);
            setVenues(Array.isArray(venuesData) ? venuesData : []);
            
            if (Array.isArray(lecturerCourses) && lecturerCourses.length > 0) {
                setCourses(lecturerCourses);
            }

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
            const promises: Promise<Course[]>[] = deptIds.map(id => courseApi.getAll({ department: id }));
            
            if (user?.id) {
                promises.push(courseApi.getAll({ lecturer: parseInt(user.id) || user.id as any }));
            }
            
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
                {/* Course Selection */}
                <div>
                    <label className="block text-text text-sm font-semibold mb-3">Course Selection</label>
                    <div className="relative">
                        <select
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                            className="w-full bg-surface border border-outline rounded-xl p-4 text-text text-base outline-none appearance-none pr-10"
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
                <div className="relative z-10">
                    <label className="block text-text text-sm font-semibold mb-3">Lecture Hall</label>
                    <AccessibleCombobox
                        value={selectedVenue}
                        onChange={setSelectedVenue}
                        options={venues.map(v => ({ value: v.id.toString(), label: `${v.name} (${v.capacity || 0} seats)` }))}
                        placeholder="Select location..."
                        className="py-4 text-base"
                    />
                </div>

                {/* Verification Methods */}
                {/* <div>
                    <label className="block text-text text-sm font-semibold mb-3">Verification Methods</label>
                    <div className="space-y-3">

                        <div className="bg-surface rounded-xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                    <div className="w-6 h-6 grid grid-cols-2 gap-0.5">
                                        <div className="bg-primary rounded-sm"></div>
                                        <div className="bg-primary rounded-sm"></div>
                                        <div className="bg-primary rounded-sm"></div>
                                        <div className="bg-primary rounded-sm"></div>
                                    </div>
                                </div>
                                <span className="text-text font-medium">QR Code</span>
                            </div>
                            <Switch checked={qrCodeEnabled} onCheckedChange={setQrCodeEnabled} />
                        </div>


                        <div className="bg-surface rounded-xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                    <span className="text-primary font-bold text-xs">123</span>
                                </div>
                                <span className="text-text font-medium">8-Digit Code</span>
                            </div>
                            <Switch checked={digitCodeEnabled} onCheckedChange={setDigitCodeEnabled} />
                        </div>


                        <div className="bg-surface rounded-xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                    <Target size={20} className="text-primary" />
                                </div>
                                <span className="text-text font-medium">GPS Verification</span>
                            </div>
                            <Switch checked={gpsEnabled} onCheckedChange={setGpsEnabled} />
                        </div>
                    </div>
                </div> */}

                {/* Geofence Radius */}
                {/* {gpsEnabled && (
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="block text-text text-sm font-semibold">Geofence Radius</label>
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
                                className="w-full h-2 bg-surfaceHigh rounded-lg appearance-none cursor-pointer slider-primary"
                                style={{
                                    background: `linear-gradient(to right, #FFD700 0%, #FFD700 ${((geofenceRadius - 50) / 450) * 100}%, #27272a ${((geofenceRadius - 50) / 450) * 100}%, #27272a 100%)`
                                }}
                            />
                            <div className="flex justify-between mt-2 text-xs text-textMuted">
                                <span>50m</span>
                                <span>500m</span>
                            </div>
                        </div>
                    </div>
                )} */}

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
                                            className="w-full bg-surfaceLow border border-outline rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none"
                                        >
                                            <option value="">Select Institution</option>
                                            {institutions.map(inst => (
                                                <option key={inst.id} value={inst.id}>{inst.full_name}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted pointer-events-none" size={14} />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-textMuted uppercase mb-1.5">College (Optional)</label>
                                    <div className="relative">
                                        <select
                                            value={selectedCollege || ''}
                                            onChange={(e) => setSelectedCollege(e.target.value ? Number(e.target.value) : null)}
                                            className="w-full bg-surfaceLow border border-outline rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none disabled:opacity-50"
                                            disabled={!selectedInstitution}
                                        >
                                            <option value="">All Colleges</option>
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
                                    <span className="text-xs text-primary font-medium">{selectedDepartments.length} selected</span>
                                </div>
                                {selectedInstitution ? (
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
                                        Please select an institution first to view departments.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* 2. Core Session Details */}
                <div className="bg-surface text-text border border-outline rounded-2xl p-6 shadow-sm space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-text mb-2">Select Course</label>
                        <div className="relative">
                            <select
                                value={selectedCourse}
                                onChange={(e) => setSelectedCourse(e.target.value)}
                                className="w-full bg-surfaceLow border border-outline rounded-xl p-4 text-base outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none disabled:opacity-50 transition-all"
                                disabled={selectedDepartments.length === 0}
                                required
                            >
                                <option value="">Select a course...</option>
                                {courses.map(course => (
                                    <option key={course.id} value={course.id}>{course.code} - {course.title}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-textMuted pointer-events-none" size={20} />
                        </div>
                        {selectedDepartments.length === 0 && <p className="text-xs text-muted-foregroundmber-500 mt-2 flex items-center gap-1"><AlertCircle size={12} /> Please select at least one department above first.</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="relative z-10">
                            <label className="block text-sm font-bold text-text mb-2">Venue</label>
                            <AccessibleCombobox
                                value={selectedVenue}
                                onChange={setSelectedVenue}
                                options={venues.map(v => ({ value: v.id.toString(), label: `${v.name} (${v.capacity || 0} seats)` }))}
                                placeholder="Select venue..."
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

                {/* 3. Verification Methods (Desktop) comment block removed */}

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

            </form >
        </div >
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