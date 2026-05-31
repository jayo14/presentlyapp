import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'framer-motion';
import {
  ArrowUpRight,
  CaretRight,
  Play,
  MapPin,
  CheckCircle,
  PaperPlaneTilt,
  WifiSlash,
  User,
  ChalkboardSimple,
  Building,
  Plus,
  Minus,
  List,
  X,
  WifiHigh,
  ShieldCheck,
  CreditCard,
  Clock,
  Users,
  Prohibit,
} from '@phosphor-icons/react';
import { Logo } from "./Logo";
import { ThemeToggle } from './ThemeToggle';
import { Navbar } from "./LandingPage/Navbar";
import { Hero } from "./LandingPage/LandingHero";
import { RoleBasedSection } from "./LandingPage/RoleBasedSection";
import { LandingMobileApp } from "./LandingPage/LandingMobileApp";
import { CTASection } from "./LandingPage/LandingCTA";

// --- Constants ---
const SUNGOLD = "#F5C518";

const StatCounter = ({ value, label }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = parseFloat(value);
      const duration = 2000;
      let timer = setInterval(() => {
        start += end / (duration / 16);
        if (start >= end) {
          setCount(value);
          clearInterval(timer);
        } else {
          setCount(start.toFixed(value.includes('.') ? 1 : 0));
        }
      }, 16);
    }
  }, [isInView, value]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="text-center py-12 md:py-0 px-8"
    >
      <div className="text-5xl md:text-7xl text-primary font-black tracking-tighter mb-6">{count}</div>
      <div className="text-textMuted font-bold text-base uppercase tracking-widest leading-relaxed">{label}</div>
    </motion.div>
  );
};

const AccordionItem = ({ question, answer, icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-outline last:border-0 py-10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left group gap-6"
      >
        <div className="flex items-center gap-6 flex-1">
          {Icon && (
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <Icon size={28} weight="duotone" className="text-primary" />
            </div>
          )}
          <span className="text-xl md:text-2xl font-black text-on-surface group-hover:text-primary transition-colors leading-relaxed tracking-tight">{question}</span>
        </div>
        <div className="w-12 h-12 rounded-full flex items-center justify-center text-primary flex-shrink-0 bg-surface border border-outline/50 shadow-sm">
          {isOpen ? <Minus size={24} weight="bold" /> : <Plus size={24} weight="bold" />}
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="pt-8 text-textMuted leading-relaxed max-w-3xl text-lg md:text-xl font-medium">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SocialMarquee = () => (
  <div className="bg-surface/30 border-y border-outline/10 py-16 overflow-hidden flex whitespace-nowrap">
    <motion.div
      initial={{ x: 0 }}
      animate={{ x: "-50%" }}
      transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      className="flex items-center gap-24 px-12"
    >
      {[1, 2].map(i => (
        <React.Fragment key={i}>
          <span className="text-on-surface/50 font-bold text-lg italic tracking-tight leading-relaxed">"Finally, no more roll calls"</span>
          <div className="w-2 h-2 rounded-full bg-primary/40" />
          <span className="text-on-surface font-black text-lg tracking-widest leading-relaxed uppercase">500+ STUDENTS ENROLLED</span>
          <div className="w-2 h-2 rounded-full bg-primary/40" />
          <span className="text-on-surface/50 font-bold text-lg italic tracking-tight leading-relaxed">"One click register export"</span>
          <div className="w-2 h-2 rounded-full bg-primary/40" />
          <span className="text-on-surface font-black text-lg tracking-widest leading-relaxed uppercase">GPS VERIFIED · ALWAYS ACCURATE</span>
          <div className="w-2 h-2 rounded-full bg-primary/40" />
        </React.Fragment>
      ))}
    </motion.div>
  </div>
);

const Footer = () => (
  <footer className="bg-surface/50 pt-40 pb-20 px-8 text-textMuted border-t border-outline/10">
    <div className="max-w-[80%] mx-auto w-[85%] grid grid-cols-1 md:grid-cols-4 gap-20 mb-32">
      <div className="col-span-1 md:col-span-1">
        <div className="flex items-center gap-3 mb-10">
          <Logo className="scale-125" />
        </div>
        <p className="text-sm leading-relaxed mb-8 text-textMuted/80 max-w-xs font-medium">The next generation of academic management. Built for the modern university with GPS-precision.</p>
      </div>

      <div>
        <h4 className="font-headline text-on-surface font-black mb-10 tracking-tight uppercase text-xs">Product</h4>
        <ul className="space-y-6 text-sm font-bold">
          <li><a href="#" className="hover:text-primary transition-colors leading-relaxed py-1 block">How it Works</a></li>
          <li><a href="#" className="hover:text-primary transition-colors leading-relaxed py-1 block">Pricing</a></li>
          <li><a href="#" className="hover:text-primary transition-colors leading-relaxed py-1 block">Student Guide</a></li>
        </ul>
      </div>

      <div>
        <h4 className="font-headline text-on-surface font-black mb-10 tracking-tight uppercase text-xs">Company</h4>
        <ul className="space-y-6 text-sm font-bold">
          <li><a href="#" className="hover:text-primary transition-colors leading-relaxed py-1 block">About Us</a></li>
          <li><a href="#" className="hover:text-primary transition-colors leading-relaxed py-1 block">Contact</a></li>
          <li><a href="#" className="hover:text-primary transition-colors leading-relaxed py-1 block">Careers</a></li>
          <li><a href="#" className="hover:text-primary transition-colors leading-relaxed py-1 block">Blog</a></li>
        </ul>
      </div>

      <div>
        <h4 className="font-headline text-on-surface font-black mb-10 tracking-tight uppercase text-xs">Legal</h4>
        <ul className="space-y-6 text-sm font-bold">
          <li><a href="#" className="hover:text-primary transition-colors leading-relaxed py-1 block">Privacy Policy</a></li>
          <li><a href="#" className="hover:text-primary transition-colors leading-relaxed py-1 block">Terms of Service</a></li>
          <li><a href="#" className="hover:text-primary transition-colors leading-relaxed py-1 block">Cookie Policy</a></li>
        </ul>
      </div>
    </div>
    <div className="max-w-[80%] w-[95%] mx-auto pt-16 border-t border-outline/5 flex flex-col md:flex-row justify-between items-center gap-10 text-[10px] tracking-[0.3em] uppercase font-black text-textMuted/40">
      <p>© 2025 Presently. <span className="text-primary/60">GPS-VERIFIED ATTENDANCE.</span></p>
      <div className="mt-4 md:mt-0">
        <ThemeToggle />
      </div>
    </div>
  </footer>
);

export default function App() {

  return (
    <div className="min-h-screen bg-background selection:bg-primary selection:text-on-primary-fixed font-sans text-text landing-page">

      <Navbar />
      <Hero />
      <SocialMarquee />

      <section className="bg-surface/20 py-56">
        <div className="border-y border-outline/5 py-24 bg-surface/30 backdrop-blur-sm">
          <div className='grid grid-cols-1 md:grid-cols-4 gap-20 max-w-[80%] mx-auto'>
            <StatCounter value="200+" label="Students Enrolled" />
            <StatCounter value="94.7%" label="Avg Attendance Rate" />
            <StatCounter value="3" label="Sec Check-in Time" />
            <StatCounter value="1" label="University & Growing" />
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto text-center mt-48 px-8"
        >
          <p className="font-headline text-4xl md:text-6xl text-on-surface font-black tracking-tighter leading-[1.1] mb-12">
            "Presently didn't just fix attendance tracking. It changed how we think about <span className="text-primary italic">accountability.</span>"
          </p>
          <div className="flex items-center justify-center gap-4">
             <div className="w-12 h-px bg-outline" />
             <p className="text-textMuted font-black uppercase tracking-[0.3em] text-sm leading-relaxed">Dr. Emmanuel · Vice Chancellor</p>
             <div className="w-12 h-px bg-outline" />
          </div>
        </motion.div>
      </section>

      <RoleBasedSection />
      <LandingMobileApp />

      <section className="py-64 bg-surface/10">
        <div className="max-w-6xl mx-auto px-8">
          <div className="mb-40">
            <span className="text-primary text-xs font-black tracking-[0.4em] uppercase mb-8 block leading-relaxed">FAQ</span>
            <h2 className="font-headline text-6xl md:text-8xl tracking-tighter text-on-surface leading-[0.9] font-black">Questions you'll have.<br />Answered already.</h2>
          </div>
          <div className="space-y-4">
            <AccordionItem
              icon={WifiHigh}
              question="Does it work without internet?"
              answer="Yes! Our offline mode allows students to check in even in dead zones. The record is timestamped locally and synced the moment a connection is re-established."
            />
            <AccordionItem
              icon={ShieldCheck}
              question="Can students spoof their GPS location?"
              answer="Negative. We use high-precision triangulation combining GPS, Wi-Fi hotspots, and cellular towers. Attempts to use VPNs or mock locations are flagged immediately."
            />
            <AccordionItem
              icon={CreditCard}
              question="Does my school need to pay for students?"
              answer="Presently is built to be accessible. We have tailored plans for institutions that cover all students, or standalone lecturer plans for smaller groups."
            />
            <AccordionItem
              icon={Clock}
              question="How long does a check-in typically take?"
              answer="Check-ins are lightning fast—usually under 3 seconds. Our GPS verification and location triangulation happen in the background, so students just tap and go."
            />
            <AccordionItem
              icon={Users}
              question="Can multiple students check in from the same location?"
              answer="Absolutely! Presently supports multiple simultaneous check-ins from the same venue. Each student's location and identity are verified independently and securely."
            />
            <AccordionItem
              icon={Prohibit}
              question="What happens if a student is marked absent by mistake?"
              answer="Our support team can review and adjust attendance records within 48 hours. We keep detailed logs of all check-in attempts so discrepancies are easily identified and resolved."
            />
          </div>
        </div>
      </section>

      <CTASection />
      <Footer />
    </div>
  );
}

