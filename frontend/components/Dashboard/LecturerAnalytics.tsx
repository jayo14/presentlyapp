import React, { useState } from 'react';
import { 
  BarChart3, Users, BookOpen, Download,
  Search, Filter, ChevronRight, AlertCircle,
  TrendingUp, ArrowRight
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { lecturerApi, analyticsApi } from '../../services/api/attendance';
import { ModernCard } from '../ModernCard';
import { Button } from '../Button';
import { cn } from '../../src/components/ui/utils';
import { toast } from 'sonner';

interface LecturerAnalyticsProps {
  userName: string;
}

const LecturerAnalytics: React.FC<LecturerAnalyticsProps> = () => {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: courses = [] } = useQuery({
    queryKey: ['lecturerCourses'],
    queryFn: () => lecturerApi.getLecturerCourses(),
  });

  const { data: courseAnalytics, isLoading } = useQuery({
    queryKey: ['courseAnalytics', selectedCourse],
    queryFn: () => lecturerApi.getCourseAnalytics(selectedCourse!),
    enabled: !!selectedCourse,
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tight text-text">Performance Analytics</h1>
        <p className="text-textMuted font-medium">Insights into student engagement and course health.</p>
      </header>

      {/* COURSE SELECTOR */}
      <section className="flex flex-wrap gap-3">
        {courses.map((course: any) => (
          <button
            key={course.id}
            onClick={() => setSelectedCourse(course.id.toString())}
            className={cn(
              "px-6 py-3 rounded-full text-sm font-bold transition-all border",
              selectedCourse === course.id.toString()
                ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                : "bg-surface text-textMuted border-outline hover:border-primary/50"
            )}
          >
            {course.course_code}
          </button>
        ))}
      </section>

      {selectedCourse ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* TOP CARDS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ModernCard variant="accent" className="lg:col-span-2 flex flex-col justify-between py-8">
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Course Health</p>
                <h2 className="text-4xl font-black tracking-tight">{courseAnalytics?.course_code}</h2>
                <p className="text-textMuted font-medium">{courseAnalytics?.course_name}</p>
              </div>
              
              <div className="mt-8 space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-bold text-textMuted uppercase">Average Attendance</span>
                  <span className="text-3xl font-black text-primary">{courseAnalytics?.avg_attendance?.toFixed(1) || 0}%</span>
                </div>
                <div className="h-3 w-full bg-primary/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${courseAnalytics?.avg_attendance || 0}%` }}
                    className="h-full bg-primary"
                  />
                </div>
              </div>
            </ModernCard>

            <ModernCard className="flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-error">
                  <AlertCircle size={20} />
                  <h4 className="font-bold">At-Risk Students</h4>
                </div>
                <p className="text-sm text-textMuted font-medium">
                  Students below the {courseAnalytics?.benchmark || 75}% benchmark.
                </p>
              </div>
              <div>
                <p className="text-5xl font-black tracking-tighter text-error">{courseAnalytics?.at_risk_count || 0}</p>
                <Button variant="ghost" className="p-0 h-auto text-primary mt-2" onClick={() => {}}>
                  View List <ChevronRight size={16} />
                </Button>
              </div>
            </ModernCard>
          </div>

          {/* ATTENDANCE TABLE */}
          <ModernCard padding="none" className="overflow-hidden">
            <div className="p-6 border-b border-outline flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="relative flex-1 max-w-md group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted group-focus-within:text-primary" size={18} />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-11 bg-surfaceContainer border border-outline rounded-xl pl-12 pr-4 text-sm font-medium outline-none focus:border-primary transition-all"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" className="h-10">
                  <Download size={14} />
                  Export CSV
                </Button>
                <Button variant="secondary" size="sm" className="h-10">
                  <Download size={14} />
                  PDF
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-surfaceContainer/50 text-left">
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-textMuted">Matric Number</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-textMuted">Student Name</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-textMuted text-center">Attended</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-textMuted text-center">Rate</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-textMuted text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline">
                  {courseAnalytics?.students?.filter((s: any) =>
                    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    s.matric.toLowerCase().includes(searchTerm.toLowerCase())
                  ).map((student: any) => (
                    <tr key={student.id} className="group hover:bg-surfaceContainer/30 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-textMuted">{student.matric}</td>
                      <td className="px-6 py-4 font-bold text-sm">{student.name}</td>
                      <td className="px-6 py-4 text-center text-sm font-medium">{student.attended} / {courseAnalytics.total_sessions}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={cn(
                          "font-black text-sm",
                          student.percentage >= 75 ? "text-success" : "text-error"
                        )}>
                          {student.percentage}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                          <ArrowRight size={16} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ModernCard>
        </div>
      ) : (
        <div className="py-20 flex flex-col items-center justify-center text-center gap-6">
          <div className="w-20 h-20 bg-surfaceContainer rounded-full flex items-center justify-center text-textMuted/40">
            <BarChart3 size={40} />
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold">Select a Course</h3>
            <p className="text-textMuted max-w-xs mx-auto">Choose a course above to view detailed attendance performance and at-risk alerts.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LecturerAnalytics;
