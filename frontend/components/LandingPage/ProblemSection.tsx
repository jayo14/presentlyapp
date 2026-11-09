import React from 'react';
import { motion } from 'framer-motion';
import {
  IconFileDislike,
  IconUsers,
  IconCalculator,
  IconAlertTriangle,
  IconArrowRight,
  IconMapPinCheck,
  IconShieldLock,
  IconBuilding
} from '@tabler/icons-react';

export const ProblemSection: React.FC = () => {
  const challenges = [
    {
      step: '01',
      title: 'The Circulating Paper Shuffle',
      subtitle: 'Contact hours lost to administrative chaos',
      description:
        'In a lecture hall of 150 to 300 students, attendance paper sheets circulate row by row for up to 45 minutes. Lecturers are repeatedly interrupted, attention wanders, and sheets frequently go missing or get torn before reaching the lectern.',
      impact: 'Up to 20% of class time wasted on paper logistics',
      icon: IconFileDislike,
    },
    {
      step: '02',
      title: 'Rampant Proxy Attendance',
      subtitle: 'Forged signatures render registers meaningless',
      description:
        'Paper registers make proxy signing effortless. Absent students routinely have friends sign their names and matriculation numbers, making it impossible for faculties to know true student engagement or verify genuine attendance.',
      impact: 'Unfair advantage and compromised institutional integrity',
      icon: IconUsers,
    },
    {
      step: '03',
      title: 'End-of-Semester Clearance Nightmares',
      subtitle: 'Manual tallying during exam preparation',
      description:
        'When exam season arrives, lecturers and exam officers spend grueling hours counting individual tick marks across dozens of paper sheets to calculate who satisfies the mandatory 70% or 75% attendance threshold.',
      impact: 'Delayed exam rosters and disputes over missing paper records',
      icon: IconCalculator,
    },
    {
      step: '04',
      title: 'Fragile & Unverifiable Records',
      subtitle: 'Physical sheets offer zero audit trail',
      description:
        'A single cup of coffee, a rainstorm on the walk to the department office, or an unreturned sheet in a course rep’s bag can erase weeks of academic evidence. There is no backup, no digital audit trail, and no institutional visibility.',
      impact: 'Irrecoverable data loss and departmental vulnerability during accreditation',
      icon: IconAlertTriangle,
    },
  ];

  return (
    <section className="py-24 bg-white dark:bg-[#15130F] border-y border-neutral-200 dark:border-neutral-800">
      
      {/* Grounded Campus Context Banner */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 mb-20">
        <div className="bg-neutral-50 dark:bg-[#1C1914] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-sungold/15 border border-sungold/30 flex items-center justify-center shrink-0">
              <IconBuilding size={24} className="text-sungold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-sungold">Authentic Campus Origin</span>
                <span className="text-[11px] text-neutral-400">·</span>
                <span className="text-xs text-neutral-500">LASUSTECH Testing Journey</span>
              </div>
              <p className="text-sm md:text-base font-semibold text-neutral-900 dark:text-neutral-100 mt-0.5">
                Engineered from firsthand experience inside Nigerian university lecture halls.
              </p>
            </div>
          </div>
          <div className="text-xs text-neutral-600 dark:text-neutral-400 max-w-md leading-relaxed border-t md:border-t-0 md:border-l border-neutral-200 dark:border-neutral-800 pt-4 md:pt-0 md:pl-6">
            Tested across real lecture theatres, fluctuating mobile networks, and diverse student smartphones. Built to handle constraints, not ignore them.
          </div>
        </div>
      </div>

      {/* Main Problem Header */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="max-w-3xl mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-sungold block mb-3">
            The Campus Reality
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-neutral-900 dark:text-white leading-[1.15] mb-6">
            Why traditional attendance fails in Nigerian lecture halls.
          </h2>
          <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Paper sign-in sheets were designed for small tutorial groups decades ago. In modern tertiary institutions with large cohorts, they create administrative friction, enable proxy signing, and burden academic staff.
          </p>
        </div>

        {/* 4 Realistic Challenges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {challenges.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="bg-neutral-50 dark:bg-[#1A1813] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-8 hover:border-sungold/40 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-mono text-xs font-bold text-neutral-400 dark:text-neutral-500 bg-neutral-200/60 dark:bg-neutral-800 px-2.5 py-1 rounded-md">
                      CHALLENGE {item.step}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-neutral-200/50 dark:bg-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-300 group-hover:text-sungold transition-colors">
                      <Icon size={20} />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs font-medium text-amber-600 dark:text-amber-400 mb-4">
                    {item.subtitle}
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-800/80 flex items-center justify-between text-xs font-medium text-neutral-500">
                  <span className="text-[11px] font-semibold text-red-600 dark:text-red-400">
                    Consequence:
                  </span>
                  <span className="text-right text-[11px] text-neutral-700 dark:text-neutral-300">
                    {item.impact}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* The Transition Bridge */}
        <div className="mt-16 p-8 rounded-2xl bg-gradient-to-r from-sungold/10 via-amber-500/5 to-transparent border border-sungold/30 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h4 className="text-lg font-bold text-neutral-900 dark:text-white">
              Presently solves this at the point of lecture delivery.
            </h4>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              By combining venue geofencing with time-limited dynamic PINs, attendance is authenticated in seconds on students' existing smartphones.
            </p>
          </div>
          <a
            href="#how-it-works"
            className="shrink-0 bg-[#231F0F] text-white hover:bg-sungold hover:text-[#231F0F] px-6 py-3 rounded-xl text-xs sm:text-sm font-semibold tracking-tight flex items-center gap-2 transition-all"
          >
            See how it works <IconArrowRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
};
