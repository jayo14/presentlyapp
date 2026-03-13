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
      await dashboardApi.manualMark(selectedSessionId.toString(), manualMatric);
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
        <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            Loading courses...
        </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* 1. Header & Course/Session/Dept Selectors */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white truncate">Attendance Reports</h2>
          <p className="text-zinc-500 text-sm">View and export detailed attendance logs.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto">
            {/* Course Select */}
            <div className="relative flex-1 sm:w-56">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 z-10 pointer-events-none">
                    <BookOpen size={16} />
                </div>
                <select
                    value={selectedCourseId || ''}
                    onChange={(e) => {
                        setSelectedCourseId(Number(e.target.value));
                        setSelectedSessionId(null);
                        setSelectedDepartment('ALL');
                    }}
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-10 py-2.5 appearance-none text-zinc-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
                >
                    {courses.map(course => (
                        <option key={course.id} value={course.id}>{course.code}</option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={16} />
            </div>

            {/* Session Select */}
            <div className="relative flex-1 sm:w-64">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 z-10 pointer-events-none">
                    <Calendar size={16} />
                </div>
                <select
                    value={selectedSessionId || ''}
                    onChange={(e) => {
                        setSelectedSessionId(e.target.value ? Number(e.target.value) : null);
                        setSelectedDepartment('ALL');
                    }}
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-10 py-2.5 appearance-none text-zinc-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm disabled:opacity-50"
                    disabled={loadingSessions}
                >
                    <option value="">All Sessions</option>
                    {sessions.map(s => (
                        <option key={s.id} value={s.id}>
                            {new Date(s.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - {new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={16} />
            </div>

            {/* Department Select */}
            <div className="relative flex-1 sm:w-56">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 z-10 pointer-events-none">
                    <Building2 size={16} />
                </div>
                <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-10 py-2.5 appearance-none text-zinc-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
                >
                    <option value="ALL">All Departments</option>
                    {availableDepartments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={16} />
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
                        <div className="absolute right-0 top-full mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-50 w-48 py-1 animate-in fade-in slide-in-from-top-1 duration-200">
                            <button 
                                onClick={() => { handleExport(); setShowExportMenu(false); }}
                                className="w-full px-4 py-2.5 text-left text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-3 transition-colors"
                            >
                                <Download size={16} className="text-green-500" />
                                CSV (Client)
                            </button>
                            <button 
                                onClick={() => handleServerExport('csv')}
                                className="w-full px-4 py-2.5 text-left text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-3 transition-colors"
                            >
                                <Download size={16} className="text-blue-500" />
                                CSV (Server)
                            </button>
                            <button 
                                onClick={() => handleServerExport('excel')}
                                className="w-full px-4 py-2.5 text-left text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-3 transition-colors"
                            >
                                <FileSpreadsheet size={16} className="text-emerald-500" />
                                Excel (.xlsx)
                            </button>
                            <button 
                                onClick={() => handleServerExport('pdf')}
                                className="w-full px-4 py-2.5 text-left text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-3 transition-colors"
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
           <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                Loading report data...
            </div>
      ) : !analyticsData ? (
          <div className="text-center py-12 text-zinc-500 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-zinc-300" />
              <p>Select a course to view attendance records.</p>
          </div>
      ) : (
          <>
            {/* 2. Stats Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Students Found</p>
                    <p className="text-3xl font-bold text-zinc-900 dark:text-white">{filteredData.length}</p>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Avg. Attendance</p>
                    <div className="flex items-center gap-2">
                        <p className="text-3xl font-bold text-zinc-900 dark:text-white">{analyticsData.avg_attendance}%</p>
                        {analyticsData.avg_attendance >= 75 ? <TrendingUp size={20} className="text-green-500" /> : <TrendingDown size={20} className="text-red-500" />}
                    </div>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border-l-4 border-l-green-500 border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Good Standing</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">{analyticsData.good_standing_count}</p>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border-l-4 border-l-red-500 border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">At Risk (&lt;75%)</p>
                    <p className="text-3xl font-bold text-red-600 dark:text-red-400">{analyticsData.at_risk_count}</p>
                </div>
            </div>

            {/* Table Search Bar */}
            <div className="relative max-w-lg mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                <input
                    type="text"
                    placeholder="Search by student name or matric number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
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
                                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{dept}</h3>
                                        <p className="text-xs text-zinc-500 font-medium">{records.length} student records</p>
                                    </div>
                                </div>
                                {!selectedSessionId && (
                                    <div className="hidden sm:flex items-center gap-2">
                                        <Filter size={14} className="text-zinc-400" />
                                        <select 
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value as any)}
                                            className="bg-transparent border-none text-xs font-bold text-zinc-500 outline-none cursor-pointer hover:text-primary transition-colors"
                                        >
                                            <option value="ALL">All Statuses</option>
                                            <option value="good">Good Standing</option>
                                            <option value="at_risk">At Risk</option>
                                        </select>
                                    </div>
                                )}
                            </div>

                            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-bold uppercase text-[10px] tracking-widest">
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
                                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                            {records.map((item) => (
                                                <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors group">
                                                    {selectedSessionId ? (
                                                        <>
                                                            <td className="px-6 py-4 font-mono text-zinc-600 dark:text-zinc-400">{(item as Attendance).student_matric}</td>
                                                            <td className="px-6 py-4 font-bold text-zinc-900 dark:text-white group-hover:text-primary transition-colors">{(item as Attendance).student_name}</td>
                                                            <td className="px-6 py-4">
                                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black ${ 
                                                                    (item as Attendance).status === 'PRESENT' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                                                                }`}>
                                                                    {(item as Attendance).status}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-zinc-500 font-medium">
                                                                <div className="flex items-center gap-1.5">
                                                                    <Clock size={12} />
                                                                    {new Date((item as Attendance).checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-right text-zinc-500 font-mono">
                                                                <div className="flex items-center justify-end gap-1.5">
                                                                    <MapPin size={12} />
                                                                    {(item as Attendance).distance_from_venue}m
                                                                </div>
                                                            </td>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <td className="px-6 py-4 font-mono text-zinc-600 dark:text-zinc-400">{(item as StudentAnalytics).matric}</td>
                                                            <td className="px-6 py-4 font-bold text-zinc-900 dark:text-white group-hover:text-primary transition-colors">{(item as StudentAnalytics).name}</td>
                                                            <td className="px-6 py-4 text-center text-zinc-600 dark:text-zinc-400">
                                                                <span className="font-bold text-zinc-900 dark:text-white">{(item as StudentAnalytics).attended}</span>
                                                                <span className="text-zinc-400 text-xs">/{(item as StudentAnalytics).total}</span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="flex-1 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
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
                                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 uppercase">
                                                                        <CheckCircle2 size={12} /> Good
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 uppercase">
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
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm p-20 text-center text-zinc-500 italic">
                        <Search size={48} className="mx-auto mb-6 opacity-10" />
                        <p className="text-xl font-bold text-zinc-400">No matching students</p>
                        <p className="text-sm max-w-xs mx-auto mt-2">We couldn't find any students matching your current search or filter criteria.</p>
                    </div>
                )}
            </div>
            
            {/* Footer Info */}
            <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-widest text-zinc-400 border-t border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-4">
                    <span>
                        {selectedSessionId 
                            ? `Report Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}` 
                            : "Course Aggregate Report"}
                    </span>
                    <div className="h-3 w-[1px] bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />
                    <span className="hidden sm:block">Filter: {selectedDept === 'ALL' ? 'All Departments' : selectedDept}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    System Status: Online
                </div>
            </div>
          </>
      )}

      {/* Manual Mark Modal */}
      {showManualMarkModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary transition-transform hover:scale-110">
                            <UserPlus size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">Manual Mark</h3>
                            <p className="text-xs text-zinc-500 font-medium">Mark student as present for this session</p>
                        </div>
                    </div>
                    <button 
                      onClick={() => setShowManualMarkModal(false)}
                      className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-zinc-400 transition-colors"
                    >
                      <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleManualMark} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Student Matric Number</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                            <input 
                                autoFocus
                                type="text" 
                                value={manualMatric}
                                onChange={(e) => setManualMatric(e.target.value.toUpperCase())}
                                placeholder="e.g. CSC/2019/001"
                                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[1.25rem] pl-12 pr-4 py-4 text-zinc-9100 dark:text-white font-bold focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-inner"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button 
                            type="button" 
                            variant="secondary" 
                            className="flex-1 h-14 rounded-2xl text-xs font-black uppercase tracking-widest"
                            onClick={() => setShowManualMarkModal(false)}
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            variant="primary" 
                            className="flex-[2] h-14 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20"
                            disabled={markingManual}
                        >
                            {markingManual ? 'Marking...' : 'Mark Present'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};