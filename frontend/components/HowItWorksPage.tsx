import React from 'react';
import { Link } from 'react-router-dom';
import { SEO } from './SEO';

export const HowItWorksPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-text">
      {/* SEO: Route-specific metadata for process page. */}
      <SEO
        title="How It Works"
        description="See how Presently runs GPS-verified attendance from session creation to check-in validation and reporting."
        canonicalPath="/how-it-works"
      />

      <main className="max-w-5xl mx-auto px-6 py-16">
        <h1 className="font-headline text-4xl font-bold mb-4">How Presently Works</h1>
        <p className="text-textMuted mb-10">A simple 4-step workflow for secure campus attendance.</p>

        <ol className="space-y-6">
          <li className="p-6 rounded-2xl border border-outline bg-surface">
            <h2 className="font-headline text-xl font-semibold mb-2">1. Lecturer Starts Session</h2>
            <p className="text-textMuted">Lecturer creates a class session with geo-validated venue and duration.</p>
          </li>
          <li className="p-6 rounded-2xl border border-outline bg-surface">
            <h2 className="font-headline text-xl font-semibold mb-2">2. Students Receive Alerts</h2>
            <p className="text-textMuted">Students get in-app and push notifications when attendance opens.</p>
          </li>
          <li className="p-6 rounded-2xl border border-outline bg-surface">
            <h2 className="font-headline text-xl font-semibold mb-2">3. GPS Check-in Verification</h2>
            <p className="text-textMuted">Presence is accepted only when student coordinates match the configured class radius.</p>
          </li>
          <li className="p-6 rounded-2xl border border-outline bg-surface">
            <h2 className="font-headline text-xl font-semibold mb-2">4. Reports and Compliance</h2>
            <p className="text-textMuted">Attendance logs, exports, and analytics are available in real time.</p>
          </li>
        </ol>

        <div className="mt-10">
          <Link to="/features" className="inline-flex items-center px-5 py-3 rounded-xl bg-primary text-on-primary-fixed font-semibold">
            Explore Features
          </Link>
        </div>
      </main>
    </div>
  );
};
