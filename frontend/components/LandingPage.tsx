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
import { ThemeToggle } from './ThemeToggle';
import { Navbar } from "./LandingPage/Navbar"
// --- Constants ---
const SUNGOLD = "#F5C518";

// Icon wrapper component for consistent sizing and spacing
const IconWrapper = ({ children, size = 24 }) => (
  <div className="flex items-center justify-center flex-shrink-0">
    {React.cloneElement(children, { size, weight: 'duotone' })}
  </div>
);


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
    <div ref={ref} className="text-center py-12 md:py-0 px-8">
      <div className="text-5xl md:text-7xl text-primary font-extrabold tracking-tighter mb-6">{count}</div>
      <div className="text-textMuted font-semibold text-base uppercase tracking-widest leading-relaxed">{label}</div>
    </div>
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
        <div className="flex items-center gap-4 flex-1">
          {Icon && (
            <div className="w-32 h-32 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Icon size={24} weight="duotone" className="text-primary" />
            </div>
          )}
          <span className="text-lg md:text-xl font-bold text-on-surface group-hover:text-primary transition-colors leading-relaxed">{question}</span>
        </div>
        <div className="w-40 h-40 rounded-full flex items-center justify-center text-primary flex-shrink-0">
          {isOpen ? <Minus size={28} /> : <Plus size={28} />}
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
            <p className="pt-8 text-gray-600 leading-relaxed max-w-2xl text-lg">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Hero = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -50]);

  return (
    <section ref={containerRef} className="relative min-h-screen bg-surface pt-56 pb-40 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-[80%] mx-auto grid lg:grid-cols-[1.2fr_0.8fr] gap-20 items-center relative">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 mb-10"
          >
            <span className="text-primary text-xs tracking-[0.3em] uppercase leading-relaxed">◆ GPS-Verified Attendance</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-6xl md:text-8xl text-on-surface leading-[1.1] tracking-tighter mb-12"
          >
            Attendance<br />
            that actually<br />
            <span className="text-primary relative">
              knows you're there.
              <span className="absolute -top-4 -right-8 text-2xl font-light opacity-50 italic">®</span>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-textMuted mb-14 max-w-xl leading-relaxed"
          >
            Presently ends roll calls, paper sheets, and proxy attendance — for students, lecturers, and institutions that mean business.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-8"
          >
            <a href="/register" className="w-full sm:w-auto bg-primary text-on-primary-fixed px-14 py-7 rounded-full font-bold text-lg flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-2xl leading-relaxed inline-flex">
              Start for free <CaretRight size={24} weight="duotone" />
            </a>
            <a href="/how-it-works" className="group flex items-center gap-4 font-bold text-on-surface text-lg inline-flex">
              <div className="w-14 h-14 rounded-full border-2 border-outline flex items-center justify-center group-hover:border-primary transition-colors">
                <Play size={32} weight="duotone" className="ml-0.5 text-on-surface group-hover:text-primary transition-all ease-in-out" />
              </div>
              <span className="border-b-2 border-outline group-hover:border-primary transition-colors pb-2">Watch how it works</span>
            </a>
          </motion.div>
        </div>

        <div className="relative h-[760px] hidden lg:block">
          <motion.div style={{ y: y1 }} className="absolute z-10 -left-6 top-28 w-72 p-4 bg-background rounded-[40px] shadow-2xl rotate-[-6deg]">
            <div className="bg-surface-container h-[540px] rounded-[32px] overflow-hidden p-8">
              <div className="w-10 h-10 bg-primary rounded-lg mb-6" />
              <div className="h-4 w-28 bg-surface-variant rounded-full mb-12" />
              <div className="space-y-6">
                <div className="h-16 w-full bg-background rounded-xl shadow-sm" />
                <div className="h-16 w-full bg-background rounded-xl shadow-sm" />
                <div className="h-16 w-full bg-background rounded-xl shadow-sm" />
              </div>
            </div>
          </motion.div>

          <motion.div style={{ y: y2 }} className="absolute z-20 left-28 top-6 w-[300px] p-4 bg-background rounded-[40px] shadow-2xl">
            <div className="bg-surface h-[620px] rounded-[32px] overflow-hidden flex flex-col items-center justify-center p-16 text-center">
              <div className="w-28 h-28 bg-primary/20 rounded-full flex items-center justify-center mb-8 relative">
                <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-20" />
                <MapPin size={64} weight="duotone" className="text-primary" />
              </div>
              <h4 className="text-on-surface font-bold text-2xl mb-4 leading-tight">Scanning...</h4>
              <p className="text-on-surface opacity-40 text-base leading-relaxed">Verifying location at Lecture Theatre</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }} className="absolute z-30 right-8 bottom-12 bg-primary p-6 rounded-full shadow-2xl text-on-primary-fixed">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-on-primary-fixed rounded-full flex items-center justify-center text-primary">
                <CheckCircle size={48} weight="duotone" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest opacity-60 mb-1 leading-relaxed">Verified</p>
                <p className="font-bold text-lg leading-tight">You're Present ✓</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const SocialMarquee = () => (
  <div className="bg-background border-y border-outline py-20 overflow-hidden flex whitespace-nowrap">
    <motion.div
      initial={{ x: 0 }}
      animate={{ x: "-50%" }}
      transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      className="flex items-center gap-16 px-12"
    >
      {[1, 2, 3].map(i => (
        <React.Fragment key={i}>
          <span className="text-on-surface/60 font-medium text-sm italic leading-relaxed">"Finally, no more roll calls" — Student</span>
          <Plus size={12} weight="duotone" className="text-primary mx-4" />
          <span className="text-on-surface font-bold text-sm tracking-widest leading-relaxed">500+ STUDENTS ENROLLED</span>
          <Plus size={12} weight="duotone" className="text-primary mx-4" />
          <span className="text-on-surface/60 font-medium text-sm italic leading-relaxed">"One click register export" — Dr. Adeyemi</span>
          <Plus size={12} weight="duotone" className="text-primary mx-4" />
          <span className="text-on-surface font-bold text-sm tracking-widest leading-relaxed">GPS VERIFIED · ALWAYS ACCURATE</span>
          <Plus size={12} weight="duotone" className="text-primary mx-4" />
        </React.Fragment>
      ))}
    </motion.div>
  </div>
);



const FeatureCard = ({ title, description, icon: Icon, color, features, children, className = "" }) => {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const { left, top } = cardRef.current.getBoundingClientRect();
    setCoords({ x: e.clientX - left, y: e.clientY - top });
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`group relative overflow-hidden rounded-[48px] bg-surface border border-outline p-8 md:p-16 transition-all hover:border-contrast ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(600px circle at ${coords.x}px ${coords.y}px, ${color}15, transparent 40%)`
        }}
      />

      <div className="relative z-10 grid flex-row gap-20 items-center h-full p-32">
        <div className="flex flex-col h-full justify-between py-4 pr-8">
          <div className="space-y-8">
            <div className="w-48 h-48 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: color }}>
              <Icon size={32} weight="duotone" className="text-surface" />
            </div>
            <h3 className="font-display text-4xl text-on-surface mb-6 tracking-tighter leading-tight">{title}</h3>
            <p className="text-textMuted text-lg leading-relaxed mb-10 max-w-sm">{description}</p>

            <div className="grid grid-cols-2 gap-y-8 gap-x-6">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-3 text-on-surface opacity-90 text-base font-medium leading-relaxed">
                  <CheckCircle size={24} weight="duotone" style={{ color }} className="flex-shrink-0 text-on-surface" /> {f}
                </div>
              ))}
            </div>
          </div>
          <a href="/features" className="mt-16 group/btn inline-flex items-center gap-2 text-on-surface font-bold text-sm tracking-widest uppercase leading-relaxed">
            Learn More <ArrowUpRight size={18} weight="duotone" style={{ color }} />
          </a>
        </div>
        <div className="relative h-full flex items-center justify-center min-h-[380px] pl-8">
          {children}
        </div>
      </div>
    </motion.div>
  );
};

const RoleBasedSection = () => {
  return (
    <section className="py-64 bg-surface">
      <div className="max-w-[80%] mx-auto">
        <div className="mb-28">
          <span className="text-primary text-xs tracking-[0.3em] uppercase mb-8 block leading-relaxed">Built for everyone in the room</span>
          <h2 className="font-display text-5xl md:text-7xl tracking-tighter text-on-surface leading-tight">Whoever you are,<br />Presently works for you.</h2>
        </div>

        <div className="mx-auto flex flex-col gap-24">

          {/* Card 1: Students - Large Horizontal */}
          <FeatureCard
            title="Focus on Learning."
            description="Attendance shouldn't be a distraction. We've made it as natural as walking into the classroom."
            icon={User}
            color="#F5C518"
            features={["One-tap Verification", "Attendance Tracker", "Missed Class Alerts", "Academic Calendar"]}
            className="lg:col-span-12 min-h-[600px]"
          >
            <div className="w-full h-full flex items-center justify-center py-10">
              <div className="relative w-72 h-[520px] bg-background rounded-[48px] shadow-2xl p-6 overflow-hidden border-[10px] border-outline transition-transform duration-700 group-hover:-rotate-2">
                <div className="bg-surface h-full rounded-[38px] p-8 flex flex-col">
                  <div className="flex justify-between items-center mb-14">
                    <div className="w-12 h-12 rounded-full bg-primary shadow-inner" />
                    <div className="w-16 h-2 bg-surface-variant rounded-full" />
                  </div>
                  <div className="mb-14">
                    <p className="text-[12px] uppercase text-on-surface opacity-40 font-bold tracking-[0.2em] mb-3">Weekly Average</p>
                    <p className="text-6xl text-on-surface font-bold tracking-tighter">92.4%</p>
                  </div>
                  <div className="space-y-6">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-center gap-5 bg-surface p-5 rounded-2xl shadow-sm">
                        <div className="w-12 h-12 bg-surface-container rounded-xl" />
                        <div className="flex-1 space-y-3">
                          <div className="h-2.5 w-24 bg-surface-variant rounded-full" />
                          <div className="h-2 w-14 bg-surface-variant/60 rounded-full" />
                        </div>
                        <CheckCircle size={28} className="text-primary" />
                      </div>
                    ))}
                  </div>
                  <div className="mt-auto bg-primary text-on-primary-fixed py-5 rounded-full text-center text-[12px] font-bold tracking-widest">
                    SESSION ACTIVE
                  </div>
                </div>
              </div>
            </div>
          </FeatureCard>

          <div className="grid md:grid-cols-2 gap-24">
            {/* Card 2: Lecturers */}
            <FeatureCard
              title="Teach. Track. Done."
              description="No more manual registers. Open a session and let Presently handle the rest while you focus on delivery."
              icon={ChalkboardSimple}
              color="#38BDF8"
              features={["Live Feed", "Instant Export", "Auto-Grades", "Class Analytics"]}
            >
              {/* <div className="bg-surface p-10 rounded-[2.5rem] border border-outline w-full max-w-sm rotate-3 group-hover:rotate-0 transition-all duration-700 shadow-2xl">
                <div className="flex items-center justify-between mb-12">
                  <div className="h-3 w-32 bg-primary/20 rounded-full" />
                  <div className="h-5 w-5 bg-primary rounded-full animate-pulse shadow-[0_0_15px_rgba(56,189,248,0.15)]" />
                </div>
                <div className="space-y-8">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-6 border-b border-outline/30 pb-6 last:border-0 last:pb-0">
                      <div className="w-10 h-10 rounded-full bg-surface-container border border-outline" />
                      <div className="h-2 flex-1 bg-surface-variant rounded-full" />
                      <div className="w-3 h-3 rounded-full bg-primary" />
                    </div>
                  ))}
                </div>
              </div> */}
            </FeatureCard>

            {/* Card 3: Admins */}
            <FeatureCard
              title="Campus Insights."
              description="A bird's eye view of your entire institution. Monitor compliance and trends in real-time."
              icon={Building}
              color="#34D399"
              features={["Faculty View", "Trend Reports", "Data Security", "Global Search"]}
            >
              {/* <div className="flex gap-4 items-end h-48 w-full max-w-xs px-4">
                {[40, 70, 45, 90, 65, 80, 55, 95].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    whileInView={{ height: `${h}%` }}
                    transition={{ delay: i * 0.05, duration: 0.8, ease: "easeOut" }}
                    className="flex-1 bg-primary/20 rounded-t-xl relative border-t-[3px] border-primary hover:bg-primary/40 transition-colors"
                  />
                ))}
              </div> */}
            </FeatureCard>
          </div>
        </div>
      </div>
    </section>
  );
};

const CTASection = () => (
  <section className="py-64 bg-[#0D0D0D] text-center relative overflow-hidden">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#F5C518]/10 blur-[150px] rounded-full pointer-events-none" />
    <div className="max-w-4xl mx-auto relative z-10">
      <h2 className="font-display text-6xl md:text-8xl  text-white tracking-tighter mb-12 leading-tight">Every class.<br />Every student.<br /><span className="text-[#F5C518]">Present.</span></h2>
      <p className="text-slate-400 text-2xl mb-20 max-w-xl mx-auto leading-relaxed">Join institutions already running smarter with Presently. Setup takes less than 5 minutes.</p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-10 mb-24">
        <a href="/register" className="w-full sm:w-auto bg-primary text-on-primary-fixed px-14 py-7 rounded-full font-bold text-xl hover:scale-105 transition-all shadow-2xl leading-relaxed inline-flex justify-center">
          Get started for free →
        </a>
        <a href="/demo" className="w-full sm:w-auto px-14 py-7 rounded-full font-bold text-xl border-2 border-white/20 text-white hover:bg-white/5 transition-all leading-relaxed inline-flex justify-center">
          Request a school demo
        </a>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="bg-surface pt-40 pb-20 px-8 text-textMuted">
    <div className="max-w-[80%] mx-auto w-[85%] grid grid-cols-1 md:grid-cols-4 gap-20 mb-32">
      <div className="col-span-1 md:col-span-1">
        <div className="flex items-center gap-3 mb-10">
          <img src="/logo.png" alt="Logo" className="w-40" />
          <span className="text-2xl font-bold text-on-surface tracking-tight leading-relaxed">Presently</span>
        </div>
        <p className="text-sm leading-relaxed mb-8 text-textMuted">The next generation of academic management. Built for the modern university.</p>
      </div>

      <div>
        <h4 className="font-display text-on-surface font-bold mb-10">Product</h4>
        <ul className="space-y-8 text-sm font-medium">
          <li><a href="#" className="hover:text-primary transition-colors leading-relaxed py-1">How it Works</a></li>
          <li><a href="#" className="hover:text-primary transition-colors leading-relaxed py-1">Pricing</a></li>
          <li><a href="#" className="hover:text-primary transition-colors leading-relaxed py-1">Student Guide</a></li>
        </ul>
      </div>

      <div>
        <h4 className="font-display text-on-surface font-bold mb-10">Company</h4>
        <ul className="space-y-8 text-sm font-medium">
          <li><a href="#" className="hover:text-primary transition-colors leading-relaxed py-1">About Us</a></li>
          <li><a href="#" className="hover:text-primary transition-colors leading-relaxed py-1">Contact</a></li>
          <li><a href="#" className="hover:text-primary transition-colors leading-relaxed py-1">Careers</a></li>
          <li><a href="#" className="hover:text-primary transition-colors leading-relaxed py-1">Blog</a></li>
        </ul>
      </div>

      <div>
        <h4 className="font-display text-on-surface font-bold mb-10">Legal</h4>
        <ul className="space-y-8 text-sm font-medium">
          <li><a href="#" className="hover:text-primary transition-colors leading-relaxed py-1">Privacy Policy</a></li>
          <li><a href="#" className="hover:text-primary transition-colors leading-relaxed py-1">Terms of Service</a></li>
          <li><a href="#" className="hover:text-primary transition-colors leading-relaxed py-1">Cookie Policy</a></li>
        </ul>
      </div>
    </div>
    <div className="max-w-[80%] w-[95%] mx-auto pt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-10 text-xs tracking-widest uppercase  leading-relaxed">
      <p>© 2025 Presently. <span className="text-primary">GPS-VERIFIED ATTENDANCE.</span></p>
      <div className="mt-4 md:mt-0">
        <ThemeToggle />
      </div>
    </div>
  </footer>
);

export default function App() {
  const showcaseRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: showcaseRef,
    offset: ["start end", "end start"]
  });

  const xSlide = useTransform(scrollYProgress, [0, 1], [300, -600]);

  return (
    <div className="min-h-screen bg-background selection:bg-primary selection:text-on-primary-fixed font-sans text-text landing-page">

      <Navbar />
      <Hero />
      <SocialMarquee />

      <section className="bg-surface py-56">
        <div className="border-y border-white/5 py-20">
          <div className='grid grid-cols-1 md:grid-cols-4 gap-20 max-w-[80%] mx-auto'>
            <StatCounter value="200+" label="Students Enrolled" />
            <StatCounter value="94.7%" label="Avg Attendance Rate" />
            <StatCounter value="3" label="Sec Check-in Time" />
            <StatCounter value="1" label="University & Growing" />
          </div>
        </div>
        <div className="max-w-4xl mx-auto text-center mt-40">
          <p className="font-display text-4xl md:text-6xl  text-on-surface italic tracking-tighter leading-relaxed mb-8">
            "Presently didn't just fix attendance tracking. It changed how we think about student accountability."
          </p>
          <p className="mt-12 text-slate-500 font-bold uppercase tracking-widest text-base leading-relaxed">— Dr. </p>
        </div>
      </section>

      <RoleBasedSection />

      {/* Mobile App Arc Showcase */}
      <section ref={showcaseRef} className="py-56 px-12 overflow-hidden bg-background">
        <div className="max-w-[80%] mx-auto text-center mb-40">
          <span className="text-[#F5C518] text-xs  tracking-[0.3em] uppercase mb-8 block">Mobile Experience</span>
          <h2 className="font-display text-5xl md:text-7xl  tracking-tighter text-on-surface leading-tight">Beautiful on every screen.<br />Effortless in every pocket.</h2>
        </div>

        <div className="relative flex items-center justify-center h-[700px]">
          <motion.div
            style={{ x: xSlide }}
            className="flex items-center gap-8 md:gap-16 will-change-transform px-[20vw]"
          >
            {[
              { id: 1, color: 'bg-slate-50', icon: User },
              { id: 2, color: 'bg-slate-100', icon: ChalkboardSimple },
              { id: 3, color: 'bg-[#0D0D0D]', icon: MapPin, active: true },
              { id: 4, color: 'bg-slate-100', icon: PaperPlaneTilt },
              { id: 5, color: 'bg-slate-50', icon: CheckCircle },
            ].map((item, idx) => (
              <ShowcaseDevice
                key={item.id}
                item={item}
                scrollProgress={scrollYProgress}
                index={idx}
              />
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-64">
        <div className="max-w-6xl mx-auto">
          <div className="mb-36">
            <span className="text-[#F5C518] text-xs  tracking-[0.3em] uppercase mb-8 block leading-relaxed">FAQ</span>
            <h2 className="font-display text-5xl  tracking-tighter text-on-surface leading-tight">Questions you'll have.<br />Answered already.</h2>
          </div>
          <div className="space-y-0">
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

function ShowcaseDevice({ item, scrollProgress, index }) {
  const start = index * 0.15;
  const end = start + 0.3;

  const scale = useTransform(scrollProgress, [start, (start + end) / 2, end], [0.85, 1.15, 0.85]);
  const y = useTransform(scrollProgress, [start, (start + end) / 2, end], [50, -40, 50]);
  const opacity = useTransform(scrollProgress, [start - 0.2, start, end, end + 0.2], [0.4, 1, 1, 0.4]);
  const shadow = useTransform(
    scrollProgress,
    [start, (start + end) / 2, end],
    ["0px 10px 30px rgba(0,0,0,0.1)", "0px 40px 80px rgba(0,0,0,0.2)", "0px 10px 30px rgba(0,0,0,0.1)"]
  );

  const IconComponent = item.icon;

  return (
    <motion.div
      style={{ scale, y, opacity, boxShadow: shadow }}
      className={`relative w-[280px] md:w-[320px] aspect-[9/19] ${item.color} rounded-[48px] border-[12px] border-white overflow-hidden flex flex-col items-center justify-center p-10 flex-shrink-0 transition-colors duration-500`}
    >
      {item.active && (
        <div className="absolute inset-0 bg-[#F5C518]/5 animate-pulse pointer-events-none" />
      )}

      <div className="relative">
        {item.active && (
          <div className="absolute inset-0 bg-[#F5C518] rounded-full animate-ping opacity-20 scale-150" />
        )}
        <div className={`z-10 bg-white/10 backdrop-blur-md p-8 rounded-3xl ${item.active ? 'bg-white/20' : ''}`}>
          <IconComponent
            size={56}
            weight="duotone"
            className={item.active ? "text-[#F5C518]" : "text-slate-400"}
          />
        </div>
      </div>

      <div className="mt-14 text-center">
        <div className={`h-3 w-28 mx-auto rounded-full mb-4 ${item.active ? 'bg-[#F5C518]' : 'bg-slate-200'}`} />
        <div className={`h-2.5 w-20 mx-auto rounded-full ${item.active ? 'bg-[#F5C518]/40' : 'bg-slate-100'}`} />
      </div>

      <div className="absolute top-14 w-20 h-2 bg-slate-200/20 rounded-full" />
      <div className="absolute bottom-14 w-32 h-1.5 bg-slate-200/10 rounded-full" />
    </motion.div>
  );
}