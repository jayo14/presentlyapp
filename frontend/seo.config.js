// SEO: Build metadata for route inclusion, route exclusion, and priority strategy.
module.exports = {
  siteUrl: process.env.VITE_SITE_URL || 'https://www.getpresently.com.ng',
  generateRobotsTxt: true,
  changefreq: 'weekly',
  priorities: {
    home: 1.0,
    feature: 0.8,
    blog: 0.6,
  },
  exclude: ['/dashboard', '/api/*', '/auth/*'],
};
