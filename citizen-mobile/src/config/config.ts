export const CONFIG = {
  API_BASE_URL:
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    'http://localhost:8000/api/v1',
  GOOGLE_CLIENT_ID: (import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim(),
  APP_NAME: 'SwachhLens',
  VERSION: '1.0.0',
};
