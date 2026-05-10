import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Logo } from './Logo';
import { Button } from './Button';
import { cn } from '../src/components/ui/utils';

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
      className={cn(
        "fixed top-0 inset-x-0 z-[100] transition-all duration-500",
        isScrolled ? "py-4" : "py-8"
      )}
    >
      <div className="container mx-auto px-6">
        <div className={cn(
          "flex items-center justify-between px-8 py-4 transition-all duration-500",
          isScrolled
            ? "bg-white/80 dark:bg-black/80 backdrop-blur-xl border border-outline rounded-full shadow-lg"
            : "bg-transparent border border-transparent"
        )}>

          {/* Logo */}
          <Logo showText={true} variant={!isScrolled ? 'dark' : undefined} />

          {/* Navigation */}
          <nav className="hidden lg:flex items-center gap-10">
            {['Product', 'Company', 'Resources', 'Legal'].map((item) => (
              <button
                key={item}
                className={cn(
                  "text-xs font-bold uppercase tracking-[0.2em] transition-colors",
                  !isScrolled ? "text-slate-400 hover:text-white" : "text-on-surface-variant hover:text-sungold"
                )}
              >
                {item}
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden sm:flex items-center gap-6">
            <button
              onClick={onLogin}
              className={cn(
                "text-xs font-bold uppercase tracking-[0.2em] transition-colors",
                !isScrolled ? "text-slate-400 hover:text-white" : "text-on-surface-variant hover:text-sungold"
              )}
            >
              Log In
            </button>
            <Button
              size="sm"
              onClick={onGetStarted}
              className="h-10 px-6"
            >
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className={cn("lg:hidden p-2", !isScrolled ? "text-white" : "text-on-surface")}
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
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full inset-x-6 mt-4 p-8 bg-white dark:bg-[#141414] border border-outline rounded-3xl shadow-xl lg:hidden z-50"
          >
            <div className="flex flex-col gap-8">
              {['Product', 'Company', 'Resources', 'Legal'].map((item) => (
                <button
                  key={item}
                  className="text-on-surface text-lg font-bold uppercase tracking-widest text-left"
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
