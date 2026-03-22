import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  DEFAULT_TITLE,
  SITE_URL,
  TITLE_TEMPLATE,
  TWITTER_HANDLE,
} from './seo/seoConfig';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  canonicalPath?: string;
  type?: 'website' | 'article';
  /** Prevent search-engine indexing while still allowing social-preview crawlers to read OG tags */
  noIndex?: boolean;
  jsonLd?: Record<string, unknown>;
}

export const SEO: React.FC<SEOProps> = ({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  keywords = 'gps attendance system, nigerian universities, university attendance software, location verified attendance, anti proxy attendance',
  image = DEFAULT_OG_IMAGE,
  url,
  canonicalPath,
  type = 'website',
  noIndex = false,
  jsonLd,
}) => {
  const location = useLocation();
  // SEO: Build canonical URL from route when explicit URL is not provided.
  const computedPath = canonicalPath || location.pathname;
  const canonicalUrl = url || `${SITE_URL}${computedPath}`;

  // SEO: Normalize title into default + template format.
  const fullTitle =
    title === DEFAULT_TITLE
      ? DEFAULT_TITLE
      : TITLE_TEMPLATE.replace('%s', title.replace(/\s*\|\s*Presently$/, ''));

  // SEO: Organization schema provides global brand context.
  const schemaOrgJSONLD = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Presently',
    url: SITE_URL,
    logo: `${SITE_URL}/icon-512.png`,
    sameAs: [
      'https://x.com/PresentlyNG',
    ],
    description,
  };

  // SEO: WebSite schema supports sitelinks/search context.
  const websiteSchemaJSONLD = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Presently',
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <Helmet>
      {/* SEO: Primary metadata */}
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />

      {/* SEO: Open Graph tags */}
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="Presently" />

      {/* SEO: Twitter cards */}
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
      <meta name="twitter:site" content={TWITTER_HANDLE} />

      {/* SEO: Canonical URL */}
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />

      {/* SEO: Structured data */}
      {/* Schema.org JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify(schemaOrgJSONLD)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(websiteSchemaJSONLD)}
      </script>
      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  );
};
