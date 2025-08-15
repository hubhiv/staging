/**
 * @version 1.0.0 | Last updated: 2023-07-20
 *
 * Application Configuration
 * Contains environment-specific configuration settings
 */
// API configuration
export const API_CONFIG = {
  // Base URL for API requests - Authentication API
  BASE_URL: import.meta.env.VITE_API_URL || 'https://x8gd-ip42-19oh.n7e.xano.io/api:9dYqAX_u',
  // Home Management API URL - For tasks, calendar, home profiles
  HOME_API_URL: import.meta.env.VITE_HOME_API_URL || 'https://x8gd-ip42-19oh.n7e.xano.io/api:vUhMdCxR',
  // Request timeout in milliseconds
  TIMEOUT: 30000,
  // Whether to include credentials in requests (disabled for Xano CORS compatibility)
  WITH_CREDENTIALS: false,
  // Pagination defaults
  DEFAULT_PAGE_SIZE: 15,
  // Rate limiting
  RATE_LIMIT_RETRY_DELAY: 1000,
  MAX_RATE_LIMIT_RETRIES: 3
};
// Authentication configuration
export const AUTH_CONFIG = {
  // LocalStorage keys (updated for Xano compatibility)
  TOKEN_KEY: 'authToken',
  REFRESH_TOKEN_KEY: 'auth_refresh_token',
  TOKEN_EXPIRY_KEY: 'auth_token_expiry',
  // Token refresh settings
  REFRESH_THRESHOLD_MINUTES: 5,
  // Authentication endpoints (updated for Xano)
  LOGIN_URL: '/auth/login',
  REGISTER_URL: '/auth/signup',
  LOGOUT_URL: '/auth/logout',
  REFRESH_TOKEN_URL: '/auth/refresh_token',
  USER_PROFILE_URL: '/auth/me'
};
// Feature flags
export const FEATURES = {
  ENABLE_NOTIFICATIONS: true,
  ENABLE_TASK_COMMENTS: true,
  ENABLE_FILE_ATTACHMENTS: true,
  ENABLE_PROVIDER_RATINGS: true
};
// Mock data configuration
export const MOCK_CONFIG = {
  USE_MOCK_DATA: import.meta.env.VITE_USE_MOCK_DATA === 'true',
  MOCK_API_DELAY: 500
};