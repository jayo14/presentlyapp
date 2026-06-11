## 2025-06-11 - Standardizing Dashboard Layout Primitives

**Learning:**
Dashboard pages across different user roles (Student, Lecturer, Admin) lacked structural consistency, leading to fragmented UX and maintenance overhead. Mobile-native feel was inconsistent when viewed on desktop, and desktop spacing was often poorly defined.

**Action:**
Introduced two core layout primitives:
1. `DashboardPage`: Provides a unified shell for all dashboards, handling branded greetings (H1), subtitles, descriptions, and actions. It enforces a mandatory `pb-24` padding for the mobile PWA bottom dock safe-area and standardizes responsive spacing (`gap-6` to `gap-8`).
2. `DashboardCard`: A skeuomorphic card component that supports multiple variants (including the branded `scholar` gradient). It utilizes Framer Motion for tactile micro-interactions (`whileTap`) and implements a flexible interactive model using `motion.div` to support nested interactive elements (e.g., action buttons inside a clickable session card) without violating HTML semantics.

These primitives ensure that any new dashboard view automatically inherits Presently's "Premium African-cosmopolitan" aesthetic and accessibility standards.
