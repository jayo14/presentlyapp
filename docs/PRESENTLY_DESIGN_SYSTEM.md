# Presently: Reusable Design System, Wireframes & Component Specs

**Product:** Presently (Nigerian Tertiary Education Attendance Platform)  
**Document:** Visual Direction, Token Architecture, Wireframe Blueprints & Component Catalog  
**Date:** November 2026

---

## 1. Visual Direction & Design Philosophy

Presently’s visual direction is anchored in **Institutional Gravitas meets Modern SaaS Ergonomics**.

### Guiding Principles:
- **Academic Seriousness:** The interface communicates trust, rigor, and administrative competence. It should look natural when projected in a university senate chamber or viewed on a lecturer's laptop in a faculty office.
- **Clarity Over Flash:** Zero unnecessary floating particles, zero glowing neon gradients, and zero pseudo-3D tilt gimmicks that slow down budget devices.
- **Warmth and Humanity:** Uses warm stone, paper creams, and deliberate golden accents rather than cold, sterile corporate blues or fluorescent purple crypto palettes.
- **Mobile-First Utility:** Built for lecturers and students holding phones in crowded amphitheaters. Big touch targets (minimum 44x44px), high text contrast, and instant visual verification states.

---

## 2. Design System Tokens

### 2.1 Color Palette
```css
/* Core Brand Colors */
--color-gold-500: #F9C406;         /* Primary brand accent - Sungold */
--color-gold-600: #D8A700;         /* Hover state for primary actions */
--color-gold-100: #FEF8E6;         /* Soft gold background tint */
--color-gold-50:  #FFFDF5;         /* Ultra-subtle gold warmth */

--color-charcoal-900: #1B1811;     /* Deep institutional text / dark background */
--color-charcoal-800: #231F0F;     /* Primary brand dark neutral */
--color-charcoal-700: #363223;     /* Muted dark surface */

/* Neutral & Surface Scales (Light Mode) */
--color-bg-base: #FBF9F4;          /* Warm academic stone background */
--color-surface-card: #FFFFFF;     /* Clean elevated card */
--color-surface-subtle: #F5F2EB;   /* Secondary card / input fill */
--color-border-subtle: #E8E3D7;    /* Structural dividing lines */
--color-border-focus: #F9C406;     /* Active focus outline */

/* Neutral & Surface Scales (Dark Mode) */
--color-dark-bg: #12110D;          /* Deep warm dark background */
--color-dark-surface: #1B1812;     /* Dark elevated card */
--color-dark-surface-high: #26221A;/* Higher elevation dark card */
--color-dark-border: #302C22;      /* Dark subtle structural line */

/* Functional Semantic Colors */
--color-success: #15803D;          /* Verified check-in green (4.5:1 compliant) */
--color-success-bg: #DCFCE7;       /* Success pill background */
--color-warning: #B45309;          /* Distance warning amber */
--color-warning-bg: #FEF3C7;       /* Warning pill background */
--color-error: #B91C1C;            /* Out-of-bounds red */
--color-error-bg: #FEE2E2;         /* Error pill background */
```

### 2.2 Typography Hierarchy
- **Headline Font:** `Plus Jakarta Sans`, `Inter`, sans-serif (Authoritative, clean, professional).
- **Body Font:** `Outfit`, `Inter`, system-ui, sans-serif (High legibility at small sizes).
- **Monospace Font:** `JetBrains Mono`, monospace (Session PINs, course codes, timestamps).

| Token | Size / Line Height | Weight | Usage |
| :--- | :--- | :--- | :--- |
| `display-2xl` | 56px / 1.1 | Bold (700) | Homepage Hero Title |
| `display-xl` | 40px / 1.15 | SemiBold (600) | Major Section Headings |
| `display-lg` | 32px / 1.2 | SemiBold (600) | Subsection Headings / Card Titles |
| `heading-md` | 24px / 1.3 | SemiBold (600) | Feature Titles, Modal Headers |
| `body-lg` | 18px / 1.6 | Regular (400) | Hero Lead, Section Intro Paragraphs |
| `body-md` | 15px / 1.5 | Regular (400) | Card Descriptions, Table Data |
| `body-sm` | 13px / 1.4 | Medium (500) | Badges, Micro-copy, Timestamps |
| `code-pin` | 32px / 1.0 | Bold (700) | 4-Digit Attendance Verification Code |

### 2.3 Spacing, Radius & Elevation Tokens
- **Radius:**
  - `rounded-pill`: `9999px` (Badges, primary buttons)
  - `rounded-card`: `16px` / `1rem` (Content containers, workflow cards)
  - `rounded-nested`: `10px` (Inner buttons, status items)
- **Borders & Dividers:** `1px solid var(--border-subtle)` (Crisp, architectural delineation).
- **Shadows:** Restrained, non-diffuse shadows (`shadow-sm`, `shadow-md`), avoiding excessive blurry dark shadows.

---

## 3. Homepage Wireframe Architecture

### 3.1 Desktop Wireframe (1280px - 1440px Viewport)
```
+--------------------------------------------------------------------------------------------------+
| [Logo: Presently]       Product   How It Works   LASUSTECH Story   For Institutions   Pricing    |
|                                                     [Sign In]  [Request Demo]  [Start Free →]    |
+--------------------------------------------------------------------------------------------------+
|                                                                                                  |
| [Kicker: Built for Nigerian Tertiary Institutions]                                               |
|                                                                                                  |
| Accurate lecture attendance.                                 +---------------------------------+ |
| Built for the reality of                                     | LECTURER ACTIVE SESSION         | |
| Nigerian universities.                                       | Course: CSC 301 (3 Units)       | |
|                                                              | Room: LT-02 (Faculty of Science)| |
| Replace circulating paper sheets with location-aware         | Session PIN: [ 8 4 9 2 ]        | |
| verification. Lecturers create sessions in seconds;          | Geofence Radius: 45 metres      | |
| students confirm presence on their own mobile devices.       | Verified Check-ins: 87 / 94     | |
|                                                              | [End Session]  [Export CSV]     | |
| [Start Free as Lecturer →]    [Request Institutional Demo]   +---------------------------------+ |
|                                                              | STUDENT CHECK-IN PASS           | |
| [✓] No biometric hardware required                           | Status: Location Verified       | |
| [✓] Works on standard smartphones                            | Time: 10:14 AM | Venue: LT-02   | |
| [✓] Instant CSV semester export                              +---------------------------------+ |
+--------------------------------------------------------------------------------------------------+
| GROUNDED CONTEXT BAR: Tested in real lecture halls at LASUSTECH. Engineered for real campus data.|
+--------------------------------------------------------------------------------------------------+
| THE CAMPUS REALITY (THE PROBLEM):                                                                |
| +-------------------------+ +-------------------------+ +--------------------------------------+ |
| | 1. 45-Min Paper Shuffle | | 2. Rampant Proxy Sign-in| | 3. End-of-Semester Clearance Crisis  | |
| | Sheets passed row-by-row| | Friends sign for absentees| Lecturers count tick marks manually | |
| +-------------------------+ +-------------------------+ +--------------------------------------+ |
+--------------------------------------------------------------------------------------------------+
| HOW IT WORKS (3 Simple Steps by Role):                                                           |
| [Role Switcher:  Lecturers  |  Students  |  Department Heads / Admins]                           |
| Step 1: Open Course & Launch Session (Set hall radius)                                           |
| Step 2: Share Dynamic 4-Digit PIN with students physically in the room                           |
| Step 3: Monitor Live Verified Check-ins and Download Instant Attendance Register                 |
+--------------------------------------------------------------------------------------------------+
| AUTHENTIC PRODUCT SHOWCASE:                                                                      |
| [Interactive Tab Strip: Session Launcher | Student Check-in Pass | Exam Clearance Roster]        |
| Realistic screen display showing exact field values, student matriculation numbers, and exports.  |
+--------------------------------------------------------------------------------------------------+
| THE LASUSTECH JOURNEY:                                                                           |
| Real academic roots. Real lecture hall testing. Real lessons in engineering fault tolerance.     |
| - GPS attenuation inside multi-story concrete buildings -> Configurable boundary tolerances.    |
| - Diverse student smartphone hardware -> Ultra-lightweight browser client (<15KB payload).       |
| - Network dead zones -> Failsafe offline-tolerant token buffer and lecturer manual check.        |
+--------------------------------------------------------------------------------------------------+
| AUDIENCE VALUE PROPOSITIONS:                                                                     |
| [For Lecturers]       [For Students]       [For Heads of Dept]       [For University Leadership] |
+--------------------------------------------------------------------------------------------------+
| TRUST, PRIVACY & PRACTICAL SAFEGUARDS:                                                           |
| [No Background Tracking]   [Isolated Data Privacy]   [Manual Fallback Override]   [Role Security]|
+--------------------------------------------------------------------------------------------------+
| TRANSPARENT PRICING:                                                                             |
| [Starter: Free]        [Lecturer Pro: ₦3,000/mo]   [Department: ₦200,000/yr]   [Institution: Call]|
+--------------------------------------------------------------------------------------------------+
| REAL CAMPUS FAQ (8 Key Questions Answered Directly):                                             |
| [Accordion list covering GPS drift, network loss, no smartphone, privacy, demo process]          |
+--------------------------------------------------------------------------------------------------+
| FINAL CALL TO ACTION:                                                                            |
| Lecturers: [Create Free Account]   |   Institutions: [Request a 15-Minute Campus Demonstration]  |
+--------------------------------------------------------------------------------------------------+
| FOOTER: Product | Legal & Academic Policies | Support | Institutional Inquiries                  |
+--------------------------------------------------------------------------------------------------+
```

---

## 4. Reusable Component Specifications

### Component 1: `Navbar`
- **Props:** Active section anchor, theme toggle callback.
- **States:** Default (transparent at top), Scrolled (clean glass/stone backdrop with subtle border, no heavy distortion), Mobile Open (full drawer with role-based primary actions).
- **Accessibility:** `aria-label="Main Navigation"`, focus outlines on keyboard tab, `Escape` key closes mobile drawer.

### Component 2: `HeroSessionCard` (Authentic Lecturer & Student Preview)
- **Purpose:** Replace abstract glowing dashboards with a high-fidelity representation of an active Nigerian university lecture session.
- **Data displayed:**
  - Course Code: `CSC 301 - Operating Systems`
  - Venue: `Faculty of Science Amphitheatre (LT-02)`
  - Active Session PIN: `8492` (Large mono digits with active countdown ring)
  - Geofence Threshold: `45m radius` (Active GPS indicator)
  - Verified Students: `87 of 94 enrolled (92.5%)`
  - Real-time student stream: Matric numbers with check-in timestamps and verification status.

### Component 3: `CampusChallengeCard`
- **Purpose:** Portray common lecture hall pain points accurately without overdramatizing.
- **Elements:** Minimal numeric tag (`01`, `02`, `03`), icon badge, title, realistic description of campus friction, and the direct presently resolution.

### Component 4: `RoleWorkflowTabs`
- **Purpose:** Intuitive switch between Lecturer, Student, and Administrator workflows.
- **States:** Selected role pill highlighted in Presently Sungold; sub-steps animate smoothly with step numbers, clear action labels, and UI snippets.

### Component 5: `LasustechStorySection`
- **Purpose:** Tell the authentic campus origin story with integrity.
- **Structure:**
  - Origin narrative card with academic focus.
  - 3 Engineering Reality & Adaptation cards (GPS in concrete halls, device variability, network drops).
  - Explicit institutional boundary disclaimer: *"Testing and development in the LASUSTECH campus environment demonstrated practical viability under real conditions. This does not represent an exclusive institutional endorsement."*

### Component 6: `PricingTable`
- **Purpose:** Clear presentation of the 4 tiers (Starter, Pro, Department, Institutional).
- **Clarity Rules:** Clearly show what is included in Starter (free forever for 1 course); avoid claiming nonexistent enterprise features.

### Component 7: `CampusFAQAccordion`
- **Purpose:** Dispel real user skepticism with factual, direct answers.
- **Accessibility:** Fully accessible accordion with keyboard navigation, `aria-expanded` toggle, and clean height transitions.

---

## 5. Interaction & Animation Rules

1. **Duration:** 150ms to 250ms for micro-interactions (hover, active tap, tab switch). 400ms for larger section transitions.
2. **Easing:** `cubic-bezier(0.16, 1, 0.3, 1)` (smooth deceleration, zero spring oscillation/bouncing).
3. **Respect Reduced Motion:** Wrap all Framer Motion components with `@media (prefers-reduced-motion: reduce)` safe variants (instant opacity transition instead of spatial displacement).
4. **Touch targets:** All interactive buttons and toggles strictly minimum 44px by 44px with 8px touch margins.
