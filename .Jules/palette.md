## 2025-05-22 - Standardization of Dashboard Primitives

**Learning:**
Standardizing dashboard layouts using dedicated primitives (`DashboardPage`, `DashboardCard`, `ResponsiveGrid`) significantly reduces visual clutter and prevents "whitespace deserts" on desktop while maintaining the "sacred" native-feel on mobile. Moving from hardcoded color classes (e.g., `text-slate-900`) to semantic design tokens (e.g., `text-text`, `text-success`, `var(--info)`) is critical for theme stability and design system integrity. Cloudflare Workers deployment for this monorepo requires a root-level `wrangler.toml` with a build command using `pnpm` exclusively within the `frontend/` directory to comply with project standards and ensure correct asset serving.

**Action:**
Future dashboard refinements for Lecturer, Admin, and Class Rep roles must adopt the `DashboardCard` primitive to ensure structural consistency. Accessibility features like `aria-label` for icon-only buttons and keyboard listeners for interactive cards are mandatory for all new UI components. Always use `pnpm` for build commands in configuration files.
