## 2024-05-24 - Modern Sidebar + Inset Content Architecture

**Learning:**
The "Sidebar + Inset Content" architecture provides a premium SaaS feel for desktop while allowing for clear separation from the mobile-native experience. Standardizing layout primitives like `DashboardPage` and `ResponsiveGrid` ensures consistency in spacing and structure across different user roles.

**Action:**
Use `DashboardPage` for structural headers and `ResponsiveGrid` for adaptive content layouts. Ensure desktop-specific layout changes are scoped with Tailwind's `md:` prefix to protect the mobile app illusion.

## 2024-05-24 - Phosphor Icon Migration

**Learning:**
Migrating from Lucide to Phosphor icons elevates the aesthetic to a more "University-grade" professional level. Using bold weights (`weight="bold"`) and consistent sizing (`size={20}`) for primary actions maintains a cohesive visual language.

**Action:**
Standardize on Phosphor icons for all new UI components. Prefer `bold` weight for primary dashboard actions and navigation.
