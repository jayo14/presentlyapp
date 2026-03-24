import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bell,
  Check,
  Cloud,
  History,
  Languages,
  Lock,
  QrCode,
  Quote,
  Share2,
  Users,
  Zap,
  Apple,
  Play,
  Sun,
  Moon,
} from 'lucide-react';

import { useTheme } from './ThemeProvider';

// ─── shadcn/ui primitives (adjust import paths to match your project) ──────────
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { SEO } from './SEO';
import { Logo } from './Logo';
import { JsonLd } from './seo/JsonLd';
import { SITE_URL } from './seo/seoConfig';
import { LandingFooter } from './LandingFooter';
import { LandingHeader } from './LandingHeader';

// ─── Global Styles ────────────────────────────────────────────────────────────
// The app relies on the global index.css loaded at the root.

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ─── GSAP animations hook ─────────────────────────────────────────────────────────
function useGSAPAnimations() {
  React.useEffect(() => {
    // Reveal animations for fade-up elements
    const fadeElements = document.querySelectorAll('.fade-up');
    fadeElements.forEach((el) => {
      gsap.fromTo(el, 
        { 
          opacity: 0, 
          y: 40,
        }, 
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        }
      );
    });

    // Parallax for background orbs
    const orbs = document.querySelectorAll('.orb-animate');
    orbs.forEach((orb) => {
      gsap.to(orb, {
        y: -100,
        x: 50,
        scrollTrigger: {
          trigger: orb,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5
        }
      });
    });

    // Scaling animations for hero elements
    gsap.from('.hero-card', {
      scale: 0.9,
      opacity: 0,
      rotateX: 10,
      duration: 1.5,
      delay: 0.2,
      ease: 'expo.out'
    });

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    quote:
      '"The level of precision Presently provides has completely transformed our faculty oversight. It\'s not just a tool; it\'s an editorial standard for data."',
    name: 'Dr. Alistair Thorne',
    role: 'Dean of Sciences, Oakhaven',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA9COqM4fJRsMreUnVWeh12TR5PdxZdzG1I9fC6lFkKmkjk5_VCGgj2TzHp2Iazhal4OWk9nKEpCPLlrE-2rh_hW_a3uJgTpQrQSxu2w8K6FZmDQfj56CAYV8oJajR1hehYzwyhkLTxXQN5mrPfv27TeJfeq1sRoU4RdpmL_qO-91MfxFC_koJNIamvXbkodHlBGL8DCKouB9PHtB2_wPZrTbHEsBtKOJLAqMaRMWB0GQz0CvOn5ozoEzfPfGLw-n-GWXLC-4mKSdo',
  },
  {
    quote:
      '"Finally, a system that respects the sophistication of modern administrative needs. The real-time visual analytics are simply unparalleled."',
    name: 'Marcus Vane',
    role: "Registrar, St. Jude's",
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDto_i1wsGaAj6EdsEnBX_Kmgk-ZpJ7jv3fAkqmPvruCetikQTfZXaNtvX5YCvb4ukLcoW2xLjWarhnVBsXTaNAF1zLGHvlyXVnOwKHLp0USyjJtKm-NCPjZ9ShyUxTD16La9m5xD4pqS_oNM7iJ8ro8jGVXx6UbdvtaGsPATON6bLgbQ9oh09apBYh0nNK_EBtVap8YahyY-0XFMUw0Wa9vuSt5JsrawEp3e0Oej_QCwJG7YBuOemCGR7K5RhhEYtpnMYn2mIq-0g',
  },
  {
    quote:
      '"Integration was seamless. Our staff loves the mobile app companion, and the accuracy of the biometric sync is truly world-class."',
    name: 'Sarah Jenkins',
    role: 'COO, Global Academy',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAj4c7d2--Y4NdiBDRXmMLJSwdxbKvJwC-eYht_x_5GUncR_KcPnLyKHyMq2aaQzVHyH05UIWPQpntoQcmJbsOU3TXHQsHwL7Jkm5yOVjvzwfjbmsMPg_T0AY3MRiD0yM_UM3SDMeYVzuDx3xEofVj91Bj2TMa1f88ub8nfoSE5D8vI_9GL6Gk5m1m1fcJPVuO3dHZCyfGJy8mXw-O98XWWPrfrB_X-cke8AY_MkX6SWjSoHUrnbFG-6ad0oBypOTx9oNbtVJplh5s',
  },
];

const PERFORMANCE_AVATARS = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA69CK06yBXhX-9zvZDOSe-r9kxYPijksP_9HwS946RH-VFtx20ZuslvOrjUpvVXTUb4TBEu14SAqBnS37z7Y7aJT4Rn5Uml39f9IVcmJ-MmAO-sAhWKvkJfv4ftJ6hkQjwdPqNj4qM7WmdWz5HAwOWAZKPIl9jRad6tQDZ3UstJ5S2W63IlaPEeqUFQvKrUApF9rYtFIO0f0sl1oTM2xDrvPQfS3s9FXAsDTzeIyyDpALwxrWKvV2129ttVKYPOzb1s1fur6bAY10',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCju0PTXJpKR8npJOvITxZcT7JKcQq5nBWe94L3MOfqpcd_7ElhHE1JTBoagdsd7Wp68asXcN0c_A3cy6qo_Ngb4832OC7EpE_YAToOF5vWjdCMpmDslOwI1EP4fQAob6PGfl-v6-0SvTYDYcc_5rxrWPrlYQwI8xUmY_VjkIg0jVSkkxnJFrZZwmHYBVnkbDPFCU4Xiid6J7MNsI3EnEmTB9F0sZWBF-PuQJcxBJS60WrBLvBYT6ELVJiV-TP5rbqbMzz7z1AidCQ',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCLS-w3Q67dG_LhvX6Kk69SdgRSLSH_r0OExsM_PkKYYsKEpJXXybMuEih5fQZ6ihDMKzjPNi-c3h2UdhE1DSEhimKtiEaxolywmTUD3WZsHxANqxTZEQ0aBql8Ay9WcZvGiwNe9rAH_WOGSBkqoiq-_TOEegNDuEKFK5lkf6Crzqs5JcO6YkUXRdKE5lxLZ1NLHAnubC-3rdAHb1vBe7PjyglTGHLsFmApOXosApB0dFrqi4UdgDbgEmGEm5PNxCGbHVdrAjLgvio',
];

// ─── Component ────────────────────────────────────────────────────────────────
export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  useGSAPAnimations();
  const { theme, setTheme } = useTheme();

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
      {/* SEO: Homepage SoftwareApplication JSON-LD. */}
      <JsonLd schema={softwareSchema} />
      <div
        style={{
          background: 'var(--background)',
          minHeight: '100vh',
          overflowX: 'hidden',
        }}
      >
        <LandingHeader onGetStarted={goRegister} onLogin={goLogin} />

        <main className="pt-20 sm:pt-24 md:pt-28">
          {/* ── HERO ───────────────────────────────────────────────────────── */}
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
                background:
                  'radial-gradient(circle, var(--primary-container), transparent 68%)',
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
                  Manage attendance with the precision of a curator and the
                  speed of light.
                </p>

                <div
                  className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start"
                  style={{
                    flexWrap: 'wrap',
                  }}
                >
                  <Button
                    onClick={goRegister}
                    className="btn-presently-primary btn-lg"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    Deploy Now <ArrowRight size={20} strokeWidth={2.5} />
                  </Button>
                  <Button
                    variant="outline"
                    className="btn-presently-outline btn-lg"
                    onClick={() =>
                      document
                        .getElementById('solutions')
                        ?.scrollIntoView({ behavior: 'smooth' })
                    }
                  >
                    View Demo
                  </Button>
                </div>
              </div>

              {/* Hero card */}
              <div
                className="lg:col-span-5 hidden lg:block"
                style={{ position: 'relative' }}
              >
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '1',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: '50%',
                      background:
                        'radial-gradient(circle, var(--primary-container), transparent 70%)',
                      opacity: 0.12,
                      filter: 'blur(40px)',
                    }}
                  />
                  <div
                    className="hero-card glass-panel editorial-shadow"
                    style={{
                      borderRadius: '2rem',
                      padding: '2rem',
                      border: '1px solid rgba(210,197,171,0.15)',
                      position: 'relative',
                      zIndex: 2,
                    }}
                  >
                    {/* Traffic lights */}
                    <div
                      style={{
                        display: 'flex',
                        gap: '0.5rem',
                        alignItems: 'center',
                        marginBottom: '2.5rem',
                      }}
                    >
                      {[
                        'var(--error)',
                        'var(--primary)',
                        'var(--secondary-fixed-dim)',
                      ].map((c, i) => (
                        <div
                          key={i}
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            background: c,
                          }}
                        />
                      ))}
                      <span
                        style={{
                          marginLeft: 'auto',
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          letterSpacing: '0.15em',
                          textTransform: 'uppercase',
                          color: 'var(--secondary)',
                        }}
                      >
                        Live Insights
                      </span>
                    </div>

                    {/* Progress bars */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.25rem',
                      }}
                    >
                      <div
                        style={{
                          height: 14,
                          width: '75%',
                          borderRadius: 999,
                          background: 'var(--surface-container-high)',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          className="fill-88"
                          style={{
                            height: '100%',
                            background: 'var(--primary)',
                            borderRadius: 999,
                          }}
                        />
                      </div>
                      <div
                        style={{
                          height: 14,
                          width: '50%',
                          borderRadius: 999,
                          background: 'var(--surface-container-high)',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          className="fill-65"
                          style={{
                            height: '100%',
                            background: 'var(--primary-fixed-dim)',
                            borderRadius: 999,
                          }}
                        />
                      </div>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '1rem',
                          paddingTop: '1rem',
                        }}
                      >
                        {[
                          {
                            label: 'Total Active',
                            val: '1,284',
                            color: 'var(--on-surface)',
                          },
                          {
                            label: 'Engagement',
                            val: '94.2%',
                            color: 'var(--primary)',
                          },
                        ].map(({ label, val, color }) => (
                          <div
                            key={label}
                            style={{
                              background: 'var(--surface-container-low)',
                              padding: '1rem',
                              borderRadius: '0.75rem',
                            }}
                          >
                            <p
                              style={{
                                fontSize: '0.7rem',
                                color: 'var(--secondary)',
                                marginBottom: '0.25rem',
                              }}
                            >
                              {label}
                            </p>
                            <p
                              className="font-headline"
                              style={{
                                fontSize: '1.5rem',
                                fontWeight: 900,
                                color,
                              }}
                            >
                              {val}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Check-in row */}
                    <div
                      style={{
                        marginTop: '2rem',
                        paddingTop: '2rem',
                        borderTop: '1px solid rgba(210,197,171,0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                      }}
                    >
                      <img
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAp80PUDnj3WkE6G7govkSd_QK_PozZ20PeFFf_VYfiKSaT9Mf5z4I-iaCOP8H1G082lDszfVTGjvJKc6Y_FPyghHTliJt_sMA6asMyRbyUYx6DhnH2jQ8sGpK9gG8tdN3WB73riW2_NTxabe0J6_L8vayKlmkAX2im696D5jiMvf3MV-SoWj-rmJDq-Wly2paWUgvZ51KfS39pE9s6-JlnxPA504kNiZWHWEaF7frK6_YRqGvhF11m546upKIWGyL_iAtWnFoahv0"
                        alt="Julian"
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          objectFit: 'cover',
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <div>
                        <p
                          style={{
                            fontSize: '0.875rem',
                            fontWeight: 700,
                            color: 'var(--on-surface)',
                          }}
                        >
                          Julian Alexander
                        </p>
                        <p
                          style={{
                            fontSize: '0.75rem',
                            color: 'var(--secondary)',
                          }}
                        >
                          Verified Check-in · 2m ago
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Spillover badge */}
                  <Tooltip>
                    <TooltipTrigger asChild>
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
                          <p
                            style={{ fontSize: '0.875rem', fontWeight: 700 }}
                          >
                            Accuracy Rank
                          </p>
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
                    </TooltipTrigger>
                    <TooltipContent>
                      Verified by independent audit bodies
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
          </section>

          {/* ── BENTO ──────────────────────────────────────────────────────── */}
          <section
            id="solutions"
            className="px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20 lg:py-28"
            style={{
              background: 'var(--surface-container-low)',
            }}
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

              <div
                className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 md:gap-8"
              >
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
                    <p
                      style={{
                        color: 'var(--on-surface-variant)',
                        maxWidth: 380,
                      }}
                    >
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
                  {/* Mini chart */}
                  <div
                    className="hidden sm:block"
                    style={{
                      position: 'absolute',
                      bottom: 32,
                      right: 32,
                      background: 'var(--surface-container-low)',
                      borderRadius: '1rem',
                      padding: '1.25rem',
                      width: 220,
                      transform: 'translateY(5rem) rotate(12deg)',
                      boxShadow: '0 12px 32px rgba(27,27,30,0.08)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-end',
                        gap: '0.5rem',
                        height: 96,
                      }}
                    >
                      {[40, 80, 60, 100].map((h, i) => (
                        <div
                          key={i}
                          className="bar-animate"
                          style={{
                            flex: 1,
                            height: `${h}%`,
                            borderRadius: '4px 4px 0 0',
                            background:
                              i % 2 === 1
                                ? 'var(--primary)'
                                : 'var(--primary-fixed)',
                          }}
                        />
                      ))}
                    </div>
                    <p
                      style={{
                        textAlign: 'center',
                        fontWeight: 700,
                        fontSize: '0.65rem',
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                        marginTop: '0.75rem',
                        color: 'var(--secondary)',
                      }}
                    >
                      Weekly Peak
                    </p>
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
                    <p
                      style={{
                        color: 'var(--primary-fixed)',
                        opacity: 0.9,
                        lineHeight: 1.6,
                      }}
                    >
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

                {/* Three tertiary cards */}
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
                    <p
                      style={{
                        color: 'var(--on-surface-variant)',
                        fontSize: '0.875rem',
                        lineHeight: 1.6,
                      }}
                    >
                      {desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── ENGINE ROOM ────────────────────────────────────────────────── */}
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
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '3rem',
                  }}
                >
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
                        <p
                          style={{
                            color: 'var(--on-surface-variant)',
                            lineHeight: 1.65,
                          }}
                        >
                          {desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chart card */}
              <div
                style={{ flex: '1 1 400px', position: 'relative' }}
              >
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
                      <p
                        style={{
                          fontSize: '0.875rem',
                          color: 'var(--secondary)',
                        }}
                      >
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
                            background:
                              i === 2
                                ? 'var(--primary-container)'
                                : 'var(--primary)',
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
                          (e.target as HTMLImageElement).style.background =
                            '#ccc';
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

          <Separator
            style={{ background: 'rgba(210,197,171,0.18)', margin: 0 }}
          />

          {/* ── TESTIMONIALS ───────────────────────────────────────────────── */}
          <section
            style={{ background: 'var(--surface)', padding: '8rem 2rem' }}
          >
            <div style={{ maxWidth: 1440, margin: '0 auto' }}>
              <div
                className="fade-up"
                style={{ textAlign: 'center', marginBottom: '5rem' }}
              >
                <span
                  style={{
                    display: 'block',
                    color: 'var(--primary)',
                    fontWeight: 700,
                    fontSize: '0.7rem',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    marginBottom: '1rem',
                  }}
                >
                  Institutional Trust
                </span>
                <h2
                  className="font-headline"
                  style={{
                    fontSize: 'clamp(2rem,4vw,3.25rem)',
                    fontWeight: 700,
                    letterSpacing: '-0.03em',
                    color: 'var(--on-surface)',
                  }}
                >
                  Trusted by Leading Institutions
                </h2>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '2rem',
                }}
              >
                {TESTIMONIALS.map(({ quote, name, role, img }) => (
                  <div
                    key={name}
                    className="fade-up testimonial-card editorial-shadow"
                    style={{
                      background: 'var(--surface-container-low)',
                      padding: '2.5rem',
                      borderRadius: '1.5rem',
                      border: '1px solid rgba(210,197,171,0.12)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '2.5rem',
                    }}
                  >
                    <div>
                      <div style={{ marginBottom: '2rem' }}>
                        <Quote size={36} color="#ffca0d" />
                      </div>
                      <p
                        style={{
                          fontSize: '1.05rem',
                          color: 'var(--on-surface)',
                          lineHeight: 1.7,
                          fontStyle: 'italic',
                          fontWeight: 500,
                        }}
                      >
                        {quote}
                      </p>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                      }}
                    >
                      <img
                        src={img}
                        alt={name}
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          objectFit: 'cover',
                          filter: 'grayscale(1)',
                          transition: 'filter 0.5s',
                        }}
                        onMouseEnter={(e) =>
                        ((e.target as HTMLImageElement).style.filter =
                          'grayscale(0)')
                        }
                        onMouseLeave={(e) =>
                        ((e.target as HTMLImageElement).style.filter =
                          'grayscale(1)')
                        }
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display =
                            'none';
                        }}
                      />
                      <div>
                        <p
                          style={{
                            fontWeight: 700,
                            fontSize: '0.875rem',
                            color: 'var(--on-surface)',
                          }}
                        >
                          {name}
                        </p>
                        <p
                          style={{
                            fontSize: '0.7rem',
                            color: 'var(--secondary)',
                            fontWeight: 600,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                          }}
                        >
                          {role}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── MOBILE APP ─────────────────────────────────────────────────── */}
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
                  gridTemplateColumns:
                    'repeat(auto-fit, minmax(300px,1fr))',
                  gap: '5rem',
                  alignItems: 'center',
                }}
              >
                {/* Phone mockup */}
                <div
                  className="fade-up"
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    position: 'relative',
                  }}
                >
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
                      boxShadow:
                        '0 32px 80px rgba(27,27,30,0.22)',
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
                      <div
                        style={{
                          padding: '1.5rem',
                          paddingTop: '2.5rem',
                        }}
                      >
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
                          <p
                            style={{
                              fontSize: '0.7rem',
                              color: 'var(--secondary)',
                              marginBottom: '0.35rem',
                            }}
                          >
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
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '1rem',
                          }}
                        >
                          {[
                            {
                              icon: (
                                <QrCode size={26} color="#755b00" />
                              ),
                              label: 'Digital ID',
                            },
                            {
                              icon: (
                                <History size={26} color="#755b00" />
                              ),
                              label: 'History',
                            },
                          ].map(({ icon, label }) => (
                            <div
                              key={label}
                              style={{
                                background:
                                  'var(--surface-container-high)',
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
                          background:
                            'linear-gradient(to top, var(--background) 70%, transparent)',
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
                    <em
                      style={{
                        color: 'var(--primary)',
                        fontStyle: 'italic',
                      }}
                    >
                      Your Pocket.
                    </em>
                  </h2>
                  <p
                    style={{
                      fontSize: '1.1rem',
                      color: 'var(--on-surface-variant)',
                      maxWidth: 480,
                      marginBottom: '3rem',
                      lineHeight: 1.65,
                    }}
                  >
                    Stay connected to your institutional flow from anywhere.
                    Our companion app brings verified attendance and
                    real-time alerts to your mobile device.
                  </p>
                  <ul
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1.5rem',
                      marginBottom: '3rem',
                      listStyle: 'none',
                    }}
                  >
                    {[
                      {
                        title: 'Real-time Check-in',
                        desc: 'Seamless NFC or QR-based check-ins that sync in milliseconds.',
                      },
                      {
                        title: 'Instant Notifications',
                        desc: 'Critical alerts and presence updates delivered straight to your lock screen.',
                      },
                      {
                        title: 'Secure Digital ID',
                        desc: 'Hardware-backed biometric identity for immutable verification on the go.',
                      },
                    ].map(({ title, desc }) => (
                      <li
                        key={title}
                        style={{
                          display: 'flex',
                          gap: '1rem',
                          alignItems: 'flex-start',
                        }}
                      >
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
                          <h5
                            className="font-headline"
                            style={{
                              fontWeight: 700,
                              marginBottom: '0.25rem',
                              color: 'var(--on-surface)',
                            }}
                          >
                            {title}
                          </h5>
                          <p
                            style={{
                              fontSize: '0.875rem',
                              color: 'var(--on-surface-variant)',
                              lineHeight: 1.6,
                            }}
                          >
                            {desc}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>

                  {/* App store buttons */}
                  <div
                    style={{
                      display: 'flex',
                      gap: '1rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    <Button
                      className="btn-presently-dark btn-lg"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                      }}
                    >
                      <Apple size={24} />
                      <div style={{ textAlign: 'left' }}>
                        <p
                          style={{
                            fontSize: '0.6rem',
                            textTransform: 'uppercase',
                            fontWeight: 700,
                            lineHeight: 1,
                            marginBottom: 2,
                          }}
                        >
                          Download on the
                        </p>
                        <p
                          style={{
                            fontSize: '1rem',
                            fontWeight: 700,
                            lineHeight: 1,
                          }}
                        >
                          App Store
                        </p>
                      </div>
                    </Button>
                    <Button
                      className="btn-presently-dark btn-lg"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                      }}
                    >
                      <Play size={24} fill="currentColor" />
                      <div style={{ textAlign: 'left' }}>
                        <p
                          style={{
                            fontSize: '0.6rem',
                            textTransform: 'uppercase',
                            fontWeight: 700,
                            lineHeight: 1,
                            marginBottom: 2,
                          }}
                        >
                          Get it on
                        </p>
                        <p
                          style={{
                            fontSize: '1rem',
                            fontWeight: 700,
                            lineHeight: 1,
                          }}
                        >
                          Google Play
                        </p>
                      </div>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>



          {/* ── FINAL CTA ──────────────────────────────────────────────────── */}
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
                      onClick={goRegister}
                      className="btn-presently-primary btn-lg"
                    >
                      Request Access
                    </Button>
                    <Button
                      variant="outline"
                      onClick={goRegister}
                      className="btn-presently-outline btn-lg btn-light"
                    >
                      Contact Sales
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <LandingFooter />
      </div>
    </TooltipProvider>
  );
};

export default LandingPage;
