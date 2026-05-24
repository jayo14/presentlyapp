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
    return window.location.origin;
  }

  return DEFAULT_SITE_URL;
};

export const getGoogleAuthRedirectUri = (): string => `${getCanonicalSiteOrigin()}/auth/callback`;

export const getGoogleOAuthUrl = (): string | null => {
  const clientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined)?.trim();
  if (!clientId) return null;

  const redirectUri = getGoogleAuthRedirectUri();
  const scope = 'email profile';
  return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent`;
};
