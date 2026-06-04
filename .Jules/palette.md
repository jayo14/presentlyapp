## 2025-05-22 - Dashboard Standardization & Accessibility Refinement

**Learning:**
Standardizing on layout primitives like `DashboardCard` and `DashboardPage` ensures a consistent UX across different user roles while maintaining the "premium university-grade" aesthetic. The `pb-24` padding in `DashboardPage` is critical for mobile PWA usability to avoid bottom dock overlap. Accessibility (ARIA labels, roles) is essential for icon-heavy navigation systems.

**Action:**
Future dashboard features should exclusively use `DashboardCard` for modular content. Always ensure `aria-label` is present on icon-only interactive elements in the Sidebar and Header.
