import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_CONFIG, AUTH_CONFIG } from '../config';
/**
 * @version 1.0.0 | Last updated: 2023-07-20
 *
 * =====================================================================
 * API INTEGRATION DOCUMENTATION
 * Last Updated: 2023-07-20
 * Swagger/OpenAPI URL: https://xano-api-endpoint.com/api/docs
 * =====================================================================
 *
 * This file contains the base API client for making HTTP requests to the Xano backend.
 * It handles authentication, error handling, and request/response interceptors.
 *
 * BASE CONFIGURATION:
 * - Base URL: https://xano-api-endpoint.com/api
 * - Timeout: 30 seconds
 * - Credentials: included in requests
 *
 * STANDARD HEADERS:
 * - Request:
 *   - Content-Type: application/json
 *   - Accept: application/json
 *   - Authorization: Bearer {token} (added by interceptor)
 * - Response:
 *   - Content-Type: application/json
 *   - X-Pagination-Total: {total} (for paginated responses)
 *   - X-Pagination-Pages: {pages} (for paginated responses)
 *
 * ERROR HANDLING:
 * - 400: Bad Request (validation errors)
 * - 401: Unauthorized (invalid or expired token)
 * - 403: Forbidden (insufficient permissions)
 * - 404: Not Found
 * - 422: Unprocessable Entity (validation errors)
 * - 500: Server Error
 *
 * Error Response Format:
 * {
 *   "message": "Error message description",
 *   "errors": {
 *     "field_name": ["Error message for this field"]
 *   }
 * }
 *
 * PAGINATION:
 * For endpoints that return multiple items, the API implements pagination:
 * {
 *   "data": [...],
 *   "meta": {
 *     "current_page": 1,
 *     "from": 1,
 *     "last_page": 5,
 *     "per_page": 15,
 *     "to": 15,
 *     "total": 72
 *   }
 * }
 *
 * Query parameters for pagination:
 * - page: Page number (default: 1)
 * - per_page: Items per page (default: 15)
 *
 * AUTHENTICATION FLOW:
 * 1. Login/Register to get token and refresh_token
 * 2. Store tokens in localStorage
 * 3. Include token in Authorization header for requests
 * 4. If token expires (401 response), use refresh_token to get new tokens
 * 5. If refresh fails, redirect to login
 */
// Create axios instance with common configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  withCredentials: API_CONFIG.WITH_CREDENTIALS,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
});
/**
 * Global Error Handling:
 * - All 401 errors trigger token refresh attempt, then logout if refresh fails
 * - Network errors show appropriate error messages
 * - 5xx errors show a generic server error message
 * - 4xx errors return structured error data for form validation
 */
// Request interceptor to add authentication token
apiClient.interceptors.request.use((config: AxiosRequestConfig): AxiosRequestConfig => {
  const token = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error: AxiosError) => Promise.reject(error));
// Response interceptor for error handling (Xano-compatible)
apiClient.interceptors.response.use((response: AxiosResponse) => response, async (error: AxiosError) => {
  // Handle 401 Unauthorized errors (expired/invalid token)
  if (error.response?.status === 401) {
    // Clear token and redirect to login (Xano doesn't support refresh tokens)
    localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
    localStorage.removeItem('isAuthenticated');
    // Only redirect if we're not already on a login/auth page
    if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
      window.location.href = '/';
    }
  }
  // Handle other error types
  return Promise.reject(error);
});
/**
 * Error response from API
 */
export interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
}
/**
 * Parse error response from API
 */
export const parseApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error) && error.response) {
    return {
      status: error.response.status,
      message: error.response.data.message || 'An unexpected error occurred',
      errors: error.response.data.errors
    };
  }
  return {
    status: 500,
    message: error instanceof Error ? error.message : 'An unexpected error occurred'
  };
};
/**
 * TEST FUNCTION: Uncomment and run to test all endpoints with mock data before live backend is ready.
 *
 * export async function testAllApiEndpoints() {
 *   console.log('Testing all API endpoints with mock data...');
 *
 *   try {
 *     // Auth endpoints
 *     console.log('Testing auth endpoints...');
 *     const loginResponse = await apiClient.post('/auth/login', { email: 'test@example.com', password: 'password' });
 *     console.log('Login response:', loginResponse.data);
 *
 *     // Task endpoints
 *     console.log('Testing task endpoints...');
 *     const tasksResponse = await apiClient.get('/tasks');
 *     console.log('Tasks response:', tasksResponse.data);
 *
 *     // Home endpoints
 *     console.log('Testing home endpoints...');
 *     const homeProfileResponse = await apiClient.get('/home-profile');
 *     console.log('Home profile response:', homeProfileResponse.data);
 *
 *     // Provider endpoints
 *     console.log('Testing provider endpoints...');
 *     const providersResponse = await apiClient.get('/service-providers');
 *     console.log('Providers response:', providersResponse.data);
 *
 *     // Calendar endpoints
 *     console.log('Testing calendar endpoints...');
 *     const calendarResponse = await apiClient.get('/calendar-events');
 *     console.log('Calendar response:', calendarResponse.data);
 *
 *     console.log('All API endpoints tested successfully!');
 *   } catch (error) {
 *     console.error('API test failed:', error);
 *   }
 * }
 */

// Create separate axios instance for Home Management API (tasks, calendar, home profiles)
const homeApiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.HOME_API_URL,
  timeout: API_CONFIG.TIMEOUT,
  withCredentials: API_CONFIG.WITH_CREDENTIALS,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
});

// Add the same interceptors to homeApiClient
homeApiClient.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

homeApiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
      localStorage.removeItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
export { homeApiClient };