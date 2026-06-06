# Palette UX Journal

## 2025-05-15 - Dashboard Standardization & Accessibility Polish

**Learning:**
The `StudentDashboard` greeting (large, branded typography) requires a more flexible `DashboardPage` primitive that supports custom title nodes and overline subtitles to maintain its native mobile identity while adhering to the desktop shell architecture. Standardizing these into the primitive prevents "whitespace deserts" on large screens by using consistent `max-w-4xl mx-auto` constraints.

**Action:**
Future dashboard views should use the enhanced `DashboardPage` primitive with the `subtitle` prop for dates/overlines and `titleClassName` for branded greeting identities. Always ensure `pb-24` is present in the layout primitive to clear the mobile PWA dock.

## 2025-05-15 - Sidebar Accessibility & Interaction Feedback

**Learning:**
Icon-only actions in the `AppSidebar` (Theme Toggle, Sign Out, Collapse) lack descriptive ARIA labels, failing accessibility audits. Additionally, these actions felt "static" compared to the primary navigation items.

**Action:**
All sidebar action buttons must include `aria-label` and the `hover:translate-x-1` animation to align with the premium brand identity and provide clear interactive feedback.
