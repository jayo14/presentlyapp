import React from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../SEO';
import { universities } from '../../data/universities';

export const UniversitiesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-text">
      {/* SEO: Metadata for universities listing page. */}
      <SEO
        title="Universities"
        description="See how Presently supports GPS-verified attendance at top Nigerian universities."
        canonicalPath="/universities"
      />

      <main className="max-w-6xl mx-auto px-6 py-16">
        <h1 className="font-headline text-4xl font-bold mb-4">University Landing Pages</h1>
        <p className="text-textMuted mb-10">Explore institution-specific attendance workflows and rollout strategies.</p>

        <div className="grid md:grid-cols-2 gap-6">
          {universities.map((school) => (
            <article key={school.slug} className="p-6 rounded-2xl border border-outline bg-surface">
              <h2 className="font-headline text-2xl font-semibold mb-1">{school.shortName}</h2>
              <p className="text-textMuted mb-3">{school.name}</p>
              <p className="text-sm text-textMuted mb-4">{school.city}, {school.state}</p>
              <Link
                to={`/universities/${school.slug}`}
                className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-on-primary-fixed text-sm font-semibold"
              >
                View {school.shortName} Page
              </Link>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
};
