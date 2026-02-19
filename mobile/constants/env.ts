import Constants from 'expo-constants';

/**
 * Environment Configuration
 *
 * This file contains environment-specific configuration for the app.
 * You can override these values by creating a .env file in the root directory.
 *
 * Example .env file:
 * EXPO_PUBLIC_API_URL=https://presently.koyeb.app/api
 */

const normalizeUrl = (url: string) => url.replace(/\/$/, '');

const ensureApiPath = (url: string) => {
  const normalized = normalizeUrl(url);
  return normalized.endsWith('/api') ? normalized : `${normalized}/api`;
};

const getApiUrl = () => {
  const extraUrl = Constants.expoConfig?.extra?.API_URL;
  if (extraUrl) {
    return ensureApiPath(String(extraUrl));
  }
  if (process.env.EXPO_PUBLIC_API_URL) {
    return ensureApiPath(process.env.EXPO_PUBLIC_API_URL);
  }
  if (process.env.EXPO_PUBLIC_API_BASE_URL) {
    return ensureApiPath(process.env.EXPO_PUBLIC_API_BASE_URL);
  }
  // return 'https://presently.koyeb.app/api';
  return 'https://studious-space-broccoli-4j79w564rjxp27p5j-8000.app.github.dev/api';
};

export const ENV = {
  // API Configuration
  API_URL: getApiUrl(),
  API_TIMEOUT: Number(process.env.EXPO_PUBLIC_API_TIMEOUT) || 30000,
  
  // Feature Flags
  USE_MOCK_DATA: process.env.EXPO_PUBLIC_USE_MOCK_DATA === 'true' || false,
  ENABLE_LOGGING: process.env.EXPO_PUBLIC_ENABLE_LOGGING === 'true' || __DEV__,
  
  // App Configuration
  APP_NAME: 'Presently',
  APP_VERSION: '1.0.0',
  
  // Other
  isDevelopment: __DEV__,
  isProduction: !__DEV__,
};

export default ENV;
