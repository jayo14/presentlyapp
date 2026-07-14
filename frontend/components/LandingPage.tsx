import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import {
  IconWifi,
  IconShieldCheck,
  IconCreditCard,
  IconClock,
  IconUsers,
  IconBan,
  IconPlus,
  IconMinus,
} from '@tabler/icons-react';
import { Navbar } from "./LandingPage/Navbar";
import { Hero } from "./LandingPage/LandingHero";
import { LandingBento } from "./LandingPage/LandingBento";
import { LandingMobileApp } from "./LandingPage/LandingMobileApp";
import { LandingEngineRoom } from "./LandingPage/LandingEngineRoom";
import { RoleBasedSection } from "./LandingPage/RoleBasedSection";
import { LandingPricing } from "./LandingPage/LandingPricing";
import { LandingTestimonials } from "./LandingPage/LandingTestimonials";
import { CTASection } from "./LandingPage/LandingCTA";
import { Footer } from "./LandingPage/LandingFooter";
import { StatCounter as AnimatedStat } from "./LandingPage/StatCounter";

const StatCounterWrapper = ({ value, label }: { value: string, label: string }) => {
  // Parse numeric value and suffix
  const numericValue = parseFloat(value.replace(/[^0-9.]/g, ''));
  const suffix = value.replace(/[0-9.]/g, '');
  const decimals = value.includes('.') ? value.split('.')[1].replace(/[^0-9]/g, '').length : 0;

  return (
    <div className="text-center">
      <p className="text-5xl md:text-6xl font-medium text-neutral-900 tracking-tighter mb-4">
        <AnimatedStat value={numericValue} suffix={suffix} decimals={decimals} />
      </p>
      <p className="text-[11px] font-medium tracking-tight text-neutral-400">{label}</p>
    </div>
  );
};

const AccordionItem = ({ question, answer, icon: Icon }: { question: string, answer: string, icon: any }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <div className="border-b border-black/5 last:border-0 py-10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left group gap-6"
      >
        <div className="flex items-center gap-6 flex-1">
          {Icon && (
            <div className="w-14 h-14 rounded-2xl bg-neutral-50 border border-black/5 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-sm">
              <Icon size={24} className="text-sungold" />
            </div>
          )}
          <span className="text-xl md:text-2xl font-medium text-neutral-900 group-hover:text-sungold transition-colors tracking-tight">{question}</span>
        </div>
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sungold flex-shrink-0 bg-white border border-black/10 shadow-sm transition-transform duration-300" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          {isOpen ? <IconMinus size={20} /> : <IconPlus size={20} />}
        </div>
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
        className="overflow-hidden"
      >
        <p className="pt-8 text-neutral-500 leading-relaxed max-w-4xl text-lg ">{answer}</p>
      </motion.div>
    </div>
  );
};

const SocialMarquee = () => (
  <div className="bg-white border-y border-black/5 py-16 overflow-hidden flex whitespace-nowrap">
    <motion.div
      animate={{ x: "-50%" }}
      transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      className="flex items-center gap-32 px-16"
    >
      {[1, 2, 3].map(i => (
        <React.Fragment key={i}>
          <span className="text-neutral-400 font-medium text-lg italic tracking-tight">"The NUC audit was a breeze with presently reports."</span>
          <div className="w-2 h-2 rounded-full bg-sungold/30" />
          <span className="text-neutral-500 font-medium text-lg tracking-tight">ISO 27001 certified data storage</span>
          <div className="w-2 h-2 rounded-full bg-sungold/30" />
          <span className="text-neutral-400 font-medium text-lg italic tracking-tight">"Proxy attendance dropped to zero in our faculty."</span>
          <div className="w-2 h-2 rounded-full bg-sungold/30" />
          <span className="text-neutral-500 font-medium text-lg tracking-tight">Trusted by 14+ federal institutions</span>
          <div className="w-2 h-2 rounded-full bg-sungold/30" />
        </React.Fragment>
      ))}
    </motion.div>
  </div>
);

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background selection:bg-sungold/30 selection:text-neutral-900 font-sans text-foreground landing-page overflow-x-hidden">
      <Navbar />
      <Hero />
      <SocialMarquee />

      <section className="bg-background py-40 relative overflow-hidden">
        {/* Background Accent */}
        <div className="orb w-[800px] h-[800px] bg-sungold/5 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

        <div className="max-w-[1440px] mx-auto px-8 md:px-16 relative z-10">
          <div className='grid grid-cols-1 md:grid-cols-4 gap-16 py-24 border-y border-foreground/5'>
            <StatCounterWrapper value="14+" label="Federal institutions" />
            <StatCounterWrapper value="99.9%" label="Security fidelity" />
            <StatCounterWrapper value="3.2s" label="Avg. latency" />
            <StatCounterWrapper value="500k+" label="Daily verified check-ins" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto text-center mt-40"
          >
            <p className="text-[clamp(2rem,4vw,3.5rem)] text-foreground font-medium tracking-tight leading-tight mb-12">
              "Presently transformed our NUC accreditation process from a <span className="italic  text-neutral-400">manual nightmare</span> into an automated gold standard."
            </p>
            <div className="flex items-center justify-center gap-6">
               <div className="w-12 h-px bg-foreground/5" />
               <p className="text-neutral-500 font-medium tracking-tight text-sm">Prof. Ifeanyi · Deputy vice chancellor</p>
               <div className="w-12 h-px bg-foreground/5" />
            </div>
          </motion.div>
        </div>
      </section>

      <LandingBento />
      <LandingEngineRoom />
      <RoleBasedSection />
      <LandingPricing />
      <LandingMobileApp />
      <LandingTestimonials />

      <section className="py-40 bg-background">
        <div className="max-w-7xl mx-auto px-8 md:px-16">
          <div className="mb-32">
            <span className="text-sungold text-[11px] font-medium tracking-tight mb-8 block">Executive FAQ</span>
            <h2 className="text-[clamp(3rem,6vw,5.5rem)] tracking-[-0.04em] text-foreground leading-[0.9] font-medium">Institutional<br />questions.</h2>
          </div>
          <div className="max-w-4xl">
            <AccordionItem
              icon={IconShieldCheck}
              question="How does this align with NUC minimum standards?"
              answer="Presently is built around the BMAS/CCMAS requirements. It enforces the 75% attendance rule automatically, generating verified eligibility reports that satisfy NUC quality assurance audits without manual intervention."
            />
            <AccordionItem
              icon={IconWifi}
              question="Does it function in low-connectivity zones?"
              answer="Our 'Sovereign sync' technology allows students to check-in offline. The record is cryptographically signed and timestamped on-device, then synchronized once a secure connection is established."
            />
            <AccordionItem
              icon={IconUsers}
              question="Can it handle 10,000+ students simultaneously?"
              answer="Our distributed edge architecture is tested for massive concurrency. Whether it's a 50-person seminar or a 5,000-seat lecture theatre, check-ins remain under 4 seconds per student."
            />
            <AccordionItem
              icon={IconClock}
              question="What is the implementation timeline?"
              answer="A typical institutional rollout takes 14-21 days. This includes data migration, lecturer training, and GPS mapping of all physical venues across the campus."
            />
            <AccordionItem
              icon={IconBan}
              question="How do you handle proxy attendance?"
              answer="We use high-fidelity triangulation. By correlating GPS data with Wi-Fi signal signatures and hardware-bound device ids, we make it virtually impossible for one student to check-in for another from a remote location."
            />
          </div>
        </div>
      </section>

      <CTASection />
      <Footer />
    </div>
  );
}
