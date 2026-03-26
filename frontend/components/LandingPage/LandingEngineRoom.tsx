import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Zap } from 'lucide-react';

const PERFORMANCE_AVATARS = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA69CK06yBXhX-9zvZDOSe-r9kxYPijksP_9HwS946RH-VFtx20ZuslvOrjUpvVXTUb4TBEu14SAqBnS37z7Y7aJT4Rn5Uml39f9IVcmJ-MmAO-sAhWKvkJfv4ftJ6hkQjwdPqNj4qM7WmdWz5HAwOWAZKPIl9jRad6tQDZ3UstJ5S2W63IlaPEeqUFQvKrUApF9rYtFIO0f0sl1oTM2xDrvPQfS3s9FXAsDTzeIyyDpALwxrWKvV2129ttVKYPOzb1s1fur6bAY10',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCju0PTXJpKR8npJOvITxZcT7JKcQq5nBWe94L3MOfqpcd_7ElhHE1JTBoagdsd7Wp68asXcN0c_A3cy6qo_Ngb4832OC7EpE_YAToOF5vWjdCMpmDslOwI1EP4fQAob6PGfl-v6-0SvTYDYcc_5rxrWPrlYQwI8xUmY_VjkIg0jVSkkxnJFrZZwmHYBVnkbDPFCU4Xiid6J7MNsI3EnEmTB9F0sZWBF-PuQJcxBJS60WrBLvBYT6ELVJiV-TP5rbqbMzz7z1AidCQ',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCLS-w3Q67dG_LhvX6Kk69SdgRSLSH_r0OExsM_PkKYYsKEpJXXybMuEih5fQZ6ihDMKzjPNi-c3h2UdhE1DSEhimKtiEaxolywmTUD3WZsHxANqxTZEQ0aBql8Ay9WcZvGiwNe9rAH_WOGSBkqoiq-_TOEegNDuEKFK5lkf6Crzqs5JcO6YkUXRdKE5lxLZ1NLHAnubC-3rdAHb1vBe7PjyglTGHLsFmApOXosApB0dFrqi4UdgDbgEmGEm5PNxCGbHVdrAjLgvio',
];

export const LandingEngineRoom: React.FC = () => {
  return (
    <section
      id="resources"
      style={{
        padding: '8rem 2rem',
        maxWidth: 1440,
        margin: '0 auto',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '5rem',
        }}
      >
        {/* Copy */}
        <div style={{ flex: '1 1 400px' }}>
          <h2
            className="font-headline fade-up"
            style={{
              fontSize: 'clamp(2.25rem,5vw,4rem)',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              lineHeight: 1.1,
              color: 'var(--on-surface)',
              marginBottom: '3rem',
            }}
          >
            The Engine Room of{' '}
            <span style={{ color: 'var(--primary)' }}>Engagement.</span>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            {[
              {
                num: '01',
                title: 'Intelligent Scheduling',
                desc: 'Our engine predicts attendance trends based on historical data, allowing you to optimize staff allocation.',
              },
              {
                num: '02',
                title: 'Automated Compliance',
                desc: 'Stay audit-ready with automated reporting that meets the highest regulatory standards.',
              },
            ].map(({ num, title, desc }) => (
              <div
                key={num}
                className="fade-up"
                style={{ display: 'flex', gap: '1.5rem' }}
              >
                <div
                  style={{
                    flexShrink: 0,
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: 'var(--surface-container-high)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span
                    className="font-headline"
                    style={{ fontWeight: 700, color: 'var(--primary)' }}
                  >
                    {num}
                  </span>
                </div>
                <div>
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
                  <p style={{ color: 'var(--on-surface-variant)', lineHeight: 1.65 }}>
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart card */}
        <div style={{ flex: '1 1 400px', position: 'relative' }}>
          <div
            className="fade-up"
            style={{
              background: 'var(--surface-container-low)',
              borderRadius: '3rem',
              padding: '3rem',
              border: '1px solid rgba(210,197,171,0.12)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2.5rem',
              }}
            >
              <div>
                <h5
                  className="font-headline"
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 900,
                    color: 'var(--on-surface)',
                  }}
                >
                  Daily Volume
                </h5>
                <p style={{ fontSize: '0.875rem', color: 'var(--secondary)' }}>
                  Week 42 · Faculty of Science
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {[
                  {
                    label: 'LIVE',
                    bg: 'var(--primary-container)',
                    color: 'var(--on-primary-fixed)',
                  },
                  {
                    label: 'REPORT',
                    bg: 'var(--surface-container-highest)',
                    color: 'var(--on-surface)',
                  },
                ].map(({ label, bg, color }) => (
                  <Badge
                    key={label}
                    style={{
                      background: bg,
                      color,
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      borderRadius: 999,
                    }}
                  >
                    {label}
                  </Badge>
                ))}
              </div>
            </div>
            <div
              style={{
                position: 'relative',
                height: 224,
                display: 'flex',
                alignItems: 'flex-end',
                gap: '0.75rem',
              }}
            >
              {[30, 50, 80, 60, 40, 70].map((h, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: `${h}%`,
                    background: 'var(--surface-container-high)',
                    borderRadius: '0.75rem',
                    position: 'relative',
                    overflow: 'visible',
                  }}
                >
                  <div
                    className="bar-animate"
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: i === 2 ? '100%' : '72%',
                      background: i === 2 ? 'var(--primary-container)' : 'var(--primary)',
                      borderRadius: '0.75rem',
                    }}
                  />
                  {i === 2 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: -28,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontSize: '0.65rem',
                        fontWeight: 900,
                        color: 'var(--primary)',
                        letterSpacing: '0.1em',
                      }}
                    >
                      PEAK
                    </span>
                  )}
                </div>
              ))}
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '1.5rem',
              }}
            >
              {['08:00', '12:00', '16:00', '20:00'].map((t) => (
                <span
                  key={t}
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    color: 'var(--secondary)',
                    opacity: 0.5,
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Floating performance card */}
          <div
            className="glass-panel editorial-shadow mobile-hide"
            style={{
              position: 'absolute',
              bottom: -32,
              right: -24,
              padding: '2rem',
              borderRadius: '1.5rem',
              border: '1px solid rgba(210,197,171,0.2)',
              maxWidth: 280,
              zIndex: 2,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1rem',
              }}
            >
              <Zap size={20} color="#755b00" />
              <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>
                System Performance
              </span>
            </div>
            <p
              style={{
                fontSize: '0.78rem',
                color: 'var(--on-surface-variant)',
                lineHeight: 1.6,
                marginBottom: '1rem',
              }}
            >
              The core engine is currently processing 14k events per
              second with zero latency degradation.
            </p>
            <div style={{ display: 'flex' }}>
              {PERFORMANCE_AVATARS.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt=""
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid var(--surface)',
                    marginLeft: i > 0 ? -10 : 0,
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.background = '#ccc';
                  }}
                />
              ))}
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'var(--primary-container)',
                  border: '2px solid var(--surface)',
                  marginLeft: -10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.6rem',
                  fontWeight: 700,
                  color: 'var(--on-primary-fixed)',
                }}
              >
                +12
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
