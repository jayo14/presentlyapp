import React from 'react';
import { Twitter, Instagram, Github, Linkedin, Mail } from 'lucide-react';

export const LandingFooter: React.FC = () => {
  return (
    <footer className="bg-[#0A0A0A] border-t border-white/5 py-20">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">

          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-8 h-8 bg-[#D4AF37] rounded-lg flex items-center justify-center">
                 <span className="text-[#0A0A0A] font-black text-lg">P</span>
              </div>
              <span className="text-white font-black text-xl tracking-tighter">Presently</span>
            </div>
            <p className="text-zinc-500 text-sm font-medium leading-relaxed mb-8">
              Restoring integrity to the Nigerian educational system through high-performance verification technology.
            </p>
            <div className="flex items-center gap-4">
              {[Twitter, Instagram, Github, Linkedin].map((Icon, i) => (
                <button key={i} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-zinc-400 hover:bg-[#D4AF37] hover:text-[#0A0A0A] transition-all">
                  <Icon size={18} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-xs mb-8">Product</h4>
            <ul className="space-y-4">
              {['Solutions', 'Features', 'Pricing', 'Institutional', 'Mobile App'].map(item => (
                <li key={item}><button className="text-zinc-500 text-sm font-bold hover:text-[#D4AF37] transition-colors">{item}</button></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-xs mb-8">Company</h4>
            <ul className="space-y-4">
              {['About Us', 'Contact', 'Blog', 'Careers', 'Privacy Policy'].map(item => (
                <li key={item}><button className="text-zinc-500 text-sm font-bold hover:text-[#D4AF37] transition-colors">{item}</button></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-xs mb-8">Stay Updated</h4>
            <p className="text-zinc-500 text-sm font-medium mb-6">Join our newsletter for the latest updates on campus tech.</p>
            <div className="relative">
              <input
                type="email"
                placeholder="email@university.edu"
                className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-[#D4AF37] transition-colors"
              />
              <button className="absolute right-2 top-2 bottom-2 px-4 bg-[#D4AF37] text-[#0A0A0A] rounded-xl font-black text-[10px] uppercase tracking-widest">
                Join
              </button>
            </div>
          </div>

        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-10 border-t border-white/5 gap-8">
          <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest">
            © {new Date().getFullYear()} Presently. Built with passion for Nigerian Higher Education.
          </p>
          <div className="flex items-center gap-8">
            <button className="text-zinc-600 text-xs font-bold uppercase tracking-widest hover:text-white">Terms of Service</button>
            <button className="text-zinc-600 text-xs font-bold uppercase tracking-widest hover:text-white">Cookie Policy</button>
          </div>
        </div>
      </div>
    </footer>
  );
};
