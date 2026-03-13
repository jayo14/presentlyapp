# Extra Features Audit

This document lists features found in the "Presently" codebase that were NOT listed in the initial `tasks.md` checklist.

## 1. Security & Device Tracking
- **Device Fingerprinting:** The system uses `FingerprintJS` (visitorId) to track user devices.
- **New Login Alerts:** Users receive email notifications when a login occurs from a new, untrusted device.
- **Device Management:** Admins can view and manage user devices (`UserDevice` model in `accounts` app).
- **Security Audit Logs:** A comprehensive `AuditLog` model tracks critical actions like course registration, dropping, and security events.

## 2. Advanced Attendance Verification
- **Multi-Sample Verification:** The attendance check-in process takes multiple GPS samples over a duration to ensure stability and detect mock locations.
- **Confidence Scoring System:** A weighted scoring system (0-100) evaluates factors like GPS accuracy, movement stability, mock location detection, and network environment.
- **Geofence Visualization:** The `Venue` management system includes support for polygon-based geofences, with UI for visualization.

## 3. Real-time Monitoring & Dashboard Features
- **Live Session Analytics:** Lecturers and Students can see active sessions in real-time (via high-frequency polling).
- **Automatic Session Expiry:** The system automatically calculates and displays time remaining for sessions and expires them when time is up.
- **In-app Notifications:** A dedicated notification system (`notifications` app) handles session alerts, enrollment updates, and broadcasts.
- **FCM Push Notifications:** Full integration with Firebase Cloud Messaging for mobile push notifications.

## 4. Performance & UX Enhancements
- **Offline Sync Manager:** Attendance check-ins and profile updates are cached locally when offline and synchronized when the connection is restored using `IndexedDB`.
- **Lazy Loading & Route Pre-fetching:** Optimized React routing with retry logic for loading chunks across network changes.
- **System Monitoring:** A dedicated `system` app tracks system stats (users, venues, sessions), activity trends, and security alerts.

## 5. Administrative Controls
- **Admin Audit Trail:** Detailed logs of all administrative actions.
- **Role-based Redirects:** Intelligent routing that directs users to their respective dashboards immediately after login based on their assigned role.
- **Onboarding Guard:** A specialized route guard ensures students cannot access the dashboard until they've completed their academic profile (onboarding).
