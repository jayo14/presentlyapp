import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, Filter, Download, ChevronDown, CheckCircle2, XCircle, 
  Clock, AlertCircle, BookOpen, Calendar, User, ArrowUpDown, TrendingUp, TrendingDown, MapPin, Building2, FileText, FileSpreadsheet, UserPlus, X
} from 'lucide-react';
import { Button } from '../Button';
import { Input } from '../Input';
import { courseApi, sessionApi, attendanceApi, Attendance, AttendanceSession } from '../../services/api/attendance';
import { analyticsApi, CourseAttendanceAnalytics, StudentAnalytics } from '../../services/api/analytics';
import { dashboardApi } from '../../services/api/dashboard';
import { Course as CourseType } from '../../types';
import { toast } from 'sonner';
import { Sheet } from '../Sheet';

export const AttendanceReport: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Data State
  const [courses, setCourses] = useState<CourseType[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(
    searchParams.get('courseId') ? Number(searchParams.get('courseId')) : null
  );
  
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(
    searchParams.get('sessionId') ? Number(searchParams.get('sessionId')) : null
  );

  const [analyticsData, setAnalyticsData] = useState<CourseAttendanceAnalytics | null>(null);
  const [sessionAttendance, setSessionAttendance] = useState<Attendance[]>([]);
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'good' | 'at_risk'>('ALL');
  const [selectedDept, setSelectedDepartment] = useState<string>('ALL');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showManualMarkModal, setShowManualMarkModal] = useState(false);
  const [manualMatric, setManualMatric] = useState('');
  const [markingManual, setMarkingManual] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      loadCourseData(selectedCourseId);
      setSearchParams({ courseId: selectedCourseId.toString() });
    } else {
        setAnalyticsData(null);
        setSessions([]);
    }
  }, [selectedCourseId]);

  useEffect(() => {
    if (selectedSessionId) {
      loadSessionAttendance(selectedSessionId);
      setSearchParams(prev => {
          const next = new URLSearchParams(prev);
          next.set('sessionId', selectedSessionId.toString());
          return next;
      });
    } else {
        setSessionAttendance([]);
        if (selectedCourseId) {
            setSearchParams({ courseId: selectedCourseId.toString() });
        }
    }
  }, [selectedSessionId]);

  const loadCourses = async () => {
    try {
      setLoadingCourses(true);
      const data = await courseApi.getAll();
      const courseList = Array.isArray(data) ? data : [];
      setCourses(courseList);
      
      if (courseList.length > 0 && !selectedCourseId) {
        setSelectedCourseId(courseList[0].id);
      }
    } catch (err) {
      console.error('Failed to load courses', err);
      toast.error('Failed to load courses');
    } finally {
      setLoadingCourses(false);
    }
  };

  const loadCourseData = async (courseId: number) => {
    try {
      setLoading(true);
      setLoadingSessions(true);
      
      const [analytics, sessionList] = await Promise.all([
        analyticsApi.getCourseAttendance(courseId),
        sessionApi.getAll({ course: courseId })
      ]);
      
      setAnalyticsData(analytics);
      setSessions(Array.isArray(sessionList) ? sessionList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) : []);
      
    } catch (err) {
      console.error('Failed to load course data', err);
      toast.error('Failed to load attendance report');
    } finally {
      setLoading(false);
      setLoadingSessions(false);
    }
  };

  const loadSessionAttendance = async (sessionId: number) => {
    try {
      setLoading(true);
      const data = await attendanceApi.getAll({ session: sessionId });
      setSessionAttendance(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load session attendance', err);
      toast.error('Failed to load session records');
    } finally {
      setLoading(false);
    }
  };

  // Derived Data: Departments
  const availableDepartments = useMemo(() => {
    const depts = new Set<string>();
    if (selectedSessionId) {
      sessionAttendance.forEach(r => depts.add(r.student_department || 'Unspecified'));
    } else {
      analyticsData?.students.forEach(s => depts.add(s.department || 'Unspecified'));
    }
    return Array.from(depts).filter(d => d !== 'N/A').sort();
  }, [selectedSessionId, sessionAttendance, analyticsData]);

  // Filter Logic
  const filteredData = useMemo(() => {
    if (selectedSessionId) {
      return sessionAttendance.filter(record => {
        const matchesSearch = 
          (record.student_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
          (record.student_matric || '').toLowerCase().includes(searchTerm.toLowerCase());
        const dept = record.student_department || 'Unspecified';
        const matchesDept = selectedDept === 'ALL' || dept === selectedDept;
        return matchesSearch && matchesDept;
      });
    } else {
      return analyticsData?.students.filter(student => {
        const matchesSearch = 
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
          student.matric.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = 
          statusFilter === 'ALL' ? true :
          statusFilter === 'good' ? student.percentage >= 75 :
          student.percentage < 75;
        const dept = student.department || 'Unspecified';
        const matchesDept = selectedDept === 'ALL' || dept === selectedDept;
        return matchesSearch && matchesStatus && matchesDept;
      }) || [];
    }
  }, [selectedSessionId, sessionAttendance, analyticsData, searchTerm, statusFilter, selectedDept]);

  // Grouped Data
  const groupedData = useMemo(() => {
    const groups: { [key: string]: any[] } = {};
    filteredData.forEach(item => {
      const dept = (selectedSessionId ? (item as Attendance).student_department : (item as StudentAnalytics).department) || 'Unspecified';
      const cleanDept = dept === 'N/A' ? 'Unspecified' : dept;
      if (!groups[cleanDept]) groups[cleanDept] = [];
      groups[cleanDept].push(item);
    });
    return groups;
  }, [filteredData, selectedSessionId]);

  const handleExport = () => {
    const isSessionReport = !!selectedSessionId;
    const session = sessions.find(s => s.id === selectedSessionId);
    
    let headers: string[] = [];
    let rows: any[][] = [];
    let fileName = '';

    if (isSessionReport && session) {
        headers = ['Matric Number', 'Student Name', 'Department', 'Status', 'Checked-in Time', 'Distance (m)', 'Date'];
        rows = (filteredData as Attendance[]).map(r => [
            r.student_matric,
            r.student_name,
            r.student_department || 'N/A',
            r.status,
            new Date(r.checked_in_at).toLocaleTimeString(),
            r.distance_from_venue || 0,
            new Date(session.created_at).toLocaleDateString()
        ]);
        fileName = `${analyticsData?.course_code}_Session_${new Date(session.created_at).toISOString().split('T')[0]}_Report.csv`;
    } else {
        headers = ['Matric Number', 'Student Name', 'Department', 'Attended', 'Total', 'Percentage', 'Report Generated'];
        rows = (filteredData as StudentAnalytics[]).map(s => [
            s.matric,
            s.name,
            s.department,
            s.attended,
            s.total,
            `${s.percentage}%`,
            new Date().toLocaleDateString()
        ]);
        fileName = `${analyticsData?.course_code}_Overall_Attendance_Report.csv`;
    }
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleServerExport = async (format: 'csv' | 'excel' | 'pdf') => {
    if (!selectedCourseId) return;
    const toastId = toast.loading(`Generating ${format.toUpperCase()} report...`);
    try {
      const blob = await dashboardApi.exportAttendance(format, selectedCourseId);
      const ext = format === 'excel' ? 'xlsx' : format;
      const fileName = `${analyticsData?.course_code || 'attendance'}_report.${ext}`;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success(`${format.toUpperCase()} report downloaded!`, { id: toastId });
    } catch (err) {
      console.error(`Failed to export ${format}:`, err);
      toast.error(`Failed to generate ${format.toUpperCase()} report`, { id: toastId });
    }
    setShowExportMenu(false);
  };

  const handleManualMark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSessionId || !manualMatric) {
      toast.error('Please enter a matric number');
      return;
    }
    
    try {
      setMarkingManual(true);
      await dashboardApi.manualMark(selectedSessionId, manualMatric, 'PRESENT');
      toast.success(`Student (${manualMatric}) marked as present`);
      setManualMatric('');
      setShowManualMarkModal(false);
      loadSessionAttendance(selectedSessionId);
    } catch (err: any) {
      console.error('Manual mark error:', err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to mark student';
      toast.error(errorMsg);
    } finally {
      setMarkingManual(false);
    }
  };

  if (loadingCourses) {
    return (
        <div className="flex flex-col items-center justify-center h-64 text-textMuted">
            <div className="w-8 h-8 border-outline border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            Loading courses...
        </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* 1. Header & Course/Session/Dept Selectors */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 border-b border-outline pb-6">
        <div className="min-w-0 flex-1">
          <h2 className="font-headline text-2xl font-bold text-text truncate">Attendance Reports</h2>
          <p className="text-textMuted text-sm">View and export detailed attendance logs.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto">
            {/* Course Select */}
            <div className="relative flex-1 sm:w-56">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted z-10 pointer-events-none">
                    <BookOpen size={16} />
                </div>
                <select
                    value={selectedCourseId || ''}
                    onChange={(e) => {
                        setSelectedCourseId(Number(e.target.value));
                        setSelectedSessionId(null);
                        setSelectedDepartment('ALL');
                    }}
                    className="w-full bg-surface text-text border border-outline rounded-xl pl-10 pr-10 py-2.5 appearance-none text-text text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
                >
                    {courses.map(course => (
                        <option key={course.id} value={course.id}>{course.code}</option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted pointer-events-none" size={16} />
            </div>

            {/* Session Select */}
            <div className="relative flex-1 sm:w-64">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted z-10 pointer-events-none">
                    <Calendar size={16} />
                </div>
                <select
                    value={selectedSessionId || ''}
                    onChange={(e) => {
                        setSelectedSessionId(e.target.value ? Number(e.target.value) : null);
                        setSelectedDepartment('ALL');
                    }}
                    className="w-full bg-surface text-text border border-outline rounded-xl pl-10 pr-10 py-2.5 appearance-none text-text text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm disabled:opacity-50"
                    disabled={loadingSessions}
                >
                    <option value="">All Sessions</option>
                    {sessions.map(s => (
                        <option key={s.id} value={s.id}>
                            {new Date(s.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - {new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted pointer-events-none" size={16} />
            </div>

            {/* Department Select */}
            <div className="relative flex-1 sm:w-56">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted z-10 pointer-events-none">
                    <Building2 size={16} />
                </div>
                <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="w-full bg-surface text-text border border-outline rounded-xl pl-10 pr-10 py-2.5 appearance-none text-text text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
                >
                    <option value="ALL">All Departments</option>
                    {availableDepartments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted pointer-events-none" size={16} />
            </div>

            {analyticsData && (
                <div className="relative">
                    <Button 
                        variant="secondary" 
                        onClick={() => setShowExportMenu(!showExportMenu)} 
                        className="gap-2 h-11 px-6 rounded-xl" 
                        title="Export Report"
                    >
                        <Download size={18} />
                        <span>Export</span>
                        <ChevronDown size={14} />
                    </Button>
                    {showExportMenu && (
                        <div className="absolute right-0 top-full mt-2 bg-surface text-text border border-outline rounded-xl shadow-xl z-50 w-48 py-1 animate-in fade-in slide-in-from-top-1 duration-200">
                            <button 
                                onClick={() => { handleExport(); setShowExportMenu(false); }}
                                className="w-full px-4 py-2.5 text-left text-sm font-medium text-textMuted hover:bg-surfaceHigh hover:text-text flex items-center gap-3 transition-colors"
                            >
                                <Download size={16} className="text-green-500" />
                                CSV (Client)
                            </button>
                            <button 
                                onClick={() => handleServerExport('csv')}
                                className="w-full px-4 py-2.5 text-left text-sm font-medium text-textMuted hover:bg-surfaceHigh hover:text-text flex items-center gap-3 transition-colors"
                            >
                                <Download size={16} className="text-blue-500" />
                                CSV (Server)
                            </button>
                            <button 
                                onClick={() => handleServerExport('excel')}
                                className="w-full px-4 py-2.5 text-left text-sm font-medium text-textMuted hover:bg-surfaceHigh hover:text-text flex items-center gap-3 transition-colors"
                            >
                                <FileSpreadsheet size={16} className="text-emerald-500" />
                                Excel (.xlsx)
                            </button>
                            <button 
                                onClick={() => handleServerExport('pdf')}
                                className="w-full px-4 py-2.5 text-left text-sm font-medium text-textMuted hover:bg-surfaceHigh hover:text-text flex items-center gap-3 transition-colors"
                            >
                                <FileText size={16} className="text-red-500" />
                                PDF Report
                            </button>
                        </div>
                    )}
                </div>
            )}
            
            {selectedSessionId && (
                <Button 
                    variant="primary" 
                    onClick={() => setShowManualMarkModal(true)} 
                    className="gap-2 h-11 px-6 rounded-xl"
                >
                    <UserPlus size={18} />
                    <span className="hidden sm:inline">Manual Mark</span>
                </Button>
            )}
        </div>
      </div>

      {loading && !filteredData.length ? (
           <div className="flex flex-col items-center justify-center h-64 text-textMuted">
                <div className="w-8 h-8 border-outline border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                Loading report data...
            </div>
      ) : !analyticsData ? (
          <div className="text-center py-12 text-textMuted bg-surfaceLow/50 rounded-xl border border-dashed border-outline">
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-textMuted" />
              <p>Select a course to view attendance records.</p>
          </div>
      ) : (
          <>
            {/* 2. Stats Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-surface text-text p-5 rounded-2xl border border-outline shadow-sm">
                    <p className="text-[10px] font-black text-textMuted uppercase tracking-widest mb-1">Students Found</p>
                    <p className="text-3xl font-bold text-text">{filteredData.length}</p>
                </div>
                <div className="bg-surface text-text p-5 rounded-2xl border border-outline shadow-sm">
                    <p className="text-[10px] font-black text-textMuted uppercase tracking-widest mb-1">Avg. Attendance</p>
                    <div className="flex items-center gap-2">
                        <p className="text-3xl font-bold text-text">{analyticsData.avg_attendance}%</p>
                        {analyticsData.avg_attendance >= 75 ? <TrendingUp size={20} className="text-green-500" /> : <TrendingDown size={20} className="text-red-500" />}
                    </div>
                </div>
                <div className="bg-surface text-text p-5 rounded-2xl border-l-4 border-l-green-500 border-outline shadow-sm">
                    <p className="text-[10px] font-black text-textMuted uppercase tracking-widest mb-1">Good Standing</p>
                    <p className="text-3xl font-bold text-green-600">{analyticsData.good_standing_count}</p>
                </div>
                <div className="bg-surface text-text p-5 rounded-2xl border-l-4 border-l-red-500 border-outline shadow-sm">
                    <p className="text-[10px] font-black text-textMuted uppercase tracking-widest mb-1">At Risk (&lt;75%)</p>
                    <p className="text-3xl font-bold text-red-600">{analyticsData.at_risk_count}</p>
                </div>
            </div>

            {/* Table Search Bar */}
            <div className="relative max-w-lg mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={16} />
                <input
                    type="text"
                    placeholder="Search by student name or matric number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-background text-text border border-outline rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
                />
            </div>

            {/* 3. Grouped Tables by Department */}
            <div className="space-y-12">
                {Object.keys(groupedData).length > 0 ? (
                    Object.entries(groupedData).map(([dept, records]) => (
                        <div key={dept} className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
                            <div className="flex items-center justify-between px-2">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                        <Building2 size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-headline text-lg font-bold text-text">{dept}</h3>
                                        <p className="text-xs text-textMuted font-medium">{records.length} student records</p>
                                    </div>
                                </div>
                                {!selectedSessionId && (
                                    <div className="hidden sm:flex items-center gap-2">
                                        <Filter size={14} className="text-textMuted" />
                                        <select 
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value as any)}
                                            className="bg-transparent border-none text-xs font-bold text-textMuted outline-none cursor-pointer hover:text-primary transition-colors"
                                        >
                                            <option value="ALL">All Statuses</option>
                                            <option value="good">Good Standing</option>
                                            <option value="at_risk">At Risk</option>
                                        </select>
                                    </div>
                                )}
                            </div>

                            <div className="bg-surface text-text border border-outline rounded-3xl shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-surfaceLow border-b border-outline text-textMuted font-bold uppercase text-[10px] tracking-widest">
                                            <tr>
                                                <th className="px-6 py-4">Matric Number</th>
                                                <th className="px-6 py-4">Student Name</th>
                                                {selectedSessionId ? (
                                                    <>
                                                        <th className="px-6 py-4">Status</th>
                                                        <th className="px-6 py-4">Time</th>
                                                        <th className="px-6 py-4 text-right">Distance</th>
                                                    </>
                                                ) : (
                                                    <>
                                                        <th className="px-6 py-4 text-center">Sessions</th>
                                                        <th className="px-6 py-4">Attendance Rate</th>
                                                        <th className="px-6 py-4 text-right">Status</th>
                                                    </>
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-200">
                                            {records.map((item) => (
                                                <tr key={item.id} className="hover:bg-surfaceHigh transition-colors group">
                                                    {selectedSessionId ? (
                                                        <>
                                                            <td className="px-6 py-4 font-mono text-textMuted">{(item as Attendance).student_matric}</td>
                                                            <td className="px-6 py-4 font-bold text-text group-hover:text-primary transition-colors">{(item as Attendance).student_name}</td>
                                                            <td className="px-6 py-4">
                                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black ${ 
                                                                    (item as Attendance).status === 'PRESENT' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                                                                }`}>
                                                                    {(item as Attendance).status}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-textMuted font-medium">
                                                                <div className="flex items-center gap-1.5">
                                                                    <Clock size={12} />
                                                                    {new Date((item as Attendance).checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-right text-textMuted font-mono">
                                                                <div className="flex items-center justify-end gap-1.5">
                                                                    <MapPin size={12} />
                                                                    {(item as Attendance).distance_from_venue}m
                                                                </div>
                                                            </td>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <td className="px-6 py-4 font-mono text-textMuted">{(item as StudentAnalytics).matric}</td>
                                                            <td className="px-6 py-4 font-bold text-text group-hover:text-primary transition-colors">{(item as StudentAnalytics).name}</td>
                                                            <td className="px-6 py-4 text-center text-textMuted">
                                                                <span className="font-bold text-text">{(item as StudentAnalytics).attended}</span>
                                                                <span className="text-textMuted text-xs">/{(item as StudentAnalytics).total}</span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="flex-1 h-2 bg-surfaceHigh rounded-full overflow-hidden">
                                                                        <div 
                                                                            className={`h-full rounded-full ${ 
                                                                                (item as StudentAnalytics).percentage >= 75 ? 'bg-green-500' : 
                                                                                (item as StudentAnalytics).percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                                                            }`}
                                                                            style={{ width: `${(item as StudentAnalytics).percentage}%` }}
                                                                        ></div>
                                                                    </div>
                                                                    <span className="font-bold w-12 text-right">{(item as StudentAnalytics).percentage}%</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                {(item as StudentAnalytics).percentage >= 75 ? (
                                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-green-100 text-green-700 uppercase">
                                                                        <CheckCircle2 size={12} /> Good
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-red-100 text-red-700 uppercase">
                                                                        <AlertCircle size={12} /> Risk
                                                                    </span>
                                                                )}
                                                            </td>
                                                        </>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )) 
                ) : (
                    <div className="bg-surface text-text border border-outline rounded-3xl shadow-sm p-20 text-center text-textMuted italic">
                        <Search size={48} className="mx-auto mb-6 opacity-10" />
                        <p className="text-xl font-bold text-textMuted">No matching students</p>
                        <p className="text-sm max-w-xs mx-auto mt-2">We couldn't find any students matching your current search or filter criteria.</p>
                    </div>
                )}
            </div>
            
            {/* Footer Info */}
            <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-widest text-textMuted border-t border-outline">
                <div className="flex items-center gap-4">
                    <span>
                        {selectedSessionId 
                            ? `Report Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}` 
                            : "Course Aggregate Report"}
                    </span>
                    <div className="h-3 w-[1px] bg-border hidden sm:block" />
                    <span className="hidden sm:block">Filter: {selectedDept === 'ALL' ? 'All Departments' : selectedDept}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    System Status: Online
                </div>
            </div>
          </>
      )}

      {/* Manual Mark Sheet */}
      <Sheet
        isOpen={showManualMarkModal}
        onClose={() => setShowManualMarkModal(false)}
        title="Manual Override"
        description="Authenticate and mark student attendance manually for this session."
        side="bottom"
      >
        <form onSubmit={handleManualMark} className="space-y-8 pb-12">
            <div className="space-y-4">
               <div className="flex items-center gap-4 p-6 bg-primary/5 border border-primary/10 rounded-[2.5rem]">
                  <div className="w-16 h-16 rounded-[1.75rem] bg-white dark:bg-surfaceLow flex items-center justify-center text-primary shadow-xl">
                      <UserPlus size={32} />
                  </div>
                  <div>
                      <h4 className="font-black text-text text-xl tracking-tight">Access Grant</h4>
                      <p className="text-textMuted font-medium text-xs">Direct database entry for missing telemetry records.</p>
                  </div>
               </div>

               <div className="space-y-2 px-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-textMuted/40">Student Matric Record Identifier</label>
                  <div className="relative group">
                      <User className="absolute left-6 top-1/2 -translate-y-1/2 text-textMuted group-focus-within:text-primary transition-colors" size={24} />
                      <input 
                          autoFocus
                          type="text" 
                          value={manualMatric}
                          onChange={(e) => setManualMatric(e.target.value.toUpperCase())}
                          placeholder="CSC/2019/001"
                          className="w-full h-24 bg-surfaceLow border-2 border-outline/10 group-hover:border-primary/20 focus:border-primary/50 rounded-[2.5rem] pl-16 pr-8 text-3xl font-black tracking-widest font-mono outline-none transition-all shadow-inner"
                          required
                      />
                  </div>
               </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <button 
                    type="button" 
                    className="flex-1 h-20 rounded-[2rem] bg-surfaceHigh text-textMuted font-black text-sm uppercase tracking-widest hover:text-text transition-colors"
                    onClick={() => setShowManualMarkModal(false)}
                >
                    Abort Grant
                </button>
                <button 
                    type="submit" 
                    disabled={markingManual || !manualMatric}
                    className="flex-[2] h-20 bg-primary text-background font-black text-xl rounded-[2.5rem] shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 disabled:grayscale disabled:scale-100 flex items-center justify-center gap-3"
                >
                    {markingManual ? (
                       <div className="flex items-center gap-2">
                          <div className="w-5 h-5 border-4 border-background/20 border-t-background rounded-full animate-spin" />
                          <span>Authorizing...</span>
                       </div>
                    ) : 'Grant Attendance'}
                </button>
            </div>
        </form>
      </Sheet>
    </div>
  );
};