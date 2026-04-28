import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  canonicalPath?: string;
}

export const SEO: React.FC<SEOProps> = ({
  title = 'Presently — Reclaiming Lecture Integrity',
  description = 'The #1 anti-proxy attendance system for Nigerian universities. GPS-verified, real-time, and built for modern campuses.',
  keywords = 'nigerian university attendance, anti proxy system, gps attendance tracking, campus technology, lecture integrity, Presently app',
  image = 'https://getpresently.com.ng/og-image.png',
  url = 'https://getpresently.com.ng',
  canonicalPath
}) => {
  const fullUrl = canonicalPath ? `${url}${canonicalPath}` : url;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content="website" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {canonicalPath && <link rel="canonical" href={fullUrl} />}
    </Helmet>
  );
};
