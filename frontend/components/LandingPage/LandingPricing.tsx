import React from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, Building2, GraduationCap, Zap } from 'lucide-react';

const PLANS = [
  {
    name: "Individual",
    price: "Free",
    desc: "Perfect for individual lecturers managing their own courses.",
    features: [
      "Up to 3 Courses",
      "Real-time GPS Check-in",
      "Anti-proxy Verification",
      "Basic Analytics",
      "CSV Export"
    ],
    icon: <GraduationCap className="w-8 h-8 text-[#D4AF37]" />,
    buttonText: "Start Free",
    popular: false
  },
  {
    name: "Professional",
    price: "₦15k",
    period: "/sem",
    desc: "Enhanced features for power users and course coordinators.",
    features: [
      "Unlimited Courses",
      "Advanced Analytics & Trends",
      "Automated Reports",
      "Priority Support",
      "Mobile App Full Access",
      "Course Delegate Management"
    ],
    icon: <Zap className="w-8 h-8 text-[#D4AF37]" />,
    buttonText: "Go Pro",
    popular: true
  },
  {
    name: "Institution",
    price: "Custom",
    desc: "Full administrative control for entire departments or universities.",
    features: [
      "Department-wide Deployment",
      "Centralized Dashboard",
      "API Integration",
      "Single Sign-On (SSO)",
      "Audit Logs",
      "Dedicated Account Manager"
    ],
    icon: <Building2 className="w-8 h-8 text-[#D4AF37]" />,
    buttonText: "Contact Us",
    popular: false
  }
];

export const LandingPricing: React.FC = () => {
  return (
    <section className="py-32 bg-[#0A0A0A] relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 mb-6"
          >
            <Sparkles size={16} className="text-[#D4AF37]" />
            <span className="text-[#D4AF37] text-xs font-black uppercase tracking-[0.2em]">Transparent Pricing</span>
          </motion.div>
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-6">
            Invest in <span className="text-gradient-gold">Academic Integrity.</span>
          </h2>
          <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto font-medium">
            Choose the plan that fits your administrative scale. From single classrooms to entire university campuses.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative p-10 rounded-[3rem] border ${
                plan.popular
                  ? 'bg-gradient-to-br from-[#D4AF37]/20 to-[#0A0A0A] border-[#D4AF37]/40 shadow-[0_40px_80px_rgba(212,175,55,0.1)]'
                  : 'bg-white/5 border-white/10'
              } flex flex-col justify-between group hover:scale-[1.02] transition-all duration-500`}
            >
              {plan.popular && (
                <div className="absolute top-8 right-8 px-4 py-1 bg-[#D4AF37] rounded-full text-[#0A0A0A] text-[10px] font-black uppercase tracking-widest">
                  Most Popular
                </div>
              )}

              <div>
                <div className="mb-8">{plan.icon}</div>
                <h3 className="text-2xl font-black text-white tracking-tight mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-black text-white">{plan.price}</span>
                  {plan.period && <span className="text-zinc-500 font-bold">{plan.period}</span>}
                </div>
                <p className="text-zinc-400 text-sm font-medium leading-relaxed mb-8">{plan.desc}</p>

                <div className="space-y-4 mb-10">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20">
                        <Check size={12} className="text-[#D4AF37]" />
                      </div>
                      <span className="text-zinc-300 text-sm font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
                plan.popular
                  ? 'bg-[#D4AF37] text-[#0A0A0A] hover:bg-[#F4CF57] shadow-[0_20px_40px_rgba(212,175,55,0.2)]'
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
              }`}>
                {plan.buttonText}
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Decorative Orbs */}
      <div className="absolute top-1/2 left-0 w-[600px] h-[600px] bg-[#D4AF37]/5 blur-[120px] rounded-full pointer-events-none" />
    </section>
  );
};
