import React from 'react';
import {
  IconBuildingCommunity,
  IconTopologyStarRing3,
  IconWifiOff,
  IconDevices,
  IconArrowRight,
  IconChecklist,
  IconAlertCircle,
  IconShieldCheck
} from '@tabler/icons-react';

export const OriginStorySection: React.FC = () => {
  const engineeringLessons = [
    {
      icon: IconTopologyStarRing3,
      title: 'GPS Attenuation in Concrete Lecture Theatres',
      finding:
        'Thick reinforced concrete walls, heavy zinc roofs, and ground-floor amphitheaters attenuate satellite signals, creating GPS accuracy drift of 15m to 35m.',
      engineeringResponse:
        'Rather than a rigid point radius, Presently allows lecturers to set adaptive boundary buffers (25m–100m) matching the physical footprint of each specific hall.',
    },
    {
      icon: IconDevices,
      title: 'Extreme Student Smartphone Disparities',
      finding:
        'In any 200-student class, hardware spans from high-end devices to 6-year-old budget Android phones with worn batteries, fragmented browser versions, and varying sensor quality.',
      engineeringResponse:
        'We scrapped heavy native apps in favor of an ultra-lightweight Progressive Web App (<15KB payload) that opens instantly in Chrome, Safari, or Opera Mini.',
    },
    {
      icon: IconWifiOff,
      title: 'Campus Mobile Network Congestion',
      finding:
        'When hundreds of students connect to the nearest cell tower simultaneously, local 3G/4G bandwidth collapses, causing request timeouts.',
      engineeringResponse:
        'Check-in requests use minimal serialized payloads with exponential retry buffers, paired with a lecturer 1-tap manual override for the rare student whose phone completely disconnects.',
    },
  ];

  return (
    <section id="lasustech-story" className="py-24 bg-neutral-50 dark:bg-[#12110D] border-b border-neutral-200 dark:border-neutral-800">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sungold/15 border border-sungold/30 text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-4">
            <IconBuildingCommunity size={15} className="text-sungold" />
            <span>The LASUSTECH Academic Journey</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-neutral-900 dark:text-white leading-[1.15] mb-6">
            Born in the classroom. Tested against real campus constraints.
          </h2>
          <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Presently was not conceived in a distant corporate incubator. It grew out of firsthand exposure to the daily operational hurdles of Nigerian higher education at Lagos State University of Science and Technology (LASUSTECH).
          </p>
        </div>

        {/* Narrative Origin Box */}
        <div className="bg-white dark:bg-[#1A1813] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-8 md:p-12 mb-16 shadow-sm">
          <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-10 items-center">
            <div className="space-y-5 text-sm sm:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed">
              <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
                Why we built Presently
              </h3>
              <p>
                Watching a 45-minute lecture get repeatedly derailed by paper sheets passed row to row made one thing abundantly clear: traditional attendance record-keeping in Nigerian universities was broken.
              </p>
              <p>
                Students regularly signed for absent friends. Lecturers lost valuable instructional time managing sheets. At semester's end, computing the 75% examination eligibility threshold meant hours of manual reconciliation across stacks of frayed paper registers.
              </p>
              <p>
                LASUSTECH provided an authentic campus proving ground where early prototypes were exposed to crowded amphitheaters, unpredictable mobile signals, and real classroom dynamics. Every feature in Presently today was refined by those practical lessons.
              </p>
            </div>

            {/* Respectful Institutional Boundary Note */}
            <div className="bg-neutral-50 dark:bg-[#201D17] border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 text-xs text-neutral-600 dark:text-neutral-400 space-y-3">
              <div className="flex items-center gap-2 text-sungold font-bold uppercase tracking-wider text-[11px]">
                <IconAlertCircle size={16} />
                <span>Transparent Context & Integrity</span>
              </div>
              <p className="leading-relaxed">
                We believe in complete institutional honesty. LASUSTECH is the academic environment where Presently originated, was demonstrated, and underwent field trials.
              </p>
              <p className="leading-relaxed font-medium text-neutral-800 dark:text-neutral-200">
                This testing history reflects genuine engineering problem-solving—not a formal university-wide contract, regulatory endorsement, or exclusive institutional partnership.
              </p>
              <p className="text-[11px] text-neutral-500 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                Our mission is to build software that earns its place on merit, utility, and undeniable reliability.
              </p>
            </div>
          </div>
        </div>

        {/* Engineering Lessons Grid */}
        <div>
          <div className="max-w-2xl mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-sungold block mb-2">
              Engineering for Campus Realities
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white">
              Three critical challenges that shaped our platform.
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {engineeringLessons.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-[#1A1813] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 md:p-8 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-sungold/15 flex items-center justify-center text-sungold mb-6">
                      <Icon size={24} />
                    </div>

                    <h4 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">
                      {item.title}
                    </h4>

                    <div className="mb-4">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400 block mb-1">
                        Campus Reality:
                      </span>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                        {item.finding}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1">
                      Our Engineering Fix:
                    </span>
                    <p className="text-xs font-medium text-neutral-800 dark:text-neutral-200 leading-relaxed">
                      {item.engineeringResponse}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};
