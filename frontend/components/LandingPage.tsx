import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from "react";
import { systemApi } from "../services/api/system";
import { TooltipProvider } from '@/components/ui/tooltip';
import { SEO } from './SEO';
import { JsonLd } from './seo/JsonLd';
import { SITE_URL } from './seo/seoConfig';
import { LandingFooter } from './LandingFooter';
import { LandingHeader } from './LandingHeader';

import { LandingHero } from './LandingPage/LandingHero';
import { LandingMarquee } from "./LandingPage/LandingMarquee";
import { LandingBento } from './LandingPage/LandingBento';
import { LandingTestimonials } from './LandingPage/LandingTestimonials';
import { LandingMobileApp } from './LandingPage/LandingMobileApp';
import { LandingCTA } from './LandingPage/LandingCTA';
import { ModernCard } from './ModernCard';
import { GraduationCap, Presentation, Building2, Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-outline py-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left text-on-surface hover:text-sungold transition-colors"
      >
        <span className="font-sans text-lg font-medium">{question}</span>
        <span className="text-sungold">{isOpen ? <Minus /> : <Plus />}</span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="pt-4 text-on-surface-variant leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [pricingEnabled, setPricingEnabled] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const config = await systemApi.getConfig();
        if (config.pricing_enabled !== undefined) {
          setPricingEnabled(config.pricing_enabled);
        }
      } catch (error) {
        console.error("Failed to fetch system config:", error);
      }
    };
    fetchConfig();
  }, []);

  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Presently',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web, Android, iOS',
    description: 'The premier anti-proxy attendance system for Nigerian universities. GPS-verified and built for integrity.',
    url: SITE_URL,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'NGN' },
    provider: { '@type': 'Organization', name: 'Presently', url: SITE_URL },
  };

  const goRegister = () => navigate('/register');
  const goLogin = () => navigate('/login');

  const roles = [
    {
      title: "Students",
      subtitle: "\"No stress. Just show up.\"",
      body: "Check in from your phone the moment you walk in. See your attendance percentage in real time. Never be surprised before exams.",
      accent: "border-l-sungold",
      icon: <GraduationCap className="text-sungold" />,
      features: ["3-second GPS check-in", "Real-time attendance dashboard", "Notifications before you fall below threshold", "Works even on slow data"]
    },
    {
      title: "Lecturers",
      subtitle: "\"Attendance handled before you say good morning.\"",
      body: "Open a session, teach, close it. Your register is already filled. Export to PDF or CSV whenever you need it. No chasing, no paperwork.",
      accent: "border-l-sky-teal",
      icon: <Presentation className="text-sky-teal" />,
      features: ["One-tap session creation", "Live attendance feed during class", "Auto-generated reports", "Excuse request management"]
    },
    {
      title: "Schools & Institutions",
      subtitle: "\"Visibility across every faculty, every day.\"",
      body: "A live institutional dashboard. Attendance trends. Compliance reports. Everything an HOD, Dean, or registrar needs — without asking anyone for a file.",
      accent: "border-l-moss-green",
      icon: <Building2 className="text-moss-green" />,
      features: ["Multi-faculty dashboard", "Audit-ready exports", "Role-based staff access", "Semester & session analytics"]
    }
  ];

  return (
    <TooltipProvider>
      <SEO
        title="Presently — GPS-Verified Attendance"
        description="Every class. Every student. Present. The modern standard for university attendance tracking."
      />
      <JsonLd schema={softwareSchema} />
      
      <div className="min-h-screen bg-background text-on-surface selection:bg-sungold/30 selection:text-presently-black">
        <LandingHeader onGetStarted={goRegister} onLogin={goLogin} />

        <main>
          <LandingHero onGetStarted={goRegister} />
          <LandingMarquee />

          {/* Section 04 — How it Works (Role Selection) */}
          <section className="py-20 md:py-28 bg-background">
            <div className="container mx-auto px-5 sm:px-6">
              <div className="mb-14 md:mb-20">
                <span className="text-sungold font-bold uppercase tracking-widest text-sm mb-4 block">
                   BUILT FOR EVERYONE IN THE ROOM
                </span>
                <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-on-surface">
                  Whoever you are,<br />Presently works for you.
                </h2>
              </div>

              <div className="grid md:grid-cols-3 gap-6 md:gap-8">
                {roles.map((role, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <ModernCard variant="gold-accent" className={role.accent + " h-full flex flex-col"}>
                      <div className="mb-6">{role.icon}</div>
                      <h3 className="font-display text-2xl mb-2 text-on-surface">{role.title}</h3>
                      <p className="font-sans font-bold text-lg mb-4 text-on-surface">{role.subtitle}</p>
                      <p className="text-on-surface-variant text-sm mb-8 flex-grow">{role.body}</p>
                      <ul className="space-y-3">
                        {role.features.map((f, j) => (
                          <li key={j} className="flex items-center gap-2 text-sm font-medium">
                            <span className="text-sungold">✓</span> {f}
                          </li>
                        ))}
                      </ul>
                    </ModernCard>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          <LandingBento />
          <LandingTestimonials />

          <LandingMobileApp />

          {/* Section 08 — FAQ */}
          <section className="py-20 md:py-28 bg-surface">
            <div className="container mx-auto px-5 sm:px-6 max-w-4xl">
              <div className="mb-12 md:mb-16">
                <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-on-surface">
                  Questions you'll have.<br />Answered already.
                </h2>
              </div>
              <div className="space-y-4">
                <FAQItem question="Does it work without internet?" answer="Yes. Check-ins queue locally and sync automatically when a connection is restored." />
                <FAQItem question="Can students spoof their GPS location?" answer="No. Presently uses multi-source verification including GPS and Wi-Fi triangulation to ensure physical presence." />
                <FAQItem question="What happens if a student's phone dies mid-class?" answer="As long as they checked in while their phone was on, their record is secure. Lecturers can also manually verify students in emergencies." />
                <FAQItem question="Does my school need to pay for students to use it?" answer="Presently offers a free tier for students. Institutional features are available through school-wide subscriptions." />
                <FAQItem question="Can lecturers edit attendance records after submission?" answer="Yes, with proper authorization and audit logging to maintain integrity." />
                <FAQItem question="Is student data safe and private?" answer="Absolutely. We follow strict data protection protocols and only use location data for the duration of the check-in process." />
              </div>
            </div>
          </section>

          <LandingCTA />
        </main>

        <LandingFooter />
      </div>
    </TooltipProvider>
  );
};

export default LandingPage;
