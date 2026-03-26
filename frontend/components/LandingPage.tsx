import React, { Suspense, lazy } from 'react';
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

// Lazy load non-critical sections
const LandingBento = lazy(() => import('./LandingPage/LandingBento').then(m => ({ default: m.LandingBento })));
const LandingEngineRoom = lazy(() => import('./LandingPage/LandingEngineRoom').then(m => ({ default: m.LandingEngineRoom })));
const LandingTestimonials = lazy(() => import('./LandingPage/LandingTestimonials').then(m => ({ default: m.LandingTestimonials })));
const LandingMobileApp = lazy(() => import('./LandingPage/LandingMobileApp').then(m => ({ default: m.LandingMobileApp })));
const LandingCTA = lazy(() => import('./LandingPage/LandingCTA').then(m => ({ default: m.LandingCTA })));

// Loading placeholder for lazy sections
const SectionLoader = () => (
  <div className="py-20 flex justify-center items-center">
    <div className="w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
  </div>
);

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
          
          <Suspense fallback={<SectionLoader />}>
            <LandingBento />
          </Suspense>

          <Suspense fallback={<SectionLoader />}>
            <LandingEngineRoom />
          </Suspense>

          <Suspense fallback={<SectionLoader />}>
            <LandingTestimonials />
          </Suspense>

          <Suspense fallback={<SectionLoader />}>
            <LandingMobileApp />
          </Suspense>

          <Suspense fallback={<SectionLoader />}>
            <LandingCTA onRegister={goRegister} />
          </Suspense>
        </main>

        <LandingFooter />
      </div>
    </TooltipProvider>
  );
};

export default LandingPage;
