## 2025-05-22 - Dashboard Standardization & Layout Primitives

**Learning:**
Successfully standardized the architecture of all university dashboards (Student, Lecturer, Admin, Class Rep) using the `DashboardPage` and `DashboardCard` layout primitives. This ensures visual consistency (skeuomorphic design, proper spacing) and accessibility (ARIA roles, keyboard navigation) across the platform.

**Action:**
- Use `DashboardPage` for all top-level dashboard views to maintain a consistent shell.
- Use `DashboardCard` for statistics, interactive items, and grouped content to ensure a premium, skeuomorphic feel.
- When refactoring components that had specific branded headers (like the Student greeting), use the `titleClassName` prop on `DashboardPage` to preserve the identity while fitting into the standard architecture.
- Always include `max-w-4xl mx-auto` (or equivalent) in dashboard content containers to prevent "whitespace deserts" on ultra-wide screens, adhering to the "inset content" philosophy.
