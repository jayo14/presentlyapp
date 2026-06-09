import React from 'react';
import { Languages, Share2, Twitter, Linkedin, Github } from 'lucide-react';
import { Logo } from './Logo';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useTheme } from './ThemeProvider';
import { Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';

export const LandingFooter: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <footer
      style={{
        background: 'var(--surface-bright)',
        borderTop: '1px solid var(--outline-variant, rgba(210,197,171,0.18))',
        padding: '5rem 2rem 3rem 2rem',
      }}
    >
      <div
        style={{
          maxWidth: 1440,
          margin: '0 auto',
        }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8"
      >
        <div className="lg:col-span-2">
          <Logo className="mb-4" />

          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--on-surface-variant)',
              maxWidth: '300px',
              lineHeight: 1.6,
              marginBottom: '2rem',
            }}
          >
            GPS-verified real-time attendance system optimizing institutional flow and precision.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Follow us on Twitter"
              title="Follow us on Twitter"
              className="p-2 rounded-full border border-outline/20 text-[var(--on-surface-variant)] hover:text-primary hover:bg-surfaceHigh transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Twitter size={18} />
            </a>
            <a 
              href="https://linkedin.com" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Connect with us on LinkedIn"
              title="Connect with us on LinkedIn"
              className="p-2 rounded-full border border-outline/20 text-[var(--on-surface-variant)] hover:text-primary hover:bg-surfaceHigh transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Linkedin size={18} />
            </a>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="View our code on GitHub"
              title="View our code on GitHub"
              className="p-2 rounded-full border border-outline/20 text-[var(--on-surface-variant)] hover:text-primary hover:bg-surfaceHigh transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Github size={18} />
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-headline font-medium mb-4" style={{ color: 'var(--on-surface)' }}>Product</h4>
          <ul className="space-y-3">
            <li><Link to="#solutions" className="text-sm text-[var(--on-surface-variant)] hover:text-primary transition-colors">Solutions</Link></li>
            <li><Link to="#pricing" className="text-sm text-[var(--on-surface-variant)] hover:text-primary transition-colors">Pricing</Link></li>
            <li><Link to="/#mobileapp" className="text-sm text-[var(--on-surface-variant)] hover:text-primary transition-colors">Download App</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-headline font-medium mb-4" style={{ color: 'var(--on-surface)' }}>Resources</h4>
          <ul className="space-y-3">
            <li><Link to="/documentation" className="text-sm text-[var(--on-surface-variant)] hover:text-primary transition-colors">Documentation</Link></li>
            <li><Link to="/volunteers" className="text-sm text-[var(--on-surface-variant)] hover:text-primary transition-colors">Volunteers</Link></li>
            <li><Link to="/blog" className="text-sm text-[var(--on-surface-variant)] hover:text-primary transition-colors">Blog</Link></li>
            <li><Link to="/support" className="text-sm text-[var(--on-surface-variant)] hover:text-primary transition-colors">Help Center</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-headline font-medium mb-4" style={{ color: 'var(--on-surface)' }}>Company</h4>
          <ul className="space-y-3">
            <li><Link to="/about" className="text-sm text-[var(--on-surface-variant)] hover:text-primary transition-colors">About Us</Link></li>
            <li><Link to="/contact" className="text-sm text-[var(--on-surface-variant)] hover:text-primary transition-colors">Contact</Link></li>
            <li><Link to="/privacy" className="text-sm text-[var(--on-surface-variant)] hover:text-primary transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms" className="text-sm text-[var(--on-surface-variant)] hover:text-primary transition-colors">Terms of Service</Link></li>
          </ul>
        </div>
      </div>

      <div
        style={{
          maxWidth: 1440,
          margin: '3rem auto 0 auto',
          paddingTop: '2rem',
          borderTop: '1px solid var(--outline-variant, rgba(210,197,171,0.18))',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '2rem',
        }}
      >
        <p style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)' }}>
          © {new Date().getFullYear()} Presently. All rights reserved.
        </p>

        <TooltipProvider>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-surfaceHigh"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  style={{ color: 'var(--on-surface-variant)' }}
                >
                  {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Toggle Theme</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-surfaceHigh"
                  style={{ color: 'var(--on-surface-variant)' }}
                >
                  <Languages size={20} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Language</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-surfaceHigh"
                  style={{ color: 'var(--on-surface-variant)' }}
                >
                  <Share2 size={20} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Share</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>
    </footer>
  );
};
