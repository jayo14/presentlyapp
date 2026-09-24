# Hyperframes Composition Brief: Presently — TRUST MOTION

## 1. Composition Specification
- **Canvas Resolution**: 1920x1080 (16:9 Landscape)
- **Framerate**: 30 fps
- **Total Duration**: 60.0s (1800 frames)
- **Color Palette**:
  - Obsidian Background: `#0B0B0D`
  - Deep Surface: `#161512`
  - Surface Border: `rgba(255, 255, 255, 0.1)`
  - Presently Gold: `#F4C542` / `#F9C406`
  - Verification Green: `#10B981` / `#22C55E`
  - Primary Text: `#FFFFFF`
  - Secondary Text: `#9CA3AF`
- **Typography Stack**:
  - Headline Font: `'Outfit', system-ui, sans-serif`
  - Body / Monospace Font: `'Inter', system-ui, sans-serif`
  - Deterministic web fonts loaded via Google Fonts.

## 2. Audio Mapping
- **Background Music**: `assets/music/track.mp3` (`data-track-index="0"`, volume: 0.65, starts at 0.0s, duration 60.0s with 2s outro fade).
- **SFX**:
  - Scene 01 Intro Whoosh: `assets/sfx/whoosh.ogg` (t=0.6s, track 1)
  - Scene 02 Question Accent / Pop: `assets/sfx/pop.ogg` (t=8.2s, track 2)
  - Scene 03 Check-in Tap: `assets/sfx/click.ogg` (t=14.0s, track 3)
  - Scene 04 Geofence Lock Chime: `assets/sfx/bell.ogg` (t=22.5s, track 4)
  - Scene 05 Biometric Scan Haptic: `assets/sfx/slide.ogg` (t=29.0s, track 5)
  - Scene 06 Convergence Climax Bell: `assets/sfx/bell.ogg` (t=37.5s, track 6)
  - Scene 07 Admin Counter Tick / Whoosh: `assets/sfx/whoosh.ogg` (t=44.0s, track 7)
  - Scene 08 Institutional Swell: `assets/sfx/slide.ogg` (t=51.0s, track 8)
  - Scene 09 Final Brand Verification Bell: `assets/sfx/bell.ogg` (t=57.0s, track 9)

## 3. Motion & Animation Principles
- All motion choreographed via GSAP `TimelineLite` / `TimelineMax` synced to exact scene timestamps.
- Zero abrupt cuts: cinematic camera dolly zooms on photoreal backgrounds, smooth cross-fades, and physics-driven spring easing.
- "VERIFIED" is treated as an active visual payoff (gold pulse to emerald badge lock).
- Respects Hyperframes audit requirements: deterministic fonts, all deliberate off-canvas lighting blurs marked with `data-layout-allow-overflow="true"`, badges marked with `data-layout-allow-overlap="true"` where appropriate.
