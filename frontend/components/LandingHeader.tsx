import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight } from 'lucide-react';
import { Logo } from './Logo';
import { Button } from './Button';

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
        <div className={`relative flex items-center justify-between px-8 py-4 rounded-full transition-all duration-500 ${
          isScrolled
            ? 'bg-surface/80 backdrop-blur-2xl border border-outline shadow-dock'
            : 'bg-transparent border border-transparent'
        }`}>

          {/* Logo */}
          <Logo className="scale-90" />

          {/* Navigation */}
          <nav className="hidden lg:flex items-center gap-10">
            {['Solutions', 'Features', 'Pricing', 'About'].map((item) => (
              <button
                key={item}
                className="text-textMuted text-xs font-black uppercase tracking-[0.2em] hover:text-primary transition-colors"
              >
                {item}
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden sm:flex items-center gap-6">
            <button
              onClick={onLogin}
              className="text-text text-xs font-black uppercase tracking-[0.2em] hover:text-primary transition-colors"
            >
              Log In
            </button>
            <Button
              size="sm"
              onClick={onGetStarted}
              className="h-12 px-6"
            >
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden text-text p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
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
            className="absolute top-full inset-x-6 mt-4 p-8 bg-surface/95 backdrop-blur-2xl border border-outline rounded-[2rem] shadow-premium lg:hidden z-50 overflow-hidden"
          >
            <div className="flex flex-col gap-8 relative z-10">
              {['Solutions', 'Features', 'Pricing', 'About'].map((item) => (
                <button
                  key={item}
                  className="text-text text-xl font-black uppercase tracking-[0.2em] text-left hover:text-primary transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item}
                </button>
              ))}
              <div className="h-px bg-outline" />
              <div className="flex flex-col gap-4">
                <Button variant="secondary" onClick={onLogin} fullWidth>Log In</Button>
                <Button onClick={onGetStarted} fullWidth>Get Started</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
