import React, { useState } from 'react';
import {
  IconChalkboard,
  IconBuildingBank,
  IconArrowRight,
  IconCircleCheck,
  IconSend
} from '@tabler/icons-react';

export const CTASection: React.FC = () => {
  const [demoSubmitted, setDemoSubmitted] = useState(false);
  const [institutionName, setInstitutionName] = useState('');
  const [officialEmail, setOfficialEmail] = useState('');

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (institutionName && officialEmail) {
      setDemoSubmitted(true);
    }
  };

  return (
    <section id="demo-cta" className="py-24 bg-[#181612] text-white relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-sungold/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative z-10">
        
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-sungold mb-4">
            <span>Ready for Smarter Attendance</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.15] mb-6">
            Take attendance with confidence in your next lecture.
          </h2>
          <p className="text-base sm:text-lg text-neutral-400 leading-relaxed">
            Whether you are an individual lecturer looking to reclaim 20 minutes of contact time or a Dean standardizing departmental records, Presently is ready for your classroom.
          </p>
        </div>

        {/* Dual Conversion Action Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          
          {/* Card 1: Individual Lecturer Path */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 md:p-10 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-sungold/20 text-sungold flex items-center justify-center mb-6">
                <IconChalkboard size={26} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-sungold block mb-2">
                For Individual Lecturers
              </span>
              <h3 className="text-2xl font-bold text-white mb-3">
                Start tracking courses free today.
              </h3>
              <p className="text-sm text-neutral-300 leading-relaxed mb-6">
                Create your account in 60 seconds. Set up your course, launch a verified geofenced session from the lectern, and download clean attendance CSVs immediately.
              </p>

              <ul className="space-y-2.5 text-xs text-neutral-300 mb-8">
                <li className="flex items-center gap-2">
                  <IconCircleCheck size={16} className="text-sungold shrink-0" />
                  <span>Free starter plan includes 1 course & unlimited sessions</span>
                </li>
                <li className="flex items-center gap-2">
                  <IconCircleCheck size={16} className="text-sungold shrink-0" />
                  <span>No institutional procurement or IT approval needed</span>
                </li>
                <li className="flex items-center gap-2">
                  <IconCircleCheck size={16} className="text-sungold shrink-0" />
                  <span>Instant student check-in via mobile web browser</span>
                </li>
              </ul>
            </div>

            <a
              href="/register"
              className="w-full sm:w-auto bg-sungold text-[#231F0F] hover:bg-sungold/90 py-3.5 px-6 rounded-xl text-sm font-bold tracking-tight flex items-center justify-center gap-2 transition-all shadow-md"
            >
              Start Free as Lecturer <IconArrowRight size={18} />
            </a>
          </div>

          {/* Card 2: Institutional & Departmental Path */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 md:p-10 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-sungold/20 text-sungold flex items-center justify-center mb-6">
                <IconBuildingBank size={26} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-sungold block mb-2">
                For Heads of Department & Deans
              </span>
              <h3 className="text-2xl font-bold text-white mb-3">
                Request an institutional demonstration.
              </h3>
              <p className="text-sm text-neutral-300 leading-relaxed mb-6">
                See how Presently automates the 75% semester exam qualification rule, maps multiple campus lecture halls, and eliminates paper reconciliations across full departments.
              </p>

              {demoSubmitted ? (
                <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs mb-8">
                  <p className="font-bold mb-1">Thank you for your interest.</p>
                  <p>Our academic relations team will reach out to schedule your 15-minute campus walkthrough.</p>
                </div>
              ) : (
                <form onSubmit={handleDemoSubmit} className="space-y-3 mb-8">
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="University / Polytechnic name"
                      value={institutionName}
                      onChange={(e) => setInstitutionName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-sungold placeholder:text-neutral-500"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      required
                      placeholder="Official academic email (.edu.ng or similar)"
                      value={officialEmail}
                      onChange={(e) => setOfficialEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-sungold placeholder:text-neutral-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-white text-[#231F0F] hover:bg-neutral-200 py-3 rounded-xl text-xs font-bold tracking-tight flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    Request 15-Minute Campus Demo <IconSend size={15} />
                  </button>
                </form>
              )}
            </div>

            <p className="text-[11px] text-neutral-400">
              Or email our team directly at <span className="text-white font-mono">support@getpresently.com.ng</span>
            </p>
          </div>

        </div>

        {/* Practical Standards Footer Row */}
        <div className="pt-8 border-t border-white/10 flex flex-wrap items-center justify-between gap-6 text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Active Support for Nigerian Universities</span>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <span>TLS Encrypted Transit</span>
            <span>Point-in-Time Geofence Only</span>
            <span>Browser-Based Mobile Web</span>
          </div>
        </div>

      </div>
    </section>
  );
};
