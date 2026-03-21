import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  const [activeAnchor, setActiveAnchor] = useState('');
  const navigate = useNavigate();
  const { pathname, hash } = useLocation();

  const navItems = [
    { label: 'Solutions', to: '/#solutions', anchorId: 'solutions', match: { pathname: '/', hash: '#solutions' } },
    { label: 'Resources', to: '/#resources', anchorId: 'resources', match: { pathname: '/', hash: '#resources' } },
    { label: 'Pricing', to: '/#pricing', anchorId: 'pricing', match: { pathname: '/', hash: '#pricing' } },
    { label: 'Documentation', to: '/documentation', match: { pathname: '/documentation' } },
    { label: 'Volunteers', to: '/volunteers', match: { pathname: '/volunteers' } },
  ];

  useEffect(() => {
    if (pathname !== '/') {
      setActiveAnchor('');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSections = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visibleSections.length > 0) {
          setActiveAnchor(visibleSections[0].target.id);
        }
      },
      {
        rootMargin: '-40% 0px -45% 0px',
        threshold: [0.2, 0.4, 0.6, 0.8],
      }
    );

    const sectionIds = navItems
      .filter((item) => item.anchorId)
      .map((item) => item.anchorId as string);

    sectionIds.forEach((id) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, [pathname]);

  const isActive = (item: (typeof navItems)[number]) => {
    if (item.anchorId && pathname === '/') {
      return activeAnchor === item.anchorId || hash === `#${item.anchorId}`;
    }
    if (item.match.hash) {
      return pathname === item.match.pathname && hash === item.match.hash;
    }
    return pathname === item.match.pathname;
  };

  const handleGetStarted = () => {
    setIsMenuOpen(false);
    onGetStarted();
  };

  const handleLogin = () => {
    setIsMenuOpen(false);
    onLogin();
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-cardackgroundlack/50 backdrop-blur-xl border-b border-white/5 py-6">
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <div className="cursor-pointer" onClick={() => navigate('/')}>
          <Logo className="h-8 w-auto" />
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-textMuted">
          {navItems.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.label}
                to={item.to}
                className={`relative pb-1 transition-all duration-300 ease-out after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:rounded-full after:bg-primary/60 after:transition-all after:duration-300 after:ease-out hover:after:w-full ${
                  active ? 'text-text' : 'text-muted-foreground hover:text-white'
                }`}
              >
                {item.label}
                {active && (
                  <motion.span
                    layoutId="landing-header-active-link"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-primary"
                    transition={{ type: 'spring', stiffness: 420, damping: 34, mass: 0.45 }}
                  />
                )}
              </Link>
            );
          })}
          <div className="h-4 w-px bg-surface/10 mx-2" />
          <Button variant="ghost" className="text-text hover:text-primary px-4" onClick={handleLogin}>Sign In</Button>
          <Button className="bg-primary text-on-primary-fixedlack hover:bg-primary-dark px-6 font-bold" onClick={handleGetStarted}>Get Started</Button>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2 text-textMuted hover:text-text"
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
            className="md:hidden bg-background border-b border-white/5 overflow-hidden"
          >
            <div className="px-6 py-8 flex flex-col gap-6">
              {navItems.map((item) => {
                const active = isActive(item);
                return (
                  <Link
                    key={item.label}
                    to={item.to}
                    onClick={() => setIsMenuOpen(false)}
                    className={`rounded-lg px-2 py-1 text-lg font-medium transition-all duration-300 ease-out ${
                      active
                        ? 'bg-white/10 text-white'
                        : 'text-muted-foreground hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <hr className="border-white/5" />
              <div className="flex flex-col gap-4">
                <Button variant="outline" className="w-full h-14 border-white/10 text-text" onClick={handleLogin}>Sign In</Button>
                <Button className="w-full h-14 bg-primary text-on-primary-fixedlack font-bold" onClick={handleGetStarted}>Get Started</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
