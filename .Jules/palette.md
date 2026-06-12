## 2025-05-22 - Initial UX Audit & Standardization

**Learning:**
The project uses a custom layout-primitives system (`DashboardPage`, `ResponsiveGrid`) to maintain consistency across dashboards. However, `DashboardCard` is missing as a formal primitive, and the `StudentDashboard` currently deviates from the `DashboardPage` standard, leading to inconsistent spacing and typography.

**Action:**
- Create `DashboardCard` primitive to encapsulate skeuomorphic card styles and accessibility.
- Refactor `StudentDashboard` to use `DashboardPage` with a custom `max-w-4xl` constraint to prevent 'whitespace deserts' while maintaining its unique branded greeting.
- Ensure `DashboardPage` handles the `pb-24` safe-area for mobile PWA docks consistently.
