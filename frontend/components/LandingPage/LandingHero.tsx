import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowRight, BadgeCheck } from 'lucide-react';

interface LandingHeroProps {
  onGetStarted: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onGetStarted }) => {
  return (
    <section
      id="platform"
      className="px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20 lg:py-24"
      style={{
        position: 'relative',
        maxWidth: 1440,
        margin: '0 auto',
        overflow: 'visible',
      }}
    >
      {/* Background orb */}
      <div
        className="orb-animate"
        style={{
          position: 'absolute',
          top: '5%',
          right: '3%',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, var(--primary-container), transparent 68%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div
        className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
        style={{
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Copy */}
        <div className="lg:col-span-7 text-center lg:text-left">
          <Badge
            variant="secondary"
            style={{
              background: 'var(--surface-container-low)',
              color: 'var(--primary)',
              fontWeight: 700,
              fontSize: '0.7rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: '1.5rem',
              display: 'inline-flex',
              borderRadius: 999,
              padding: '0.375rem 1rem',
            }}
          >
            The Precision Curator
          </Badge>

          <h1
            className="font-headline text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
            style={{
              lineHeight: 1.05,
              fontWeight: 800,
              letterSpacing: '-0.04em',
              color: 'var(--on-surface)',
              marginBottom: '1.5rem',
            }}
          >
            Attendance, <br />
            <em style={{ color: 'var(--primary)', fontStyle: 'italic' }}>
              Reinvented.
            </em>
          </h1>

          <p
            className="text-base sm:text-lg md:text-xl mx-auto lg:mx-0"
            style={{
              color: 'var(--on-surface-variant)',
              maxWidth: 520,
              marginBottom: '2rem',
              lineHeight: 1.65,
            }}
          >
            A high-end editorial approach to institutional oversight.
            Manage attendance with the precision of a curator and the speed of light.
          </p>

          <div
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start"
            style={{ flexWrap: 'wrap' }}
          >
            <Button
              onClick={onGetStarted}
              className="btn-presently-primary btn-lg"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              Deploy Now <ArrowRight size={20} strokeWidth={2.5} />
            </Button>
            <Button
              variant="outline"
              className="btn-presently-outline btn-lg"
              onClick={() =>
                document.getElementById('solutions')?.scrollIntoView({ behavior: 'smooth' })
              }
            >
              View Demo
            </Button>
          </div>
        </div>

        {/* Hero visual */}
        <div className="lg:col-span-5 hidden lg:block" style={{ position: 'relative' }}>
          <div style={{ position: 'relative', width: '100%', aspectRatio: '1' }}>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                background: 'radial-gradient(circle, var(--primary-container), transparent 70%)',
                opacity: 0.12,
                filter: 'blur(40px)',
              }}
            />
            {/* Optimized Picture with WebP support */}
            <div className="hero-card relative z-[2] transition-transform duration-700 hover:rotate-2 hover:scale-[1.02]">
              <picture>
                <source srcSet="/3d-logo.webp" type="image/webp" />
                <img 
                  src="/3d-logo.png" 
                  alt="Presently 3D Visualization" 
                  className="w-full h-auto drop-shadow-[0_20px_50px_rgba(0,0,0,0.15)]"
                  loading="eager"
                  fetchPriority="high"
                />
              </picture>
            </div>

            {/* Spillover badge */}
            <div
              className="glass-panel editorial-shadow mobile-hide"
              style={{
                position: 'absolute',
                bottom: -32,
                left: -32,
                padding: '1.25rem 1.5rem',
                borderRadius: '1.25rem',
                border: '1px solid rgba(210,197,171,0.18)',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                zIndex: 3,
                cursor: 'default',
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '0.75rem',
                  background: 'var(--primary-container)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <BadgeCheck size={22} color="#241a00" />
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', fontWeight: 700 }}>Accuracy Rank</p>
                <p
                  className="font-headline"
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 900,
                    color: 'var(--primary)',
                  }}
                >
                  Global #1
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
