const DEFAULT_SITE_URL = 'https://getpresently.com.ng';

const normalizedOrigin = (rawUrl: string) => {
  try {
    const parsed = new URL(rawUrl);
    return parsed.origin.replace(/\/$/, '');
  } catch {
    return DEFAULT_SITE_URL;
  }
};

export const getCanonicalSiteOrigin = (): string => {
  const configured = (import.meta.env.VITE_SITE_URL as string | undefined)?.trim();
  if (configured) {
    return normalizedOrigin(configured);
  }

  if (typeof window !== 'undefined') {
    return window.location.origin.replace(/^https:\/\/www\./, 'https://');
  }

  return DEFAULT_SITE_URL;
};

export const getGoogleAuthRedirectUri = (): string => `${getCanonicalSiteOrigin()}/auth/callback`;
