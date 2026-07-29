# Attendance Pipeline Audit

**Date:** 2026-07-29  
**Scope:** backend/, mobile/, frontend/  
**Purpose:** Map every caller of both attendance check-in pipelines, document model usage, compare fields, and recommend a single source of truth.

---

## 1. Executive Summary

There are **two parallel attendance check-in code paths** in this repository:

| Pipeline | Endpoint | Handler | Models Written |
|---|---|---|---|
| **New Pipeline** | `POST /api/attendance/submit/` | `SubmitAttendanceView` (`attendance/views.py:229`) | `AttendanceSubmission`, `AttendanceRecord` |
| **Legacy Pipeline** | `POST /check-in/{session_code}/` (public) <br> `POST /api/sessions/{id}/check_in/` (authenticated) | `public_check_in_view` (`institutions/views.py:2462`) <br> `AttendanceSessionViewSet.check_in` (`institutions/views.py:2065`) | `Attendance`, `AttendanceAttemptLog`, `UserDevice` |

**Key finding:** The mobile app and the web frontend **do not call** `POST /api/attendance/submit/`. They exclusively use the legacy pipeline. The new pipeline is only exercised by backend unit tests.

---

## 2. Pipeline 1 — New Pipeline (`/api/attendance/submit/`)

### 2.1 Endpoint Definition
- **URL:** `POST /api/attendance/submit/`
- **View:** `SubmitAttendanceView` in `backend/attendance/views.py:229`
- **URLConf:** `backend/attendance/urls.py:13`
- **Models:** `AttendanceSubmission` (`attendance/models.py:46`), `AttendanceRecord` (`attendance/models.py:128`)

### 2.2 Caller Mapping

| Caller File | Call Type | Evidence | Active Use? |
|---|---|---|---|
| `backend/attendance/tests.py:232,240,247,254,260,266,276,282,297` | Test client POST | `self.client.post('/api/attendance/submit/', ...)` | **No** — test-only |
| `frontend/` | — | `grep` found zero matches for `attendance/submit` in frontend TS/TSX/JS | **No** |
| `mobile/` | — | `grep` found zero matches for `attendance/submit` in mobile TS/TSX | **No** |

### 2.3 Model Writes
- **`AttendanceSubmission`** — created in `attendance/views.py:350` with full GPS payload, scoring, behavioral flags, verdict.
- **`AttendanceRecord`** — created/updated via `update_or_create` in `attendance/views.py:371` as the clean "what lecturers see" output.

### 2.4 Active Use Verdict
**NO.** This endpoint is not wired into any production client. It is only hit by Django test cases.

---

## 3. Pipeline 2 — Legacy Pipeline (`/check-in/{code}/` and `/api/sessions/{id}/check_in/`)

### 3.1 Endpoint Definitions
- **Public URL:** `POST /check-in/{session_code}/`
  - **View:** `public_check_in_view` in `backend/institutions/views.py:2462`
  - **URLConf:** `backend/institutions/urls.py:63`
- **Authenticated URL:** `POST /api/sessions/{id}/check_in/`
  - **View:** `AttendanceSessionViewSet.check_in` in `backend/institutions/views.py:2065`
  - **URLConf:** `backend/institutions/urls.py:35` (router `sessions`)
- **Core Logic:** `perform_attendance_check_in` in `backend/institutions/attendance_logic.py:106`
- **Models:** `Attendance` (`institutions/models.py:711`), `AttendanceAttemptLog` (`attendance/models.py:5`), `UserDevice` (`accounts/models.py:3`)

### 3.2 Caller Mapping

| Caller File | Call Type | Endpoint Hit | Evidence | Active Use? |
|---|---|---|---|---|
| `mobile/app/(student)/mark-attendance.tsx:123` | `api.checkIn.get(normalizedCode)` | `GET /check-in/{code}/` | Direct invocation in `initializeSession` | **Yes** |
| `mobile/hooks/useAttendanceSession.ts:500` | `api.checkIn.mark(sessionConfig.sessionCode, payload)` | `POST /check-in/{code}/` | Direct invocation in `startSession` | **Yes** |
| `mobile/services/sessions.ts:24` | `apiClient.post('/sessions/{id}/check_in/', data)` | `POST /api/sessions/{id}/check_in/` | `sessionsService.checkIn` exists but **no student screen calls it** | **No** (dead code on mobile) |
| `frontend/components/Attendance/AttendanceCheckIn.tsx:88` | `sessionApi.checkInByCode(...)` | `POST /check-in/{code}/` | Direct invocation in `handleCheckIn` | **Yes** |
| `frontend/components/Dashboard/StudentDashboard.tsx:85` | `sessionApi.checkInByCode(...)` | `POST /check-in/{code}/` | Direct invocation for quick check-in | **Yes** |
| `frontend/components/Layout.tsx:246` | `sessionApi.checkInByCode(...)` | `POST /check-in/{code}/` | Direct invocation for nav check-in | **Yes** |
| `frontend/components/Attendance/PublicCheckInPage.tsx:261` | `sessionApi.checkIn(session.id, ...)` | `POST /api/sessions/{id}/check_in/` | Direct invocation in public page | **Yes** |
| `backend/institutions/tests.py` | Test client | Both endpoints | Multiple `check_in` and `public_check_in_view` calls | **No** (test-only) |
| `backend/institutions/test_comprehensive.py:648,679,693,706,725,738` | Test client | Both endpoints | Integration tests for check-in flow | **No** (test-only) |

### 3.3 Model Writes
- **`AttendanceAttemptLog`** — created in `attendance_logic.py:369` (rejected) and `attendance_logic.py:399` (success/flagged) with full fraud telemetry.
- **`Attendance`** — created in `attendance_logic.py:444` with location, status, trust score, and verification metadata.
- **`UserDevice`** — updated/created in `attendance_logic.py:421` via `update_or_create` keyed on `(user, device_fingerprint)`.

### 3.4 Active Use Verdict
**YES.** This is the only pipeline reachable by production clients (mobile app + web frontend).

---

## 4. Mobile App Caller Verification (Detailed)

### 4.1 Student Check-in Screen
- **File:** `mobile/app/(student)/mark-attendance.tsx`
- **Flow:**
  1. `initializeSession(code)` → `api.checkIn.get(normalizedCode)` → `GET /check-in/{code}/`
  2. `useAttendanceSession(sessionConfig)` → `startSession()` → `api.checkIn.mark(sessionConfig.sessionCode, payload)` → `POST /check-in/{code}/`

### 4.2 API Constants
- **File:** `mobile/constants/api.ts:33-36`
  ```ts
  CHECK_IN: {
    GET: (code: string) => `/check-in/${code}/`,
    MARK: (code: string) => `/check-in/${code}/`,
  }
  ```
  Both map to the legacy public endpoint.

### 4.3 Unused Mobile Constants
- **File:** `mobile/constants/api.ts:62-68` defines `ATTENDANCES` CRUD endpoints (`/attendances/`), but `grep` found **zero** mobile callers.
- **File:** `mobile/services/sessions.ts:24` defines `checkIn` for `/sessions/{id}/check_in/`, but **no student screen calls it**.

### 4.5 Dead Code Identification
The following mobile endpoints are defined but **never invoked** by production code:

| Defined Endpoint | Defined In | Called By | Status |
|---|---|---|---|
| `POST /sessions/{id}/check_in/` | `mobile/services/sessions.ts:24` | None (student screens use `/check-in/{code}/` instead) | Dead code |
| `GET/POST/PUT/DELETE /attendances/` | `mobile/constants/api.ts:62-68` | None | Dead code |
| `GET/POST /attendances/` | `mobile/services/analytics.ts:68-73` | None (mark/getHistory never imported) | Dead code |

These should be removed or wired up if the new pipeline is ever activated.

### 4.4 Verified Pipeline
The mobile app **exclusively** calls the **legacy pipeline** (`/check-in/{code}/`).

---

## 5. Frontend Web Caller Verification (Detailed)

### 5.1 Web Check-in Components
| Component | File | Endpoint Called |
|---|---|---|
| `AttendanceCheckIn` | `frontend/components/Attendance/AttendanceCheckIn.tsx:88` | `POST /check-in/{code}/` |
| `PublicCheckInPage` | `frontend/components/Attendance/PublicCheckInPage.tsx:261` | `POST /api/sessions/{id}/check_in/` |
| `StudentDashboard` | `frontend/components/Dashboard/StudentDashboard.tsx:85` | `POST /check-in/{code}/` |
| `Layout` | `frontend/components/Layout.tsx:246` | `POST /check-in/{code}/` |

### 5.2 Web API Service
- **File:** `frontend/services/api/attendance.ts:169-182` (`sessionApi.checkInByCode`) and `:161-166` (`sessionApi.checkIn`).
- Both methods hit the **legacy pipeline**.
- The `attendanceApi` CRUD helpers (`/attendances/`) are defined but **never called** by any student check-in flow.

### 5.3 Verified Pipeline
The web frontend **exclusively** calls the **legacy pipeline**.

### 5.4 Dead Web Code
The following frontend API helpers are defined but **never invoked** by student check-in flows:

| Defined Endpoint | Defined In | Called By | Status |
|---|---|---|---|
| `GET /attendances/` | `frontend/services/api/attendance.ts:194` | None | Dead code |
| `POST /attendances/` | `frontend/services/api/attendance.ts:206` | None | Dead code |
| `PATCH /attendances/{id}/` | `frontend/services/api/attendance.ts:213` | None | Dead code |
| `DELETE /attendances/{id}/` | `frontend/services/api/attendance.ts:219` | None | Dead code |

These are the new-pipeline CRUD helpers. They are not wired into any component.

---

## 6. Backend Caller Verification (Detailed)

### 6.1 New Pipeline Callers
| Caller | Evidence |
|---|---|
| `backend/attendance/tests.py` | 9 POSTs to `/api/attendance/submit/` |
| **No production views or tasks call this endpoint.** | — |

### 6.2 Legacy Pipeline Callers
| Caller | Evidence |
|---|---|
| `backend/institutions/views.py:2068` | `AttendanceSessionViewSet.check_in` → `perform_attendance_check_in` |
| `backend/institutions/views.py:2508` | `public_check_in_view` → `perform_attendance_check_in` |
| `backend/institutions/views.py:106` | `sync_manual_attendance_for_user` → `Attendance.objects.get_or_create` (materializes manual rows into `Attendance`) |
| `backend/institutions/views.py:2025` | `AttendanceViewSet` (partial_update/create via router) → `Attendance.objects.update_or_create` |
| `backend/analytics/views.py` | Multiple `Attendance.objects.filter(...)` reads for dashboard analytics |
| `backend/reports/export_services.py` | `Attendance.objects.filter(...)` reads for Excel export |
| `backend/system/views.py:405-451` | `AttendanceRecord.objects.filter(...)` reads for admin stats |
| `backend/institutions/tasks/security_tasks.py` | `UserDevice.objects.filter/create` for login security |

---

## 7. Model Usage Tables

### 7.1 `UserDevice` (`accounts/models.py:3`)

| Operation | File | Line | Read/Write |
|---|---|---|---|
| `UserDevice.objects.filter(user=request.user)` | `accounts/views.py:18` | List devices | Read |
| `UserDevice.objects.get(id=device_id, user=request.user)` | `accounts/views.py:30` | Trust device | Read |
| `UserDevice.objects.get(id=device_id)` | `accounts/views.py:72` | Trust confirm | Read |
| `UserDevice.objects.update_or_create(...)` | `institutions/attendance_logic.py:421` | Register device on check-in | Write |
| `UserDevice.objects.filter(...)` | `institutions/tasks/security_tasks.py:76,85` | Login anomaly detection | Read |
| `UserDevice.objects.create(...)` | `institutions/tasks/security_tasks.py:92` | New device registration | Write |
| `UserDeviceSerializer` | `accounts/serializers.py:4` | Serialization | Read |
| `UserDeviceAdmin` | `accounts/admin.py:4` | Django admin | Read |

**Also referenced by:** `frontend/services/api/security.ts` (TypeScript interface) and `frontend/components/Security/DevicesPage.tsx`.

### 7.2 `AttendanceAttemptLog` (`attendance/models.py:5`)

| Operation | File | Line | Read/Write |
|---|---|---|---|
| `AttendanceAttemptLog.objects.create(...)` | `institutions/attendance_logic.py:369` | Log rejected attempt | Write |
| `AttendanceAttemptLog.objects.create(...)` | `institutions/attendance_logic.py:399` | Log success/flagged attempt | Write |
| `AttendanceAttemptLog.objects.filter(student=request.user, rejected_reason__isnull=True).first()` | `institutions/attendance_logic.py:339` | Network continuity bonus | Read |

**Also referenced by:** `backend/load_fixtures_raw.py` (fixture mapping), `backend/attendance/tests.py` (test assertions).

### 7.3 `Attendance` (`institutions/models.py:711`)

| Operation | File | Line | Read/Write |
|---|---|---|---|
| `Attendance.objects.create(...)` | `institutions/attendance_logic.py:444` | Legacy check-in success | Write |
| `Attendance.objects.get_or_create(...)` | `institutions/views.py:106` | Manual record sync | Write |
| `Attendance.objects.update_or_create(...)` | `institutions/views.py:2025` | AttendanceViewSet create/update | Write |
| `Attendance.objects.filter(...)` | `analytics/views.py:58,130,159,387,401` | Dashboard analytics | Read |
| `Attendance.objects.filter(...)` | `reports/export_services.py:40,91,156` | Report generation | Read |
| `Attendance.objects.filter(...)` | `institutions/serializers.py:400,410,477,481,589` | Serializer counts | Read |
| `Attendance.objects.filter(...)` | `institutions/views.py:2140,2165` | Student dashboard summary | Read |
| `Attendance.objects.filter(...)` | `institutions/test_comprehensive.py:655,689,699,754` | Integration tests | Read/Write |
| `Attendance.objects.create(...)` | `institutions/tests.py:129` | Unit tests | Write |
| `Attendance.objects.get_or_create(...)` | `institutions/management/commands/populate_seed_data.py:499` | Seed data | Write |

**Also referenced by:** `backend/institutions/admin.py:126` (`AttendanceAdmin`).

### 7.4 `AttendanceSubmission` (`attendance/models.py:46`)

| Operation | File | Line | Read/Write |
|---|---|---|---|
| `AttendanceSubmission.objects.create(...)` | `attendance/views.py:350` | New pipeline submission | Write |
| `AttendanceSubmission.objects.filter(...)` | `attendance/views.py:291,310,454,480` | Duplicate check, lecturer queries, override | Read |
| `AttendanceSubmission.objects.select_for_update(...)` | `attendance/views.py:310` | Atomic duplicate guard | Read |
| `AttendanceSubmission.objects.get(...)` | `attendance/views.py:480` | Lecturer override | Read |
| `AttendanceSubmission.objects.create(...)` | `attendance/tests.py:289,342,386` | Tests | Write |

### 7.5 `AttendanceRecord` (`attendance/models.py:128`)

| Operation | File | Line | Read/Write |
|---|---|---|---|
| `AttendanceRecord.objects.update_or_create(...)` | `attendance/views.py:371` | New pipeline clean output | Write |
| `AttendanceRecord.objects.filter(...)` | `attendance/views.py:324,516` | Duplicate check, lecturer override | Read |
| `AttendanceRecord.objects.filter(...)` | `system/views.py:417,418,451` | Admin system stats | Read |
| `AttendanceRecord.objects.create(...)` | `attendance/tests.py:394` | Tests | Write |

---

## 8. Field Comparison: Legacy vs. New Pipeline

### 8.1 `Attendance` (Legacy) vs. `AttendanceRecord` (New)

| Concept | Legacy (`Attendance`) | New (`AttendanceRecord`) | Notes |
|---|---|---|---|
| Primary key | Auto `id` | Auto `id` | — |
| Session FK | `session` (FK) | `submission` → `AttendanceSubmission.session` | Indirect in new |
| Student FK | `student` (FK) | `submission` → `AttendanceSubmission.student` | Indirect in new |
| Timestamp | `checked_in_at` (auto_now_add) | `created_at` / `updated_at` | New has explicit updated_at |
| Verdict | `status` (`PRESENT`/`LATE`/`EXCUSED`/`FLAGGED`) | `final_verdict` (`ACCEPTED`/`FLAGGED`/`REJECTED`) | Different vocabularies; `LATE`/`EXCUSED` missing in new |
| Score | `trust_score` (0-100) | `confidence_score` (0-100) | Same scale, different name |
| Location | `latitude`, `longitude`, `accuracy`, `elevation` | Packed into `submission.coordinates` JSON | New loses elevation and separate accuracy fields |
| Geofence result | `location_verified` (bool) | Not stored directly | Derived from score in new |
| Distance | `distance_from_venue` (decimal) | Not stored | Legacy only |
| Audit metadata | `verification_metadata` (JSON) | `submission.score_breakdown` + `submission.fail_reasons` | Split across submission fields in new |
| Override tracking | None | `overridden_by`, `override_reason`, `overridden_at` | **New only** |

### 8.2 `AttendanceSubmission` (New) vs. `Attendance` (Legacy) — extra fields

| Field | In New (`AttendanceSubmission`) | In Legacy (`Attendance`) | Notes |
|---|---|---|---|
| `coordinates` | Yes (JSON `{lat, lng, accuracyMeters}`) | No — uses separate `latitude`/`longitude`/`accuracy` | New packs into JSON |
| `sample_count` | Yes | No | Number of GPS samples collected |
| `mock_gps_flag` | Yes | No | Equivalent to `is_mocked` in `AttendanceAttemptLog`, not `Attendance` |
| `network_type` | Yes | No | WiFi / Cellular / None |
| `movement_variance` | Yes | No | Accelerometer variance |
| `suspiciously_still` | Yes | No | Derived from movement variance |
| `collection_duration_ms` | Yes | No | How long GPS was collected |
| `confidence_score` | Yes (client) | No — uses `trust_score` | Client-side self-reported |
| `server_confidence_score` | Yes | No | Server recomputation |
| `verdict` | Yes | No — uses `status` | `ACCEPTED`/`FLAGGED`/`REJECTED` |
| `score_breakdown` | Yes | No | JSON breakdown of scoring |
| `fail_reasons` | Yes | No | JSON list of failure reasons |
| `behavioral_flags` | Yes | No | `appBackgrounded`, `backgroundDurationMs`, `locationExitCount`, `windowRestartCount`, `tapPatternSuspicious` |
| `ip_address` | Yes | No | Stored at submission level |
| `device_fingerprint` | Yes | No | Equivalent to `visitor_id` in `AttendanceAttemptLog` |
| Override fields | Yes | No | `overridden_by`, `override_reason`, `overridden_at` |

### 8.3 `AttendanceAttemptLog` (Legacy) vs. `AttendanceSubmission` (New) — extra fields

| Field | In Legacy (`AttendanceAttemptLog`) | In New (`AttendanceSubmission`) | Notes |
|---|---|---|---|
| `visitor_id` | Yes | No — has `device_fingerprint` | Similar purpose, different name |
| `device_id` | Yes | No | Mobile device identifier |
| `webgl_renderer` | Yes | No | Emulator detection (`SwiftShader`/`llvmpipe`) |
| `motion_detected` | Yes | No | Whether sensors detected movement |
| `ip_city` | Yes | No | City inferred from IP |
| `drift_avg` | Yes | No | Average GPS drift from center |
| `inside_polygon` | Yes | No | Whether inside venue geofence |
| `is_mocked` | Yes | No — has `mock_gps_flag` | Similar but `mock_gps_flag` is client-reported boolean |
| `rejected_reason` | Yes (single string) | No — has `fail_reasons` (list) | Different structure |
| `user_agent` | Yes | No | Raw user-agent string |
| `accuracy` | Yes | No — packed into `coordinates` | Per-sample vs packed |
| `latitude` / `longitude` | Yes | No — packed into `coordinates` | Last sample location |

### 8.4 `UserDevice` — Legacy Fraud Signal (No New Equivalent)

| Field | Purpose | Used Where |
|---|---|---|
| `device_fingerprint` | Hardware ID (`visitorId`) | `attendance_logic.py:298,421` |
| `is_trusted` | Whether device has been seen before with good score | `attendance_logic.py:428` |
| `user_agent` | Device/browser string | `attendance_logic.py:425` |
| `ip_address` | Last seen IP | `attendance_logic.py:427` |
| `geo_country`, `geo_city`, `timezone`, `isp`, `lat`, `lon` | GeoIP enrichment | `security_tasks.py` (login flow) |

**Critical:** `UserDevice` is the only place that persists cross-session device trust. The new pipeline has **no equivalent** — it stores a one-off `device_fingerprint` on `AttendanceSubmission`, but never builds a trust history.

---

## 9. Active Use Matrix

| Endpoint | Mobile App | Web Frontend | Backend Tests | Admin / System |
|---|---|---|---|---|
| `POST /api/attendance/submit/` | ❌ No | ❌ No | ✅ Yes | ❌ No |
| `POST /check-in/{code}/` | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No |
| `POST /api/sessions/{id}/check_in/` | ❌ No (dead code) | ✅ Yes (`PublicCheckInPage`) | ✅ Yes | ❌ No |
| `GET /api/attendances/` (list) | ❌ No | ❌ No | ❌ No | ❌ No |
| `POST /api/attendances/` (create) | ❌ No | ❌ No | ❌ No | ❌ No |
| `GET /api/attendance/session/{id}/` | ❌ No | ❌ No | ✅ Yes | ❌ No |
| `GET /api/attendance/lecturer/session/{id}/submissions/` | ❌ No | ❌ No | ✅ Yes | ❌ No |
| `PATCH /api/attendance/lecturer/override/{id}/` | ❌ No | ❌ No | ✅ Yes | ❌ No |

**Conclusion:** The new pipeline endpoints (`/api/attendance/submit/`, `/api/attendance/session/`, `/api/attendance/lecturer/`) are **test-only**. The legacy pipeline is the **only production path**.

---

## 10. Recommendation

### 10.1 Single Source of Truth
**The legacy pipeline should become the single source of truth.**

Rationale:
1. **It is the only pipeline with production traffic.** Mobile and web clients both exclusively call `/check-in/{code}/` and `/api/sessions/{id}/check_in/`.
2. **It has richer fraud detection.** `AttendanceAttemptLog` captures `visitor_id`, `device_id`, `webgl_renderer`, `motion_detected`, `ip_city`, `drift_avg`, `inside_polygon`, `is_mocked`, and `user_agent`. None of these exist in the new pipeline.
3. **It maintains device trust history.** `UserDevice` tracks whether a student has used a device before and whether it is trusted. The new pipeline lacks any cross-session trust memory.
4. **It supports manual attendance sync.** `sync_manual_attendance_for_user` materializes `ManualAttendanceRecord` rows into `Attendance`, which the new pipeline does not handle.

### 10.2 What Must Migrate From the New Pipeline
To avoid losing capability when retiring the new pipeline:

| New Pipeline Feature | Migration Target |
|---|---|
| `behavioral_flags` (`appBackgrounded`, `backgroundDurationMs`, `locationExitCount`, `windowRestartCount`, `tapPatternSuspicious`) | Add a `behavioral_flags` JSONField to `AttendanceAttemptLog` (or `Attendance`). The mobile app already collects these in `useAttendanceSession.ts`. |
| `server_confidence_score` + `score_breakdown` | Port the server-side re-computation logic from `attendance/views.py:_server_recompute_score` into `attendance_logic.py`, and store the result on `Attendance.trust_score` plus a `score_breakdown` JSONField. |
| `verdict` (`ACCEPTED`/`FLAGGED`/`REJECTED`) vs `status` (`PRESENT`/`LATE`/`FLAGGED`) | Keep `Attendance.status` for the lecturer view, but add `Attendance.verdict` (or extend the status choices) so the new pipeline's tri-state verdict is preserved. |
| `fail_reasons` list | Add a `fail_reasons` JSONField to `Attendance` or `AttendanceAttemptLog`. |
| `overridden_by` / `override_reason` / `overridden_at` | These already exist on `AttendanceSubmission` but **not** on `Attendance`. If lecturer overrides are needed, add override tracking to `Attendance` as well. |
| `AttendanceRecord` clean-output model | Keep `AttendanceRecord` as a materialized view or denormalized cache of `Attendance` for lecturer-facing reports, or merge its fields directly into `Attendance`. |

### 10.3 What Must Be Preserved From the Legacy Pipeline
- **`UserDevice` model and its `(user, device_fingerprint)` unique constraint.** Do NOT drop this. It is the cornerstone of device-based fraud detection.
- **`AttendanceAttemptLog`.** Every check-in attempt (success or failure) must continue to be logged. This is the audit trail for security and dispute resolution.
- **`Attendance.status` with `LATE` and `EXCUSED` states.** The new pipeline has no concept of lateness or excused absence. These must be preserved.
- **`ManualAttendanceRecord` → `Attendance` sync.** The `sync_manual_attendance_for_user` function must continue to work.

### 10.4 Suggested Migration Steps
1. **Do not delete any code yet.** The new pipeline is dead code, but deletion should happen only after the legacy pipeline is proven to cover all use cases.
2. **Port `behavioral_flags` into `AttendanceAttemptLog`** (or `Attendance`). The mobile payload already includes them.
3. **Port server-side scoring from `attendance/views.py:_server_recompute_score` into `attendance_logic.py`.** This gives the legacy pipeline the same rigorous score validation the new pipeline has.
4. **Add `verdict` and `fail_reasons` fields to `Attendance`** (or compute them from existing `trust_score` + `verification_metadata`).
5. **Add lecturer override tracking to `Attendance`** if override workflows are required outside the new pipeline.
6. **Deprecate `/api/attendance/submit/` and its views/serializers** once the legacy pipeline covers all scenarios.
7. **Keep `AttendanceRecord` as a read model** or merge it into `Attendance` to avoid breaking lecturer reports.

---

## 11. Evidence Sources

## 12. Grep Evidence Log

The following raw grep results were collected during this audit and confirm the caller mappings above.

### 12.1 Mobile app — zero callers of `/api/attendance/submit/`
```
$ grep -r "attendance/submit" mobile/
(no matches)
```

### 12.2 Frontend web — zero callers of `/api/attendance/submit/`
```
$ grep -r "attendance/submit" frontend/
(no matches)
```

### 12.3 Backend tests — only callers of `/api/attendance/submit/`
```
backend/attendance/tests.py:232  response = self.client.post('/api/attendance/submit/', ...
backend/attendance/tests.py:240  response = self.client.post('/api/attendance/submit/', ...
backend/attendance/tests.py:247  response = self.client.post('/api/attendance/submit/', ...
backend/attendance/tests.py:254  response = self.client.post('/api/attendance/submit/', ...
backend/attendance/tests.py:260  response = self.client.post('/api/attendance/submit/', ...
backend/attendance/tests.py:266  self.client.post('/api/attendance/submit/', ...
backend/attendance/tests.py:276  self.client.post('/api/attendance/submit/', ...
backend/attendance/tests.py:282  response = self.client.post('/api/attendance/submit/', ...
backend/attendance/tests.py:297  response = self.client.post('/api/attendance/submit/', ...
```

### 12.4 Mobile app — confirmed callers of legacy check-in
```
mobile/app/(student)/mark-attendance.tsx:123  const info: any = await api.checkIn.get(normalizedCode);
mobile/hooks/useAttendanceSession.ts:500     const response: any = await api.checkIn.mark(sessionConfig.sessionCode, payload, ...);
mobile/constants/api.ts:34                    GET: (code: string) => `/check-in/${code}/`,
mobile/constants/api.ts:35                    MARK: (code: string) => `/check-in/${code}/`,
```

### 12.5 Frontend web — confirmed callers of legacy check-in
```
frontend/components/Attendance/AttendanceCheckIn.tsx:88   const result: any = await sessionApi.checkInByCode(sessionCode.toUpperCase(), checkInData);
frontend/components/Dashboard/StudentDashboard.tsx:85     const attendanceData = await sessionApi.checkInByCode(code, location);
frontend/components/Layout.tsx:246                       const attendanceData = await sessionApi.checkInByCode(code, location);
frontend/components/Attendance/PublicCheckInPage.tsx:261  const result = await sessionApi.checkIn(session.id, checkInData);
frontend/services/api/attendance.ts:169                  checkInByCode: async (code: string, data: CheckInData): Promise<Attendance> => {
frontend/services/api/attendance.ts:161                  checkIn: async (sessionId: number, data: CheckInData): Promise<Attendance> => {
```

### 12.6 Model usage confirmation
```
UserDevice references:
  backend/accounts/views.py:18,30,72
  backend/accounts/admin.py:4
  backend/accounts/serializers.py:2,4,7
  backend/institutions/attendance_logic.py:8,298,421
  backend/institutions/tasks/security_tasks.py:35,76,85,92
  frontend/services/api/security.ts:3
  frontend/components/Security/DevicesPage.tsx:9

AttendanceAttemptLog references:
  backend/attendance/models.py:5
  backend/institutions/attendance_logic.py:7,339,369,399
  backend/attendance/tests.py:10
  backend/load_fixtures_raw.py:10,45

Attendance references:
  backend/institutions/models.py:711
  backend/institutions/views.py:39,106,2025,2140,2165
  backend/institutions/serializers.py:400,410,477,481,589
  backend/institutions/attendance_logic.py:6,444
  backend/analytics/views.py:13,58,130,159,387,401
  backend/reports/export_services.py:11,40,91,156
  backend/system/views.py:405,417,418,451
  backend/institutions/tests.py:7,66,67,85,101,123,129,159,317
  backend/institutions/test_comprehensive.py:23,583,655,689,699,735,754
  backend/institutions/management/commands/populate_seed_data.py:499
  backend/institutions/admin.py:126

AttendanceSubmission references:
  backend/attendance/models.py:46
  backend/attendance/views.py:16,153,156,166,169,172,174,234,242,291,295,310,313,324,327,350,356,371,393,394,395,454,458,459,460,464,480,483,515,516
  backend/attendance/serializers.py:2,44,55,56,80,87,115,120,136,137
  backend/attendance/tests.py:10,170,175,180,185,192,236,237,271,278,279,289,293,342,346,386,390,394,398,411,422,423

AttendanceRecord references:
  backend/attendance/models.py:128,132,145,156
  backend/attendance/views.py:16,234,324,327,371,516
  backend/attendance/serializers.py:2,115,120
  backend/attendance/tests.py:10,237,278,279,394,398,422,423
  backend/system/views.py:405,417,418,451
```

---

## 13. Verification Checklist

- [x] Searched `backend/`, `mobile/`, and `frontend/` for `/api/attendance/submit/` callers
- [x] Searched `backend/`, `mobile/`, and `frontend/` for `/check-in/` and `/sessions/{id}/check_in/` callers
- [x] Read `mobile/services/checkin.ts`, `mobile/constants/api.ts`, `mobile/app/(student)/mark-attendance.tsx`, `mobile/hooks/useAttendanceSession.ts`
- [x] Read `frontend/services/api/attendance.ts`, `frontend/components/Attendance/AttendanceCheckIn.tsx`, `frontend/components/Dashboard/StudentDashboard.tsx`, `frontend/components/Layout.tsx`, `frontend/components/Attendance/PublicCheckInPage.tsx`
- [x] Read `backend/attendance/views.py`, `backend/attendance/models.py`, `backend/attendance/urls.py`, `backend/attendance/tests.py`
- [x] Read `backend/institutions/views.py`, `backend/institutions/attendance_logic.py`, `backend/institutions/models.py`, `backend/institutions/urls.py`
- [x] Read `backend/accounts/models.py`
- [x] Mapped every read/write of `UserDevice`, `AttendanceAttemptLog`, `Attendance`, `AttendanceSubmission`, `AttendanceRecord`
- [x] Compared fields between legacy and new pipeline models
- [x] Determined active-use status with grep evidence (not assumption)
- [x] Wrote recommendation preserving fraud-detection capability
- [x] Did not modify any views, models, or URLs

---

*End of audit.*
