import React from 'react';
import { ChevronRight, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// import { LandingHeader } from '../LandingHeader';
import { Navbar } from "../"
// import { Logo } from '../Logo';
import { SEO } from '../SEO';

const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-text flex flex-col">
      {/* SEO: Legal page metadata for privacy route. */}
      <SEO
        title="Privacy Policy"
        description="Understand how Presently handles personal data, location verification, and security for university attendance workflows."
        canonicalPath="/privacy"
      />
      {/* Header */}
      <Navbar onGetStarted={() => navigate('/register')} onLogin={() => navigate('/login')} />

      {/* Main Content */}
      <div className="flex-1 py-32 sm:py-36">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1 text-sm text-textMuted mb-8">
            <button
              onClick={() => navigate('/')}
              className="hover:text-primary transition-colors font-medium"
            >
              Home
            </button>
            <ChevronRight size={14} className="text-outline" />
            <span className="text-text font-medium">Privacy Policy</span>
          </nav>

          <div className="flex flex-col gap-10">
            {/* Header */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-primaryContainer/20 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div className="h-12 w-1 bg-primary rounded-full"></div>
              </div>
              <h1 className="font-headline text-4xl sm:text-5xl font-bold text-text leading-tight">
                Privacy Policy
              </h1>
              <p className="text-textMuted text-base">Last Updated: May 2024</p>
            </div>

            {/* Content Sections */}
            <div className="flex flex-col gap-8">
              <div className="glass-panel rounded-2xl p-6 sm:p-8 hover-lift">
                <h2 className="font-headline text-2xl font-bold mb-4 text-primary">
                  1. Information We Collect
                </h2>
                <p className="text-textMuted leading-relaxed">
                  We collect information you provide directly to us, such as your name, email address, matriculation number, and institutional affiliation.
                </p>
              </div>

              <div className="glass-panel rounded-2xl p-6 sm:p-8 hover-lift">
                <h2 className="font-headline text-2xl font-bold mb-4 text-primary">
                  2. Location Data
                </h2>
                <p className="text-textMuted leading-relaxed">
                  To verify attendance, we collect precise GPS location data from your device at the time of check-in. This data is only collected when you explicitly attempt to mark attendance and is compared against the authorized venue coordinates.
                </p>
              </div>

              <div className="glass-panel rounded-2xl p-6 sm:p-8 hover-lift">
                <h2 className="font-headline text-2xl font-bold mb-4 text-primary">
                  3. How We Use Your Information
                </h2>
                <p className="text-textMuted leading-relaxed">
                  We use the information to manage your attendance records, generate reports for lecturers and administrators, and improve our services. We do not sell your personal information to third parties.
                </p>
              </div>

              <div className="glass-panel rounded-2xl p-6 sm:p-8 hover-lift">
                <h2 className="font-headline text-2xl font-bold mb-4 text-primary">
                  4. Data Security
                </h2>
                <p className="text-textMuted leading-relaxed">
                  We implement a variety of security measures to maintain the safety of your personal information. Your data is stored on secure servers and transmitted using encrypted connections.
                </p>
              </div>

              <div className="glass-panel rounded-2xl p-6 sm:p-8 hover-lift">
                <h2 className="font-headline text-2xl font-bold mb-4 text-primary">
                  5. Your Rights
                </h2>
                <p className="text-textMuted leading-relaxed">
                  You have the right to access, correct, or delete your personal data. Please contact us or your institutional administrator to exercise these rights.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-surface border-t border-outline py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="text-center sm:text-left">
              {/* <Logo className="mb-2 justify-center sm:justify-start" /> */}
              <div className="flex items-center justify-center gap-3 group cursor-pointer ml-2">
                <img src="/logo.png" alt="Logo" className="w-32" />
                <span className="text-xl font-black tracking-tight text-on-surface">
                  Presently
                </span>
              </div>
              <p className="text-sm text-textMuted">
                © {new Date().getFullYear()} Presently. All rights reserved.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              {[
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Terms of Service', href: '/terms' },
                { label: 'Documentation', href: '/documentation' },
                { label: 'Volunteers', href: '/volunteers' },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm text-textMuted hover:text-primary transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;

