import React from 'react';
import { Button } from '@/components/ui/button';
import { BarChart3, Lock, Cloud, Users, Bell } from 'lucide-react';

export const LandingBento: React.FC = () => {
  return (
    <section
      id="solutions"
      className="px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20 lg:py-28"
      style={{ background: 'var(--surface-container-low)' }}
    >
      <div style={{ maxWidth: 1440, margin: '0 auto' }}>
        <div className="fade-up text-center lg:text-left" style={{ marginBottom: 'clamp(2rem, 5vw, 5rem)' }}>
          <h2
            className="font-headline text-3xl sm:text-4xl md:text-5xl"
            style={{
              fontWeight: 700,
              letterSpacing: '-0.03em',
              color: 'var(--on-surface)',
              marginBottom: '1rem',
            }}
          >
            Refined Control.
            <br />
            Sophisticated Oversight.
          </h2>
          <p
            className="text-base sm:text-lg md:text-xl mx-auto lg:mx-0"
            style={{
              color: 'var(--on-surface-variant)',
              maxWidth: 600,
              lineHeight: 1.65,
            }}
          >
            We don't just count heads; we provide the narrative behind
            the numbers through high-performance data architecture.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 md:gap-8">
          {/* Analytics card */}
          <div
            className="fade-up hover-lift col-span-1 md:col-span-12 lg:col-span-8"
            style={{
              background: 'var(--surface-container-lowest)',
              padding: 'clamp(1.5rem, 4vw, 2.5rem)',
              borderRadius: '1.5rem',
              border: '1px solid rgba(210,197,171,0.12)',
              minHeight: '400px',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <BarChart3 size={36} color="#755b00" />
              </div>
              <h3
                className="font-headline"
                style={{
                  fontSize: '1.75rem',
                  fontWeight: 700,
                  marginBottom: '0.75rem',
                  color: 'var(--on-surface)',
                }}
              >
                Real-time Visual Analytics
              </h3>
              <p style={{ color: 'var(--on-surface-variant)', maxWidth: 380 }}>
                Every check-in is processed instantly, feeding into a
                global heat map of your institution's daily flow.
              </p>
            </div>
            <Button className="btn-presently-dark" style={{ alignSelf: 'flex-start' }}>
              Explore Analytics
            </Button>
            {/* Decorative ring */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '45%',
                height: '100%',
                opacity: 0.07,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
              }}
            >
              <div
                style={{
                  width: '100%',
                  aspectRatio: '1',
                  border: '40px solid var(--primary)',
                  borderRadius: '50%',
                }}
              />
            </div>
          </div>

          {/* Biometric card */}
          <div
            className="fade-up hover-lift col-span-1 md:col-span-12 lg:col-span-4"
            style={{
              background: 'var(--primary)',
              padding: 'clamp(1.5rem, 4vw, 2.5rem)',
              borderRadius: '1.5rem',
              minHeight: '400px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <Lock size={36} color="white" />
              </div>
              <h3
                className="font-headline"
                style={{
                  fontSize: '1.75rem',
                  fontWeight: 700,
                  marginBottom: '0.75rem',
                  color: 'white',
                }}
              >
                Biometric Fidelity
              </h3>
              <p style={{ color: 'var(--primary-fixed)', opacity: 0.9, lineHeight: 1.6 }}>
                Hardware-grade security protocols ensuring every
                attendance record is immutable and verified.
              </p>
            </div>
            <div
              style={{
                paddingTop: '2rem',
                marginTop: '2rem',
                borderTop: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              <p
                className="font-headline"
                style={{
                  fontSize: '3rem',
                  fontWeight: 900,
                  color: 'white',
                  marginBottom: '0.25rem',
                }}
              >
                99.9%
              </p>
              <p
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'white',
                  opacity: 0.75,
                }}
              >
                Verification Accuracy
              </p>
            </div>
          </div>

          {/* Tertiary cards */}
          {[
            {
              icon: <Cloud size={28} color="#5f5e61" />,
              title: 'Cloud-Native Sync',
              desc: "Offline first architecture that syncs the moment you're back online.",
            },
            {
              icon: <Users size={28} color="#5f5e61" />,
              title: 'Automated Rosters',
              desc: 'Import your entire database in seconds with AI-powered mapping.',
            },
            {
              icon: <Bell size={28} color="#5f5e61" />,
              title: 'Smart Alerts',
              desc: 'Notify staff or parents instantly based on customizable triggers.',
            },
          ].map(({ icon, title, desc }) => (
            <div
              key={title}
              className="fade-up hover-lift col-span-1 md:col-span-4"
              style={{
                background: 'var(--surface-container-lowest)',
                padding: '2rem',
                borderRadius: '2rem',
                border: '1px solid rgba(210,197,171,0.12)',
              }}
            >
              <div style={{ marginBottom: '1rem' }}>{icon}</div>
              <h4
                className="font-headline"
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  marginBottom: '0.5rem',
                  color: 'var(--on-surface)',
                }}
              >
                {title}
              </h4>
              <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
