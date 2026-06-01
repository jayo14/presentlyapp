## 2025-05-15 - Dashboard Architecture Standardization

**Learning:**
Standardizing the dashboard layout using layout primitives (`DashboardPage`, `ResponsiveGrid`, `DashboardCard`) significantly improves consistency across different user roles while maintaining flexibility for branded elements. Integrating accessibility (ARIA labels, keyboard navigation) into these primitives ensures compliance across the entire application with minimal effort in individual pages.

**Action:**
Future dashboard views or refactors should strictly adhere to these layout primitives. Any new card-like interactive element should use the `DashboardCard` primitive to inherit the skeuomorphic design and accessibility features. Branded greeting elements (like the student's "Hey name,") should be passed into the `DashboardPage` via its `title` or `description` props rather than being implemented as standalone custom headers to preserve the desktop shell's structure.
