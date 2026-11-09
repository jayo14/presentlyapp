import React from 'react';
import { Navbar } from './LandingPage/Navbar';
import { Hero } from './LandingPage/LandingHero';
import { ProblemSection } from './LandingPage/ProblemSection';
import { HowItWorksSection } from './LandingPage/HowItWorksSection';
import { ProductShowcase } from './LandingPage/ProductShowcase';
import { OriginStorySection } from './LandingPage/OriginStorySection';
import { RoleBenefitsSection } from './LandingPage/RoleBenefitsSection';
import { TrustTransparency } from './LandingPage/TrustTransparency';
import { LandingPricing } from './LandingPage/LandingPricing';
import { FAQSection } from './LandingPage/FAQSection';
import { CTASection } from './LandingPage/LandingCTA';
import { Footer } from './LandingPage/LandingFooter';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans landing-page overflow-x-hidden selection:bg-sungold/30 selection:text-neutral-900">
      {/* 01. Primary Navigation */}
      <Navbar />

      {/* 02. Grounded Hero Section with Authentic UI Preview */}
      <Hero />

      {/* 03 & 04. Campus Reality: The Problem with Traditional Paper Attendance */}
      <ProblemSection />

      {/* 05. How It Works: Step-by-Step by Academic Role */}
      <HowItWorksSection />

      {/* 06. Authentic Product Showcase: Session Control, Student Pass & Clearance */}
      <ProductShowcase />

      {/* 07. The LASUSTECH Journey: Real Campus Origins & Engineering Adaptation */}
      <OriginStorySection />

      {/* 08. Ecosystem Value by Stakeholder (Lecturers, Students, HODs, Deans) */}
      <RoleBenefitsSection />

      {/* 09. Trust, Privacy & Technical Safeguards */}
      <TrustTransparency />

      {/* 10. Transparent Pricing */}
      <LandingPricing />

      {/* 11. Campus FAQ: Real Answers to Infrastructure & Operational Questions */}
      <FAQSection />

      {/* 12. Segmented Dual Conversion Action */}
      <CTASection />

      {/* Institutional Footer */}
      <Footer />
    </div>
  );
}
