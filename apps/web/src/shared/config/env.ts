export const ENV = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
  APP_TITLE: import.meta.env.VITE_APP_TITLE || 'VIRaTeC — KNU Community',
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  SITE_URL: import.meta.env.VITE_SITE_URL || window.location.origin,
};
