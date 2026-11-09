# Presently: Technical SEO Issue Register & Triage Matrix

**Document:** Prioritized Technical SEO Bug and Optimization Register  
**Product:** Presently (https://www.getpresently.com.ng/)  
**Date:** November 2026

---

## 1. Master Issue Register

| Issue ID | Category | Severity | Summary | Location / Code Evidence | Search Engine Impact | Prescribed Resolution | Status |
| :---: | :--- | :---: | :--- | :--- | :--- | :--- | :---: |
| **TECH-01** | Sitemap | **CRITICAL** | XML Sitemap includes 404 dead blog URLs | `frontend/scripts/generate-seo-files.mjs` lines 20-23 | Wastes crawl budget; triggers 404 crawl errors in Google Search Console (GSC); harms domain quality rating. | Update array with actual disk slugs (`how-presently-works`, `proxy-attendance-nigeria`). Dynamically read MDX directory. | Open |
| **TECH-02** | Sitemap | **HIGH** | Core commercial `/pricing` page missing from XML Sitemap | `frontend/scripts/generate-seo-files.mjs` line 25 | Delays discovery and re-crawling of high-intent transactional pricing page. | Add `{ url: '/pricing', changefreq: 'weekly', priority: 0.9 }` to static routes. | Open |
| **TECH-03** | Indexing / Spam | **CRITICAL** | Thin programmatic doorway pages generated for 8 universities | `frontend/scripts/generate-seo-files.mjs` & `frontend/components/universities/` | Violates Google Search Essentials (Doorway Pages); algorithmic penalty risk; misrepresents institutional adoption. | Remove `/universities/:slug` from sitemap; set `noindex` on programmatic templates until genuine, authorized case studies exist. | Open |
| **TECH-04** | Canonical | **HIGH** | Canonical host mismatch between root and `www` | `frontend/index.html` line 94 vs production domain | Splits link equity across `getpresently.com.ng` and `www.getpresently.com.ng`; confuses search indexers. | Enforce `https://www.getpresently.com.ng/` across canonical tags and edge 301 redirect rules. | Open |
| **TECH-05** | On-Page / Metadata | **HIGH** | `/pricing` route lacks dedicated `<SEO>` metadata | `frontend/components/Billing/PricingPage.tsx` | Falls back to generic title/description or browser route title; poor SERP CTR for transactional pricing queries. | Inject `<SEO title="Pricing Plans for Lecturers & Institutions" description="..." canonicalPath="/pricing" />`. | Open |
| **TECH-06** | Policy / Compliance | **HIGH** | Meta description contains prohibited claim *"No proxies."* | `frontend/index.html` line 57 & `frontend/components/seo/seoConfig.ts` line 6 | Violates Project Brief Constraint #5 (*"Do not claim that Presently eliminates proxy attendance entirely."*). Induces high bounce rate. | Reframe: *"Location-aware lecture attendance system built for Nigerian universities. Dramatically reduce proxy attendance without paper registers."* | Open |
| **TECH-07** | Structured Data | **MEDIUM** | Missing `SoftwareApplication` schema on root and product pages | `frontend/components/SEO.tsx` lines 49-72 | Ineligible for software rich snippets in Google Search (operating system, category, rating). | Deploy valid JSON-LD `SoftwareApplication` schema with WebApplication sub-type. | Open |
| **TECH-08** | Structured Data | **MEDIUM** | Incomplete `WebSite` SearchAction query target | `frontend/components/SEO.tsx` lines 67-71 | SearchAction points to `/search?q=...` which is not a functional public route in `App.tsx`. Causes schema validation errors. | Update SearchAction or remove query-input until a dedicated search route exists. | Open |
| **TECH-09** | Crawlability / SPA | **MEDIUM** | Soft 404 responses on non-existent client routes | `frontend/App.tsx` line 500 (`NotFound` component) | Client returns HTTP 200 with 404 message. Google flags Soft 404s, reducing crawl efficiency. | Implement edge-level handling (Cloudflare Worker or Vercel `cleanUrls` / rewrite rules) to emit HTTP 404 headers. | Open |
| **TECH-10** | Core Web Vitals | **LOW** | Font preload blocking render chain | `frontend/index.html` lines 33-37 | Google Fonts stylesheet preload triggers slight layout shift (CLS) and increases Time to Interactive (TTI). | Optimize `font-display: swap` and self-host critical Outfit/Plus Jakarta Sans subsets if possible. | Open |

---

## 2. In-Depth Technical Analysis of Top 3 Critical Deficiencies

### 2.1 The XML Sitemap 404 Defect (TECH-01)
In `frontend/scripts/generate-seo-files.mjs`, the static blog post array was hardcoded as:
```javascript
const blogPosts = [
  'why-gps-attendance-matters-in-nigerian-universities',
  'how-to-roll-out-digital-attendance-in-one-semester',
];
```
However, the actual markdown files on disk in `frontend/content/blog/` are:
1. `how-presently-works.mdx` (slug: `how-presently-works`)
2. `proxy-attendance-nigeria.mdx` (slug: `proxy-attendance-nigeria`)

**Consequence:** When search engines parse `sitemap.xml`, they crawl the two nonexistent URLs, receive client-side 404 pages (or soft 404s), and register crawl errors in Search Console. Meanwhile, the two genuine, high-value blog articles are excluded from the sitemap.

### 2.2 The Programmatic "Doorway" Trap (TECH-03)
The current repository generates URLs for 8 universities:
- `https://getpresently.com.ng/universities/unilag`
- `https://getpresently.com.ng/universities/lasustech`
- `https://getpresently.com.ng/universities/lasu`
- `https://getpresently.com.ng/universities/futa`
- `https://getpresently.com.ng/universities/oau`
- `https://getpresently.com.ng/universities/ui`
- `https://getpresently.com.ng/universities/uniport`
- `https://getpresently.com.ng/universities/uniben`

Each page renders the exact same template:
> *"Presently helps [School Name] run GPS-verified attendance... Join [School Name] Waitlist."*

**Search Engine Guidelines Violation:** Google's Spam Policies state:
> *"Doorways are sites or pages created to rank for specific, similar search queries... having multiple pages with slight variations that lead visitors to the same page."*

**Ethical & Brand Violation:** Claiming *"Presently helps UNILAG run GPS-verified attendance"* directly violates Project Brief Constraint #2 (*"Never invent customer statistics or adoption figures"*) and the rule that campus presence or testing is not formal university adoption.

### 2.3 The Canonical Host Disparity (TECH-04)
The project brief provides: `https://www.getpresently.com.ng/`.  
However, `index.html` hardcodes:
```html
<link rel="canonical" href="https://getpresently.com.ng/" />
```
And `seoConfig.ts` defaults to:
```typescript
export const SITE_URL = 'https://getpresently.com.ng';
```
When Googlebot encounters conflicting canonical directives (one on `www`, one on apex root without an active 301 redirect), it is forced to select a canonical algorithmically. This leads to split indexation, erratic keyword ranking drops, and fragmented Google Search Console property tracking.

---

## 3. Remediation Schedule & Impact Projection

| Milestone | Issues Addressed | Target Completion | Expected Search Engine Impact |
| :--- | :--- | :--- | :--- |
| **Sprint 1 (Immediate)** | TECH-01, TECH-02, TECH-04, TECH-05, TECH-06 | 24 - 48 Hours | 100% crawl budget efficiency restored; 0 dead sitemap links; pricing page indexed; brand compliance restored. |
| **Sprint 2 (Week 1)** | TECH-03, TECH-07, TECH-08 | 3 - 5 Days | Removal of doorway penalty risks; activation of SoftwareApplication and WebSite search features in SERPs. |
| **Sprint 3 (Week 2-3)** | TECH-09, TECH-10 | 7 - 14 Days | Elimination of soft 404s; Core Web Vitals optimization; mobile LCP < 2.2s on simulated 4G connections. |
