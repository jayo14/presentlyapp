#!/usr/bin/env bash
# WARMUP QUICK SETUP - Copy & Paste Implementation
# This script documents the fastest way to get warm-up running

# STEP 1: Import the hook (in your App.tsx)
cat << 'EOF'
import { useWarmUp } from '@/hooks/useWarmUp';

export default function App() {
  // ← Add this one line:
  useWarmUp('https://presentlyapp.onrender.com/health');

  return (
    <Router>
      <Outlet />
    </Router>
  );
}
EOF

# STEP 2: Verify it works (F12 → Console tab)
# Look for these messages:
# ✅ [WarmUp ...] Warm-up hook initialized
# ✅ [WarmUp ...] Ping successful (appears ~every 4 minutes)

# STEP 3: Update your Django health endpoint (optional, for sync)
cat << 'EOF'
# backend/presently/views.py
@api_view(['GET'])
def health_check(request):
    import time
    return JsonResponse({
        'status': 'healthy',
        'timestamp': int(time.time()),
        'last_pinged': cache.get('external_ping_timestamp'),  # Helps prevent duplication
    })
EOF

# STEP 4: Monitor production (check Render dashboard)
# Expected: ~15 GET /health requests per hour (one every 4 min)
# Problem: >30 requests per hour means duplicating with external service

##############################################################################
# CONFIGURATION GUIDE
##############################################################################

# Default (recommended for most cases)
useWarmUp('https://presentlyapp.onrender.com/health')

# Custom interval (if your external service uses different frequency)
useWarmUp(
  'https://presentlyapp.onrender.com/health',
  5 * 60 * 1000  // 5 minutes instead of 4
)

# All options
useWarmUp(
  'https://presentlyapp.onrender.com/health',  // API URL
  4 * 60 * 1000,                                // Ping interval (4 min default)
  30 * 1000                                     // External sync threshold (30s default)
)

##############################################################################
# DEVELOPMENT DEBUGGING (Open DevTools Console)
##############################################################################

# Manually trigger a ping
await window.__testWarmUp('https://presentlyapp.onrender.com/health')

# View success/failure stats
window.__warmUpMonitor.printReport()

# See detailed metrics
window.__warmUpMonitor.getMetrics()

# View all warm-up events timeline
window.__warmUpTimeline.print()

# Reset stats
window.__warmUpMonitor.reset()

##############################################################################
# WHAT THE HOOK DOES
##############################################################################

# ✅ Pings /health every 4 minutes when user is actively on site
# ✅ Automatically pauses when tab is hidden (respects user attention)
# ✅ Detects external pings and avoids redundant requests
# ✅ Handles errors with smart exponential backoff
# ✅ Logs only in development (production stays clean)
# ✅ Cleans up properly on unmount (no memory leaks)

##############################################################################
# EXPECTED BEHAVIOR
##############################################################################

Timeline example:
  14:00:00 - User opens app
  14:00:01 - First ping immediately
  14:04:00 - Second ping (4 min interval)
  14:08:00 - Third ping
  14:12:00 - User switches to other tab → warm-up pauses
  14:18:00 - User returns to tab
  14:18:30 - If < 10 min since last ping: resume normal schedule
          - If > 10 min since last ping: immediate refresh ping

##############################################################################
# TROUBLESHOOTING
##############################################################################

Problem: No "[WarmUp] Warm-up hook initialized" message
  → Hook not called in root App component
  → Make sure useWarmUp() is in your App.tsx

Problem: Pings failing (404, 500, network error)
  → Test manually: curl https://presentlyapp.onrender.com/health
  → Check backend health endpoint exists and works

Problem: Seeing pings every minute (too frequent)
  → Check if multiple instances are running
  → Adjust initialInterval parameter
  → Check for tab duplication (multiple tabs open)

Problem: API keeps spinning down even with warm-up
  → 4-minute interval may not be enough
  → Check if warm-up is actually running (look for logs)
  → Verify tab stays visible (Page Visibility API working)

##############################################################################
# PERFORMANCE PROFILE
##############################################################################

Memory:     ~5KB per hook
CPU:        <1% (event scheduling only)
Network:    1 request every 4 minutes (~450/day at 5 active users)
Bandwidth:  ~10MB/month (negligible)

##############################################################################
# PRODUCTION CHECKLIST
##############################################################################

☐ useWarmUp() added to App.tsx
☐ Tested in development (saw console logs)
☐ /health endpoint updated (returns last_pinged)
☐ Deployed to production
☐ Verified pings in Render logs (should see ~15/hr)
☐ Configured alerts for missing pings
☐ Monitored API response times (should stay consistent)

##############################################################################
# FILES CREATED
##############################################################################

frontend/hooks/useWarmUp.ts                    Main hook (280 lines)
frontend/utils/warmup-monitor.ts              Debugging utilities
frontend/hooks/WARMUP_INTEGRATION.md          Integration examples
frontend/WARMUP_GUIDE.md                      Complete reference
frontend/WARMUP_QUICK_SETUP.md                This file

##############################################################################
# QUESTIONS?
##############################################################################

Q: Will this affect performance?
A: No. Uses minimal CPU, ~200B network per request, pauses when tab hidden.

Q: What if my external uptime service also pings?
A: Hook detects it and adjusts timing to avoid redundant pings.

Q: Why 4 minutes?
A: Render free tier allows 15+ min of inactivity before spinning down.
   4-min intervals keep it warm when users are active.

Q: Can I adjust the interval?
A: Yes! Pass it as second parameter: useWarmUp(url, 5 * 60 * 1000)

Q: What happens in production?
A: Zero console spam. Only development mode shows logs.
   Use Render dashboard to verify pings are happening.

Q: Do I need to change my backend?
A: Not required, but recommended. /health endpoint should return:
   - status: string
   - timestamp: number (Unix timestamp)
   - last_pinged: number (optional, for sync with external service)

##############################################################################
