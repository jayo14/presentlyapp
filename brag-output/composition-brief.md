# Hyperframes Composition Brief: Presently

## Objective
Create a high-impact, authentic product demo and launch video for **Presently**, the trust infrastructure for higher education in Nigeria. The video must feel like a real product demo showing actual UI from the repository, proving how Presently turns university attendance from something easily manipulated into a verified, accountable process.

## Output
- Composition directory: `brag-output/composition/`
- Rendered video: `brag-output/brag.mp4`
- Format: landscape — 1920x1080
- Duration: 60 seconds (within the user's target 45–75s window)

## Source Material
- Project root: `/home/codegallantx/moi/presentlyapp`
- Primary files referenced:
  - `frontend/src/index.css` (design tokens, colors, fonts)
  - `frontend/components/Attendance/SessionDetailDialog.tsx` (Lecturer projector view, dynamic QR, gold corners, live counter)
  - `frontend/components/Attendance/AttendanceCheckIn.tsx` (Student check-in, geospatial calibration, biometric & hardware verification)
  - `frontend/components/Attendance/AttendanceSuccessPage.tsx` (Verification success screen, animated rings, protocol confirmation)
  - `frontend/components/Dashboard/AttendanceReport.tsx` (Verified student records table with matric number, distance, status)
  - `frontend/components/LandingPage/LandingHero.tsx` (Key copy: "Smart attendance, verified", "NUC compliant", 0% proxy)
- Product name: Presently
- Core positioning: **Presently — Trust Infrastructure for Higher Education in Nigeria.**
- Supporting tagline: **Smart attendance. Verified.**

## Creative Direction
- Tone preset: `polished`
- Creative direction: Premium, authentic product film. The product UI is the hero.
- Key principles:
  - No generic 3D floating fluff or fake futuristic visuals.
  - Recreate real Presently UI components with pixel fidelity to the actual frontend code.
  - Crisp motion, zooms into meaningful UI states, simulated cursor and mobile interaction.
  - Every text block holds long enough to read comfortably.

## Visual Identity
- Light Background: `#FDF9F0` (Soft Cream)
- Dark Background: `#0C0C0C` (Deep Onyx)
- Primary Accent: `#F9C406` (Sungold)
- Primary Foreground / Text: `#231F0F` (Presently Black)
- Dark Surface: `#161616`
- Dark Card Container: `#1C1C1C`
- Success: `#22C55E`
- Fonts: `Plus Jakarta Sans` (headlines & body), `Outfit` (display numbers & titles), `monospace` (matric numbers & session codes)

## Storyboard
Use `brag-output/brag-plan.md` as the creative contract:
1. **Scene 1 (0.0s – 7.5s)**: The Problem — Faded paper register with forged signatures vs. The Demand for Real Verification.
2. **Scene 2 (7.5s – 18.0s)**: Step 1 — Lecturer creates & starts session in Lecture Hall 7. Dynamic Session Code (`8X49-K2`) & Projector QR code generated with gold brackets.
3. **Scene 3 (18.0s – 34.0s)**: Step 2 & 3 — Student enters code on mobile. Real-time GPS geofence check (4.2m inside venue) + Biometric hardware check -> "Identity Verified".
4. **Scene 4 (34.0s – 47.0s)**: Step 4 — Lecturer screen syncs in real time: attendee counter jumps from 0 to 428. Verified student audit table displays names, matric numbers, timestamps, and distances.
5. **Scene 5 (47.0s – 54.0s)**: Step 5 — Institutional proof: 88.4% average attendance, automatic exam clearance calculation, NUC compliance.
6. **Scene 6 (54.0s – 60.0s)**: Outro — Brand seal: **Presently: Trust Infrastructure for Higher Education in Nigeria. Smart attendance. Verified.**

## Audio Configuration
- Music track: `assets/music/track.mp3` (`happy-beats-business-moves-vol-11`, 114.84 BPM)
- SFX tracks:
  - `assets/sfx/click.ogg` (UI button clicks, mode selection)
  - `assets/sfx/bell.ogg` (Verification success chime)
  - `assets/sfx/whoosh.ogg` (Scene transitions)
  - `assets/sfx/slide.ogg` (Card / modal entrance)
  - `assets/sfx/pop.ogg` (Badge & stat reveal)
- Audio-reactive elements: Sungold glowing orbs and session pulse ring subtly react to music energy.
