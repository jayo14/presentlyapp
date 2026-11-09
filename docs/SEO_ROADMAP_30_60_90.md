# Presently: Prioritized 30 / 60 / 90-Day Organic SEO Roadmap

**Document:** Actionable Execution Roadmap & Implementation Schedule  
**Product:** Presently (https://www.getpresently.com.ng/)  
**Date:** November 2026

---

## 1. Roadmap Architecture

The SEO roadmap is phased to ensure that technical foundations are completely sanitized before investing in content marketing and digital PR outreach:

```
[Phase 1: Days 1–30]  ──► [Phase 2: Days 31–60] ──► [Phase 3: Days 61–90]
Technical Sanitation      Content Engine &          Authority Building &
& Critical Fixes          On-Page Expansion         Institutional Outreach
```

---

## 2. Phase 1: Days 1–30 — Technical Sanitation & Core Foundations

**Primary Goal:** Fix critical crawl/indexation defects, eliminate doorway penalty risks, align canonical directives, and restore 100% crawl budget efficiency.

| Action Item | Technical Task | Owner | Expected Impact | Priority |
| :--- | :--- | :---: | :--- | :---: |
| **P1.1** | Re-engineer `generate-seo-files.mjs` to point to real blog slugs (`how-presently-works`, `proxy-attendance-nigeria`), eliminate 404s, and add `/pricing`. | Engineering | Eliminates crawl budget waste and GSC 404 errors. | **P0 (Immediate)** |
| **P1.2** | De-index thin programmatic university doorway pages (`/universities/:slug`) from sitemap and apply `noindex`. | SEO / Dev | Removes Google algorithmic doorway penalty risk. | **P0 (Immediate)** |
| **P1.3** | Enforce canonical domain consistency (`https://www.getpresently.com.ng/`) across `index.html`, `seoConfig.ts`, and edge CDN headers. | DevOps / Dev | Unifies split link equity and consolidates PageRank. | **P0 (Immediate)** |
| **P1.4** | Inject dedicated `<SEO>` metadata and canonical tags onto `/pricing`. | Frontend | Enables `/pricing` to rank for transactional software pricing terms. | **P1 (Day 2)** |
| **P1.5** | Deploy validated `SoftwareApplication`, `Organization`, and `FAQPage` JSON-LD schema into production templates. | Frontend | Qualifies site for Google rich snippets and Knowledge Graph. | **P1 (Day 3)** |
| **P1.6** | Submit clean `sitemap.xml` to Google Search Console and Bing Webmaster Tools. | SEO Lead | Accelerates discovery and indexing of updated pages. | **P1 (Day 5)** |
| **P1.7** | Configure GA4 custom events (`lecturer_signup`, `demo_request_submit`, `session_created`). | Analytics | Establishes accurate baseline conversion tracking. | **P2 (Day 10)** |

---

## 3. Phase 2: Days 31–60 — Content Engine & On-Page Expansion

**Primary Goal:** Establish topical relevance across Nigerian higher education attendance problems and capture top-of-funnel academic search queries.

| Action Item | Technical / Content Task | Owner | Expected Impact | Priority |
| :--- | :--- | :---: | :--- | :---: |
| **P2.1** | Publish Month 1 Content Pillar: *"Why Nigerian Universities Are Moving Beyond Paper Attendance Registers"*. | Content Lead | Ranks for alternative-to-paper queries; captures frustrated lecturers. | **P1 (Day 35)** |
| **P2.2** | Publish Month 1 Content Pillar: *"Managing Attendance in 200+ Student Nigerian Lecture Halls"*. | Content Lead | Targets large class course coordinators (GST, MTH, CHM). | **P1 (Day 42)** |
| **P2.3** | Launch dedicated `/for-institutions` landing page optimized for `university attendance system Nigeria` and HOD searches. | Frontend / Design | Captures high-value institutional procurement and pilot leads. | **P1 (Day 48)** |
| **P2.4** | Publish Month 1 Content Pillar: *"Understanding the 75% Attendance Rule for Semester Examination Clearance"*. | Content Lead | Drives seasonal pre-exam search traffic from staff and students. | **P1 (Day 55)** |
| **P2.5** | Implement internal cross-linking mesh connecting blog pillars to `/features` and `/pricing`. | SEO / Dev | Passes page authority from informational content to commercial CTAs. | **P2 (Day 58)** |

---

## 4. Phase 3: Days 61–90 — Authority Building, Case Studies & Institutional Scaling

**Primary Goal:** Build authoritative Nigerian backlinks, publish engineering case studies, and convert organic visibility into sustainable institutional pilots.

| Action Item | Strategic Task | Owner | Expected Impact | Priority |
| :--- | :--- | :---: | :--- | :---: |
| **P3.1** | Publish long-form LASUSTECH origin case study at `/about/lasustech-journey` documenting concrete hall engineering trials. | Founder / Content | Establishes undeniable E-E-A-T and campus authenticity. | **P1 (Day 65)** |
| **P3.2** | Publish Month 2 Technical Deep Dive: *"How Location-Based Attendance Verification Works Inside Concrete Halls"*. | Engineering | Generates backlinks from developer and EdTech communities. | **P1 (Day 72)** |
| **P3.3** | Outreach to Nigerian tech journalists (TechCabal, Techpoint Africa) highlighting student-built campus infrastructure solving paper register waste. | Digital PR | High-authority editorial backlinks and brand search momentum. | **P1 (Day 80)** |
| **P3.4** | Facilitate lecturer syllabus integration: Encourage active lecturers to link to Presently check-in portal on official faculty course pages. | Campus Reps | Highly authoritative `.edu.ng` contextual referral links. | **P2 (Day 85)** |
| **P3.5** | Conduct 90-Day Organic Performance & Conversion Cohort Audit. | SEO / Analytics | Evaluates ROI, refines keyword targeting, and sets Q2 roadmap. | **P1 (Day 90)** |
