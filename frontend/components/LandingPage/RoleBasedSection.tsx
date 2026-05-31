import React from 'react';
import { User, ChalkboardSimple, Building, CheckCircle } from '@phosphor-icons/react';
import { FeatureCard } from './FeatureCard';

export const RoleBasedSection = () => {
  return (
    <section className="py-64 bg-surface/30">
      <div className="max-w-[85%] md:max-w-[80%] mx-auto">
        <div className="mb-32">
          <span className="text-primary text-xs font-black tracking-[0.4em] uppercase mb-8 block">Built for everyone in the room</span>
          <h2 className="font-headline text-5xl md:text-7xl lg:text-8xl tracking-tighter text-on-surface leading-[0.9] font-black">Whoever you are,<br />Presently works for you.</h2>
        </div>

        <div className="mx-auto flex flex-col gap-24">

          {/* Card 1: Students */}
          <FeatureCard
            title="Focus on Learning."
            description="Attendance shouldn't be a distraction. We've made it as natural as walking into the classroom."
            icon={User}
            color="#F5C518"
            features={["One-tap Verification", "Attendance Tracker", "Missed Class Alerts", "Academic Calendar"]}
            className="min-h-[600px]"
          >
            <div className="w-full h-full flex items-center justify-center">
              <div className="relative w-72 h-[520px] bg-background rounded-[48px] shadow-2xl p-6 overflow-hidden border-[10px] border-outline/20 transition-all duration-700 group-hover:-rotate-3 group-hover:scale-105 skeuo-card">
                <div className="bg-surface h-full rounded-[38px] p-8 flex flex-col">
                  <div className="flex justify-between items-center mb-14">
                    <div className="w-12 h-12 rounded-full bg-primary shadow-inner border border-black/5" />
                    <div className="w-16 h-2 bg-surface-variant rounded-full" />
                  </div>
                  <div className="mb-14">
                    <p className="text-[10px] uppercase text-on-surface/40 font-black tracking-[0.2em] mb-2">Weekly Average</p>
                    <p className="text-6xl text-on-surface font-black tracking-tighter">92.4%</p>
                  </div>
                  <div className="space-y-5">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-center gap-4 bg-background/50 p-4 rounded-2xl border border-outline/10">
                        <div className="w-10 h-10 bg-surface-container rounded-xl shadow-sm" />
                        <div className="flex-1 space-y-2">
                          <div className="h-2.5 w-20 bg-surface-variant rounded-full" />
                          <div className="h-2 w-12 bg-surface-variant/40 rounded-full" />
                        </div>
                        <CheckCircle size={24} weight="fill" className="text-primary" />
                      </div>
                    ))}
                  </div>
                  <div className="mt-auto skeuo-button-gold py-5 rounded-3xl text-center text-[11px] font-black tracking-[0.1em]">
                    SESSION ACTIVE
                  </div>
                </div>
              </div>
            </div>
          </FeatureCard>

          <div className="grid lg:grid-cols-2 gap-24">
            {/* Card 2: Lecturers */}
            <FeatureCard
              title="Teach. Track. Done."
              description="No more manual registers. Open a session and let Presently handle the rest while you focus on delivery."
              icon={ChalkboardSimple}
              color="#38BDF8"
              features={["Live Feed", "Instant Export", "Auto-Grades", "Class Analytics"]}
            >
              <div className="w-full h-full flex items-center justify-center py-10">
                <div className="bg-white p-8 rounded-[40px] shadow-2xl border border-outline/20 w-full max-w-[320px] rotate-3 group-hover:rotate-0 transition-all duration-700 skeuo-card">
                  <div className="flex items-center justify-between mb-10">
                    <div className="h-3 w-24 bg-primary/20 rounded-full" />
                    <div className="h-4 w-4 bg-primary rounded-full animate-pulse" />
                  </div>
                  <div className="space-y-6">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200" />
                        <div className="h-2 flex-1 bg-slate-100 rounded-full" />
                        <div className="w-3 h-3 rounded-full bg-primary" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </FeatureCard>

            {/* Card 3: Admins */}
            <FeatureCard
              title="Campus Insights."
              description="A bird's eye view of your entire institution. Monitor compliance and trends in real-time."
              icon={Building}
              color="#34D399"
              features={["Faculty View", "Trend Reports", "Data Security", "Global Search"]}
            >
               <div className="flex gap-4 items-end h-48 w-full max-w-[280px] px-4">
                {[40, 70, 45, 90, 65, 80, 55, 95].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-primary/20 rounded-t-xl relative group/bar"
                    style={{ height: `${h}%` }}
                  >
                    <div className="absolute inset-0 bg-primary opacity-0 group-hover/bar:opacity-100 transition-opacity rounded-t-xl shadow-[0_-4px_12px_rgba(52,211,153,0.3)]" style={{ backgroundColor: '#34D399' }} />
                  </div>
                ))}
              </div>
            </FeatureCard>
          </div>
        </div>
      </div>
    </section>
  );
};
