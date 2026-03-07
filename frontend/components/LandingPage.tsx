import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  Clock,
  Users,
  BarChart3,
  Smartphone,
  ChevronRight,
  Menu,
  X,
  Lock,
  Zap,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Logo = () => (
  <div className="flex items-center gap-2 cursor-pointer group">
    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
      <div className="w-5 h-5 bg-black rounded-sm rotate-45 flex items-center justify-center overflow-hidden">
        <div className="w-full h-full bg-primary -translate-x-1/2 -translate-y-1/2 rotate-45" />
      </div>
    </div>
    <span className="text-2xl font-black text-white tracking-tighter">Presently</span>
  </div>
);

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currency, setCurrency] = useState<'USD' | 'NGN'>('USD');
  
  const heroRef = useRef<HTMLDivElement>(null);
  const problemRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const mockupsRef = useRef<HTMLDivElement>(null);
  const pulseRef = useRef<HTMLDivElement>(null);

  const prices = currency === 'USD'
    ? { lecturer: '$15', department: '$500', institution: 'Custom' }
    : { lecturer: '₦22,500', department: '₦750,000', institution: 'Custom' };

  useEffect(() => {
    // 1. Hero Entrance Animation — staggered reveal
    const heroTl = gsap.timeline();
    heroTl.from(".hero-headline span", {
      y: 100,
      opacity: 0,
      stagger: 0.1,
      duration: 1.2,
      ease: "power4.out"
    })
    .from(".hero-subtext", {
      opacity: 0,
      y: 20,
      duration: 0.8
    }, "-=0.6")
    .from(".hero-cta", {
      opacity: 0,
      y: 20,
      stagger: 0.1,
      duration: 0.8
    }, "-=0.4");

    // 2. GPS Pulse Animation
    gsap.to(pulseRef.current, {
      scale: 1.5,
      opacity: 0,
      duration: 3,
      repeat: -1,
      ease: "sine.out"
    });

    // 3. Problem Statements — one at a time on scroll
    const problems = gsap.utils.toArray(".problem-item");
    problems.forEach((item: any, i) => {
      gsap.fromTo(item,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          scrollTrigger: {
            trigger: item,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });

    // 4. Phone mockups — slide in and snap on scroll
    if (storyRef.current && mockupsRef.current) {
        const mockupItems = gsap.utils.toArray(".mockup-step");

        ScrollTrigger.create({
            trigger: storyRef.current,
            start: "top top",
            end: "+=300%",
            pin: true,
            scrub: 1,
            onUpdate: (self) => {
                const progress = self.progress;
                // Snap index calculation
                const index = Math.min(Math.floor(progress * mockupItems.length), mockupItems.length - 1);

                gsap.to(mockupItems, { opacity: 0, zIndex: 0, duration: 0.3 });
                gsap.to(mockupItems[index] as HTMLElement, { opacity: 1, zIndex: 1, duration: 0.4 });

                // Animate captions
                const captions = gsap.utils.toArray(".step-caption");
                gsap.to(captions, { opacity: 0.2, scale: 0.95, duration: 0.3 });
                gsap.to(captions[index] as HTMLElement, { opacity: 1, scale: 1, duration: 0.3 });
            }
        });
    }

    // 5. Impact Counters — count up when scrolled into view
    const counters = gsap.utils.toArray(".impact-counter");
    counters.forEach((counter: any) => {
      const targetText = counter.innerText;
      const target = parseInt(targetText);

      gsap.fromTo(counter,
        { innerText: 0 },
        {
          innerText: target,
          duration: 2,
          snap: { innerText: 1 },
          scrollTrigger: {
            trigger: counter,
            start: "top 90%",
          },
          onUpdate: function() {
              counter.innerText = Math.ceil(this.targets()[0].innerText);
          }
        }
      );
    });

    // Clean up ScrollTriggers on unmount
    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  const onGetStarted = () => navigate('/auth/register');

  return (
    <div className="bg-black min-h-screen font-lexend selection:bg-primary selection:text-black">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-6 py-8 flex justify-between items-center backdrop-blur-md bg-black/20 border-b border-white/5">
        <Logo />
        <div className="hidden md:flex items-center gap-10">
          <a href="#problem" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">The Problem</a>
          <a href="#product" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">Product</a>
          <a href="#pricing" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">Pricing</a>
          <a href="/documentation" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">Docs</a>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/auth/login')} className="text-sm font-bold text-white hover:text-primary transition-colors">Sign In</button>
          <Button className="rounded-full px-8 font-black" onClick={onGetStarted}>Request Demo</Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden px-6 pt-20">
        <div ref={pulseRef} className="absolute w-[600px] h-[600px] rounded-full border border-primary/20 -z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,202,13,0.05)_0%,transparent_70%)] -z-20" />

        <div className="max-w-5xl text-center space-y-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/50 border border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
             <Globe size={12} className="text-primary" /> Location-Verified Academic Records
          </div>
          <h1 className="hero-headline text-7xl md:text-9xl font-black text-white tracking-tighter leading-[0.85] flex flex-col">
            <span>Your Students</span>
            <span>Are Present.</span>
            <span className="text-primary">Prove It.</span>
          </h1>
          <p className="hero-subtext text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto font-medium leading-relaxed">
            Attendance solved. Finally. Presently ends the chaos of paper registers and proxy check-ins with tamper-proof, location-verified records.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
            <Button size="lg" className="hero-cta h-16 px-10 text-lg rounded-full shadow-2xl shadow-primary/20 group" onClick={() => document.getElementById('product')?.scrollIntoView({ behavior: 'smooth' })}>
              See It In Action <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline" className="hero-cta h-16 px-10 text-lg rounded-full border-white/10 hover:bg-white/5 text-white" onClick={onGetStarted}>
              Request a Demo
            </Button>
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section id="problem" className="py-64 px-6 bg-black relative">
         <div className="max-w-4xl mx-auto space-y-32">
            <div className="problem-item space-y-6">
               <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-tight">
                  "15 minutes of roll call. Class hasn't started. Students are restless."
               </h2>
            </div>
            <div className="problem-item space-y-6">
               <h2 className="text-4xl md:text-6xl font-bold text-zinc-400 tracking-tight leading-tight">
                  "A student claims they attended. You have no proof. Neither do they."
               </h2>
            </div>
            <div className="problem-item space-y-6">
               <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-tight">
                  "Accreditation is next month. Where are the attendance records?"
               </h2>
               <p className="text-2xl text-primary font-black mt-12">Presently ends all three. Permanently.</p>
            </div>
         </div>
      </section>

      {/* Product Story Section - Phone Mockups Snap */}
      <section id="product" ref={storyRef} className="h-screen bg-zinc-950 flex items-center overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 w-full grid lg:grid-cols-2 gap-24 items-center">
          <div className="space-y-24">
             <div className="step-caption space-y-4">
                <h3 className="text-4xl font-bold text-white">No roll call. No disruption.</h3>
                <p className="text-xl text-zinc-400 font-medium">Lecturer opens the app, taps "Start Session", and classes begin immediately. 200 students notified in one second.</p>
             </div>
             <div className="step-caption space-y-4 opacity-20">
                <h3 className="text-4xl font-bold text-white">Presence confirmed.</h3>
                <p className="text-xl text-zinc-400 font-medium">Students check in automatically as they enter the room. 4-point GPS verification ensures they are where they say they are.</p>
             </div>
             <div className="step-caption space-y-4 opacity-20">
                <h3 className="text-4xl font-bold text-white">You see everything.</h3>
                <p className="text-xl text-zinc-400 font-medium">Real-time dashboards show live attendance trends, fraud alerts, and eligibility status for every student in the building.</p>
             </div>
          </div>
          <div className="relative flex justify-center items-center h-[700px]">
             <div ref={mockupsRef} className="w-[320px] h-[640px] bg-zinc-900 rounded-[3rem] border-8 border-zinc-800 shadow-2xl relative overflow-hidden">
                {/* Step 1: Lecturer App */}
                <div className="mockup-step absolute inset-0 bg-black p-6 flex flex-col items-center justify-center text-center space-y-8 z-10">
                   <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
                      <Zap className="text-primary" size={40} />
                   </div>
                   <div className="space-y-2">
                    <p className="text-white font-bold text-xl">Start Session</p>
                    <p className="text-zinc-400 text-sm">CSC 301 • Hall A401</p>
                   </div>
                   <Button className="w-full bg-primary text-black font-black py-4 rounded-xl">Activate GPS</Button>
                </div>
                {/* Step 2: Student Verification */}
                <div className="mockup-step absolute inset-0 bg-black p-6 flex flex-col items-center justify-center text-center space-y-8 opacity-0">
                   <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
                      <ShieldCheck className="text-green-500" size={40} />
                   </div>
                   <div className="space-y-2">
                    <p className="text-white font-bold text-xl">Verified Present</p>
                    <p className="text-zinc-400 text-sm">Accuracy: 2.4m</p>
                   </div>
                   <div className="w-full h-1 bg-green-500 rounded-full" />
                   <p className="text-zinc-400 text-xs">One check-in per student, guaranteed.</p>
                </div>
                {/* Step 3: Admin Dashboard */}
                <div className="mockup-step absolute inset-0 bg-black p-6 flex flex-col space-y-8 opacity-0">
                   <div className="flex justify-between items-center mt-10">
                      <p className="text-white font-bold">Live Dashboard</p>
                      <div className="px-3 py-1 bg-red-500/10 text-red-500 text-[10px] font-bold rounded-full">LIVE</div>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="bg-zinc-900 p-4 rounded-2xl">
                         <p className="text-zinc-400 text-[10px] font-bold">TOTAL</p>
                         <p className="text-white text-2xl font-black">184</p>
                      </div>
                      <div className="bg-zinc-900 p-4 rounded-2xl">
                         <p className="text-zinc-400 text-[10px] font-bold">FRAUD</p>
                         <p className="text-red-500 text-2xl font-black">0</p>
                      </div>
                   </div>
                   <div className="flex-1 bg-zinc-900 rounded-2xl p-4">
                      <div className="space-y-3">
                         {[1,2,3].map(i => (
                            <div key={i} className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-full bg-zinc-800" />
                               <div className="flex-1 space-y-1">
                                  <div className="w-full h-1 bg-zinc-800 rounded" />
                                  <div className="w-1/2 h-1 bg-zinc-800/50 rounded" />
                               </div>
                            </div>
                         ))}
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Impact Section - Outcomes over Features */}
      <section className="py-64 px-6 border-y border-white/5">
         <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12">
            <div className="bg-zinc-950 p-12 rounded-[2.5rem] border border-white/5 space-y-6">
               <div className="text-6xl font-black text-primary tracking-tighter"><span className="impact-counter">12</span>m</div>
               <h4 className="text-2xl font-bold text-white">Saved per class</h4>
               <p className="text-zinc-400 font-medium">That's 3 full teaching days per semester, back in your classroom.</p>
            </div>
            <div className="bg-zinc-950 p-12 rounded-[2.5rem] border border-white/5 space-y-6">
               <div className="text-6xl font-black text-primary tracking-tighter"><span className="impact-counter">0</span>%</div>
               <h4 className="text-2xl font-bold text-white">Proxy attendance</h4>
               <p className="text-zinc-400 font-medium">Proxy attendance dropped to zero at institutions using Presently.</p>
            </div>
            <div className="bg-zinc-950 p-12 rounded-[2.5rem] border border-white/5 space-y-6">
               <div className="text-6xl font-black text-primary tracking-tighter"><span className="impact-counter">100</span>%</div>
               <h4 className="text-2xl font-bold text-white">Audit Success</h4>
               <p className="text-zinc-400 font-medium">Accreditation audits completed in hours, not weeks.</p>
            </div>
         </div>
      </section>

      {/* Audiences Section - Benefit-first transformations */}
      <section className="py-64 px-6 bg-black">
        <div className="max-w-7xl mx-auto space-y-24">
          <div className="text-center space-y-6">
            <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tight">Built for Transformation.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Lecturer Card */}
            <div className="group bg-zinc-950 p-12 rounded-[2.5rem] border border-white/5 hover:border-primary/20 transition-all space-y-12">
              <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap className="text-primary" size={32} />
              </div>
              <div className="space-y-4">
                <h4 className="text-2xl font-bold text-white">Lecturers</h4>
                <p className="text-zinc-400 text-lg leading-relaxed font-medium italic">"You walk in. You teach. Attendance handles itself."</p>
                <p className="text-zinc-400 text-sm leading-relaxed">No more calling names. No more manual data entry. Just pure focus on academic delivery.</p>
              </div>
            </div>
            {/* Department Card */}
            <div className="group bg-zinc-950 p-12 rounded-[2.5rem] border border-white/5 hover:border-primary/20 transition-all space-y-12">
              <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <BarChart3 className="text-primary" size={32} />
              </div>
              <div className="space-y-4">
                <h4 className="text-2xl font-bold text-white">Departments</h4>
                <p className="text-zinc-400 text-lg leading-relaxed font-medium italic">"You see every course, every session, every anomaly — without chasing anyone."</p>
                <p className="text-zinc-400 text-sm leading-relaxed">System-wide visibility into lecture attendance patterns and student eligibility across all courses.</p>
              </div>
            </div>
            {/* Institution Card */}
            <div className="group bg-zinc-950 p-12 rounded-[2.5rem] border border-white/5 hover:border-primary/20 transition-all space-y-12">
              <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShieldCheck className="text-primary" size={32} />
              </div>
              <div className="space-y-4">
                <h4 className="text-2xl font-bold text-white">Institutions</h4>
                <p className="text-zinc-400 text-lg leading-relaxed font-medium italic">"When accreditation comes, your records are already ready."</p>
                <p className="text-zinc-400 text-sm leading-relaxed">Institutional-grade data integrity and audit logs that satisfy the most rigorous accreditation bodies.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* App Store Section */}
      <section className="py-48 px-6 border-y border-white/5 bg-zinc-950">
         <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-10">
               <h3 className="text-5xl md:text-7xl font-bold text-white tracking-tighter leading-tight">Proven integrity, <br /> right in your pocket.</h3>
               <p className="text-xl text-zinc-400 leading-relaxed font-medium">Download Presently to start verifying attendance in your classroom today. Available for all students and lecturers.</p>
               <div className="flex flex-wrap gap-6 pt-4">
                  {/* TODO: Replace with real App Store URL before launch */}
                  <a href="https://apps.apple.com/app/presently" className="store-cta hover:scale-105 transition-transform">
                     <img src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us?size=250x83" alt="Download on the App Store" width={162} height={56} className="h-14" />
                  </a>
                  {/* TODO: Replace with real Play Store URL before launch */}
                  <a href="https://play.google.com/store/apps/details?id=app.presently" className="store-cta hover:scale-105 transition-transform">
                     <img src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" alt="Get it on Google Play" width={200} height={80} className="h-20 -mt-3" />
                  </a>
               </div>
            </div>
            <div className="relative aspect-video bg-zinc-900 rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden p-12">
               <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
               <div className="relative w-full h-full flex items-center justify-center">
                  <BarChart3 className="text-primary/20" size={240} />
               </div>
            </div>
         </div>
      </section>

      {/* Social Proof */}
      <section className="py-32 bg-black">
         <div className="max-w-7xl mx-auto px-6">
            <p className="text-[10px] font-black text-zinc-700 text-center mb-16 uppercase tracking-[0.4em]">Institutional Infrastructure For</p>
            <div className="flex flex-wrap justify-center items-center gap-x-24 gap-y-12 opacity-20 grayscale invert">
               <div className="text-3xl font-black text-white italic">UNILAG</div>
               <div className="text-3xl font-black text-white italic">COVENANT</div>
               <div className="text-3xl font-black text-white italic">ABU ZARIA</div>
               <div className="text-3xl font-black text-white italic">BABCOCK</div>
               <div className="text-3xl font-black text-white italic">LASU</div>
            </div>
         </div>
      </section>

      {/* Pricing Section - Outcome-focused tiers */}
      <section id="pricing" className="py-64 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-primary/5 blur-[160px] -z-10" />
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24 space-y-6">
            <h2 className="text-6xl md:text-8xl font-bold text-white tracking-tighter">The End of the Problem.</h2>
            <p className="text-zinc-400 text-xl font-medium">Choose the scale of your transformation.</p>
            <div className="inline-flex bg-zinc-900 border border-white/5 p-1.5 rounded-full mt-12">
               <button onClick={() => setCurrency('USD')} className={`px-10 py-3 rounded-full text-xs font-black transition-all ${currency === 'USD' ? 'bg-primary text-black' : 'text-zinc-400 hover:text-white'}`}>USD</button>
               <button onClick={() => setCurrency('NGN')} className={`px-10 py-3 rounded-full text-xs font-black transition-all ${currency === 'NGN' ? 'bg-primary text-black' : 'text-zinc-400 hover:text-white'}`}>NGN</button>
            </div>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
             {/* Lecturer Tier */}
             <div className="bg-zinc-950 border border-white/5 p-12 rounded-[2.5rem] space-y-12 hover:border-white/10 transition-colors">
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-white">Lecturer</h3>
                  <p className="text-zinc-400 font-medium">For individual academics ending roll calls in their classrooms.</p>
                </div>
                <div className="text-6xl font-black text-white tracking-tighter">{prices.lecturer} <span className="text-lg text-zinc-400 font-bold tracking-normal">/ sem</span></div>
                <ul className="space-y-6 text-zinc-400 font-bold">
                   <li className="flex gap-4 items-center"><CheckCircle2 className="text-primary" size={18} /> Unlimited students & courses</li>
                   <li className="flex gap-4 items-center"><CheckCircle2 className="text-primary" size={18} /> Real-time GPS verification</li>
                   <li className="flex gap-4 items-center"><CheckCircle2 className="text-primary" size={18} /> Digital eligibility reports</li>
                </ul>
                <Button className="w-full h-20 text-lg rounded-2xl shadow-xl shadow-primary/10 font-black" onClick={onGetStarted}>Get Started Free</Button>
             </div>
             {/* Departmental Tier - Premium Focus */}
             <div className="bg-primary p-12 rounded-[2.5rem] space-y-12 text-black relative overflow-hidden shadow-2xl shadow-primary/20 group scale-105 z-10">
                <div className="absolute top-8 right-8 bg-black/10 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md">Institutional</div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold">Department</h3>
                  <p className="text-black/60 font-bold leading-relaxed">System-wide visibility and fraud protection for entire academic units.</p>
                </div>
                <div className="text-6xl font-black tracking-tighter">{prices.department} <span className="text-lg text-black/40 font-black tracking-normal">/ sem</span></div>
                <ul className="space-y-6 text-black/70 font-black">
                   <li className="flex gap-4 items-center"><CheckCircle2 size={18} /> Centralized admin dashboard</li>
                   <li className="flex gap-4 items-center"><CheckCircle2 size={18} /> Real-time fraud & anomaly alerts</li>
                   <li className="flex gap-4 items-center"><CheckCircle2 size={18} /> Accreditation-ready data exports</li>
                </ul>
                <Button variant="secondary" className="w-full h-20 text-lg rounded-2xl bg-black text-white hover:bg-zinc-900 border-none transition-transform group-hover:scale-[1.02] font-black" onClick={onGetStarted}>Deploy Departmentally</Button>
             </div>
             {/* Institutional Tier */}
             <div className="bg-zinc-950 border border-white/5 p-12 rounded-[2.5rem] space-y-12 hover:border-white/10 transition-colors">
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-white">Institution</h3>
                  <p className="text-zinc-400 font-medium">Enterprise infrastructure for universities with multi-campus scaling.</p>
                </div>
                <div className="text-6xl font-black text-white tracking-tighter">Custom</div>
                <ul className="space-y-6 text-zinc-400 font-bold">
                   <li className="flex gap-4 items-center"><CheckCircle2 className="text-primary" size={18} /> SIS / Canvas Integration</li>
                   <li className="flex gap-4 items-center"><CheckCircle2 className="text-primary" size={18} /> Dedicated Support Manager</li>
                   <li className="flex gap-4 items-center"><CheckCircle2 className="text-primary" size={18} /> On-premise Data Hosting</li>
                </ul>
                <Button variant="outline" className="w-full h-20 text-lg rounded-2xl border-white/10 text-white font-black hover:bg-white/5" onClick={onGetStarted}>Contact Sales</Button>
             </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-64 px-6 bg-black text-center relative overflow-hidden">
         <div className="absolute inset-0 bg-primary/2 -z-10" />
         <div className="max-w-6xl mx-auto space-y-20">
            <h2 className="text-6xl md:text-9xl font-black text-white tracking-tighter leading-[0.8]">
               Attendance Solved.<br />
               <span className="text-zinc-800">Prove It.</span>
            </h2>
            <p className="text-2xl text-zinc-400 font-bold max-w-3xl mx-auto">The Only Question Is When You Stop Tolerating The Old Way.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
               <Button size="lg" className="h-24 px-16 text-3xl rounded-full shadow-2xl shadow-primary/30 group font-black" onClick={onGetStarted}>
                  Request a Demo <ArrowRight className="ml-4 group-hover:translate-x-2 transition-transform" />
               </Button>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="py-32 px-6 border-t border-white/5 bg-zinc-950">
         <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-16 md:gap-8">
            <div className="space-y-10 col-span-2">
               <Logo />
               <p className="text-zinc-400 text-lg max-w-sm leading-relaxed font-bold">
                  Location-verified attendance infrastructure for universities. Built for integrity, auditability, and the Nigerian academic reality.
               </p>
            </div>
            <div className="space-y-8">
               <h4 className="text-white font-black uppercase tracking-[0.2em] text-[10px]">Platform</h4>
               <div className="flex flex-col gap-6 text-zinc-400 text-sm font-bold">
                  <button onClick={() => navigate('/documentation')} className="text-left hover:text-white transition-colors">Documentation</button>
                  <button className="text-left hover:text-white transition-colors">Security</button>
                  <button className="text-left hover:text-white transition-colors">Integrations</button>
                  <button className="text-left hover:text-white transition-colors">Pricing</button>
               </div>
            </div>
            <div className="space-y-8">
               <h4 className="text-white font-black uppercase tracking-[0.2em] text-[10px]">Company</h4>
               <div className="flex flex-col gap-6 text-zinc-400 text-sm font-bold">
                  <button onClick={() => navigate('/volunteers')} className="text-left hover:text-white transition-colors">Volunteers</button>
                  <button className="text-left hover:text-white transition-colors">Privacy</button>
                  <button className="text-left hover:text-white transition-colors">Terms</button>
                  <p className="text-zinc-800 mt-4">© {new Date().getFullYear()} Presently.</p>
               </div>
            </div>
         </div>
      </footer>
    </div>
  );
};
