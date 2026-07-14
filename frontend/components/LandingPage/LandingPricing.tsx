import React from 'react';
import { motion } from 'framer-motion';
import { IconCircleCheck, IconArrowRight } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

const PLANS = [
  {
    name: 'Starter',
    price: 'Free',
    period: null,
    description: 'For individual lecturers getting started.',
    features: [
      '1 course',
      'Unlimited students & sessions',
      'Basic attendance tracking',
      'Presently branding',
    ],
    cta: 'Get started',
    href: '/register',
    featured: false,
  },
  {
    name: 'Lecturer Pro',
    price: '₦3,000',
    period: '/month',
    description: 'For professional lecturers who need more.',
    features: [
      'Unlimited courses',
      'Advanced analytics & insights',
      'CSV/PDF export',
      'AI-powered insights',
      'No Presently branding',
      'Priority support',
    ],
    cta: 'Upgrade to Pro',
    href: '/pricing',
    featured: true,
  },
  {
    name: 'Department',
    price: '₦200k',
    period: '/year',
    description: 'For departments adopting Presently institution-wide.',
    features: [
      'Up to 10 lecturer seats',
      'All Pro features',
      'Department analytics',
      'Bulk seat management',
      'Dedicated onboarding',
    ],
    cta: 'Contact sales',
    href: '/contact',
    featured: false,
  },
];

export const LandingPricing = () => {
  const navigate = useNavigate();

  return (
    <section id="pricing" className="py-40 bg-white relative overflow-hidden">
      <div className="orb w-[1000px] h-[1000px] bg-sungold/5 -top-60 -right-60" />

      <div className="max-w-[1440px] mx-auto px-8 md:px-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-center text-center mb-24"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-px bg-sungold" />
            <span className="text-sungold font-medium text-[11px] tracking-tight">Pricing</span>
            <div className="w-10 h-px bg-sungold" />
          </div>
          <h2 className="text-[clamp(2.5rem,5vw,5rem)] tracking-[-0.04em] text-neutral-900 leading-[0.9] font-medium max-w-3xl">
            Simple, transparent<br />
            <span className="text-neutral-400 italic">pricing.</span>
          </h2>
          <p className="mt-6 text-xl text-neutral-500 max-w-lg">
            Start free. Upgrade when you outgrow it. No hidden fees, no surprises.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative flex flex-col rounded-3xl p-8 transition-all duration-300 ${
                plan.featured
                  ? 'bg-[#231F0F] text-white shadow-2xl shadow-sungold/10 scale-[1.02] md:scale-110 border-2 border-sungold/30'
                  : 'bg-neutral-50 border border-black/5 text-neutral-900 hover:border-sungold/30 hover:shadow-lg'
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-sungold px-4 py-1.5 text-[11px] font-semibold text-[#231F0F] tracking-tight">
                    Most popular
                  </span>
                </div>
              )}

              <h3 className={`text-2xl font-medium tracking-tight ${plan.featured ? 'text-white' : 'text-neutral-900'}`}>
                {plan.name}
              </h3>
              <p className={`mt-2 text-sm ${plan.featured ? 'text-white/60' : 'text-neutral-500'}`}>
                {plan.description}
              </p>

              <div className="mt-8 mb-8">
                <span className={`text-5xl font-medium tracking-tight ${plan.featured ? 'text-white' : 'text-neutral-900'}`}>
                  {plan.price}
                </span>
                {plan.period && (
                  <span className={`text-lg ${plan.featured ? 'text-white/50' : 'text-neutral-400'}`}>
                    {plan.period}
                  </span>
                )}
              </div>

              <ul className="space-y-3 mb-10 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <IconCircleCheck
                      size={18}
                      className={`mt-0.5 shrink-0 ${
                        plan.featured ? 'text-sungold' : 'text-sungold'
                      }`}
                    />
                    <span className={`text-sm ${plan.featured ? 'text-white/80' : 'text-neutral-600'}`}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => navigate(plan.href)}
                className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-sm font-semibold tracking-tight transition-all duration-200 ${
                  plan.featured
                    ? 'bg-sungold text-[#231F0F] hover:bg-sungold/90'
                    : 'bg-white text-neutral-900 border border-black/10 hover:border-sungold/50 hover:text-sungold shadow-sm'
                }`}
              >
                {plan.cta}
                <IconArrowRight size={16} />
              </button>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-sm text-neutral-400 mt-12"
        >
          All plans include end-to-end encryption, GPS geofencing, and NUC-compliant reporting.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-20 max-w-4xl mx-auto"
        >
          <div className="rounded-3xl border-2 border-dashed border-sungold/30 bg-sungold/[0.03] p-10 md:p-14 text-center">
            <h3 className="text-3xl md:text-4xl font-medium tracking-tight text-neutral-900">
              Institution-wide
            </h3>
            <p className="mt-4 text-lg text-neutral-500 max-w-2xl mx-auto leading-relaxed">
              Custom pricing for universities and polytechnics rolling out Presently across multiple colleges and departments. Includes white-label branding, dedicated support, and priority compliance.
            </p>
            <div className="mt-10 max-w-2xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4 text-left">
                {[
                  'Unlimited lecturer seats',
                  'Dedicated support',
                  'White-label branding',
                  'NUC compliance reports',
                  'Priority support SLA',
                  'Custom integrations',
                  'On-site training',
                  'Dedicated account manager',
                ].map((f) => (
                  <div key={f} className="flex items-center gap-3">
                    <IconCircleCheck size={18} className="shrink-0 text-sungold" />
                    <span className="text-sm text-neutral-600">{f}</span>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => navigate('/contact')}
              className="mt-10 inline-flex items-center gap-2 bg-[#231F0F] text-white px-8 py-3.5 rounded-xl text-sm font-semibold tracking-tight hover:bg-[#231F0F]/90 transition-colors"
            >
              Contact sales
              <IconArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
