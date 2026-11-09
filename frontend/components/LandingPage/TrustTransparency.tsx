import React from 'react';
import {
  IconShieldCheck,
  IconLock,
  IconMapPinOff,
  IconDeviceMobileCheck,
  IconCircleCheck,
  IconHelpCircle
} from '@tabler/icons-react';

export const TrustTransparency: React.FC = () => {
  const safeguards = [
    {
      icon: IconMapPinOff,
      title: 'Point-in-Time Location Verification',
      subtitle: 'Zero continuous or background tracking',
      description:
        'Presently checks coordinates only at the exact instant a student clicks "Check In" to verify proximity to the classroom. Once confirmed, GPS queries immediately terminate. We never track students outside lecture hours or off campus.',
    },
    {
      icon: IconDeviceMobileCheck,
      title: 'Device & Hardware Independence',
      subtitle: 'Accessible on any standard smartphone',
      description:
        'No student is required to purchase expensive flagship phones or download large native applications. The Progressive Web App operates smoothly on budget Android phones running Chrome, Safari, or Opera Mini.',
    },
    {
      icon: IconHelpCircle,
      title: 'Documented Technical Failsafes',
      subtitle: 'Protection against technical edge cases',
      description:
        'We acknowledge that indoor satellite signals and mobile networks can fluctuate. Lecturers retain full pedagogical authority with an intuitive 1-tap manual verification tool so no student is unfairly marked absent due to phone technicalities.',
    },
    {
      icon: IconLock,
      title: 'Institutional Data Protection',
      subtitle: 'Role-based access & encrypted transit',
      description:
        'All attendance sessions and student records are transmitted over encrypted TLS connections. Institutional databases are isolated with strict role-based permissions preventing unauthorized student or third-party tampering.',
    },
  ];

  return (
    <section className="py-24 bg-neutral-50 dark:bg-[#12110D] border-b border-neutral-200 dark:border-neutral-800">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-sungold block mb-3">
            Trust & Transparency
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-neutral-900 dark:text-white leading-[1.15] mb-6">
            Principled engineering. Transparent practices.
          </h2>
          <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
            We do not make unverified claims about military biometrics or magical AI. We build robust, privacy-respecting attendance infrastructure designed specifically for higher education.
          </p>
        </div>

        {/* 4 Safeguards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {safeguards.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-[#1A1813] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-8"
              >
                <div className="flex items-center gap-3.5 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-sungold/15 flex items-center justify-center text-sungold shrink-0">
                    <Icon size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                      {item.title}
                    </h3>
                    <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
