import apiClient from './api';
import { LoginRequest, RegisterRequest, ResetPasswordRequest, AuthResponse, UserProfile } from '../types/api';

/**
 * @version 1.0.0 | Last updated: 2023-07-20
 *
 * Service: AuthService
 * Used by: useAuth hook, Login/Register components
 *
 * @API_INTEGRATION Authentication Service
 * Handles user authentication, registration, and password reset
 */
export const AuthService = {
  /**
   * User login
   *
   * API: POST /auth/login (Xano endpoint)
   * Headers:
   *   - Content-Type: application/json
   *   - Accept: application/json
   *
   * Request Body Example:
   * {
   *   "email": "user@example.com",
   *   "password": "securepassword"
   * }
   *
   * Response Example (200 OK):
   * {
   *   "authToken": "eyJhbGciOiJBMjU2S1ciLCJlbmMiOiJBMjU2Q0JDLUhTNTEyIi..."
   * }
   *
   * Error Response Examples:
   * 400 Input Error:
   * {
   *   "message": "Input validation failed"
   * }
   *
   * 401 Unauthorized:
   * {
   *   "message": "Invalid credentials"
   * }
   *
   * @param {LoginRequest} data - Login credentials
   * @returns {Promise<AuthResponse>} Authentication response with authToken
   */
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    return response.data;
  },
  /**
   * User registration
   *
   * API: POST /auth/signup (Xano endpoint)
   * Headers:
   *   - Content-Type: application/json
   *   - Accept: application/json
   *
   * Request Body Example:
   * {
   *   "name": "Jane Smith",
   *   "email": "jane@example.com",
   *   "password": "securepassword"
   * }
   *
   * Response Example (200 OK):
   * {
   *   "authToken": "eyJhbGciOiJBMjU2S1ciLCJlbmMiOiJBMjU2Q0JDLUhTNTEyIi..."
   * }
   *
   * Error Response Examples:
   * 400 Input Error:
   * {
   *   "message": "Input validation failed"
   * }
   *
   * 403 Access Denied (Duplicate Email):
   * {
   *   "code": "ERROR_CODE_ACCESS_DENIED",
   *   "message": "This account is already in use.",
   *   "payload": ""
   * }
   *
   * @param {RegisterRequest} data - Registration data
   * @returns {Promise<AuthResponse>} Authentication response with authToken
   */
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/signup', data);
    return response.data;
  },
  /**
   * User logout (client-side only for Xano)
   *
   * Note: Xano doesn't have a logout endpoint, so this is client-side only.
   * Simply removes the authentication token from localStorage.
   *
   * @returns {Promise<void>}
   */
  logout: async (): Promise<void> => {
    // Xano doesn't have a logout endpoint, so we just clear local storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('isAuthenticated');
  },

  /**
   * Reset password request (not implemented in Xano yet)
   *
   * Note: This endpoint is not yet implemented in the Xano backend.
   * This is a placeholder for future implementation.
   *
   * @param {ResetPasswordRequest} data - Reset password data
   * @returns {Promise<{ message: string }>} Success message
   */
  resetPassword: async (data: ResetPasswordRequest): Promise<{
    message: string;
  }> => {
    // TODO: Implement when Xano backend supports password reset
    throw new Error('Password reset is not yet implemented');
  },
  /**
   * Get authenticated user profile
   *
   * API: GET /auth/me (Xano endpoint)
   * Headers:
   *   - Authorization: Bearer {authToken}
   *   - Accept: application/json
   *
   * Response Example (200 OK):
   * {
   *   "id": 1,
   *   "created_at": 1754243623870,
   *   "name": "John Doe",
   *   "email": "user@example.com"
   * }
   *
   * Error Response Example (401 Unauthorized):
   * {
   *   "message": "Unauthenticated."
   * }
   *
   * @returns {Promise<UserProfile>} User profile
   */
  getUser: async (): Promise<UserProfile> => {
    const response = await apiClient.get<UserProfile>('/auth/me');
    return response.data;
  }
};
export default AuthService;