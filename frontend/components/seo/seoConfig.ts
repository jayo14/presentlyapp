// SEO: Centralized default metadata values for consistent canonical, OG, and Twitter tags.
export const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://getpresently.com.ng').replace(/\/$/, '');
export const DEFAULT_TITLE = 'Presently — GPS-Verified Attendance for Nigerian Universities';
export const TITLE_TEMPLATE = '%s | Presently';
export const DEFAULT_DESCRIPTION =
  'Real-time, location-verified attendance system built for Nigerian university lecturers and students. No proxies. No paper registers.';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.svg`;
export const TWITTER_HANDLE = '@PresentlyNG';
