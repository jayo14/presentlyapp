import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// ─── Inline SVG Icons ─────────────────────────────────────────────────────────

const ArrowForwardIcon = () => (
   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
   </svg>
);

const VerifiedIcon = () => (
   <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#241a00' }}>
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

const BellIcon = () => (
   <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#5f5e61' }}>
      <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
   </svg>
);

const BellIconSmall = () => (
   <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#5f5e61' }}>
      <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
   </svg>
);

const BoltIcon = () => (
   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#755b00' }}>
      <path d="M7 2v11h3v9l7-12h-4l4-8z" />
   </svg>
);

const QuoteIcon = () => (
   <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#ffca0d' }}>
      <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
   </svg>
);

const CheckIcon = () => (
   <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#755b00' }}>
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
   </svg>
);

const QrIcon = () => (
   <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#755b00' }}>
      <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zm8-2v8h8V3h-8zm6 6h-4V5h4v4zM3 21h8v-8H3v8zm2-6h4v4H5v-4zm13 0h-2v2h2v2h-2v2h2v-2h2v2h2v-2h-2v-2h2v-2h-4zm2-2h2v2h-2v-2zm-4 0h2v2h-2v-2z" />
   </svg>
);

const HistoryIcon = () => (
   <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#755b00' }}>
      <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" />
   </svg>
);

const AppleIcon = () => (
   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
   </svg>
);

const PlayIcon = () => (
   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 20.5v-17c0-.83.94-1.3 1.6-.8l14 8.5c.6.36.6 1.24 0 1.6l-14 8.5c-.66.5-1.6.03-1.6-.8z" />
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

// ─── Global Styles ────────────────────────────────────────────────────────────

const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,700;1,800&family=Inter:wght@400;500;600&display=swap');

  :root {
    --primary:                  #755b00;
    --primary-container:        #ffca0d;
    --primary-fixed:            #ffdf90;
    --primary-fixed-dim:        #f3c000;
    --on-primary-fixed:         #241a00;
    --secondary:                #5f5e61;
    --secondary-fixed-dim:      #c8c6c9;
    --surface:                  #fbf8fc;
    --surface-bright:           #fbf8fc;
    --surface-container:        #f0edf1;
    --surface-container-low:    #f5f3f6;
    --surface-container-lowest: #ffffff;
    --surface-container-high:   #eae7eb;
    --surface-container-highest:#e4e1e5;
    --surface-variant:          #e4e1e5;
    --on-surface:               #1b1b1e;
    --on-surface-variant:       #4e4632;
    --background:               #fbf8fc;
    --outline-variant:          #d2c5ab;
    --error:                    #ba1a1a;
    --inverse-surface:          #303033;
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
    background: rgba(255,255,255,0.82);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }
  .editorial-shadow { box-shadow: 0 12px 32px rgba(27,27,30,0.07); }
  .hover-lift { transition: transform 0.4s ease, box-shadow 0.4s ease; }
  .hover-lift:hover { transform: translateY(-8px); box-shadow: 0 24px 56px rgba(27,27,30,0.11); }

  /* Hero card tilt */
  .hero-card { transition: transform 0.7s cubic-bezier(0.23,1,0.32,1); transform: rotate(3deg); }
  .hero-card:hover { transform: rotate(0deg); }

  /* Testimonial card hover */
  .testimonial-card { transition: transform 0.5s ease; }
  .testimonial-card:hover { transform: translateY(-8px); }

  /* Orb pulse */
  @keyframes pulse-orb {
    0%,100% { opacity:0.08; transform:scale(1); }
    50%      { opacity:0.15; transform:scale(1.08); }
  }
  .orb-animate { animation: pulse-orb 6s ease-in-out infinite; }

  /* Bar rise */
  @keyframes bar-rise { from { transform:scaleY(0); } to { transform:scaleY(1); } }
  .bar-animate { transform-origin:bottom; animation:bar-rise 1s cubic-bezier(0.23,1,0.32,1) both; }
  .bar-animate:nth-child(1){animation-delay:0.1s}
  .bar-animate:nth-child(2){animation-delay:0.2s}
  .bar-animate:nth-child(3){animation-delay:0.3s}
  .bar-animate:nth-child(4){animation-delay:0.4s}
  .bar-animate:nth-child(5){animation-delay:0.5s}
  .bar-animate:nth-child(6){animation-delay:0.6s}

  /* Progress fill */
  @keyframes fill-bar { from { width: 0; } }
  .fill-88 { animation: fill-bar 1.2s 0.3s cubic-bezier(0.23,1,0.32,1) both; width:88%; }
  .fill-65 { animation: fill-bar 1.2s 0.5s cubic-bezier(0.23,1,0.32,1) both; width:65%; }

  /* Status dot */
  @keyframes status-pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
  .status-dot { animation: status-pulse 2s ease-in-out infinite; }

  /* Scroll fade-up */
  .fade-up {
    opacity:0;
    transform:translateY(32px);
    transition:opacity 0.7s ease, transform 0.7s ease;
  }
  .fade-up.visible { opacity:1; transform:translateY(0); }
  .fade-up:nth-child(2){transition-delay:0.1s}
  .fade-up:nth-child(3){transition-delay:0.2s}
  .fade-up:nth-child(4){transition-delay:0.3s}

  /* Responsive helpers */
  @media (max-width: 767px) {
    .mobile-hide { display:none !important; }
  }
`;

function useFadeOnScroll() {
   React.useEffect(() => {
      const els = document.querySelectorAll('.fade-up');
      const io = new IntersectionObserver(
         entries => entries.forEach(e => e.target.classList.toggle('visible', e.isIntersecting)),
         { threshold: 0.1 }
      );
      els.forEach(el => io.observe(el));
      return () => io.disconnect();
   }, []);
}

// ─── Reusable Buttons ─────────────────────────────────────────────────────────

const PrimaryBtn: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { large?: boolean }> = ({ children, large, style, ...props }) => (
   <button {...props} style={{
      background: 'var(--primary-container)', color: 'var(--on-primary-fixed)',
      border: 'none', borderRadius: large ? '0.875rem' : '0.75rem',
      padding: large ? '1.1rem 2.5rem' : '0.65rem 1.5rem',
      fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700,
      fontSize: large ? '1.1rem' : '0.875rem', cursor: 'pointer',
      display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
      transition: 'opacity 0.2s, transform 0.15s', ...style,
   }}
      onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
      onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
      onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.97)')}
      onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
   >{children}</button>
);

const OutlineBtn: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { large?: boolean; light?: boolean }> = ({ children, large, light, style, ...props }) => (
   <button {...props} style={{
      background: 'transparent',
      color: light ? 'var(--surface)' : 'var(--on-surface)',
      border: `2px solid ${light ? 'rgba(251,248,252,0.22)' : 'rgba(210,197,171,0.35)'}`,
      borderRadius: large ? '0.875rem' : '0.75rem',
      padding: large ? '1.1rem 2.5rem' : '0.65rem 1.5rem',
      fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700,
      fontSize: large ? '1.1rem' : '0.875rem', cursor: 'pointer',
      display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
      transition: 'background 0.2s', ...style,
   }}
      onMouseEnter={e => (e.currentTarget.style.background = light ? 'rgba(251,248,252,0.1)' : 'var(--surface-container-low)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
   >{children}</button>
);

const DarkBtn: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { large?: boolean }> = ({ children, large, style, ...props }) => (
   <button {...props} style={{
      background: 'var(--on-surface)', color: 'var(--surface)',
      border: 'none', borderRadius: large ? '0.875rem' : '0.75rem',
      padding: large ? '1rem 2rem' : '0.65rem 1.5rem',
      fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700,
      fontSize: large ? '1rem' : '0.875rem', cursor: 'pointer',
      display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
      transition: 'opacity 0.2s', ...style,
   }}
      onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
      onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
   >{children}</button>
);

// ─── Component ────────────────────────────────────────────────────────────────

export const LandingPage: React.FC = () => {
   const navigate = useNavigate();
   useFadeOnScroll();

   const goRegister = () => navigate('/auth/register');
   const goLogin = () => navigate('/auth/login');

   const testimonials = [
      {
         quote: '"The level of precision Academia.ID provides has completely transformed our faculty oversight. It\'s not just a tool; it\'s an editorial standard for data."',
         name: 'Dr. Alistair Thorne', role: 'Dean of Sciences, Oakhaven',
         img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA9COqM4fJRsMreUnVWeh12TR5PdxZdzG1I9fC6lFkKmkjk5_VCGgj2TzHp2Iazhal4OWk9nKEpCPLlrE-2rh_hW_a3uJgTpQrQSxu2w8K6FZmDQfj56CAYV8oJajR1hehYzwyhkLTxXQN5mrPfv27TeJfeq1sRoU4RdpmL_qO-91MfxFC_koJNIamvXbkodHlBGL8DCKouB9PHtB2_wPZrTbHEsBtKOJLAqMaRMWB0GQz0CvOn5ozoEzfPfGLw-n-GWXLC-4mKSdo',
      },
      {
         quote: '"Finally, a system that respects the sophistication of modern administrative needs. The real-time visual analytics are simply unparalleled."',
         name: 'Marcus Vane', role: "Registrar, St. Jude's",
         img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDto_i1wsGaAj6EdsEnBX_Kmgk-ZpJ7jv3fAkqmPvruCetikQTfZXaNtvX5YCvb4ukLcoW2xLjWarhnVBsXTaNAF1zLGHvlyXVnOwKHLp0USyjJtKm-NCPjZ9ShyUxTD16La9m5xD4pqS_oNM7iJ8ro8jGVXx6UbdvtaGsPATON6bLgbQ9oh09apBYh0nNK_EBtVap8YahyY-0XFMUw0Wa9vuSt5JsrawEp3e0Oej_QCwJG7YBuOemCGR7K5RhhEYtpnMYn2mIq-0g',
      },
      {
         quote: '"Integration was seamless. Our staff loves the mobile app companion, and the accuracy of the biometric sync is truly world-class."',
         name: 'Sarah Jenkins', role: 'COO, Global Academy',
         img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAj4c7d2--Y4NdiBDRXmMLJSwdxbKvJwC-eYht_x_5GUncR_KcPnLyKHyMq2aaQzVHyH05UIWPQpntoQcmJbsOU3TXHQsHwL7Jkm5yOVjvzwfjbmsMPg_T0AY3MRiD0yM_UM3SDMeYVzuDx3xEofVj91Bj2TMa1f88ub8nfoSE5D8vI_9GL6Gk5m1m1fcJPVuO3dHZCyfGJy8mXw-O98XWWPrfrB_X-cke8AY_MkX6SWjSoHUrnbFG-6ad0oBypOTx9oNbtVJplh5s',
      },
   ];

   const performanceAvatars = [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA69CK06yBXhX-9zvZDOSe-r9kxYPijksP_9HwS946RH-VFtx20ZuslvOrjUpvVXTUb4TBEu14SAqBnS37z7Y7aJT4Rn5Uml39f9IVcmJ-MmAO-sAhWKvkJfv4ftJ6hkQjwdPqNj4qM7WmdWz5HAwOWAZKPIl9jRad6tQDZ3UstJ5S2W63IlaPEeqUFQvKrUApF9rYtFIO0f0sl1oTM2xDrvPQfS3s9FXAsDTzeIyyDpALwxrWKvV2129ttVKYPOzb1s1fur6bAY10',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCju0PTXJpKR8npJOvITxZcT7JKcQq5nBWe94L3MOfqpcd_7ElhHE1JTBoagdsd7Wp68asXcN0c_A3cy6qo_Ngb4832OC7EpE_YAToOF5vWjdCMpmDslOwI1EP4fQAob6PGfl-v6-0SvTYDYcc_5rxrWPrlYQwI8xUmY_VjkIg0jVSkkxnJFrZZwmHYBVnkbDPFCU4Xiid6J7MNsI3EnEmTB9F0sZWBF-PuQJcxBJS60WrBLvBYT6ELVJiV-TP5rbqbMzz7z1AidCQ',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCLS-w3Q67dG_LhvX6Kk69SdgRSLSH_r0OExsM_PkKYYsKEpJXXybMuEih5fQZ6ihDMKzjPNi-c3h2UdhE1DSEhimKtiEaxolywmTUD3WZsHxANqxTZEQ0aBql8Ay9WcZvGiwNe9rAH_WOGSBkqoiq-_TOEegNDuEKFK5lkf6Crzqs5JcO6YkUXRdKE5lxLZ1NLHAnubC-3rdAHb1vBe7PjyglTGHLsFmApOXosApB0dFrqi4UdgDbgEmGEm5PNxCGbHVdrAjLgvio',
   ];

   return (
      <>
         <style>{GLOBAL_STYLES}</style>
         <div style={{ background: 'var(--background)', minHeight: '100vh', overflowX: 'hidden' }}>

            {/* ── NAV ──────────────────────────────────────────────────────────── */}
            <nav style={{
               position: 'fixed', top: 0, width: '100%', zIndex: 50,
               background: 'rgba(251,248,252,0.84)',
               backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
               borderBottom: '1px solid rgba(210,197,171,0.12)',
            }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 1440, margin: '0 auto', padding: '1rem 2rem' }}>
                  <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '1.4rem', letterSpacing: '-0.04em', color: 'var(--on-surface)' }}>
                     Academia.ID
                  </button>
                  <div className="mobile-hide" style={{ display: 'flex', gap: '2rem' }}>
                     {[
                        { label: 'Platform', href: '#platform', active: true },
                        { label: 'Solutions', href: '#solutions' },
                        { label: 'Resources', href: '#resources' },
                        { label: 'Pricing', href: '#pricing' },
                     ].map(({ label, href, active }) => (
                        <a key={label} href={href} style={{
                           fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: '0.875rem',
                           textDecoration: 'none', color: active ? 'var(--primary)' : 'var(--secondary)',
                           borderBottom: active ? '2px solid var(--primary-container)' : '2px solid transparent',
                           paddingBottom: active ? 4 : 0, transition: 'color 0.2s',
                        }}>{label}</a>
                     ))}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                     <button onClick={goLogin} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', color: 'var(--on-surface-variant)' }}>Sign In</button>
                     <PrimaryBtn onClick={goRegister}>Get Started</PrimaryBtn>
                  </div>
               </div>
            </nav>

            <main style={{ paddingTop: '5.5rem' }}>

               {/* ── HERO ─────────────────────────────────────────────────────── */}
               <section id="platform" style={{ position: 'relative', padding: '5rem 2rem 7rem', maxWidth: 1440, margin: '0 auto', overflow: 'visible' }}>
                  <div className="orb-animate" style={{ position: 'absolute', top: '5%', right: '3%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, var(--primary-container), transparent 68%)', pointerEvents: 'none', zIndex: 0 }} />

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12,1fr)', gap: '2rem', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                     {/* Copy */}
                     <div style={{ gridColumn: 'span 7' }}>
                        <span style={{ display: 'inline-block', padding: '0.375rem 1rem', borderRadius: 999, background: 'var(--surface-container-low)', color: 'var(--primary)', fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
                           The Precision Curator
                        </span>
                        <h1 className="font-headline" style={{ fontSize: 'clamp(3rem,7vw,5.5rem)', lineHeight: 1.05, fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--on-surface)', marginBottom: '2rem' }}>
                           Attendance, <br />
                           <em style={{ color: 'var(--primary)', fontStyle: 'italic' }}>Reinvented.</em>
                        </h1>
                        <p style={{ fontSize: '1.2rem', color: 'var(--on-surface-variant)', maxWidth: 520, marginBottom: '2.5rem', lineHeight: 1.65 }}>
                           A high-end editorial approach to institutional oversight. Manage attendance with the precision of a curator and the speed of light.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                           <PrimaryBtn large onClick={goRegister}>Deploy Now <ArrowForwardIcon /></PrimaryBtn>
                           <OutlineBtn large onClick={() => document.getElementById('solutions')?.scrollIntoView({ behavior: 'smooth' })}>View Demo</OutlineBtn>
                        </div>
                     </div>

                     {/* Hero card */}
                     <div style={{ gridColumn: 'span 5', position: 'relative' }}>
                        <div style={{ position: 'relative', width: '100%', aspectRatio: '1' }}>
                           <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'radial-gradient(circle, var(--primary-container), transparent 70%)', opacity: 0.12, filter: 'blur(40px)' }} />
                           <div className="hero-card glass-panel editorial-shadow" style={{ borderRadius: '2rem', padding: '2rem', border: '1px solid rgba(210,197,171,0.15)', position: 'relative', zIndex: 2 }}>
                              {/* Dots */}
                              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '2.5rem' }}>
                                 {['var(--error)', 'var(--primary)', 'var(--secondary-fixed-dim)'].map((c, i) => (
                                    <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />
                                 ))}
                                 <span style={{ marginLeft: 'auto', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--secondary)' }}>Live Insights</span>
                              </div>
                              {/* Bars */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                 <div style={{ height: 14, width: '75%', borderRadius: 999, background: 'var(--surface-container-high)', overflow: 'hidden' }}>
                                    <div className="fill-88" style={{ height: '100%', background: 'var(--primary)', borderRadius: 999 }} />
                                 </div>
                                 <div style={{ height: 14, width: '50%', borderRadius: 999, background: 'var(--surface-container-high)', overflow: 'hidden' }}>
                                    <div className="fill-65" style={{ height: '100%', background: 'var(--primary-fixed-dim)', borderRadius: 999 }} />
                                 </div>
                                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', paddingTop: '1rem' }}>
                                    {[{ label: 'Total Active', val: '1,284', color: 'var(--on-surface)' }, { label: 'Engagement', val: '94.2%', color: 'var(--primary)' }].map(({ label, val, color }) => (
                                       <div key={label} style={{ background: 'var(--surface-container-low)', padding: '1rem', borderRadius: '0.75rem' }}>
                                          <p style={{ fontSize: '0.7rem', color: 'var(--secondary)', marginBottom: '0.25rem' }}>{label}</p>
                                          <p className="font-headline" style={{ fontSize: '1.5rem', fontWeight: 900, color }}>{val}</p>
                                       </div>
                                    ))}
                                 </div>
                              </div>
                              {/* Check-in */}
                              <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid rgba(210,197,171,0.15)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                 <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAp80PUDnj3WkE6G7govkSd_QK_PozZ20PeFFf_VYfiKSaT9Mf5z4I-iaCOP8H1G082lDszfVTGjvJKc6Y_FPyghHTliJt_sMA6asMyRbyUYx6DhnH2jQ8sGpK9gG8tdN3WB73riW2_NTxabe0J6_L8vayKlmkAX2im696D5jiMvf3MV-SoWj-rmJDq-Wly2paWUgvZ51KfS39pE9s6-JlnxPA504kNiZWHWEaF7frK6_YRqGvhF11m546upKIWGyL_iAtWnFoahv0"
                                    alt="Julian" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                 <div>
                                    <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--on-surface)' }}>Julian Alexander</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>Verified Check-in · 2m ago</p>
                                 </div>
                              </div>
                           </div>
                           {/* Spillover badge */}
                           <div className="glass-panel editorial-shadow mobile-hide" style={{ position: 'absolute', bottom: -32, left: -32, padding: '1.25rem 1.5rem', borderRadius: '1.25rem', border: '1px solid rgba(210,197,171,0.18)', display: 'flex', alignItems: 'center', gap: '1rem', zIndex: 3 }}>
                              <div style={{ width: 48, height: 48, borderRadius: '0.75rem', background: 'var(--primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><VerifiedIcon /></div>
                              <div>
                                 <p style={{ fontSize: '0.875rem', fontWeight: 700 }}>Accuracy Rank</p>
                                 <p className="font-headline" style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--primary)' }}>Global #1</p>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </section>

               {/* ── BENTO ────────────────────────────────────────────────────── */}
               <section id="solutions" style={{ background: 'var(--surface-container-low)', padding: '8rem 2rem' }}>
                  <div style={{ maxWidth: 1440, margin: '0 auto' }}>
                     <div className="fade-up" style={{ marginBottom: '5rem' }}>
                        <h2 className="font-headline" style={{ fontSize: 'clamp(2rem,4vw,3.25rem)', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--on-surface)', marginBottom: '1rem' }}>
                           Refined Control.<br />Sophisticated Oversight.
                        </h2>
                        <p style={{ color: 'var(--on-surface-variant)', maxWidth: 600, fontSize: '1.1rem', lineHeight: 1.65 }}>
                           We don't just count heads; we provide the narrative behind the numbers through high-performance data architecture.
                        </p>
                     </div>
                     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12,1fr)', gap: '2rem' }}>
                        {/* Analytics */}
                        <div className="fade-up hover-lift" style={{ gridColumn: 'span 8', background: 'var(--surface-container-lowest)', padding: '2.5rem', borderRadius: '2rem', border: '1px solid rgba(210,197,171,0.12)', height: 480, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                           <div style={{ position: 'relative', zIndex: 2 }}>
                              <div style={{ marginBottom: '1.5rem' }}><AnalyticsIcon /></div>
                              <h3 className="font-headline" style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--on-surface)' }}>Real-time Visual Analytics</h3>
                              <p style={{ color: 'var(--on-surface-variant)', maxWidth: 380 }}>Every check-in is processed instantly, feeding into a global heat map of your institution's daily flow.</p>
                           </div>
                           <DarkBtn>Explore Analytics</DarkBtn>
                           <div style={{ position: 'absolute', top: 0, right: 0, width: '45%', height: '100%', opacity: 0.07, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                              <div style={{ width: '100%', aspectRatio: '1', border: '40px solid var(--primary)', borderRadius: '50%' }} />
                           </div>
                           <div style={{ position: 'absolute', bottom: 32, right: 32, background: 'var(--surface-container-low)', borderRadius: '1rem', padding: '1.25rem', width: 220, transform: 'translateY(5rem) rotate(12deg)', boxShadow: '0 12px 32px rgba(27,27,30,0.08)' }}>
                              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: 96 }}>
                                 {[40, 80, 60, 100].map((h, i) => (
                                    <div key={i} className="bar-animate" style={{ flex: 1, height: `${h}%`, borderRadius: '4px 4px 0 0', background: i % 2 === 1 ? 'var(--primary)' : 'var(--primary-fixed)' }} />
                                 ))}
                              </div>
                              <p style={{ textAlign: 'center', fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: '0.75rem', color: 'var(--secondary)' }}>Weekly Peak</p>
                           </div>
                        </div>
                        {/* Biometric */}
                        <div className="fade-up hover-lift" style={{ gridColumn: 'span 4', background: 'var(--primary)', padding: '2.5rem', borderRadius: '2rem', height: 480, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                           <div>
                              <div style={{ marginBottom: '1.5rem' }}><LockIcon /></div>
                              <h3 className="font-headline" style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.75rem', color: 'white' }}>Biometric Fidelity</h3>
                              <p style={{ color: 'var(--primary-fixed)', opacity: 0.9, lineHeight: 1.6 }}>Hardware-grade security protocols ensuring every attendance record is immutable and verified.</p>
                           </div>
                           <div style={{ paddingTop: '2rem', marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
                              <p className="font-headline" style={{ fontSize: '3rem', fontWeight: 900, color: 'white', marginBottom: '0.25rem' }}>99.9%</p>
                              <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'white', opacity: 0.75 }}>Verification Accuracy</p>
                           </div>
                        </div>
                        {/* Tertiary */}
                        {[
                           { icon: <CloudIcon />, title: 'Cloud-Native Sync', desc: "Offline first architecture that syncs the moment you're back online." },
                           { icon: <GroupIcon />, title: 'Automated Rosters', desc: 'Import your entire database in seconds with AI-powered mapping.' },
                           { icon: <BellIcon />, title: 'Smart Alerts', desc: 'Notify staff or parents instantly based on customizable triggers.' },
                        ].map(({ icon, title, desc }) => (
                           <div key={title} className="fade-up hover-lift" style={{ gridColumn: 'span 4', background: 'var(--surface-container-lowest)', padding: '2rem', borderRadius: '2rem', border: '1px solid rgba(210,197,171,0.12)' }}>
                              <div style={{ marginBottom: '1rem' }}>{icon}</div>
                              <h4 className="font-headline" style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--on-surface)' }}>{title}</h4>
                              <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem', lineHeight: 1.6 }}>{desc}</p>
                           </div>
                        ))}
                     </div>
                  </div>
               </section>

               {/* ── ENGINE ROOM ──────────────────────────────────────────────── */}
               <section id="resources" style={{ padding: '8rem 2rem', maxWidth: 1440, margin: '0 auto', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '5rem' }}>
                     <div style={{ flex: '1 1 400px' }}>
                        <h2 className="font-headline fade-up" style={{ fontSize: 'clamp(2.25rem,5vw,4rem)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1, color: 'var(--on-surface)', marginBottom: '3rem' }}>
                           The Engine Room of <span style={{ color: 'var(--primary)' }}>Engagement.</span>
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                           {[
                              { num: '01', title: 'Intelligent Scheduling', desc: 'Our engine predicts attendance trends based on historical data, allowing you to optimize staff allocation.' },
                              { num: '02', title: 'Automated Compliance', desc: 'Stay audit-ready with automated reporting that meets the highest regulatory standards.' },
                           ].map(({ num, title, desc }) => (
                              <div key={num} className="fade-up" style={{ display: 'flex', gap: '1.5rem' }}>
                                 <div style={{ flexShrink: 0, width: 48, height: 48, borderRadius: '50%', background: 'var(--surface-container-high)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span className="font-headline" style={{ fontWeight: 700, color: 'var(--primary)' }}>{num}</span>
                                 </div>
                                 <div>
                                    <h4 className="font-headline" style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--on-surface)' }}>{title}</h4>
                                    <p style={{ color: 'var(--on-surface-variant)', lineHeight: 1.65 }}>{desc}</p>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>

                     <div style={{ flex: '1 1 400px', position: 'relative' }}>
                        <div className="fade-up" style={{ background: 'var(--surface-container-low)', borderRadius: '3rem', padding: '3rem', border: '1px solid rgba(210,197,171,0.12)' }}>
                           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                              <div>
                                 <h5 className="font-headline" style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--on-surface)' }}>Daily Volume</h5>
                                 <p style={{ fontSize: '0.875rem', color: 'var(--secondary)' }}>Week 42 · Faculty of Science</p>
                              </div>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                 {[{ label: 'LIVE', bg: 'var(--primary-container)', color: 'var(--on-primary-fixed)' }, { label: 'REPORT', bg: 'var(--surface-container-highest)', color: 'var(--on-surface)' }].map(({ label, bg, color }) => (
                                    <span key={label} style={{ background: bg, color, padding: '0.25rem 0.75rem', borderRadius: 999, fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em' }}>{label}</span>
                                 ))}
                              </div>
                           </div>
                           <div style={{ position: 'relative', height: 224, display: 'flex', alignItems: 'flex-end', gap: '0.75rem' }}>
                              {[30, 50, 80, 60, 40, 70].map((h, i) => (
                                 <div key={i} style={{ flex: 1, height: `${h}%`, background: 'var(--surface-container-high)', borderRadius: '0.75rem', position: 'relative', overflow: 'visible' }}>
                                    <div className="bar-animate" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: i === 2 ? '100%' : '72%', background: i === 2 ? 'var(--primary-container)' : 'var(--primary)', borderRadius: '0.75rem' }} />
                                    {i === 2 && <span style={{ position: 'absolute', top: -28, left: '50%', transform: 'translateX(-50%)', fontSize: '0.65rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '0.1em' }}>PEAK</span>}
                                 </div>
                              ))}
                           </div>
                           <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
                              {['08:00', '12:00', '16:00', '20:00'].map(t => (
                                 <span key={t} style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--secondary)', opacity: 0.5 }}>{t}</span>
                              ))}
                           </div>
                        </div>
                        {/* Floating card */}
                        <div className="glass-panel editorial-shadow mobile-hide" style={{ position: 'absolute', bottom: -32, right: -24, padding: '2rem', borderRadius: '1.5rem', border: '1px solid rgba(210,197,171,0.2)', maxWidth: 280, zIndex: 2 }}>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                              <BoltIcon /><span style={{ fontWeight: 700, fontSize: '0.875rem' }}>System Performance</span>
                           </div>
                           <p style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)', lineHeight: 1.6, marginBottom: '1rem' }}>
                              The core engine is currently processing 14k events per second with zero latency degradation.
                           </p>
                           <div style={{ display: 'flex' }}>
                              {performanceAvatars.map((src, i) => (
                                 <img key={i} src={src} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--surface)', marginLeft: i > 0 ? -10 : 0 }} onError={e => { (e.target as HTMLImageElement).style.background = '#ccc'; }} />
                              ))}
                              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary-container)', border: '2px solid var(--surface)', marginLeft: -10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 700, color: 'var(--on-primary-fixed)' }}>+12</div>
                           </div>
                        </div>
                     </div>
                  </div>
               </section>

               {/* ── TESTIMONIALS ─────────────────────────────────────────────── */}
               <section style={{ background: 'var(--surface)', padding: '8rem 2rem', borderTop: '1px solid rgba(210,197,171,0.12)' }}>
                  <div style={{ maxWidth: 1440, margin: '0 auto' }}>
                     <div className="fade-up" style={{ textAlign: 'center', marginBottom: '5rem' }}>
                        <span style={{ display: 'block', color: 'var(--primary)', fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem' }}>
                           Institutional Trust
                        </span>
                        <h2 className="font-headline" style={{ fontSize: 'clamp(2rem,4vw,3.25rem)', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--on-surface)' }}>
                           Trusted by Leading Institutions
                        </h2>
                     </div>
                     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                        {testimonials.map(({ quote, name, role, img }) => (
                           <div key={name} className="fade-up testimonial-card editorial-shadow" style={{ background: 'var(--surface-container-low)', padding: '2.5rem', borderRadius: '1.5rem', border: '1px solid rgba(210,197,171,0.12)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '2.5rem' }}>
                              <div>
                                 <div style={{ marginBottom: '2rem' }}><QuoteIcon /></div>
                                 <p style={{ fontSize: '1.05rem', color: 'var(--on-surface)', lineHeight: 1.7, fontStyle: 'italic', fontWeight: 500 }}>{quote}</p>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                 <img src={img} alt={name} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', filter: 'grayscale(1)', transition: 'filter 0.5s' }}
                                    onMouseEnter={e => ((e.target as HTMLImageElement).style.filter = 'grayscale(0)')}
                                    onMouseLeave={e => ((e.target as HTMLImageElement).style.filter = 'grayscale(1)')}
                                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                 <div>
                                    <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--on-surface)' }}>{name}</p>
                                    <p style={{ fontSize: '0.7rem', color: 'var(--secondary)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{role}</p>
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </section>

               {/* ── MOBILE APP ───────────────────────────────────────────────── */}
               <section style={{ padding: '8rem 2rem', background: 'var(--surface-container-lowest)', overflow: 'hidden' }}>
                  <div style={{ maxWidth: 1440, margin: '0 auto' }}>
                     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px,1fr))', gap: '5rem', alignItems: 'center' }}>

                        {/* Phone */}
                        <div className="fade-up" style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
                           <div style={{ position: 'absolute', top: -40, right: -40, width: 256, height: 256, background: 'rgba(117,91,0,0.05)', borderRadius: '50%', filter: 'blur(40px)', zIndex: 0 }} />
                           <div style={{ position: 'absolute', bottom: -40, left: -40, width: 320, height: 320, background: 'rgba(255,202,13,0.08)', borderRadius: '50%', filter: 'blur(40px)', zIndex: 0 }} />

                           {/* Shell */}
                           <div style={{ position: 'relative', width: 300, height: 600, zIndex: 1, background: 'var(--on-surface)', borderRadius: '3rem', padding: '1rem', border: '8px solid var(--surface-container-highest)', boxShadow: '0 32px 80px rgba(27,27,30,0.22)', overflow: 'hidden' }}>
                              {/* Dynamic island */}
                              <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 128, height: 24, background: 'var(--on-surface)', borderRadius: '0 0 1.5rem 1.5rem', zIndex: 20 }} />
                              {/* Screen */}
                              <div style={{ background: 'var(--background)', height: '100%', borderRadius: '2rem', overflow: 'hidden', position: 'relative' }}>
                                 <div style={{ padding: '1.5rem', paddingTop: '2.5rem' }}>
                                    {/* Top bar */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                       <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary-container)' }} />
                                       <BellIconSmall />
                                    </div>
                                    <h4 className="font-headline" style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '1.5rem', color: 'var(--on-surface)' }}>Welcome, Julian</h4>
                                    {/* Status */}
                                    <div style={{ background: 'var(--surface-container-low)', borderRadius: '1rem', padding: '1rem', marginBottom: '1.5rem' }}>
                                       <p style={{ fontSize: '0.7rem', color: 'var(--secondary)', marginBottom: '0.35rem' }}>Current Status</p>
                                       <p style={{ fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                                          <span className="status-dot" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', display: 'inline-block' }} />
                                          Checked In: Science Hall A
                                       </p>
                                    </div>
                                    {/* Grid */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                       {[{ icon: <QrIcon />, label: 'Digital ID' }, { icon: <HistoryIcon />, label: 'History' }].map(({ icon, label }) => (
                                          <div key={label} style={{ background: 'var(--surface-container-high)', aspectRatio: '1', borderRadius: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                             {icon}
                                             <span style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
                                          </div>
                                       ))}
                                    </div>
                                 </div>
                                 {/* Bottom CTA */}
                                 <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.5rem', background: 'linear-gradient(to top, var(--background) 70%, transparent)' }}>
                                    <button style={{ width: '100%', background: 'var(--on-surface)', color: 'var(--surface)', border: 'none', borderRadius: '0.75rem', padding: '1rem', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, cursor: 'pointer' }}>
                                       Quick Check-in
                                    </button>
                                 </div>
                              </div>
                           </div>
                        </div>

                        {/* Copy */}
                        <div className="fade-up">
                           <span style={{ display: 'inline-block', padding: '0.375rem 1rem', borderRadius: 999, background: 'rgba(255,202,13,0.12)', color: 'var(--primary)', fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
                              Mobile Companion
                           </span>
                           <h2 className="font-headline" style={{ fontSize: 'clamp(2.25rem,5vw,4rem)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1, color: 'var(--on-surface)', marginBottom: '2rem' }}>
                              Precision in <br /><em style={{ color: 'var(--primary)', fontStyle: 'italic' }}>Your Pocket.</em>
                           </h2>
                           <p style={{ fontSize: '1.1rem', color: 'var(--on-surface-variant)', maxWidth: 480, marginBottom: '3rem', lineHeight: 1.65 }}>
                              Stay connected to your institutional flow from anywhere. Our companion app brings verified attendance and real-time alerts to your mobile device.
                           </p>
                           <ul style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3rem', listStyle: 'none' }}>
                              {[
                                 { title: 'Real-time Check-in', desc: 'Seamless NFC or QR-based check-ins that sync in milliseconds.' },
                                 { title: 'Instant Notifications', desc: 'Critical alerts and presence updates delivered straight to your lock screen.' },
                                 { title: 'Secure Digital ID', desc: 'Hardware-backed biometric identity for immutable verification on the go.' },
                              ].map(({ title, desc }) => (
                                 <li key={title} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                    <div style={{ flexShrink: 0, width: 24, height: 24, borderRadius: '50%', background: 'rgba(117,91,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
                                       <CheckIcon />
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
                              <DarkBtn large style={{ borderRadius: '0.875rem', padding: '1rem 2rem' }}>
                                 <AppleIcon />
                                 <div style={{ textAlign: 'left' }}>
                                    <p style={{ fontSize: '0.6rem', textTransform: 'uppercase', fontWeight: 700, lineHeight: 1, marginBottom: 2 }}>Download on the</p>
                                    <p style={{ fontSize: '1rem', fontWeight: 700, lineHeight: 1 }}>App Store</p>
                                 </div>
                              </DarkBtn>
                              <DarkBtn large style={{ borderRadius: '0.875rem', padding: '1rem 2rem' }}>
                                 <PlayIcon />
                                 <div style={{ textAlign: 'left' }}>
                                    <p style={{ fontSize: '0.6rem', textTransform: 'uppercase', fontWeight: 700, lineHeight: 1, marginBottom: 2 }}>Get it on</p>
                                    <p style={{ fontSize: '1rem', fontWeight: 700, lineHeight: 1 }}>Google Play</p>
                                 </div>
                              </DarkBtn>
                           </div>
                        </div>
                     </div>
                  </div>
               </section>

               {/* ── FINAL CTA ─────────────────────────────────────────────────── */}
               <section id="pricing" style={{ padding: '8rem 2rem' }}>
                  <div style={{ maxWidth: 1440, margin: '0 auto' }}>
                     <div className="fade-up" style={{ background: 'var(--inverse-surface)', borderRadius: '4rem', padding: 'clamp(3rem,8vw,8rem)', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
                        {[800, 600, 400].map(size => (
                           <div key={size} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: size, height: size, borderRadius: '50%', border: '1px solid rgba(251,248,252,0.08)', pointerEvents: 'none' }} />
                        ))}
                        <div style={{ position: 'relative', zIndex: 2, maxWidth: 700, margin: '0 auto' }}>
                           <h2 className="font-headline" style={{ fontSize: 'clamp(2.5rem,6vw,4.5rem)', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--surface)', marginBottom: '2rem' }}>
                              Ready to Elevate Your Institution?
                           </h2>
                           <p style={{ color: 'var(--surface-variant)', fontSize: '1.2rem', marginBottom: '3rem', opacity: 0.8, lineHeight: 1.6 }}>
                              Join over 400 world-class universities using Academia.ID to curate their daily presence.
                           </p>
                           <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                              <PrimaryBtn large onClick={goRegister}>Request Access</PrimaryBtn>
                              <OutlineBtn large light onClick={goRegister}>Contact Sales</OutlineBtn>
                           </div>
                        </div>
                     </div>
                  </div>
               </section>
            </main>

            {/* ── FOOTER ────────────────────────────────────────────────────────── */}
            <footer style={{ background: 'var(--surface-bright)', borderTop: '1px solid rgba(210,197,171,0.18)', padding: '3rem 2rem' }}>
               <div style={{ maxWidth: 1440, margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '2rem' }}>
                  <div>
                     <div className="font-headline" style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.35rem', color: 'var(--on-surface)' }}>Academia.ID</div>
                     <p style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>© {new Date().getFullYear()} Academia.ID Editorial Systems. All rights reserved.</p>
                  </div>
                  <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                     {['Privacy Policy', 'Terms of Service', 'Security', 'Contact'].map(link => (
                        <a key={link} href="#" style={{ fontSize: '0.75rem', color: 'var(--secondary)', textDecoration: 'none', transition: 'color 0.2s' }}
                           onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary-container)')}
                           onMouseLeave={e => (e.currentTarget.style.color = 'var(--secondary)')}
                        >{link}</a>
                     ))}
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                     {([<LanguageIcon key="lang" />, <ShareIcon key="share" />] as React.ReactElement[]).map((icon, i) => (
                        <button key={i} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--secondary)', display: 'flex', alignItems: 'center', transition: 'color 0.2s' }}
                           onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary)')}
                           onMouseLeave={e => (e.currentTarget.style.color = 'var(--secondary)')}
                        >{icon}</button>
                     ))}
                  </div>
               </div>
            </footer>
         </div>
      </>
   );
};

export default LandingPage;