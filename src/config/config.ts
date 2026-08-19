export const CONFIG = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  USE_MOCK_API: import.meta.env.VITE_USE_MOCK_API !== 'false', // Default to true for mock development
  APP_NAME: 'SwachhLens',
  VERSION: '1.0.0',
};
