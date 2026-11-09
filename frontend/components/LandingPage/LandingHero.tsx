import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IconArrowRight,
  IconMapPin,
  IconUsers,
  IconClock,
  IconCircleCheck,
  IconSchool,
  IconFileSpreadsheet,
  IconDeviceMobile,
  IconLock,
  IconBuildingBank
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';

export const Hero: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'lecturer' | 'student'>('lecturer');
  const [geofenceRadius, setGeofenceRadius] = useState(45);

  return (
    <section className="relative min-h-[92vh] bg-background pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden flex items-center">
      {/* Subtle Academic Warm Background Accents */}
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-sungold/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 w-full grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-16 items-center relative z-10">
        
        {/* Left Column: Positioning & Conversion */}
        <div className="flex flex-col justify-center">
          
          <div className="inline-flex items-center gap-2 mb-6 px-3.5 py-1.5 bg-sungold/15 border border-sungold/30 rounded-full w-fit">
            <span className="w-2 h-2 rounded-full bg-sungold animate-pulse" />
            <span className="text-xs font-semibold tracking-tight text-neutral-800 dark:text-neutral-200">
              Built for Nigerian Tertiary Institutions
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 dark:text-white leading-[1.1] mb-6">
            Accurate lecture attendance.<br />
            <span className="text-sungold font-medium">Built for Nigerian universities.</span>
          </h1>

          <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300 mb-8 max-w-xl leading-relaxed">
            Replace circulating paper sheets and tedious roll calls with location-aware attendance. Lecturers launch sessions in seconds, students check in on their own phones, and departments get automated exam eligibility records.
          </p>

          {/* Segmented CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-10">
            <a
              href="/register"
              className="bg-[#231F0F] text-white hover:bg-sungold hover:text-[#231F0F] px-8 py-4 rounded-xl text-base font-semibold tracking-tight flex items-center justify-center gap-3 shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
            >
              Start Free as Lecturer
              <IconArrowRight size={20} />
            </a>
            <a
              href="#institutions"
              className="px-6 py-4 rounded-xl text-base font-medium text-neutral-800 dark:text-neutral-200 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all flex items-center justify-center gap-2"
            >
              <IconBuildingBank size={18} className="text-sungold" />
              Request Campus Demo
            </a>
          </div>

          {/* Practical Campus Guarantees */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-neutral-200 dark:border-neutral-800 text-xs font-medium text-neutral-600 dark:text-neutral-400">
            <div className="flex items-center gap-2">
              <IconCircleCheck size={18} className="text-green-600 shrink-0" />
              <span>Zero biometric hardware</span>
            </div>
            <div className="flex items-center gap-2">
              <IconCircleCheck size={18} className="text-green-600 shrink-0" />
              <span>Works on mobile browser</span>
            </div>
            <div className="flex items-center gap-2">
              <IconCircleCheck size={18} className="text-green-600 shrink-0" />
              <span>Instant CSV exam export</span>
            </div>
          </div>
        </div>

        {/* Right Column: Realistic Interactive Working Interface */}
        <div className="relative">
          <div className="bg-white dark:bg-[#181612] rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xl overflow-hidden">
            
            {/* Mockup Top Header */}
            <div className="bg-neutral-50 dark:bg-[#201D17] px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                <span className="w-3 h-3 rounded-full bg-green-400 inline-block" />
                <span className="ml-3 text-xs font-mono font-medium text-neutral-500">presently.app/session</span>
              </div>
              
              {/* Perspective Selector */}
              <div className="flex bg-neutral-200 dark:bg-neutral-800 p-0.5 rounded-lg text-xs font-medium">
                <button
                  onClick={() => setActiveTab('lecturer')}
                  className={cn(
                    "px-3 py-1.5 rounded-md transition-all",
                    activeTab === 'lecturer'
                      ? "bg-white dark:bg-[#181612] text-neutral-900 dark:text-white shadow-sm font-semibold"
                      : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                  )}
                >
                  Lecturer View
                </button>
                <button
                  onClick={() => setActiveTab('student')}
                  className={cn(
                    "px-3 py-1.5 rounded-md transition-all",
                    activeTab === 'student'
                      ? "bg-white dark:bg-[#181612] text-neutral-900 dark:text-white shadow-sm font-semibold"
                      : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                  )}
                >
                  Student Check-in
                </button>
              </div>
            </div>

            {/* Mockup Body Content */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                {activeTab === 'lecturer' ? (
                  <motion.div
                    key="lecturer-view"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    {/* Course & Session Meta */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-neutral-100 dark:border-neutral-800">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono text-xs font-semibold">CSC 301</span>
                          <span className="text-xs text-neutral-500">3 Units · First Semester</span>
                        </div>
                        <h3 className="text-lg font-bold text-neutral-900 dark:text-white mt-1">Operating Systems Architecture</h3>
                        <p className="text-xs text-neutral-500 flex items-center gap-1.5 mt-0.5">
                          <IconMapPin size={14} className="text-sungold" /> Science Lecture Theatre (LT-02)
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active Session
                        </span>
                        <p className="text-xs font-mono text-neutral-500 mt-1 flex items-center justify-end gap-1">
                          <IconClock size={12} /> 18m remaining
                        </p>
                      </div>
                    </div>

                    {/* Active PIN & Geofence Controller */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-neutral-50 dark:bg-[#201D17] p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 text-center">
                        <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-500 block mb-1">Session Check-In PIN</span>
                        <div className="font-mono text-3xl font-extrabold tracking-widest text-neutral-900 dark:text-white">
                          8 4 9 2
                        </div>
                        <span className="text-[10px] text-neutral-500 block mt-1">Displayed on classroom board / screen</span>
                      </div>

                      <div className="bg-neutral-50 dark:bg-[#201D17] p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
                        <div className="flex items-center justify-between text-xs font-medium mb-1.5">
                          <span className="text-neutral-500">Geofence Radius</span>
                          <span className="font-mono font-bold text-sungold">{geofenceRadius} metres</span>
                        </div>
                        <input
                          type="range"
                          min="20"
                          max="120"
                          value={geofenceRadius}
                          onChange={(e) => setGeofenceRadius(Number(e.target.value))}
                          className="w-full accent-sungold cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
                          <span>Small Seminar (25m)</span>
                          <span>Large Amphitheatre (100m)</span>
                        </div>
                      </div>
                    </div>

                    {/* Real-time Attendee Roster */}
                    <div>
                      <div className="flex items-center justify-between text-xs font-medium mb-2.5">
                        <span className="text-neutral-700 dark:text-neutral-300 font-semibold flex items-center gap-1.5">
                          <IconUsers size={15} className="text-sungold" /> Live Verified Students
                        </span>
                        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                          87 / 94 present (92.5%)
                        </span>
                      </div>

                      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                        {[
                          { name: 'Adebayo, Olumide Emmanuel', matric: 'LASU/21/0492', time: '10:14:02 AM', dist: '14m from lectern' },
                          { name: 'Okonkwo, Chidinma Grace', matric: 'LASU/21/0511', time: '10:14:18 AM', dist: '22m from lectern' },
                          { name: 'Ibrahim, Babatunde Faruk', matric: 'LASU/21/0530', time: '10:15:05 AM', dist: '31m from lectern' },
                        ].map((student) => (
                          <div
                            key={student.matric}
                            className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-50 dark:bg-[#201D17] border border-neutral-100 dark:border-neutral-800/80 text-xs"
                          >
                            <div>
                              <p className="font-medium text-neutral-900 dark:text-neutral-100">{student.name}</p>
                              <p className="font-mono text-[11px] text-neutral-500">{student.matric}</p>
                            </div>
                            <div className="text-right">
                              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                                <IconCircleCheck size={13} /> Verified
                              </span>
                              <p className="text-[10px] text-neutral-400">{student.dist}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Session Actions */}
                    <div className="flex items-center justify-between pt-2">
                      <button className="text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white font-medium flex items-center gap-1.5">
                        <IconFileSpreadsheet size={16} className="text-emerald-600" /> Export CSV Register
                      </button>
                      <button className="text-xs bg-red-600/10 text-red-600 dark:text-red-400 font-semibold px-3 py-1.5 rounded-lg hover:bg-red-600/20 transition-colors">
                        Close Session
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="student-view"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="py-4 px-2 text-center"
                  >
                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-300 dark:border-emerald-800">
                      <IconCircleCheck size={36} className="text-emerald-600 dark:text-emerald-400" />
                    </div>

                    <span className="inline-block px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-full mb-2">
                      Location Verified & Recorded
                    </span>

                    <h4 className="text-xl font-bold text-neutral-900 dark:text-white">CSC 301 Check-In Confirmed</h4>
                    <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1 mb-6">
                      Your presence was authenticated within the Science Lecture Theatre boundary at 10:14 AM.
                    </p>

                    <div className="bg-neutral-50 dark:bg-[#201D17] p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 text-left max-w-sm mx-auto space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800">
                        <span className="text-neutral-500">Student:</span>
                        <span className="font-semibold text-neutral-800 dark:text-neutral-200">Adebayo, Olumide E.</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800">
                        <span className="text-neutral-500">Matric No:</span>
                        <span className="font-mono font-semibold text-neutral-800 dark:text-neutral-200">LASU/21/0492</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800">
                        <span className="text-neutral-500">Semester Attendance:</span>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">11 of 12 classes (91.7%)</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-neutral-500">Exam Eligibility:</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <IconCircleCheck size={14} /> Qualified (above 75%)
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
