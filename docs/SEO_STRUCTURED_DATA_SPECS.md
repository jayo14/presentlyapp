# Presently: Validated Schema.org Structured Data Specifications

**Document:** Complete JSON-LD Implementation Blueprint for Google Search Rich Snippets  
**Compliance Standard:** Schema.org v26.0 / Google Search Central Guidelines  
**Date:** November 2026

---

## 1. Global Organization Schema

Deployed across all pages to establish entity identity and Knowledge Graph connectivity.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://www.getpresently.com.ng/#organization",
  "name": "Presently",
  "legalName": "Presently Technologies",
  "url": "https://www.getpresently.com.ng",
  "logo": "https://www.getpresently.com.ng/logo.png",
  "description": "Location-aware lecture attendance management platform built for Nigerian tertiary institutions.",
  "foundingDate": "2024",
  "areaServed": {
    "@type": "Country",
    "name": "Nigeria"
  },
  "sameAs": [
    "https://x.com/PresentlyNG"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "email": "support@getpresently.com.ng",
    "contactType": "customer support",
    "availableLanguage": ["en"]
  }
}
</script>
```

---

## 2. SoftwareApplication / WebApplication Schema

Deployed on the Homepage (`/`), Product Overview (`/features`), and Pricing (`/pricing`) to qualify for Software rich results.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "@id": "https://www.getpresently.com.ng/#software",
  "name": "Presently Attendance Management Platform",
  "applicationCategory": "EducationalApplication",
  "operatingSystem": "All modern web browsers (Chrome, Safari, Opera Mini, Edge, Firefox)",
  "browserRequirements": "Requires JavaScript. Requires HTML5 Geolocation API for check-in verification.",
  "url": "https://www.getpresently.com.ng",
  "description": "Location-verified attendance management platform enabling Nigerian university lecturers to conduct paperless class check-ins in under 30 seconds.",
  "featureList": [
    "Location-aware classroom boundary verification",
    "Dynamic 4-digit temporary session PINs",
    "Real-time student attendee stream with lecturer manual override",
    "Automated 75% semester exam eligibility calculation",
    "Instant CSV and PDF attendance register export",
    "Progressive Web App accessible on any smartphone without installation"
  ],
  "offers": [
    {
      "@type": "Offer",
      "name": "Starter Plan",
      "price": "0",
      "priceCurrency": "NGN",
      "description": "Free forever for individual lecturers managing 1 active course."
    },
    {
      "@type": "Offer",
      "name": "Lecturer Pro",
      "price": "3000",
      "priceCurrency": "NGN",
      "billingDuration": "P1M",
      "description": "Professional tier for lecturers managing multiple courses and academic levels."
    },
    {
      "@type": "Offer",
      "name": "Department Plan",
      "price": "200000",
      "priceCurrency": "NGN",
      "billingDuration": "P1Y",
      "description": "Annual faculty plan standardizing attendance records across up to 10 lecturers."
    }
  ]
}
</script>
```

---

## 3. WebSite Schema

Placed in `<head>` of the root document. Configures search engine sitelinks recognition.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://www.getpresently.com.ng/#website",
  "url": "https://www.getpresently.com.ng",
  "name": "Presently",
  "publisher": {
    "@id": "https://www.getpresently.com.ng/#organization"
  }
}
</script>
```

---

## 4. Homepage FAQPage Schema

Strictly mirrors the 8 confirmed FAQ items on the homepage. Complies with Google's updated August 2023 guidelines (restricted to authoritative organizational and government domains for SERP dropdowns, but fully valid for semantic indexing).

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How does location verification work inside a university classroom?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "When the lecturer launches a session at the lectern, Presently captures their coordinates and sets a boundary radius (typically 25m to 60m). When students submit the session PIN on their smartphones, their browser checks proximity against the lecturer's geofence. If they are within the boundary, their check-in is authenticated."
      }
    },
    {
      "@type": "Question",
      "name": "What happens when indoor GPS accuracy fluctuates inside concrete lecture halls?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Multi-story concrete buildings and metallic roofs can cause satellite signal drift. We designed Presently with configurable boundary buffers: lecturers can expand the radius (e.g. from 30m to 60m) to encompass the whole amphitheater. Furthermore, if a student experiences temporary GPS sensor drift, the lecturer has a 1-tap manual verification tool."
      }
    },
    {
      "@type": "Question",
      "name": "What happens if a student's phone battery is dead or they lack a smartphone?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Presently does not penalize students for technical hurdles. The lecturer's live dashboard includes a search-and-add tool. The student simply approaches the lecturer or course representative, identifies themselves, and the lecturer manually marks them present with an internal audit tag."
      }
    },
    {
      "@type": "Question",
      "name": "Can students check in from their hostel or from outside the classroom?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. Attendance requires simultaneous verification: the student must enter the temporary 4-digit PIN (displayed only inside the physical classroom) AND their device's GPS coordinates must fall within the designated venue boundary. Remote check-ins outside the perimeter are flagged and blocked."
      }
    },
    {
      "@type": "Question",
      "name": "Does Presently continuously track student location outside class hours?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Absolutely not. Presently performs a strict point-in-time verification solely at the instant the student presses 'Check In'. The application does not monitor location in the background, does not store movement paths, and immediately releases the GPS sensor once verified."
      }
    },
    {
      "@type": "Question",
      "name": "How does Presently assist with semester examination clearance?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Presently automatically computes every student's cumulative attendance percentage throughout the 12–15 weeks of teaching. Lecturers and HODs can export certified lists with a single click, instantly highlighting students who have attained the mandatory 70% or 75% attendance threshold to sit for semester examinations."
      }
    },
    {
      "@type": "Question",
      "name": "Can an individual lecturer start using Presently without formal institutional approval?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. An individual lecturer can create an account, register their courses, and begin running verified attendance immediately on the Free Starter plan or Lecturer Pro tier without requiring IT department procurement."
      }
    },
    {
      "@type": "Question",
      "name": "How can an academic department or faculty request a demonstration or pilot?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Deans, Heads of Department, and ICT Directors can click 'Request Campus Demo' or email our team. We provide a 15-minute walkthrough, assist in mapping your campus venues, and guide you through running a departmental trial."
      }
    }
  ]
}
</script>
```

---

## 5. BreadcrumbList Schema

Deployed across all sub-pages (e.g. `/features`, `/pricing`, `/documentation`) to reinforce site hierarchy.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://www.getpresently.com.ng"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Features",
      "item": "https://www.getpresently.com.ng/features"
    }
  ]
}
</script>
```

---

## 6. Blog Article Schema

Applied dynamically on `/blog/:slug` via `BlogSEO.tsx`.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "The Proxy Attendance Crisis in Nigerian Universities",
  "description": "How proxy attendance became a cultural norm in Nigerian universities, what it costs students and lecturers, and how location verification solves it.",
  "image": "https://www.getpresently.com.ng/og-image.svg",
  "datePublished": "2025-07-15T08:00:00+01:00",
  "dateModified": "2026-11-09T10:00:00+01:00",
  "author": {
    "@type": "Organization",
    "name": "Presently Academic Research Team",
    "url": "https://www.getpresently.com.ng"
  },
  "publisher": {
    "@id": "https://www.getpresently.com.ng/#organization"
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://www.getpresently.com.ng/blog/proxy-attendance-nigeria"
  }
}
</script>
```
