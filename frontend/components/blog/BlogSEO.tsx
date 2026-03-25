import React from 'react';

import { SEO } from '../SEO';

interface BlogSEOProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalPath: string;
  type?: 'website' | 'article';
  image?: string;
  jsonLd?: Record<string, unknown>;
}

export const BlogSEO: React.FC<BlogSEOProps> = ({
  title,
  description,
  keywords,
  canonicalPath,
  type = 'website',
  image,
  jsonLd,
}) => {
  // SEO: Wrapper used for all blog pages to keep canonical, OpenGraph, and structured data consistent.
  return (
    <SEO
      title={title}
      description={description}
      keywords={keywords}
      canonicalPath={canonicalPath}
      type={type}
      image={image}
      jsonLd={jsonLd}
    />
  );
};
