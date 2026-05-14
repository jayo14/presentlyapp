import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FilePdf, FileCsv, Download, 
  Funnel, CaretRight, ChartBar,
  Users, BookBookmark, Info
} from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { lecturerApi } from '../../../services/api/attendance';
import { toast } from 'sonner';
import { SEO } from '../../SEO';


export const LecturerReportsMobile: React.FC = () => {
  const navigate = useNavigate();
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['lecturerDashboard'],
    queryFn: () => lecturerApi.getLecturerDashboard(),
  });

  const courses = dashboardData?.active_courses_list || [];

  return (
    <div className="space-y-8 pb-12">
      <SEO title="Academic Reports | Presently" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
           <p className="text-on-surface-variant font-medium">Generate attendance logs.</p>
        </div>
        <button className="w-12 h-12 rounded-2xl bg-surface-container border border-outline flex items-center justify-center active:scale-90 transition-transform">
          <Funnel size={24} weight="bold" />
        </button>
      </div>

      {/* Summary Cards */}
      <section className="grid grid-cols-2 gap-4">
         <div className="p-5 rounded-[28px] bg-surface-container border border-outline h-32 flex flex-col justify-between">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
               <Download size={20} weight="duotone" />
            </div>
            <div>
               <p className="text-2xl font-black">128</p>
               <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant">Exports this month</p>
            </div>
         </div>
         <div className="p-5 rounded-[28px] bg-surface-container border border-outline h-32 flex flex-col justify-between">
            <div className="w-9 h-9 rounded-xl bg-success/10 flex items-center justify-center text-success">
               <ChartBar size={20} weight="duotone" />
            </div>
            <div>
               <p className="text-2xl font-black">82%</p>
               <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant">Avg. Attendance</p>
            </div>
         </div>
      </section>

      {/* Course-wise Reports */}
      <section className="space-y-4">
        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-on-surface-variant px-1">Generate by Course</h2>
        <div className="space-y-3">
          {isLoading ? (
            [1,2,3].map(i => <div key={i} className="h-24 bg-surface-container animate-pulse rounded-3xl" />)
          ) : courses.length > 0 ? (
            courses.map((course: any) => (
              <div 
                key={course.id}
                className="p-5 rounded-[32px] bg-surface border border-outline shadow-sm space-y-4"
              >
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center text-sungold">
                      <BookBookmark size={24} weight="duotone" />
                   </div>
                   <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm truncate">{course.course_name}</h4>
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                        {course.course_code} • {course.student_count || 0} Students
                      </p>
                   </div>
                </div>

                <div className="flex gap-2">
                   <button className="flex-1 h-11 bg-surface-container rounded-xl flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest active:scale-95 transition-all">
                      <FilePdf size={18} weight="duotone" className="text-error" />
                      PDF
                   </button>
                   <button className="flex-1 h-11 bg-surface-container rounded-xl flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest active:scale-95 transition-all">
                      <FileCsv size={18} weight="duotone" className="text-success" />
                      CSV
                   </button>
                   <button 
                     onClick={() => navigate(`/dashboard/analytics?course=${course.id}`)}
                     className="w-11 h-11 bg-surface-container rounded-xl flex items-center justify-center text-on-surface-variant active:scale-95 transition-all border border-outline/50"
                   >
                      <Info size={18} weight="duotone" />
                   </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 bg-surface-container rounded-3xl border border-dashed border-outline">
               <p className="text-sm text-on-surface-variant font-medium">No courses available for reporting.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
