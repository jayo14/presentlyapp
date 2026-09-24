# Startup Idea Validation: Presently

**Analyzed Concept**: Presently — Modern Attendance Management & Exam Clearance System for Educational Institutions  
**Date**: September 2026  
**Verdict Summary**: **PIVOT IT** (Score: 19/35)

---

## 1. The 30-Second Assessment

Presently solves a genuine, painful operational nuisance—paper attendance fraud, manual roll calls, and exam clearance auditing in crowded lecture halls—but it is fundamentally a **feature attempting to masquerade as an enterprise SaaS product**. Selling standalone attendance software to universities involves brutal 9-to-18-month procurement cycles, fierce resistance from students who actively game indoor GPS, and relentless competition from incumbents (Canvas, Blackboard, Moodle) who provide "good enough" attendance tools for free. Unless Presently pivots to a high-stakes compliance niche where missing attendance costs institutions their funding or accreditation, it will languish as an over-engineered side project.

---

## 2. The Five Fatal Questions

### Q1: Who is the customer, and would they pay for this today?
* **The Buyer**: University Registrars, Deans of Academic Affairs, or Directors of Academic Computing.
* **The User**: Lecturers (who want class control without wasting 15 minutes calling 300 names) and Students (who are forced to use it).
* **Willingness to Pay**: **No, not as a standalone software purchase.** 
  * Lecturers feel the day-to-day pain, but professors almost never spend their personal money on administrative utilities.
  * University administrators control the budget, but attendance is viewed as a minor logistical line item already bundled into their existing Learning Management System (LMS) or Student Information System (SIS like Ellucian Banner or Oracle PeopleSoft).
  * The only scenario where an institution cuts a check today is if attendance is tied to a **hard financial or regulatory consequence**—such as mandatory 75% exam clearance rules in developing economies (e.g., Nigeria, Ghana, India) or international student visa compliance audits (F-1 in the US, CAS in the UK). Outside of strict compliance mandates, willingness to pay is near zero.

### Q2: Why hasn't someone built this already?
Many companies have tackled this over the past 15 years, and virtually none survived as pure-play attendance apps:
* [Top Hat](https://tophat.com/): Started around lecture attendance and engagement (geofencing and SMS/app codes). They quickly realized attendance alone cannot support an enterprise valuation, forcing them to pivot into full interactive courseware, digital textbooks, and lecture polling.
* [CourseKey](https://coursekey.com/): Successfully carved out a high-retention enterprise business, but **only by abandoning traditional 4-year universities** to focus exclusively on vocational, nursing, and trade schools where accredited clock-hours are federally mandated for Title IV funding.
* [Acadly](https://www.acadly.com/): Built Bluetooth mesh-network attendance to bypass indoor GPS drift. Despite strong tech, adoption has been slow because professors dislike forcing students to download third-party tracking apps.
* [SEAtS Software](https://seatssoftware.com/): Succeeded in the UK and Europe by positioning attendance as a **visa compliance and statutory reporting platform**, not a teaching tool.

**Why indoor attendance tech routinely fails**:
1. **The Physics Problem**: Concrete and steel multi-story lecture halls kill GPS accuracy. GPS routinely drifts by 20–50 meters indoors, leading to false negatives (marking present students absent) and high lecturer frustration.
2. **The Adversarial Student Problem**: Students quickly defeat QR codes (screenshots forwarded over WhatsApp in 2 seconds) and GPS (mock location apps). Countering this with complex geospatial schemas, rotating tokens, and elevation modeling creates massive technical overhead for a simple check-in.

### Q3: What's the distribution advantage?
* **First 100 users**: Can only be acquired by personal relationships—convincing 2 or 3 friendly lecturers or department heads at a local university to run an unapproved rogue pilot in their classes.
* **Growth Loop**: **Essentially zero.** Students will not refer other universities to an app that forces them to attend class and stops proxy signing. Lecturers rarely cross-pollinate administrative tools across institutions.
* **Sales Reality**: Every institutional contract requires responding to RFPs, undergoing campus data privacy reviews (FERPA/GDPR), integrating with legacy LDAP/SSO and SIS databases, and convincing faculty unions. A solo founder or tiny team cannot afford 12-month enterprise sales cycles without substantial upfront runway.

### Q4: Can this be a big business, or is it a feature?
* **Feature vs. Product**: Standalone attendance tracking is an LMS feature. Canvas and Moodle already have attendance modules and free QR plugins.
* **Natural Ceiling**: If sold directly to departments at $1,000–$3,000/year, the revenue ceiling is low, and churn is high every time a lecturer changes courses or an LMS updates.
* **Path to $1M ARR**: To reach $1M ARR at a $5,000 average contract value (ACV), Presently would need **200 accredited institutions** actively paying and renewing. At a 12-month sales cycle, closing 200 institutions requires a dedicated enterprise sales team, field reps, and continuous on-campus support.

### Q5: Can the founder actually build this?
* **Technical Execution**: **Yes, exceptionally well.** The existing codebase displays advanced engineering maturity: Django REST framework backend, React 19 frontend, Expo mobile stack, automated report pipelines, and an exhaustive geospatial schema.
* **Operational Bottlenecks**:
  1. *Hardware & Environment Variance*: Low-end Android devices in developing markets have erratic GPS sensors and inconsistent camera performance for dynamic QR codes.
  2. *Enterprise Integration Burden*: Universities demand automated gradebook/SIS synchronization (Banner, Canvas, Moodle). Building custom ETL connectors for each campus is an operational quagmire.
  3. *Founder Skill Misalignment*: The hardest hurdle is enterprise B2B sales and campus political navigation, not software architecture.

---

## 3. Idea Scorecard

| Dimension | Score (1-5) | Notes |
|:---|:---:|:---|
| **Problem Severity** | 3/5 | Real pain for lecturers during roll call, but administrative leadership rarely treats it as a top-3 urgent priority. |
| **Market Size** | 3/5 | Thousands of tertiary institutions globally, but total addressable spend for standalone attendance software is narrow. |
| **Willingness to Pay** | 2/5 | Lecturers expect it for free; universities expect their existing LMS to handle it without extra license fees. |
| **Competition Gap** | 2/5 | Saturated by free LMS plugins, manual sign-in sheets, biometric door hardware, and incumbents like Top Hat & Acadly. |
| **Distribution** | 1/5 | Brutal B2B institutional sales cycles with zero viral loop and active student resistance. |
| **Timing** | 3/5 | Post-pandemic back-to-campus policies require accountability, but smartphones already have strict OS privacy locks on continuous geofencing. |
| **Founder Fit** | 5/5 | High-caliber engineering output, monorepo architecture, and thoughtful data modeling. |
| **Total** | **19/35** | **Significant concerns. Needs a major pivot or a different angle.** |

> **Score Interpretation (19/35)**: Ideas scoring between 14 and 20 require a strategic pivot. The current product architecture is vastly over-engineered for the economic value captured by a standalone attendance tracker.

---

## 4. Validation Experiments

Before writing another line of geospatial code or refactoring database schemas, run these three low-cost experiments:

### Experiment 1: The "Paper Tiger" Exam Clearance Test (Willingness to Pay)
* **What to Test**: Will university department heads pay for an automated 75% exam clearance audit tool if it eliminates paper manipulation?
* **How to Test**:
  1. Pick 10 specific Department Chairs or Deans of Academic Affairs (e.g., at institutions in your regional market where 75% attendance is legally required to sit for exams).
  2. Create a 1-page PDF showing: "Automated Student Exam Eligibility Docket: Zero Proxy Signing, One-Click Clearance Sheets."
  3. Offer a single-semester department pilot for **$350** (or local currency equivalent). Do not offer it for free.
* **Success Criteria**: At least 2 department chairs agree in writing to budget and pay the pilot fee for their department.
* **Time & Cost**: 7 days, $0.

### Experiment 2: The Indoor Physics Reality Check
* **What to Test**: Can standard mobile GPS reliably verify presence inside concrete lecture halls without false absent flags?
* **How to Test**:
  1. Visit 3 real university lecture halls (1 ground floor, 1 basement/interior, 1 top floor).
  2. Have 5 students stand at opposite corners of the lecture hall and record their raw GPS coordinates, accuracy radius (meters), and elevation report via standard mobile browsers.
  3. Measure how many readings fall outside a strict 20m building geofence or fail to distinguish floor levels.
* **Success Criteria**: Less than 5% false-rejection rate under realistic indoor conditions. (If >15% fail, geofencing is operationally unviable without Bluetooth BLE hardware).
* **Time & Cost**: 3 days, $30 (student coffee/transport).

### Experiment 3: The Vocational Clock-Hour Pitch (Alternative Market)
* **What to Test**: Do private career colleges, vocational academies, or nursing schools have immediate budget for accredited clock-hour attendance tracking?
* **How to Test**:
  1. Identify 25 vocational training institutes (aviation schools, nursing academies, maritime institutes, beauty academies) where state accreditation requires proven contact hours.
  2. Cold email/call Directors of Compliance offering an automated geo-verified contact hour tracking platform at $99/month.
* **Success Criteria**: Minimum 4 discovery meetings booked and at least 1 letter of intent (LOI) requesting a demo within 14 days.
* **Time & Cost**: 10 days, $50 (LinkedIn Sales Navigator / cold email tool).

---

## 5. The Honest Verdict

### **PIVOT IT**

**Why**:
Building a generic university attendance tracker is a classic founder trap: the software feels indispensable when you are a student or lecturer, but selling it to institutional leadership is a commercial nightmare. Universities take a year to evaluate software, will demand free integrations with legacy systems, and will ultimately ask why their existing LMS cannot do the same thing. Over-engineering spatial schemas and 3D elevation geofences will not fix a broken distribution model.

**The Pivot Angle**:
Pivot away from general higher education toward **High-Stakes Compliance Tracking**:
1. **Regulated Clock-Hour Tracking (The CourseKey Model)**: Target vocational training, nursing clinics, flight schools, and mandatory corporate certifications where unverified attendance results in accreditation revocation or loss of state subsidies. In these markets, attendance is not a teaching aid; it is an existential legal audit requirement with dedicated budget.
2. **Automated Exam Clearance Auditing (Local Monopolies)**: In emerging markets where strict attendance quotas (e.g. 75%) determine exam hall access, sell Directly to the Dean of Examination as an anti-corruption and fraud-prevention clearance appliance, rather than an all-in-one student portal.

**The Single Most Important Action This Week**:
Stop building spatial features. Take the current prototype, walk onto an actual campus, and ask two Department Chairs to pay $300 to run an exam clearance audit pilot for their upcoming midterm cycle. If they say no to $300, no amount of GeoJSON engineering will make this a viable business.
