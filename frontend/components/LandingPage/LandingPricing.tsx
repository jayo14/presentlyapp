import React from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, Building2, GraduationCap, Zap, ArrowRight } from 'lucide-react';

const PLANS = [
  {
    name: "Departmental",
    price: "₦2k",
    period: " /student",
    desc: "Perfect for single departments looking to digitize their attendance process and eliminate lost sheets.",
    features: [
      "GPS-Verified Check-ins",
      "Basic Proxy Prevention",
      "Automated CSV Reports",
      "Student & Lecturer Dashboards",
      "Mobile App Access"
    ],
    icon: <GraduationCap className="w-10 h-10 text-[#D4AF37]" />,
    buttonText: "Register Department",
    popular: false
  },
  {
    name: "Faculty-Wide",
    price: "₦5k",
    period: " /student",
    desc: "Comprehensive solution for large faculties with multi-departmental coordination and audit tools.",
    features: [
      "Everything in Departmental",
      "Advanced Analytics & Trends",
      "Exam Clearance Integration",
      "Biometric Verification (Beta)",
      "Priority Support",
      "Dedicated Onboarding"
    ],
    icon: <Zap className="w-10 h-10 text-[#D4AF37]" />,
    buttonText: "Popular Choice",
    popular: true
  },
  {
    name: "Institutional",
    price: "Custom",
    period: "",
    desc: "Enterprise-grade deployment for the entire university ecosystem with full SIS integration.",
    features: [
      "Everything in Faculty-Wide",
      "SSO & SIS Integration",
      "Full Audit Trails",
      "Custom Feature Development",
      "White-label Option",
      "24/7 Account Management"
    ],
    icon: <Building2 className="w-10 h-10 text-[#D4AF37]" />,
    buttonText: "Contact Sales",
    popular: false
  }
];

export const LandingPricing: React.FC = () => {
  return (
    <section className="py-40 bg-[#0A0A0A] relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 mb-8"
          >
            <Sparkles size={16} className="text-[#D4AF37]" />
            <span className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.3em]">Transparent Scaling</span>
          </motion.div>
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-8 leading-[0.9]">
            Invest in <span className="text-gradient-gold">Academic Integrity.</span>
          </h2>
          <p className="text-zinc-400 text-xl md:text-2xl max-w-3xl mx-auto font-medium leading-relaxed">
            Choose the scale that fits your institution. From single classrooms to entire university networks.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-10 max-w-7xl mx-auto">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.8 }}
              className={`relative p-12 rounded-[4rem] border ${
                plan.popular
                  ? 'bg-gradient-to-br from-[#D4AF37]/20 to-[#0A0A0A] border-[#D4AF37]/40 shadow-[0_40px_100px_rgba(212,175,55,0.2)]'
                  : 'bg-white/5 border-white/10'
              } flex flex-col justify-between group hover:scale-[1.03] transition-all duration-700 shadow-2xl`}
            >
              {plan.popular && (
                <div className="absolute top-10 right-10 px-5 py-1.5 bg-[#D4AF37] rounded-full text-[#0A0A0A] text-[10px] font-black uppercase tracking-widest shadow-lg">
                  Most Popular
                </div>
              )}

              <div>
                <div className="mb-10 p-5 bg-black/40 rounded-[1.5rem] w-fit border border-white/5">{plan.icon}</div>
                <h3 className="text-3xl font-black text-white tracking-tight mb-3">{plan.name}</h3>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-5xl font-black text-white tracking-tighter">{plan.price}</span>
                  {plan.period && <span className="text-zinc-500 font-bold text-lg">{plan.period}</span>}
                </div>
                <p className="text-zinc-400 text-base font-medium leading-relaxed mb-10">{plan.desc}</p>

                <div className="space-y-5 mb-12">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-4">
                      <div className="w-6 h-6 rounded-full bg-[#D4AF37]/15 flex items-center justify-center border border-[#D4AF37]/25">
                        <Check size={14} className="text-[#D4AF37]" />
                      </div>
                      <span className="text-zinc-300 text-base font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button className={`w-full py-6 rounded-2xl font-black text-base uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${
                plan.popular
                  ? 'bg-[#D4AF37] text-[#0A0A0A] hover:bg-[#F4CF57] shadow-[0_20px_40px_rgba(212,175,55,0.3)]'
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
              }`}>
                {plan.buttonText}
                <ArrowRight size={18} />
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Decorative Orbs */}
      <div className="absolute top-1/2 left-0 w-[700px] h-[700px] bg-[#D4AF37]/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#D4AF37]/3 blur-[120px] rounded-full pointer-events-none" />
    </section>
  );
};
