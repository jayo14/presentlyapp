// SEO: Compatibility config mirroring requested next-sitemap settings.
module.exports = {
  siteUrl: process.env.VITE_SITE_URL || 'https://www.getpresently.com.ng',
  generateRobotsTxt: true,
  changefreq: 'weekly',
  exclude: ['/dashboard', '/api/*', '/auth/*'],
};
