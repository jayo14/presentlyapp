## 2025-05-22 - Dashboard Primitive Standardization

**Learning:**
Standardizing dashboard layouts using `DashboardPage` and `DashboardCard` primitives significantly improves visual consistency and maintainability across different user roles. The `DashboardCard` should encapsulate skeuomorphic styles (`rounded-[2rem]`, shadows, borders) and accessibility (role="button", keyboard listeners) to ensure a premium and inclusive experience.

**Action:**
All new dashboard views should utilize the primitives in `frontend/components/layout-primitives/`. Specifically, `DashboardPage` should be used for the main structural shell, and `DashboardCard` for all interactive and statistical containers.
