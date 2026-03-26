import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { QrCode, History, Bell, Check, Apple, Play } from 'lucide-react';

export const LandingMobileApp: React.FC = () => {
  return (
    <section
      id='mobileapp'
      style={{
        padding: '8rem 2rem',
        background: 'var(--surface-container-lowest)',
        overflow: 'hidden',
      }}
    >
      <div style={{ maxWidth: 1440, margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px,1fr))',
            gap: '5rem',
            alignItems: 'center',
          }}
        >
          {/* Phone mockup */}
          <div className="fade-up" style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
            <div
              style={{
                position: 'absolute',
                top: -40,
                right: -40,
                width: 256,
                height: 256,
                background: 'rgba(117,91,0,0.05)',
                borderRadius: '50%',
                filter: 'blur(40px)',
                zIndex: 0,
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: -40,
                left: -40,
                width: 320,
                height: 320,
                background: 'rgba(255,202,13,0.08)',
                borderRadius: '50%',
                filter: 'blur(40px)',
                zIndex: 0,
              }}
            />
            <div
              style={{
                position: 'relative',
                width: 300,
                height: 600,
                zIndex: 1,
                background: 'var(--on-surface)',
                borderRadius: '3rem',
                padding: '1rem',
                border: '8px solid var(--surface-container-highest)',
                boxShadow: '0 32px 80px rgba(27,27,30,0.22)',
                overflow: 'hidden',
              }}
            >
              {/* Dynamic island */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 128,
                  height: 24,
                  background: 'var(--on-surface)',
                  borderRadius: '0 0 1.5rem 1.5rem',
                  zIndex: 20,
                }}
              />
              {/* Screen */}
              <div
                style={{
                  background: 'var(--background)',
                  height: '100%',
                  borderRadius: '2rem',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <div style={{ padding: '1.5rem', paddingTop: '2.5rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '2rem',
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: 'var(--primary-container)',
                      }}
                    />
                    <Bell size={22} color="#5f5e61" />
                  </div>
                  <h4
                    className="font-headline"
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: 900,
                      marginBottom: '1.5rem',
                      color: 'var(--on-surface)',
                    }}
                  >
                    Welcome, Julian
                  </h4>
                  <div
                    style={{
                      background: 'var(--surface-container-low)',
                      borderRadius: '1rem',
                      padding: '1rem',
                      marginBottom: '1.5rem',
                    }}
                  >
                    <p style={{ fontSize: '0.7rem', color: 'var(--secondary)', marginBottom: '0.35rem' }}>
                      Current Status
                    </p>
                    <p
                      style={{
                        fontWeight: 700,
                        color: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.875rem',
                      }}
                    >
                      <span
                        className="status-dot"
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: 'var(--primary)',
                          display: 'inline-block',
                        }}
                      />
                      Checked In: Science Hall A
                    </p>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    {[
                      { icon: <QrCode size={26} color="#755b00" />, label: 'Digital ID' },
                      { icon: <History size={26} color="#755b00" />, label: 'History' },
                    ].map(({ icon, label }) => (
                      <div
                        key={label}
                        style={{
                          background: 'var(--surface-container-high)',
                          aspectRatio: '1',
                          borderRadius: '1rem',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                        }}
                      >
                        {icon}
                        <span
                          style={{
                            fontSize: '0.6rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                          }}
                        >
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '1.5rem',
                    background: 'linear-gradient(to top, var(--background) 70%, transparent)',
                  }}
                >
                  <button
                    style={{
                      width: '100%',
                      background: 'var(--on-surface)',
                      color: 'var(--surface)',
                      border: 'none',
                      borderRadius: '0.75rem',
                      padding: '1rem',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Quick Check-in
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile copy */}
          <div className="fade-up">
            <Badge
              style={{
                background: 'rgba(255,202,13,0.12)',
                color: 'var(--primary)',
                fontWeight: 700,
                fontSize: '0.7rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginBottom: '1.5rem',
                display: 'inline-flex',
                borderRadius: 999,
              }}
            >
              Mobile Companion
            </Badge>
            <h2
              className="font-headline"
              style={{
                fontSize: 'clamp(2.25rem,5vw,4rem)',
                fontWeight: 800,
                letterSpacing: '-0.04em',
                lineHeight: 1.1,
                color: 'var(--on-surface)',
                marginBottom: '2rem',
              }}
            >
              Precision in <br />
              <em style={{ color: 'var(--primary)', fontStyle: 'italic' }}>Your Pocket.</em>
            </h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--on-surface-variant)', maxWidth: 480, marginBottom: '3rem', lineHeight: 1.65 }}>
              Stay connected to your institutional flow from anywhere.
              Our companion app brings verified attendance and real-time alerts to your mobile device.
            </p>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3rem', listStyle: 'none' }}>
              {[
                { title: 'Real-time Check-in', desc: 'Seamless NFC or QR-based check-ins that sync in milliseconds.' },
                { title: 'Instant Notifications', desc: 'Critical alerts and presence updates delivered straight to your lock screen.' },
                { title: 'Secure Digital ID', desc: 'Hardware-backed biometric identity for immutable verification on the go.' },
              ].map(({ title, desc }) => (
                <li key={title} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      flexShrink: 0,
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: 'rgba(117,91,0,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: 2,
                    }}
                  >
                    <Check size={14} color="#755b00" />
                  </div>
                  <div>
                    <h5 className="font-headline" style={{ fontWeight: 700, marginBottom: '0.25rem', color: 'var(--on-surface)' }}>{title}</h5>
                    <p style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)', lineHeight: 1.6 }}>{desc}</p>
                  </div>
                </li>
              ))}
            </ul>

            {/* App store buttons */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Button className="btn-presently-dark btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}>
                <Apple size={24} />
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontSize: '0.6rem', textTransform: 'uppercase', fontWeight: 700, lineHeight: 1, marginBottom: 2 }}>Download on the</p>
                  <p style={{ fontSize: '1rem', fontWeight: 700, lineHeight: 1 }}>App Store</p>
                </div>
              </Button>
              <Button className="btn-presently-dark btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}>
                <Play size={24} fill="currentColor" />
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontSize: '0.6rem', textTransform: 'uppercase', fontWeight: 700, lineHeight: 1, marginBottom: 2 }}>Get it on</p>
                  <p style={{ fontSize: '1rem', fontWeight: 700, lineHeight: 1 }}>Google Play</p>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
