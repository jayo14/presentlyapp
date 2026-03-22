import React from 'react';

interface JsonLdProps {
  schema: Record<string, unknown>;
}

export const JsonLd: React.FC<JsonLdProps> = ({ schema }) => {
  // SEO: Reusable JSON-LD injector for rich results across pages.
  return <script type="application/ld+json">{JSON.stringify(schema)}</script>;
};
