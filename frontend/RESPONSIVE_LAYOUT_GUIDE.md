# Responsive Layout Guide

## Overview
This guide documents the responsive design strategy for the Presently application, ensuring desktop layouts remain unchanged while providing optimized mobile experiences.

## Core Principles

### 1. Desktop First, Mobile Additive
- **Desktop layouts (md breakpoint and above) must remain pixel-perfect and unchanged**
- Mobile layouts are added separately and do not interfere with desktop
- Use Tailwind's `md:` breakpoint (768px) as the primary desktop threshold

### 2. No Conditional Rendering That Removes Components
- ❌ **AVOID**: Removing components from DOM based on screen size
- ✅ **USE**: CSS-based visibility with Tailwind classes (`hidden md:block`, `md:hidden`)
- ✅ **USE**: Separate mobile/desktop layout structures when needed

### 3. Layout Separation Pattern
Use the ResponsiveContainer helper component for complex cases:

```tsx
import { ResponsiveContainer, MobileOnly, DesktopOnly } from '../layouts/ResponsiveContainer';

// Pattern 1: Separate mobile and desktop children
<ResponsiveContainer
  mobileChildren={<MobileLayout />}
  desktopClassName="..."
>
  <DesktopLayout />
</ResponsiveContainer>

// Pattern 2: Simple visibility toggle
<MobileOnly>
  <MobileOnlyContent />
</MobileOnly>

<DesktopOnly>
  <DesktopOnlyContent />
</DesktopOnly>
```

## Breakpoint Strategy

### Tailwind Breakpoints
```javascript
screens: {
  'xs': '480px',           // Extra small devices
  'mobile': {'max': '767px'}, // Mobile-only (max-width)
  'tablet': '768px',       // Tablets
  'md': '768px',           // Desktop start (DEFAULT)
  'desktop': '1024px',     // Large desktops
}
```

### Usage Guidelines

#### Grid Layouts
Always provide a mobile fallback for grid layouts:

```tsx
// ❌ WRONG - No mobile fallback
<div className="grid md:grid-cols-12 gap-6">

// ✅ CORRECT - Single column on mobile, 12 columns on desktop
<div className="grid grid-cols-1 md:grid-cols-12 gap-6">
```

#### Spacing
Scope mobile-specific spacing to mobile breakpoints only:

```tsx
// Desktop spacing preserved, mobile adjusted
<div className="p-4 md:p-8 gap-4 md:gap-6">
```

#### Hidden Elements
Use Tailwind visibility classes instead of conditional rendering:

```tsx
// ✅ CORRECT - Desktop header, hidden on mobile
<div className="hidden md:flex items-center justify-between">
  <button>Back</button>
  <h1>Title</h1>
  <button>Share</button>
</div>

// ✅ CORRECT - Mobile buttons, hidden on desktop
<div className="flex flex-col gap-3 md:hidden">
  <button>Save</button>
  <button>Cancel</button>
</div>
```

## Common Patterns

### Pattern 1: Stat Cards Grid
```tsx
// 2 columns on mobile, 4 on desktop
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  <StatCard />
  <StatCard />
  <StatCard />
  <StatCard />
</div>
```

### Pattern 2: Chart Layouts
```tsx
// Stack vertically on mobile, side-by-side on desktop
<div className="grid grid-cols-1 md:grid-cols-12 gap-6">
  <div className="md:col-span-5">
    <PieChart />
  </div>
  <div className="md:col-span-7">
    <LineChart />
  </div>
</div>
```

### Pattern 3: Information Visibility
```tsx
// Show venue inline on desktop, on new line on mobile
<div className="flex-1">
  <p className="font-bold">{courseCode}</p>
  <p className="text-sm">{time}</p>
  
  {/* Mobile: New line */}
  <p className="md:hidden text-xs mt-1">
    <MapPin size={12} /> {venue}
  </p>
</div>

{/* Desktop: Inline */}
<div className="hidden md:flex items-center ml-4">
  <MapPin size={14} /> {venue}
</div>
```

### Pattern 4: Action Buttons
```tsx
// Desktop: Header buttons
<div className="hidden md:flex gap-3">
  <Button variant="secondary">Cancel</Button>
  <Button>Save</Button>
</div>

// Mobile: Bottom buttons (larger touch targets)
<div className="flex flex-col gap-3 md:hidden">
  <Button className="h-12 text-lg">Save</Button>
  <Button variant="secondary" className="h-12 text-lg">Cancel</Button>
</div>
```

## Style Isolation Rules

### 1. Mobile Styles Must Not Leak to Desktop
```tsx
// ❌ WRONG - gap-3 affects all screens
<div className="gap-3 md:gap-6">

// ✅ CORRECT - Explicit mobile spacing
<div className="gap-6">  // Desktop default
<div className="gap-3 md:gap-6">  // Mobile override with desktop explicit
```

### 2. Desktop Styles Are Default
Desktop (md and above) styles should be the default whenever possible:

```tsx
// Option 1: Desktop-first with mobile override
<div className="p-4 md:p-8">  // 4 on mobile, 8 on desktop

// Option 2: Explicit for both (when clarity is important)
<div className="p-8">  // Desktop default, implicit on mobile too
```

### 3. No Global Color Redefinitions
- Colors defined in `tailwind.config.js` apply globally
- Mobile-specific color adjustments should use Tailwind utilities, not config overrides
- Dark mode colors use `dark:` prefix, not separate mobile breakpoints

## Layout Components

### Main Layout (components/Layout.tsx)
- **Desktop**: Fixed sidebar (left), collapsible
- **Mobile**: Hidden sidebar, hamburger menu, bottom navigation
- **Padding**: `pb-24 md:pb-8` (accounts for bottom nav)

### Dashboard Pages
- **StudentDashboard**: Grid layouts use `grid-cols-1 md:grid-cols-X`
- **LecturerDashboard**: Proper responsive grids already in place
- **ClassRepDashboard**: Venue info visible on mobile (different layout)

## Testing Checklist

Before committing responsive changes:

- [ ] Build succeeds without errors
- [ ] Desktop layout at md+ (≥768px) is pixel-perfect unchanged
- [ ] Mobile layout below md (<768px) renders properly
- [ ] No components are removed from DOM (use CSS visibility)
- [ ] Touch targets on mobile are minimum 44px (Tailwind's `min-w-[44px]`)
- [ ] Spacing on desktop is preserved (no density changes)
- [ ] Colors are consistent across breakpoints
- [ ] Dark mode works on both mobile and desktop

## Migration Guide

When adding new components or refactoring existing ones:

1. **Start with desktop layout** - This is the baseline
2. **Add mobile breakpoints** - Use `md:` prefix for desktop overrides
3. **Test at md threshold** (768px) - Ensure clean breakpoint transition
4. **Verify no desktop regression** - Desktop must look identical
5. **Use helper components** - ResponsiveContainer for complex cases
6. **Document deviations** - If desktop layout must change, document why

## Common Mistakes to Avoid

1. ❌ Using `hidden` without breakpoint prefix (affects all screens)
2. ❌ Removing components with conditional rendering (breaks desktop)
3. ❌ Applying mobile spacing globally (affects desktop density)
4. ❌ Using JavaScript for responsive logic (use CSS/Tailwind)
5. ❌ Forgetting mobile fallbacks for grids (causes layout breaks)
6. ❌ Hiding critical UI on mobile without alternative (info loss)

## Recent Fixes

### StudentDashboard (Line 230)
**Before**: `<div className="grid md:grid-cols-12 gap-6">`
**After**: `<div className="grid grid-cols-1 md:grid-cols-12 gap-6">`
**Reason**: Charts stacked vertically on mobile, preserved desktop layout

### ClassRepDashboard (Lines 148-165)
**Before**: Venue hidden on mobile with `hidden md:flex`
**After**: Venue shown on mobile in new line, inline on desktop
**Reason**: Information loss on mobile, preserved desktop inline layout

## Resources

- [Tailwind Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [Mobile-First CSS](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)
- [Touch Target Sizes](https://web.dev/accessible-tap-targets/)
