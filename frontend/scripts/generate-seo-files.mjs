// SEO: Build-time generator for sitemap.xml and robots.txt in Vite deployment.
import fs from 'node:fs';
import path from 'node:path';
import { SitemapStream, streamToPromise } from 'sitemap';

const siteUrl = process.env.VITE_SITE_URL || 'https://www.getpresently.com.ng';
const publicDir = path.resolve(process.cwd(), 'dist');

// Real, verified blog posts on disk in content/blog
const contentBlogDir = path.resolve(process.cwd(), 'content/blog');
let blogPosts = ['proxy-attendance-nigeria', 'how-presently-works'];

if (fs.existsSync(contentBlogDir)) {
  const files = fs.readdirSync(contentBlogDir);
  const detectedSlugs = files
    .filter((f) => f.endsWith('.mdx') || f.endsWith('.md'))
    .map((f) => f.replace(/\.mdx?$/, ''));
  if (detectedSlugs.length > 0) {
    blogPosts = detectedSlugs;
  }
}

const staticRoutes = [
  { url: '/', changefreq: 'weekly', priority: 1.0 },
  { url: '/features', changefreq: 'weekly', priority: 0.8 },
  { url: '/how-it-works', changefreq: 'weekly', priority: 0.8 },
  { url: '/pricing', changefreq: 'weekly', priority: 0.9 },
  { url: '/documentation', changefreq: 'weekly', priority: 0.7 },
  { url: '/blog', changefreq: 'weekly', priority: 0.8 },
  { url: '/volunteers', changefreq: 'monthly', priority: 0.5 },
  { url: '/privacy', changefreq: 'monthly', priority: 0.4 },
  { url: '/terms', changefreq: 'monthly', priority: 0.4 },
];

const blogRoutes = blogPosts.map((slug) => ({
  url: `/blog/${slug}`,
  changefreq: 'weekly',
  priority: 0.7,
}));

// Note: Programmatic doorway pages (/universities/:slug) are intentionally excluded from the sitemap
// to comply with Google Search Essentials and avoid misrepresenting institutional partnerships.
const allRoutes = [...staticRoutes, ...blogRoutes];

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
console.log('[SEO] Generated clean, verified sitemap.xml and robots.txt');
