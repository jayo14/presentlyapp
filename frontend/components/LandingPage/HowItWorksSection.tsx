import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IconChalkboard,
  IconSchool,
  IconBuildingBank,
  IconArrowRight,
  IconCircleCheck,
  IconMapPin,
  IconDeviceMobile,
  IconFileSpreadsheet,
  IconClock,
  IconShieldCheck
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';

export const HowItWorksSection: React.FC = () => {
  const [activeRole, setActiveRole] = useState<'lecturer' | 'student' | 'admin'>('lecturer');

  const workflows = {
    lecturer: {
      roleTitle: 'For University Lecturers',
      roleBadge: 'Simple & Autonomous',
      summary: 'Launch an authenticated attendance session in under 30 seconds without submitting requests to campus IT.',
      steps: [
        {
          num: '01',
          title: 'Select Course & Set Geofence Radius',
          desc: 'Choose your course (e.g. CSC 301) and specify the venue boundary radius (typically 25m–60m based on room size). The system captures your lectern coordinates.',
          tag: '10 seconds',
        },
        {
          num: '02',
          title: 'Share the Dynamic 4-Digit PIN',
          desc: 'Presently generates an ephemeral session PIN. Write it on the chalkboard or project it onto the classroom screen for physically present students.',
          tag: 'Classroom display',
        },
        {
          num: '03',
          title: 'Review Live Stream & Export Roster',
          desc: 'Watch authenticated student check-ins stream in live. Use the 1-tap manual override for rare phone issues, then export a certified CSV attendance register.',
          tag: 'Instant CSV export',
        },
      ],
      previewHeadline: 'Active Lecturer Session Control',
      previewDetails: [
        { label: 'Venue Lock', value: 'Faculty Amphitheatre (LT-02)' },
        { label: 'Dynamic PIN', value: '8492 (Expires with session)' },
        { label: 'Check-in Latency', value: '< 4 seconds per student' },
        { label: 'Manual Fallback', value: '1-tap manual mark for dead batteries' },
      ],
    },
    student: {
      roleTitle: 'For University Students',
      roleBadge: 'Frictionless & Fast',
      summary: 'Check into lectures in seconds using your regular mobile browser. No bloated apps or complex logins required.',
      steps: [
        {
          num: '01',
          title: 'Open Check-in on Mobile Browser',
          desc: 'Access the lightweight mobile check-in portal on Chrome, Safari, or Opera Mini. It loads in under 1 second even on 3G connections.',
          tag: 'Zero app install needed',
        },
        {
          num: '02',
          title: 'Enter Course PIN & Matric Number',
          desc: 'Type in the 4-digit session code announced by your lecturer along with your university matriculation number.',
          tag: 'Quick verification',
        },
        {
          num: '03',
          title: 'Instant Verified Check-in Pass',
          desc: 'Your device checks that you are inside the hall boundary. A digital receipt confirms your attendance, and your semester total updates immediately.',
          tag: 'Instant digital receipt',
        },
      ],
      previewHeadline: 'Student Digital Check-in Pass',
      previewDetails: [
        { label: 'Privacy Guarantee', value: 'Location checked only during check-in' },
        { label: 'Compatibility', value: 'Any standard Android or iOS smartphone' },
        { label: 'Transparency', value: 'Live view of personal attendance percentage' },
        { label: 'Exam Status', value: 'Clear eligibility indicator for final exams' },
      ],
    },
    admin: {
      roleTitle: 'For Heads of Department & Deans',
      roleBadge: 'Departmental Oversight',
      summary: 'Centralize attendance intelligence, monitor faculty lecture delivery, and eliminate exam clearance friction.',
      steps: [
        {
          num: '01',
          title: 'Monitor Department Lecture Attendance',
          desc: 'Gain an objective departmental dashboard showing active attendance rates across all levels and course codes in real time.',
          tag: 'Real-time overview',
        },
        {
          num: '02',
          title: 'Enforce University Attendance Regulations',
          desc: 'Automatically flag students who fall below institutional cutoffs (e.g. 70% or 75%) before the end of teaching weeks.',
          tag: 'Early warning system',
        },
        {
          num: '03',
          title: 'Generate Certified Senate / Exam Reports',
          desc: 'Export verified attendance summaries directly into department archives, ready for faculty board meetings and accreditation audits.',
          tag: 'Tamper-resistant audit',
        },
      ],
      previewHeadline: 'Departmental Clearance Console',
      previewDetails: [
        { label: 'Compliance Rule', value: 'Automated 75% minimum threshold' },
        { label: 'Audit Trail', value: 'Timestamped lecturer & student records' },
        { label: 'Multi-Course View', value: 'Unified level and faculty aggregation' },
        { label: 'Accreditation Prep', value: 'Export-ready documentation for audits' },
      ],
    },
  };

  const current = workflows[activeRole];

  return (
    <section id="how-it-works" className="py-24 bg-neutral-50 dark:bg-[#12110D]">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-sungold block mb-3">
            Streamlined Workflows
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-neutral-900 dark:text-white leading-[1.15] mb-6">
            How Presently works in real Nigerian classrooms.
          </h2>
          <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Designed to fit naturally into everyday lecture routines without disrupting academic contact time. Explore how each stakeholder interacts with the system.
          </p>
        </div>

        {/* Role Switcher Tabs */}
        <div className="flex flex-wrap gap-2.5 mb-12 p-1.5 bg-neutral-200/70 dark:bg-[#1E1B15] rounded-xl w-fit border border-neutral-300 dark:border-neutral-800">
          <button
            onClick={() => setActiveRole('lecturer')}
            className={cn(
              "px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-2",
              activeRole === 'lecturer'
                ? "bg-[#231F0F] text-white dark:bg-sungold dark:text-[#231F0F] shadow-sm"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            )}
          >
            <IconChalkboard size={18} />
            For Lecturers
          </button>
          <button
            onClick={() => setActiveRole('student')}
            className={cn(
              "px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-2",
              activeRole === 'student'
                ? "bg-[#231F0F] text-white dark:bg-sungold dark:text-[#231F0F] shadow-sm"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            )}
          >
            <IconSchool size={18} />
            For Students
          </button>
          <button
            onClick={() => setActiveRole('admin')}
            className={cn(
              "px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-2",
              activeRole === 'admin'
                ? "bg-[#231F0F] text-white dark:bg-sungold dark:text-[#231F0F] shadow-sm"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            )}
          >
            <IconBuildingBank size={18} />
            For HODs & Deans
          </button>
        </div>

        {/* Role Content Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeRole}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="grid lg:grid-cols-[1.2fr_0.8fr] gap-12 items-start"
          >
            {/* Steps Column */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-sungold bg-sungold/10 px-3 py-1 rounded-md">
                  {current.roleBadge}
                </span>
                <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                  {current.roleTitle}
                </span>
              </div>

              <p className="text-base text-neutral-600 dark:text-neutral-300 leading-relaxed">
                {current.summary}
              </p>

              <div className="space-y-4 pt-2">
                {current.steps.map((step) => (
                  <div
                    key={step.num}
                    className="p-6 bg-white dark:bg-[#1A1813] border border-neutral-200 dark:border-neutral-800 rounded-xl relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-extrabold text-sungold bg-sungold/10 px-2 py-1 rounded">
                          STEP {step.num}
                        </span>
                        <h4 className="text-base font-bold text-neutral-900 dark:text-white">
                          {step.title}
                        </h4>
                      </div>
                      <span className="text-[11px] font-mono text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded shrink-0">
                        {step.tag}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed pl-1">
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Role Verification Guarantee Card */}
            <div className="bg-white dark:bg-[#1A1813] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-8 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-sungold/15 flex items-center justify-center text-sungold mb-6">
                <IconShieldCheck size={26} />
              </div>

              <h4 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                {current.previewHeadline}
              </h4>
              <p className="text-xs text-neutral-500 mb-6">
                Engineered with built-in safeguards for Nigerian campus conditions.
              </p>

              <div className="space-y-3.5 border-t border-neutral-100 dark:border-neutral-800 pt-6">
                {current.previewDetails.map((item, idx) => (
                  <div key={idx} className="flex items-start justify-between gap-4 text-xs">
                    <span className="font-medium text-neutral-500">{item.label}</span>
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100 text-right">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-neutral-100 dark:border-neutral-800">
                {activeRole === 'lecturer' ? (
                  <a
                    href="/register"
                    className="w-full bg-[#231F0F] text-white hover:bg-sungold hover:text-[#231F0F] py-3 rounded-xl text-xs font-semibold tracking-tight flex items-center justify-center gap-2 transition-all"
                  >
                    Start Free Session as Lecturer <IconArrowRight size={15} />
                  </a>
                ) : activeRole === 'admin' ? (
                  <a
                    href="#institutions"
                    className="w-full bg-[#231F0F] text-white hover:bg-sungold hover:text-[#231F0F] py-3 rounded-xl text-xs font-semibold tracking-tight flex items-center justify-center gap-2 transition-all"
                  >
                    Request Department Pilot Proposal <IconArrowRight size={15} />
                  </a>
                ) : (
                  <a
                    href="/register"
                    className="w-full bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 py-3 rounded-xl text-xs font-semibold tracking-tight flex items-center justify-center gap-2 transition-all"
                  >
                    Learn How Students Check In <IconArrowRight size={15} />
                  </a>
                )}
              </div>
            </div>

          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  );
};
