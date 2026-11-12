import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import './LandingPage/newLanding.css';

// QR Code generation algorithm with deterministic LCG PRNG (seed 7)
const generateQRPoints = () => {
  const N = 25;
  let sd = 7;
  const rnd = () => {
    sd = (sd * 16807) % 2147483647;
    return sd / 2147483647;
  };

  const points: { x: number; y: number }[] = [];
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const fx = x < 7 || x >= N - 7;
      const fy = y < 7 || y >= N - 7;
      let d = false;
      if (fx && fy && !(x < 7 && y < 7) && !(x >= N - 7 && y < 7) && !(x < 7 && y >= N - 7)) {
        d = rnd() > 0.5;
      } else if (fx && fy) {
        let rx = x % (N - 7);
        if (x >= N - 7) rx = x - (N - 7);
        const ry = y >= N - 7 ? y - (N - 7) : y;
        d = rx === 0 || rx === 6 || ry === 0 || ry === 6 || (rx > 1 && rx < 5 && ry > 1 && ry < 5);
      } else {
        d = rnd() > 0.52;
      }
      if (d) {
        points.push({ x, y });
      }
    }
  }
  return points;
};

const QR_POINTS = generateQRPoints();

const QRCode = () => (
  <svg viewBox="0 0 25 25" shapeRendering="crispEdges" fill="#1A1608" style={{ width: '100%', height: '100%' }}>
    {QR_POINTS.map((pt, i) => (
      <rect key={i} x={pt.x} y={pt.y} width="1" height="1" />
    ))}
  </svg>
);

const PPerson = ({ x, y, className = 'pp' }: { x: number; y: number; className?: string }) => (
  <g className={className}>
    <circle cx={x} cy={y} r="6" />
    <path d={`M${x - 10} ${y + 22}q10-20 20 0z`} />
  </g>
);

const J_POINTS = [[-30, -16], [24, -20], [34, 12], [-18, 20], [4, -26]] as const;
const D_PHONES = [
  [26, 40, 28, 46, 2],
  [78, 28, 36, 62, 3],
  [136, 36, 32, 54, 3]
] as const;

const STUDENT_ROWS = [
  { name: 'Adebayo Ogunleye', av: 'AO', matric: '2024/CSC/1043', time: '09:02', pct: 96 },
  { name: 'Chiamaka Eze', av: 'CE', matric: '2024/CSC/1017', time: '09:02', pct: 92 },
  { name: 'Ibrahim Musa', av: 'IM', matric: '2024/CSC/1088', time: '09:03', pct: 88 },
  { name: 'Folasade Bakare', av: 'FB', matric: '2024/CSC/1056', time: '09:03', pct: 74 },
  { name: 'Tunde Adeyinka', av: 'TA', matric: '2024/CSC/1121', time: '09:04', pct: 81 },
  { name: 'Ngozi Okafor', av: 'NO', matric: '2024/CSC/1009', time: '09:04', pct: 100 }
];

const TAB_DATA = [
  {
    title: 'MTH 201 · Linear Algebra',
    badge: 'Live',
    steps: [
      ['Set up the course', 'Pick your course and the lecture hall boundary once. It carries over every week.'],
      ['Share the live code', 'Show the four-digit code on the projector or say it aloud.'],
      ['Watch check-ins arrive', 'Students appear live, and sign-ins from outside the hall are rejected.']
    ]
  },
  {
    title: 'Your check-in',
    badge: 'Verified',
    steps: [
      ['Open Presently', 'Sign in on the phone you already carry.'],
      ['Enter the lecture code', 'Type the four digits shown in class.'],
      ['See yourself marked present', 'Your attendance percentage updates straight away.']
    ]
  },
  {
    title: 'Department overview',
    badge: 'Ready',
    steps: [
      ['See every course', 'One dashboard across levels and lecturers.'],
      ['Review exam eligibility', 'The 75% threshold is applied for you.'],
      ['Export clearance lists', 'Download a record that stands up to questions.']
    ]
  }
];

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');

  // Hero stage animation states
  const [stageS, setStageS] = useState(0);
  const [stageP, setStageP] = useState(0);
  const [stageTap, setStageTap] = useState(false);
  const [litSeats, setLitSeats] = useState<number[]>([]);
  const [checkedInCount, setCheckedInCount] = useState(0);

  const stageRef = useRef<HTMLDivElement>(null);
  const hsfRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const pbRef = useRef<HTMLDivElement>(null);
  const scrRef = useRef<HTMLDivElement>(null);

  // Seat coordinates for 6 rows x 12 columns = 72 seats
  const seatPositions = useMemo(() => {
    const list: { left: number; top: number; id: number }[] = [];
    let id = 0;
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 12; c++) {
        list.push({
          id,
          left: 68 + c * 37,
          top: 120 + r * 38
        });
        id++;
      }
    }
    return list;
  }, []);

  // Theme synchronization
  const applyTheme = useCallback((theme: 'light' | 'dark') => {
    setCurrentTheme(theme);
    document.documentElement.dataset.theme = theme;
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('pt', theme);
      localStorage.setItem('vite-ui-theme', theme);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.add('js');

    // Detect initial theme
    let initialTheme: 'light' | 'dark' = 'light';
    try {
      const sv = localStorage.getItem('pt') || localStorage.getItem('vite-ui-theme');
      if (sv === 'light' || sv === 'dark') {
        initialTheme = sv;
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        initialTheme = 'dark';
      }
    } catch {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        initialTheme = 'dark';
      }
    }
    applyTheme(initialTheme);

    const origBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor = 'var(--bg)';

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = (e: MediaQueryListEvent) => {
      try {
        const sv = localStorage.getItem('pt');
        if (!sv) {
          applyTheme(e.matches ? 'dark' : 'light');
        }
      } catch {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    };
    mediaQuery.addEventListener?.('change', handleMediaChange);

    return () => {
      mediaQuery.removeEventListener?.('change', handleMediaChange);
      document.body.style.backgroundColor = origBg;
    };
  }, [applyTheme]);

  // Scroll handler for navbar and scroll progress
  useEffect(() => {
    let ly = 0;
    const handleScroll = () => {
      const y = window.scrollY;
      const root = document.documentElement;
      const h = root.scrollHeight - window.innerHeight;
      if (navRef.current) {
        navRef.current.classList.toggle('scrolled', y > 40);
        if (Math.abs(y - ly) > 6) {
          navRef.current.classList.toggle('hide', y > ly && y > 420);
          ly = y;
        }
      }
      if (pbRef.current) {
        pbRef.current.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Responsive stage auto-fitting
  useEffect(() => {
    const handleFit = () => {
      if (!stageRef.current || !hsfRef.current) return;
      const k = stageRef.current.clientWidth / 560;
      hsfRef.current.style.setProperty('--k', String(k));
      stageRef.current.style.height = `${594 * k}px`;
    };

    handleFit();
    window.addEventListener('resize', handleFit);
    return () => {
      window.removeEventListener('resize', handleFit);
    };
  }, []);

  // Hero stage animation choreography
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setStageS(3);
      setStageP(4);
      setLitSeats(Array.from({ length: 72 }, (_, i) => i));
      setCheckedInCount(118);
      return;
    }

    let isPlaying = false;
    let timers: ReturnType<typeof setTimeout>[] = [];

    const at = (ms: number, fn: () => void) => {
      timers.push(setTimeout(fn, ms));
    };

    const clearAllTimers = () => {
      timers.forEach(clearTimeout);
      timers = [];
    };

    const runPlay = () => {
      clearAllTimers();
      setLitSeats([]);
      setCheckedInCount(0);
      setStageTap(false);
      setStageS(0);
      setStageP(0);

      at(1400, () => {
        setStageS(0);
        setStageP(1);
      });
      at(3000, () => {
        setStageS(1);
        setStageP(2);
      });
      at(4600, () => {
        setStageS(1);
        setStageP(3);
      });
      at(5600, () => {
        setStageTap(true);
      });
      at(5900, () => {
        setStageTap(false);
      });
      at(6100, () => {
        setStageS(1);
        setStageP(4);
      });
      at(7600, () => {
        setStageS(2);
        setStageP(4);

        // light seats
        const ord: number[] = [];
        for (let i = 1; i < 72; i++) ord.push(i);
        ord.sort(() => Math.random() - 0.5);

        let litCount = 1;
        setLitSeats([0]);
        setCheckedInCount(Math.round((1 / 72) * 118));

        ord.forEach((seatIdx, j) => {
          at(300 + Math.pow(j / ord.length, 0.7) * 2800, () => {
            litCount++;
            setLitSeats((prev) => (prev.includes(seatIdx) ? prev : [...prev, seatIdx]));
            setCheckedInCount(Math.round((litCount / 72) * 118));
          });
        });
      });

      at(11800, () => {
        setStageS(3);
        setStageP(4);
      });

      at(18500, () => {
        if (isPlaying) runPlay();
      });
    };

    const stageEl = stageRef.current;
    if (!stageEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          isPlaying = true;
          runPlay();
        } else {
          isPlaying = false;
          clearAllTimers();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(stageEl);

    return () => {
      observer.disconnect();
      isPlaying = false;
      clearAllTimers();
    };
  }, []);

  // IntersectionObserver for cards (.rv) and screen (.scr) + pointermove spotlight (.sp)
  useEffect(() => {
    const cards = document.querySelectorAll<HTMLElement>('.landing-page-root .pc, .landing-page-root .cc, .landing-page-root .ac, .landing-page-root .pl');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            if (entry.target.classList.contains('scr')) {
              (entry.target as HTMLElement).dataset.seen = '1';
            }
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    cards.forEach((card, k) => {
      card.classList.add('rv', 'sp');
      card.style.setProperty('--d', `${(k % 4) * 0.1}s`);
      io.observe(card);

      const onPointerMove = (ev: PointerEvent) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${ev.clientX - r.left}px`);
        card.style.setProperty('--my', `${ev.clientY - r.top}px`);
      };

      card.addEventListener('pointermove', onPointerMove);
    });

    if (scrRef.current) {
      io.observe(scrRef.current);
    }

    return () => {
      io.disconnect();
    };
  }, []);

  // Handle Tab Change in "How it works"
  const handleTabClick = (index: number) => {
    setActiveTab(index);
    if (scrRef.current) {
      scrRef.current.classList.remove('in');
      void scrRef.current.offsetWidth;
      scrRef.current.classList.add('in');
    }
  };

  const currentTab = TAB_DATA[activeTab];

  return (
    <div className="landing-page-root" data-theme={currentTheme}>
      <Helmet>
        <title>Presently — GPS-verified attendance for Nigerian universities</title>
      </Helmet>

      {/* Top scroll progress bar */}
      <div className="pb" id="pb" ref={pbRef}></div>

      {/* Navigation */}
      <nav ref={navRef}>
        <div className="w">
          <a className="logo" href="#top">
            <i></i>Presently
          </a>
          <ul>
            <li><a href="#why">The problem</a></li>
            <li><a href="#how">How it works</a></li>
            <li><a href="#campus">Built on campus</a></li>
            <li><a href="#pricing">Pricing</a></li>
            <li><a href="#faq">FAQ</a></li>
          </ul>
          <a className="btn p" href="#pricing">Start free</a>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero" id="top">
        <div className="w">
          <div>
            <h1>Accurate lecture attendance. Built for <em>Nigerian</em> universities.</h1>
            <p className="lede">
              Replace circulating paper sheets and tedious roll calls with location-aware attendance. Lecturers launch a session in seconds, students check in on their own phones, and departments get automated exam eligibility.
            </p>
            <div className="ctas">
              <a className="btn p" href="#pricing">Start free as lecturer</a>
              <a className="btn g" href="#cta">Request campus demo</a>
            </div>
            <div className="proof">
              <div><b>20 sec</b>to launch a session</div>
              <div><b>0</b>proxy sign-ins</div>
              <div><b>75%</b>exam threshold, automated</div>
            </div>
          </div>

          {/* Interactive Hero Stage */}
          <div
            className="stage"
            ref={stageRef}
            role="img"
            aria-label="Animated walkthrough: a lecturer shows a QR code, a student scans it and verifies location, the whole class checks in, and a verified attendance register appears with exam eligibility"
          >
            <div className="hsf" ref={hsfRef}>
              <div className={`hs ${stageTap ? 'tap' : ''}`} data-s={stageS} data-p={stageP}>
                {/* 4 Step Bars */}
                <div className="hs-st">
                  <i></i><i></i><i></i><i></i>
                </div>

                {/* Viewport */}
                <div className="hs-v">
                  {/* Step 1 Lecturer Screen */}
                  <div className="hs-b">
                    <div className="bl">
                      <span><b>● Live</b> session</span>
                      <span>Hall B</span>
                    </div>
                    <div className="bt">CSC 301 · Operating Systems</div>
                    <div className="qrt" id="q1">
                      <QRCode />
                    </div>
                    <div className="bc">
                      Or enter session code<b>8 4 9 2</b>
                    </div>
                  </div>

                  {/* Step 3 Whole Class Hall B Boundary */}
                  <div className="hs-h">
                    <div className="hl">Hall B boundary</div>
                    <div className="hf"></div>
                    <div className="hd">Lecturer · session live</div>
                    <div className="hct">
                      Checked in<br />
                      <b id="cn">{checkedInCount}</b> / 120
                    </div>
                    {/* Render the 72 seats */}
                    {seatPositions.map((pos) => (
                      <div
                        key={pos.id}
                        className={`st2 ${litSeats.includes(pos.id) ? 'lit' : ''}`}
                        style={{ left: `${pos.left}px`, top: `${pos.top}px` }}
                      />
                    ))}
                    <div className="ot"></div>
                    <div className="otl">Outside the hall: blocked</div>
                  </div>

                  {/* Step 4 Verified Register */}
                  <div className="hs-t">
                    <div className="th">
                      <div>
                        <small>Attendance register · sample data</small>
                        <b>CSC 301 · Operating Systems</b>
                      </div>
                      <span className="chp y">118/120 present</span>
                    </div>
                    <div className="tb">
                      <div className="rw h">
                        <span></span>
                        <span>Student</span>
                        <span>Matric no.</span>
                        <span>In</span>
                        <span>Attendance</span>
                        <span>Exam</span>
                      </div>
                      <div id="rows">
                        {STUDENT_ROWS.map((r, i) => {
                          const lo = r.pct < 75;
                          return (
                            <div key={i} className="rw r" style={{ '--i': i } as React.CSSProperties}>
                              <span className="av">{r.av}</span>
                              <span>
                                <b>{r.name}</b>
                                <small>Computer Sci · 200L</small>
                              </span>
                              <span>{r.matric}</span>
                              <span>{r.time}</span>
                              <span>
                                {r.pct}%
                                <div className="ab">
                                  <i className={lo ? 'lo' : ''} style={{ '--w': `${r.pct}%` } as React.CSSProperties}></i>
                                </div>
                              </span>
                              <span className={`sc ${lo ? 'bd' : ''}`}>
                                {lo ? 'Below 75%' : 'Eligible'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="tf">
                      <span className="chp">⬇ Export register</span>
                      <span className="chp">Send to HOD</span>
                      <span className="chp y">Eligibility list ready ✓</span>
                    </div>
                  </div>

                  {/* Step 2 Student Phone */}
                  <div className="hp">
                    <i className="hn"></i>
                    {/* Camera */}
                    <div className="ps cam">
                      <small>Scan session QR</small>
                      <div className="vf">
                        <div className="vq" id="q2">
                          <QRCode />
                        </div>
                        <svg className="br" viewBox="0 0 104 104">
                          <path d="M2 22V8a6 6 0 0 1 6-6h14M82 2h14a6 6 0 0 1 6 6v14M102 82v14a6 6 0 0 1-6 6H82M22 102H8a6 6 0 0 1-6-6V82" />
                        </svg>
                        <i className="sl2"></i>
                      </div>
                      <span className="fnd">✓ Session found</span>
                    </div>

                    {/* Location fix */}
                    <div className="ps loc">
                      <div className="rd2">
                        <i></i><i></i><i></i>
                        <svg viewBox="0 0 24 24">
                          <path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z" />
                          <circle cx="12" cy="10" r="2.5" />
                        </svg>
                      </div>
                      <b>Verifying location</b>
                      <span className="cl" style={{ '--t': '.5s' } as React.CSSProperties}>✓ GPS fix · 3 readings</span>
                      <span className="cl" style={{ '--t': '1.1s' } as React.CSSProperties}>✓ Inside Hall B boundary</span>
                    </div>

                    {/* Tap Present */}
                    <div className="ps pbn">
                      <small>CSC 301 · Dr. Adeyemi</small>
                      <div className="pb2">I’m present</div>
                      <i className="fg2"></i>
                      <small>Code 8492 verified</small>
                    </div>

                    {/* Success */}
                    <div className="ps okp">
                      <svg viewBox="0 0 64 64">
                        <circle cx="32" cy="32" r="28" fill="#1A1608" />
                        <path
                          className="cpk"
                          d="M20 33l8 8 17-18"
                          fill="none"
                          stroke="#FFCA0D"
                          strokeWidth="5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <b>You’re marked present</b>
                      <span>09:02 · CSC 301</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Captions */}
                <div className="hs-c">
                  <div className="hc hc0">
                    <small>Step 1 · Lecturer</small>
                    <b>Launch a session in 20 seconds</b>
                    <span>Pick the course and a live QR code and session code appear on the projector.</span>
                  </div>
                  <div className="hc hc1">
                    <small>Step 2 · Student</small>
                    <b>Scan, verify, tap “I’m present”</b>
                    <span>Presently confirms the phone is inside the lecture hall, then one tap marks them present.</span>
                  </div>
                  <div className="hc hc2">
                    <small>Step 3 · Whole class</small>
                    <b>Hundreds check in at once</b>
                    <span>No sheets passing along rows. Sign-ins from outside the hall are blocked.</span>
                  </div>
                  <div className="hc hc3">
                    <small>Step 4 · Lecturer &amp; school</small>
                    <b>A verified register, instantly</b>
                    <span>Matric numbers, times and attendance, with exam eligibility worked out for you.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Marquee Banner */}
      <div className="mq" aria-hidden="true">
        <div>
          <span>No paper registers</span>
          <span>No proxy sign-ins</span>
          <span>Location-verified</span>
          <span>Exam eligibility on autopilot</span>
          <span>No paper registers</span>
          <span>No proxy sign-ins</span>
          <span>Location-verified</span>
          <span>Exam eligibility on autopilot</span>
        </div>
      </div>

      {/* Section: The Problem (#why) */}
      <section id="why">
        <div className="w">
          <h2>Why paper attendance fails in Nigerian lecture halls.</h2>
          <p className="lede">
            Paper sign-in sheets were designed for small tutorial groups decades ago. In modern tertiary institutions with large cohorts, they create administrative friction, enable proxy signing, and burden lecturers.
          </p>
          <div className="pg">
            <div className="pc">
              <svg className="ill" viewBox="0 0 200 100" aria-hidden="true">
                <PPerson x={30} y={22} />
                <PPerson x={70} y={22} />
                <PPerson x={110} y={22} />
                <PPerson x={150} y={22} />
                <g transform="translate(30 62)">
                  <g className="shp">
                    <rect className="sh" x="-11" y="0" width="22" height="30" rx="2" />
                    <path className="sl" d="M-6 8h12M-6 14h12M-6 20h8" />
                  </g>
                </g>
                <circle cx="180" cy="20" r="12" />
                <path className="hand" d="M180 20v-8" />
                <path className="hand2" d="M180 20h6" />
              </svg>
              <div className="big">200+</div>
              <div>
                <h3>The circulating paper shuffle</h3>
                <p>A class of 200 to 300 students means sheets travel row by row for the whole lecture, and a quarter of the hour goes to signing.</p>
              </div>
            </div>

            <div className="pc">
              <svg className="ill" viewBox="0 0 200 100" aria-hidden="true">
                <PPerson x={55} y={18} />
                <PPerson x={145} y={18} className="gh" />
                <path d="M62 40L76 54" />
                <rect className="sh" x="66" y="52" width="68" height="42" rx="3" />
                <path className="sl" d="M74 66h30M74 82h30" />
                <path className="cp" style={{ '--t': '.5s' } as React.CSSProperties} d="M114 66l5 5 9-10" />
                <path className="cp bad" style={{ '--t': '1.6s' } as React.CSSProperties} d="M114 82l5 5 9-10" />
                <path className="fg bad" d="M145 44Q154 70 136 80" />
              </svg>
              <div className="big">1 in 5</div>
              <div>
                <h3>Rampant proxy attendance</h3>
                <p>Paper registers can’t verify who is physically present, so signing for absent friends goes unchecked.</p>
              </div>
            </div>

            <div className="pc">
              <svg className="ill" viewBox="0 0 200 100" aria-hidden="true">
                {[0, 1, 2, 3, 4].map((i) => (
                  <g key={i} className="stk" style={{ '--t': `${i * 0.25}s` } as React.CSSProperties}>
                    <rect className="sh" x={22 + (i % 2) * 5} y={72 - i * 11} width="64" height="20" rx="2" />
                    <path className="sl" d={`M${30 + (i % 2) * 5} ${82 - i * 11}h30`} />
                  </g>
                ))}
                <rect x="116" y="12" width="68" height="78" rx="7" />
                <path d="M116 30h68M132 8v8M168 8v8" />
                {Array.from({ length: 4 }).flatMap((_, j) =>
                  Array.from({ length: 3 }).map((_, i) => (
                    <rect
                      key={`${j}-${i}`}
                      className="cell"
                      x={126 + i * 19}
                      y={38 + j * 12}
                      width="10"
                      height="7"
                      rx="1.5"
                      style={{ '--t': `${0.2 * (j * 3 + i)}s` } as React.CSSProperties}
                    />
                  ))
                )}
              </svg>
              <div className="big">Days</div>
              <div>
                <h3>End-of-semester clearance nightmares</h3>
                <p>Tallying handwritten sheets to decide exam eligibility takes departments days, and disputes follow.</p>
              </div>
            </div>

            <div className="pc">
              <svg className="ill" viewBox="0 0 200 100" aria-hidden="true">
                <path className="sh" d="M50 14h42l-6 14 9 14-7 15 6 15H50z" />
                <path className="sl" d="M58 28h22M58 40h20M58 52h18M58 64h14" />
                <path className="sh tr" d="M96 14h38v58H98l-6-15 7-15-9-14z" />
                <text className="qm" x="160" y="54">?</text>
              </svg>
              <div className="big">1 lost</div>
              <div>
                <h3>Fragile, unverifiable records</h3>
                <p>A single torn or misplaced sheet erases weeks of evidence. Presently keeps every record at the point of delivery.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section: How It Works (#how) */}
      <section className="how" id="how">
        <div className="w">
          <h2>How Presently works in real classrooms.</h2>
          <p className="lede">
            Designed to fit naturally into everyday lecture routines without disrupting academic contact time.
          </p>
          <div className="hw">
            <div>
              <div className="tabs" role="tablist">
                <button
                  type="button"
                  className="tab"
                  role="tab"
                  aria-selected={activeTab === 0}
                  onClick={() => handleTabClick(0)}
                >
                  For lecturers
                </button>
                <button
                  type="button"
                  className="tab"
                  role="tab"
                  aria-selected={activeTab === 1}
                  onClick={() => handleTabClick(1)}
                >
                  For students
                </button>
                <button
                  type="button"
                  className="tab"
                  role="tab"
                  aria-selected={activeTab === 2}
                  onClick={() => handleTabClick(2)}
                >
                  For HODs &amp; deans
                </button>
              </div>
              <div id="steps">
                {currentTab.steps.map((s, k) => (
                  <div key={k} className="step">
                    <b>{k + 1}</b>
                    <div>
                      <h3>{s[0]}</h3>
                      <p>{s[1]}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Simulated Live Screen */}
            <div className="scr in" ref={scrRef} aria-live="polite">
              <small id="st">{currentTab.title}</small>
              <div className="cd">
                <span>5</span>
                <span>9</span>
                <span>1</span>
                <span>3</span>
              </div>
              <div className="row">
                <span>Session length</span>
                <b>30 minutes</b>
              </div>
              <div className="row">
                <span>Venue boundary</span>
                <b>Set to your hall</b>
              </div>
              <div className="row">
                <span>Dr. Adeyemi’s class</span>
                <span className="ok" id="sl">{currentTab.badge}</span>
              </div>
              <div className="row">
                <span>Exam threshold</span>
                <b>75%</b>
              </div>
              <div className="lv">
                <span>Check-ins</span>
                <div className="trk">
                  <i></i>
                </div>
                <span>94/120</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Built on campus (#campus) */}
      <section id="campus">
        <div className="w">
          <h2>Born in the classroom. Tested against real campus constraints.</h2>
          <p className="lede">
            Presently was not conceived in a distant corporate boardroom. It grew out of first-hand exposure to the daily operational burden of Nigerian higher education at Lagos State University of Science and Technology (LASUSTECH).
          </p>
          <div className="cg">
            <div className="cc">
              <svg className="ill" viewBox="0 0 200 100" aria-hidden="true">
                <circle cx="100" cy="46" r="36" strokeDasharray="4 5" />
                {J_POINTS.map(([ox, oy], idx) => (
                  <circle
                    key={idx}
                    className="rd dot"
                    cx="100"
                    cy="46"
                    r="3.5"
                    style={{ '--x': `${ox}px`, '--y': `${oy}px` } as React.CSSProperties}
                  />
                ))}
                <g className="pin">
                  <circle className="dot" cx="100" cy="46" r="8" />
                  <path d="M96 46l3 3 5-6" style={{ stroke: '#FFCA0D' }} />
                </g>
                <text x="100" y="98" textAnchor="middle">5 readings, 1 verified fix</text>
              </svg>
              <h3>GPS drifts in concrete lecture theatres</h3>
              <p>Thick walls and crowded halls weaken satellite signals, so a single reading can’t be trusted.</p>
              <div className="fx">Presently takes multiple readings and checks them against your venue boundary.</div>
            </div>

            <div className="cc">
              <svg className="ill" viewBox="0 0 200 100" aria-hidden="true">
                {D_PHONES.map(([x, y, w, h, bars], k) => {
                  const cx = x + w / 2;
                  const cy = y + h / 2;
                  return (
                    <React.Fragment key={k}>
                      {Array.from({ length: bars }).map((_, m) => (
                        <rect
                          key={m}
                          className="bar dot"
                          style={{ '--t': `${0.3 + k * 0.4 + m * 0.1}s` } as React.CSSProperties}
                          x={cx - 7 + m * 5}
                          y={y - 4 - (m + 1) * 3}
                          width="3"
                          height={(m + 1) * 3}
                        />
                      ))}
                      <rect x={x} y={y} width={w} height={h} rx="6" />
                      <path d={`M${cx - 4} ${y + 6}h8`} />
                      <path
                        className="ck"
                        style={{ '--t': `${0.3 + k * 0.4}s` } as React.CSSProperties}
                        d={`M${cx - 5} ${cy}l4 4 7-8`}
                      />
                    </React.Fragment>
                  );
                })}
                <text x="100" y="98" textAnchor="middle">Any phone, one check-in</text>
              </svg>
              <h3>Mixed student smartphones</h3>
              <p>Many students use older Android phones with weaker sensors.</p>
              <div className="fx">Check-in stays light and works across a wide range of devices.</div>
            </div>

            <div className="cc">
              <svg className="ill" viewBox="0 0 200 100" aria-hidden="true">
                <rect x="22" y="30" width="26" height="46" rx="6" />
                <path d="M30 36h10" />
                <rect x="152" y="32" width="28" height="42" rx="4" />
                <path d="M158 42h16M158 52h16M158 62h8" />
                <path d="M56 54H146" strokeDasharray="3 5" opacity=".5" />
                <circle className="pk dot" cx="60" cy="54" r="4" />
                <path className="arc" d="M88 24a16 16 0 0 1 24 0" />
                <path className="arc" style={{ animationDelay: '.3s' }} d="M93 30a9 9 0 0 1 14 0" />
                <circle className="dot" cx="100" cy="35" r="2" />
                <text x="100" y="94" textAnchor="middle">Tiny payload, weak signal OK</text>
              </svg>
              <h3>Congested campus networks</h3>
              <p>When thousands connect at once, slow data is normal.</p>
              <div className="fx">The flow uses minimal data so check-in completes on a weak connection.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Stakeholders Section */}
      <section style={{ paddingTop: 0 }}>
        <div className="w">
          <h2>Value for every academic stakeholder.</h2>
          <p className="lede">
            Attendance management only works when it works for everyone, from the student sitting at the back of the lecture theatre to the Vice Chancellor reviewing faculty reports.
          </p>
          <div className="ag">
            <div className="ac">
              <span className="ic" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="12" rx="2" />
                  <path d="M8 20l4-4 4 4M7 9h6M7 12h10" />
                </svg>
              </span>
              <h3>University lecturers</h3>
              <ul>
                <li>Launch attendance in 20 seconds using your own lecture venue</li>
                <li>Reclaim 15–20 minutes of each lecture spent on sign-in sheets</li>
                <li>Detect and stop proxy sign-ins outside the venue boundary</li>
                <li>Export records in one click, with no tallying</li>
              </ul>
            </div>

            <div className="ac">
              <span className="ic" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M2 9l10-5 10 5-10 5zM6 11v5c3 2.5 9 2.5 12 0v-5" />
                </svg>
              </span>
              <h3>Students &amp; course reps</h3>
              <ul>
                <li>Check in directly from your own phone, without chasing a sheet</li>
                <li>See your attendance percentage against the exam threshold</li>
                <li>Stop worrying about lost or misplaced registers</li>
                <li>Settle disputes with a clear, verified record</li>
              </ul>
            </div>

            <div className="ac">
              <span className="ic" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <rect x="5" y="4" width="14" height="17" rx="2" />
                  <path d="M9 4h6v3H9zM9 17v-4M12 17v-6M15 17v-3" />
                </svg>
              </span>
              <h3>Heads of department</h3>
              <ul>
                <li>See department-wide attendance without waiting on lecturers</li>
                <li>Automate clearance lists for exam eligibility</li>
                <li>Review audit trails when a record is questioned</li>
                <li>Keep policy consistent across every course</li>
              </ul>
            </div>

            <div className="ac">
              <span className="ic" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M3 21h18M5 21V10l7-5 7 5v11M9 21v-6h6v6" />
                </svg>
              </span>
              <h3>Deans &amp; university leadership</h3>
              <ul>
                <li>Compare attendance across faculties and departments</li>
                <li>Hold a transparent standard for academic integrity</li>
                <li>Report on engagement with evidence, not estimates</li>
                <li>Scale a single approach across the whole campus</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Pricing (#pricing) */}
      <section id="pricing" style={{ paddingTop: 0 }}>
        <div className="w">
          <h2>Predictable plans. Built for Nigerian academics.</h2>
          <p className="lede">
            Start completely free for individual courses. Upgrade when managing multiple academic levels or rolling out across a full department.
          </p>
          <div className="pr">
            <div className="pl">
              <span className="ic" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M12 21v-8M12 13c0-4-3-6-7-6 0 4 3 6 7 6zM12 15c0-3 2-5 6-5 0 3-2 5-6 5z" />
                </svg>
              </span>
              <h3 style={{ fontSize: '24px' }}>Starter</h3>
              <div className="pp">Free</div>
              <small style={{ color: 'var(--mut)' }}>For individual lecturers trying Presently.</small>
              <ul>
                <li>1 active course</li>
                <li>Verified location check-in</li>
                <li>Student attendance dashboard</li>
                <li>Basic exports</li>
              </ul>
              <a className="btn g" href="#cta">Start free as lecturer</a>
            </div>

            <div className="pl f">
              <span className="ic" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M13 2L4 14h7l-1 8 9-12h-7z" />
                </svg>
              </span>
              <h3 style={{ fontSize: '24px' }}>Lecturer Pro</h3>
              <div className="pp">₦30,000</div>
              <small>per lecturer</small>
              <ul>
                <li>Unlimited courses and sessions</li>
                <li>Automated exam eligibility</li>
                <li>Full attendance reports</li>
                <li>Priority support</li>
              </ul>
              <a className="btn" href="#cta">Get Lecturer Pro</a>
            </div>

            <div className="pl">
              <span className="ic" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M12 3l9 5-9 5-9-5zM3 13l9 5 9-5" />
                </svg>
              </span>
              <h3 style={{ fontSize: '24px' }}>Department</h3>
              <div className="pp">₦200,000</div>
              <small style={{ color: 'var(--mut)' }}>per department</small>
              <ul>
                <li>Everything in Lecturer Pro</li>
                <li>HOD analytics and clearance lists</li>
                <li>Department-wide audit trails</li>
                <li>Onboarding for staff</li>
              </ul>
              <a className="btn g" href="#cta">Apply for Department</a>
            </div>
          </div>
        </div>
      </section>

      {/* Section: FAQ (#faq) */}
      <section id="faq" style={{ paddingTop: 0 }}>
        <div className="w">
          <h2>Frequently asked questions.</h2>
          <div className="fq">
            <details>
              <summary>How does location verification work in a university setting?</summary>
              <p>When a lecturer launches a session, they set the lecture venue. Each student’s check-in is compared against that boundary, and sign-ins from outside it are blocked.</p>
            </details>
            <details>
              <summary>What happens when indoor GPS accuracy fluctuates inside concrete lecture halls?</summary>
              <p>Presently allows for natural signal drift by using more than one reading, so students who are really in the room aren’t rejected.</p>
            </details>
            <details>
              <summary>What happens if a student’s phone battery is dead or they lack a smartphone?</summary>
              <p>Lecturers can handle exceptions on their side. Reach out and we’ll walk through the options for your class.</p>
            </details>
            <details>
              <summary>Can students check in from the hostel or from outside the classroom?</summary>
              <p>No. Check-in only works from within the venue boundary while a session is live.</p>
            </details>
            <details>
              <summary>Does Presently continuously track student location outside lecture hours?</summary>
              <p>No. Location is used only at the moment of check-in for an active session.</p>
            </details>
            <details>
              <summary>How does Presently assist with semester clearance?</summary>
              <p>Attendance is tallied automatically against your threshold, so eligibility lists are ready when the semester ends.</p>
            </details>
            <details>
              <summary>Can an individual lecturer start using Presently without formal institutional approval?</summary>
              <p>Yes. Start free as an individual lecturer and bring your department in when you’re ready.</p>
            </details>
            <details>
              <summary>How can an academic department or faculty request a demonstration?</summary>
              <p>Use the request form at the bottom of this page and we’ll arrange a campus demo.</p>
            </details>
          </div>
        </div>
      </section>

      {/* Call to Action (#cta) */}
      <div className="cta" id="cta">
        <div className="rg"></div>
        <div className="rg" style={{ animationDelay: '-3s' }}></div>
        <h2>Take attendance with confidence in your next lecture.</h2>
        <p>
          Whether you are an individual lecturer looking to reclaim 20 minutes of contact time or a Dean standardizing departmental records, Presently is ready for your classroom.
        </p>
        <a className="btn p" href="#top">Start free as lecturer</a> <a className="btn g" href="#faq">Request campus demo</a>
      </div>

      {/* Footer */}
      <footer>
        <div className="w">
          <div>
            <a className="logo" href="#top">
              <i></i>Presently
            </a>
            <p style={{ color: 'var(--mut)', fontSize: '15px', marginTop: '14px', maxWidth: '34ch' }}>
              Location-aware attendance infrastructure for Nigerian universities.
            </p>
          </div>
          <div>
            <h4>Platform</h4>
            <a href="#how">How it works</a>
            <a href="#campus">Built on campus</a>
            <a href="#pricing">Pricing</a>
          </div>
          <div>
            <h4>Institutions</h4>
            <a href="#cta">Request a demo</a>
            <a href="#faq">FAQ</a>
          </div>
          <div>
            <h4>Contact</h4>
            <a href="#cta">Get in touch</a>
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
          </div>
          <div className="fb">
            <span>© 2026 Presently. All rights reserved.</span>
            <span>Built in Nigeria, for Nigerian classrooms.</span>
            <div className="tg" role="group" aria-label="Colour theme" data-on={currentTheme}>
              <button
                type="button"
                data-th="light"
                aria-pressed={currentTheme === 'light'}
                onClick={() => applyTheme('light')}
              >
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
                </svg>
                Light
              </button>
              <button
                type="button"
                data-th="dark"
                aria-pressed={currentTheme === 'dark'}
                onClick={() => applyTheme('dark')}
              >
                <svg viewBox="0 0 24 24">
                  <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
                </svg>
                Dark
              </button>
            </div>
          </div>
        </div>
        <div className="wm" aria-hidden="true">
          Presently
        </div>
      </footer>
    </div>
  );
}
