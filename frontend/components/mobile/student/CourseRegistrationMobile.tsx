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
    <div className="flex flex-col w-full min-h-screen pb-32 overflow-x-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-white transition-colors duration-200">
      {/* Top App Bar */}
      <div className="flex items-center px-6 py-5 justify-between sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-transparent dark:border-white/5">
        <button 
          onClick={() => navigate(-1)}
          className="flex w-12 h-12 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          <ArrowLeft size={28} />
        </button>
        <h2 className="text-xl font-bold leading-tight flex-1 text-center pr-12 tracking-tight">Register New Course</h2>
      </div>

      {/* Scrollable Content */}
      <div className="flex flex-col gap-10 px-6 pt-6">
        {/* Success State Mockup (Dismissible) */}
        {successMessageOpen && (
          <div className="animate-reveal relative flex items-start gap-4 p-5 bg-green-50 dark:bg-[#122e18] border border-green-200 dark:border-green-800/50 rounded-[1.5rem] shadow-sm">
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-green-500 text-white shrink-0 mt-0.5">
              <Check size={16} weight="bold" />
            </div>
            <div className="flex-1">
              <p className="text-base font-bold text-green-800 dark:text-green-400">Course Added Successfully</p>
              <p className="text-sm text-green-700 dark:text-green-500/80 leading-relaxed mt-1 font-medium">Basic Statistics (STAT201) has been added to your schedule.</p>
            </div>
            <button 
              onClick={() => setSuccessMessageOpen(false)}
              className="text-green-700 dark:text-green-500 hover:text-green-900 dark:hover:text-green-300 p-1"
            >
              <X size={20} weight="bold" />
            </button>
          </div>
        )}

        {/* Method 1: Code Entry */}
        <section className="flex flex-col gap-6">
          <div>
            <h2 className="text-[28px] font-bold leading-tight tracking-tight">Add via Code</h2>
            <p className="text-slate-500 dark:text-slate-400 text-base font-medium mt-2 leading-relaxed">Enter the unique 6-digit code provided by your course instructor.</p>
          </div>
          <div className="flex flex-col gap-5">
            <label className="flex flex-col w-full group">
              <span className="text-sm font-bold uppercase tracking-wider leading-normal pb-2.5 ml-1 text-slate-700 dark:text-slate-300 group-focus-within:text-primary transition-colors">Course Code</span>
              <div className="relative">
                <input 
                  type="text"
                  placeholder="e.g. CS101"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-[1.25rem] border-2 border-slate-200 dark:border-[#352e18] bg-white dark:bg-[#352e18] h-16 pl-6 pr-14 text-xl tracking-wide font-bold placeholder:text-slate-300 dark:placeholder:text-[#6a5d2f] focus:ring-0 focus:border-primary dark:focus:border-primary transition-all shadow-sm outline-none"
                />
                <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#ccbf8e] pointer-events-none">
                  <QrCode size={28} />
                </div>
              </div>
            </label>
            <button 
              onClick={() => setCurrentView('RESULTS')}
              className="w-full cursor-pointer flex items-center justify-center gap-3 rounded-[1.25rem] h-16 bg-primary hover:bg-yellow-400 text-[#231f10] text-lg font-bold tracking-wide shadow-lg shadow-primary/20 transition-transform active:scale-[0.98]"
            >
              <span>Register Course</span>
              <CaretRight size={24} weight="bold" />
            </button>
          </div>
        </section>

        {/* Divider */}
        <div className="flex items-center gap-6 py-2 opacity-80">
          <div className="h-px bg-slate-200 dark:bg-white/10 flex-1"></div>
          <span className="text-xs font-black tracking-[0.2em] uppercase text-slate-400 dark:text-slate-500">Or browse</span>
          <div className="h-px bg-slate-200 dark:bg-white/10 flex-1"></div>
        </div>

        {/* Method 2: Browse Department */}
        <section className="flex flex-col gap-6">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-[24px] font-bold leading-tight tracking-tight">Browse Department</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">Find open electives and major courses.</p>
            </div>
          </div>
          {/* Search Bar */}
          <div className="relative group">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
              <MagnifyingGlass size={24} />
            </span>
            <input 
              type="text" 
              placeholder="Search for departments..."
              className="w-full rounded-[1.25rem] border-none bg-slate-100 dark:bg-[#1e1a0d] h-14 pl-14 pr-5 text-base font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-primary/50 transition-all outline-none"
            />
          </div>

          {/* Department List */}
          <div className="grid gap-4 mb-6">
            <button className="flex items-center justify-between p-5 rounded-[1.25rem] bg-white dark:bg-[#2c2614] border border-slate-100 dark:border-white/5 shadow-sm hover:border-primary/50 dark:hover:border-primary/50 transition-all group text-left">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                  <TerminalWindow size={28} weight="fill" />
                </div>
                <div>
                  <h3 className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">Computer Science</h3>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">CS • 12 Courses Open</p>
                </div>
              </div>
              <CaretRight size={24} className="text-slate-300 dark:text-slate-600 group-hover:text-primary transition-colors" />
            </button>
            <button className="flex items-center justify-between p-5 rounded-[1.25rem] bg-white dark:bg-[#2c2614] border border-slate-100 dark:border-white/5 shadow-sm hover:border-primary/50 dark:hover:border-primary/50 transition-all group text-left">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                  <Palette size={28} weight="fill" />
                </div>
                <div>
                  <h3 className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">Arts & Design</h3>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">AD • 8 Courses Open</p>
                </div>
              </div>
              <CaretRight size={24} className="text-slate-300 dark:text-slate-600 group-hover:text-primary transition-colors" />
            </button>
            <button className="flex items-center justify-between p-5 rounded-[1.25rem] bg-white dark:bg-[#2c2614] border border-slate-100 dark:border-white/5 shadow-sm hover:border-primary/50 dark:hover:border-primary/50 transition-all group text-left">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform">
                  <Wrench size={28} weight="fill" />
                </div>
                <div>
                  <h3 className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">Engineering</h3>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">ENG • 15 Courses Open</p>
                </div>
              </div>
              <CaretRight size={24} className="text-slate-300 dark:text-slate-600 group-hover:text-primary transition-colors" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );

  // Results View
  const renderResults = () => (
    <div className="flex flex-col w-full min-h-screen pb-32 overflow-x-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-white transition-colors duration-200">
      <div className="flex items-center px-6 py-5 justify-between sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-slate-200 dark:border-white/5">
        <button 
          onClick={() => setCurrentView('HOME')}
          className="flex w-12 h-12 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          <ArrowLeft size={28} />
        </button>
        <div className="flex-1 px-4">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <MagnifyingGlass size={20} />
            </span>
            <input 
              type="text" 
              value={searchQuery || "CS40"} 
              readOnly
              className="w-full bg-slate-100 dark:bg-white/5 border-none rounded-[1rem] py-3.5 pl-12 pr-5 text-base font-bold focus:ring-1 focus:ring-primary outline-none" 
            />
          </div>
        </div>
        <button className="flex w-12 h-12 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
          <Faders size={28} />
        </button>
      </div>

      <div className="flex flex-col gap-8 px-6 pt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-[13px] font-black uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">Search Results (3)</h2>
          <span className="text-sm font-bold text-primary cursor-pointer hover:underline">Clear all</span>
        </div>

        <div className="flex flex-col gap-6">
          {/* Result 1 */}
          <div className="bg-white dark:bg-[#2c2614] rounded-[1.5rem] p-6 border border-slate-100 dark:border-white/5 shadow-md">
            <div className="flex justify-between items-start mb-5">
              <div className="flex flex-col">
                <span className="text-[11px] font-black text-primary tracking-widest mb-1.5 uppercase">Computer Science</span>
                <h3 className="text-xl font-bold leading-tight tracking-tight">
                  <span className="bg-primary/20 text-primary px-1 rounded mr-1.5">CS40</span>1: Operating Systems
                </h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center shrink-0">
                <BookmarkSimple size={24} className="text-slate-400" />
              </div>
            </div>
            <div className="flex items-center gap-3.5 mb-8">
              <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center overflow-hidden shrink-0">
                <User size={20} />
              </div>
              <p className="text-base text-slate-500 dark:text-slate-400 font-semibold">Dr. Alexander Wright</p>
            </div>
            <button 
              onClick={() => setCurrentView('SUCCESS')}
              className="w-full h-14 bg-primary hover:bg-yellow-400 text-[#12110a] font-bold text-lg rounded-[1.25rem] transition-all flex items-center justify-center gap-2.5 active:scale-[0.98]"
            >
              Enroll Now
              <PlusCircle size={24} weight="bold" />
            </button>
          </div>

          {/* Result 2 */}
          <div className="bg-white dark:bg-[#2c2614] rounded-[1.5rem] p-6 border border-slate-100 dark:border-white/5 shadow-md">
            <div className="flex justify-between items-start mb-5">
              <div className="flex flex-col">
                <span className="text-[11px] font-black text-primary tracking-widest mb-1.5 uppercase">Computer Science</span>
                <h3 className="text-xl font-bold leading-tight tracking-tight">
                  <span className="bg-primary/20 text-primary px-1 rounded mr-1.5">CS40</span>2: Computer Networks
                </h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center shrink-0">
                <BookmarkSimple size={24} className="text-slate-400" />
              </div>
            </div>
            <div className="flex items-center gap-3.5 mb-8">
              <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center overflow-hidden shrink-0">
                <User size={20} />
              </div>
              <p className="text-base text-slate-500 dark:text-slate-400 font-semibold">Prof. Elena Rodriguez</p>
            </div>
            <button 
              onClick={() => setCurrentView('SUCCESS')}
              className="w-full h-14 bg-primary hover:bg-yellow-400 text-[#12110a] font-bold text-lg rounded-[1.25rem] transition-all flex items-center justify-center gap-2.5 active:scale-[0.98]"
            >
              Enroll Now
              <PlusCircle size={24} weight="bold" />
            </button>
          </div>

          {/* Result 3 */}
          <div className="bg-white dark:bg-[#2c2614] rounded-[1.5rem] p-6 border border-slate-100 dark:border-white/5 shadow-md">
            <div className="flex justify-between items-start mb-5">
              <div className="flex flex-col">
                <span className="text-[11px] font-black text-primary tracking-widest mb-1.5 uppercase">Computer Science</span>
                <h3 className="text-xl font-bold leading-tight tracking-tight">
                  <span className="bg-primary/20 text-primary px-1 rounded mr-1.5">CS40</span>5: Cyber Security
                </h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center shrink-0">
                <BookmarkSimple size={24} className="text-slate-400" />
              </div>
            </div>
            <div className="flex items-center gap-3.5 mb-8">
              <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center overflow-hidden shrink-0">
                <User size={20} />
              </div>
              <p className="text-base text-slate-500 dark:text-slate-400 font-semibold">Dr. Marcus Thorne</p>
            </div>
            <button 
              onClick={() => setCurrentView('SUCCESS')}
              className="w-full h-14 bg-primary hover:bg-yellow-400 text-[#12110a] font-bold text-lg rounded-[1.25rem] transition-all flex items-center justify-center gap-2.5 active:scale-[0.98]"
            >
              Enroll Now
              <PlusCircle size={24} weight="bold" />
            </button>
          </div>
        </div>

        <div className="mt-6 p-5 rounded-[1.25rem] bg-red-500/10 border border-red-500/20 flex items-start gap-5">
          <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
            <WarningCircle size={28} weight="fill" className="text-red-500" />
          </div>
          <div>
            <h4 className="font-bold text-red-500 text-lg">Invalid course code</h4>
            <p className="text-sm text-red-400/80 leading-relaxed mt-1.5 font-medium">The code "CS40" is not a direct entry code. Please select a specific section from the results above or check your code again.</p>
          </div>
        </div>
        <div className="h-10"></div>
      </div>
    </div>
  );

  // Success View
  const renderSuccess = () => (
    <div className="flex flex-col min-h-screen w-full items-center justify-between pb-32 pt-16 overflow-x-hidden bg-[#12110a] text-white relative">
      {/* Decorative Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[250px] h-[250px] bg-primary/5 rounded-full blur-[80px] pointer-events-none"></div>
      
      <div className="flex flex-col items-center px-8 z-10 w-full mt-12">
        <div className="relative mb-14">
          <div className="absolute inset-0 bg-primary/20 rounded-full animate-[pulse-ring_3s_cubic-bezier(0.4,0,0.6,1)_infinite] scale-150"></div>
          <div className="absolute inset-0 bg-primary/10 rounded-full animate-[pulse-ring_3s_cubic-bezier(0.4,0,0.6,1)_infinite] scale-[2] delay-700"></div>
          <div className="relative w-32 h-32 bg-primary rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(249,196,6,0.5)]">
            <Check size={56} weight="bold" className="text-[#12110a]" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-center tracking-tight leading-[1.1]">
          Successfully Enrolled<br/>in <span className="text-primary">CS401</span>
        </h1>
        <p className="text-slate-400 mt-5 text-center text-base font-medium tracking-[0.15em] uppercase">Course Registration Confirmed</p>
      </div>

      <div className="w-full px-6 z-10 max-w-[400px]">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl">
          <div className="flex justify-between items-center mb-8">
            <div>
              <p className="text-[11px] text-slate-500 uppercase tracking-[0.2em] font-bold mb-1.5">Course Code</p>
              <p className="text-2xl font-black tracking-tight text-primary">CS401</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-slate-500 uppercase tracking-[0.2em] font-bold mb-1.5">Credits</p>
              <p className="text-2xl font-black tracking-tight">4.0 Units</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-5 p-4 rounded-[1.25rem] bg-white/5 border border-white/5">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <CalendarBlank size={24} weight="fill" />
              </div>
              <div>
                <p className="text-sm text-slate-400 font-medium mb-0.5">Schedule</p>
                <p className="text-base font-bold">Mon, Wed, Fri</p>
              </div>
            </div>
            
            <div className="flex items-center gap-5 p-4 rounded-[1.25rem] bg-white/5 border border-white/5">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Clock size={24} weight="fill" />
              </div>
              <div>
                <p className="text-sm text-slate-400 font-medium mb-0.5">Time</p>
                <p className="text-base font-bold">10:00 AM - 11:30 AM</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-6 flex flex-col gap-5 z-10 max-w-[400px]">
        <button 
          onClick={() => navigate('/dashboard')}
          className="w-full h-[72px] bg-primary text-[#12110a] rounded-[1.5rem] font-bold text-xl shadow-[0_8px_30px_rgba(249,196,6,0.25)] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
        >
          <span>Go to Dashboard</span>
          <SquaresFour size={28} weight="fill" />
        </button>
        <button 
          onClick={() => setCurrentView('HOME')}
          className="w-full h-16 bg-white/5 text-primary border border-primary/30 rounded-[1.25rem] font-bold text-lg active:scale-[0.98] transition-all"
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
