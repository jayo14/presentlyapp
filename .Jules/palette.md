## 2025-05-22 - Standardization of Dashboard Primitives

**Learning:**
Standardizing dashboard layouts using dedicated primitives (`DashboardPage`, `DashboardCard`, `ResponsiveGrid`) significantly reduces visual clutter and prevents "whitespace deserts" on desktop while maintaining the "sacred" native-feel on mobile. Moving from hardcoded color classes (e.g., `text-slate-900`) to semantic design tokens (e.g., `text-text`, `text-success`) is critical for theme stability and design system integrity.

**Action:**
Future dashboard refinements for Lecturer, Admin, and Class Rep roles must adopt the `DashboardCard` primitive to ensure structural consistency. Accessibility features like `aria-label` for icon-only buttons and keyboard listeners for interactive cards are mandatory for all new UI components.
