// SEO: Build-time generator for sitemap.xml and robots.txt in Vite deployment.
import fs from 'node:fs';
import path from 'node:path';
import { SitemapStream, streamToPromise } from 'sitemap';

const siteUrl = process.env.VITE_SITE_URL || 'https://getpresently.com.ng';
const publicDir = path.resolve(process.cwd(), 'dist');

const universities = [
  'lasustech',
  'unilag',
  'lasu',
  'futa',
  'oau',
  'ui',
  'uniport',
  'uniben',
];

const blogPosts = [
  'why-gps-attendance-matters-in-nigerian-universities',
  'how-to-roll-out-digital-attendance-in-one-semester',
];

const staticRoutes = [
  { url: '/', changefreq: 'weekly', priority: 1.0 },
  { url: '/features', changefreq: 'weekly', priority: 0.8 },
  { url: '/how-it-works', changefreq: 'weekly', priority: 0.8 },
  { url: '/universities', changefreq: 'weekly', priority: 0.8 },
  { url: '/documentation', changefreq: 'weekly', priority: 0.8 },
  { url: '/volunteers', changefreq: 'weekly', priority: 0.8 },
  { url: '/blog', changefreq: 'weekly', priority: 0.8 },
  { url: '/privacy', changefreq: 'monthly', priority: 0.4 },
  { url: '/terms', changefreq: 'monthly', priority: 0.4 },
];

const universityRoutes = universities.map((slug) => ({
  url: `/universities/${slug}`,
  changefreq: 'weekly',
  priority: 0.8,
}));

const blogRoutes = blogPosts.map((slug) => ({
  url: `/blog/${slug}`,
  changefreq: 'weekly',
  priority: 0.6,
}));

const allRoutes = [...staticRoutes, ...universityRoutes, ...blogRoutes];

async function generateSitemap() {
  const sitemap = new SitemapStream({ hostname: siteUrl });
  for (const route of allRoutes) {
    sitemap.write(route);
  }
  sitemap.end();

  const sitemapOutput = await streamToPromise(sitemap);
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapOutput.toString());
}

function generateRobots() {
  const robots = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /dashboard',
    'Disallow: /api/',
    'Disallow: /auth/',
    '',
    `Sitemap: ${siteUrl}/sitemap.xml`,
    '',
  ].join('\n');

  fs.writeFileSync(path.join(publicDir, 'robots.txt'), robots);
}

await generateSitemap();
generateRobots();
console.log('[SEO] Generated sitemap.xml and robots.txt');
