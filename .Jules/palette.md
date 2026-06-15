# Palette's Journal 🎨

## 2025-05-23 - Standardizing Dashboard Architecture

**Learning:**
Standardized dashboard layouts using `DashboardPage`, `ResponsiveGrid`, and `DashboardCard` primitives significantly improve UI consistency and maintainability across different user roles (Student, Lecturer, Admin). The `skeuo-card` design style is now encapsulated in `DashboardCard.tsx` with `rounded-[2rem]` corners and premium shadows.

**Action:**
For any new dashboard pages or sections, use the `DashboardPage` and `DashboardCard` primitives instead of building custom layouts from scratch. Maintain the `max-w-4xl mx-auto` constraint for mobile-first dashboards (like Student) to prevent whitespace deserts on desktop.

## 2025-05-23 - Authenticated UI Verification

**Learning:**
Frontend E2E verification of authenticated routes can be achieved by mocking the backend auth endpoint (`/api/auth/me/`) and manually injecting `access_token` into `localStorage`. This avoids the need for a live backend during UI verification.

**Action:**
Use the `verify_dashboards.py` script pattern for future visual verification tasks.

## 2025-05-23 - Iconography Standards

**Learning:**
This project standardizes on `@phosphor-icons/react` for dashboard and UI iconography. Phosphor icons support the `weight` prop, allowing for refined visual hierarchy (e.g., `weight="bold"` for active states).

**Action:**
Always use `@phosphor-icons/react` for new dashboard components and layout primitives. Ensure the `weight` prop is used intentionally to maintain the premium university-grade aesthetic.
