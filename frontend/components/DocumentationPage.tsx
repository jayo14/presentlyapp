import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { Play, FileText, HelpCircle, ArrowLeft, CheckCircle2, ShieldCheck, Book, Shield, Zap, Search, ChevronRight, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './Button';
import { Logo } from './Logo';
import { LandingHeader } from './LandingHeader';

const videos = [
  {
    title: "Getting Started with Presently",
    description: "Learn the basics of setting up your account and institutional profile.",
    duration: "3:45",
    thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60"
  },
  {
    title: "For Lecturers: Creating Sessions",
    description: "How to create location-verified sessions and manage student check-ins.",
    duration: "5:20",
    thumbnail: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=60"
  },
  {
    title: "For Students: Marking Attendance",
    description: "A quick guide on how students can verify their presence using the mobile app.",
    duration: "2:15",
    thumbnail: "https://images.unsplash.com/photo-1523240715639-99a2d0211281?w=800&auto=format&fit=crop&q=60"
  },
  {
    title: "Admin Dashboard & Analytics",
    description: "Deep dive into institutional reports, compliance logs, and data exports.",
    duration: "7:10",
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=60"
  }
];

export const DocumentationPage: React.FC = () => {
  const navigate = useNavigate();
  const gridRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gridRef.current) {
      gsap.fromTo(
        gridRef.current.children,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.1,
          duration: 0.8,
          ease: "power3.out"
        }
      );
    }

    if (headerRef.current) {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 1, ease: "power2.out" }
      );
    }
  }, []);

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-primary selection:text-black">
      <LandingHeader />

      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <div ref={headerRef} className="mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            Documentation & <span className="text-primary">Resources</span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl leading-relaxed">
            Everything you need to deploy and master Presently. From quick-start guides to in-depth technical references.
          </p>
        </div>

        {/* Search / Filter bar placeholder */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 mb-12 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-4 text-zinc-400">
            <div className="bg-zinc-800 p-2 rounded-lg"><HelpCircle size={20} /></div>
            <span>Can't find what you're looking for? Check our <span className="text-primary cursor-pointer hover:underline">FAQ</span></span>
          </div>
          <div className="flex gap-3">
             <Button variant="outline" className="border-zinc-800 text-zinc-300">Read Knowledge Base</Button>
             <Button className="bg-primary text-black">Contact Support</Button>
          </div>
        </div>

        {/* Video Grid */}
        <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
          <Play size={24} className="text-primary" />
          Training & Onboarding
        </h2>

        <div
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {videos.map((video, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.02 }}
              className="group bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300"
            >
              <div className="relative aspect-video">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                   <div className="w-12 h-12 bg-primary text-black rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity translate-y-4 group-hover:translate-y-0 duration-300">
                      <Play fill="currentColor" size={20} />
                   </div>
                </div>
                <div className="absolute bottom-3 right-3 bg-black/80 px-2 py-1 rounded text-xs font-mono">
                  {video.duration}
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">{video.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{video.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Detailed Guides Sections */}
        <div className="mt-32 space-y-32">
          {/* User Guides */}
          <section>
            <div className="flex items-center gap-4 mb-12">
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                <Book size={24} />
              </div>
              <h2 className="text-3xl font-bold">Comprehensive User Guides</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-10 bg-zinc-900/30 border border-white/5 rounded-[2rem] hover:border-primary/20 transition-all group">
                <h3 className="text-xl font-bold mb-4 flex items-center justify-between">
                  Lecturer Masterclass
                  <ChevronRight size={20} className="text-zinc-600 group-hover:text-primary transition-colors" />
                </h3>
                <ul className="space-y-4 text-zinc-400">
                  <li className="flex gap-3 items-start"><CheckCircle2 size={16} className="text-primary mt-1" /> Initializing geofenced classrooms</li>
                  <li className="flex gap-3 items-start"><CheckCircle2 size={16} className="text-primary mt-1" /> Managing manual exceptions</li>
                  <li className="flex gap-3 items-start"><CheckCircle2 size={16} className="text-primary mt-1" /> Exporting accreditation-ready reports</li>
                  <li className="flex gap-3 items-start"><CheckCircle2 size={16} className="text-primary mt-1" /> Analyzing student engagement trends</li>
                </ul>
              </div>
              <div className="p-10 bg-zinc-900/30 border border-white/5 rounded-[2rem] hover:border-primary/20 transition-all group">
                <h3 className="text-xl font-bold mb-4 flex items-center justify-between">
                  Student Success Guide
                  <ChevronRight size={20} className="text-zinc-600 group-hover:text-primary transition-colors" />
                </h3>
                <ul className="space-y-4 text-zinc-400">
                  <li className="flex gap-3 items-start"><CheckCircle2 size={16} className="text-primary mt-1" /> Resolving GPS accuracy issues</li>
                  <li className="flex gap-3 items-start"><CheckCircle2 size={16} className="text-primary mt-1" /> Viewing course eligibility status</li>
                  <li className="flex gap-3 items-start"><CheckCircle2 size={16} className="text-primary mt-1" /> Handling device registration</li>
                  <li className="flex gap-3 items-start"><CheckCircle2 size={16} className="text-primary mt-1" /> Notification settings for classes</li>
                </ul>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="bg-zinc-950 -mx-6 px-6 py-32 border-y border-white/5">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16 space-y-4">
                <h2 className="text-4xl font-bold">Frequently Asked Questions</h2>
                <p className="text-zinc-400">Common questions from institutions and users.</p>
              </div>
              <div className="space-y-6">
                {[
                  { q: "How accurate is the GPS verification?", a: "Presently uses multi-source geolocation (GPS, Cell, WiFi) to achieve sub-100m accuracy even in dense campus environments." },
                  { q: "What happens if a student's battery dies?", a: "Lecturers have a 10-minute window to manually verify a student who is physically present but unable to check in digitally." },
                  { q: "Is student location tracked 24/7?", a: "Absolutely not. Location services are only activated for the duration of a check-in attempt (typically < 30 seconds) and only while the student is within the scheduled classroom's geofence." },
                  { q: "How does it handle proxy check-ins?", a: "Our system uses device fingerprinting and concurrent session heartbeats. If a student tries to sign in for a friend, the system detects duplicate hardware IDs and blocks both users." }
                ].map((item, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-2xl hover:bg-white/[0.07] transition-all cursor-pointer">
                    <h4 className="font-bold text-lg mb-3 flex items-center gap-3">
                      <HelpCircle size={18} className="text-primary" /> {item.q}
                    </h4>
                    <p className="text-zinc-400 leading-relaxed">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Troubleshooting Section */}
          <section>
             <div className="flex items-center gap-4 mb-12">
                <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center text-red-500">
                  <Shield size={24} />
                </div>
                <h2 className="text-3xl font-bold">Troubleshooting Common Issues</h2>
             </div>
             <div className="grid md:grid-cols-3 gap-8">
                <div className="p-8 bg-zinc-900/50 border border-white/5 rounded-3xl">
                   <Zap size={32} className="text-primary mb-6" />
                   <h4 className="font-bold mb-4">"Location Not Found"</h4>
                   <p className="text-sm text-zinc-400">Ensure high-accuracy mode is enabled in your phone settings and you are not using a VPN or location-spoofing app.</p>
                </div>
                <div className="p-8 bg-zinc-900/50 border border-white/5 rounded-3xl">
                   <Search size={32} className="text-primary mb-6" />
                   <h4 className="font-bold mb-4">Session Not Appearing</h4>
                   <p className="text-sm text-zinc-400">Sessions only appear for students officially enrolled in the course. Contact your department if a course is missing from your profile.</p>
                </div>
                <div className="p-8 bg-zinc-900/50 border border-white/5 rounded-3xl">
                   <MessageCircle size={32} className="text-primary mb-6" />
                   <h4 className="font-bold mb-4">Support Escalation</h4>
                   <p className="text-sm text-zinc-400">If issues persist, generate a "Debug Token" in your profile settings and send it to support@presently.koyeb.app.</p>
                </div>
             </div>
          </section>
        </div>

        {/* Resources section */}
        <div className="mt-48 grid md:grid-cols-3 gap-8">
           {[
             { title: "Technical Whitepaper", icon: FileText, desc: "Deep dive into our cryptographic verification and geofencing engine." },
             { title: "Implementation Guide", icon: CheckCircle2, desc: "Step-by-step instructions for institutional SSO and SIS integration." },
             { title: "Privacy & Compliance", icon: ShieldCheck, desc: "Detailed breakdown of our NDPR compliance and data encryption standards." }
           ].map((item, idx) => (
             <div key={idx} className="p-8 bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 rounded-3xl hover:border-zinc-700 transition-colors cursor-pointer group">
                <item.icon size={40} className="text-primary mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-zinc-500 mb-6">{item.desc}</p>
                <span className="text-primary font-medium flex items-center gap-2 group-hover:gap-3 transition-all">
                  Download PDF <ArrowLeft size={16} className="rotate-180" />
                </span>
             </div>
           ))}
        </div>
      </main>

      <footer className="py-12 border-t border-zinc-900 text-center text-zinc-600 text-sm">
        <p>&copy; {new Date().getFullYear()} Presently Inc. Documentation Portal.</p>
      </footer>
    </div>
  );
};
