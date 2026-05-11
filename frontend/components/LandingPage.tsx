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
  Buildings,
  Plus,
  Minus,
} from '@phosphor-icons/react';

// --- Constants ---
const SUNGOLD = "#F5C518";

// Icon wrapper component for consistent sizing and spacing
const IconWrapper = ({ children, size = 24 }) => (
  <div className="flex items-center justify-center flex-shrink-0">
    {React.cloneElement(children, { size, weight: 'duotone' })}
  </div>
);

// --- Components ---

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className="fixed mx-auto top-0 w-full z-50 flex justify-center transition-all duration-700 pointer-events-none">
      <div 
        className={`
          transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] pointer-events-auto
          flex items-center justify-between px-8
          ${isScrolled 
            ? 'mt-6 w-[90%] md:w-[80%] py-3 max-w-6xl rounded-full bg-white/10 backdrop-blur-2xl backdrop-saturate-150 border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.3)]' 
            : 'mt-0 w-full py-6 bg-transparent border-transparent'
          }
        `}
      >
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center transition-transform group-hover:rotate-12">
            <div className="w-4 h-4 bg-[#F5C518] rounded-full" />
          </div>
          <span className="text-xl font-black tracking-tight text-white">
            Presently
          </span>
        </div>
        
        <div className={`hidden md:flex items-center gap-10 font-semibold transition-all duration-500 ${isScrolled ? 'opacity-90 scale-95' : 'opacity-100 scale-100'}`}>
          {['How it Works', 'Pricing', 'Blog'].map((item) => (
            <a 
              key={item} 
              href="#" 
              className="text-white/80 hover:text-[#F5C518] transition-colors text-[14px] tracking-tight leading-relaxed py-2 px-2"
            >
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-8">
          <button className="hidden sm:block font-bold text-sm text-white hover:text-[#F5C518] transition-colors py-2 px-4 leading-relaxed">
            Log In
          </button>
          <button className="bg-[#F5C518] text-black px-7 py-3 rounded-full font-black hover:shadow-[0_0_25px_rgba(245,197,24,0.4)] transition-all active:scale-95 text-[12px] uppercase tracking-tighter flex items-center gap-2 leading-relaxed">
            Join <ArrowUpRight size={18} weight="duotone" />
          </button>
        </div>
      </div>
    </nav>
  );
};

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
      <div className="text-5xl md:text-7xl font-black text-[#F5C518] tracking-tighter mb-6">{count}{value.includes('%') ? '' : (value.includes('+') ? '+' : '')}</div>
      <div className="text-slate-400 font-medium text-base uppercase tracking-widest leading-relaxed">{label}</div>
    </div>
  );
};

const AccordionItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0 py-10">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left group gap-6"
      >
        <span className="text-xl md:text-2xl font-bold text-black group-hover:text-[#F5C518] transition-colors leading-relaxed">{question}</span>
        <div className="bg-gray-50 w-12 h-12 rounded-full flex items-center justify-center text-[#F5C518] flex-shrink-0">
          {isOpen ? <Minus size={20} weight="duotone" /> : <Plus size={20} weight="duotone" />}
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
    <section ref={containerRef} className="relative min-h-screen bg-[#0D0D0D] pt-56 pb-32 px-8 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#F5C518]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto grid lg:grid-cols-[1.2fr_0.8fr] gap-20 items-center relative">
        <div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 mb-10"
          >
            <span className="text-[#F5C518] text-xs font-black tracking-[0.3em] uppercase leading-relaxed">◆ GPS-Verified Attendance</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-6xl md:text-8xl font-black text-white leading-[1.1] tracking-tighter mb-12"
          >
            Attendance<br />
            that actually<br />
            <span className="text-[#F5C518] relative">
              knows you're there.
              <span className="absolute -top-4 -right-8 text-2xl font-light opacity-50 italic">®</span>
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-400 mb-14 max-w-xl leading-relaxed"
          >
            Presently ends roll calls, paper sheets, and proxy attendance — for students, lecturers, and institutions that mean business.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-8"
          >
            <button className="w-full sm:w-auto bg-[#F5C518] text-black px-14 py-7 rounded-full font-bold text-lg flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-2xl leading-relaxed">
              Start for free <CaretRight size={20} weight="duotone" />
            </button>
            <button className="group flex items-center gap-4 font-bold text-white text-lg">
              <div className="w-14 h-14 rounded-full border-2 border-white/20 flex items-center justify-center group-hover:border-[#F5C518] transition-colors">
                <Play size={24} weight="duotone" className="ml-0.5" />
              </div>
              <span className="border-b-2 border-white/10 group-hover:border-[#F5C518] transition-colors pb-2">Watch how it works</span>
            </button>
          </motion.div>
        </div>

        <div className="relative h-[600px] hidden lg:block">
          <motion.div style={{ y: y1 }} className="absolute z-10 -left-10 top-20 w-56 p-3 bg-white rounded-[40px] shadow-2xl rotate-[-6deg]">
             <div className="bg-gray-100 h-96 rounded-[32px] overflow-hidden p-8">
                <div className="w-8 h-8 bg-[#F5C518] rounded-lg mb-6" />
                <div className="h-4 w-24 bg-gray-300 rounded-full mb-10" />
                <div className="space-y-5">
                <div className="h-14 w-full bg-white rounded-xl shadow-sm" />
                  <div className="h-14 w-full bg-white rounded-xl shadow-sm" />
                </div>
             </div>
          </motion.div>

          <motion.div style={{ y: y2 }} className="absolute z-20 left-20 top-0 w-64 p-3 bg-white rounded-[40px] shadow-2xl">
             <div className="bg-[#0D0D0D] h-[500px] rounded-[32px] overflow-hidden flex flex-col items-center justify-center p-12 text-center">
                <div className="w-24 h-24 bg-[#F5C518]/20 rounded-full flex items-center justify-center mb-8 relative">
                  <div className="absolute inset-0 bg-[#F5C518] rounded-full animate-ping opacity-20" />
                  <MapPin size={40} weight="duotone" className="text-[#F5C518]" />
                </div>
                <h4 className="text-white font-bold text-2xl mb-4 leading-tight">Scanning...</h4>
                <p className="text-white/40 text-base leading-relaxed">Verifying location at Campus Library</p>
             </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }} className="absolute z-30 right-0 bottom-20 bg-[#F5C518] p-8 rounded-[32px] shadow-2xl text-black">
             <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white">
                  <CheckCircle size={28} weight="duotone" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest opacity-60 mb-1 leading-relaxed">Verified</p>
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
  <div className="bg-[#0D0D0D] border-y border-white/5 py-16 overflow-hidden flex whitespace-nowrap">
    <motion.div 
      initial={{ x: 0 }}
      animate={{ x: "-50%" }}
      transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      className="flex items-center gap-16 px-12"
    >
      {[1,2,3].map(i => (
        <React.Fragment key={i}>
          <span className="text-slate-400 font-medium text-sm italic leading-relaxed">"inally, no more roll calls" — Student</span>
          <span className="text-[#F5C518]">\u25c6</span>
          <span className="text-slate-400 font-bold text-sm tracking-widest leading-relaxed">200+ STUDENTS ENROLLED</span>
          <span className="text-[#F5C518]">\u25c6</span>
          <span className="text-slate-400 font-medium text-sm italic leading-relaxed">"One click register export" \u2014 Dr. Adeyemi</span>
          <span className="text-[#F5C518]">\u25c6</span>
          <span className="text-slate-400 font-bold text-sm tracking-widest leading-relaxed">GPS VERIFIED \u00b7 ALWAYS ACCURATE</span>
          <span className="text-[#F5C518]">\u25c6</span>
        </React.Fragment>
      ))}
    </motion.div>
  </div>
);

const FeaturesBento = () => {
  return (
    <section className="py-48 px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-40">
          <span className="text-[#F5C518] text-xs font-black tracking-[0.3em] uppercase mb-8 block">What's Under the Hood</span>
          <h2 className="font-display text-5xl md:text-7xl font-black tracking-tighter text-black leading-tight">Powerful features.<br/>Quietly in the background.</h2>
        </div>

        <div className="grid grid-cols-12 gap-8 auto-rows-[280px]">
          <div className="col-span-12 md:col-span-8 bg-[#0D0D0D] rounded-[48px] p-16 text-white flex flex-col justify-between overflow-hidden relative group">
             <div className="relative z-10">
                <h3 className="text-4xl font-bold mb-8 leading-tight">You can't check in from your dorm.</h3>
                <p className="text-slate-400 max-w-sm leading-relaxed text-lg">GPS + Wifi triangulation verifies campus presence. No VPNs, no spoofing, just real presence.</p>
             </div>
             <div className="absolute bottom-[-50px] right-[-50px] w-80 h-80 bg-[#F5C518]/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
             <div className="self-end bg-[#F5C518] p-4 rounded-3xl text-black">
                <PaperPlaneTilt size={32} weight="duotone" />
             </div>
          </div>

          <div className="col-span-12 md:col-span-4 bg-gray-50 rounded-[48px] p-12 flex flex-col justify-between group">
             <WifiSlash size={48} weight="duotone" className="text-[#F5C518] mb-4" />
             <div>
                <h3 className="text-2xl font-bold mb-6 leading-tight">Poor signal? No problem.</h3>
                <p className="text-gray-600 text-base leading-relaxed">Check-ins queue locally and sync when connection returns.</p>
             </div>
          </div>

          <div className="col-span-12 md:col-span-4 bg-gray-50 rounded-[48px] p-12 flex flex-col justify-between">
             <div className="space-y-5">
                {[1,2,3].map(i => (
                  <div key={i} className="flex items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-black/5">
                    <div className="w-10 h-10 rounded-full bg-gray-100" />
                    <div className="h-2.5 w-20 bg-gray-200 rounded-full" />
                    <div className="ml-auto w-2.5 h-2.5 rounded-full bg-green-500" />
                  </div>
                ))}
             </div>
             <div>
                <h3 className="text-2xl font-bold mb-6 leading-tight">Watch your class fill up.</h3>
                <p className="text-gray-600 text-base leading-relaxed">Real-time attendance feed as students walk through the door.</p>
             </div>
          </div>

          <div className="col-span-12 md:col-span-8 bg-[#FDF7E7] rounded-[48px] p-16 flex flex-col md:flex-row gap-12 items-center border border-[#F5C518]/20">
             <div className="flex-1">
                <h3 className="text-4xl font-bold mb-8 leading-tight">Everyone sees exactly what they should.</h3>
                <p className="text-gray-700 leading-relaxed text-lg">Students see theirs. Lecturers see their class. Admins see everything. Simple, secure, scoped.</p>
             </div>
             <div className="flex flex-col gap-6 w-56">
                <div className="bg-black text-white p-6 rounded-2xl text-center text-xs font-bold tracking-widest leading-relaxed">ADMIN</div>
                <div className="bg-white p-6 rounded-2xl text-center text-xs font-bold tracking-widest text-black border border-black/5 leading-relaxed">LECTURER</div>
                <div className="bg-white p-6 rounded-2xl text-center text-xs font-bold tracking-widest text-black border border-black/5 opacity-50 leading-relaxed">STUDENT</div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

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
      className={`group relative overflow-hidden rounded-[48px] bg-[#141414] border border-white/5 p-10 md:p-16 transition-all hover:border-white/10 ${className}`}
    >
      <div 
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(600px circle at ${coords.x}px ${coords.y}px, ${color}15, transparent 40%)`
        }}
      />

      <div className="relative z-10 grid lg:grid-cols-2 gap-20 items-center h-full">
        <div className="flex flex-col h-full justify-between">
          <div>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-10" style={{ backgroundColor: color }}>
              <Icon size={32} className="text-black" />
            </div>
            <h3 className="font-display text-4xl font-black text-white mb-8 tracking-tighter leading-tight">{title}</h3>
            <p className="text-slate-400 text-lg leading-relaxed mb-12 max-w-sm">{description}</p>
            
            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-3 text-white/90 text-base font-medium leading-relaxed">
                  <CheckCircle size={20} weight="duotone" style={{ color }} className="flex-shrink-0" /> {f}
                </div>
              ))}
            </div>
          </div>
          <button className="mt-14 group/btn flex items-center gap-2 text-white font-bold text-sm tracking-widest uppercase leading-relaxed">
            Learn More <ArrowUpRight size={18} weight="duotone" style={{ color }} />
          </button>
        </div>
        <div className="relative h-full flex items-center justify-center min-h-[380px]">
          {children}
        </div>
      </div>
    </motion.div>
  );
};

const RoleBasedSection = () => {
  return (
  <section className="py-48 px-8 bg-[#0D0D0D]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-36">
          <span className="text-[#F5C518] text-xs font-black tracking-[0.3em] uppercase mb-8 block leading-relaxed">Built for everyone in the room</span>
          <h2 className="font-display text-5xl md:text-7xl font-black tracking-tighter text-white leading-tight">Whoever you are,<br/>Presently works for you.</h2>
        </div>

        <div className="flex flex-col gap-14">
          {/* Card 1: Students - Large Horizontal */}
          <FeatureCard 
            title="Focus on Learning."
            description="Attendance shouldn't be a distraction. We've made it as natural as walking into the classroom."
            icon={User}
            color="#F5C518"
            features={['One-tap Verification', 'Attendance Tracker', 'Missed Class Alerts', 'Academic Calendar']}
              className="lg:col-span-12 min-h-[500px]"
          >
            <div className="w-full h-full flex items-center justify-center py-8">
              <div className="relative w-64 h-[500px] bg-white rounded-[40px] shadow-2xl p-5 overflow-hidden border-8 border-black">
                <div className="bg-gray-100 h-full rounded-[30px] p-6 flex flex-col">
                  <div className="flex justify-between items-center mb-12">
                    <div className="w-10 h-10 rounded-full bg-[#F5C518]" />
                    <div className="w-12 h-1.5 bg-black/10 rounded-full" />
                  </div>
                  <div className="mb-12">
                    <p className="text-[11px] font-black uppercase text-black/30 tracking-widest mb-2 leading-relaxed">Weekly Average</p>
                    <p className="text-5xl font-black text-black tracking-tighter leading-tight">92.4%</p>
                  </div>
                  <div className="space-y-5">
                    {[1,2,3].map(i => (
                      <div key={i} className="flex items-center gap-4 bg-white p-5 rounded-xl shadow-sm">
                        <div className="w-10 h-10 bg-gray-50 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <div className="h-2 w-20 bg-gray-200 rounded-full" />
                          <div className="h-1.5 w-12 bg-gray-100 rounded-full" />
                        </div>
                        <CheckCircle size={18} weight="duotone" className="text-[#F5C518]" />
                      </div>
                    ))}
                  </div>
                  <div className="mt-auto bg-black text-[#F5C518] py-4 rounded-full text-center text-[11px] font-black tracking-widest leading-relaxed">
                    SESSION ACTIVE
                  </div>
                </div>
              </div>
            </div>
          </FeatureCard>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Card 2: Lecturers */}
            <FeatureCard 
              title="Teach. Track. Done."
              description="No more manual registers. Open a session and let Presently handle the rest while you focus on delivery."
              icon={ChalkboardSimple}
              color="#38BDF8"
              features={['Live Feed', 'Instant Export', 'Auto-Grades', 'Class Analytics']}
            >
              <div className="bg-[#1a1a1a] p-8 rounded-3xl border border-white/5 w-full max-w-sm rotate-3 group-hover:rotate-0 transition-transform duration-700 shadow-2xl">
                <div className="flex items-center justify-between mb-10">
                   <div className="h-2.5 w-24 bg-sky-400/20 rounded-full" />
                   <div className="h-4 w-4 bg-sky-400 rounded-full animate-pulse" />
                </div>
                <div className="space-y-5">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 border-b border-white/5 pb-4">
                      <div className="w-8 h-8 rounded-full bg-white/5" />
                      <div className="h-1.5 flex-1 bg-white/10 rounded-full" />
                      <div className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                    </div>
                  ))}
                </div>
              </div>
            </FeatureCard>

            {/* Card 3: Admins */}
            <FeatureCard 
              title="Campus Insights."
              description="A bird's eye view of your entire institution. Monitor compliance and trends in real-time."
              icon={Buildings}
              color="#34D399"
              features={['Faculty View', 'Trend Reports', 'Data Security', 'Global Search']}
            >
              <div className="flex gap-2 items-end h-32 w-full max-w-xs">
                {[40, 70, 45, 90, 65, 80, 55, 95].map((h, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ height: 0 }}
                    whileInView={{ height: `${h}%` }}
                    className="flex-1 bg-emerald-400/20 rounded-t-lg relative border-t-2 border-emerald-400"
                  />
                ))}
              </div>
            </FeatureCard>
          </div>
        </div>
      </div>
    </section>
  );
};

const CTASection = () => (
      <section className="py-48 px-8 bg-[#0D0D0D] text-center relative overflow-hidden">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#F5C518]/10 blur-[150px] rounded-full pointer-events-none" />
    <div className="max-w-4xl mx-auto relative z-10">
      <h2 className="font-display text-6xl md:text-8xl font-black text-white tracking-tighter mb-12 leading-tight">Every class.<br/>Every student.<br/><span className="text-[#F5C518]">Present.</span></h2>
      <p className="text-slate-400 text-2xl mb-20 max-w-xl mx-auto leading-relaxed">Join institutions already running smarter with Presently. Setup takes less than 5 minutes.</p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-10 mb-24">
        <button className="w-full sm:w-auto bg-[#F5C518] text-black px-14 py-7 rounded-full font-bold text-xl hover:scale-105 transition-all shadow-2xl leading-relaxed">
          Get started for free →
        </button>
        <button className="w-full sm:w-auto px-14 py-7 rounded-full font-bold text-xl border-2 border-white/20 text-white hover:bg-white/5 transition-all leading-relaxed">
          Request a school demo
        </button>
      </div>
    </div>
  </section>
);

const Footer = () => (
    <footer className="bg-[#141414] pt-40 pb-20 px-8 text-slate-400">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-20 mb-32">
      <div className="col-span-1 md:col-span-1">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 bg-[#F5C518] rounded flex items-center justify-center">
            <div className="w-2.5 h-2.5 bg-black rounded-full" />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight leading-relaxed">Presently</span>
        </div>
        <p className="text-sm leading-relaxed mb-8">The next generation of academic management. Built for the modern university.</p>
      </div>
      
      <div>
        <h4 className="text-white font-bold mb-10">Product</h4>
        <ul className="space-y-8 text-sm font-medium">
          <li><a href="#" className="hover:text-[#F5C518] transition-colors leading-relaxed py-1">How it Works</a></li>
          <li><a href="#" className="hover:text-[#F5C518] transition-colors leading-relaxed py-1">Pricing</a></li>
          <li><a href="#" className="hover:text-[#F5C518] transition-colors leading-relaxed py-1">Student Guide</a></li>
        </ul>
      </div>

      <div>
        <h4 className="text-white font-bold mb-10">Company</h4>
        <ul className="space-y-8 text-sm font-medium">
          <li><a href="#" className="hover:text-[#F5C518] transition-colors leading-relaxed py-1">About Us</a></li>
          <li><a href="#" className="hover:text-[#F5C518] transition-colors leading-relaxed py-1">Contact</a></li>
          <li><a href="#" className="hover:text-[#F5C518] transition-colors leading-relaxed py-1">Careers</a></li>
          <li><a href="#" className="hover:text-[#F5C518] transition-colors leading-relaxed py-1">Blog</a></li>
        </ul>
      </div>

      <div>
        <h4 className="text-white font-bold mb-10">Legal</h4>
        <ul className="space-y-8 text-sm font-medium">
          <li><a href="#" className="hover:text-[#F5C518] transition-colors leading-relaxed py-1">Privacy Policy</a></li>
          <li><a href="#" className="hover:text-[#F5C518] transition-colors leading-relaxed py-1">Terms of Service</a></li>
          <li><a href="#" className="hover:text-[#F5C518] transition-colors leading-relaxed py-1">Cookie Policy</a></li>
        </ul>
      </div>
    </div>
    <div className="max-w-7xl mx-auto pt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-10 text-xs tracking-widest uppercase font-black leading-relaxed">
      <p>© 2025 PREVENTLY. <span className="text-[#F5C518]">GPS-VERIFIED ATTENDANCE.</span></p>
      <p>MADE WITH CARE IN LAGOS, NIGERIA.</p>
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
    <div className="min-h-screen bg-[#F9F7F3] selection:bg-[#F5C518] selection:text-black font-sans">
      <Navbar />
      <Hero />
      <SocialMarquee />
      
      <section className="bg-[#0D0D0D] py-40 px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-20 border-y border-white/5 py-20">
          <StatCounter value="200+" label="Students Enrolled" />
          <StatCounter value="94.7%" label="Avg Attendance Rate" />
          <StatCounter value="3" label="Sec Check-in Time" />
          <StatCounter value="1" label="University & Growing" />
        </div>
        <div className="max-w-4xl mx-auto text-center mt-40">
           <p className="font-display text-4xl md:text-6xl font-black text-white italic tracking-tighter leading-relaxed mb-8">
             "Presently didn't just fix attendance tracking. It changed how we think about student accountability."
           </p>
           <p className="mt-12 text-slate-500 font-bold uppercase tracking-widest text-base leading-relaxed">— Dr. Adeyemi, Dean of Student Affairs</p>
        </div>
      </section>

      <RoleBasedSection />
      <FeaturesBento />

      {/* Mobile App Arc Showcase */}
      <section ref={showcaseRef} className="py-40 px-6 overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto text-center mb-40">
          <span className="text-[#F5C518] text-xs font-black tracking-[0.3em] uppercase mb-8 block">Mobile Experience</span>
          <h2 className="font-display text-5xl md:text-7xl font-black tracking-tighter text-black leading-tight">Beautiful on every screen.<br/>Effortless in every pocket.</h2>
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

        <section className="py-48 px-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-36">
            <span className="text-[#F5C518] text-xs font-black tracking-[0.3em] uppercase mb-8 block leading-relaxed">FAQ</span>
            <h2 className="font-display text-5xl font-black tracking-tighter text-black leading-tight">Questions you'll have.<br/>Answered already.</h2>
          </div>
          <div className="space-y-0">
            <AccordionItem 
              question="Does it work without internet?" 
              answer="Yes! Our offline mode allows students to check in even in dead zones. The record is timestamped locally and synced the moment a connection is re-established."
            />
            <AccordionItem 
              question="Can students spoof their GPS location?" 
              answer="Negative. We use high-precision triangulation combining GPS, Wi-Fi hotspots, and cellular towers. Attempts to use VPNs or mock locations are flagged immediately."
            />
            <AccordionItem 
              question="Does my school need to pay for students?" 
              answer="Presently is built to be accessible. We have tailored plans for institutions that cover all students, or standalone lecturer plans for smaller groups."
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
  
  const scale = useTransform(scrollProgress, [start, (start+end)/2, end], [0.85, 1.15, 0.85]);
  const y = useTransform(scrollProgress, [start, (start+end)/2, end], [50, -40, 50]);
  const opacity = useTransform(scrollProgress, [start - 0.2, start, end, end + 0.2], [0.4, 1, 1, 0.4]);
  const shadow = useTransform(
    scrollProgress, 
    [start, (start+end)/2, end], 
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