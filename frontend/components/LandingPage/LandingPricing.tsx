import React, { useState } from 'react';
import { IconCheck, IconArrowRight, IconBuildingBank, IconSparkles } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

export const LandingPricing: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  const plans = [
    {
      name: 'Starter',
      price: 'Free',
      period: 'forever',
      description: 'Ideal for an individual lecturer introducing digital attendance to their classroom.',
      badge: null,
      highlight: false,
      features: [
        '1 active course',
        'Unlimited sessions and check-ins',
        'Location-aware GPS verification',
        'Dynamic 4-digit session PINs',
        'Standard CSV attendance register export',
        '1-tap lecturer manual check-in override',
      ],
      ctaText: 'Start Free as Lecturer',
      ctaHref: '/register',
    },
    {
      name: 'Lecturer Pro',
      price: billingCycle === 'yearly' ? '₦30,000' : '₦3,000',
      period: billingCycle === 'yearly' ? '/year' : '/month',
      description: 'For active lecturers handling multiple courses and levels across semesters.',
      badge: 'Most Popular for Academics',
      highlight: true,
      features: [
        'Unlimited courses and levels',
        'Unlimited sessions and students',
        'Full location-aware GPS verification',
        'Student attendance percentage analytics',
        'Automated 75% exam threshold alerts',
        'Advanced CSV and PDF report exports',
        'Priority lecturer email support',
      ],
      ctaText: 'Get Started with Pro',
      ctaHref: '/register',
    },
    {
      name: 'Department',
      price: '₦200,000',
      period: '/year',
      description: 'For academic departments standardizing attendance records across all teaching staff.',
      badge: 'Faculty Standard',
      highlight: false,
      features: [
        'Up to 10 lecturer accounts',
        'Departmental administrator dashboard',
        'Cross-course attendance monitoring',
        'Automated 75% exam clearance lists',
        'Centralized departmental CSV/Excel exports',
        'Faculty onboarding and setup guidance',
        'Dedicated technical support channel',
      ],
      ctaText: 'Inquire for Department',
      ctaHref: '#institutions',
    },
  ];

  return (
    <section id="pricing" className="py-24 bg-white dark:bg-[#15130F] border-b border-neutral-200 dark:border-neutral-800">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-sungold block mb-3">
            Transparent Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-neutral-900 dark:text-white leading-[1.15] mb-6">
            Predictable plans. Built for Nigerian academics.
          </h2>
          <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Start completely free for individual courses. Upgrade when managing multiple academic levels or rolling out across a full department.
          </p>
        </div>

        {/* Billing Cycle Switcher */}
        <div className="flex items-center gap-3 mb-12">
          <div className="p-1 bg-neutral-100 dark:bg-[#1E1B15] border border-neutral-200 dark:border-neutral-800 rounded-xl flex items-center">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-semibold transition-all",
                billingCycle === 'monthly'
                  ? "bg-white dark:bg-[#15130F] text-neutral-900 dark:text-white shadow-sm"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              )}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5",
                billingCycle === 'yearly'
                  ? "bg-white dark:bg-[#15130F] text-neutral-900 dark:text-white shadow-sm"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              )}
            >
              Annual Billing
              <span className="px-1.5 py-0.5 rounded bg-sungold/20 text-charcoal-900 dark:text-sungold text-[10px] font-bold">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={cn(
                "rounded-2xl p-8 flex flex-col justify-between transition-all",
                plan.highlight
                  ? "bg-[#231F0F] text-white border-2 border-sungold shadow-xl relative"
                  : "bg-neutral-50 dark:bg-[#1A1813] border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white"
              )}
            >
              <div>
                {plan.badge && (
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-sungold text-[#231F0F] px-2.5 py-0.5 rounded-full mb-4">
                    {plan.badge}
                  </span>
                )}

                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                <p className={cn("text-xs mb-6", plan.highlight ? "text-neutral-300" : "text-neutral-500")}>
                  {plan.description}
                </p>

                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-4xl font-extrabold tracking-tight font-mono">{plan.price}</span>
                  <span className={cn("text-xs font-medium", plan.highlight ? "text-neutral-400" : "text-neutral-500")}>
                    {plan.period}
                  </span>
                </div>

                <div className="border-t border-neutral-200/40 dark:border-neutral-800 pt-6 mb-8">
                  <span className={cn("text-xs font-semibold block mb-3 uppercase tracking-wider", plan.highlight ? "text-sungold" : "text-neutral-400")}>
                    Included capabilities:
                  </span>
                  <ul className="space-y-3">
                    {plan.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2.5 text-xs">
                        <IconCheck size={16} className={cn("shrink-0 mt-0.5", plan.highlight ? "text-sungold" : "text-emerald-600")} />
                        <span className={plan.highlight ? "text-neutral-200" : "text-neutral-700 dark:text-neutral-300"}>
                          {feat}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <a
                  href={plan.ctaHref}
                  className={cn(
                    "w-full py-3 rounded-xl text-xs font-semibold tracking-tight flex items-center justify-center gap-2 transition-all",
                    plan.highlight
                      ? "bg-sungold text-[#231F0F] hover:bg-sungold/90"
                      : "bg-[#231F0F] text-white dark:bg-white dark:text-[#231F0F] hover:bg-[#231F0F]/80 dark:hover:bg-neutral-200"
                  )}
                >
                  {plan.ctaText} <IconArrowRight size={15} />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Institution-Wide Tier Box */}
        <div className="bg-neutral-50 dark:bg-[#1A1813] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-8 md:p-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sungold mb-2">
              <IconBuildingBank size={18} />
              <span>Institutional Rollout</span>
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
              Custom deployment for faculties & full universities.
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Tailored for polytechnics, colleges of education, and universities deploying across multiple colleges. Includes institutional single-sign-on (SSO), campus venue GPS mapping, dedicated on-site lecturer onboarding workshops, and service level agreements (SLAs).
            </p>
          </div>
          <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <a
              href="#institutions"
              className="bg-[#231F0F] text-white hover:bg-sungold hover:text-[#231F0F] px-6 py-3 rounded-xl text-xs sm:text-sm font-semibold tracking-tight flex items-center justify-center gap-2 transition-all"
            >
              Contact Institutional Sales <IconArrowRight size={16} />
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};
