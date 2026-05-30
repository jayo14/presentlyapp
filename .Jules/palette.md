## 2025-05-24 - Standardizing Dashboard Layout Primitives

**Learning:**
Refactoring specific dashboards (like `StudentDashboard`) to use the `DashboardPage` layout primitive ensures architectural consistency across the platform. This centralizes the "sidebar + inset content" logic and makes it easier to maintain a premium SaaS feel on desktop while protecting the mobile-native illusion.

**Action:**
Always wrap dashboard content in the `DashboardPage` primitive. Use the `description` prop to handle sub-headers, badges (like the 'SYSTEM OVERSEER' badge), and other contextual metadata.

## 2025-05-24 - Accessibility and Visual Refinement

**Learning:**
Icon-only buttons must have descriptive `aria-label` attributes. Small visual tweaks, such as standardizing icon weights to `bold` and using brand-specific color tokens (e.g., `sungold`), significantly compound into a more professional and trustworthy university-grade system.

**Action:**
Audit all icon-only buttons for `aria-label`. Standardize Phosphor icons to `weight="bold"` and `size={20}` for primary header actions. Use `sungold` (#F9C406) for accent elements like notification dots and admin badges.
