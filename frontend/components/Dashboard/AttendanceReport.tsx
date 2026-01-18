import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Download, ChevronDown, CheckCircle2, XCircle, 
  Clock, AlertCircle, BookOpen, Calendar, User, ArrowUpDown, TrendingUp, TrendingDown
} from 'lucide-react';
import { Button } from '../Button';
import { Input } from '../Input';
import { courseApi } from '../../services/api/attendance';
import { analyticsApi, CourseAttendanceAnalytics, StudentAnalytics } from '../../services/api/analytics';
import { Course as CourseType } from '../../types';
import { toast } from 'sonner';

export const AttendanceReport: React.FC = () => {
  // State
  const [courses, setCourses] = useState<CourseType[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [analyticsData, setAnalyticsData] = useState<CourseAttendanceAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'good' | 'at_risk'>('ALL');

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      loadCourseAnalytics(selectedCourseId);
    } else {
        setAnalyticsData(null);
    }
  }, [selectedCourseId]);

  const loadCourses = async () => {
    try {
      setLoadingCourses(true);
      const data = await courseApi.getAll();
      const courseList = Array.isArray(data) ? data : [];
      setCourses(courseList);
      // Auto-select first course if available
      if (courseList.length > 0) {
        setSelectedCourseId(courseList[0].id);
      }
    } catch (err) {
      console.error('Failed to load courses', err);
      toast.error('Failed to load courses');
    } finally {
      setLoadingCourses(false);
    }
  };

  const loadCourseAnalytics = async (courseId: number) => {
    try {
      setLoading(true);
      const data = await analyticsApi.getCourseAttendance(courseId);
      setAnalyticsData(data);
    } catch (err) {
      console.error('Failed to load report', err);
      toast.error('Failed to load attendance report');
    } finally {
      setLoading(false);
    }
  };

  // Filter Logic
  const filteredStudents = analyticsData?.students.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      student.matric.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'ALL' ? true :
      statusFilter === 'good' ? student.percentage >= 75 :
      student.percentage < 75;

    return matchesSearch && matchesStatus;
  }) || [];

  const handleExport = () => {
    if (!analyticsData) return;
    
    // Simple CSV Export logic
    const headers = ['Matric Number', 'Student Name', 'Department', 'Attended', 'Total', 'Percentage'];
    const rows = filteredStudents.map(s => [
      s.matric,
      s.name,
      s.department,
      s.attended,
      s.total,
      `${s.percentage}%`
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${analyticsData.course_code}_attendance_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      {/* 1. Header & Course Selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Attendance Reports</h2>
          <p className="text-zinc-500">Detailed student attendance records by course.</p>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-64">
                <select
                    value={selectedCourseId || ''}
                    onChange={(e) => setSelectedCourseId(Number(e.target.value))}
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 pr-10 appearance-none text-zinc-900 dark:text-white font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700"
                >
                    {courses.map(course => (
                        <option key={course.id} value={course.id}>{course.code} - {course.title}</option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={16} />
            </div>
            {analyticsData && (
                <Button variant="secondary" size="icon" onClick={handleExport} title="Export CSV">
                    <Download size={18} />
                </Button>
            )}
        </div>
      </div>

      {loading ? (
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <p className="text-xs font-medium text-zinc-500 uppercase">Total Students</p>
                    <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">{analyticsData.students.length}</p>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <p className="text-xs font-medium text-zinc-500 uppercase">Avg. Attendance</p>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-2xl font-bold text-zinc-900 dark:text-white">{analyticsData.avg_attendance}%</p>
                        {analyticsData.avg_attendance >= 75 ? (
                            <TrendingUp size={16} className="text-green-500" />
                        ) : (
                            <TrendingDown size={16} className="text-red-500" />
                        )}
                    </div>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm border-l-4 border-l-green-500">
                    <p className="text-xs font-medium text-zinc-500 uppercase">Good Standing</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{analyticsData.good_standing_count}</p>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm border-l-4 border-l-red-500">
                    <p className="text-xs font-medium text-zinc-500 uppercase">At Risk (&lt;75%)</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{analyticsData.at_risk_count}</p>
                </div>
            </div>

            {/* 3. Main Table Section */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
                {/* Table Toolbar */}
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row gap-4 justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search by name or matric number..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                         <Filter size={16} className="text-zinc-400" />
                         <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:ring-primary focus:border-primary outline-none"
                        >
                            <option value="ALL">All Students</option>
                            <option value="good">Good Standing (&ge;75%)</option>
                            <option value="at_risk">At Risk (&lt;75%)</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-medium">
                            <tr>
                                <th className="px-6 py-4 w-48">Matric Number</th>
                                <th className="px-6 py-4">Student Name</th>
                                <th className="px-6 py-4 w-32 text-center">Sessions</th>
                                <th className="px-6 py-4 w-48">Attendance Rate</th>
                                <th className="px-6 py-4 w-32 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            {filteredStudents.length > 0 ? (
                                filteredStudents.map((student) => (
                                    <tr key={student.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-zinc-600 dark:text-zinc-400">
                                            {student.matric}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">
                                            {student.name}
                                        </td>
                                        <td className="px-6 py-4 text-center text-zinc-600 dark:text-zinc-400">
                                            <span className="font-bold text-zinc-900 dark:text-white">{student.attended}</span>
                                            <span className="text-zinc-400 text-xs">/{student.total}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                    <div 
                                                        className={`h-full rounded-full ${ 
                                                            student.percentage >= 75 ? 'bg-green-500' : 
                                                            student.percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                                        }`}
                                                        style={{ width: `${student.percentage}%` }}
                                                    ></div>
                                                </div>
                                                <span className="font-bold w-12 text-right">{student.percentage}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {student.percentage >= 75 ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                                                    <CheckCircle2 size={12} /> Good
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400">
                                                    <AlertCircle size={12} /> At Risk
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                                        No students found matching your filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Footer / Pagination (Placeholder) */}
                <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 flex justify-between items-center bg-zinc-50/30 dark:bg-zinc-900/30">
                    <span>Showing {filteredStudents.length} students</span>
                    {/* Add pagination controls here if needed */}
                </div>
            </div>
          </>
      )}
    </div>
  );
};
