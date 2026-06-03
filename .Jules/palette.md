## 2024-06-03 - Dashboard Primitive Standardization

**Learning:**
Standardizing dashboard layouts using dedicated primitives (`DashboardPage`, `DashboardCard`, `ResponsiveGrid`) significantly improves code maintainability and visual consistency across different user personas. The "skeuomorphic" design style (`skeuo-card`) can be encapsulated within these primitives to ensure a unified premium feel. Mandatory "safe-area" padding (`pb-24` in `DashboardPage`) is critical for PWA mobile-native UX to prevent bottom dock overlap.

**Action:**
Future dashboard refinements or new persona views should always utilize these layout primitives. Branded greetings should use the `titleClassName` prop of `DashboardPage` rather than custom header wrappers to maintain layout consistency.

## 2024-06-03 - Cloudflare Workers CI Build Fix

**Learning:**
The Cloudflare Workers CI build for the 'presentlyapp' service requires a root-level `wrangler.jsonc` file with the `assets.directory` pointing to the frontend build output (e.g., `frontend/dist`).

**Action:**
Ensure `wrangler.jsonc` is maintained at the root and correctly references the build artifact directory for successful static asset deployment.
