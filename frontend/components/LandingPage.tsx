import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { Button } from './Button';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  CheckCircle2, ShieldCheck, MapPin, 
  Server, Globe, Database, 
  Building2, GraduationCap, Network, 
  Fingerprint, Menu, X, ChevronDown, ChevronUp,
  Zap
} from 'lucide-react';
import { useCurrentUser } from '../hooks/useAuth';
import { SEO } from './SEO';

gsap.registerPlugin(ScrollTrigger);

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin }) => {
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [currency, setCurrency] = useState<'USD' | 'NGN'>('USD');
  
  const infrastructureRef = useRef<HTMLDivElement>(null);
  const solutionsRef = useRef<HTMLDivElement>(null);
  const securityRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);

  // Setup GSAP scroll animations on mount
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Infrastructure cards stagger animation
      if (infrastructureRef.current) {
        const cards = infrastructureRef.current.querySelectorAll('.infrastructure-card');
        gsap.fromTo(
          cards,
          { opacity: 0, y: 30, rotationX: 10 },
          {
            opacity: 1,
            y: 0,
            rotationX: 0,
            duration: 0.8,
            stagger: 0.15,
            scrollTrigger: {
              trigger: infrastructureRef.current,
              start: 'top 80%',
              end: 'top 20%',
              scrub: 1,
              markers: false
            }
          }
        );
      }

      // Solutions section animation
      if (solutionsRef.current) {
        const sectionTitle = solutionsRef.current.querySelector('h2');
        if (sectionTitle) {
          gsap.fromTo(
            sectionTitle,
            { opacity: 0, x: -50 },
            {
              opacity: 1,
              x: 0,
              duration: 0.8,
              scrollTrigger: {
                trigger: solutionsRef.current,
                start: 'top 85%',
                toggleActions: 'play none none none'
              }
            }
          );
        }
      }

      // Security metrics animation
      if (securityRef.current) {
        const metrics = securityRef.current.querySelectorAll('.metric-box');
        gsap.fromTo(
          metrics,
          { opacity: 0, scale: 0.8 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.6,
            stagger: 0.1,
            scrollTrigger: {
              trigger: securityRef.current,
              start: 'top 80%',
              toggleActions: 'play none none none'
            }
          }
        );
      }

      // Pricing cards animation
      if (pricingRef.current) {
        const pricingCards = pricingRef.current.querySelectorAll('.pricing-card');
        gsap.fromTo(
          pricingCards,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.2,
            scrollTrigger: {
              trigger: pricingRef.current,
              start: 'top 75%',
              toggleActions: 'play none none none'
            }
          }
        );
      }

      // FAQ items animation
      if (faqRef.current) {
        const faqItems = faqRef.current.querySelectorAll('.faq-item');
        gsap.fromTo(
          faqItems,
          { opacity: 0, x: 30 },
          {
            opacity: 1,
            x: 0,
            duration: 0.6,
            stagger: 0.1,
            scrollTrigger: {
              trigger: faqRef.current,
              start: 'top 80%',
              toggleActions: 'play none none none'
            }
          }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const prices = {
    individual: currency === 'USD' ? '$15' : '₦25,000',
    department: currency === 'USD' ? '$500' : '₦800,000',
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const handleDashboardClick = () => {
    navigate('/dashboard');
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-primary selection:text-black overflow-x-hidden">
      <SEO 
        title="Presently | Location-Verified Attendance Infrastructure for Universities"
        description="Location-verified attendance infrastructure for universities. Eliminate paper attendance, proxy sign-ins, and unverifiable records with real-time geofencing, device fingerprinting, and audit-ready compliance."
        keywords="university attendance system, location-verified attendance, academic infrastructure, compliance attendance, geofencing education, attendance fraud prevention, SIS integration"
      />
      
      {/* --- Navbar --- */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/80 backdrop-blur-xl supports-[backdrop-filter]:bg-black/60">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Logo />
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <button onClick={() => scrollToSection('infrastructure')} className="hover:text-white transition-colors">Infrastructure</button>
            <button onClick={() => scrollToSection('solutions')} className="hover:text-white transition-colors">Solutions</button>
            <button onClick={() => scrollToSection('security')} className="hover:text-white transition-colors">System Metrics</button>
            <button onClick={() => scrollToSection('pricing')} className="hover:text-white transition-colors">Pricing</button>
            <button onClick={() => navigate('/documentation')} className="hover:text-white transition-colors">Documentation</button>
            <button onClick={() => navigate('/volunteers')} className="hover:text-white transition-colors">Volunteers</button>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <Button onClick={handleDashboardClick} size="sm" className="rounded-full px-6 shadow-primary/20">
                Dashboard
              </Button>
            ) : (
              <>
                <button onClick={onLogin} className="text-sm font-medium text-white hover:text-primary transition-colors">
                  Sign In
                </button>
                <Button onClick={onGetStarted} size="sm" className="rounded-full px-6 shadow-primary/20">
                  Deploy Presently
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-white" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-zinc-950 border-b border-zinc-800 p-6 space-y-4 overflow-hidden"
            >
              <button onClick={() => scrollToSection('infrastructure')} className="block w-full text-left py-2 text-zinc-400">Infrastructure</button>
              <button onClick={() => scrollToSection('solutions')} className="block w-full text-left py-2 text-zinc-400">Solutions</button>
              <button onClick={() => scrollToSection('security')} className="block w-full text-left py-2 text-zinc-400">System Metrics</button>
              <button onClick={() => scrollToSection('pricing')} className="block w-full text-left py-2 text-zinc-400">Pricing</button>
              <button onClick={() => navigate('/documentation')} className="block w-full text-left py-2 text-zinc-400">Documentation</button>
              <button onClick={() => navigate('/volunteers')} className="block w-full text-left py-2 text-zinc-400">Volunteers</button>
              <div className="pt-4 border-t border-zinc-800 flex flex-col gap-3">
                {user ? (
                  <Button onClick={handleDashboardClick} className="w-full justify-center">
                    Dashboard
                  </Button>
                ) : (
                  <>
                    <Button onClick={onLogin} variant="secondary" className="w-full justify-center">
                      Sign In
                    </Button>
                    <Button onClick={onGetStarted} className="w-full justify-center">
                      Deploy Presently
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* --- Hero Section --- */}
      <section className="pt-32 pb-20 md:pt-48 md:pb-32 px-6 relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] -z-10 pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 -z-10"></div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-8 text-center lg:text-left z-10"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/50 border border-zinc-800 text-xs font-semibold text-primary/90 tracking-wide uppercase">
                <ShieldCheck size={14} />
                <span>Location-Verified Academic Records</span>
            </motion.div>
            
            <motion.h1 variants={fadeInUp} className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-[1.05]">
              Location-Verified <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-yellow-100">
                Attendance
              </span> <br />
              Infrastructure
            </motion.h1>
            
            <motion.p variants={fadeInUp} className="text-lg text-zinc-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Presently eliminates paper attendance, proxy sign-ins, and unverifiable records. Real-time geofencing and device fingerprinting deliver immutable, audit-ready data for universities.
            </motion.p>
            
            <motion.p variants={fadeInUp} className="text-base text-zinc-500 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Built for lecturers who need zero-friction attendance, departments requiring fraud prevention, and institutions mandating compliance-ready records.
            </motion.p>
            
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Button size="lg" onClick={onGetStarted} className="h-14 px-8 text-lg rounded-full w-full sm:w-auto">
                Request Demo
              </Button>
              <Button variant="secondary" size="lg" onClick={() => navigate('/documentation')} className="h-14 px-8 text-lg rounded-full w-full sm:w-auto gap-2 bg-transparent border-white/20 text-white hover:bg-white/5">
                View Documentation
              </Button>
            </motion.div>

            <motion.div variants={fadeInUp} className="pt-8 flex items-center justify-center lg:justify-start gap-8 text-zinc-500 text-sm font-medium">
               <div className="flex items-center gap-2">
                 <CheckCircle2 size={16} className="text-primary" /> Audit-Ready Logs
               </div>
               <div className="flex items-center gap-2">
                 <CheckCircle2 size={16} className="text-primary" /> 99.9% Uptime
               </div>
               <div className="flex items-center gap-2">
                 <CheckCircle2 size={16} className="text-primary" /> NDPR Compliant
               </div>
            </motion.div>
          </motion.div>

          {/* Hero Visual - Abstract Data Visualization */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative hidden lg:block"
          >
            <div className="relative z-10 bg-zinc-950 border border-zinc-800 rounded-xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-8 border-b border-zinc-800 pb-4">
                 <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/20"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/20"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/20"></div>
                 </div>
                 <div className="text-xs font-mono text-zinc-500">live_metrics_stream.json</div>
              </div>
              
              <div className="space-y-4 font-mono text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>STATUS</span>
                  <span className="text-green-500">SYSTEM_OPTIMAL</span>
                </div>
                <div className="h-px bg-zinc-800 my-2"></div>
                
                {[
                  { label: "Active Sessions", val: "1,248", change: "+12%" },
                  { label: "Verified Check-ins", val: "84,392", change: "+4.5%" },
                  { label: "Geofence Integrity", val: "100%", change: "stable" },
                  { label: "Fraud Attempts Blocked", val: "142", change: "-2%" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                     <span className="text-zinc-500">{item.label}</span>
                     <div className="flex items-center gap-3">
                        <span className="text-white">{item.val}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${item.change.includes('+') ? 'bg-green-500/10 text-green-500' : item.change.includes('-') ? 'bg-red-500/10 text-red-500' : 'bg-zinc-800 text-zinc-400'}`}>
                           {item.change}
                        </span>
                     </div>
                  </div>
                ))}

                <div className="mt-8 p-4 bg-zinc-900/50 rounded border border-zinc-800">
                   <div className="text-zinc-500 mb-2">&gt; recent_audit_log</div>
                   <div className="space-y-1 text-zinc-400">
                      <p><span className="text-blue-400">10:42:01</span> [INFO] Dept_CS_402: Session initialized</p>
                      <p><span className="text-blue-400">10:42:05</span> [VERIFY] GPS handshake established</p>
                      <p><span className="text-blue-400">10:42:12</span> [WARN] Device_ID_88392: Proxied request blocked</p>
                      <p><span className="text-blue-400">10:42:15</span> [SUCCESS] Batch_Sync: 45 records committed</p>
                   </div>
                </div>
              </div>
            </div>
            
            {/* Background decorations */}
            <div className="absolute -inset-4 bg-primary/5 rounded-2xl blur-xl -z-10"></div>
          </motion.div>
        </div>
      </section>

      {/* --- 3-Audience Clarity Strip --- */}
      <section className="py-16 px-6 bg-zinc-950 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {/* For Lecturers */}
            <div className="bg-black border border-zinc-800 p-8 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-zinc-900 w-10 h-10 rounded-lg flex items-center justify-center border border-zinc-800">
                  <GraduationCap size={20} className="text-primary" />
                </div>
                <h3 className="text-xl font-bold text-white">For Lecturers</h3>
              </div>
              <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                Zero-friction attendance capture. Start your session, verification happens automatically. No roll calls, no manual entry, instant digital records.
              </p>
              <ul className="space-y-2 text-xs text-zinc-500">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-primary mt-0.5 flex-shrink-0" />
                  <span>One-tap session activation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-primary mt-0.5 flex-shrink-0" />
                  <span>Real-time attendance visibility</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-primary mt-0.5 flex-shrink-0" />
                  <span>Automated exam eligibility reports</span>
                </li>
              </ul>
            </div>

            {/* For Departments / Faculties */}
            <div className="bg-black border border-zinc-800 p-8 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-zinc-900 w-10 h-10 rounded-lg flex items-center justify-center border border-zinc-800">
                  <Building2 size={20} className="text-primary" />
                </div>
                <h3 className="text-xl font-bold text-white">For Departments</h3>
              </div>
              <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                Centralized oversight across all courses and lecturers. Fraud prevention, anomaly detection, and compliance-ready audit trails for academic unit management.
              </p>
              <ul className="space-y-2 text-xs text-zinc-500">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-primary mt-0.5 flex-shrink-0" />
                  <span>Departmental dashboard with real-time metrics</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-primary mt-0.5 flex-shrink-0" />
                  <span>Proxy detection and fraud alerts</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-primary mt-0.5 flex-shrink-0" />
                  <span>Exportable compliance reports</span>
                </li>
              </ul>
            </div>

            {/* For Institutions */}
            <div className="bg-black border border-zinc-800 p-8 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-zinc-900 w-10 h-10 rounded-lg flex items-center justify-center border border-zinc-800">
                  <Network size={20} className="text-primary" />
                </div>
                <h3 className="text-xl font-bold text-white">For Institutions</h3>
              </div>
              <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                Campus-wide system of record for accreditation and funding defense. Multi-campus support, SIS integration, and immutable data for regulatory compliance.
              </p>
              <ul className="space-y-2 text-xs text-zinc-500">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-primary mt-0.5 flex-shrink-0" />
                  <span>Institution-wide visibility and analytics</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-primary mt-0.5 flex-shrink-0" />
                  <span>Accreditation-ready data exports</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-primary mt-0.5 flex-shrink-0" />
                  <span>Deep SIS/LMS integration</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* --- Trust Section --- */}
      <section className="py-12 border-y border-white/5 bg-zinc-950/50">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-sm font-medium text-zinc-500 text-center mb-8 uppercase tracking-widest">Trusted Infrastructure For</p>
          <div className="flex flex-wrap justify-center gap-x-16 gap-y-8 opacity-40 grayscale">
            {/* Stylized placeholder names for "Enterprise" feel */}
            <div className="text-xl font-bold font-serif text-white">UNIVERSITY <span className="font-sans font-light">OF</span> LAGOS</div>
            <div className="text-xl font-bold font-serif text-white">COVENANT <span className="font-sans font-light">UNIVERSITY</span></div>
            <div className="text-xl font-bold font-serif text-white">A.B.U. <span className="font-sans font-light">ZARIA</span></div>
            <div className="text-xl font-bold font-serif text-white">BABCOCK <span className="font-sans font-light">INSTITUTE</span></div>
          </div>
        </div>
      </section>

      {/* --- Infrastructure & Architecture --- */}
      <section id="infrastructure" ref={infrastructureRef} className="py-24 px-6 relative bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 max-w-2xl">
              Infrastructure Built for <br />
              <span className="text-zinc-500">Academic Verification at Scale</span>
            </h2>
            <p className="text-zinc-400 text-lg max-w-3xl leading-relaxed">
              Universities require systems of record, not tools. Presently is architected as institutional infrastructure—ensuring data integrity, auditability, and fraud prevention across thousands of concurrent sessions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="infrastructure-card bg-zinc-900/20 border border-zinc-800 p-8 rounded-2xl">
               <div className="bg-zinc-900 w-12 h-12 rounded-lg flex items-center justify-center mb-6 border border-zinc-800">
                  <MapPin className="text-primary" />
               </div>
               <h3 className="text-xl font-bold text-white mb-3">Location Verification Engine</h3>
               <p className="text-zinc-400 text-sm leading-relaxed">
                  Polygon-based geofencing ensures physical presence within designated boundaries. Prevents GPS spoofing and enforces location integrity down to 5-meter accuracy.
               </p>
            </div>

            <div className="infrastructure-card bg-zinc-900/20 border border-zinc-800 p-8 rounded-2xl">
               <div className="bg-zinc-900 w-12 h-12 rounded-lg flex items-center justify-center mb-6 border border-zinc-800">
                  <Fingerprint className="text-primary" />
               </div>
               <h3 className="text-xl font-bold text-white mb-3">Device Fingerprinting</h3>
               <p className="text-zinc-400 text-sm leading-relaxed">
                  One-device-per-student enforcement through hardware ID and network signature analysis. Eliminates proxy attendance and multi-device fraud attempts.
               </p>
            </div>

            <div className="infrastructure-card bg-zinc-900/20 border border-zinc-800 p-8 rounded-2xl">
               <div className="bg-zinc-900 w-12 h-12 rounded-lg flex items-center justify-center mb-6 border border-zinc-800">
                  <Database className="text-primary" />
               </div>
               <h3 className="text-xl font-bold text-white mb-3">Immutable Audit Logs</h3>
               <p className="text-zinc-400 text-sm leading-relaxed">
                  Cryptographically signed attendance records that cannot be retroactively altered. Full audit trails satisfy accreditation bodies and regulatory requirements.
               </p>
            </div>

            <div className="infrastructure-card bg-zinc-900/20 border border-zinc-800 p-8 rounded-2xl">
               <div className="bg-zinc-900 w-12 h-12 rounded-lg flex items-center justify-center mb-6 border border-zinc-800">
                  <Network className="text-primary" />
               </div>
               <h3 className="text-xl font-bold text-white mb-3">Offline-First Architecture</h3>
               <p className="text-zinc-400 text-sm leading-relaxed">
                  Attendance capture continues during network disruptions. Data is signed locally and synced when connectivity restores, ensuring zero data loss.
               </p>
            </div>

            <div className="infrastructure-card bg-zinc-900/20 border border-zinc-800 p-8 rounded-2xl">
               <div className="bg-zinc-900 w-12 h-12 rounded-lg flex items-center justify-center mb-6 border border-zinc-800">
                  <Server className="text-primary" />
               </div>
               <h3 className="text-xl font-bold text-white mb-3">Student Information System Integration</h3>
               <p className="text-zinc-400 text-sm leading-relaxed">
                  Direct integration with existing SIS and LMS platforms. Automated roster synchronization and gradebook updates without manual intervention.
               </p>
            </div>

            <div className="infrastructure-card bg-zinc-900/20 border border-zinc-800 p-8 rounded-2xl">
               <div className="bg-zinc-900 w-12 h-12 rounded-lg flex items-center justify-center mb-6 border border-zinc-800">
                  <Globe className="text-primary" />
               </div>
               <h3 className="text-xl font-bold text-white mb-3">Multi-Campus Deployment</h3>
               <p className="text-zinc-400 text-sm leading-relaxed">
                  Unified management across multiple campuses and satellite locations. Global timezone support with localized compliance configurations.
               </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- Solutions by Role --- */}
      <section id="solutions" ref={solutionsRef} className="py-24 px-6 bg-zinc-950 border-t border-white/5">
         <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-16 text-center">Built for Every Level of Academic Administration</h2>
            
            <div className="space-y-24">
               {/* For Admin */}
               <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div className="order-2 md:order-1">
                     <div className="inline-flex items-center gap-2 text-primary font-bold mb-4">
                        <Building2 size={20} /> For Institutions & Registrars
                     </div>
                     <h3 className="text-4xl font-bold text-white mb-4">Accreditation-Ready Data Infrastructure</h3>
                     <p className="text-zinc-400 text-lg mb-6">
                        Campus-wide visibility into facility utilization, student engagement patterns, and attendance trends. Exportable data sets meet accreditation body requirements and support funding defense.
                     </p>
                     <ul className="space-y-3 mb-8">
                        {['Multi-campus utilization analytics', 'Automated compliance reporting for NUC/accreditation', 'Real-time fraud detection and anomaly alerts'].map((item, i) => (
                           <li key={i} className="flex items-center gap-3 text-zinc-300">
                              <CheckCircle2 size={18} className="text-primary" /> {item}
                           </li>
                        ))}
                     </ul>
                     <Button variant="outline">Explore Institutional Console</Button>
                  </div>
                  <div className="order-1 md:order-2 bg-zinc-900 rounded-2xl p-6 border border-zinc-800 rotate-2 hover:rotate-0 transition-transform duration-500">
                     <div className="bg-black rounded-xl p-4 border border-zinc-800 space-y-4">
                        <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
                           <span className="text-sm font-bold text-white">Campus Attendance Overview</span>
                           <span className="text-xs text-zinc-500">Oct 24, 2025</span>
                        </div>
                        <div className="space-y-3">
                           <div className="flex justify-between items-center">
                              <span className="text-zinc-400 text-sm">Faculty of Engineering</span>
                              <span className="text-green-500 text-sm font-bold">94.2%</span>
                           </div>
                           <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
                              <div className="bg-green-500 w-[94%] h-full"></div>
                           </div>
                           <div className="flex justify-between items-center">
                              <span className="text-zinc-400 text-sm">Faculty of Science</span>
                              <span className="text-yellow-500 text-sm font-bold">88.5%</span>
                           </div>
                           <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
                              <div className="bg-yellow-500 w-[88%] h-full"></div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* For Lecturers */}
               <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 -rotate-2 hover:rotate-0 transition-transform duration-500">
                      <div className="bg-black rounded-xl p-4 border border-zinc-800 flex items-center justify-center h-64">
                         <div className="text-center space-y-4">
                            <div className="inline-block p-4 bg-primary/20 rounded-full text-primary">
                               <Zap size={32} />
                            </div>
                            <h4 className="text-white font-bold">Session Initialized</h4>
                            <p className="text-zinc-500 text-sm">CSC 201 • Lecture Hall A402</p>
                            <div className="flex gap-2 justify-center">
                               <span className="text-xs bg-zinc-800 text-white px-2 py-1 rounded">Location: Verified</span>
                               <span className="text-xs bg-zinc-800 text-white px-2 py-1 rounded">QR: Active</span>
                            </div>
                         </div>
                      </div>
                  </div>
                  <div>
                     <div className="inline-flex items-center gap-2 text-primary font-bold mb-4">
                        <GraduationCap size={20} /> For Lecturers
                     </div>
                     <h3 className="text-4xl font-bold text-white mb-4">Eliminate Manual Attendance</h3>
                     <p className="text-zinc-400 text-lg mb-6">
                        No more 15-minute roll calls. Session activation is instantaneous, verification is automatic, and records are generated in real-time. Focus on teaching, not administration.
                     </p>
                     <ul className="space-y-3 mb-8">
                        {['One-tap session initiation with QR generation', 'Live student check-in visibility', 'Automated exam eligibility calculations'].map((item, i) => (
                           <li key={i} className="flex items-center gap-3 text-zinc-300">
                              <CheckCircle2 size={18} className="text-primary" /> {item}
                           </li>
                        ))}
                     </ul>
                     <Button variant="outline">View Lecturer Features</Button>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* --- Why Choose Presently (Stats/Proof) --- */}
      <section id="security" ref={securityRef} className="py-24 px-6 relative overflow-hidden">
         <div className="absolute inset-0 bg-primary/5 -skew-y-2 scale-110 -z-10"></div>
         <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-16">System Integrity & Operational Metrics</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
               <div className="bg-black border border-zinc-800 p-8 rounded-2xl">
                  <h3 className="text-5xl font-bold text-white mb-4">100%</h3>
                  <p className="text-lg font-bold text-white mb-2">Audit Traceability</p>
                  <p className="text-zinc-400 text-sm">Every check-in is timestamped, geo-tagged, and cryptographically signed. Immutable records for accreditation and compliance.</p>
               </div>
               <div className="bg-black border border-zinc-800 p-8 rounded-2xl">
                  <h3 className="text-5xl font-bold text-white mb-4">99.9%</h3>
                  <p className="text-lg font-bold text-white mb-2">System Uptime SLA</p>
                  <p className="text-zinc-400 text-sm">Infrastructure-grade availability monitored 24/7. Downtime incidents logged and reported transparently.</p>
               </div>
               <div className="bg-black border border-zinc-800 p-8 rounded-2xl">
                  <h3 className="text-5xl font-bold text-white mb-4">&lt;200ms</h3>
                  <p className="text-lg font-bold text-white mb-2">Check-In Latency</p>
                  <p className="text-zinc-400 text-sm">Sub-second response time for attendance verification. Optimized for high-concurrency scenarios and large lecture halls.</p>
               </div>
            </div>
         </div>
      </section>

      {/* --- Enterprise Pricing --- */}
      <section id="pricing" ref={pricingRef} className="py-24 px-6 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Deployment Models</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto mb-10">
              Presently scales from individual lecturer deployment to institution-wide infrastructure. Select the coverage model aligned with your administrative scope and compliance requirements.
            </p>

            {/* Currency Toggle */}
            <div className="inline-flex bg-zinc-900 border border-zinc-800 p-1 rounded-full relative mb-12">
                 <button 
                    onClick={() => setCurrency('USD')}
                    className={`px-8 py-2 rounded-full text-sm font-semibold transition-all relative z-10 ${currency === 'USD' ? 'text-black' : 'text-zinc-400 hover:text-white'}`}
                 >
                     USD
                 </button>
                 <button 
                    onClick={() => setCurrency('NGN')}
                    className={`px-8 py-2 rounded-full text-sm font-semibold transition-all relative z-10 ${currency === 'NGN' ? 'text-black' : 'text-zinc-400 hover:text-white'}`}
                 >
                     NGN
                 </button>
                 <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-primary rounded-full transition-all duration-300 ${currency === 'USD' ? 'left-1' : 'left-[calc(50%+4px)]'}`}></div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
             {/* Individual Practitioner */}
             <div className="pricing-card bg-zinc-900/50 border border-zinc-800 p-10 rounded-3xl flex flex-col">
                <div className="mb-8">
                   <h3 className="text-xl font-bold text-white mb-2">Lecturer License</h3>
                   <p className="text-zinc-500 text-sm">For individual lecturers requiring classroom-level attendance management with location verification and digital record generation.</p>
                </div>
                <div className="mb-8">
                   <span className="text-4xl font-bold text-white">{prices.individual}</span>
                   <span className="text-zinc-500 text-sm ml-2">/ semester</span>
                </div>
                <div className="flex-1 space-y-4 mb-8 text-sm">
                   {[
                      'Unlimited students per course',
                      'Up to 5 concurrent courses',
                      'GPS & device fingerprint verification',
                      'Digital attendance records',
                      'CSV/PDF export capability'
                   ].map((feat, i) => (
                      <div key={i} className="flex items-start gap-3 text-zinc-300">
                         <CheckCircle2 size={16} className="text-primary mt-0.5 flex-shrink-0" />
                         {feat}
                      </div>
                   ))}
                   <div className="pt-4 border-t border-zinc-800 space-y-2 opacity-50">
                      <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Excludes</p>
                      <p className="text-xs text-zinc-500">Institutional admin access, departmental oversight, SIS integrations, audit reporting.</p>
                   </div>
                </div>
                <Button variant="secondary" className="w-full h-12" onClick={onGetStarted}>Deploy as Lecturer</Button>
             </div>

             {/* Departmental License */}
             <div className="bg-zinc-900 border-2 border-primary/50 p-10 rounded-3xl flex flex-col relative shadow-2xl shadow-primary/5">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-black text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-widest">Recommended</div>
                <div className="mb-8">
                   <h3 className="text-xl font-bold text-white mb-2">Departmental License</h3>
                   <p className="text-zinc-500 text-sm">Centralized system of record for academic departments requiring operational oversight, fraud prevention, and compliance-ready audit trails.</p>
                </div>
                <div className="mb-8">
                   <span className="text-4xl font-bold text-white">{prices.department}</span>
                   <span className="text-zinc-500 text-sm ml-2">/ semester / department</span>
                </div>
                <div className="flex-1 space-y-4 mb-8 text-sm">
                   {[
                      'Full departmental coverage',
                      'Centralized administrative dashboard',
                      'Fraud detection and anomaly alerts',
                      'Compliance audit reporting',
                      'Bulk roster management',
                      'Priority technical support'
                   ].map((feat, i) => (
                      <div key={i} className="flex items-start gap-3 text-white">
                         <CheckCircle2 size={16} className="text-primary mt-0.5 flex-shrink-0" />
                         {feat}
                      </div>
                   ))}
                </div>
                <Button className="w-full h-12" onClick={onGetStarted}>Deploy Departmentally</Button>
             </div>

             {/* Institutional Infrastructure */}
             <div className="pricing-card bg-zinc-900/50 border border-zinc-800 p-10 rounded-3xl flex flex-col">
                <div className="mb-8">
                   <h3 className="text-xl font-bold text-white mb-2">Institutional License</h3>
                   <p className="text-zinc-500 text-sm">Campus-wide attendance infrastructure for universities requiring unified system of record, deep technical integration, and total institutional visibility.</p>
                </div>
                <div className="mb-8">
                   <span className="text-2xl font-bold text-white tracking-tight italic">Custom Pricing</span>
                </div>
                <div className="flex-1 space-y-4 mb-8 text-sm">
                   {[
                      'Institution-wide deployment',
                      'SIS/LMS/SSO deep integration',
                      'Custom data retention policies',
                      'Accreditation-ready data exports',
                      'Dedicated infrastructure engineer',
                      '99.9% uptime SLA guarantee'
                   ].map((feat, i) => (
                      <div key={i} className="flex items-start gap-3 text-zinc-300">
                         <CheckCircle2 size={16} className="text-primary mt-0.5 flex-shrink-0" />
                         {feat}
                      </div>
                   ))}
                </div>
                <Button variant="outline" className="w-full h-12" onClick={onGetStarted}>Request Institutional Consultation</Button>
             </div>
          </div>

          <div className="mt-12 text-center">
             <p className="text-zinc-500 text-sm">
                All deployment models include cryptographic audit logs, offline-first architecture, and NDPR compliance. Upgrade paths preserve historical data.
             </p>
          </div>
        </div>
      </section>

      {/* --- FAQ --- */}
      <section className="py-24 px-6 bg-zinc-950 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Common Questions</h2>
          <div className="space-y-4">
            {[
              { q: "Does Presently integrate with our existing Student Information System?", a: "Yes. Presently provides RESTful APIs and webhook integrations for bidirectional data synchronization with most SIS platforms. Student rosters, course enrollments, and attendance records can be automatically synced without manual intervention." },
              { q: "How is location data secured and who has access to it?", a: "Location data is encrypted in transit (TLS 1.3) and at rest (AES-256). Access is restricted to authorized institutional administrators. Location tracking is active only during verified attendance sessions. Presently is NDPR compliant and supports GDPR data subject requests." },
              { q: "What happens if network connectivity fails during a session?", a: "Presently uses an offline-first architecture. Attendance records are cryptographically signed and stored locally on student devices, then automatically synchronized when connectivity is restored. No data loss occurs during network outages." },
              { q: "Can the system handle large lecture halls with hundreds of concurrent check-ins?", a: "Yes. Infrastructure is designed for high-concurrency scenarios. Stress-tested to handle thousands of simultaneous write operations with sub-200ms latency. Suitable for general education courses and large auditoriums." }
            ].map((item, i) => (
              <div key={i} className="bg-black border border-zinc-800 rounded-xl overflow-hidden">
                <button 
                  onClick={() => toggleFaq(i)}
                  className="w-full flex items-center justify-between p-6 text-left font-medium text-white hover:bg-zinc-900 transition-colors"
                >
                  {item.q}
                  {openFaqIndex === i ? <ChevronUp className="text-zinc-500" /> : <ChevronDown className="text-zinc-500" />}
                </button>
                <AnimatePresence>
                  {openFaqIndex === i && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 pt-0 text-zinc-400 text-sm leading-relaxed border-t border-zinc-800 bg-zinc-900/30">
                        {item.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA --- */}
      <section className="py-24 px-6">
         <div className="max-w-5xl mx-auto bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 rounded-3xl p-12 md:p-20 text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Deploy Verified Attendance Infrastructure</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto mb-10">
               Join universities using Presently to eliminate proxy attendance, ensure regulatory compliance, and maintain audit-ready records for accreditation.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
               <Button size="lg" className="h-14 px-10 text-lg rounded-full" onClick={onGetStarted}>
                  Request Demo
               </Button>
               <Button variant="secondary" size="lg" className="h-14 px-10 text-lg rounded-full" onClick={onLogin}>
                  Access Console
               </Button>
            </div>
         </div>
      </section>

      {/* --- Footer --- */}
      <footer className="bg-black border-t border-zinc-900 pt-16 pb-8 px-6 text-sm">
        <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-16">
                <div className="col-span-2 lg:col-span-2 space-y-4 pr-8">
                    <Logo />
                    <p className="text-zinc-500 leading-relaxed max-w-sm mt-4">
                        Location-verified attendance infrastructure for universities. Built for compliance, audit readiness, and fraud prevention at institutional scale.
                    </p>
                </div>
                <div>
                    <h4 className="text-white font-bold mb-4">Platform</h4>
                    <ul className="space-y-2 text-zinc-500">
                        <li><a href="#" className="hover:text-white transition-colors">Infrastructure</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Compliance</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-white font-bold mb-4">Company</h4>
                    <ul className="space-y-2 text-zinc-500">
                        <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Partners</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-white font-bold mb-4">Legal</h4>
                    <ul className="space-y-2 text-zinc-500">
                        <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">DPA</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">SLA</a></li>
                    </ul>
                </div>
            </div>
            <div className="border-t border-zinc-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-zinc-600">
                <p>&copy; {new Date().getFullYear()} Presently Inc. All rights reserved.</p>
                <div className="flex gap-6">
                    <span className="flex items-center gap-2"><Globe size={14} /> Global Region</span>
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
};
