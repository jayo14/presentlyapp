import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  X,
  QrCode,
  MagnifyingGlass,
  TerminalWindow,
  Palette,
  Wrench,
  CaretRight,
  Faders,
  BookmarkSimple,
  User,
  PlusCircle,
  WarningCircle,
  CalendarBlank,
  Clock,
  SquaresFour
} from '@phosphor-icons/react';

type RegistrationView = 'HOME' | 'RESULTS' | 'SUCCESS';

export const CourseRegistrationMobile: React.FC = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<RegistrationView>('HOME');
  const [searchQuery, setSearchQuery] = useState('');
  const [successMessageOpen, setSuccessMessageOpen] = useState(true);

  // Home View
  const renderHome = () => (
    <div className="flex flex-col h-full w-full min-h-screen pb-24 overflow-x-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-white transition-colors duration-200">
      {/* Top App Bar */}
      <div className="flex items-center px-4 py-4 justify-between sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-transparent dark:border-white/5">
        <button 
          onClick={() => navigate(-1)}
          className="flex w-10 h-10 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-bold leading-tight flex-1 text-center pr-10 tracking-tight">Register New Course</h2>
      </div>

      {/* Scrollable Content */}
      <div className="flex flex-col gap-8 px-5 pt-4">
        {/* Success State Mockup (Dismissible) */}
        {successMessageOpen && (
          <div className="animate-reveal relative flex items-start gap-3 p-4 bg-green-50 dark:bg-[#122e18] border border-green-200 dark:border-green-800/50 rounded-2xl shadow-sm">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white shrink-0 mt-0.5">
              <Check size={14} weight="bold" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-green-800 dark:text-green-400">Course Added Successfully</p>
              <p className="text-xs text-green-700 dark:text-green-500/80 leading-relaxed mt-0.5">Basic Statistics (STAT201) has been added to your schedule.</p>
            </div>
            <button 
              onClick={() => setSuccessMessageOpen(false)}
              className="text-green-700 dark:text-green-500 hover:text-green-900 dark:hover:text-green-300"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Method 1: Code Entry */}
        <section className="flex flex-col gap-5">
          <div>
            <h2 className="text-2xl font-bold leading-tight tracking-tight">Add via Code</h2>
            <p className="text-slate-500 dark:text-slate-400 text-base font-normal mt-2 leading-relaxed">Enter the unique 6-digit code provided by your course instructor.</p>
          </div>
          <div className="flex flex-col gap-5">
            <label className="flex flex-col w-full group">
              <span className="text-sm font-semibold leading-normal pb-2 ml-1 text-slate-700 dark:text-slate-300 group-focus-within:text-primary transition-colors">Course Code</span>
              <div className="relative">
                <input 
                  type="text"
                  placeholder="e.g. CS101"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-2xl border-2 border-slate-200 dark:border-[#352e18] bg-white dark:bg-[#352e18] h-16 pl-5 pr-14 text-xl tracking-wide font-medium placeholder:text-slate-300 dark:placeholder:text-[#6a5d2f] focus:ring-0 focus:border-primary dark:focus:border-primary transition-all shadow-sm outline-none"
                />
                <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#ccbf8e] pointer-events-none">
                  <QrCode size={24} />
                </div>
              </div>
            </label>
            <button 
              onClick={() => setCurrentView('RESULTS')}
              className="w-full cursor-pointer flex items-center justify-center gap-2 rounded-2xl h-14 bg-primary hover:bg-yellow-400 text-[#231f10] text-base font-bold tracking-wide shadow-lg shadow-primary/20 transition-transform active:scale-[0.98]"
            >
              <span>Register Course</span>
              <CaretRight size={20} weight="bold" />
            </button>
          </div>
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
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
              <MagnifyingGlass size={20} />
            </span>
            <input 
              type="text" 
              placeholder="Search for departments..."
              className="w-full rounded-xl border-none bg-slate-100 dark:bg-[#1e1a0d] h-12 pl-12 pr-4 text-base placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-primary/50 transition-all outline-none"
            />
          </div>

          {/* Department List */}
          <div className="grid gap-3 mb-6">
            <button className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-[#2c2614] border border-slate-100 dark:border-white/5 shadow-sm hover:border-primary/50 dark:hover:border-primary/50 transition-all group text-left">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                  <TerminalWindow size={24} weight="fill" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Computer Science</h3>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">CS • 12 Courses Open</p>
                </div>
              </div>
              <CaretRight size={20} className="text-slate-300 dark:text-slate-600 group-hover:text-primary transition-colors" />
            </button>
            <button className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-[#2c2614] border border-slate-100 dark:border-white/5 shadow-sm hover:border-primary/50 dark:hover:border-primary/50 transition-all group text-left">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                  <Palette size={24} weight="fill" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Arts & Design</h3>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">AD • 8 Courses Open</p>
                </div>
              </div>
              <CaretRight size={20} className="text-slate-300 dark:text-slate-600 group-hover:text-primary transition-colors" />
            </button>
            <button className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-[#2c2614] border border-slate-100 dark:border-white/5 shadow-sm hover:border-primary/50 dark:hover:border-primary/50 transition-all group text-left">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform">
                  <Wrench size={24} weight="fill" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Engineering</h3>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">ENG • 15 Courses Open</p>
                </div>
              </div>
              <CaretRight size={20} className="text-slate-300 dark:text-slate-600 group-hover:text-primary transition-colors" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );

  // Results View
  const renderResults = () => (
    <div className="flex flex-col h-full w-full min-h-screen pb-32 overflow-x-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-white transition-colors duration-200">
      <div className="flex items-center px-4 py-4 justify-between sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-slate-200 dark:border-white/5">
        <button 
          onClick={() => setCurrentView('HOME')}
          className="flex w-10 h-10 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1 px-2">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <MagnifyingGlass size={18} />
            </span>
            <input 
              type="text" 
              value={searchQuery || "CS40"} 
              readOnly
              className="w-full bg-slate-100 dark:bg-white/5 border-none rounded-xl py-2 pl-10 pr-4 text-sm font-medium focus:ring-1 focus:ring-primary outline-none" 
            />
          </div>
        </div>
        <button className="flex w-10 h-10 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
          <Faders size={24} />
        </button>
      </div>

      <div className="flex flex-col gap-6 px-5 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Search Results (3)</h2>
          <span className="text-xs font-medium text-primary cursor-pointer">Clear all</span>
        </div>

        <div className="flex flex-col gap-4">
          {/* Result 1 */}
          <div className="bg-white dark:bg-[#2c2614] rounded-2xl p-5 border border-slate-100 dark:border-white/5 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-primary tracking-wider mb-1 uppercase">Computer Science</span>
                <h3 className="text-lg font-bold leading-tight">
                  <span className="bg-primary/20 text-primary px-0.5 rounded mr-1">CS40</span>1: Operating Systems
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center">
                <BookmarkSimple size={20} className="text-slate-400" />
              </div>
            </div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center overflow-hidden">
                <User size={18} />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Dr. Alexander Wright</p>
            </div>
            <button 
              onClick={() => setCurrentView('SUCCESS')}
              className="w-full h-12 bg-primary hover:bg-yellow-400 text-background-dark font-bold rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              Enroll Now
              <PlusCircle size={20} />
            </button>
          </div>

          {/* Result 2 */}
          <div className="bg-white dark:bg-[#2c2614] rounded-2xl p-5 border border-slate-100 dark:border-white/5 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-primary tracking-wider mb-1 uppercase">Computer Science</span>
                <h3 className="text-lg font-bold leading-tight">
                  <span className="bg-primary/20 text-primary px-0.5 rounded mr-1">CS40</span>2: Computer Networks
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center">
                <BookmarkSimple size={20} className="text-slate-400" />
              </div>
            </div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center overflow-hidden">
                <User size={18} />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Prof. Elena Rodriguez</p>
            </div>
            <button 
              onClick={() => setCurrentView('SUCCESS')}
              className="w-full h-12 bg-primary hover:bg-yellow-400 text-background-dark font-bold rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              Enroll Now
              <PlusCircle size={20} />
            </button>
          </div>

          {/* Result 3 */}
          <div className="bg-white dark:bg-[#2c2614] rounded-2xl p-5 border border-slate-100 dark:border-white/5 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-primary tracking-wider mb-1 uppercase">Computer Science</span>
                <h3 className="text-lg font-bold leading-tight">
                  <span className="bg-primary/20 text-primary px-0.5 rounded mr-1">CS40</span>5: Cyber Security
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center">
                <BookmarkSimple size={20} className="text-slate-400" />
              </div>
            </div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center overflow-hidden">
                <User size={18} />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Dr. Marcus Thorne</p>
            </div>
            <button 
              onClick={() => setCurrentView('SUCCESS')}
              className="w-full h-12 bg-primary hover:bg-yellow-400 text-background-dark font-bold rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              Enroll Now
              <PlusCircle size={20} />
            </button>
          </div>
        </div>

        <div className="mt-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
            <WarningCircle size={24} className="text-red-500" />
          </div>
          <div>
            <h4 className="font-bold text-red-500">Invalid course code</h4>
            <p className="text-xs text-red-400/80 leading-relaxed mt-0.5">The code "CS40" is not a direct entry code. Please select a specific section from the results above or check your code again.</p>
          </div>
        </div>
        <div className="h-10"></div>
      </div>
    </div>
  );

  // Success View
  const renderSuccess = () => (
    <div className="flex flex-col h-screen w-full items-center justify-between pb-28 pt-12 overflow-hidden bg-[#12110a] text-white">
      {/* Decorative Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[200px] h-[200px] bg-primary/5 rounded-full blur-[80px] pointer-events-none"></div>
      
      <div className="flex flex-col items-center px-6 z-10 w-full mt-10">
        <div className="relative mb-10">
          <div className="absolute inset-0 bg-primary/20 rounded-full animate-[pulse-ring_3s_cubic-bezier(0.4,0,0.6,1)_infinite] scale-150"></div>
          <div className="absolute inset-0 bg-primary/10 rounded-full animate-[pulse-ring_3s_cubic-bezier(0.4,0,0.6,1)_infinite] scale-[2] delay-700"></div>
          <div className="relative w-28 h-28 bg-primary rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(249,196,6,0.4)]">
            <Check size={48} weight="bold" className="text-[#12110a]" />
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
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <CalendarBlank size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-400">Schedule</p>
                <p className="text-sm font-medium">Mon, Wed, Fri</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
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
          className="w-full h-16 bg-primary text-[#12110a] rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <span>Go to Dashboard</span>
          <SquaresFour size={24} weight="fill" />
        </button>
        <button 
          onClick={() => setCurrentView('HOME')}
          className="w-full h-16 bg-white/5 text-primary border border-primary/30 rounded-2xl font-bold text-lg active:scale-[0.98] transition-all"
        >
          Add Another Course
        </button>
      </div>

      <style>{`
        @keyframes pulse-ring {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 0.4; }
        }
      `}</style>
    </div>
  );

  return (
    <>
      {currentView === 'HOME' && renderHome()}
      {currentView === 'RESULTS' && renderResults()}
      {currentView === 'SUCCESS' && renderSuccess()}
    </>
  );
};
