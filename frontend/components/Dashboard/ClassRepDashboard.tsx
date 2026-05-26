import React, { useState } from 'react';
import { StudentDashboard } from './StudentDashboard';
import { Users, FileText, Calendar, Plus, Clock, MapPin, Sparkles, RefreshCw } from 'lucide-react';
import { DashboardPage } from '../../src/components/layout-primitives/DashboardPage';
import { ModernCard } from '../ModernCard';
import { ResponsiveGrid } from '../../src/components/layout-primitives/ResponsiveGrid';
import { Button } from '../Button';
import { Badge } from '../../src/components/ui/badge';
import { cn } from '../../src/components/ui/utils';

interface ClassRepDashboardProps {
  userName: string;
  view?: string;
}

export const ClassRepDashboard: React.FC<ClassRepDashboardProps> = ({ userName, view = 'dashboard' }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'timetable' | 'students'>('overview');

  if (view === 'dashboard' && activeTab === 'overview') {
    return <StudentDashboard userName={userName} />;
  }

  return (
    <DashboardPage
      title="Class Representative Hub"
      description="Manage course timetables, coordinate with lecturers, and monitor peer attendance."
      seoTitle="Class Rep Dashboard | Presently"
      action={
        <div className="flex gap-4">
           <Button variant="outline" className="h-16 px-8">
             <FileText size={20} className="mr-2" /> Reports
           </Button>
           <Button size="lg" className="h-16 px-10 shadow-gold">
             <Plus size={24} className="mr-2" /> Add Schedule
           </Button>
        </div>
      }
    >
      <div className="space-y-16 lg:space-y-32">
        {/* Navigation Tabs */}
        <div className="flex bg-surface-highest/20 p-2 rounded-[2rem] w-fit border border-outline/30">
           {[
             { id: 'overview', label: 'My Progress' },
             { id: 'timetable', label: 'Course Schedule' },
             { id: 'students', label: 'Peer Directory' }
           ].map(tab => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id as any)}
               className={cn(
                 "px-10 py-3 rounded-[1.5rem] text-xs font-bold uppercase tracking-widest transition-all",
                 activeTab === tab.id
                  ? "bg-white text-presently-black shadow-premium"
                  : "text-on-surface-variant hover:text-on-surface"
               )}
             >
               {tab.label}
             </button>
           ))}
        </div>

        {activeTab === 'timetable' && (
          <div className="space-y-12">
            <div className="flex items-center justify-between border-b border-outline/40 pb-6">
               <h3 className="font-display text-3xl font-bold text-presently-black">Weekly Timetable</h3>
               <Button variant="outline" className="h-10 px-6 rounded-xl border-sungold/30 text-sungold bg-sungold/5">
                  <Sparkles size={16} className="mr-2" /> AI Sync from Image
               </Button>
            </div>

            <ResponsiveGrid columns={3} gap={32}>
               {['Monday', 'Tuesday', 'Wednesday'].map((day, idx) => (
                 <ModernCard key={idx} padding="lg" className="border-outline/30">
                    <p className="text-[10px] font-black text-sungold uppercase tracking-[0.2em] mb-6">{day}</p>
                    <div className="space-y-6">
                       <div className="p-5 bg-surface-highest/20 rounded-2xl border border-outline/40">
                          <p className="font-bold text-presently-black">CSC402 • Databases</p>
                          <div className="flex items-center gap-4 mt-3 text-on-surface-variant">
                             <div className="flex items-center gap-1">
                                <Clock size={12} />
                                <span className="text-[10px] font-bold">10:00 AM</span>
                             </div>
                             <div className="flex items-center gap-1">
                                <MapPin size={12} />
                                <span className="text-[10px] font-bold">HALL B</span>
                             </div>
                          </div>
                       </div>
                    </div>
                 </ModernCard>
               ))}
            </ResponsiveGrid>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="space-y-8">
             <div className="flex items-center justify-between border-b border-outline/40 pb-6">
                <h3 className="font-display text-3xl font-bold text-presently-black">Peer Group</h3>
                <Badge variant="secondary" className="px-5 font-bold">42 STUDENTS</Badge>
             </div>

             <ModernCard padding="none" className="overflow-hidden border-outline/30 shadow-xl">
                <table className="w-full border-collapse">
                   <thead>
                      <tr className="bg-slate-50/50 border-b border-outline/40">
                         <th className="px-10 py-6 text-left text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">Student</th>
                         <th className="px-10 py-6 text-left text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">Matric Number</th>
                         <th className="px-10 py-6 text-right text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">Avg. Attendance</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-outline/30">
                      {[1, 2, 3, 4, 5].map(i => (
                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                           <td className="px-10 py-6">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-xl bg-warm-ivory border border-outline flex items-center justify-center font-bold text-sungold">S</div>
                                 <p className="font-bold text-presently-black text-sm">Peer Student {i}</p>
                              </div>
                           </td>
                           <td className="px-10 py-6">
                              <p className="text-xs font-bold text-on-surface-variant tabular-nums">P/CSC/20/10{i}</p>
                           </td>
                           <td className="px-10 py-6 text-right">
                              <span className="text-sm font-black text-moss-green">8{i}%</span>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </ModernCard>
          </div>
        )}
      </div>
    </DashboardPage>
  );
};
