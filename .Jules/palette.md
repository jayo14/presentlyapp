## 2025-05-15 - Initial UX Review

**Learning:**
The Presently desktop dashboard already uses a shadcn-inspired Sidebar + Inset architecture. However, the spacing rhythm and visual weight of the sidebar vs. content area can be refined to achieve the "premium" feel requested. The use of `bg-surface` (Pale Honey/Off-White) for the sidebar and `bg-background` (White) for the shell provides a good base but needs more intentionality in borders and shadows.

**Action:**
Refine `DashboardShell` and `AppSidebar` to reduce visual noise (unnecessary borders) and improve the "inset" illusion. Ensure all sidebar interactions have high-end animations (`ease-premium`).
