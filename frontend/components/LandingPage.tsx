import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { Button } from './Button';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, ShieldCheck, MapPin, 
  Server, Globe, Database, 
  Building2, GraduationCap, Network, 
  Fingerprint, Menu, X, ChevronDown, ChevronUp,
  Zap
} from 'lucide-react';
import { useCurrentUser } from '../hooks/useAuth';
import { SEO } from './SEO';

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
        title="Presently | Academic Attendance Infrastructure"
        description="Enterprise-grade attendance verification and academic intelligence infrastructure for universities. Real-time geofencing, audit-ready compliance, and institutional scale."
        keywords="academic infrastructure, university attendance, geofencing, compliance, educational technology, enterprise software"
      />
      
      {/* --- Navbar --- */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/80 backdrop-blur-xl supports-[backdrop-filter]:bg-black/60">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Logo />
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <button onClick={() => scrollToSection('infrastructure')} className="hover:text-white transition-colors">Infrastructure</button>
            <button onClick={() => scrollToSection('solutions')} className="hover:text-white transition-colors">Solutions</button>
            <button onClick={() => scrollToSection('security')} className="hover:text-white transition-colors">Security</button>
            <button onClick={() => scrollToSection('pricing')} className="hover:text-white transition-colors">Enterprise</button>
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
              <button onClick={() => scrollToSection('pricing')} className="block w-full text-left py-2 text-zinc-400">Enterprise</button>
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
                <span>Enterprise-Grade Verification</span>
            </motion.div>
            
            <motion.h1 variants={fadeInUp} className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-[1.05]">
              Academic <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-yellow-100">
                Intelligence
              </span> <br />
              Infrastructure
            </motion.h1>
            
            <motion.p variants={fadeInUp} className="text-lg text-zinc-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              The system of record for university attendance. Presently replaces fragile paper trails with immutable, location-verified data logs—enabling real-time compliance, fraud prevention, and institutional scalability.
            </motion.p>
            
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Button size="lg" onClick={onGetStarted} className="h-14 px-8 text-lg rounded-full w-full sm:w-auto">
                Schedule Demo
              </Button>
              <Button variant="secondary" size="lg" className="h-14 px-8 text-lg rounded-full w-full sm:w-auto gap-2 bg-transparent border-white/20 text-white hover:bg-white/5">
                View Architecture
              </Button>
            </motion.div>

            <motion.div variants={fadeInUp} className="pt-8 flex items-center justify-center lg:justify-start gap-8 text-zinc-500 text-sm font-medium">
               <div className="flex items-center gap-2">
                 <CheckCircle2 size={16} className="text-primary" /> SOC2 Compliant
               </div>
               <div className="flex items-center gap-2">
                 <CheckCircle2 size={16} className="text-primary" /> 99.99% Uptime
               </div>
               <div className="flex items-center gap-2">
                 <CheckCircle2 size={16} className="text-primary" /> GDPR Ready
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
      <section id="infrastructure" className="py-24 px-6 relative bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 max-w-2xl">
              Not Just an App.<br />
              <span className="text-zinc-500">Critical Academic Infrastructure.</span>
            </h2>
            <p className="text-zinc-400 text-lg max-w-3xl leading-relaxed">
              Universities don't need another "tool". They need a system of record. Presently is architected to handle the complexity of institutional data, ensuring integrity, availability, and auditability at scale.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-zinc-900/20 border border-zinc-800 p-8 rounded-2xl">
               <div className="bg-zinc-900 w-12 h-12 rounded-lg flex items-center justify-center mb-6 border border-zinc-800">
                  <MapPin className="text-primary" />
               </div>
               <h3 className="text-xl font-bold text-white mb-3">Geofencing Engine</h3>
               <p className="text-zinc-400 text-sm leading-relaxed">
                  Proprietary polygon-based location verification ensures students are physically present. Accuracy down to 5 meters, with anti-spoofing heuristics.
               </p>
            </div>

            <div className="bg-zinc-900/20 border border-zinc-800 p-8 rounded-2xl">
               <div className="bg-zinc-900 w-12 h-12 rounded-lg flex items-center justify-center mb-6 border border-zinc-800">
                  <Fingerprint className="text-primary" />
               </div>
               <h3 className="text-xl font-bold text-white mb-3">Device Fingerprinting</h3>
               <p className="text-zinc-400 text-sm leading-relaxed">
                  One-device-to-one-student enforcement. We analyze hardware IDs and network signatures to prevent "buddy punching" and proxy attendance.
               </p>
            </div>

            <div className="bg-zinc-900/20 border border-zinc-800 p-8 rounded-2xl">
               <div className="bg-zinc-900 w-12 h-12 rounded-lg flex items-center justify-center mb-6 border border-zinc-800">
                  <Database className="text-primary" />
               </div>
               <h3 className="text-xl font-bold text-white mb-3">Immutable Audit Logs</h3>
               <p className="text-zinc-400 text-sm leading-relaxed">
                  Every check-in is a cryptographically verifiable event. Full audit trails for accreditation bodies, ensuring data cannot be retroactively altered.
               </p>
            </div>

            <div className="bg-zinc-900/20 border border-zinc-800 p-8 rounded-2xl">
               <div className="bg-zinc-900 w-12 h-12 rounded-lg flex items-center justify-center mb-6 border border-zinc-800">
                  <Network className="text-primary" />
               </div>
               <h3 className="text-xl font-bold text-white mb-3">Offline-First Sync</h3>
               <p className="text-zinc-400 text-sm leading-relaxed">
                  Built for unstable network environments. Data is captured locally, cryptographically signed, and synced when connectivity is restored.
               </p>
            </div>

            <div className="bg-zinc-900/20 border border-zinc-800 p-8 rounded-2xl">
               <div className="bg-zinc-900 w-12 h-12 rounded-lg flex items-center justify-center mb-6 border border-zinc-800">
                  <Server className="text-primary" />
               </div>
               <h3 className="text-xl font-bold text-white mb-3">SIS Integration</h3>
               <p className="text-zinc-400 text-sm leading-relaxed">
                  Seamlessly syncs with existing Student Information Systems (SIS) and LMS. Automated roster updates and gradebook synchronization.
               </p>
            </div>

            <div className="bg-zinc-900/20 border border-zinc-800 p-8 rounded-2xl">
               <div className="bg-zinc-900 w-12 h-12 rounded-lg flex items-center justify-center mb-6 border border-zinc-800">
                  <Globe className="text-primary" />
               </div>
               <h3 className="text-xl font-bold text-white mb-3">Multi-Campus Ready</h3>
               <p className="text-zinc-400 text-sm leading-relaxed">
                  Unified management for institutions with multiple campuses or satellite locations. Global timezone support and localized compliance.
               </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- Solutions by Role --- */}
      <section id="solutions" className="py-24 px-6 bg-zinc-950 border-t border-white/5">
         <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-16 text-center">Built for the Entire Institution</h2>
            
            <div className="space-y-24">
               {/* For Admin */}
               <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div className="order-2 md:order-1">
                     <div className="inline-flex items-center gap-2 text-primary font-bold mb-4">
                        <Building2 size={20} /> For Administrators
                     </div>
                     <h3 className="text-4xl font-bold text-white mb-4">Data-Driven Accreditation</h3>
                     <p className="text-zinc-400 text-lg mb-6">
                        Stop guessing about facility utilization and student engagement. Get precise, exportable data for NUC/accreditation visits and funding defense.
                     </p>
                     <ul className="space-y-3 mb-8">
                        {['Campus-wide utilization heatmaps', 'Automated compliance reporting', 'Fraud detection alerts'].map((item, i) => (
                           <li key={i} className="flex items-center gap-3 text-zinc-300">
                              <CheckCircle2 size={18} className="text-primary" /> {item}
                           </li>
                        ))}
                     </ul>
                     <Button variant="outline">Explore Admin Console</Button>
                  </div>
                  <div className="order-1 md:order-2 bg-zinc-900 rounded-2xl p-6 border border-zinc-800 rotate-2 hover:rotate-0 transition-transform duration-500">
                     <div className="bg-black rounded-xl p-4 border border-zinc-800 space-y-4">
                        <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
                           <span className="text-sm font-bold text-white">Daily Attendance Report</span>
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
                            <h4 className="text-white font-bold">Session Auto-Started</h4>
                            <p className="text-zinc-500 text-sm">CSC 201 • Room A402</p>
                            <div className="flex gap-2 justify-center">
                               <span className="text-xs bg-zinc-800 text-white px-2 py-1 rounded">Geolocation: Active</span>
                               <span className="text-xs bg-zinc-800 text-white px-2 py-1 rounded">QR: Dynamic</span>
                            </div>
                         </div>
                      </div>
                  </div>
                  <div>
                     <div className="inline-flex items-center gap-2 text-primary font-bold mb-4">
                        <GraduationCap size={20} /> For Lecturers
                     </div>
                     <h3 className="text-4xl font-bold text-white mb-4">Focus on Teaching, Not Counting</h3>
                     <p className="text-zinc-400 text-lg mb-6">
                        Eliminate the 15-minute "roll call" ritual. Start your class, let the infrastructure handle verification, and get instant digital records.
                     </p>
                     <ul className="space-y-3 mb-8">
                        {['Zero-touch session initiation', 'Real-time attendee list', 'Automated exam eligibility calculation'].map((item, i) => (
                           <li key={i} className="flex items-center gap-3 text-zinc-300">
                              <CheckCircle2 size={18} className="text-primary" /> {item}
                           </li>
                        ))}
                     </ul>
                     <Button variant="outline">Lecturer Features</Button>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* --- Why Choose Presently (Stats/Proof) --- */}
      <section className="py-24 px-6 relative overflow-hidden">
         <div className="absolute inset-0 bg-primary/5 -skew-y-2 scale-110 -z-10"></div>
         <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-16">Why Leading Institutions Choose Presently</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
               <div className="bg-black border border-zinc-800 p-8 rounded-2xl">
                  <h3 className="text-5xl font-bold text-white mb-4">100%</h3>
                  <p className="text-lg font-bold text-white mb-2">Audit Traceability</p>
                  <p className="text-zinc-400 text-sm">Every data point is time-stamped, geo-tagged, and immutable.</p>
               </div>
               <div className="bg-black border border-zinc-800 p-8 rounded-2xl">
                  <h3 className="text-5xl font-bold text-white mb-4">85%</h3>
                  <p className="text-lg font-bold text-white mb-2">Admin Time Saved</p>
                  <p className="text-zinc-400 text-sm">Reduction in manual data entry and report compilation time.</p>
               </div>
               <div className="bg-black border border-zinc-800 p-8 rounded-2xl">
                  <h3 className="text-5xl font-bold text-white mb-4">0%</h3>
                  <p className="text-lg font-bold text-white mb-2">Infrastructure Overhead</p>
                  <p className="text-zinc-400 text-sm">Fully managed cloud solution. No servers to buy or maintain.</p>
               </div>
            </div>
         </div>
      </section>

      {/* --- Enterprise Pricing --- */}
      <section id="pricing" className="py-24 px-6 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Institutional Licensing</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto mb-10">
              Presently is deployed as academic infrastructure. Select the coverage model that fits your administrative scope.
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
             <div className="bg-zinc-900/50 border border-zinc-800 p-10 rounded-3xl flex flex-col">
                <div className="mb-8">
                   <h3 className="text-xl font-bold text-white mb-2">Individual Practitioner</h3>
                   <p className="text-zinc-500 text-sm">For lecturers focused on streamlining classroom operations and eliminating manual administrative overhead.</p>
                </div>
                <div className="mb-8">
                   <span className="text-4xl font-bold text-white">{prices.individual}</span>
                   <span className="text-zinc-500 text-sm ml-2">/ semester</span>
                </div>
                <div className="flex-1 space-y-4 mb-8 text-sm">
                   {[
                      'Unlimited students per course',
                      'Up to 5 concurrent courses',
                      'GPS & Device verification',
                      'Verified check-in logs',
                      'Standard CSV/PDF exports'
                   ].map((feat, i) => (
                      <div key={i} className="flex items-start gap-3 text-zinc-300">
                         <CheckCircle2 size={16} className="text-primary mt-0.5 flex-shrink-0" />
                         {feat}
                      </div>
                   ))}
                   <div className="pt-4 border-t border-zinc-800 space-y-2 opacity-50">
                      <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Excludes</p>
                      <p className="text-xs text-zinc-500">Institutional Admin Privileges, Departmental Audit Trails, SIS Integrations.</p>
                   </div>
                </div>
                <Button variant="secondary" className="w-full h-12" onClick={onGetStarted}>Deploy Individually</Button>
             </div>

             {/* Departmental License */}
             <div className="bg-zinc-900 border-2 border-primary/50 p-10 rounded-3xl flex flex-col relative shadow-2xl shadow-primary/5">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-black text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-widest">Administrative Standard</div>
                <div className="mb-8">
                   <h3 className="text-xl font-bold text-white mb-2">Departmental License</h3>
                   <p className="text-zinc-500 text-sm">A centralized system of record for academic units requiring operational oversight, fraud prevention, and audit-ready reporting.</p>
                </div>
                <div className="mb-8">
                   <span className="text-4xl font-bold text-white">{prices.department}</span>
                   <span className="text-zinc-500 text-sm ml-2">/ semester / faculty</span>
                </div>
                <div className="flex-1 space-y-4 mb-8 text-sm">
                   {[
                      'Full Department/Faculty coverage',
                      'Centralized Admin Dashboard',
                      'Advanced Fraud Heuristics',
                      'Compliance & Audit Reporting',
                      'Bulk Data Management',
                      'Priority Email Support'
                   ].map((feat, i) => (
                      <div key={i} className="flex items-start gap-3 text-white">
                         <CheckCircle2 size={16} className="text-primary mt-0.5 flex-shrink-0" />
                         {feat}
                      </div>
                   ))}
                </div>
                <Button className="w-full h-12" onClick={onGetStarted}>Initialize Departmental Coverage</Button>
             </div>

             {/* Institutional Infrastructure */}
             <div className="bg-zinc-900/50 border border-zinc-800 p-10 rounded-3xl flex flex-col">
                <div className="mb-8">
                   <h3 className="text-xl font-bold text-white mb-2">Institutional Infrastructure</h3>
                   <p className="text-zinc-500 text-sm">Full-scale deployment for universities requiring a unified attendance backbone, complete compliance readiness, and deep technical integration.</p>
                </div>
                <div className="mb-8">
                   <span className="text-2xl font-bold text-white tracking-tight italic">Custom Quote</span>
                </div>
                <div className="flex-1 space-y-4 mb-8 text-sm">
                   {[
                      'Total Institutional Visibility',
                      'SIS/LMS/SSO Deep Integration',
                      'Custom Data Retention Policies',
                      'Accreditation Readiness Suite',
                      'Dedicated Infrastructure Engineer',
                      '99.9% Uptime SLA Guarantee'
                   ].map((feat, i) => (
                      <div key={i} className="flex items-start gap-3 text-zinc-300">
                         <CheckCircle2 size={16} className="text-primary mt-0.5 flex-shrink-0" />
                         {feat}
                      </div>
                   ))}
                </div>
                <Button variant="outline" className="w-full h-12" onClick={onGetStarted}>Consult with Deployment Specialist</Button>
             </div>
          </div>

          <div className="mt-12 text-center">
             <p className="text-zinc-500 text-sm">
                Upgrading from Individual to Departmental coverage is seamless; all historical course data is preserved and migrated to the centralized administrative console.
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
              { q: "Can this integrate with our existing portal?", a: "Yes. Presently is API-first. We offer RESTful endpoints and webhooks to sync student rosters and push attendance grades directly to your Student Information System." },
              { q: "How secure is the location data?", a: "We treat location data as sensitive PII. It is encrypted in transit and at rest. We do not track students outside of active class sessions. Compliance with NDPR and GDPR is standard." },
              { q: "What happens if the internet cuts out?", a: "Our Offline-First architecture allows the app to cache encrypted attendance packets locally on the student's device and sync them automatically once connectivity is restored." },
              { q: "Does it work for large lecture halls?", a: "Absolutely. Our infrastructure is stress-tested to handle thousands of concurrent write requests per second, making it suitable for large general courses (e.g., GST/GNS)." }
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
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Modernize Your Institution Today</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto mb-10">
               Join the forward-thinking universities using Presently to ensure compliance, improve student outcomes, and secure their data.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
               <Button size="lg" className="h-14 px-10 text-lg rounded-full" onClick={onGetStarted}>
                  Request Infrastructure Audit
               </Button>
               <Button variant="secondary" size="lg" className="h-14 px-10 text-lg rounded-full" onClick={onLogin}>
                  Login to Console
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
                        The operating system for academic attendance. Built for scale, security, and institutional intelligence.
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
