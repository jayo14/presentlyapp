import { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';

/**
 * PresentlyIllustration — Claymorphic 3-scene attendance animation
 *
 * Usage in LandingHero:
 *   import PresentlyIllustration from './PresentlyIllustration';
 *   <PresentlyIllustration />
 *
 * Tune hold durations (ms) per scene:
 */
const SCENE_DURATIONS = [3200, 3200, 3400];

const SCENE_LABELS = [
  'Scanning QR Code',
  'Confirming Identity',
  'Attendance Recorded',
];

const CONFETTI_COLORS = [
  '#f5c842', '#ffe98a', '#22d3a5',
  '#a78fff', '#ff7eb3', '#c98000',
  '#6effd4', '#f97316',
];

const RAY_COUNT = 12;

const rand = (a, b) => a + Math.random() * (b - a);
const randI = (a, b) => Math.floor(rand(a, b));

/* ─────────────────────────────────────────
   QR pattern — used inside phone & target
───────────────────────────────────────── */
function QRPattern({ tint = '#1a1033', bgFill = 'white', opacity = 1 }) {
  return (
    <svg width="60" height="60" viewBox="0 0 60 60" fill="none" style={{ opacity }} aria-hidden="true">
      <rect x="4" y="4" width="22" height="22" rx="3" fill={tint} />
      <rect x="7" y="7" width="16" height="16" rx="2" fill={bgFill} fillOpacity=".15" />
      <rect x="10" y="10" width="10" height="10" rx="1.5" fill={tint} />
      <rect x="34" y="4" width="22" height="22" rx="3" fill={tint} />
      <rect x="37" y="7" width="16" height="16" rx="2" fill={bgFill} fillOpacity=".15" />
      <rect x="40" y="10" width="10" height="10" rx="1.5" fill={tint} />
      <rect x="4" y="34" width="22" height="22" rx="3" fill={tint} />
      <rect x="7" y="37" width="16" height="16" rx="2" fill={bgFill} fillOpacity=".15" />
      <rect x="10" y="40" width="10" height="10" rx="1.5" fill={tint} />
      <rect x="34" y="34" width="5" height="5" rx="1" fill={tint} />
      <rect x="41" y="34" width="5" height="5" rx="1" fill={tint} />
      <rect x="48" y="34" width="8" height="5" rx="1" fill={tint} />
      <rect x="34" y="41" width="5" height="5" rx="1" fill={tint} />
      <rect x="41" y="41" width="12" height="5" rx="1" fill={tint} />
      <rect x="34" y="48" width="8" height="8" rx="1" fill={tint} />
      <rect x="48" y="48" width="8" height="8" rx="1" fill={tint} />
      <rect x="28" y="28" width="5" height="5" rx="1" fill={tint} />
    </svg>
  );
}

/* ─────────────────────────────────────────
   SVG avatar face
───────────────────────────────────────── */
function AvatarFace() {
  return (
    <svg width="68" height="68" viewBox="0 0 68 68" fill="none" aria-hidden="true">
      <rect width="68" height="68" fill="#c8a97e" />
      {/* shirt */}
      <ellipse cx="34" cy="76" rx="26" ry="20" fill="#7c5cfc" />
      {/* neck */}
      <rect x="28" y="47" width="12" height="14" rx="4" fill="#e8c49a" />
      {/* head */}
      <circle cx="34" cy="28" r="18" fill="#f0d0a8" />
      <ellipse cx="34" cy="30" rx="15" ry="14" fill="#f5dab8" />
      {/* cheeks */}
      <ellipse cx="22" cy="33" rx="4.5" ry="3" fill="#e8a87a" opacity=".5" />
      <ellipse cx="46" cy="33" rx="4.5" ry="3" fill="#e8a87a" opacity=".5" />
      {/* eye whites */}
      <ellipse cx="27" cy="28" rx="4.2" ry="4.2" fill="white" />
      <ellipse cx="41" cy="28" rx="4.2" ry="4.2" fill="white" />
      {/* irises */}
      <circle cx="27.5" cy="28.5" r="2.5" fill="#2e1a0e" />
      <circle cx="41.5" cy="28.5" r="2.5" fill="#2e1a0e" />
      {/* highlights */}
      <circle cx="28.5" cy="27.5" r="1" fill="white" opacity=".85" />
      <circle cx="42.5" cy="27.5" r="1" fill="white" opacity=".85" />
      {/* nose */}
      <ellipse cx="34" cy="34" rx="2" ry="1.4" fill="#c0845a" opacity=".45" />
      {/* smile */}
      <path d="M28 38 Q34 43 40 38" stroke="#a07050" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      {/* hair */}
      <path d="M16 27 Q16 9 34 9 Q52 9 52 27 Q50 13 34 13 Q18 13 16 27Z" fill="#3a2008" />
      {/* ears */}
      <ellipse cx="15.5" cy="29" rx="3.2" ry="4.2" fill="#e8c49a" />
      <ellipse cx="52.5" cy="29" rx="3.2" ry="4.2" fill="#e8c49a" />
    </svg>
  );
}

/* ─────────────────────────────────────────
   Scene 1 — QR Scan
───────────────────────────────────────── */
const Scene1 = memo(() => {
  return (
    <div className="pi-s1">
      <div className="pi-scan-group">
        {/* QR code target card (floats to the right) */}
        <div className="pi-qr-target">
          <QRPattern tint="#1a1033" bgFill="white" />
        </div>

        {/* Phone handset */}
        <div className="pi-phone">
          <div className="pi-phone-screen">
            <div className="pi-notch" />
            <div className="pi-app-bar">
              <span className="pi-app-name">Presently</span>
            </div>

            <div className="pi-screen-body">
              <div className="pi-vf">
                <div className="pi-vfc pi-vf-tl" />
                <div className="pi-vfc pi-vf-tr" />
                <div className="pi-vfc pi-vf-bl" />
                <div className="pi-vfc pi-vf-br" />
                {/* ghost QR shown in viewfinder */}
                <div className="pi-qr-ghost">
                  <QRPattern tint="#a78fff" bgFill="rgba(167,143,255,0.1)" opacity={0.55} />
                </div>
                {/* scanning laser beam */}
                <div className="pi-beam" />
              </div>
            </div>

            <div className="pi-status-bar">
              <div className="pi-sdot" />
              <div className="pi-sdot pi-sdot-on" />
              <div className="pi-sdot" />
            </div>
          </div>
        </div>
      </div>

      <div className="pi-gps-row">
        <div className="pi-gps-dot" />
        <span className="pi-gps-label">GPS Lock · 4m accuracy</span>
      </div>
    </div>
  );
});

/* ─────────────────────────────────────────
   Scene 2 — Confirm Identity
───────────────────────────────────────── */
const Scene2 = memo(({ liveTime }) => {
  return (
    <div className="pi-card pi-clay">
      {/* avatar with spinning gradient ring */}
      <div className="pi-avatar-wrap">
        <div className="pi-spin-ring" aria-hidden="true" />
        <div className="pi-spin-mask" aria-hidden="true" />
        <div className="pi-avatar-shell">
          <AvatarFace />
        </div>
        <div className="pi-badge-tick" aria-hidden="true">
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <path d="M2 5.5L4.5 8L9 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* identity info */}
      <div className="pi-identity">
        <div className="pi-name">Alex Rivera</div>
        <div className="pi-tags">
          <span className="pi-tag pi-tag-violet">Student</span>
          <span className="pi-tag pi-tag-green">Active</span>
        </div>
      </div>

      <div className="pi-sep" />

      {/* session details */}
      <div className="pi-row">
        <span className="pi-rk">Session</span>
        <span className="pi-rv">Lecture · Room 4B</span>
      </div>
      <div className="pi-row">
        <span className="pi-rk">Location</span>
        <span className="pi-rv pi-green">Verified ✓</span>
      </div>
      <div className="pi-row">
        <span className="pi-rk">Time</span>
        <span className="pi-rv">{liveTime}</span>
      </div>

      {/* CTA */}
      <button className="pi-clay-btn pi-btn" aria-label="Mark attendance as present">
        <span className="pi-btn-icon" aria-hidden="true">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M1.5 5L4 7.5L8.5 2.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        Mark Present
        <div className="pi-ripple" aria-hidden="true" />
      </button>
    </div>
  );
});

/* ─────────────────────────────────────────
   Scene 3 — Success
───────────────────────────────────────── */
const Scene3 = memo(({ isActive }) => {
  return (
    <div className="pi-s3">
      <div className="pi-medal-wrap">
        {/* ray burst (behind medallion) */}
        <div className="pi-rays" aria-hidden="true">
          {Array.from({ length: RAY_COUNT }).map((_, i) => (
            <div
              key={i}
              className="pi-ray"
              style={{
                '--r': `${i * 30}deg`,
                animationDelay: `${0.52 + (i % 4) * 0.04}s`,
              }}
            />
          ))}
        </div>

        {/* gold medallion */}
        <div className="pi-medal">
          <div className="pi-medal-inner">
            <svg width="46" height="46" viewBox="0 0 46 46" fill="none" aria-hidden="true">
              <path
                className={`pi-check-path${isActive ? ' pi-check-draw' : ''}`}
                d="M10 23L19.5 33L36 13"
                stroke="white"
                strokeWidth="4.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* text reveal */}
      <div className={`pi-success-text${isActive ? ' pi-reveal' : ''}`}>
        <div className="pi-success-title">Attendance Recorded</div>
        <div className="pi-success-sub">
          <div className="pi-sync-dot" aria-hidden="true" />
          Synced to cloud
        </div>
      </div>
    </div>
  );
});

/* ─────────────────────────────────────────
   Confetti layer
───────────────────────────────────────── */
function Confetti({ burst }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (!burst) return;
    setParticles(
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        left: rand(6, 94),
        top: rand(-4, 10),
        color: CONFETTI_COLORS[randI(0, CONFETTI_COLORS.length)],
        w: rand(4, 8),
        h: rand(4, 8),
        circle: Math.random() > 0.5,
        dur: rand(1.2, 2.0),
        delay: rand(0, 0.4),
      }))
    );
    const t = setTimeout(() => setParticles([]), 3300);
    return () => clearTimeout(t);
  }, [burst]);

  if (!particles.length) return null;

  return (
    <div className="pi-confetti" aria-hidden="true">
      {particles.map(p => (
        <div
          key={p.id}
          className="pi-particle"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.w}px`,
            height: `${p.h}px`,
            background: p.color,
            borderRadius: p.circle ? '50%' : '3px',
            animationDuration: `${p.dur}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────
   Main export
───────────────────────────────────────── */
export default function PresentlyIllustration({ className = '' }) {
  const [cur, setCur] = useState(0);
  const [exit, setExit] = useState(-1);
  const [burst, setBurst] = useState(0);
  const [time, setTime] = useState('--:--');
  const timerRef = useRef(null);

  /* live clock */
  useEffect(() => {
    const tick = () => {
      const n = new Date();
      setTime(
        `${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}`
      );
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  /* persistent starfield data to prevent re-randomizing every render */
  const stars = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      sz: rand(0.8, 2.2),
      top: rand(2, 98),
      left: rand(2, 98),
      dur: rand(3, 7),
      delay: rand(0, 5),
    }));
  }, []);

  /* robust scene loop */
  useEffect(() => {
    const timer = setTimeout(() => {
      setExit(cur);
      const next = (cur + 1) % 3;
      setCur(next);
      if (next === 2) setBurst(b => b + 1);
    }, SCENE_DURATIONS[cur]);
    return () => clearTimeout(timer);
  }, [cur]);

  useEffect(() => {
    if (exit !== -1) {
      const exitTimer = setTimeout(() => setExit(-1), 800);
      return () => clearTimeout(exitTimer);
    }
  }, [exit]);

  const wrapClass = i => {
    let c = 'pi-wrap';
    if (i === cur) c += ' pi-active';
    else if (i === exit) c += ' pi-exit';
    else c += ' pi-hidden';
    return c;
  };

  return (
    <>
      <style>{STYLES}</style>
      <div
        className={`pi-stage ${className}`}
        role="img"
        aria-label="Presently attendance animation: scan QR, confirm identity, record attendance"
      >
        {/* starfield */}
        <div className="pi-stars" aria-hidden="true">
          {stars.map((s, i) => (
            <div
              key={i}
              className="pi-star"
              style={{
                width: `${s.sz}px`,
                height: `${s.sz}px`,
                top: `${s.top}%`,
                left: `${s.left}%`,
                animationDuration: `${s.dur}s`,
                animationDelay: `${s.delay}s`,
              }}
            />
          ))}
        </div>

        {/* ambient orbs */}
        <div className={`pi-orb pi-orb1${cur === 0 ? ' pi-orb-on' : ''}`} aria-hidden="true" />
        <div className={`pi-orb pi-orb2${cur === 1 ? ' pi-orb-on' : ''}`} aria-hidden="true" />
        <div className={`pi-orb pi-orb3${cur === 2 ? ' pi-orb-on' : ''}`} aria-hidden="true" />

        {/* confetti */}
        <Confetti burst={burst} />

        {/* scene label */}
        <div className="pi-scene-label" aria-live="polite">
          {SCENE_LABELS[cur]}
        </div>

        {/* scenes */}
        <div className={wrapClass(0)}><Scene1 /></div>
        <div className={wrapClass(1)}><Scene2 liveTime={time} /></div>
        <div className={wrapClass(2)}><Scene3 isActive={cur === 2} /></div>

        {/* progress dots */}
        <div className="pi-dots" aria-hidden="true">
          {[0, 1, 2].map(i => (
            <div key={i} className={`pi-dot${i === cur ? ' pi-dot-on' : ''}`} />
          ))}
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────
   All styles — scoped with pi- prefix.
   No Tailwind classes used here — pure CSS.
───────────────────────────────────────── */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

.pi-stage {
  --gold:      #f5c842;
  --violet:    #7c5cfc;
  --violet-lt: #a78fff;
  --green:     #22d3a5;

  width:100%; max-width:520px; margin:0 auto;
  aspect-ratio:1/1; position:relative;
  background:linear-gradient(145deg,#1a1033 0%,#0e0c1a 60%,#0a1628 100%);
  border-radius:40px; overflow:hidden;
  font-family:'DM Sans',sans-serif;
  isolation: isolate;
  backface-visibility: hidden;
  transform: translateZ(0);
}

/* ── starfield ── */
.pi-stars{position:absolute;inset:0;pointer-events:none}
.pi-star{
  position:absolute;border-radius:50%;background:#fff;
  animation:pi-twinkle ease-in-out infinite;
}
@keyframes pi-twinkle{
  0%,100%{opacity:.1}
  50%{opacity:.5}
}
.pi-particle, .pi-ray, .pi-orb, .pi-phone, .pi-qr-target, .pi-beam, .pi-medalInner, .pi-ripple {
   will-change: transform, opacity;
}

/* ── ambient orbs ── */
.pi-orb{
  position:absolute;border-radius:50%;
  filter:blur(40px);opacity:0;pointer-events:none;
  transition:opacity 1.4s cubic-bezier(.4,0,.2,1);
}
.pi-orb1{width:280px;height:280px;background:radial-gradient(circle,#7c5cfc,#3d25a0);top:-80px;left:-60px}
.pi-orb2{width:240px;height:240px;background:radial-gradient(circle,#22d3a5,#0a6e56);bottom:-60px;right:-40px}
.pi-orb3{
  width:320px;height:320px;
  background:radial-gradient(circle,#f5c842,#c98000);
  top:50%;left:50%;transform:translate(-50%,-50%);
}
.pi-orb-on{opacity:.14}

/* ── confetti ── */
.pi-confetti{position:absolute;inset:0;pointer-events:none;overflow:hidden;border-radius:40px;z-index:20}
.pi-particle{position:absolute;animation:pi-fall linear forwards}
@keyframes pi-fall{
  0%{transform:translateY(0) rotate(0deg) scale(1);opacity:1}
  80%{opacity:1}
  100%{transform:translateY(340px) rotate(760deg) scale(.25);opacity:0}
}

/* ── scene label ── */
.pi-scene-label{
  position:absolute;top:20px;left:50%;transform:translateX(-50%);
  font-size:9px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;
  color:rgba(255,255,255,.24);z-index:10;white-space:nowrap;
}

/* ── scene wrappers ── */
.pi-wrap{
  position:absolute;inset:0;
  display:flex;align-items:center;justify-content:center;
  opacity:0;transform:scale(.9) translateY(14px);
  transition:opacity .65s cubic-bezier(.4,0,.2,1),
             transform .65s cubic-bezier(.34,1.45,.64,1);
  pointer-events:none;
}
.pi-active{opacity:1;transform:scale(1) translateY(0);pointer-events:auto}
.pi-exit{
  opacity:0;transform:translateY(-10px);
  transition:opacity .45s ease-in;
}
.pi-hidden{display:none}

/* ── clay design system ── */
.pi-clay{
  border-radius:28px;
  background:rgba(255,255,255,0.04);
  backdrop-filter:blur(10px);
  border:1px solid rgba(255,255,255,.1);
  box-shadow:
    0 12px 40px rgba(0,0,0,.5),
    0 4px 10px rgba(0,0,0,.3);
}
.pi-clay-btn{
  border-radius:20px;border:none;
  font-family:'DM Sans',sans-serif;font-weight:800;
  cursor:pointer;position:relative;overflow:hidden;
  background:linear-gradient(175deg,#9b88ff 0%,#6c58ff 40%,#4e38e8 100%);
  color:#fff;
  box-shadow:
    0 2px 0 rgba(255,255,255,.28) inset,
    0 -3px 0 rgba(0,0,0,.32) inset,
    0 12px 32px rgba(108,88,255,.55),
    0 4px 8px rgba(0,0,0,.3);
  transition:transform .12s ease,box-shadow .12s ease;
}
.pi-clay-btn:hover{
  transform:translateY(-1px);
  box-shadow:0 2px 0 rgba(255,255,255,.28) inset,0 -3px 0 rgba(0,0,0,.32) inset,
             0 18px 42px rgba(108,88,255,.62),0 6px 12px rgba(0,0,0,.35);
}
.pi-clay-btn:active{
  transform:scale(.97) translateY(2px);
  box-shadow:0 1px 0 rgba(255,255,255,.2) inset,0 -1px 0 rgba(0,0,0,.3) inset,
             0 6px 16px rgba(108,88,255,.4);
}

/* ══════════════════════════
   SCENE 1 — QR Scan
══════════════════════════ */
.pi-s1{
  display:flex;flex-direction:column;
  align-items:center;justify-content:center;gap:18px;
  width:100%;height:100%;
}
.pi-scan-group{position:relative;display:flex;align-items:center;justify-content:center}

.pi-phone{
  width:132px;height:224px;border-radius:32px;
  background:linear-gradient(155deg,#242d44 0%,#131820 100%);
  box-shadow:
    0 2px 0 rgba(255,255,255,.12) inset,
    0 -3px 0 rgba(0,0,0,.55) inset,
    0 32px 72px rgba(0,0,0,.74),
    0 8px 16px rgba(0,0,0,.5),
    0 0 0 1px rgba(255,255,255,.07);
  position:relative;display:flex;align-items:center;justify-content:center;
  animation:pi-float 3.4s ease-in-out infinite;
}
@keyframes pi-float{
  0%,100%{transform:translateY(0) rotate(-2.5deg)}
  50%{transform:translateY(-11px) rotate(-2.5deg)}
}
.pi-phone-screen{
  width:112px;height:204px;border-radius:24px;
  background:#050810;overflow:hidden;position:relative;
}
.pi-notch{
  position:absolute;top:0;left:50%;transform:translateX(-50%);
  width:44px;height:10px;background:#050810;
  border-radius:0 0 12px 12px;z-index:5;
}
.pi-app-bar{
  position:absolute;top:15px;left:0;right:0;
  display:flex;align-items:center;justify-content:center;
}
.pi-app-name{
  font-size:7px;font-weight:800;letter-spacing:.2em;
  color:rgba(255,255,255,.42);text-transform:uppercase;
}
.pi-screen-body{
  position:absolute;inset:0;
  display:flex;align-items:center;justify-content:center;
}
.pi-vf{width:78px;height:78px;position:relative}
.pi-vfc{
  position:absolute;width:16px;height:16px;
  border-style:solid;border-color:#a78fff;border-width:0;
}
.pi-vf-tl{top:0;left:0;border-top-width:2.5px;border-left-width:2.5px;border-radius:3px 0 0 0}
.pi-vf-tr{top:0;right:0;border-top-width:2.5px;border-right-width:2.5px;border-radius:0 3px 0 0}
.pi-vf-bl{bottom:0;left:0;border-bottom-width:2.5px;border-left-width:2.5px;border-radius:0 0 0 3px}
.pi-vf-br{bottom:0;right:0;border-bottom-width:2.5px;border-right-width:2.5px;border-radius:0 0 3px 0}
.pi-qr-ghost{
  position:absolute;top:50%;left:50%;
  transform:translate(-50%,-50%);
  width:58px;height:58px;
}
.pi-beam{
  position:absolute;left:3px;right:3px;height:2px;top:3px;
  background:linear-gradient(90deg,transparent,#b4a0ff,#8370ff,#b4a0ff,transparent);
  border-radius:1px;
  box-shadow:0 0 10px #7c5cfc,0 0 22px rgba(124,92,252,.45);
  animation:pi-sweep 1.8s cubic-bezier(.45,0,.55,1) infinite;
}
@keyframes pi-sweep{
  0%{top:3px;opacity:0}8%{opacity:1}92%{opacity:1}100%{top:calc(100% - 5px);opacity:0}
}
.pi-status-bar{
  position:absolute;bottom:8px;left:0;right:0;
  display:flex;justify-content:center;gap:3px;
}
.pi-sdot{width:3px;height:3px;border-radius:50%;background:rgba(255,255,255,.25)}
.pi-sdot-on{background:#22d3a5;box-shadow:0 0 6px #22d3a5}

.pi-qr-target{
  position:absolute;
  top:50%;left:calc(50% + 76px);
  transform:translateY(-50%) rotate(3deg);
  width:90px;height:90px;
  background:#fff;border-radius:18px;
  display:flex;align-items:center;justify-content:center;
  box-shadow:
    0 2px 0 rgba(255,255,255,.9) inset,
    0 -2px 0 rgba(0,0,0,.12) inset,
    0 18px 44px rgba(0,0,0,.55),
    0 4px 8px rgba(0,0,0,.3);
  animation:pi-qr-bob 3.4s ease-in-out infinite .5s;
}
@keyframes pi-qr-bob{
  0%,100%{transform:translateY(-50%) rotate(3deg) translateY(2px)}
  50%{transform:translateY(-50%) rotate(3deg) translateY(-8px)}
}

.pi-gps-row{display:flex;flex-direction:column;align-items:center;gap:5px}
.pi-gps-dot{
  width:9px;height:9px;border-radius:50%;
  background:radial-gradient(circle,#4dffb4,#22d3a5);
  animation:pi-gps-pulse 2s ease-out infinite;
}
@keyframes pi-gps-pulse{
  0%{box-shadow:0 0 0 0 rgba(34,211,165,.6)}
  70%{box-shadow:0 0 0 15px rgba(34,211,165,0)}
  100%{box-shadow:0 0 0 0 rgba(34,211,165,0)}
}
.pi-gps-label{
  font-size:9px;font-weight:700;color:#22d3a5;
  letter-spacing:.1em;text-transform:uppercase;opacity:.85;
}

/* ══════════════════════════
   SCENE 2 — Confirm
══════════════════════════ */
.pi-card{
  width:218px;padding:26px 22px 22px;
  display:flex;flex-direction:column;align-items:center;gap:13px;
}
.pi-avatar-wrap{position:relative;width:68px;height:68px}
.pi-spin-ring{
  position:absolute;inset:-5px;border-radius:50%;
  background:conic-gradient(from 0deg,#a78fff,#7c5cfc,#22d3a5,#f5c842,#a78fff);
  animation:pi-spin 5.5s linear infinite;z-index:0;
}
@keyframes pi-spin{to{transform:rotate(360deg)}}
.pi-spin-mask{
  position:absolute;inset:2px;border-radius:50%;
  background:linear-gradient(145deg,#1a1033,#0e0c1a);z-index:1;
}
.pi-avatar-shell{
  position:absolute;inset:0;border-radius:50%;overflow:hidden;z-index:2;
  box-shadow:
    0 2px 0 rgba(255,220,150,.22) inset,
    0 -3px 0 rgba(0,0,0,.42) inset,
    0 10px 28px rgba(0,0,0,.5);
}
.pi-badge-tick{
  position:absolute;bottom:-2px;right:-2px;
  width:22px;height:22px;border-radius:50%;
  background:linear-gradient(145deg,#34e8a4,#18c97a);
  box-shadow:0 2px 0 rgba(100,255,180,.4) inset,0 -2px 0 rgba(0,0,0,.3) inset,0 4px 12px rgba(34,180,120,.55);
  display:flex;align-items:center;justify-content:center;z-index:3;
}
.pi-identity{text-align:center}
.pi-name{font-size:15px;font-weight:800;color:#fff;letter-spacing:-.015em}
.pi-tags{display:flex;align-items:center;gap:5px;flex-wrap:wrap;justify-content:center;margin-top:6px}
.pi-tag{font-size:9px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:3px 9px;border-radius:20px}
.pi-tag-violet{background:rgba(124,92,252,.22);color:#c4b2ff;border:1px solid rgba(124,92,252,.28)}
.pi-tag-green{background:rgba(34,211,165,.16);color:#6effd4;border:1px solid rgba(34,211,165,.22)}
.pi-sep{width:100%;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.08),transparent)}
.pi-row{display:flex;justify-content:space-between;align-items:center;width:100%}
.pi-rk{font-size:11px;font-weight:600;color:rgba(255,255,255,.32)}
.pi-rv{font-size:11px;font-weight:700;color:rgba(255,255,255,.82)}
.pi-rv.pi-green{color:#22d3a5}
.pi-btn{
  width:100%;padding:15px 0;font-size:13px;letter-spacing:.04em;
  display:flex;align-items:center;justify-content:center;gap:8px;
}
.pi-btn-icon{
  width:18px;height:18px;border-radius:50%;background:rgba(255,255,255,.2);
  display:flex;align-items:center;justify-content:center;flex-shrink:0;
}
.pi-ripple{
  position:absolute;top:50%;left:50%;
  width:8px;height:8px;border-radius:50%;
  background:rgba(255,255,255,.35);
  transform:translate(-50%,-50%) scale(0);
  animation:pi-ripple 1.4s ease-out infinite .6s;
}
@keyframes pi-ripple{
  0%{transform:translate(-50%,-50%) scale(0);opacity:.9}
  100%{transform:translate(-50%,-50%) scale(14);opacity:0}
}

/* ══════════════════════════
   SCENE 3 — Success
══════════════════════════ */
.pi-s3{display:flex;flex-direction:column;align-items:center;gap:22px}
.pi-medal-wrap{position:relative;display:flex;align-items:center;justify-content:center}
.pi-rays{
  position:absolute;width:250px;height:250px;
  top:50%;left:50%;transform:translate(-50%,-50%);
  pointer-events:none;
}
.pi-ray{
  position:absolute;top:50%;left:50%;
  width:3px;border-radius:2px;
  background:linear-gradient(to bottom,var(--gold),transparent);
  transform-origin:top center;opacity:0;
  transform:rotate(var(--r,0deg)) translateX(-1.5px) translateY(-60px);
}
.pi-active .pi-ray{
  animation:pi-ray-shoot .8s cubic-bezier(.34,1.4,.64,1) forwards;
}
@keyframes pi-ray-shoot{
  0%{opacity:0;height:8px;transform:rotate(var(--r)) translateX(-1.5px) translateY(-56px) scaleY(.2)}
  38%{opacity:1}
  100%{opacity:0;height:38px;transform:rotate(var(--r)) translateX(-1.5px) translateY(-90px) scaleY(1)}
}
.pi-medal{
  width:122px;height:122px;border-radius:50%;
  background:conic-gradient(from 0deg,#f5c842 0%,#ffe98a 25%,#f5c842 50%,#c98000 75%,#f5c842 100%);
  display:flex;align-items:center;justify-content:center;
}
.pi-active .pi-medal{
  animation:
    pi-medal-pop  .78s cubic-bezier(.34,1.56,.64,1) forwards,
    pi-medal-glow 2.8s ease-in-out .78s infinite;
}
@keyframes pi-medal-pop{
  0%{transform:scale(.3) rotate(-20deg);opacity:0}
  65%{transform:scale(1.15) rotate(4deg);opacity:1}
  100%{transform:scale(1) rotate(0deg);opacity:1}
}
@keyframes pi-medal-glow{
  0%,100%{box-shadow:0 0 40px rgba(245,200,60,.2)}
  50%{box-shadow:0 0 80px rgba(245,200,60,.4)}
}
.pi-medal-inner{
  width:98px;height:98px;border-radius:50%;
  background:linear-gradient(148deg,#f9d95a,#e8a800);
  box-shadow:0 2px 0 rgba(255,240,150,.5) inset,0 -3px 0 rgba(100,60,0,.45) inset;
  display:flex;align-items:center;justify-content:center;
}
.pi-check-path{stroke-dasharray:65;stroke-dashoffset:65}
.pi-check-draw{animation:pi-draw-check .58s cubic-bezier(.4,0,.2,1) .56s forwards}
@keyframes pi-draw-check{to{stroke-dashoffset:0}}

.pi-success-text{
  display:flex;flex-direction:column;align-items:center;gap:6px;
  opacity:0;transform:translateY(14px);
  transition:opacity .5s ease .96s,transform .5s ease .96s;
}
.pi-success-text.pi-reveal{opacity:1;transform:translateY(0)}
.pi-success-title{font-size:19px;font-weight:800;color:#fff;letter-spacing:-.02em}
.pi-success-sub{
  display:flex;align-items:center;gap:5px;
  font-size:10px;font-weight:700;letter-spacing:.12em;
  text-transform:uppercase;color:#22d3a5;
}
.pi-sync-dot{
  width:6px;height:6px;border-radius:50%;background:#22d3a5;
  animation:pi-gps-pulse 1.5s ease-out infinite;
}

/* ── progress dots ── */
.pi-dots{
  position:absolute;bottom:20px;left:50%;transform:translateX(-50%);
  display:flex;gap:7px;z-index:10;
}
.pi-dot{
  width:7px;height:7px;border-radius:4px;
  background:rgba(255,255,255,.18);
  transition:all .45s cubic-bezier(.34,1.45,.64,1);
}
.pi-dot-on{width:22px;background:#fff}

/* ── reduced-motion ── */
@media (prefers-reduced-motion: reduce) {
  .pi-phone,.pi-qr-target,.pi-gps-dot,.pi-beam,
  .pi-clay-btn,.pi-ripple,.pi-spin-ring,
  .pi-particle,.pi-ray,.pi-star{animation:none !important}
}
`;