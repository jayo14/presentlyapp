## 2024-03-27 - Dashboard Standardization and Structural Refinement

**Learning:**
Dashboard pages were suffering from "whitespace deserts" and layout inconsistencies due to redundant padding wrappers (`px-6`, `pb-24`) that overlapped with the global `Layout.tsx` shell. By centralizing core layout logic in `DashboardPage` and `DashboardCard` primitives, we can maintain the premium skeuomorphic brand identity while ensuring perfect responsiveness.

**Action:**
Always use the `DashboardPage` primitive for new dashboard views. It handles the structural shell, mobile safe-area padding (`pb-24`), and branded typography. Use `DashboardCard` for all interactive grid elements to ensure accessibility (aria-roles, keyboard support) and visual consistency (rounded corners, premium shadows). Avoid adding horizontal padding or `min-h-screen` directly to dashboard components when they are wrapped in `Layout.tsx`.

## 2024-03-27 - Playwright Authentication Mocking

**Learning:**
The `useCurrentUser` hook expects the `/api/auth/me/` response to wrap the user object in a `"user"` key. Incorrectly mocking this as a flat object causes the application to hang or throw unexpected client errors during visual verification.

**Action:**
When writing verification scripts, ensure the `/api/auth/me/` mock exactly matches the production response: `{ "user": { ...profileData } }`.
