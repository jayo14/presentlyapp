import React from 'react';
import {
  IconChalkboard,
  IconSchool,
  IconBuildingBank,
  IconShieldLock,
  IconCheck,
  IconArrowRight
} from '@tabler/icons-react';

export const RoleBenefitsSection: React.FC = () => {
  const audiences = [
    {
      role: 'University Lecturers',
      icon: IconChalkboard,
      tagline: 'Focus on teaching, not paper monitoring',
      points: [
        'Launch attendance in 20 seconds using your smartphone or laptop',
        'Reclaim 15–20 minutes of instructional contact time per class',
        'Instant CSV export formatted for departmental submission',
        '1-tap manual override for students with flat batteries or phone issues',
      ],
      ctaText: 'Start Free as Lecturer',
      ctaHref: '/register',
    },
    {
      role: 'Students & Course Reps',
      icon: IconSchool,
      tagline: 'Transparent, dispute-free attendance records',
      points: [
        'Check in directly from mobile browser without installing bulky apps',
        'Immediate digital verification pass with updated semester percentages',
        'Zero background tracking—location is verified only during check-in',
        'Eliminate unfair proxy attendance by absent coursemates',
      ],
      ctaText: 'Student Guide',
      ctaHref: '#how-it-works',
    },
    {
      role: 'Heads of Department (HODs)',
      icon: IconBuildingBank,
      tagline: 'Objective compliance and exam clearance',
      points: [
        'Live departmental dashboard across all course codes and levels',
        'Automated 70%/75% minimum attendance rule enforcement for exams',
        'Eliminate end-of-semester paper tallying and student disputes',
        'Tamper-resistant attendance archives for faculty board meetings',
      ],
      ctaText: 'Department Pilot',
      ctaHref: '#institutions',
    },
    {
      role: 'Deans & University Leadership',
      icon: IconShieldLock,
      tagline: 'Institutional integrity without hardware overhead',
      points: [
        'Zero capital expenditure on wall-mounted biometric fingerprint devices',
        'Standardized attendance metrics across faculties and departments',
        'Transparent, verifiable evidence for NUC accreditation preparation',
        'Secure multi-tenant cloud architecture with role-based permissions',
      ],
      ctaText: 'Request Institutional Demo',
      ctaHref: '#institutions',
    },
  ];

  return (
    <section id="institutions" className="py-24 bg-white dark:bg-[#15130F] border-b border-neutral-200 dark:border-neutral-800">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-sungold block mb-3">
            Ecosystem Value
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-neutral-900 dark:text-white leading-[1.15] mb-6">
            Aligned value for every academic stakeholder.
          </h2>
          <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Attendance management succeeds only when it works for everyone—from the student sitting at the back of the lecture theatre to the Deputy Vice Chancellor reviewing faculty reports.
          </p>
        </div>

        {/* 4 Audience Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {audiences.map((aud, idx) => {
            const Icon = aud.icon;
            return (
              <div
                key={idx}
                className="bg-neutral-50 dark:bg-[#1A1813] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-8 flex flex-col justify-between hover:border-sungold/40 transition-all"
              >
                <div>
                  <div className="flex items-center gap-3.5 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-sungold/15 flex items-center justify-center text-sungold shrink-0">
                      <Icon size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                        {aud.role}
                      </h3>
                      <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
                        {aud.tagline}
                      </p>
                    </div>
                  </div>

                  <ul className="space-y-3.5 mb-8">
                    {aud.points.map((pt, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-3 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300">
                        <IconCheck size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-snug">{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6 border-t border-neutral-200 dark:border-neutral-800">
                  <a
                    href={aud.ctaHref}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-900 dark:text-white hover:text-sungold dark:hover:text-sungold transition-colors"
                  >
                    {aud.ctaText} <IconArrowRight size={15} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
