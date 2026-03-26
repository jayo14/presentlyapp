import React from 'react';
import { Button } from '@/components/ui/button';

interface LandingCTAProps {
  onRegister: () => void;
}

export const LandingCTA: React.FC<LandingCTAProps> = ({ onRegister }) => {
  return (
    <section id="pricing" style={{ padding: '8rem 2rem' }}>
      <div style={{ maxWidth: 1440, margin: '0 auto' }}>
        <div
          className="fade-up"
          style={{
            background: 'var(--inverse-surface)',
            borderRadius: '4rem',
            padding: 'clamp(3rem,8vw,8rem)',
            position: 'relative',
            overflow: 'hidden',
            textAlign: 'center',
          }}
        >
          {[800, 600, 400].map((size) => (
            <div
              key={size}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%,-50%)',
                width: size,
                height: size,
                borderRadius: '50%',
                border: '1px solid var(--background)',
                opacity: 0.15,
                pointerEvents: 'none',
              }}
            />
          ))}
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              maxWidth: 700,
              margin: '0 auto',
            }}
          >
            <h2
              className="font-headline"
              style={{
                fontSize: 'clamp(2.5rem,6vw,4.5rem)',
                fontWeight: 800,
                letterSpacing: '-0.04em',
                color: 'var(--surface)',
                marginBottom: '2rem',
              }}
            >
              Ready to Elevate Your Institution?
            </h2>
            <p
              style={{
                color: 'var(--surface-variant)',
                fontSize: '1.2rem',
                marginBottom: '3rem',
                opacity: 0.8,
                lineHeight: 1.6,
              }}
            >
              Join over 400 world-class universities using Presently
              to curate their daily presence.
            </p>
            <div
              style={{
                display: 'flex',
                gap: '1.5rem',
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <Button
                onClick={onRegister}
                className="btn-presently-primary btn-lg"
              >
                Request Access
              </Button>
              <Button
                variant="outline"
                onClick={onRegister}
                className="btn-presently-outline btn-lg btn-light"
              >
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
