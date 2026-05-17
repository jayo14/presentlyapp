import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  QrCode,
  ArrowRight,
  X,
  MagnifyingGlass,
  Terminal,
  Palette,
  Toolbox,
  CaretRight,
  PlusCircle,
  BookmarkSimple,
  User,
  WarningCircle,
  Check,
  Calendar,
  Clock,
  Layout
} from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';

type ViewState = 'idle' | 'searching' | 'enrolled';

export const CourseRegistrationMobile: React.FC = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<ViewState>('idle');
  const [courseCode, setCourseCode] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (courseCode.toUpperCase() === 'CS401') {
      setView('enrolled');
    } else if (courseCode.toUpperCase() === 'CS40') {
        setView('searching');
        setSearchQuery('CS40');
    } else {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 5000);
    }
  };

  if (view === 'enrolled') {
    return (
      <div className="bg-background-dark font-display text-white antialiased overflow-hidden min-h-screen">
        <div className="relative flex min-h-screen w-full flex-col items-center justify-between pb-28 pt-12 overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[200px] h-[200px] bg-primary/5 rounded-full blur-[80px] pointer-events-none"></div>

          <div className="flex flex-col items-center px-6 z-10 w-full mt-10">
            <div className="relative mb-10">
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse scale-150"></div>
              <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse scale-[2] delay-700"></div>
              <div className="relative size-28 bg-primary rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(249,196,6,0.4)]">
                <Check size={64} weight="bold" className="text-background-dark" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-center tracking-tight leading-tight">
              Successfully Enrolled<br/>in <span className="text-primary">CS401</span>
            </h1>
            <p className="text-slate-400 mt-3 text-center text-sm font-light tracking-wide uppercase">Course Registration Confirmed</p>
          </div>

          <div className="w-full px-6 z-10 max-w-sm">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-semibold mb-1">Course Code</p>
                  <p className="text-lg font-bold text-primary">CS401</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-semibold mb-1">Credits</p>
                  <p className="text-lg font-bold">4.0 Units</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/5">
                  <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Schedule</p>
                    <p className="text-sm font-medium">Mon, Wed, Fri</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/5">
                  <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Time</p>
                    <p className="text-sm font-medium">10:00 AM - 11:30 AM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full px-6 flex flex-col gap-4 z-10 max-w-sm">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full h-16 bg-primary text-background-dark rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span>Go to Dashboard</span>
              <Layout size={24} />
            </button>
            <button
              onClick={() => { setView('idle'); setCourseCode(''); }}
              className="w-full h-16 bg-white/5 text-primary border border-primary/30 rounded-2xl font-bold text-lg active:scale-[0.98] transition-all"
            >
              Add Another Course
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'searching') {
    return (
      <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white antialiased transition-colors duration-200 min-h-screen">
        <div className="relative flex h-full w-full flex-col min-h-screen pb-32 overflow-x-hidden">
          <div className="flex items-center px-4 py-4 justify-between sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-slate-200 dark:border-white/5">
            <button 
              onClick={() => setView('idle')}
              className="flex size-10 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <div className="flex-1 px-2">
              <div className="relative">
                <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  className="w-full bg-slate-100 dark:bg-white/5 border-none rounded-xl py-2 pl-10 pr-4 text-sm font-medium focus:ring-1 focus:ring-primary"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <button className="flex size-10 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
              <PlusCircle size={24} />
            </button>
          </div>

          <div className="flex flex-col gap-6 px-5 pt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Search Results (3)</h2>
              <span className="text-xs font-medium text-primary cursor-pointer">Clear all</span>
            </div>

            <div className="flex flex-col gap-4">
              {[
                { code: 'CS401', name: 'Operating Systems', prof: 'Dr. Alexander Wright' },
                { code: 'CS402', name: 'Computer Networks', prof: 'Prof. Elena Rodriguez' },
                { code: 'CS405', name: 'Cyber Security', prof: 'Dr. Marcus Thorne' }
              ].map((c) => (
                <div key={c.code} className="bg-white dark:bg-surface-dark rounded-2xl p-5 border border-slate-100 dark:border-white/5 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-primary tracking-wider mb-1 uppercase">Computer Science</span>
                      <h3 className="text-lg font-bold leading-tight">
                        <span className="bg-primary/20 text-primary px-0.5 rounded">{c.code.slice(0, 4)}</span>{c.code.slice(4)}: {c.name}
                      </h3>
                    </div>
                    <div className="size-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center">
                      <BookmarkSimple size={20} className="text-slate-400" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="size-8 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center overflow-hidden">
                      <User size={20} />
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{c.prof}</p>
                  </div>
                  <button
                    onClick={() => { setCourseCode(c.code); setView('enrolled'); }}
                    className="w-full h-12 bg-primary hover:bg-yellow-400 text-background-dark font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    Enroll Now
                    <PlusCircle size={20} />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-start gap-4">
              <div className="size-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                <WarningCircle size={24} className="text-red-500" />
              </div>
              <div>
                <h4 className="font-bold text-red-500">Invalid course code</h4>
                <p className="text-xs text-red-400/80 leading-relaxed mt-0.5">
                  The code "{searchQuery}" is not a direct entry code. Please select a specific section from the results above or check your code again.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white antialiased transition-colors duration-200 min-h-screen">
      <div className="relative flex h-full w-full flex-col min-h-screen pb-24 overflow-x-hidden">
        {/* Top App Bar */}
        <div className="flex items-center px-4 py-4 justify-between sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-transparent dark:border-white/5">
          <button
            onClick={() => navigate(-1)}
            className="flex size-10 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-lg font-bold leading-tight flex-1 text-center pr-10 tracking-tight">Register New Course</h2>
        </div>

        {/* Scrollable Content */}
        <div className="flex flex-col gap-8 px-5 pt-4">
          {/* Success State Mockup (Dismissible) */}
          <AnimatePresence>
            {showToast && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="relative flex items-start gap-3 p-4 bg-green-50 dark:bg-[#122e18] border border-green-200 dark:border-green-800/50 rounded-2xl shadow-sm"
              >
                <div className="flex items-center justify-center size-6 rounded-full bg-green-500 text-white shrink-0 mt-0.5">
                  <Check size={14} weight="bold" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-green-800 dark:text-green-400">Course Added Successfully</p>
                  <p className="text-xs text-green-700 dark:text-green-500/80 leading-relaxed mt-0.5">Basic Statistics (STAT201) has been added to your schedule.</p>
                </div>
                <button onClick={() => setShowToast(false)} className="text-green-700 dark:text-green-500 hover:text-green-900 dark:hover:text-green-300">
                  <X size={18} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Method 1: Code Entry */}
          <section className="flex flex-col gap-5">
            <div>
              <h2 className="text-2xl font-bold leading-tight tracking-tight">Add via Code</h2>
              <p className="text-slate-500 dark:text-slate-400 text-base font-normal mt-2 leading-relaxed">Enter the unique 6-digit code provided by your course instructor.</p>
            </div>
            <form onSubmit={handleRegister} className="flex flex-col gap-5">
              <label className="flex flex-col w-full group">
                <span className="text-sm font-semibold leading-normal pb-2 ml-1 text-slate-700 dark:text-slate-300 group-focus-within:text-primary transition-colors">Course Code</span>
                <div className="relative">
                  <input
                    className="w-full rounded-2xl border-2 border-slate-200 dark:border-[#352e18] bg-white dark:bg-[#352e18] h-16 pl-5 pr-14 text-xl tracking-wide font-medium placeholder:text-slate-300 dark:placeholder:text-[#6a5d2f] focus:ring-0 focus:border-primary dark:focus:border-primary transition-all shadow-sm"
                    placeholder="e.g. CS101"
                    type="text"
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                  />
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#ccbf8e] pointer-events-none">
                    <QrCode size={24} />
                  </div>
                </div>
              </label>
              <button
                type="submit"
                className="w-full cursor-pointer flex items-center justify-center gap-2 rounded-2xl h-14 bg-primary hover:bg-yellow-400 text-[#231f10] text-base font-bold tracking-wide shadow-lg shadow-primary/20 transition-transform active:scale-[0.98]"
              >
                <span>Register Course</span>
                <ArrowRight size={20} weight="bold" />
              </button>
            </form>
          </section>

          {/* Divider */}
          <div className="flex items-center gap-4 py-2 opacity-80">
            <div className="h-px bg-slate-200 dark:bg-white/10 flex-1"></div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 dark:text-slate-500">Or browse</span>
            <div className="h-px bg-slate-200 dark:bg-white/10 flex-1"></div>
          </div>

          {/* Method 2: Browse Department */}
          <section className="flex flex-col gap-5">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-xl font-bold leading-tight tracking-tight">Browse Department</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-normal mt-1">Find open electives and major courses.</p>
              </div>
            </div>
            {/* Search Bar */}
            <div className="relative group">
              <MagnifyingGlass size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
              <input
                className="w-full rounded-xl border-none bg-slate-100 dark:bg-[#1e1a0d] h-12 pl-12 pr-4 text-base placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="Search for departments..."
                type="text"
              />
            </div>

            {/* Department List */}
            <div className="grid gap-3 mb-6">
              {[
                { name: 'Computer Science', code: 'CS', courses: 12, icon: Terminal, color: 'blue' },
                { name: 'Arts & Design', code: 'AD', courses: 8, icon: Palette, color: 'purple' },
                { name: 'Engineering', code: 'ENG', courses: 15, icon: Toolbox, color: 'orange' }
              ].map((dept) => (
                <button
                  key={dept.code}
                  onClick={() => setView('searching')}
                  className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-[#2c2614] border border-slate-100 dark:border-white/5 shadow-sm hover:border-primary/50 dark:hover:border-primary/50 transition-all group text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className={`size-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform bg-${dept.color}-50 dark:bg-${dept.color}-900/20 text-${dept.color}-600 dark:text-${dept.color}-400`}>
                      <dept.icon size={24} weight="fill" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white">{dept.name}</h3>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">{dept.code} • {dept.courses} Courses Open</p>
                    </div>
                  </div>
                  <CaretRight size={20} className="text-slate-300 dark:text-slate-600 group-hover:text-primary transition-colors" />
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
