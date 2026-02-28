import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { Play, FileText, HelpCircle, ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './Button';
import { Logo } from './Logo';

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
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/80 backdrop-blur-xl h-20 flex items-center px-6">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-zinc-900 rounded-full transition-colors text-zinc-400 hover:text-white"
            >
              <ArrowLeft size={24} />
            </button>
            <Logo />
          </div>
          <div className="hidden md:flex items-center gap-6">
            <Button variant="ghost" className="text-zinc-400 hover:text-white">API Docs</Button>
            <Button variant="ghost" className="text-zinc-400 hover:text-white">Guides</Button>
            <Button onClick={() => navigate('/login')}>Sign In</Button>
          </div>
        </div>
      </nav>

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
          How-to-Use Videos
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

        {/* Resources section */}
        <div className="mt-24 grid md:grid-cols-3 gap-8">
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
