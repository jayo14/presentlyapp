import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Globe, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './Button';
import { Logo } from './Logo';

interface LandingHeaderProps {
  onGetStarted?: () => void;
  onLogin?: () => void;
}

export const LandingHeader: React.FC<LandingHeaderProps> = ({ 
  onGetStarted = () => {}, 
  onLogin = () => {} 
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleGetStarted = () => {
    setIsMenuOpen(false);
    onGetStarted();
  };

  const handleLogin = () => {
    setIsMenuOpen(false);
    onLogin();
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-xl border-b border-white/5 py-6">
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <div className="cursor-pointer" onClick={() => navigate('/')}>
          <Logo className="h-8 w-auto" />
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-10 text-sm font-medium text-zinc-400">
          <a href="/#problem" className="hover:text-white transition-colors">The Problem</a>
          <a href="/#how-it-works" className="hover:text-white transition-colors">How it Works</a>
          <a href="/documentation" className="hover:text-white transition-colors">Documentation</a>
          <a href="/volunteers" className="hover:text-white transition-colors">Volunteers</a>
          <div className="h-4 w-px bg-white/10 mx-2" />
          <Button variant="ghost" className="text-white hover:text-primary px-4" onClick={() => navigate('/login')}>Sign In</Button>
          <Button className="bg-primary text-black hover:bg-primary-dark px-6 font-bold" onClick={() => navigate('/register')}>Get Started</Button>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2 text-zinc-400 hover:text-white"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-zinc-950 border-b border-white/5 overflow-hidden"
          >
            <div className="px-6 py-8 flex flex-col gap-6">
              <a href="/#problem" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-zinc-400 hover:text-white transition-colors">The Problem</a>
              <a href="/#how-it-works" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-zinc-400 hover:text-white transition-colors">How it Works</a>
              <a href="/documentation" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-zinc-400 hover:text-white transition-colors">Documentation</a>
              <a href="/volunteers" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-zinc-400 hover:text-white transition-colors">Volunteers</a>
              <hr className="border-white/5" />
              <div className="flex flex-col gap-4">
                <Button variant="outline" className="w-full h-14 border-white/10 text-white" onClick={() => navigate('/login')}>Sign In</Button>
                <Button className="w-full h-14 bg-primary text-black font-bold" onClick={() => navigate('/register')}>Get Started</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
