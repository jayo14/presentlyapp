import React from 'react';
import { Twitter, Instagram, Github, Linkedin, Mail } from 'lucide-react';
import { Logo } from './Logo';

export const LandingFooter: React.FC = () => {
  return (
    <footer className="bg-background border-t border-outline py-32 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-20 mb-32">

          <div className="lg:col-span-1 space-y-8">
            <Logo />
            <p className="text-textMuted text-sm font-medium leading-relaxed">
              Restoring integrity to the Nigerian educational system through high-performance verification technology.
            </p>
            <div className="flex items-center gap-4">
              {[Twitter, Instagram, Github, Linkedin].map((Icon, i) => (
                <button key={i} className="w-10 h-10 rounded-xl bg-surfaceContainer flex items-center justify-center text-textMuted hover:text-primary transition-all">
                  <Icon size={18} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-text font-black uppercase tracking-[0.3em] text-[10px] mb-8">Product</h4>
            <ul className="space-y-4">
              {['Solutions', 'Features', 'Pricing', 'Institutional'].map(item => (
                <li key={item}><button className="text-textMuted text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors">{item}</button></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-text font-black uppercase tracking-[0.3em] text-[10px] mb-8">Company</h4>
            <ul className="space-y-4">
              {['About Us', 'Contact', 'Blog', 'Careers'].map(item => (
                <li key={item}><button className="text-textMuted text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors">{item}</button></li>
              ))}
            </ul>
          </div>

          <div className="space-y-8">
            <div>
              <h4 className="text-text font-black uppercase tracking-[0.3em] text-[10px] mb-6">Stay Updated</h4>
              <p className="text-textMuted text-xs font-medium mb-6 leading-relaxed">Join our newsletter for the latest on campus technology.</p>
            </div>
            <div className="relative group">
              <input
                type="email"
                placeholder="university.edu"
                className="w-full h-12 bg-surfaceContainer border border-outline rounded-xl px-4 text-sm text-text placeholder:text-textMuted/50 focus:outline-none focus:border-primary transition-all"
              />
              <button className="absolute right-1 top-1 bottom-1 px-4 bg-primary text-primary-foreground rounded-lg font-black text-[9px] uppercase tracking-widest">
                Join
              </button>
            </div>
          </div>

        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-12 border-t border-outline gap-6">
          <p className="text-textMuted text-[10px] font-black uppercase tracking-widest">
            © {new Date().getFullYear()} Presently. Reclaiming Integrity.
          </p>
          <div className="flex items-center gap-8">
            <button className="text-textMuted text-[10px] font-black uppercase tracking-widest hover:text-text">Terms</button>
            <button className="text-textMuted text-[10px] font-black uppercase tracking-widest hover:text-text">Privacy</button>
          </div>
        </div>
      </div>
    </footer>
  );
};
