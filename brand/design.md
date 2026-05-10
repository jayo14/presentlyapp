# Presently — Design System & Brand Identity
> Version 1.0 · GPS-Verified Attendance, Reimagined

---

## 01 · Brand Philosophy

**Presently** sits at the intersection of institutional trust and student-first warmth.
It is serious enough for a Dean to sign procurement paperwork, approachable enough that a
first-year student opens it without dread, and premium enough to live on the home screen
of every lecturer's phone without embarrassment.

**Brand personality:** Confident. Warm. Precise. Modern-African.

**Brand promise:** *"Every class. Every student. Present."*

**Brand voice:** Friendly authority — the kind a favourite lecturer carries. Short
sentences. Active verbs. No corporate jargon. A little wit where it fits.

---

## 02 · Colour Palette

```
┌─────────────────────────────────────────────────────────────┐
│  PRESENTLY COLOUR SYSTEM                                     │
├─────────────────────────────────────────────────────────────┤
│  PRIMARY                                                     │
│  ● Sungold       #F5C518   Primary actions, highlights       │
│  ● Deep Amber    #D4A017   Hover / pressed states            │
│  ● Pale Honey    #FEF3C7   Backgrounds, subtle fills         │
│                                                             │
│  NEUTRAL (anchors the palette)                               │
│  ● Presently Black  #0D0D0D   Headlines, heavy type          │
│  ● Charcoal         #1A1A1A   Cards on dark surfaces         │
│  ● Slate 800        #1E293B   Body text                      │
│  ● Slate 400        #94A3B8   Placeholder / muted text       │
│  ● Off-White        #F9F7F3   Page backgrounds (light mode)  │
│  ● Pure White       #FFFFFF   Cards, modals                  │
│                                                             │
│  ACCENT                                                      │
│  ● Warm Ivory    #FAF5EB   Warm section backgrounds          │
│  ● Moss Green    #4A7C59   Confirmation / present state      │
│  ● Soft Coral    #E87461   Absent state / alerts             │
│  ● Sky Teal      #2E9CCA   Info chips / links                │
└─────────────────────────────────────────────────────────────┘
```

### Usage Rules
- **Sungold** is reserved for primary CTAs, active states, and brand marks. Never dilute it.
- **Presently Black + Sungold** is the signature pairing — use it for hero sections and
  marketing surfaces.
- Dark surfaces use `#1A1A1A` cards on `#0D0D0D` backgrounds. Light surfaces use `#FFFFFF`
  cards on `#F9F7F3`.
- Moss Green and Soft Coral are *semantic only* — attendance status, never decorative.

---

## 03 · Typography

### Type Scale

| Token        | Font                  | Weight | Size (desktop) | Usage                  |
|--------------|-----------------------|--------|----------------|------------------------|
| `display-xl` | **Tan Nimbus**        | 700    | 80–96px        | Hero headlines         |
| `display-lg` | Tan Nimbus            | 700    | 56–72px        | Section headlines      |
| `display-md` | Tan Nimbus            | 600    | 40–48px        | Sub-headings           |
| `heading-lg` | **Plus Jakarta Sans** | 700    | 28–32px        | Card titles, UI heads  |
| `heading-md` | Plus Jakarta Sans     | 600    | 20–24px        | Panel titles           |
| `body-lg`    | Plus Jakarta Sans     | 400    | 18px           | Marketing body copy    |
| `body-md`    | Plus Jakarta Sans     | 400    | 15–16px        | App UI text            |
| `body-sm`    | Plus Jakarta Sans     | 400    | 13–14px        | Captions, labels       |
| `mono`       | **JetBrains Mono**    | 400    | 13px           | Attendance codes, IDs  |

**Tan Nimbus** — Elegant serif with editorial weight. Gives Presently a premium, modern
African-cosmopolitan character. Use only for display sizes.

**Plus Jakarta Sans** — Clean, geometric grotesque. Warm and readable. Distinct enough
to feel branded at UI scale.

**JetBrains Mono** — Attendance session codes, check-in tokens, system IDs only.

### Typographic Principles
- Headlines: tight letter-spacing (`-0.03em`), high contrast against background.
- Body copy: comfortable line-height (`1.65`), max line width `68ch`.
- Never stack more than two typefaces in a single view.
- ALL-CAPS only for labels, badges, and navigation — never full paragraphs.

---

## 04 · Spacing & Layout

```
Base unit: 4px
Scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128px

Container max-width: 1280px
Content max-width:   960px (editorial sections)
Gutter (desktop):    80px
Gutter (mobile):     20px
Column grid:         12-col desktop / 4-col mobile
Border-radius scale: 4px (inputs), 12px (cards), 20px (panels), 9999px (pills/buttons)
```

---

## 05 · Elevation & Depth

Three levels of elevation using shadow + blur:

```css
--shadow-sm:  0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06);
--shadow-md:  0 4px 16px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06);
--shadow-lg:  0 16px 40px rgba(0,0,0,0.14), 0 4px 16px rgba(0,0,0,0.08);
--shadow-gold: 0 8px 32px rgba(245,197,24,0.22);   /* glow for CTAs */
```

---

## 06 · Iconography

- Icon library: **Lucide** (consistent stroke width 1.5px, never filled variants)
- Icon sizes: 16px (inline), 20px (UI), 24px (feature), 32px (illustrative)
- Custom icon mark: The Presently "P◆" — a bold serif P with a small diamond/location
  pin embedded in the counter. Used as favicon, app icon, and brand stamp.

---

## 07 · Component Tokens

### Buttons

```
Primary:    bg=Sungold  text=Black   radius=9999px  px=28  py=14  font-weight=600
Secondary:  bg=Black    text=White   radius=9999px  px=28  py=14  font-weight=600
Outline:    border=Black text=Black  radius=9999px  px=28  py=14  font-weight=600
Ghost:      bg=transparent text=Black underline on hover
Destructive: bg=Soft-Coral text=White
```

Primary button has a subtle `--shadow-gold` glow on hover + 2px upward translate.

### Cards

```
Light card: bg=White  border=1px solid #E2E8F0  radius=20px  shadow=--shadow-md
Dark card:  bg=#1A1A1A border=1px solid #2A2A2A radius=20px  shadow=--shadow-lg
Gold accent card: left-border=4px solid Sungold
```

### Badges / Status Chips

```
Present:  bg=#D1FAE5  text=#065F46  icon=check-circle
Absent:   bg=#FEE2E2  text=#991B1B  icon=x-circle
Late:     bg=#FEF3C7  text=#92400E  icon=clock
Excused:  bg=#EFF6FF  text=#1E40AF  icon=info
```

### Input Fields

```
border-radius: 12px
border: 1.5px solid #CBD5E1
focus-border: 1.5px solid Sungold + box-shadow: 0 0 0 3px rgba(245,197,24,0.15)
height: 48px (desktop), 52px (mobile — thumb-friendly)
```

---

## 08 · Motion & Animation

### Principles
- **Purposeful**: every animation communicates state or guides attention. Zero decoration.
- **Fast**: enter animations 300–450ms. Exit 150–200ms. Never feel sluggish.
- **Easing**: `cubic-bezier(0.16, 1, 0.3, 1)` for entrances (snappy ease-out).
  `cubic-bezier(0.7, 0, 1, 1)` for exits (quick ease-in).

### Core Animation Tokens

```css
--ease-in:       cubic-bezier(0.7, 0, 1, 1);
--ease-out:      cubic-bezier(0.16, 1, 0.3, 1);
--ease-spring:   cubic-bezier(0.34, 1.56, 0.64, 1);   /* slight overshoot */
--duration-fast: 150ms;
--duration-base: 300ms;
--duration-slow: 500ms;
```

### Interaction Patterns
- **Page load**: staggered fade-up (translateY 24px → 0, opacity 0 → 1) in 60ms steps
- **CTA hover**: 2px translateY up + gold shadow bloom
- **Card hover**: 4px translateY up + shadow intensify
- **Attendance mark**: GPS pin animates to fixed location with ripple pulse in Sungold
- **Number counters**: count-up animation on scroll-enter (stats sections)
- **Mobile check-in button**: scale pulse (1.0 → 1.05 → 1.0) every 3s when idle, signalling interactivity
- **Skeleton loaders**: shimmer in Pale Honey → White direction

---

## 09 · Photography & Illustration Style

### Photography
- Warm, natural light — classrooms, campuses, outdoor study settings
- Diverse representation of Nigerian university life (varied ethnic backgrounds,
  dress styles, ages)
- Slightly warm colour grade (+10 warmth, slight vignette)
- Never stock-photo generic; always feel authentic and lived-in

### App Screen Illustrations
- Device: clean flat-angle iPhone and Android mockups in Presently Black frame
- Screens: real Presently UI rendered inside — no fake/placeholder UI
- Positioning: slight tilt (3–8°) for personality, never perfectly orthogonal
- Drop shadow: `--shadow-lg` beneath the device
- Allowed overlaps: floating stat cards, annotation bubbles, GPS pin indicators floating
  outside the phone frame

### Illustration / Icons (Marketing)
- Line-art style with Sungold accents
- Abstract GPS/map motifs; attendance bars; student-lecturer connection arcs
- Never clip-art or overly literal

---

## 10 · Logo & Brand Mark

### Wordmark
- **"Presently"** set in Tan Nimbus, Bold, tracked at -0.02em
- The dot on the `i` replaced with a small ◆ diamond (location-pin metaphor)
- Colour: `#0D0D0D` on light / `#F5C518` on dark

### Brand Mark (icon only)
- Bold geometric `P` with a diamond/pin integrated into the counter
- Minimum size: 24px
- App icon: Sungold `#F5C518` background, Black brand mark centred, corner radius 22%

### Logo Clearspace
- Minimum clearspace = height of the `P` character on all sides

---

## 11 · Tone & Messaging Framework

| Audience      | Pain Point                          | Presently Message                                |
|---------------|-------------------------------------|--------------------------------------------------|
| **Students**  | Manual sign-in, fraud risk, anxiety | "Check in in 3 seconds. No excuses, no stress."  |
| **Lecturers** | Paper sheets, chasing records       | "Attendance sorted before you finish your intro."|
| **HODs/Deans**| No visibility, audit nightmares     | "Your entire faculty. One live dashboard."       |
| **Schools**   | Compliance, accreditation data      | "Attendance records that survive every audit."  |

**Microcopy rules:**
- Confirmation messages: warm, affirming ("You're marked present ✓")
- Error messages: never blame the user ("We couldn't verify your location — try stepping
  outside briefly.")
- Empty states: encouraging ("No sessions yet. Your first class is one tap away.")

---

## 12 · Dark & Light Mode

**Default**: Light mode (Off-White background)
**App default**: Follows system; both modes are first-class, not afterthoughts

Dark mode surface stack:
```
Page:     #0D0D0D
Layer 1:  #141414
Layer 2:  #1A1A1A
Layer 3:  #242424
Border:   #2A2A2A
```

---

## 13 · Mobile-First Principles

- Touch targets minimum 48×48px
- Bottom navigation bar (5 items max); thumb-friendly zone for primary actions
- Check-in CTA always reachable with one thumb — bottom-center placement
- GPS status indicator persistent in top bar during active sessions
- Font sizes never below 14px on mobile
- Cards stack to full width below 640px breakpoint

---

## 14 · Brand Applications

| Surface                | Primary Treatment                                      |
|------------------------|--------------------------------------------------------|
| App icon               | Sungold bg + Black P◆ mark                            |
| Splash screen          | Black bg, centred Wordmark in Sungold, fade-in         |
| Web landing            | See `landing.md`                                       |
| Email templates        | White card, Sungold header bar, Plus Jakarta Sans body |
| PDF attendance reports | Off-White bg, Sungold column headers, mono data cells  |
| Social media           | Black bg, Sungold accents, editorial typography        |
| Push notifications     | "You're marked present ✓" — always warm + confirmatory |

---

*End of Presently Design System v1.0*
*Next: See `landing.md` for full landing page specification.*
