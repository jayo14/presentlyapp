# Brag Plan: Presently

## What is this app?
Presently is a Nigerian higher-education attendance and accountability platform that eliminates proxy attendance through multi-factor verification (GPS geofencing, biometric/hardware telemetry, and dynamic QR sessions).

## The angle
**Trust Infrastructure for Higher Education in Nigeria.**
University attendance should be more than a name written on a paper sheet. Traditional attendance can be easily manipulated through proxy signing. Presently turns attendance into an audit-grade, tamper-proof verification pipeline where every single record is backed by location telemetry, device identity, and institutional accountability.

## 9-Question Planning Rubric

1. **What is the app?**
   A verified attendance platform for Nigerian tertiary institutions combining GPS geofencing, biometric checks, and real-time lecturer/admin dashboards.

2. **What is the funniest or most impressive claim?**
   "Your biometric and geolocation telemetry will be verified against the secure venue perimeter — 0% proxy tolerance."

3. **What is the visual hook?**
   The contrast between a messy, falsifiable paper register and the sleek Sungold `#F9C406` & Presently Black `#231F0F` verification radar locking onto a student's exact coordinates inside Lecture Hall 7.

4. **What should be shown from the actual UI?**
   - The Lecturer Session Launch & Projector QR display (`SessionDetailDialog.tsx`)
   - The Student Mobile Check-in verification sequence (`AttendanceCheckIn.tsx`)
   - The Live Attendee Audit table with matric numbers, timestamps, and GPS distance (`AttendanceReport.tsx`)
   - The Institutional Analytics dashboard with exam clearance thresholds.

5. **What is the shortest satisfying video?**
   ~60 seconds. A full product journey needs time to showcase the problem, the lecturer session launch, the student verification flow, the live attendee sync, and the institutional audit report without rushing legible text.

6. **What tone fits best?**
   - Preset: `polished`
   - Creative direction: Premium, high-confidence product film. Authentic product demo disguised as a launch video.
   - Interpretation: High-clarity typography, deliberate cursor and device motions, sharp UI state transitions, and confident pacing.

7. **What should the audio feel like?**
   Upbeat tech groove (`happy-beats-business-moves-vol-11`), crisp mechanical click on buttons, subtle scanning sweep, triumphant verification chime, and a low bass hit on the final institutional seal.

8. **What should the share caption say?**
   "Introducing Presently: Trust infrastructure for Nigerian higher education. Smart attendance. Verified."

9. **What's the user flow worth showing?**
   Lecturer starts session with geofence → Student enters session code and scans QR → Location & biometric telemetry verified → Lecturer sees verified student record (Matric: 2021/CSC/042, 4.2m away) → Institutional clearance unlocked.

---

## Format & Duration
- Format: landscape (1920x1080)
- Duration: 60.0s (Target 45–75s range, well below 90s max)
- Framerate: 30 fps

## Visual Identity (from the project)
- Primary / Accent: Sungold `#F9C406`
- Dark Foreground / Text: Presently Black `#231F0F`
- Light Background: Soft Cream `#FDF9F0`
- Dark Surface: `#161616` / `#0C0C0C`
- Success Color: `#22C55E`
- Display Font: `Outfit`
- Body Font: `Plus Jakarta Sans`
- Key UI Assets: Dynamic QR code with gold corners, live radial counter, hardware signature badge, student audit table.

## Share Copy (Draft)
```text
University attendance shouldn't be a sign-sheet anyone can forge.
Presently brings tamper-proof GPS and biometric verification to Nigerian higher education.
Smart attendance. Verified.
```

## Audio Direction
- Role: Polished technology groove with restrained motion-coupled sound effects.
- Music: `happy-beats-business-moves-vol-11-by-ende-dot-app.mp3` (114.84 BPM).
- Music treatment: Starts cleanly, stays punchy through the demo, ducks slightly during dense interaction, swells into the institutional proof, and resolves under the final brand card.
- SFX posture: Motion-matched clicks, biometric scan tone, success chime on verification, and smooth card slides.

---

## Storyboard

### Scene 1 — The Problem: Paper vs. Trust (0.0s – 7.5s)
- **Visual**: Dark, cinematic opening. A stark split comparison. On the left: "Traditional Attendance" — faded paper sign-sheet, proxy signatures, zero audit trail. A red stamp slams: "Easily Manipulated".
- **Transition**: Smooth wipe into high-contrast Presently dark mode interface.
- **Settled Copy**: "University attendance should be more than a name on a sheet."
- **Audio intent**: Restrained, tense opening that resolves into the upbeat track as the Sungold glow ignites.
- **Audio-coupled**: Soft thud on "Easily Manipulated", subtle whoosh transition.

### Scene 2 — Step 1: Lecturer Starts the Session (7.5s – 18.0s)
- **Visual**: Lecturer Dashboard (`CSC301 — Distributed Systems`). Cursor selects "Faculty of Science · Lecture Hall 7", geofence radius set to 250m. Click "Start Session".
- **Payoff**: Session activates into the Projector View (`SessionDetailDialog.tsx`). Giant high-contrast QR code with gold corner brackets, dynamic session code `8X49-K2`, and live pulse: "Awaiting Participants · 0 Joined".
- **Settled Copy**: "Step 1: Lecturer launches a geofenced attendance session."
- **Audio intent**: Precise, intentional click SFX, slide SFX on modal open.

### Scene 3 — Step 2 & 3: Student Check-In & Multi-Factor Verification (18.0s – 34.0s)
- **Visual**: Zoom in on student mobile interface (`AttendanceCheckIn.tsx`). Student enters `8X49-K2`.
- **Multi-Factor Pipeline in action**:
  1. *Telemetry 1 — Geospatial Calibration*: Radar sweeps university coordinates `6.5244° N, 3.3792° E` — "Inside Hall 7 (4.2m from podium) — PASS".
  2. *Telemetry 2 — Biometric & Hardware Gateway*: Fingerprint biometric scan with Sungold glowing ring — "Hardware Signature Matched — PASS".
- **Resolution**: Giant green checkmark explodes with spring animation: "Identity Verified — Attendance Secured".
- **Settled Copy**: "Step 2 & 3: GPS geofence + Biometric telemetry verify presence."
- **Audio-coupled**: Typing clicks, scanning pulse, rich resonant bell chime on verification success.

### Scene 4 — Step 4: Live Accountability & Lecturer Visibility (34.0s – 47.0s)
- **Visual**: Back to the Lecturer & Hall projector screen. The real-time counter rapidly spins up: `0 → 42 → 128 → 428 students present`.
- **Audit Table**: Switches to the verified student records table (`AttendanceReport.tsx`):
  - Row 1: `2021/CSC/042` | Oluwaseun Adeyemi | `PRESENT` | 10:04 AM | 4.2m
  - Row 2: `2021/CSC/089` | Chioma Okonkwo | `PRESENT` | 10:05 AM | 8.1m
  - Row 3: `2021/CSC/115` | Ibrahim Musa | `PRESENT` | 10:05 AM | 6.4m
- **Settled Copy**: "Step 4: Real-time accountability with tamper-proof records."
- **Audio-coupled**: Rolling counter ticks, subtle card pop sounds.

### Scene 5 — Step 5: Institutional Proof & Exam Clearance (47.0s – 54.0s)
- **Visual**: Wide institutional view (`AdminDashboard.tsx` & `AttendanceReport.tsx`):
  - 88.4% Average Attendance rate.
  - "NUC Standard Met · Exam Clearance Automatically Calculated".
  - At-risk alerts for students below 75% threshold.
- **Settled Copy**: "Step 5: Trustworthy data Nigerian universities can rely on."
- **Audio-coupled**: Crisp stat reveals on beat grid.

### Scene 6 — Outro: The Brand Promise (54.0s – 60.0s)
- **Visual**: Elegant Sungold and deep black brand card.
  - Logo: **🎓 Presently**
  - **Trust Infrastructure for Higher Education in Nigeria.**
  - Subtitle: **Smart attendance. Verified.**
- **Settled Copy**: "getpresently.com.ng"
- **Audio intent**: Music swell into a clean fade, final chime ring.
