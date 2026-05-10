# Presently — Landing Page Specification
> `landing.md` · v1.0
> Stack: Next.js + TailwindCSS + Framer Motion (or GSAP for scroll sequences)

---

## Overall Feel & Vibe

The landing page should feel like walking into a beautifully designed campus admin building
that somehow also feels like a tech startup — warmth and precision coexisting. The palette
is predominantly **black and off-white**, punctuated by bursts of **Sungold (#F5C518)** at
exactly the right moments. Nothing is cluttered. Everything breathes. Every section has a
clear *why* before the visitor can even form a question.

**Scroll feel:** Smooth, intentional. Sections don't just appear — they *arrive*.
Staggered fades. Gentle slides. A single dramatic parallax moment in the hero. The page
should feel like it's being narrated.

**Conversion logic:** The page answers three questions in order —
1. *What is this?* (Hero)
2. *Why should I care?* (Features + Role sections)
3. *Can I trust it?* (Social proof + Stats)
4. *How do I start?* (CTA finale)

---

## Navigation Bar

**Behaviour:** Transparent on hero scroll, transitions to frosted-glass
(`backdrop-blur: 20px, bg: rgba(13,13,13,0.85)`) on scroll-down. Smooth 300ms transition.

**Layout:**
```
[P◆ Presently]         [How it Works]  [For Schools]  [Pricing]  [Blog]       [Log In]  [Get Started →]
```

- Logo: wordmark in white (dark nav) or black (light sections)
- Nav links: Plus Jakarta Sans, 15px, weight 500, white/60 opacity, full white on hover
- "Get Started" button: Sungold bg, Black text, pill shape, slight glow on hover
- Mobile: hamburger → full-screen slide-in drawer with staggered link entrances

---

## Section 01 — Hero

**Vibe:** Dramatic. Bold. Immediately clear. The headline should land like a statement, not
a question.

**Layout:** Two-column asymmetric grid (inspired by Ranty's text/image balance)

### Left Column (60%)
**Eyebrow label** (small, tracked caps, Sungold):
`◆ GPS-VERIFIED ATTENDANCE`

**Headline** (Tan Nimbus, display-xl, Black/White depending on bg, 3-line max):
```
Attendance
that actually
knows you're there.®
```
*The ® is a small superscript — winking reference to Ranty's registered mark detail.*

**Subheadline** (Plus Jakarta Sans, 18px, Slate 400):
```
Presently ends roll calls, paper sheets, and proxy attendance
— for students, lecturers, and institutions that mean business.
```

**CTA Row:**
- Primary: `Start for free →` (Sungold pill button, 52px height)
- Secondary: `Watch how it works ▶` (ghost button with subtle underline)
- Below CTAs: small avatar row (3–4 user avatars) + `"Trusted by 200+ students across Lagos"`

**Animation:** Headline words stagger in (translateY: 40px → 0, opacity: 0 → 1) with
60ms delay between lines. CTAs fade up last. Total entrance: ~800ms.

### Right Column (40%)
**Hero visual:** Stack of three overlapping phone mockups (slight tilt, each offset):
1. **Back:** Student dashboard — upcoming session, schedule
2. **Middle:** Live attendance marking screen — GPS pin pulsing in Sungold
3. **Front (largest):** Check-in success screen — green badge, "You're Present ✓"

Floating elements around phones:
- Sungold pill badge: `✓ 3-second check-in`
- Small card: GPS icon + `"Location verified · LASUSTECH Block D"`
- Attendance stat card: `94.7% attendance rate` with tiny bar chart in Sungold

**Animation:** Phones entrance: scale(0.9) → 1, translateY(30px) → 0 with spring easing.
Floating badges animate in 200ms after phones. GPS pin pulses infinitely.

**Background:** Deep black (`#0D0D0D`) with a very subtle radial gradient bloom in
`rgba(245,197,24,0.06)` behind the hero visual. No noise texture — clean.

---

## Section 02 — Social Proof Bar (Marquee)

**Full-width, dark background, seamless infinite scroll (horizontal)**

Content (alternating text and small logos/avatars):
```
"Finally, no more roll calls" — Final-year student, LASUSTECH
◆  200+ Students Enrolled  ◆
"My attendance sheet exports in one click" — Dr. Adeyemi, Lecturer
◆  GPS Verified · Always Accurate  ◆
"The Dean loves the reports" — Faculty Admin, School of Science
◆  Works Offline Too  ◆
```

Style: Plus Jakarta Sans 15px, Slate 400 text, Sungold ◆ dividers, 40px height strip.
Speed: 40s linear loop. Pause on hover.

---

## Section 03 — How It Works

**Vibe:** Light background (`#F9F7F3`), editorial, instructional without being boring.
Three steps with animated illustration per step.

**Section label** (Sungold caps): `THE FLOW`

**Headline** (Tan Nimbus, display-md):
```
Three steps.
Zero friction.
```

**Layout:** Horizontal tab/stepper on desktop. Vertical stacked on mobile.

### Steps:

**Step 01 — Lecturer Opens a Session**
- Icon: laptop + broadcast signal
- Copy: "In one tap, a lecturer creates a live session. Students in range get notified
  instantly — no announcement needed."
- Illustration: Tablet mockup showing "Create Session" screen with a live timer starting

**Step 02 — Students Check In (Automatically or Manually)**
- Icon: phone + GPS pin
- Copy: "Students open Presently and check in. GPS confirms they're on campus. No codes
  to type. No paper to sign."
- Illustration: Phone mockup showing check-in screen, GPS pin pulsing, then → success state

**Step 03 — Records Are Instant**
- Icon: chart + export arrow
- Copy: "Every check-in is timestamped and stored. Attendance sheets, reports, and exports
  are ready before the class ends."
- Illustration: Dashboard mockup with attendance table, export button highlighted in Sungold

**Animation:** Steps use a scroll-triggered tab switcher. As user scrolls through the section,
the active step slides in with translateX, while phone illustration transitions between screens.

---

## Section 04 — Role-Based Value (The "For You" Section)

**Vibe:** Dark background, warm. Each role gets a card/panel that speaks *directly* to them.
Inspired by Area's coloured sections with strong type.

**Section label** (Sungold caps): `BUILT FOR EVERYONE IN THE ROOM`

**Headline** (Tan Nimbus, display-md, White):
```
Whoever you are,
Presently works for you.
```

**Layout:** 3-column card grid on desktop. Single column stack on mobile.

### Card 01 — Students
**Accent colour:** Sungold border-left
**Icon:** Graduation cap
**Title:** `"No stress. Just show up."`
**Body:** "Check in from your phone the moment you walk in. See your attendance percentage
in real time. Never be surprised before exams."
**Feature list:**
- ✓ 3-second GPS check-in
- ✓ Real-time attendance dashboard
- ✓ Notifications before you fall below threshold
- ✓ Works even on slow data

**Micro-illustration:** Half-screen phone mockup showing student dashboard with an
attendance ring chart (Sungold fill, animated on scroll-enter).

### Card 02 — Lecturers
**Accent colour:** Sky Teal border-left
**Icon:** Chalkboard / presentation
**Title:** `"Attendance handled before you say good morning."`
**Body:** "Open a session, teach, close it. Your register is already filled. Export to
PDF or CSV whenever you need it. No chasing, no paperwork."
**Feature list:**
- ✓ One-tap session creation
- ✓ Live attendance feed during class
- ✓ Auto-generated reports
- ✓ Excuse request management

**Micro-illustration:** Half-screen phone/tablet mockup showing live attendance list,
names appearing with green badges in real time.

### Card 03 — Schools & Institutions
**Accent colour:** Moss Green border-left
**Icon:** Building / institution
**Title:** `"Visibility across every faculty, every day."`
**Body:** "A live institutional dashboard. Attendance trends. Compliance reports.
Everything an HOD, Dean, or registrar needs — without asking anyone for a file."
**Feature list:**
- ✓ Multi-faculty dashboard
- ✓ Audit-ready exports
- ✓ Role-based staff access
- ✓ Semester & session analytics

**Micro-illustration:** Web dashboard mockup (slightly wider, laptop-framed) showing
faculty-wide attendance heat map.

**Card animation:** Cards slide up and fade in sequentially (80ms stagger) on scroll entry.

---

## Section 05 — Feature Deep-Dive (Bento Grid)

**Vibe:** White background, structured, satisfying grid. Inspired by the clean bento
layouts common in SaaS. Each cell highlights one power feature.

**Section label** (Sungold caps): `WHAT'S UNDER THE HOOD`

**Headline** (Tan Nimbus, display-md):
```
Powerful features.
Quietly in the background.
```

**Grid layout (desktop): 12-col, 2 rows**

```
┌─────────────────────┬────────────┬────────────┐
│                     │            │            │
│   GPS Verification  │  Offline   │  Real-time │
│   (large, 6-col)    │   Mode     │    Feed    │
│                     │  (3-col)   │  (3-col)  │
├──────────┬──────────┴────────────┴───────┬────┤
│  Export  │   Role-Based Access Control   │    │
│  Reports │        (6-col)                │    │
│  (3-col) │                               │    │
└──────────┴───────────────────────────────┘────┘
```

### Feature Cells:

**GPS Verification** (large hero cell, dark bg)
- Headline: "You can't check in from your dorm."
- Body: GPS + wifi triangulation verifies campus presence. No VPNs, no spoofing.
- Visual: Animated map thumbnail with a Sungold pin dropping

**Offline Mode** (medium cell)
- Headline: "Poor signal? No problem."
- Body: Check-ins queue locally and sync when connection returns.
- Visual: Phone illustration with offline badge → sync icon

**Real-time Attendance Feed** (medium cell)
- Headline: "Watch your class fill up."
- Visual: Live list with names and timestamps animating in

**Export Reports** (small cell)
- Headline: "One click to PDF."
- Visual: Export button + document icon

**Role-Based Access** (large cell, Pale Honey bg)
- Headline: "Everyone sees exactly what they should."
- Body: Students see theirs. Lecturers see their class. Admins see everything.
- Visual: Three-level hierarchy diagram in Sungold/Black

---

## Section 06 — Stats & Trust

**Vibe:** Black background, editorial, counter animations. Confident and grounded.

```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│   200+       │   94.7%      │   3 sec      │   1          │
│  Students    │  Avg attend. │  Check-in    │  University  │
│              │  rate        │  time        │  (and growing│
└──────────────┴──────────────┴──────────────┴──────────────┘
```

Numbers count up from 0 on scroll-entry (Tan Nimbus, display-lg, Sungold colour).
Labels in Plus Jakarta Sans, Slate 400.

Below stats — a single quote testimonial (large, Tan Nimbus italic, White):
```
"Presently didn't just fix attendance tracking.
It changed how we think about student accountability."
— Dr. [Name], Dean of Student Affairs
```

---

## Section 07 — Mobile App Showcase

**Vibe:** Light warm background (`#FAF5EB`), feels like a product showcase in a magazine.

**Headline** (Tan Nimbus, display-md):
```
Beautiful on every screen.
Effortless in every pocket.
```

**Layout:** Wide horizontal scroll snap on mobile. Fixed layout on desktop.

Four phone mockups displayed in a slight arc/stagger:

**Screen 1:** Onboarding — role selection (Student / Lecturer / Admin)
  - Clean, full-bleed illustration behind the selection cards
  - Sungold highlight on selected role

**Screen 2:** Student home dashboard
  - Upcoming sessions timeline
  - Attendance ring chart (Sungold fill)
  - Quick check-in floating button (Sungold, bottom center)

**Screen 3:** Live check-in flow
  - GPS map background (campus area)
  - Sungold pulsing pin at user's location
  - "Confirming location..." → "You're Present ✓" transition

**Screen 4:** Attendance history
  - Calendar heat map view
  - Monthly breakdown bar chart
  - Subject-by-subject list with status badges

**Animation:** On desktop, as user scrolls, phones gently parallax at different rates
(foreground phone moves slightly faster than background phones). Subtle floating effect.

---

## Section 08 — FAQ

**Vibe:** Clean, light, accordion-style. Off-White background.

**Headline** (Tan Nimbus, display-md):
```
Questions you'll have.
Answered already.
```

Accordion items (Plus Jakarta Sans, 17px):
- "Does it work without internet?"
- "Can students spoof their GPS location?"
- "What happens if a student's phone dies mid-class?"
- "Does my school need to pay for students to use it?"
- "Can lecturers edit attendance records after submission?"
- "Is student data safe and private?"

**Style:** Each accordion item has a Sungold `+` → `−` toggle icon. Smooth max-height
transition on expand. No borders, clean divider lines only.

---

## Section 09 — Final CTA

**Vibe:** Full-width dark section, high-contrast, singular focus. The page's emotional
climax — it should feel like a quiet invitation, not a shout.

**Background:** `#0D0D0D` with a very subtle Sungold radial glow centred behind the text.

**Headline** (Tan Nimbus, display-xl, White, centred):
```
Every class.
Every student.
Present.
```

**Subtext** (Plus Jakarta Sans, 18px, Slate 400, centred):
```
Join institutions already running smarter with Presently.
Setup takes less than 5 minutes.
```

**CTAs (centred, stacked on mobile):**
- Primary: `Get started for free →` (Sungold, pill, large — 56px height)
- Secondary: `Request a school demo` (White outline pill)

**Below CTAs:**
Small trust signals in a row:
`🔒 Secure & private  ·  📱 iOS & Android  ·  🌍 Works in Nigeria  ·  ✓ Free to start`

---

## Footer

**Background:** `#141414`

**Layout:**
```
[P◆ Presently]                          [Twitter] [Instagram] [LinkedIn]

Product         Company          Resources        Legal
How it Works    About            Blog             Privacy Policy
For Schools     Contact          Changelog        Terms of Service
Pricing         Careers          Help Center

© 2025 Presently. GPS-Verified Attendance.        Made with care in Lagos, Nigeria. 🇳🇬
```

Footer type: Plus Jakarta Sans, 14px, Slate 400. Links lighten on hover.
Brand tagline in Sungold: "GPS-Verified Attendance."

---

## Animation Choreography Summary

| Element                    | Animation                                | Trigger       |
|----------------------------|------------------------------------------|---------------|
| Hero headline              | Staggered word slide-up                  | Page load     |
| Hero phones                | Scale + fade in with spring easing       | Page load     |
| Floating badges            | Fade + translateY with delay             | After phones  |
| Section headings           | Fade-up 24px on scroll entry             | Scroll        |
| Role cards                 | Staggered slide-up (80ms gap)            | Scroll        |
| Stat counters              | Count from 0 to value                    | Scroll        |
| Bento cells                | Staggered fade-scale from center         | Scroll        |
| App screen mockups         | Parallax scroll at different depths      | Scroll        |
| Marquee bar                | Infinite horizontal scroll               | Continuous    |
| GPS pin (hero + how-it-works) | Pulse ripple in Sungold               | Continuous    |
| CTA button                 | Gentle glow pulse every 4s when idle     | Continuous    |
| Accordion                  | max-height ease-out expand               | Click         |
| Nav background             | Transparent → frosted glass              | Scroll        |

---

## Responsive Breakpoints

| Breakpoint | Width    | Key Changes                                        |
|------------|----------|----------------------------------------------------|
| Mobile     | < 640px  | Single column, stacked CTAs, horizontal scroll     |
| Tablet     | 640–1024 | 2-col cards, condensed nav, tablet mockup visible  |
| Desktop    | 1024+    | Full layout as specified                           |
| Wide       | 1440+    | Max-width container centred, hero gets more space  |

---

*End of Presently Landing Page Specification*
*Companion document: `presently-design.md`*
