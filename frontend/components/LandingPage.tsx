import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// ─── Inline SVG Icons (no external dependency needed) ────────────────────────

const ArrowForwardIcon = () => (
   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
   </svg>
);

const VerifiedIcon = () => (
   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
   </svg>
);

const AnalyticsIcon = () => (
   <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#755b00' }}>
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
   </svg>
);

const LockIcon = () => (
   <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="white">
      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
   </svg>
);

const CloudIcon = () => (
   <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#5f5e61' }}>
      <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM10 17l-3.5-3.5 1.41-1.41L10 14.17 15.18 9l1.41 1.41L10 17z" />
   </svg>
);

const GroupIcon = () => (
   <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#5f5e61' }}>
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
   </svg>
);

const NotificationsIcon = () => (
   <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#5f5e61' }}>
      <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
   </svg>
);

const BoltIcon = () => (
   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#755b00' }}>
      <path d="M7 2v11h3v9l7-12h-4l4-8z" />
   </svg>
);

const LanguageIcon = () => (
   <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.91 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2s.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2s.07-1.35.16-2h4.68c.09.65.16 1.32.16 2s-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2s-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z" />
   </svg>
);

const ShareIcon = () => (
   <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" />
   </svg>
);

// ─── Styles injected once ─────────────────────────────────────────────────────

const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,700;1,800&family=Inter:wght@400;500;600&display=swap');

  :root {
    --primary:              #755b00;
    --primary-container:    #ffca0d;
    --primary-fixed:        #ffdf90;
    --primary-fixed-dim:    #f3c000;
    --on-primary:           #ffffff;
    --on-primary-fixed:     #241a00;
    --on-primary-fixed-var: #584400;
    --on-primary-container: #6f5600;
    --secondary:            #5f5e61;
    --secondary-container:  #e4e1e5;
    --on-secondary:         #ffffff;
    --on-secondary-container:#656467;
    --tertiary:             #5d5e66;
    --surface:              #fbf8fc;
    --surface-bright:       #fbf8fc;
    --surface-dim:          #dcd9dd;
    --surface-variant:      #e4e1e5;
    --surface-tint:         #755b00;
    --surface-container:    #f0edf1;
    --surface-container-low:#f5f3f6;
    --surface-container-lowest:#ffffff;
    --surface-container-high:#eae7eb;
    --surface-container-highest:#e4e1e5;
    --on-surface:           #1b1b1e;
    --on-surface-variant:   #4e4632;
    --on-background:        #1b1b1e;
    --background:           #fbf8fc;
    --outline:              #80765f;
    --outline-variant:      #d2c5ab;
    --error:                #ba1a1a;
    --inverse-surface:      #303033;
    --inverse-on-surface:   #f3f0f4;
    --inverse-primary:      #f3c000;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  html { scroll-behavior: smooth; }

  body {
    background: var(--background);
    color: var(--on-surface);
    font-family: 'Inter', sans-serif;
    overflow-x: hidden;
  }

  .font-headline { font-family: 'Plus Jakarta Sans', sans-serif; }

  .glass-panel {
    background: rgba(255, 255, 255, 0.82);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }

  .editorial-shadow { box-shadow: 0 12px 32px rgba(27,27,30,0.07); }

  /* Hover card lift */
  .hover-lift { transition: transform 0.35s ease, box-shadow 0.35s ease; }
  .hover-lift:hover { transform: translateY(-4px); box-shadow: 0 20px 48px rgba(27,27,30,0.10); }

  /* Rotate card on hover */
  .hero-card { transition: transform 0.7s cubic-bezier(0.23,1,0.32,1); transform: rotate(3deg); }
  .hero-card:hover { transform: rotate(0deg); }

  /* Animated gradient orb behind hero */
  @keyframes pulse-orb {
    0%, 100% { opacity: 0.08; transform: scale(1); }
    50%       { opacity: 0.14; transform: scale(1.08); }
  }
  .orb-animate { animation: pulse-orb 6s ease-in-out infinite; }

  /* Bar chart rise */
  @keyframes bar-rise {
    from { transform: scaleY(0); }
    to   { transform: scaleY(1); }
  }
  .bar-animate {
    transform-origin: bottom;
    animation: bar-rise 1s cubic-bezier(0.23,1,0.32,1) both;
  }
  .bar-animate:nth-child(1) { animation-delay: 0.1s; }
  .bar-animate:nth-child(2) { animation-delay: 0.2s; }
  .bar-animate:nth-child(3) { animation-delay: 0.3s; }
  .bar-animate:nth-child(4) { animation-delay: 0.4s; }
  .bar-animate:nth-child(5) { animation-delay: 0.5s; }
  .bar-animate:nth-child(6) { animation-delay: 0.6s; }

  /* Progress bar fill */
  @keyframes fill-bar {
    from { width: 0; }
  }
  .fill-88 { animation: fill-bar 1.2s 0.3s cubic-bezier(0.23,1,0.32,1) both; width: 88%; }
  .fill-65 { animation: fill-bar 1.2s 0.5s cubic-bezier(0.23,1,0.32,1) both; width: 65%; }

  /* Fade-in on scroll via IntersectionObserver (applied via JS class) */
  .fade-up {
    opacity: 0;
    transform: translateY(32px);
    transition: opacity 0.7s ease, transform 0.7s ease;
  }
  .fade-up.visible {
    opacity: 1;
    transform: translateY(0);
  }

  /* Stagger children */
  .fade-up:nth-child(2) { transition-delay: 0.1s; }
  .fade-up:nth-child(3) { transition-delay: 0.2s; }
  .fade-up:nth-child(4) { transition-delay: 0.3s; }

  /* Mobile nav */
  @media (max-width: 767px) {
    .mobile-hide { display: none !important; }
  }
`;

// ─── Scroll fade hook ─────────────────────────────────────────────────────────

function useFadeOnScroll() {
   React.useEffect(() => {
      const els = document.querySelectorAll('.fade-up');
      const io = new IntersectionObserver(
         (entries) => entries.forEach(e => e.target.classList.toggle('visible', e.isIntersecting)),
         { threshold: 0.15 }
      );
      els.forEach(el => io.observe(el));
      return () => io.disconnect();
   }, []);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const Logo: React.FC<{ onClick?: () => void }> = ({ onClick }) => (
   <button
      onClick={onClick}
      style={{
         background: 'none', border: 'none', cursor: 'pointer',
         fontFamily: "'Plus Jakarta Sans', sans-serif",
         fontWeight: 800, fontSize: '1.4rem', letterSpacing: '-0.04em',
         color: 'var(--on-surface)',
      }}
   >
      Academia.ID
   </button>
);

const NavLink: React.FC<{ href: string; children: React.ReactNode; active?: boolean }> = ({ href, children, active }) => (
   <a
      href={href}
      style={{
         fontFamily: "'Plus Jakarta Sans', sans-serif",
         fontWeight: 600, fontSize: '0.875rem', letterSpacing: '-0.01em',
         textDecoration: 'none',
         color: active ? 'var(--primary)' : 'var(--secondary)',
         borderBottom: active ? '2px solid var(--primary-container)' : '2px solid transparent',
         paddingBottom: active ? '4px' : '0',
         transition: 'color 0.2s',
      }}
      onMouseEnter={e => { if (!active) (e.target as HTMLElement).style.color = 'var(--on-surface)'; }}
      onMouseLeave={e => { if (!active) (e.target as HTMLElement).style.color = 'var(--secondary)'; }}
   >
      {children}
   </a>
);

const PrimaryButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { large?: boolean }> = ({ children, large, style, ...props }) => (
   <button
      {...props}
      style={{
         background: 'var(--primary-container)',
         color: 'var(--on-primary-fixed)',
         border: 'none',
         borderRadius: large ? '0.875rem' : '0.75rem',
         padding: large ? '1.1rem 2.5rem' : '0.625rem 1.5rem',
         fontFamily: "'Plus Jakarta Sans', sans-serif",
         fontWeight: 700,
         fontSize: large ? '1.125rem' : '0.875rem',
         cursor: 'pointer',
         display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
         transition: 'transform 0.15s, opacity 0.15s',
         ...style,
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.88'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
      onMouseDown={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.97)'; }}
      onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
   >
      {children}
   </button>
);

const OutlineButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { large?: boolean; light?: boolean }> = ({ children, large, light, style, ...props }) => (
   <button
      {...props}
      style={{
         background: 'transparent',
         color: light ? 'var(--surface)' : 'var(--on-surface)',
         border: `2px solid ${light ? 'rgba(251,248,252,0.22)' : 'rgba(210,197,171,0.35)'}`,
         borderRadius: large ? '0.875rem' : '0.75rem',
         padding: large ? '1.1rem 2.5rem' : '0.625rem 1.5rem',
         fontFamily: "'Plus Jakarta Sans', sans-serif",
         fontWeight: 700,
         fontSize: large ? '1.125rem' : '0.875rem',
         cursor: 'pointer',
         display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
         transition: 'background 0.2s',
         ...style,
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = light ? 'rgba(251,248,252,0.1)' : 'var(--surface-container-low)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
   >
      {children}
   </button>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export const LandingPage: React.FC = () => {
   const navigate = useNavigate();
   const [menuOpen, setMenuOpen] = useState(false);

   useFadeOnScroll();

   const goRegister = () => navigate('/auth/register');
   const goLogin = () => navigate('/auth/login');

   return (
      <>
         {/* Inject global styles */}
         <style>{GLOBAL_STYLES}</style>

         <div style={{ background: 'var(--background)', minHeight: '100vh', overflowX: 'hidden' }}>

            {/* ── Navigation ─────────────────────────────────────────────────── */}
            <nav style={{
               position: 'fixed', top: 0, width: '100%', zIndex: 50,
               background: 'rgba(251,248,252,0.82)', backdropFilter: 'blur(20px)',
               WebkitBackdropFilter: 'blur(20px)',
               borderBottom: '1px solid rgba(210,197,171,0.15)',
            }}>
               <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  maxWidth: 1440, margin: '0 auto', padding: '1rem 2rem',
               }}>
                  <Logo onClick={() => navigate('/')} />

                  {/* Desktop links */}
                  <div className="mobile-hide" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                     <NavLink href="#platform" active>Platform</NavLink>
                     <NavLink href="#solutions">Solutions</NavLink>
                     <NavLink href="#resources">Resources</NavLink>
                     <NavLink href="#pricing">Pricing</NavLink>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                     <button
                        onClick={goLogin}
                        style={{
                           background: 'none', border: 'none', cursor: 'pointer',
                           fontWeight: 600, fontSize: '0.875rem', color: 'var(--on-surface-variant)',
                           transition: 'opacity 0.2s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                     >
                        Sign In
                     </button>
                     <PrimaryButton onClick={goRegister}>Get Started</PrimaryButton>
                  </div>
               </div>
            </nav>

            <main style={{ paddingTop: '5.5rem' }}>

               {/* ── Hero ───────────────────────────────────────────────────────── */}
               <section id="platform" style={{
                  position: 'relative', padding: '5rem 2rem 6rem',
                  maxWidth: 1440, margin: '0 auto', overflow: 'visible',
               }}>
                  {/* Background orb */}
                  <div className="orb-animate" style={{
                     position: 'absolute', top: '10%', right: '5%',
                     width: 600, height: 600, borderRadius: '50%',
                     background: 'radial-gradient(circle, var(--primary-container), transparent 70%)',
                     pointerEvents: 'none', zIndex: 0,
                  }} />

                  <div style={{
                     display: 'grid',
                     gridTemplateColumns: 'repeat(12, 1fr)',
                     gap: '2rem',
                     alignItems: 'center',
                     position: 'relative', zIndex: 1,
                  }}>
                     {/* Left copy */}
                     <div style={{ gridColumn: 'span 7' }}>
                        <span style={{
                           display: 'inline-block', padding: '0.375rem 1rem',
                           borderRadius: 999, background: 'var(--surface-container-low)',
                           color: 'var(--primary)', fontWeight: 700, fontSize: '0.7rem',
                           letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1.5rem',
                        }}>
                           The Precision Curator
                        </span>

                        <h1 className="font-headline" style={{
                           fontSize: 'clamp(3rem, 7vw, 5.5rem)',
                           lineHeight: 1.05, fontWeight: 800, letterSpacing: '-0.04em',
                           color: 'var(--on-surface)', marginBottom: '2rem',
                        }}>
                           Attendance, <br />
                           <em style={{ color: 'var(--primary)', fontStyle: 'italic' }}>Reinvented.</em>
                        </h1>

                        <p style={{
                           fontSize: '1.2rem', color: 'var(--on-surface-variant)',
                           maxWidth: 520, marginBottom: '2.5rem', lineHeight: 1.65,
                        }}>
                           A high-end editorial approach to institutional oversight. Manage attendance with
                           the precision of a curator and the speed of light.
                        </p>

                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                           <PrimaryButton large onClick={goRegister}>
                              Deploy Now <ArrowForwardIcon />
                           </PrimaryButton>
                           <OutlineButton large onClick={() => document.getElementById('solutions')?.scrollIntoView({ behavior: 'smooth' })}>
                              View Demo
                           </OutlineButton>
                        </div>
                     </div>

                     {/* Right visual card */}
                     <div style={{ gridColumn: 'span 5', position: 'relative' }}>
                        <div style={{ position: 'relative', width: '100%', aspectRatio: '1' }}>
                           {/* Glow */}
                           <div style={{
                              position: 'absolute', inset: 0,
                              background: 'radial-gradient(circle at center, var(--primary-container), transparent 70%)',
                              opacity: 0.15, borderRadius: '50%', filter: 'blur(40px)',
                           }} />

                           {/* Main card */}
                           <div className="hero-card glass-panel editorial-shadow" style={{
                              borderRadius: '2rem', padding: '2rem',
                              border: '1px solid rgba(210,197,171,0.15)',
                              position: 'relative', zIndex: 2,
                           }}>
                              {/* Window dots */}
                              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2.5rem' }}>
                                 {['#ba1a1a', '#755b00', '#e4e1e5'].map((c, i) => (
                                    <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />
                                 ))}
                                 <span style={{
                                    marginLeft: 'auto', fontSize: '0.65rem', fontWeight: 700,
                                    letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--secondary)',
                                 }}>Live Insights</span>
                              </div>

                              {/* Progress bars */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                 <div style={{ height: 14, borderRadius: 999, background: 'var(--surface-container-high)', overflow: 'hidden' }}>
                                    <div className="fill-88" style={{ height: '100%', background: 'var(--primary)', borderRadius: 999 }} />
                                 </div>
                                 <div style={{ height: 14, borderRadius: 999, background: 'var(--surface-container-high)', overflow: 'hidden' }}>
                                    <div className="fill-65" style={{ height: '100%', background: 'var(--primary-fixed-dim)', borderRadius: 999 }} />
                                 </div>

                                 {/* Stats */}
                                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', paddingTop: '1rem' }}>
                                    {[
                                       { label: 'Total Active', value: '1,284', valueColor: 'var(--on-surface)' },
                                       { label: 'Engagement', value: '94.2%', valueColor: 'var(--primary)' },
                                    ].map(({ label, value, valueColor }) => (
                                       <div key={label} style={{
                                          background: 'var(--surface-container-low)',
                                          padding: '1rem', borderRadius: '0.75rem',
                                       }}>
                                          <p style={{ fontSize: '0.7rem', color: 'var(--secondary)', marginBottom: '0.25rem' }}>{label}</p>
                                          <p className="font-headline" style={{ fontSize: '1.5rem', fontWeight: 900, color: valueColor }}>{value}</p>
                                       </div>
                                    ))}
                                 </div>
                              </div>

                              {/* Check-in row */}
                              <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid rgba(210,197,171,0.15)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                 <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--surface-container-high)' }} />
                                 <div>
                                    <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--on-surface)' }}>Julian Alexander</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>Verified Check-in • 2m ago</p>
                                 </div>
                              </div>
                           </div>

                           {/* Spillover badge */}
                           <div className="glass-panel editorial-shadow" style={{
                              position: 'absolute', bottom: -32, left: -32,
                              padding: '1.25rem 1.5rem', borderRadius: '1.25rem',
                              border: '1px solid rgba(210,197,171,0.18)',
                              display: 'flex', alignItems: 'center', gap: '1rem', zIndex: 3,
                           }}>
                              <div style={{
                                 width: 48, height: 48, borderRadius: '0.75rem',
                                 background: 'var(--primary-container)',
                                 display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}>
                                 <VerifiedIcon />
                              </div>
                              <div>
                                 <p style={{ fontSize: '0.875rem', fontWeight: 700 }}>Accuracy Rank</p>
                                 <p className="font-headline" style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--primary)' }}>Global #1</p>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </section>

               {/* ── Bento Feature Grid ─────────────────────────────────────────── */}
               <section id="solutions" style={{ background: 'var(--surface-container-low)', padding: '8rem 2rem' }}>
                  <div style={{ maxWidth: 1440, margin: '0 auto' }}>
                     <div className="fade-up" style={{ marginBottom: '5rem' }}>
                        <h2 className="font-headline" style={{
                           fontSize: 'clamp(2rem, 4vw, 3.25rem)',
                           fontWeight: 700, letterSpacing: '-0.03em',
                           color: 'var(--on-surface)', marginBottom: '1rem',
                        }}>
                           Refined Control.<br />Sophisticated Oversight.
                        </h2>
                        <p style={{ color: 'var(--on-surface-variant)', maxWidth: 600, fontSize: '1.1rem', lineHeight: 1.65 }}>
                           We don't just count heads; we provide the narrative behind the numbers through
                           high-performance data architecture.
                        </p>
                     </div>

                     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '2rem' }}>

                        {/* Main feature card */}
                        <div className="fade-up hover-lift" style={{
                           gridColumn: 'span 8', background: 'var(--surface-container-lowest)',
                           padding: '2.5rem', borderRadius: '2rem',
                           border: '1px solid rgba(210,197,171,0.12)',
                           height: 480, position: 'relative', overflow: 'hidden',
                           display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                        }}>
                           <div style={{ position: 'relative', zIndex: 2 }}>
                              <div style={{ marginBottom: '1.5rem' }}><AnalyticsIcon /></div>
                              <h3 className="font-headline" style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--on-surface)' }}>
                                 Real-time Visual Analytics
                              </h3>
                              <p style={{ color: 'var(--on-surface-variant)', maxWidth: 380 }}>
                                 Every check-in is processed instantly, feeding into a global heat map of your institution's daily flow.
                              </p>
                           </div>
                           <div>
                              <button style={{
                                 background: 'var(--on-surface)', color: 'var(--surface)',
                                 border: 'none', borderRadius: '0.75rem', padding: '0.75rem 1.5rem',
                                 fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
                                 transition: 'opacity 0.2s',
                              }}>Explore Analytics</button>
                           </div>

                           {/* Abstract circle */}
                           <div style={{
                              position: 'absolute', top: 0, right: 0, width: '45%', height: '100%',
                              opacity: 0.07, display: 'flex', alignItems: 'center', justifyContent: 'center',
                              pointerEvents: 'none',
                           }}>
                              <div style={{ width: '100%', aspectRatio: '1', border: '40px solid var(--primary)', borderRadius: '50%' }} />
                           </div>

                           {/* Mini bar chart */}
                           <div style={{
                              position: 'absolute', bottom: 32, right: 32,
                              background: 'var(--surface-container-low)',
                              borderRadius: '1rem', padding: '1.25rem',
                              width: 220, transform: 'rotate(8deg)',
                              boxShadow: '0 12px 32px rgba(27,27,30,0.08)',
                           }}>
                              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '0.5rem', height: 96 }}>
                                 {[40, 80, 60, 100].map((h, i) => (
                                    <div key={i} className="bar-animate" style={{
                                       flex: 1, height: `${h}%`, borderRadius: '4px 4px 0 0',
                                       background: i === 3 ? 'var(--primary)' : 'var(--primary-fixed)',
                                    }} />
                                 ))}
                              </div>
                              <p style={{
                                 textAlign: 'center', fontWeight: 700, fontSize: '0.65rem',
                                 letterSpacing: '0.15em', textTransform: 'uppercase',
                                 marginTop: '0.75rem', color: 'var(--secondary)',
                              }}>Weekly Peak</p>
                           </div>
                        </div>

                        {/* Secondary – Biometric */}
                        <div className="fade-up hover-lift" style={{
                           gridColumn: 'span 4', background: 'var(--primary)', color: 'white',
                           padding: '2.5rem', borderRadius: '2rem',
                           height: 480, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                        }}>
                           <div>
                              <div style={{ marginBottom: '1.5rem' }}><LockIcon /></div>
                              <h3 className="font-headline" style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                                 Biometric Fidelity
                              </h3>
                              <p style={{ color: 'var(--primary-fixed)', opacity: 0.9, lineHeight: 1.6 }}>
                                 Hardware-grade security protocols ensuring every attendance record is immutable and verified.
                              </p>
                           </div>
                           <div style={{ paddingTop: '2rem', marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
                              <p className="font-headline" style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '0.25rem' }}>99.9%</p>
                              <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.75 }}>
                                 Verification Accuracy
                              </p>
                           </div>
                        </div>

                        {/* Tertiary cards */}
                        {[
                           {
                              icon: <CloudIcon />, title: 'Cloud-Native Sync', desc: 'Offline first architecture that syncs the moment you're back online.' },
                  { icon: <GroupIcon />, title: 'Automated Rosters', desc: 'Import your entire database in seconds with AI-powered mapping.' },
                  { icon: <NotificationsIcon />, title: 'Smart Alerts', desc: 'Notify staff or parents instantly based on customizable triggers.' },
                        ].map(({ icon, title, desc }) => (
                           <div key={title} className="fade-up hover-lift" style={{
                              gridColumn: 'span 4', background: 'var(--surface-container-lowest)',
                              padding: '2rem', borderRadius: '2rem',
                              border: '1px solid rgba(210,197,171,0.12)',
                           }}>
                              <div style={{ marginBottom: '1rem' }}>{icon}</div>
                              <h4 className="font-headline" style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--on-surface)' }}>{title}</h4>
                              <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem', lineHeight: 1.6 }}>{desc}</p>
                           </div>
                        ))}
                     </div>
                  </div>
               </section>

               {/* ── Engine Room / Daily Volume ─────────────────────────────────── */}
               <section id="resources" style={{ padding: '8rem 2rem', maxWidth: 1440, margin: '0 auto', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '5rem' }}>

                     {/* Left copy */}
                     <div style={{ flex: '1 1 400px' }}>
                        <h2 className="font-headline fade-up" style={{
                           fontSize: 'clamp(2.25rem, 5vw, 4rem)',
                           fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1,
                           marginBottom: '3rem', color: 'var(--on-surface)',
                        }}>
                           The Engine Room of{' '}
                           <span style={{ color: 'var(--primary)' }}>Engagement.</span>
                        </h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                           {[
                              {
                                 num: '01', title: 'Intelligent Scheduling',
                                 desc: 'Our engine predicts attendance trends based on historical data, allowing you to optimize staff allocation.',
                              },
                              {
                                 num: '02', title: 'Automated Compliance',
                                 desc: 'Stay audit-ready with automated reporting that meets the highest regulatory standards.',
                              },
                           ].map(({ num, title, desc }) => (
                              <div key={num} className="fade-up" style={{ display: 'flex', gap: '1.5rem' }}>
                                 <div style={{
                                    flexShrink: 0, width: 48, height: 48, borderRadius: '50%',
                                    background: 'var(--surface-container-high)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                 }}>
                                    <span className="font-headline" style={{ fontWeight: 700, color: 'var(--primary)' }}>{num}</span>
                                 </div>
                                 <div>
                                    <h4 className="font-headline" style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{title}</h4>
                                    <p style={{ color: 'var(--on-surface-variant)', lineHeight: 1.65 }}>{desc}</p>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>

                     {/* Right chart card */}
                     <div style={{ flex: '1 1 400px', position: 'relative' }}>
                        <div className="fade-up" style={{
                           background: 'var(--surface-container-low)', borderRadius: '3rem',
                           padding: '3rem', border: '1px solid rgba(210,197,171,0.12)',
                        }}>
                           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                              <div>
                                 <h5 className="font-headline" style={{ fontSize: '1.5rem', fontWeight: 900 }}>Daily Volume</h5>
                                 <p style={{ fontSize: '0.875rem', color: 'var(--secondary)' }}>Week 42 · Faculty of Science</p>
                              </div>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                 {[
                                    { label: 'LIVE', bg: 'var(--primary-container)', color: 'var(--on-primary-fixed)' },
                                    { label: 'REPORT', bg: 'var(--surface-container-highest)', color: 'var(--on-surface)' },
                                 ].map(({ label, bg, color }) => (
                                    <span key={label} style={{
                                       background: bg, color, padding: '0.25rem 0.75rem',
                                       borderRadius: 999, fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em',
                                    }}>{label}</span>
                                 ))}
                              </div>
                           </div>

                           {/* Bar chart */}
                           <div style={{ position: 'relative', height: 224, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '0.75rem' }}>
                              {[30, 50, 80, 60, 40, 70].map((h, i) => (
                                 <div key={i} style={{ flex: 1, height: `${h}%`, background: 'var(--surface-container-high)', borderRadius: '0.75rem', position: 'relative', overflow: 'hidden' }}>
                                    <div className="bar-animate" style={{
                                       position: 'absolute', bottom: 0, left: 0, right: 0,
                                       height: i === 2 ? '100%' : '72%',
                                       background: i === 2 ? 'var(--primary-container)' : 'var(--primary)',
                                       borderRadius: '0.75rem',
                                    }} />
                                    {i === 2 && (
                                       <div style={{
                                          position: 'absolute', top: -24, left: '50%', transform: 'translateX(-50%)',
                                          fontSize: '0.65rem', fontWeight: 900, color: 'var(--primary)',
                                          letterSpacing: '0.1em',
                                       }}>PEAK</div>
                                    )}
                                 </div>
                              ))}
                           </div>

                           <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
                              {['08:00', '12:00', '16:00', '20:00'].map(t => (
                                 <span key={t} style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--secondary)', opacity: 0.5 }}>{t}</span>
                              ))}
                           </div>
                        </div>

                        {/* Floating performance card */}
                        <div className="glass-panel editorial-shadow" style={{
                           position: 'absolute', bottom: -32, right: -24,
                           padding: '2rem', borderRadius: '1.5rem',
                           border: '1px solid rgba(210,197,171,0.2)',
                           maxWidth: 280, zIndex: 2,
                        }}>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                              <BoltIcon />
                              <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>System Performance</span>
                           </div>
                           <p style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)', lineHeight: 1.6, marginBottom: '1rem' }}>
                              The core engine is currently processing 14k events per second with zero latency degradation.
                           </p>
                           <div style={{ display: 'flex' }}>
                              {[1, 2, 3].map(i => (
                                 <div key={i} style={{
                                    width: 32, height: 32, borderRadius: '50%',
                                    background: `hsl(0 0% ${50 + i * 8}%)`,
                                    border: '2px solid var(--surface)',
                                    marginLeft: i > 1 ? -10 : 0,
                                 }} />
                              ))}
                              <div style={{
                                 width: 32, height: 32, borderRadius: '50%',
                                 background: 'var(--primary-container)', border: '2px solid var(--surface)',
                                 marginLeft: -10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                 fontSize: '0.6rem', fontWeight: 700, color: 'var(--on-primary-fixed)',
                              }}>+12</div>
                           </div>
                        </div>
                     </div>
                  </div>
               </section>

               {/* ── Final CTA ──────────────────────────────────────────────────── */}
               <section id="pricing" style={{ padding: '8rem 2rem' }}>
                  <div style={{ maxWidth: 1440, margin: '0 auto' }}>
                     <div className="fade-up" style={{
                        background: 'var(--inverse-surface)', borderRadius: '4rem',
                        padding: 'clamp(3rem, 8vw, 8rem)', position: 'relative',
                        overflow: 'hidden', textAlign: 'center',
                     }}>
                        {/* Abstract circles */}
                        {[800, 600, 400].map(size => (
                           <div key={size} style={{
                              position: 'absolute', top: '50%', left: '50%',
                              transform: 'translate(-50%, -50%)',
                              width: size, height: size, borderRadius: '50%',
                              border: '1px solid rgba(251,248,252,0.08)',
                              pointerEvents: 'none',
                           }} />
                        ))}

                        <div style={{ position: 'relative', zIndex: 2, maxWidth: 700, margin: '0 auto' }}>
                           <h2 className="font-headline" style={{
                              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                              fontWeight: 800, letterSpacing: '-0.04em',
                              color: 'var(--surface)', marginBottom: '2rem',
                           }}>
                              Ready to Elevate Your Institution?
                           </h2>
                           <p style={{ color: 'var(--surface-variant)', fontSize: '1.2rem', marginBottom: '3rem', opacity: 0.8, lineHeight: 1.6 }}>
                              Join over 400 world-class universities using Academia.ID to curate their daily presence.
                           </p>
                           <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                              <PrimaryButton large onClick={goRegister}>Request Access</PrimaryButton>
                              <OutlineButton large light onClick={goRegister}>Contact Sales</OutlineButton>
                           </div>
                        </div>
                     </div>
                  </div>
               </section>
            </main>

            {/* ── Footer ───────────────────────────────────────────────────────── */}
            <footer style={{
               background: 'var(--surface-bright)',
               borderTop: '1px solid rgba(210,197,171,0.18)',
               padding: '3rem 2rem',
            }}>
               <div style={{
                  maxWidth: 1440, margin: '0 auto',
                  display: 'flex', flexWrap: 'wrap',
                  justifyContent: 'space-between', alignItems: 'center', gap: '2rem',
               }}>
                  <div>
                     <div className="font-headline" style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.35rem', color: 'var(--on-surface)' }}>
                        Academia.ID
                     </div>
                     <p style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>
                        © {new Date().getFullYear()} Academia.ID Editorial Systems. All rights reserved.
                     </p>
                  </div>

                  <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                     {['Privacy Policy', 'Terms of Service', 'Security', 'Contact'].map(link => (
                        <a key={link} href="#" style={{
                           fontSize: '0.75rem', color: 'var(--secondary)',
                           textDecoration: 'none', transition: 'color 0.2s',
                        }}
                           onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary)')}
                           onMouseLeave={e => (e.currentTarget.style.color = 'var(--secondary)')}
                        >
                           {link}
                        </a>
                     ))}
                  </div>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                     {[<LanguageIcon key="lang" />, <ShareIcon key="share" />].map((icon, i) => (
                        <button key={i} style={{
                           background: 'none', border: 'none', cursor: 'pointer',
                           color: 'var(--secondary)', transition: 'color 0.2s',
                           display: 'flex', alignItems: 'center',
                        }}
                           onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary)')}
                           onMouseLeave={e => (e.currentTarget.style.color = 'var(--secondary)')}
                        >
                           {icon}
                        </button>
                     ))}
                  </div>
               </div>
            </footer>
         </div>
      </>
   );
};

export default LandingPage;