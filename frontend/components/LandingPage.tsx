import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SEO } from './SEO';
import { JsonLd } from './seo/JsonLd';
import { SITE_URL } from './seo/seoConfig';
import { LandingFooter } from './LandingFooter';
import { LandingHeader } from './LandingHeader';
import { useScrollReveal } from '../hooks/useScrollReveal';

// Eagerly load the Hero to prevent CLS
import { LandingHero } from './LandingPage/LandingHero';

import { LandingBento } from './LandingPage/LandingBento';
import { LandingEngineRoom } from './LandingPage/LandingEngineRoom';
import { LandingTestimonials } from './LandingPage/LandingTestimonials';
import { LandingMobileApp } from './LandingPage/LandingMobileApp';
import { LandingCTA } from './LandingPage/LandingCTA';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  useScrollReveal('.fade-up');

  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Presently',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web, Android, iOS',
    description: 'GPS-verified real-time attendance system for Nigerian universities',
    url: SITE_URL,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'NGN' },
    provider: { '@type': 'Organization', name: 'Presently', url: SITE_URL },
  };

  const goRegister = () => navigate('/register');
  const goLogin = () => navigate('/login');

  return (
    <TooltipProvider>
      <SEO
        title="Presently — GPS-Verified Attendance for Nigerian Universities"
        description="Real-time, location-verified attendance system built for Nigerian university lecturers and students. No proxies. No paper registers."
        keywords="nigerian university attendance system, gps verified attendance, campus attendance software, anti proxy attendance"
        canonicalPath="/"
      />
      <JsonLd schema={softwareSchema} />
      
      <div 
        className="min-h-screen bg-background overflow-x-hidden"
        style={{ background: 'var(--background)' }}
      >
        <LandingHeader onGetStarted={goRegister} onLogin={goLogin} />

        <main className="pt-20 sm:pt-24 md:pt-28">
          <LandingHero onGetStarted={goRegister} />
          
          <LandingBento />
          <LandingEngineRoom />
          <LandingTestimonials />
          <LandingMobileApp />
          <LandingCTA onRegister={goRegister} />
        </main>

        <LandingFooter />
      </div>
    </TooltipProvider>
  );
};

export default LandingPage;
