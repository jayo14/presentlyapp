import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight } from 'lucide-react';

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
        <div className={`relative flex items-center justify-between px-10 py-5 rounded-[2.5rem] transition-all duration-500 ${
          isScrolled
            ? 'bg-black/60 backdrop-blur-[40px] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]'
            : 'bg-transparent border border-transparent'
        }`}>

          {/* Logo */}
          <div
            className="flex items-center gap-3 group cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="w-12 h-12 bg-[#D4AF37] rounded-[1.2rem] flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_25px_rgba(212,175,55,0.4)]">
               <span className="text-[#0A0A0A] font-black text-2xl leading-none">P</span>
            </div>
            <span className="text-white font-black text-2xl tracking-tighter hidden sm:block">Presently</span>
          </div>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center gap-12">
            {['Solutions', 'Features', 'Pricing', 'Institutional'].map((item) => (
              <button
                key={item}
                className="text-zinc-400 text-xs font-black uppercase tracking-[0.3em] hover:text-[#D4AF37] transition-colors"
              >
                {item}
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden sm:flex items-center gap-8">
            <button
              onClick={onLogin}
              className="text-white text-xs font-black uppercase tracking-[0.2em] hover:text-[#D4AF37] transition-colors"
            >
              Log In
            </button>
            <button
              onClick={onGetStarted}
              className="px-8 py-4 bg-[#D4AF37] text-[#0A0A0A] rounded-[1.2rem] font-black text-xs uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-[0_15px_30px_rgba(212,175,55,0.3)]"
            >
              Get Started
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden text-white p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={32} /> : <Menu size={32} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute top-full inset-x-6 mt-6 p-10 bg-zinc-950/95 backdrop-blur-[50px] border border-white/10 rounded-[3rem] shadow-2xl lg:hidden z-50 overflow-hidden"
          >
            <div className="flex flex-col gap-10 relative z-10">
              {['Solutions', 'Features', 'Pricing', 'Institutional'].map((item) => (
                <button
                  key={item}
                  className="text-white text-2xl font-black uppercase tracking-[0.2em] text-left hover:text-[#D4AF37] transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item}
                </button>
              ))}
              <div className="h-px bg-white/10" />
              <div className="flex flex-col gap-6">
                <button
                  onClick={onLogin}
                  className="text-[#D4AF37] text-xl font-black uppercase tracking-[0.2em] text-left"
                >
                  Log In
                </button>
                <button
                  onClick={onGetStarted}
                  className="w-full py-6 bg-[#D4AF37] text-[#0A0A0A] rounded-2xl font-black text-xl uppercase tracking-[0.1em] shadow-xl"
                >
                  Get Started
                </button>
              </div>
            </div>

            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2" />
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
