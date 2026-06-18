import React from 'react';
import { ChevronRight, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LandingHeader } from '../LandingHeader';
import { Footer as LandingFooter } from '../LandingPage/LandingFooter';
import { Logo } from '../Logo';
import { SEO } from '../SEO';

const TermsOfService: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-text flex flex-col">
      {/* SEO: Legal page metadata for terms route. */}
      <SEO
        title="Terms of Service"
        description="Read Presently terms of service for platform usage, account responsibilities, and compliance policies."
        canonicalPath="/terms"
      />
      {/* Header */}
      <LandingHeader onGetStarted={() => navigate('/register')} onLogin={() => navigate('/login')} />
      
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
            <span className="text-text font-medium">Terms of Service</span>
          </nav>

          <div className="flex flex-col gap-10">
            {/* Header */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-primaryContainer/20 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div className="h-12 w-1 bg-primary rounded-full"></div>
              </div>
              <h1 className="font-headline text-4xl sm:text-5xl font-bold text-text leading-tight">
                Terms of Service
              </h1>
              <p className="text-textMuted text-base">Last Updated: May 2024</p>
            </div>

            {/* Content Sections */}
            <div className="flex flex-col gap-8">
              <div className="skeuo-card p-6 sm:p-8">
                <h2 className="font-headline text-2xl font-bold mb-4 text-primary">
                  1. Acceptance of Terms
                </h2>
                <p className="text-textMuted leading-relaxed">
                  By accessing and using Presently, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                </p>
              </div>

              <div className="skeuo-card p-6 sm:p-8">
                <h2 className="font-headline text-2xl font-bold mb-4 text-primary">
                  2. Description of Service
                </h2>
                <p className="text-textMuted leading-relaxed">
                  Presently is an automated attendance management system designed for educational institutions. It uses GPS geofencing and QR code technology to verify student presence in classes.
                </p>
              </div>

              <div className="skeuo-card p-6 sm:p-8">
                <h2 className="font-headline text-2xl font-bold mb-4 text-primary">
                  3. User Accounts
                </h2>
                <p className="text-textMuted leading-relaxed">
                  You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must provide accurate and complete information when creating an account.
                </p>
              </div>

              <div className="skeuo-card p-6 sm:p-8">
                <h2 className="font-headline text-2xl font-bold mb-4 text-primary">
                  4. User Conduct
                </h2>
                <p className="text-textMuted leading-relaxed">
                  Users agree not to attempt to circumvent the attendance verification system through the use of location spoofing, account sharing, or any other fraudulent means. Such actions may result in immediate account termination and academic disciplinary action by your institution.
                </p>
              </div>

              <div className="skeuo-card p-6 sm:p-8">
                <h2 className="font-headline text-2xl font-bold mb-4 text-primary">
                  5. Privacy
                </h2>
                <p className="text-textMuted leading-relaxed">
                  Your use of Presently is also governed by our Privacy Policy. Please review it to understand our practices regarding your personal information and location data.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <LandingFooter />
    </div>
  );
};
