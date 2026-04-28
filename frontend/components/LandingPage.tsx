import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SEO } from './SEO';
import { JsonLd } from './seo/JsonLd';
import { SITE_URL } from './seo/seoConfig';
import { LandingFooter } from './LandingFooter';
import { LandingHeader } from './LandingHeader';

import { LandingHero } from './LandingPage/LandingHero';
import { LandingBento } from './LandingPage/LandingBento';
import { LandingEngineRoom } from './LandingPage/LandingEngineRoom';
import { LandingTestimonials } from './LandingPage/LandingTestimonials';
import { LandingPricing } from './LandingPage/LandingPricing';
import { LandingMobileApp } from './LandingPage/LandingMobileApp';
import { LandingCTA } from './LandingPage/LandingCTA';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Presently',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web, Android, iOS',
    description: 'The premier anti-proxy attendance system for Nigerian universities. GPS-verified and built for integrity.',
    url: SITE_URL,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'NGN' },
    provider: { '@type': 'Organization', name: 'Presently', url: SITE_URL },
  };

  const goRegister = () => navigate('/register');
  const goLogin = () => navigate('/login');

  return (
    <TooltipProvider>
      <SEO
        title="Presently — Reclaiming Lecture Integrity"
        description="Stop proxies. Save time. Presently ensures 100% accurate, location-verified attendance for Nigerian universities."
      />
      <JsonLd schema={softwareSchema} />
      
      <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-[#D4AF37] selection:text-[#0A0A0A]">
        <LandingHeader onGetStarted={goRegister} onLogin={goLogin} />

        <main>
          <LandingHero onGetStarted={goRegister} />
          <LandingBento />
          <LandingEngineRoom />
          <LandingTestimonials />
          <LandingPricing />
          <LandingMobileApp />
          <LandingCTA onRegister={goRegister} />
        </main>

        <LandingFooter />
      </div>
    </TooltipProvider>
  );
};

export default LandingPage;
