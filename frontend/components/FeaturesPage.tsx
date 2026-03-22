import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, MapPinned, BellRing, FileCheck2 } from 'lucide-react';
import { SEO } from './SEO';

export const FeaturesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-text">
      {/* SEO: Route-specific metadata for features landing page. */}
      <SEO
        title="Features"
        description="Explore Presently features: GPS-verified attendance, real-time session alerts, anti-proxy controls, and compliance-ready exports."
        canonicalPath="/features"
      />

      <main className="max-w-6xl mx-auto px-6 py-16">
        <h1 className="font-headline text-4xl font-bold mb-4">Attendance Infrastructure for Modern Campuses</h1>
        <p className="text-textMuted mb-10 max-w-3xl">
          Presently combines location intelligence, live alerts, and institutional reporting to eliminate proxy attendance at Nigerian universities.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <article className="p-6 rounded-2xl border border-outline bg-surface">
            <MapPinned className="text-primary mb-3" size={24} />
            <h2 className="font-headline text-xl font-semibold mb-2">GPS-Verified Check-in</h2>
            <p className="text-textMuted">Confirm student presence with live coordinates and classroom radius enforcement.</p>
          </article>

          <article className="p-6 rounded-2xl border border-outline bg-surface">
            <ShieldCheck className="text-primary mb-3" size={24} />
            <h2 className="font-headline text-xl font-semibold mb-2">Anti-Proxy Security</h2>
            <p className="text-textMuted">Reduce impersonation with device-aware controls and session integrity checks.</p>
          </article>

          <article className="p-6 rounded-2xl border border-outline bg-surface">
            <BellRing className="text-primary mb-3" size={24} />
            <h2 className="font-headline text-xl font-semibold mb-2">Real-Time Notifications</h2>
            <p className="text-textMuted">In-app and push notifications keep students and lecturers aligned every session.</p>
          </article>

          <article className="p-6 rounded-2xl border border-outline bg-surface">
            <FileCheck2 className="text-primary mb-3" size={24} />
            <h2 className="font-headline text-xl font-semibold mb-2">Compliance Reports</h2>
            <p className="text-textMuted">Generate audit-ready attendance records for departments, faculties, and administrators.</p>
          </article>
        </div>

        <div className="mt-10">
          <Link to="/register" className="inline-flex items-center px-5 py-3 rounded-xl bg-primary text-on-primary-fixed font-semibold">
            Join the Waitlist
          </Link>
        </div>
      </main>
    </div>
  );
};
