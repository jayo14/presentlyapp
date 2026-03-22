import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { SEO } from '../SEO';
import { JsonLd } from '../seo/JsonLd';
import { SITE_URL } from '../seo/seoConfig';
import { universityBySlug } from '../../data/universities';

export const UniversityLandingPage: React.FC = () => {
  const { slug = '' } = useParams();
  const school = universityBySlug[slug];

  if (!school) {
    return (
      <div className="min-h-screen bg-background text-text px-6 py-16">
        <SEO title="University Not Found" description="University landing page not found." canonicalPath="/universities" noIndex />
        <h1 className="font-headline text-3xl font-bold mb-4">University Not Found</h1>
        <Link className="text-primary underline" to="/universities">Back to Universities</Link>
      </div>
    );
  }

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: school.name,
    url: `${SITE_URL}/universities/${school.slug}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: school.city,
      addressRegion: school.state,
      addressCountry: 'NG',
    },
  };

  return (
    <div className="min-h-screen bg-background text-text">
      {/* SEO: University-specific metadata + canonical URL. */}
      <SEO
        title={`Attendance System for ${school.name}`}
        description={`Presently helps ${school.shortName} run GPS-verified attendance, real-time notifications, and compliance reporting.`}
        canonicalPath={`/universities/${school.slug}`}
      />
      {/* SEO: University-specific structured data. */}
      <JsonLd schema={schema} />

      <main className="max-w-5xl mx-auto px-6 py-16">
        <h1 className="font-headline text-4xl font-bold mb-3">Attendance System for {school.name}</h1>
        <p className="text-textMuted mb-10">{school.description}</p>

        <section className="grid md:grid-cols-3 gap-4 mb-10">
          <div className="p-5 rounded-xl border border-outline bg-surface">
            <p className="text-xs text-textMuted mb-1">Campus</p>
            <p className="font-semibold">{school.city}, {school.state}</p>
          </div>
          <div className="p-5 rounded-xl border border-outline bg-surface">
            <p className="text-xs text-textMuted mb-1">Estimated Students</p>
            <p className="font-semibold">{school.studentCount.toLocaleString()}</p>
          </div>
          <div className="p-5 rounded-xl border border-outline bg-surface">
            <p className="text-xs text-textMuted mb-1">Founded</p>
            <p className="font-semibold">{school.founded}</p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="font-headline text-2xl font-semibold mb-3">How It Works at {school.shortName}</h2>
          <ul className="space-y-3 text-textMuted list-disc pl-6">
            <li>Lecturers open class sessions with location radius validation.</li>
            <li>Students receive live attendance alerts and submit check-ins on time.</li>
            <li>Administrators access real-time logs and export reports for compliance.</li>
          </ul>
        </section>

        <Link to="/register" className="inline-flex items-center px-5 py-3 rounded-xl bg-primary text-on-primary-fixed font-semibold">
          Join {school.shortName} Waitlist
        </Link>
      </main>
    </div>
  );
};
