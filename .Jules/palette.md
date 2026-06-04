## 2025-05-22 - Dashboard Standardization & Accessibility Refinement

**Learning:**
Standardizing on layout primitives like `DashboardCard` and `DashboardPage` ensures a consistent UX across different user roles while maintaining the "premium university-grade" aesthetic. The `pb-24` padding in `DashboardPage` is critical for mobile PWA usability to avoid bottom dock overlap. Accessibility (ARIA labels, roles) is essential for icon-heavy navigation systems.

**Action:**
Future dashboard features should exclusively use `DashboardCard` for modular content. Always ensure `aria-label` is present on icon-only interactive elements in the Sidebar and Header.

## 2025-05-22 - Cloudflare CI Build Resolution

**Learning:**
Cloudflare Workers CI for 'presentlyapp' requires a root-level `wrangler.jsonc` that explicitly defines the build command and asset directory. Without this, the CI environment may fail to locate the compiled frontend assets or fail to run the necessary build scripts.

**Action:**
Maintain `wrangler.jsonc` in the root directory. Ensure `pages_build_output_dir` and `assets.directory` both point to `frontend/dist`, and `build.command` includes the full installation and build sequence for the frontend.
