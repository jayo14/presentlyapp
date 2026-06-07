## 2025-05-15 - Dashboard Standardization & Layout Primitives

**Learning:**
Established a standardized dashboard architecture using `DashboardPage` and `DashboardCard` primitives. These components encapsulate the "skeuo-card" design token and handle consistent spacing, typography, and accessibility (keyboard navigation and ARIA labels). The `DashboardPage` specifically enforces a `pb-24` padding on mobile to protect the safe-area for the PWA bottom dock navigation.

**Action:**
Future dashboard views or refactors should exclusively use these primitives rather than manual `div` structures with card classes. This ensures visual harmony and prevents "desktop leakage" into the native-feel mobile experience.

## 2025-05-15 - Accessibility for Universal Navigation

**Learning:**
Icon-only buttons in the `AppSidebar` and `SiteHeader` (Theme Toggle, Notifications, Install, etc.) lacked descriptive `aria-label` attributes, making them inaccessible to screen readers. Navigation hierarchy also required `role="region"` for profile summaries to provide better document landmarking.

**Action:**
All new interactive elements, especially icon-only buttons, must include a mandatory `aria-label`. Interactive dashboard sections must use `DashboardCard` which handles `role="button"`, `tabIndex`, and keyboard event listeners (`Enter`/`Space`) by default.
