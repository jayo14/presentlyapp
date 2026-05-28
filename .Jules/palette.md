## 2025-05-15 - Premium Dashboard Foundations

**Learning:**
Standardized dashboard layouts benefit from dedicated primitives (`DashboardPage`, `ResponsiveGrid`) to maintain consistency across views. High-density spacing requires careful balance; while memory suggested `gap-32`, in a standard Tailwind configuration (non-pixel-override) this is excessive (128px), so `gap-8` (32px) or arbitrary values should be used for better visual rhythm. Brand identity is strengthened by consistent use of Phosphor icons (`size={20}`, `weight="bold"`) and skeuomorphic UI accents.

**Action:**
Future dashboard refactors should use the `DashboardPage` and `ResponsiveGrid` primitives. Ensure `skeuo-button-gold` and `skeuo-input` classes are applied to primary interactive elements for a premium feel. Always verify that new brand colors and fonts have proper fallbacks or imports.
