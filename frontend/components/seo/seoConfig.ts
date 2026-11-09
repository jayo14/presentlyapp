// SEO: Centralized default metadata values for consistent canonical, OG, and Twitter tags.
export const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://www.getpresently.com.ng').replace(/\/$/, '');
export const DEFAULT_TITLE = 'Presently | University Attendance Management System Nigeria';
export const TITLE_TEMPLATE = '%s | Presently';
export const DEFAULT_DESCRIPTION =
  'Location-aware lecture attendance management built for Nigerian universities. Reduce proxy signing and streamline exam clearance without expensive hardware.';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.svg`;
export const TWITTER_HANDLE = '@PresentlyNG';
