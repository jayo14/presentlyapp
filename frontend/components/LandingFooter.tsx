import React from 'react';
import { Twitter, Instagram, Github, Linkedin, Mail } from 'lucide-react';

export const LandingFooter: React.FC = () => {
  return (
    <footer className="bg-[#0A0A0A] border-t border-white/5 py-32 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#D4AF37]/3 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-20 mb-32">

          <div className="lg:col-span-1 space-y-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#D4AF37] rounded-xl flex items-center justify-center shadow-lg">
                 <span className="text-[#0A0A0A] font-black text-xl">P</span>
              </div>
              <span className="text-white font-black text-2xl tracking-tighter">Presently</span>
            </div>
            <p className="text-zinc-500 text-base font-medium leading-relaxed">
              Restoring integrity to the Nigerian educational system through high-performance verification technology. Built for students, trusted by institutions.
            </p>
            <div className="flex items-center gap-5">
              {[Twitter, Instagram, Github, Linkedin].map((Icon, i) => (
                <button key={i} className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-400 hover:bg-[#D4AF37] hover:text-[#0A0A0A] transition-all hover:scale-110">
                  <Icon size={20} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-black uppercase tracking-[0.3em] text-[10px] mb-10">Product</h4>
            <ul className="space-y-6">
              {['Solutions', 'Features', 'Pricing', 'Institutional', 'Mobile App'].map(item => (
                <li key={item}><button className="text-zinc-500 text-sm font-bold uppercase tracking-widest hover:text-[#D4AF37] transition-colors">{item}</button></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-black uppercase tracking-[0.3em] text-[10px] mb-10">Company</h4>
            <ul className="space-y-6">
              {['About Us', 'Contact', 'Blog', 'Careers', 'Privacy Policy'].map(item => (
                <li key={item}><button className="text-zinc-500 text-sm font-bold uppercase tracking-widest hover:text-[#D4AF37] transition-colors">{item}</button></li>
              ))}
            </ul>
          </div>

          <div className="space-y-10">
            <div>
              <h4 className="text-white font-black uppercase tracking-[0.3em] text-[10px] mb-6">Stay Updated</h4>
              <p className="text-zinc-500 text-sm font-medium mb-8 leading-relaxed">Join our newsletter for the latest updates on campus technology.</p>
            </div>
            <div className="relative group">
              <input
                type="email"
                placeholder="email@university.edu"
                className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl px-6 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-[#D4AF37] transition-all group-hover:bg-white/10"
              />
              <button className="absolute right-2 top-2 bottom-2 px-6 bg-[#D4AF37] text-[#0A0A0A] rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white transition-colors">
                Join
              </button>
            </div>
          </div>

        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-12 border-t border-white/5 gap-10">
          <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.2em]">
            © {new Date().getFullYear()} Presently. Reclaiming Integrity since 2024.
          </p>
          <div className="flex items-center gap-10">
            <button className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.2em] hover:text-white transition-colors">Terms of Service</button>
            <button className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.2em] hover:text-white transition-colors">Cookie Policy</button>
          </div>
        </div>
      </div>
    </footer>
  );
};
