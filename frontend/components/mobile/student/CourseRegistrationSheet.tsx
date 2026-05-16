import React, { useState, useEffect } from 'react';
import { Sheet } from '../../Sheet';
import { MagnifyingGlass, BookOpen, Plus, CheckCircle, WarningCircle, CircleNotch } from '@phosphor-icons/react';
import { toast } from 'sonner';

interface CourseRegistrationSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CourseRegistrationSheet: React.FC<CourseRegistrationSheetProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [enrolling, setEnrolling] = useState<string | null>(null);

  // Mock search logic
  useEffect(() => {
    if (searchTerm.length < 2) {
      setResults([]);
      return;
    }
    
    setLoading(true);
    const timer = setTimeout(() => {
      setResults([
        { id: '1', code: 'CSC 301', name: 'Data Structures', lecturer: 'Dr. Smith', credits: 3 },
        { id: '2', code: 'MTH 205', name: 'Linear Algebra', lecturer: 'Prof. Johnson', credits: 4 },
        { id: '3', code: 'PHY 101', name: 'General Physics I', lecturer: 'Dr. Williams', credits: 3 },
      ].filter(c => c.code.toLowerCase().includes(searchTerm.toLowerCase()) || c.name.toLowerCase().includes(searchTerm.toLowerCase())));
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleEnroll = async (courseId: string) => {
    setEnrolling(courseId);
    try {
      // Simulate API call
      await new Promise(r => setTimeout(r, 1000));
      toast.success('Successfully enrolled!');
      setResults(prev => prev.filter(c => c.id !== courseId));
    } catch (error) {
      toast.error('Failed to enroll. Please try again.');
    } finally {
      setEnrolling(null);
    }
  };

  return (
    <Sheet isOpen={isOpen} onClose={onClose} side="bottom" className="h-[85vh]">
      <div className="flex flex-col h-full bg-off-white dark:bg-presently-black rounded-t-[32px] pt-4">
        {/* Handle */}
        <div className="w-12 h-1.5 bg-slate-200 dark:bg-white/20 rounded-full mx-auto mb-6 shrink-0" />
        
        {/* Header */}
        <div className="px-6 mb-6 shrink-0">
          <h2 className="text-[24px] font-bold text-presently-black dark:text-white tracking-tight">Register Course</h2>
          <p className="text-slate-400 text-[14px] mt-1">Find and enroll in new courses</p>
        </div>

        {/* Search */}
        <div className="px-6 mb-6 shrink-0">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <MagnifyingGlass size={20} weight="bold" />
            </div>
            <input 
              type="text"
              placeholder="Search by code or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-14 pl-12 pr-4 bg-white dark:bg-charcoal border border-slate-200 dark:border-white/10 rounded-[20px] outline-none focus:border-sungold focus:shadow-[0_0_0_4px_rgba(245,197,24,0.15)] transition-all text-presently-black dark:text-white placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto px-6 pb-8 space-y-3 no-scrollbar">
          {searchTerm.length < 2 ? (
            <div className="h-40 flex flex-col items-center justify-center text-center">
              <BookOpen size={48} weight="duotone" className="text-slate-200 dark:text-white/5 mb-4" />
              <p className="text-[14px] font-bold text-slate-400">Type at least 2 characters</p>
              <p className="text-[12px] text-slate-400/60 mt-1">to search for courses</p>
            </div>
          ) : loading ? (
            <div className="h-40 flex items-center justify-center">
              <CircleNotch size={32} className="animate-spin text-sungold" />
            </div>
          ) : results.length > 0 ? (
            results.map((course) => (
              <div 
                key={course.id}
                className="bg-white dark:bg-charcoal border border-slate-100 dark:border-white/5 rounded-[24px] p-4 flex items-center gap-4 shadow-sm"
              >
                <div className="w-12 h-12 bg-pale-honey text-amber-800 rounded-2xl flex items-center justify-center shrink-0">
                  <BookOpen size={24} weight="duotone" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{course.code}</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-300 px-2 py-0.5 rounded-full">
                      {course.credits} Credits
                    </span>
                  </div>
                  <h3 className="text-[15px] font-bold text-presently-black dark:text-white truncate">{course.name}</h3>
                  <p className="text-[12px] text-slate-400 font-medium truncate">{course.lecturer}</p>
                </div>

                <button
                  onClick={() => handleEnroll(course.id)}
                  disabled={enrolling === course.id}
                  className="w-12 h-12 rounded-2xl bg-sungold/10 text-sungold flex items-center justify-center shrink-0 active:scale-90 transition-transform disabled:opacity-50"
                >
                  {enrolling === course.id ? (
                    <CircleNotch size={24} className="animate-spin" />
                  ) : (
                    <Plus size={24} weight="bold" />
                  )}
                </button>
              </div>
            ))
          ) : (
            <div className="h-40 flex flex-col items-center justify-center text-center">
              <WarningCircle size={48} weight="duotone" className="text-slate-200 dark:text-white/5 mb-4" />
              <p className="text-[14px] font-bold text-slate-400">No courses found</p>
              <p className="text-[12px] text-slate-400/60 mt-1">Try a different search term</p>
            </div>
          )}
        </div>
      </div>
    </Sheet>
  );
};
