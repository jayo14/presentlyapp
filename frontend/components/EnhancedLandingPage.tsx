import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowRight,
  MapPin,
  Users,
  ShieldCheck,
  Clock,
  UserX,
  FileWarning,
  CheckCircle2,
  Play,
  Activity,
  BarChart3,
  Globe,
  Zap,
  Smartphone,
  QrCode,
  Database,
  Lock,
  TrendingUp,
  ShieldAlert,
  School,
  Building2,
  BookOpen
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReChartsTooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Button } from './Button';
import { Logo } from './Logo';

gsap.registerPlugin(ScrollTrigger);

const chartData = [
  { name: 'Mon', students: 400 },
  { name: 'Tue', students: 300 },
  { name: 'Wed', students: 500 },
  { name: 'Thu', students: 280 },
  { name: 'Fri', students: 590 },
];

const EnhancedLandingPage: React.FC<{ onGetStarted: () => void; onLogin: () => void }> = ({ onGetStarted, onLogin }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const problemRef = useRef<HTMLDivElement>(null);
  const breakthroughRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  const [activeStep, setActiveStep] = useState(0);
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        // Simple static reveals for accessibility
        gsap.set('.hero-title, .hero-mockup, .problem-step, .footer-link', { opacity: 1, y: 0, scale: 1 });
        setCounter(248);
        return;
      }

      // Hero Animations
      gsap.from('.hero-title', {
        y: 100,
        opacity: 0,
        duration: 1,
        ease: 'power4.out',
        stagger: 0.2
      });

      gsap.from('.hero-mockup', {
        scale: 0.8,
        opacity: 0,
        duration: 1.5,
        delay: 0.5,
        ease: 'expo.out'
      });

      // Problem Section Scroll Animations
      const problemSteps = gsap.utils.toArray('.problem-step');
      problemSteps.forEach((step: any) => {
        gsap.from(step, {
          scrollTrigger: {
            trigger: step,
            start: 'top 80%',
            end: 'top 20%',
            scrub: 1,
          },
          opacity: 0,
          y: 50,
          scale: 0.9,
        });
      });

      // Breakthrough Animation
      gsap.to('.breakthrough-bg', {
        scrollTrigger: {
          trigger: breakthroughRef.current,
          start: 'top center',
          end: 'bottom center',
          scrub: true,
        },
        backgroundColor: '#FFCA0D',
        color: '#000000',
      });

      // How It Works Pinning
      ScrollTrigger.create({
        trigger: howItWorksRef.current,
        start: 'top top',
        end: '+=300%',
        pin: true,
        scrub: 1,
        onUpdate: (self) => {
          const progress = self.progress;
          if (progress < 0.33) setActiveStep(0);
          else if (progress < 0.66) setActiveStep(1);
          else setActiveStep(2);
        }
      });

      // Dashboard Counter Animation
      ScrollTrigger.create({
        trigger: dashboardRef.current,
        start: 'top 60%',
        onEnter: () => {
          let obj = { val: 0 };
          gsap.to(obj, {
            val: 248,
            duration: 2,
            onUpdate: () => setCounter(Math.floor(obj.val))
          });
        }
      });

      // Impact Metrics Counters
      const metrics = gsap.utils.toArray('.metric-val');
      metrics.forEach((metric: any) => {
        const target = parseInt(metric.dataset.target || '0');
        let obj = { val: 0 };
        gsap.to(obj, {
          scrollTrigger: {
            trigger: metric,
            start: 'top 90%',
          },
          val: target,
          duration: 2,
          onUpdate: () => {
             metric.innerText = Math.floor(obj.val) + (metric.dataset.suffix || '');
          }
        });
      });

      // Footer Animation
      gsap.from('.footer-link', {
        scrollTrigger: {
          trigger: footerRef.current,
          start: 'top 90%',
        },
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="bg-black text-white overflow-x-hidden font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-6 py-8 flex justify-between items-center bg-black/50 backdrop-blur-xl border-b border-white/5">
        <Logo className="h-8 w-auto" />
        <div className="hidden md:flex items-center gap-12 text-sm font-medium text-zinc-400">
          <a href="#problem" className="hover:text-white transition-colors">The Problem</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
          <a href="#benefits" className="hover:text-white transition-colors">Benefits</a>
          <Button variant="ghost" className="text-white hover:text-primary" onClick={onLogin}>Sign In</Button>
          <Button className="bg-primary text-black hover:bg-primary-dark" onClick={onGetStarted}>Get Started</Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col justify-center items-center pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full animate-pulse-glow" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-primary/10 blur-[100px] rounded-full animate-pulse-glow" style={{ animationDelay: '2s' }} />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-50" />
        </div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-10 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-primary text-xs font-bold uppercase tracking-widest hero-title">
              <Zap size={14} /> The Future of Attendance
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] hero-title">
              Your Students Are <span className="text-primary">Present.</span><br />
              Prove It.
            </h1>
            <p className="text-xl md:text-2xl text-zinc-400 max-w-xl mx-auto lg:mx-0 hero-title">
              Real-time, GPS-verified university attendance system that eliminates proxy attendance and manual roll calls.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start hero-title">
              <Button size="lg" className="h-16 px-10 text-lg rounded-full shadow-2xl shadow-primary/20 group font-black" onClick={onGetStarted}>
                Request Demo <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" className="h-16 px-10 text-lg rounded-full border-white/10 text-white hover:bg-white/5 font-bold">
                See How It Works <Play className="ml-2" size={16} fill="currentColor" />
              </Button>
            </div>
          </div>

          <div className="relative hero-mockup">
            <div className="relative w-[320px] md:w-[400px] aspect-[9/19] mx-auto bg-zinc-900 rounded-[3rem] border-8 border-zinc-800 shadow-2xl overflow-hidden animate-float">
              <div className="absolute inset-0 bg-zinc-950 p-6 flex flex-col gap-6">
                <div className="flex justify-between items-center">
                  <div className="w-12 h-12 rounded-full bg-zinc-800" />
                  <div className="w-8 h-8 rounded-lg bg-zinc-800" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-3/4 bg-zinc-800 rounded" />
                  <div className="h-8 w-1/2 bg-primary/20 rounded border border-primary/30" />
                </div>
                <div className="flex-1 rounded-2xl bg-zinc-900 border border-white/5 flex flex-col items-center justify-center p-8 space-y-4">
                  <div className="w-32 h-32 rounded-full border-4 border-primary flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping" />
                    <MapPin className="text-primary" size={48} />
                  </div>
                  <p className="text-primary font-black text-center">Verifying Location...</p>
                </div>
                <div className="h-16 rounded-2xl bg-primary text-black font-black flex items-center justify-center text-xl">
                  Check-in
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section id="problem" ref={problemRef} className="py-64 px-6 relative bg-black overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-40">
          <div className="text-center space-y-6">
            <h2 className="text-zinc-400 text-lg font-black uppercase tracking-[0.4em]">The Old Way</h2>
            <p className="text-4xl md:text-6xl font-bold tracking-tight text-white">Traditional attendance is broken.</p>
          </div>

          <div className="space-y-24">
            <div className="problem-step flex flex-col md:flex-row items-center gap-12 group">
              <div className="w-24 h-24 rounded-3xl bg-zinc-900 flex items-center justify-center border border-white/5 group-hover:border-red-500/50 transition-colors">
                <Clock className="text-zinc-400 group-hover:text-red-500 transition-colors" size={40} />
              </div>
              <div className="space-y-4 text-center md:text-left">
                <h3 className="text-3xl md:text-5xl font-bold text-white leading-tight">15 minutes wasted<br /><span className="text-zinc-400">on manual roll call.</span></h3>
                <p className="text-xl text-zinc-400 max-w-md">Time meant for learning is lost to administrative overhead every single day.</p>
              </div>
            </div>

            <div className="problem-step flex flex-col md:flex-row-reverse items-center gap-12 group">
              <div className="w-24 h-24 rounded-3xl bg-zinc-900 flex items-center justify-center border border-white/5 group-hover:border-red-500/50 transition-colors">
                <UserX className="text-zinc-400 group-hover:text-red-500 transition-colors" size={40} />
              </div>
              <div className="space-y-4 text-center md:text-right">
                <h3 className="text-3xl md:text-5xl font-bold text-white leading-tight">Students signing<br /><span className="text-zinc-400">for their absent friends.</span></h3>
                <p className="text-xl text-zinc-400 max-w-md ml-auto">Proxy attendance compromises academic integrity and makes records unreliable.</p>
              </div>
            </div>

            <div className="problem-step flex flex-col md:flex-row items-center gap-12 group">
              <div className="w-24 h-24 rounded-3xl bg-zinc-900 flex items-center justify-center border border-white/5 group-hover:border-red-500/50 transition-colors">
                <FileWarning className="text-zinc-400 group-hover:text-red-500 transition-colors" size={40} />
              </div>
              <div className="space-y-4 text-center md:text-left">
                <h3 className="text-3xl md:text-5xl font-bold text-white leading-tight">Records missing during<br /><span className="text-zinc-400">critical accreditation.</span></h3>
                <p className="text-xl text-zinc-400 max-w-md">Paper records are easily lost, damaged, or manipulated when they are needed most.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Breakthrough Section */}
      <section ref={breakthroughRef} className="breakthrough-bg relative py-96 px-6 text-center transition-colors duration-700">
        <div className="max-w-5xl mx-auto space-y-12">
          <h2 className="text-6xl md:text-9xl font-black tracking-tighter leading-none">
            Attendance.<br />Reinvented.
          </h2>
          <p className="text-2xl md:text-4xl font-bold opacity-80">
            A zero-trust, automated infrastructure for academic integrity.
          </p>
          <div className="flex justify-center pt-10">
            <div className="w-24 h-24 rounded-full border-4 border-current flex items-center justify-center animate-bounce">
              <MapPin size={48} />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" ref={howItWorksRef} className="h-screen bg-black flex items-center justify-center px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center">
          <div className="space-y-20">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter">Simple. Secure. Instant.</h2>

            <div className="space-y-12">
              {[
                { title: "Lecturer starts a session", desc: "A secure geofence is activated around the classroom.", icon: <Smartphone /> },
                { title: "Students verify via GPS", desc: "Our system confirms physical presence with 100m accuracy.", icon: <QrCode /> },
                { title: "Records are secured", desc: "Attendance is instantly logged into the immutable database.", icon: <Database /> }
              ].map((step, i) => (
                <div key={i} className={`flex gap-8 transition-opacity duration-500 ${activeStep === i ? 'opacity-100' : 'opacity-20'}`}>
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                    {step.icon}
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-white">{step.title}</h3>
                    <p className="text-zinc-400 text-lg">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
             <AnimatePresence mode="wait">
               <motion.div
                 key={activeStep}
                 initial={{ opacity: 0, scale: 0.9, y: 20 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.9, y: -20 }}
                 transition={{ duration: 0.5 }}
                 className="relative w-[320px] md:w-[400px] aspect-[9/19] mx-auto bg-zinc-900 rounded-[3rem] border-8 border-zinc-800 shadow-2xl overflow-hidden"
               >
                 {activeStep === 0 && (
                   <div className="absolute inset-0 bg-zinc-950 p-8 flex flex-col justify-center items-center text-center space-y-8">
                     <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                       <Smartphone size={48} />
                     </div>
                     <h4 className="text-2xl font-black">Lecturer Setup</h4>
                     <p className="text-zinc-400">Starting CSC 301 session at Lecture Theater B...</p>
                     <div className="w-full h-16 bg-primary rounded-2xl flex items-center justify-center text-black font-black">START SESSION</div>
                   </div>
                 )}
                 {activeStep === 1 && (
                    <div className="absolute inset-0 bg-zinc-950 p-8 flex flex-col justify-center items-center text-center space-y-8">
                      <div className="w-24 h-24 rounded-full border-4 border-primary flex items-center justify-center text-primary relative">
                        <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                        <MapPin size={40} />
                      </div>
                      <h4 className="text-2xl font-black">GPS Verification</h4>
                      <p className="text-zinc-400 text-sm">Validating physical presence within 100 meters of coordinates...</p>
                      <div className="flex gap-2">
                         {[1,2,3,4].map(i => <div key={i} className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-primary font-bold">✓</div>)}
                      </div>
                    </div>
                 )}
                 {activeStep === 2 && (
                    <div className="absolute inset-0 bg-zinc-950 p-8 flex flex-col justify-center items-center text-center space-y-8">
                      <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                        <CheckCircle2 size={48} />
                      </div>
                      <h4 className="text-2xl font-black">Verified!</h4>
                      <p className="text-zinc-400">Check-in recorded at 09:12 AM. Database synced.</p>
                      <div className="w-full space-y-2">
                        <div className="h-4 bg-zinc-800 rounded w-full" />
                        <div className="h-4 bg-zinc-800 rounded w-5/6 mx-auto" />
                      </div>
                    </div>
                 )}
               </motion.div>
             </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Live Dashboard Section */}
      <section ref={dashboardRef} className="py-64 px-6 bg-black relative">
        <div className="max-w-7xl mx-auto space-y-24">
          <div className="text-center space-y-6">
            <h2 className="text-zinc-400 text-lg font-black uppercase tracking-[0.4em]">Visibility</h2>
            <p className="text-4xl md:text-7xl font-bold tracking-tight text-white">Command center for your class.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
             <div className="lg:col-span-2 bg-zinc-900/50 rounded-[2.5rem] border border-white/5 p-12 overflow-hidden relative">
                <div className="flex justify-between items-start mb-12">
                   <div>
                      <h3 className="text-3xl font-bold mb-2">Live Session</h3>
                      <p className="text-zinc-400">CSC 301 - Operating Systems</p>
                   </div>
                   <div className="px-4 py-2 rounded-full bg-red-500/10 text-red-500 text-xs font-black animate-pulse flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500" /> LIVE
                   </div>
                </div>

                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FFCA0D" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#FFCA0D" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="students" stroke="#FFCA0D" fillOpacity={1} fill="url(#colorStudents)" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
             </div>

             <div className="space-y-8">
                <div className="bg-zinc-900/50 rounded-[2.5rem] border border-white/5 p-10 flex flex-col justify-center items-center text-center">
                   <Users className="text-primary mb-6" size={48} />
                   <div className="text-7xl font-black mb-2">{counter}</div>
                   <p className="text-zinc-400 font-bold uppercase tracking-widest text-sm">Verified Present</p>
                </div>
                <div className="bg-zinc-900/50 rounded-[2.5rem] border border-white/5 p-10 flex flex-col justify-center items-center text-center">
                   <ShieldAlert className="text-red-500 mb-6" size={48} />
                   <div className="text-7xl font-black mb-2 text-red-500">0</div>
                   <p className="text-zinc-400 font-bold uppercase tracking-widest text-sm">Fraud Attempts Blocked</p>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Trust & Integrity Section */}
      <section className="py-64 px-6 bg-zinc-950">
         <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Location Verification", desc: "4D geolocation sampling ensures students are exactly where they say they are.", icon: <MapPin /> },
              { title: "Real-time Records", desc: "Attendance logs are synced instantly across lecturer and admin dashboards.", icon: <Activity /> },
              { title: "Fraud Prevention", desc: "Advanced device fingerprinting prevents multiple logins from a single student.", icon: <Lock /> },
              { title: "Immutable Audit Logs", desc: "Every record is permanent and non-disputable for institutional integrity.", icon: <Database /> }
            ].map((feature, i) => (
              <div key={i} className="p-10 rounded-[2rem] bg-black border border-white/5 hover:border-primary/20 transition-all group">
                <div className="w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-400 group-hover:text-primary mb-8 transition-colors">
                  {feature.icon}
                </div>
                <h4 className="text-2xl font-bold mb-4">{feature.title}</h4>
                <p className="text-zinc-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
         </div>
      </section>

      {/* Impact Metrics Section */}
      <section className="py-64 px-6 bg-black">
         <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-16 text-center">
            <div className="space-y-4">
               <div className="metric-val text-8xl md:text-9xl font-black text-primary tracking-tighter" data-target="12" data-suffix="m">0m</div>
               <p className="text-zinc-400 font-bold uppercase tracking-widest">Saved Per Class</p>
            </div>
            <div className="space-y-4">
               <div className="metric-val text-8xl md:text-9xl font-black text-primary tracking-tighter" data-target="0" data-suffix="%">0%</div>
               <p className="text-zinc-400 font-bold uppercase tracking-widest">Proxy Attendance</p>
            </div>
            <div className="space-y-4">
               <div className="metric-val text-8xl md:text-9xl font-black text-primary tracking-tighter" data-target="100" data-suffix="%">0%</div>
               <p className="text-zinc-400 font-bold uppercase tracking-widest">Verified Records</p>
            </div>
         </div>
      </section>

      {/* Institutional Benefits Section */}
      <section id="benefits" className="py-64 px-6 bg-zinc-950">
        <div className="max-w-7xl mx-auto space-y-24">
          <div className="text-center space-y-6">
            <h2 className="text-zinc-400 text-lg font-black uppercase tracking-[0.4em]">Transformation</h2>
            <p className="text-4xl md:text-7xl font-bold tracking-tight text-white">Impact at every level.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
             {[
               {
                 title: "For Lecturers",
                 desc: "Automate administrative overhead. Focus on teaching while Presently handles the rest.",
                 icon: <BookOpen />,
                 points: ["One-tap session starts", "Instant eligibility reports", "No more paper sheets"]
               },
               {
                 title: "For Departments",
                 desc: "Gain total visibility into student attendance across all courses and levels.",
                 icon: <Building2 />,
                 points: ["Fraud & anomaly alerts", "Faculty-wide analytics", "Accreditation readiness"]
               },
               {
                 title: "For Universities",
                 desc: "Implement a modern, reliable infrastructure that scales across multi-campus institutions.",
                 icon: <School />,
                 points: ["SIS / Canvas integration", "Immutable audit trails", "Digital transformation"]
               }
             ].map((benefit, i) => (
               <div key={i} className="bg-zinc-900 border border-white/5 p-12 rounded-[3rem] space-y-10 hover:border-primary/20 transition-colors group">
                  <div className="w-20 h-20 rounded-3xl bg-black flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    {benefit.icon}
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-3xl font-bold text-white">{benefit.title}</h3>
                    <p className="text-zinc-400 leading-relaxed text-lg">{benefit.desc}</p>
                  </div>
                  <ul className="space-y-4">
                    {benefit.points.map((point, j) => (
                      <li key={j} className="flex gap-4 items-center text-sm font-bold text-zinc-400">
                        <CheckCircle2 size={16} className="text-primary" /> {point}
                      </li>
                    ))}
                  </ul>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-64 px-6 bg-black text-center relative overflow-hidden">
         <div className="absolute inset-0 bg-primary/2 -z-10" />
         <div className="max-w-6xl mx-auto space-y-20">
            <h2 className="text-6xl md:text-9xl font-black text-white tracking-tighter leading-[0.8]">
               The Future of Academic<br />
               <span className="text-zinc-800 tracking-[-0.05em]">Attendance.</span>
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
               <Button size="lg" className="h-24 px-16 text-3xl rounded-full shadow-2xl shadow-primary/30 group font-black" onClick={onGetStarted}>
                  Request Institutional Demo <ArrowRight className="ml-4 group-hover:translate-x-2 transition-transform" />
               </Button>
            </div>
         </div>
         {/* Simple Background Animation - Campus Nodes */}
         <div className="absolute inset-0 -z-20 opacity-20">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0.1 }}
                animate={{ opacity: [0.1, 0.3, 0.1], scale: [1, 1.2, 1] }}
                transition={{ duration: Math.random() * 5 + 3, repeat: Infinity }}
                className="absolute w-2 h-2 bg-primary rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`
                }}
              />
            ))}
         </div>
      </section>

      {/* Footer */}
      <footer ref={footerRef} className="py-32 px-6 border-t border-white/5 bg-zinc-950">
         <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-16 md:gap-8">
            <div className="space-y-10 col-span-2">
               <Logo className="h-8" />
               <p className="text-zinc-400 text-lg max-w-sm leading-relaxed font-bold">
                  Location-verified attendance infrastructure for universities. Built for integrity, auditability, and academic excellence.
               </p>
            </div>
            <div className="space-y-8">
               <h4 className="text-white font-black uppercase tracking-[0.2em] text-[10px]">Platform</h4>
               <div className="flex flex-col gap-6 text-zinc-400 text-sm font-bold">
                  <span className="footer-link hover:text-white transition-colors cursor-pointer">Documentation</span>
                  <span className="footer-link hover:text-white transition-colors cursor-pointer">Security</span>
                  <span className="footer-link hover:text-white transition-colors cursor-pointer">Integrations</span>
               </div>
            </div>
            <div className="space-y-8">
               <h4 className="text-white font-black uppercase tracking-[0.2em] text-[10px]">Company</h4>
               <div className="flex flex-col gap-6 text-zinc-400 text-sm font-bold">
                  <span className="footer-link hover:text-white transition-colors cursor-pointer">Privacy</span>
                  <span className="footer-link hover:text-white transition-colors cursor-pointer">Terms</span>
                  <p className="text-zinc-800 mt-4">© {new Date().getFullYear()} Presently.</p>
               </div>
            </div>
         </div>
      </footer>
    </div>
  );
};

export default EnhancedLandingPage;
