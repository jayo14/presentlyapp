import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IconChalkboard,
  IconDeviceMobile,
  IconUsers,
  IconFileSpreadsheet,
  IconMapPin,
  IconCircleCheck,
  IconClock,
  IconDownload,
  IconCheck,
  IconAlertCircle,
  IconPlus,
  IconAdjustmentsHorizontal
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';

export const ProductShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'session' | 'student' | 'roster' | 'clearance'>('session');

  const tabs = [
    { id: 'session', label: '1. Session Launcher', icon: IconChalkboard },
    { id: 'student', label: '2. Student Mobile Pass', icon: IconDeviceMobile },
    { id: 'roster', label: '3. Real-Time Register', icon: IconUsers },
    { id: 'clearance', label: '4. Exam Clearance Export', icon: IconFileSpreadsheet },
  ] as const;

  return (
    <section id="product" className="py-24 bg-white dark:bg-[#15130F] border-b border-neutral-200 dark:border-neutral-800">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-sungold block mb-3">
            Core Product Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-neutral-900 dark:text-white leading-[1.15] mb-6">
            Tested interfaces designed for real university lectures.
          </h2>
          <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Every screen is engineered for speed, high-contrast readability, and fault tolerance. Zero bloated animations, zero fake metrics.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap gap-2.5 mb-8 p-1.5 bg-neutral-100 dark:bg-[#1C1914] rounded-xl w-fit border border-neutral-200 dark:border-neutral-800">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-2",
                  isSelected
                    ? "bg-[#231F0F] text-white dark:bg-sungold dark:text-[#231F0F] shadow-sm"
                    : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                )}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Interactive Showcase Viewport */}
        <div className="bg-neutral-50 dark:bg-[#1A1813] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 md:p-10 shadow-sm">
          <AnimatePresence mode="wait">
            
            {/* 1. Session Launcher */}
            {activeTab === 'session' && (
              <motion.div
                key="tab-session"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="grid lg:grid-cols-[1fr_1fr] gap-8 items-center"
              >
                <div>
                  <div className="inline-flex items-center gap-2 text-xs font-semibold text-sungold bg-sungold/10 px-3 py-1 rounded-md mb-4">
                    <IconChalkboard size={14} /> Lecturer Control
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3">
                    Launch in 20 seconds from the lectern
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6 leading-relaxed">
                    Select your registered course, verify your venue coordinates with your laptop or phone, and choose a boundary radius that matches the lecture theatre. The system generates an active session code instantly.
                  </p>
                  
                  <ul className="space-y-3 text-xs font-medium text-neutral-700 dark:text-neutral-300">
                    <li className="flex items-center gap-2">
                      <IconCheck size={16} className="text-green-600 shrink-0" />
                      <span>Configurable geofence radius (20m to 120m) for any hall size</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <IconCheck size={16} className="text-green-600 shrink-0" />
                      <span>Dynamic 4-digit PIN refreshed for each session</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <IconCheck size={16} className="text-green-600 shrink-0" />
                      <span>Custom timer countdown (e.g. 15, 30, or 60 minutes)</span>
                    </li>
                  </ul>
                </div>

                {/* Visual UI Box */}
                <div className="bg-white dark:bg-[#201D17] border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
                    <div>
                      <span className="text-[11px] font-mono text-neutral-500">SESSION CREATION</span>
                      <h4 className="text-base font-bold text-neutral-900 dark:text-white">MTH 201 · Linear Algebra</h4>
                    </div>
                    <span className="text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-semibold px-2 py-0.5 rounded">
                      GPS Acquired (±6m)
                    </span>
                  </div>

                  <div className="py-4 space-y-4">
                    <div>
                      <label className="text-xs font-medium text-neutral-500 block mb-1">Lecture Venue</label>
                      <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-lg text-xs font-medium text-neutral-900 dark:text-white flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <IconMapPin size={16} className="text-sungold" /> Engineering LT-01
                        </span>
                        <span className="text-[10px] text-neutral-400 font-mono">6.6018° N, 3.3515° E</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-lg">
                        <span className="text-[10px] text-neutral-400 block mb-1">Boundary Radius</span>
                        <span className="text-base font-bold text-neutral-900 dark:text-white">50 Metres</span>
                      </div>
                      <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-lg">
                        <span className="text-[10px] text-neutral-400 block mb-1">Active Duration</span>
                        <span className="text-base font-bold text-neutral-900 dark:text-white">45 Minutes</span>
                      </div>
                    </div>

                    <div className="p-4 bg-sungold/10 border border-sungold/30 rounded-xl text-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 block mb-1">
                        Active Classroom PIN
                      </span>
                      <div className="font-mono text-3xl font-extrabold tracking-widest text-neutral-900 dark:text-white">
                        5 9 1 3
                      </div>
                      <span className="text-[11px] text-neutral-500 mt-1 block">Display to students physically in attendance</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 2. Student Mobile Pass */}
            {activeTab === 'student' && (
              <motion.div
                key="tab-student"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="grid lg:grid-cols-[1fr_1fr] gap-8 items-center"
              >
                <div>
                  <div className="inline-flex items-center gap-2 text-xs font-semibold text-sungold bg-sungold/10 px-3 py-1 rounded-md mb-4">
                    <IconDeviceMobile size={14} /> Student Mobile Web
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3">
                    Fast check-in on any mobile browser
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6 leading-relaxed">
                    Students simply open their smartphone browser, input their matriculation number, and enter the active 4-digit code. The browser performs an instant point-in-time location verification against the hall boundary.
                  </p>
                  
                  <ul className="space-y-3 text-xs font-medium text-neutral-700 dark:text-neutral-300">
                    <li className="flex items-center gap-2">
                      <IconCheck size={16} className="text-green-600 shrink-0" />
                      <span>Zero heavy app installation required; works on lightweight browsers</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <IconCheck size={16} className="text-green-600 shrink-0" />
                      <span>Strict point-in-time check (no background tracking or battery drain)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <IconCheck size={16} className="text-green-600 shrink-0" />
                      <span>Immediate verification receipt with total semester attendance status</span>
                    </li>
                  </ul>
                </div>

                {/* Mobile Viewport Card */}
                <div className="max-w-sm mx-auto w-full bg-white dark:bg-[#201D17] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
                    <span className="text-xs font-bold text-neutral-900 dark:text-white">Presently Student Pass</span>
                    <span className="text-[10px] font-mono bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded text-neutral-500">
                      10:22 AM
                    </span>
                  </div>

                  <div className="py-6 text-center">
                    <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/60 rounded-full flex items-center justify-center mx-auto mb-3 border border-emerald-300 dark:border-emerald-700">
                      <IconCircleCheck size={28} className="text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 block mb-1">
                      Check-In Authenticated
                    </span>
                    <h4 className="text-lg font-bold text-neutral-900 dark:text-white">
                      MTH 201: Linear Algebra
                    </h4>
                    <p className="text-xs text-neutral-500 mt-0.5">Venue: Engineering LT-01</p>
                  </div>

                  <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-xl p-3.5 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Student:</span>
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200">Balogun, Kazeem A.</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Matric No:</span>
                      <span className="font-mono font-medium text-neutral-800 dark:text-neutral-200">LASU/22/1084</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-neutral-200/50 dark:border-neutral-700/50">
                      <span className="text-neutral-500">Total Attended:</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">12 of 14 (85.7%)</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 3. Real-Time Register */}
            {activeTab === 'roster' && (
              <motion.div
                key="tab-roster"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="grid lg:grid-cols-[1fr_1fr] gap-8 items-center"
              >
                <div>
                  <div className="inline-flex items-center gap-2 text-xs font-semibold text-sungold bg-sungold/10 px-3 py-1 rounded-md mb-4">
                    <IconUsers size={14} /> Live Roster & Failsafes
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3">
                    Watch attendance roll in with 1-tap manual override
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6 leading-relaxed">
                    Lecturers see students appear in real time as they check in. If a student's phone died or their browser location permission is misconfigured, the lecturer can search their name and manually verify them in 1 tap.
                  </p>
                  
                  <ul className="space-y-3 text-xs font-medium text-neutral-700 dark:text-neutral-300">
                    <li className="flex items-center gap-2">
                      <IconCheck size={16} className="text-green-600 shrink-0" />
                      <span>Live stream of matriculation numbers, timestamps, and distance tags</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <IconCheck size={16} className="text-green-600 shrink-0" />
                      <span>Manual override fallback protects students facing device edge cases</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <IconCheck size={16} className="text-green-600 shrink-0" />
                      <span>Instant CSV and Excel download for immediate departmental records</span>
                    </li>
                  </ul>
                </div>

                {/* Attendee List Table UI */}
                <div className="bg-white dark:bg-[#201D17] border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800 text-xs">
                    <div>
                      <span className="font-bold text-neutral-900 dark:text-white">Active Class Roster</span>
                      <p className="text-[10px] text-neutral-400">112 of 124 students present (90.3%)</p>
                    </div>
                    <button className="px-2.5 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded text-[11px] font-semibold flex items-center gap-1">
                      <IconPlus size={13} /> Manual Add
                    </button>
                  </div>

                  <div className="py-2 space-y-2">
                    {[
                      { name: 'Ogunlesi, Toyosi Vivian', matric: 'LASU/22/0129', status: 'Verified', time: '10:18:11 AM', manual: false },
                      { name: 'Abdullahi, Sadiq Usman', matric: 'LASU/22/0140', status: 'Verified', time: '10:19:04 AM', manual: false },
                      { name: 'Ezekiel, Progress Chidera', matric: 'LASU/22/0155', status: 'Manual Mark', time: '10:21:45 AM', manual: true },
                    ].map((row, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 text-xs"
                      >
                        <div>
                          <p className="font-medium text-neutral-900 dark:text-white">{row.name}</p>
                          <p className="font-mono text-[10px] text-neutral-500">{row.matric}</p>
                        </div>
                        <div className="text-right">
                          <span
                            className={cn(
                              "text-[10px] font-semibold px-2 py-0.5 rounded",
                              row.manual
                                ? "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400"
                                : "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400"
                            )}
                          >
                            {row.status}
                          </span>
                          <p className="text-[10px] text-neutral-400 mt-0.5">{row.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
                    <button className="text-xs bg-[#231F0F] text-white hover:bg-sungold hover:text-[#231F0F] px-3.5 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all">
                      <IconDownload size={14} /> Download CSV Roster
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 4. Exam Clearance Export */}
            {activeTab === 'clearance' && (
              <motion.div
                key="tab-clearance"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="grid lg:grid-cols-[1fr_1fr] gap-8 items-center"
              >
                <div>
                  <div className="inline-flex items-center gap-2 text-xs font-semibold text-sungold bg-sungold/10 px-3 py-1 rounded-md mb-4">
                    <IconFileSpreadsheet size={14} /> Departmental Auditing
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3">
                    Automated 75% semester examination eligibility
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6 leading-relaxed">
                    Eliminate weeks of manual tick-mark reconciliation before examinations. Presently computes every student's cumulative percentage across the entire semester, instantly flagging those below the university's qualification threshold.
                  </p>
                  
                  <ul className="space-y-3 text-xs font-medium text-neutral-700 dark:text-neutral-300">
                    <li className="flex items-center gap-2">
                      <IconCheck size={16} className="text-green-600 shrink-0" />
                      <span>Configurable threshold rule (70%, 75%, or custom departmental cutoff)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <IconCheck size={16} className="text-green-600 shrink-0" />
                      <span>Clear eligibility badges: Qualified, At Risk, or Ineligible</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <IconCheck size={16} className="text-green-600 shrink-0" />
                      <span>Audit-ready PDF / CSV exports formatted for faculty board submission</span>
                    </li>
                  </ul>
                </div>

                {/* Clearance Table UI */}
                <div className="bg-white dark:bg-[#201D17] border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800 text-xs">
                    <div>
                      <span className="font-bold text-neutral-900 dark:text-white">Exam Eligibility Roster</span>
                      <p className="text-[10px] text-neutral-400">Department of Computer Science · 2025/2026</p>
                    </div>
                    <span className="font-mono text-[11px] font-bold text-sungold bg-sungold/10 px-2.5 py-0.5 rounded">
                      Cutoff: 75%
                    </span>
                  </div>

                  <div className="py-3 space-y-2.5">
                    {[
                      { name: 'Bello, Rasheed O.', matric: 'LASU/21/0081', rate: '92%', status: 'Cleared for Exam', color: 'emerald' },
                      { name: 'Dada, Favour Titilayo', matric: 'LASU/21/0095', rate: '81%', status: 'Cleared for Exam', color: 'emerald' },
                      { name: 'Ogunbiyi, Joshua A.', matric: 'LASU/21/0104', rate: '71%', status: 'Below Cutoff (Ineligible)', color: 'red' },
                    ].map((row, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 text-xs"
                      >
                        <div>
                          <p className="font-medium text-neutral-900 dark:text-white">{row.name}</p>
                          <p className="font-mono text-[10px] text-neutral-500">{row.matric}</p>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-neutral-900 dark:text-white mr-2">
                            {row.rate}
                          </span>
                          <span
                            className={cn(
                              "text-[10px] font-semibold px-2 py-0.5 rounded",
                              row.color === 'emerald'
                                ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400"
                                : "bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400"
                            )}
                          >
                            {row.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex justify-between items-center text-xs">
                    <span className="text-[11px] text-neutral-500">Total: 96% of class qualified</span>
                    <button className="bg-[#231F0F] text-white hover:bg-sungold hover:text-[#231F0F] px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all">
                      <IconDownload size={14} /> Export Senate Sheet
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>
    </section>
  );
};
