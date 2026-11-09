import React from 'react';
import { Logo } from "../Logo";
import { ThemeToggle } from '../ThemeToggle';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-[#12110D] pt-20 pb-12 px-6 md:px-12 text-neutral-600 dark:text-neutral-400 border-t border-neutral-200 dark:border-neutral-800 text-xs">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-5 gap-12 mb-16">
        
        {/* Brand Column */}
        <div className="md:col-span-2 space-y-4">
          <Logo className="scale-105 origin-left mb-4" />
          <p className="text-xs sm:text-sm leading-relaxed text-neutral-600 dark:text-neutral-400 max-w-sm">
            Location-aware university lecture attendance management built for the physical, infrastructural, and pedagogical realities of Nigerian tertiary institutions.
          </p>
          <div className="pt-2 text-[11px] text-neutral-500">
            Official website: <a href="https://www.getpresently.com.ng" className="text-sungold hover:underline">www.getpresently.com.ng</a>
          </div>
        </div>

        {/* Product Column */}
        <div>
          <h4 className="font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider text-[11px] mb-4">
            Platform
          </h4>
          <ul className="space-y-2.5">
            <li><a href="#product" className="hover:text-sungold transition-colors">Session Launcher</a></li>
            <li><a href="#product" className="hover:text-sungold transition-colors">Student Mobile Pass</a></li>
            <li><a href="#how-it-works" className="hover:text-sungold transition-colors">How It Works</a></li>
            <li><a href="#pricing" className="hover:text-sungold transition-colors">Pricing Plans</a></li>
            <li><a href="#faq" className="hover:text-sungold transition-colors">Campus FAQ</a></li>
          </ul>
        </div>

        {/* Academic Column */}
        <div>
          <h4 className="font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider text-[11px] mb-4">
            Institutions
          </h4>
          <ul className="space-y-2.5">
            <li><a href="#lasustech-story" className="hover:text-sungold transition-colors">LASUSTECH Origins</a></li>
            <li><a href="#institutions" className="hover:text-sungold transition-colors">Department Pilots</a></li>
            <li><a href="#institutions" className="hover:text-sungold transition-colors">Exam 75% Clearance</a></li>
            <li><a href="#demo-cta" className="hover:text-sungold transition-colors">Request Campus Demo</a></li>
            <li><a href="/login" className="hover:text-sungold transition-colors">Lecturer Sign In</a></li>
          </ul>
        </div>

        {/* Governance & Contact */}
        <div>
          <h4 className="font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider text-[11px] mb-4">
            Privacy & Trust
          </h4>
          <ul className="space-y-2.5">
            <li><a href="/privacy" className="hover:text-sungold transition-colors">Student Privacy Notice</a></li>
            <li><a href="/terms" className="hover:text-sungold transition-colors">Terms of Service</a></li>
            <li><a href="#faq" className="hover:text-sungold transition-colors">Technical Limitations</a></li>
            <li><a href="mailto:support@getpresently.com.ng" className="hover:text-sungold transition-colors">support@getpresently.com.ng</a></li>
          </ul>
        </div>

      </div>

      {/* Honest Institutional Boundary Statement */}
      <div className="max-w-[1400px] mx-auto py-6 border-t border-neutral-200 dark:border-neutral-800 text-[11px] leading-relaxed text-neutral-500">
        <p>
          <strong>Institutional Context:</strong> Presently originated and conducted practical classroom field trials within the Lagos State University of Science and Technology (LASUSTECH) academic community. Field testing demonstrates product exploration under real classroom conditions and does not constitute a formal institutional endorsement, exclusive partnership, or university-wide procurement contract.
        </p>
      </div>

      {/* Copyright & Theme Toggle */}
      <div className="max-w-[1400px] mx-auto pt-6 border-t border-neutral-100 dark:border-neutral-800/60 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-neutral-400">
        <p>© {new Date().getFullYear()} Presently. Purpose-built for Nigerian higher education.</p>
        <ThemeToggle />
      </div>
    </footer>
  );
};
