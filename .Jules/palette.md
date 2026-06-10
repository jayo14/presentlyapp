## 2024-05-22 - Layout Primitives & Student Dashboard Refinement

**Learning:**
Standardizing dashboard layouts requires a balance between rigid structural shells and role-specific "branded" experiences. The `DashboardPage` and `DashboardCard` primitives successfully bridge this gap by providing a modern, inset desktop shell while preserving the native-feel greetings and interactions on mobile.

**Action:**
Future refactorings for Admin and Lecturer dashboards should utilize these `DashboardCard` and `DashboardPage` primitives to ensure platform-wide consistency and reduce layout leakage. Always use `@phosphor-icons/react` for dashboard UI to maintain a premium feel.
