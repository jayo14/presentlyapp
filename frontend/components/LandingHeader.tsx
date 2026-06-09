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
  onGetStarted = () => { },
  onLogin = () => { }
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeAnchor, setActiveAnchor] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const { pathname, hash } = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Solutions', to: '/#solutions', anchorId: 'solutions', match: { pathname: '/', hash: '#solutions' } },
    { label: 'Pricing', to: '/#pricing', anchorId: 'pricing', match: { pathname: '/', hash: '#pricing' } },
    { label: 'Blog', to: '/blog', match: { pathname: '/blog' } },
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

  const glassHeaderStyle: React.CSSProperties = {
    top: 0,
    left: 0,
    right: 0,
    margin: isScrolled ? '1rem auto 0' : '0 auto',
    width: isScrolled ? 'calc(100% - 2rem)' : '100%',
    maxWidth: isScrolled ? '1440px' : '100%',
    borderRadius: isScrolled ? '1rem' : '0',
    background: isScrolled
      ? 'color-mix(in srgb, var(--surface-container-low) 74%, transparent)'
      : 'transparent',
    borderColor: isScrolled
      ? 'color-mix(in srgb, var(--outline-variant) 36%, transparent)'
      : 'transparent',
    boxShadow: isScrolled
      ? '0 10px 28px color-mix(in srgb, var(--inverse-surface) 12%, transparent), inset 0 1px 0 color-mix(in srgb, var(--surface-container-highest) 34%, transparent)'
      : 'none',
    backdropFilter: isScrolled ? 'blur(18px) saturate(120%)' : 'none',
    WebkitBackdropFilter: isScrolled ? 'blur(18px) saturate(120%)' : 'none',
  };

  const glassMenuStyle: React.CSSProperties = {
    background:
      'color-mix(in srgb, var(--surface) 86%, transparent)',
    borderColor:
      'color-mix(in srgb, var(--outline-variant) 34%, transparent)',
  };

  return (
    <nav
      className="fixed z-50 transition-all duration-300 border-b py-4"
      style={glassHeaderStyle}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center">
        <div className="cursor-pointer" onClick={() => navigate('/')}>
          <Logo className="h-7 w-auto sm:h-8" />
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4 lg:gap-8 text-sm font-medium text-textMuted">
          {navItems.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.label}
                to={item.to}
                className={`relative pb-1 transition-all duration-300 ease-out after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:rounded-full after:bg-primary/60 after:transition-all after:duration-300 after:ease-out hover:after:w-full whitespace-nowrap ${active ? 'text-text' : 'text-textMuted hover:text-text'
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
          <div className="h-4 w-px bg-outline/20 mx-1" />
          <Button variant="ghost" className="text-text hover:text-primary px-3 lg:px-4 text-sm" onClick={handleLogin}>Sign in</Button>
          <Button className="bg-primary text-on-primary-fixed hover:opacity-90 px-4 lg:px-6 font-medium text-sm transition-opacity" onClick={handleGetStarted}>Get started</Button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2.5 text-textMuted hover:text-primary transition-all rounded-xl border border-outline/10 bg-surfaceHigh/40 hover:bg-primary/5 hover:border-primary/30"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={20} className="animate-in fade-in zoom-in duration-300" /> : <Menu size={20} className="animate-in fade-in zoom-in duration-300" />}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-b overflow-hidden"
            style={glassMenuStyle}
          >
            <div className="px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-4 sm:gap-6 max-h-[calc(100vh-80px)] overflow-y-auto">
              {navItems.map((item) => {
                const active = isActive(item);
                return (
                  <Link
                    key={item.label}
                    to={item.to}
                    onClick={() => setIsMenuOpen(false)}
                    className={`rounded-xl px-4 py-3 text-base sm:text-lg font-medium transition-all duration-200 ${active
                      ? 'bg-primaryContainer/20 text-primary border border-primary/20'
                      : 'text-textMuted hover:bg-surfaceHigh hover:text-text'
                      }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <hr className="border-outline/20 my-2" />
              <div className="flex flex-col gap-3 sm:gap-4">
                <Button
                  variant="outline"
                  className="w-full h-12 sm:h-14 border-outline/20 text-text hover:bg-surfaceHigh text-base font-medium"
                  onClick={handleLogin}
                >
                  Sign in
                </Button>
                <Button
                  className="w-full h-12 sm:h-14 bg-primary text-on-primary-fixed font-medium text-base hover:opacity-90 transition-opacity"
                  onClick={handleGetStarted}
                >
                  Get started
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
