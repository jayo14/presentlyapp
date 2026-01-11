import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
}

export const SEO: React.FC<SEOProps> = ({
  title = 'Presently | Smart Attendance Management System',
  description = 'Modern, intelligent attendance tracking system for educational institutions. Track attendance with GPS verification, real-time analytics, and AI-powered insights.',
  keywords = 'attendance, tracking, education, GPS, analytics, student, lecturer, institution',
  image = 'https://presentlyapp.vercel.app/og-image.png',
  url = 'https://presentlyapp.vercel.app/',
  type = 'website',
}) => {
  const fullTitle = title.includes('|') ? title : `${title} | Presently`;

  const schemaOrgJSONLD = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Presently',
    url: 'https://presentlyapp.vercel.app/',
    logo: 'https://presentlyapp.vercel.app/icon-512.png',
    sameAs: [
      'https://github.com/codegallantx',
    ],
    description: description,
  };

  const websiteSchemaJSONLD = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Presently',
    url: url,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${url}search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />

      {/* Canonical URL */}
      <link rel="canonical" href={url} />

      {/* Schema.org JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify(schemaOrgJSONLD)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(websiteSchemaJSONLD)}
      </script>
    </Helmet>
  );
};
