import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight } from 'lucide-react';
import { Logo } from './Logo';

interface LandingHeaderProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export const LandingHeader: React.FC<LandingHeaderProps> = ({ onGetStarted, onLogin }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-[100] transition-all duration-500 ${
        isScrolled ? 'py-4' : 'py-8'
      }`}
    >
      <div className="container mx-auto px-6">
        <div className={`relative flex items-center justify-between px-8 py-4 rounded-[2.5rem] transition-all duration-500 ${
          isScrolled
            ? 'bg-zinc-950/80 backdrop-blur-3xl border border-white/10 shadow-2xl'
            : 'bg-transparent border border-transparent'
        }`}>

          {/* Logo */}
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 bg-[#D4AF37] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(212,175,55,0.3)]">
               <span className="text-[#0A0A0A] font-black text-xl">P</span>
            </div>
            <span className="text-white font-black text-2xl tracking-tighter hidden sm:block">Presently</span>
          </div>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center gap-10">
            {['Solutions', 'Features', 'Pricing', 'Institutional'].map((item) => (
              <button
                key={item}
                className="text-zinc-400 text-sm font-bold uppercase tracking-widest hover:text-[#D4AF37] transition-colors"
              >
                {item}
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden sm:flex items-center gap-6">
            <button
              onClick={onLogin}
              className="text-white text-sm font-black uppercase tracking-widest hover:text-[#D4AF37] transition-colors"
            >
              Log In
            </button>
            <button
              onClick={onGetStarted}
              className="px-6 py-3 bg-[#D4AF37] text-[#0A0A0A] rounded-xl font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_10px_20px_rgba(212,175,55,0.2)]"
            >
              Get Started
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full inset-x-6 mt-4 p-8 bg-zinc-950/95 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-2xl lg:hidden z-50"
          >
            <div className="flex flex-col gap-8">
              {['Solutions', 'Features', 'Pricing', 'Institutional'].map((item) => (
                <button
                  key={item}
                  className="text-white text-xl font-black uppercase tracking-widest text-left"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item}
                </button>
              ))}
              <div className="h-px bg-white/5" />
              <button
                onClick={onLogin}
                className="text-[#D4AF37] text-xl font-black uppercase tracking-widest text-left"
              >
                Log In
              </button>
              <button
                onClick={onGetStarted}
                className="w-full py-5 bg-[#D4AF37] text-[#0A0A0A] rounded-2xl font-black text-xl uppercase tracking-widest"
              >
                Get Started
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
