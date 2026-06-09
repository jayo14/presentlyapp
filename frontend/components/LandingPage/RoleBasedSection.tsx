import React from 'react';
import { motion } from 'framer-motion';
import { IconUser, IconChalkboard, IconBuilding, IconCircleCheck } from '@tabler/icons-react';
import { FeatureCard } from './FeatureCard';

export const RoleBasedSection = () => {
  return (
    <section className="py-40 bg-white relative overflow-hidden">
      {/* Background Orbs */}
      <div className="orb w-[800px] h-[800px] bg-sungold/5 -top-40 -left-40" />

      <div className="max-w-[1440px] mx-auto px-8 md:px-16 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-16 mb-24">
          <div className="max-w-4xl">
            <motion.div
               initial={{ opacity: 0, x: -20 }}
               whileInView={{ opacity: 1, x: 0 }}
               className="flex items-center gap-4 mb-8"
            >
               <div className="w-10 h-px bg-sungold" />
               <span className="text-sungold font-medium text-[11px] tracking-tight">Ecosystem governance</span>
            </motion.div>
            <h2 className="text-[clamp(2.5rem,5vw,5rem)] tracking-[-0.04em] text-neutral-900 leading-[0.9] font-medium">
              Tailored for every<br />
              <span className="text-neutral-400 italic ">academic tier.</span>
            </h2>
          </div>
          <p className="text-xl text-neutral-500 max-w-md leading-relaxed  lg:mb-4">
            A cohesive platform designed to align the goals of students, lecturers, and institutional leadership.
          </p>
        </div>

        <div className="flex flex-col gap-10">

          {/* Institutional Leadership */}
          <FeatureCard
            title="Institutional governance."
            description="The definitive dashboard for vice chancellors and registrars to monitor NUC compliance and university-wide engagement trends in real-time."
            icon={IconBuilding}
            color="#231F0F"
            features={["NUC audit readiness", "Faculty analytics", "Security oversight", "Data sovereignty"]}
            className="min-h-[500px] bg-neutral-50 border-black/5"
          >
             <div className="w-full flex justify-center p-8">
                <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl border border-black/5 relative group overflow-hidden">
                   <div className="flex justify-between items-center mb-10">
                      <div className="w-14 h-14 rounded-2xl bg-sungold/10 flex items-center justify-center">
                         <IconBuilding size={28} className="text-sungold" />
                      </div>
                      <div className="text-right">
                         <p className="text-[10px] font-medium text-neutral-400 tracking-tight">Campus health</p>
                         <p className="text-lg font-medium text-green-600 tracking-tight">Optimal</p>
                      </div>
                   </div>
                   <div className="space-y-5">
                      {[
                        { label: 'Faculty of science', val: 94, color: '#F9C406' },
                        { label: 'Faculty of arts', val: 82, color: '#22C55E' },
                        { label: 'Engineering', val: 88, color: '#F9C406' },
                      ].map((item, i) => (
                        <div key={i}>
                           <div className="flex justify-between text-[11px] font-medium tracking-tight text-neutral-400 mb-2">
                              <span>{item.label}</span>
                              <span>{item.val}%</span>
                           </div>
                           <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: `${item.val}%` }}
                                transition={{ duration: 1, delay: 0.5 + (i * 0.2) }}
                                className="h-full"
                                style={{ backgroundColor: item.color }}
                              />
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          </FeatureCard>

          <div className="grid lg:grid-cols-2 gap-10">
            {/* Lecturers */}
            <FeatureCard
              title="Academic authority."
              description="Empower lecturers with automated roll calls. Reclaim precious lecture minutes and focus on delivery while Presently handles the audit trail."
              icon={IconChalkboard}
              color="#F9C406"
              features={["Automated registers", "Live session feed", "Engagement heatmaps", "Export for senate"]}
              className="bg-neutral-50 border-black/5"
            >
              <div className="w-full flex justify-center py-8">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-black/5 w-full max-w-[320px] relative">
                  <div className="flex items-center justify-between mb-10">
                    <div className="h-3 w-28 bg-neutral-100 rounded-full" />
                    <div className="w-3 h-3 bg-sungold rounded-full animate-pulse shadow-[0_0_10px_rgba(249,196,6,0.5)]" />
                  </div>
                  <div className="space-y-6">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-neutral-50 border border-black/5" />
                        <div className="h-2 flex-1 bg-neutral-100 rounded-full" />
                        <IconCircleCheck size={20} className="text-sungold" />
                      </div>
                    ))}
                  </div>
                  <div className="mt-10 pt-6 border-t border-black/5 flex justify-between items-center">
                     <span className="text-[10px] font-medium text-neutral-400 tracking-tight">Active session</span>
                     <span className="text-sm font-medium text-neutral-900">142 present</span>
                  </div>
                </div>
              </div>
            </FeatureCard>

            {/* Students */}
            <FeatureCard
              title="Student sovereignty."
              description="A seamless check-in experience that respects student time and focus. Track your record and stay ahead of NUC eligibility requirements."
              icon={IconUser}
              color="#F9C406"
              features={["Instant check-in", "Personal audit trail", "Eligibility alerts", "Digital id card"]}
              className="bg-neutral-50 border-black/5"
            >
               <div className="w-full flex justify-center p-6">
                  <div className="relative w-60 h-[400px] bg-white rounded-[3rem] shadow-2xl p-8 overflow-hidden border-[6px] border-neutral-100">
                     <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-black rounded-full" />

                     <div className="mt-10 flex justify-between items-start mb-10">
                        <div className="w-10 h-10 rounded-xl bg-sungold/10 flex items-center justify-center">
                           <IconUser size={24} className="text-sungold" />
                        </div>
                        <div className="w-10 h-10 rounded-full border-2 border-neutral-100 overflow-hidden">
                           <img src="https://i.pravatar.cc/100?img=68" alt="Student" />
                        </div>
                     </div>

                     <div className="mb-8">
                        <p className="text-[10px] font-medium text-neutral-400 tracking-tight mb-2">My attendance</p>
                        <p className="text-5xl font-medium text-neutral-900 tracking-tight">88%</p>
                     </div>

                     <div className="h-28 bg-neutral-50 rounded-2xl border border-black/5 p-5 flex flex-col justify-center">
                        <p className="text-[10px] font-medium text-green-600 tracking-tight mb-2 flex items-center gap-2">
                           <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Eligible
                        </p>
                        <p className="text-xs  text-neutral-400 leading-relaxed">You have met the NUC 75% requirement for exams.</p>
                     </div>
                  </div>
               </div>
            </FeatureCard>
          </div>
        </div>
      </div>
    </section>
  );
};
