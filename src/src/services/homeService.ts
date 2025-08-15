import axios, { AxiosInstance } from 'axios';
import { API_CONFIG, AUTH_CONFIG } from '../config';
import { HomeProfile, HomeProfileRequest, HomeSystem, HomeSystemRequest, MaintenanceTask, MaintenanceTaskRequest } from '../types/api';

// Create separate API client for Home Management API
const homeApiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.HOME_API_URL,
  timeout: API_CONFIG.TIMEOUT,
  withCredentials: API_CONFIG.WITH_CREDENTIALS,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add authentication token to Home Management API requests
homeApiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));
/**
 * @version 1.0.0 | Last updated: 2023-07-20
 *
 * Service: HomeService
 * Used by: MyHomeView component
 *
 * @API_INTEGRATION Home Service
 * Handles home profile, systems, and maintenance tasks
 */
export const HomeService = {
  /**
   * Get home profile
   *
   * API: GET /home-profile
   * Headers:
   *   - Authorization: Bearer {token}
   *   - Accept: application/json
   *
   * Response Example (200 OK):
   * {
   *   "id": "home_12345",
   *   "user_id": "usr_12345",
   *   "address": "123 Maple Street, Anytown, ST 12345",
   *   "year_built": 2005,
   *   "square_footage": 2450,
   *   "bedrooms": 4,
   *   "bathrooms": 2.5,
   *   "lot_size": "0.25 acres",
   *   "created_at": "2023-01-15T10:30:45Z",
   *   "updated_at": "2023-06-22T14:15:22Z",
   *   "health_scores": {
   *     "overall": 85,
   *     "hvac": 90,
   *     "plumbing": 75,
   *     "electrical": 95,
   *     "exterior": 70,
   *     "security": 90
   *   }
   * }
   *
   * Error Response Example (404 Not Found):
   * {
   *   "message": "Home profile not found."
   * }
   *
   * @returns {Promise<HomeProfile>} Home profile data
   */
  getHomeProfile: async (): Promise<HomeProfile> => {
    const response = await apiClient.get<HomeProfile>('/home-profile');
    return response.data;
  },
  /**
   * Update home profile
   *
   * API: PATCH /home-profile
   * Headers:
   *   - Authorization: Bearer {token}
   *   - Content-Type: application/json
   *   - Accept: application/json
   *
   * Request Body Example:
   * {
   *   "address": "124 Maple Street, Anytown, ST 12345",
   *   "square_footage": 2500,
   *   "bedrooms": 5
   * }
   *
   * Response Example (200 OK):
   * {
   *   "id": "home_12345",
   *   "user_id": "usr_12345",
   *   "address": "124 Maple Street, Anytown, ST 12345",
   *   "year_built": 2005,
   *   "square_footage": 2500,
   *   "bedrooms": 5,
   *   "bathrooms": 2.5,
   *   "lot_size": "0.25 acres",
   *   "created_at": "2023-01-15T10:30:45Z",
   *   "updated_at": "2023-07-16T15:22:33Z",
   *   "health_scores": {
   *     "overall": 85,
   *     "hvac": 90,
   *     "plumbing": 75,
   *     "electrical": 95,
   *     "exterior": 70,
   *     "security": 90
   *   }
   * }
   *
   * Error Response Example (422 Unprocessable Entity):
   * {
   *   "message": "The given data was invalid.",
   *   "errors": {
   *     "square_footage": ["The square footage must be a positive number."]
   *   }
   * }
   *
   * @param {HomeProfileRequest} data - Home profile data to update
   * @returns {Promise<HomeProfile>} Updated home profile
   */
  updateHomeProfile: async (data: HomeProfileRequest): Promise<HomeProfile> => {
    const response = await apiClient.patch<HomeProfile>('/home-profile', data);
    return response.data;
  },
  /**
   * Get home systems with optional filtering by type
   *
   * API: GET /home_system
   * Headers:
   *   - Authorization: Bearer {token}
   *   - Accept: application/json
   *
   * Query Parameters:
   *   - type: Filter by system type (optional)
   *
   * Response Example (200 OK):
   * [
   *   {
   *     "id": "sys_12345",
   *     "user_id": "usr_12345",
   *     "type": "hvac",
   *     "name": "Central Air System",
   *     "brand": "Carrier",
   *     "installed_date": "2018-06-15",
   *     "last_service_date": "2023-03-22",
   *     "next_service_date": "2023-09-22",
   *     "health_score": 90,
   *     "details": {
   *       "model": "Infinity 98",
   *       "tonnage": "3",
   *       "filter_size": "16x25x1"
   *     },
   *     "created_at": "2023-01-15T10:30:45Z",
   *     "updated_at": "2023-06-22T14:15:22Z"
   *   },
   *   ...
   * ]
   *
   * Error Response Example (401 Unauthorized):
   * {
   *   "message": "Unauthenticated."
   * }
   *
   * @param {Object} params - Query parameters
   * @returns {Promise<HomeSystem[]>} List of home systems
   */
  getHomeSystems: async (params = {}): Promise<HomeSystem[]> => {
    const response = await homeApiClient.get<HomeSystem[]>('/home_system', {
      params
    });
    return response.data;
  },
  /**
   * Get home system by ID
   *
   * API: GET /home-systems/{id}
   * Headers:
   *   - Authorization: Bearer {token}
   *   - Accept: application/json
   *
   * Response Example (200 OK):
   * {
   *   "id": "sys_12345",
   *   "user_id": "usr_12345",
   *   "type": "hvac",
   *   "name": "Central Air System",
   *   "brand": "Carrier",
   *   "installed_date": "2018-06-15",
   *   "last_service_date": "2023-03-22",
   *   "next_service_date": "2023-09-22",
   *   "health_score": 90,
   *   "details": {
   *     "model": "Infinity 98",
   *     "tonnage": "3",
   *     "filter_size": "16x25x1"
   *   },
   *   "created_at": "2023-01-15T10:30:45Z",
   *   "updated_at": "2023-06-22T14:15:22Z"
   * }
   *
   * Error Response Example (404 Not Found):
   * {
   *   "message": "Home system not found."
   * }
   *
   * @param {string} id - System ID
   * @returns {Promise<HomeSystem>} System details
   */
  getHomeSystem: async (id: string): Promise<HomeSystem> => {
    const response = await homeApiClient.get<HomeSystem>(`/home_system/${id}`);
    return response.data;
  },
  /**
   * Create new home system
   *
   * API: POST /home_system
   * Headers:
   *   - Authorization: Bearer {token}
   *   - Content-Type: application/json
   *   - Accept: application/json
   *
   * Request Body Example:
   * {
   *   "type": "electrical",
   *   "name": "Main Electrical Panel",
   *   "brand": "Square D",
   *   "installed_date": "2015-08-20",
   *   "last_service_date": "2022-08-15",
   *   "details": {
   *     "amperage": "200",
   *     "panel_type": "Circuit Breaker"
   *   }
   * }
   *
   * Response Example (201 Created):
   * {
   *   "id": "sys_54321",
   *   "user_id": "usr_12345",
   *   "type": "electrical",
   *   "name": "Main Electrical Panel",
   *   "brand": "Square D",
   *   "installed_date": "2015-08-20",
   *   "last_service_date": "2022-08-15",
   *   "next_service_date": null,
   *   "health_score": 95,
   *   "details": {
   *     "amperage": "200",
   *     "panel_type": "Circuit Breaker"
   *   },
   *   "created_at": "2023-07-16T16:30:22Z",
   *   "updated_at": "2023-07-16T16:30:22Z"
   * }
   *
   * Error Response Example (422 Unprocessable Entity):
   * {
   *   "message": "The given data was invalid.",
   *   "errors": {
   *     "type": ["The selected type is invalid."],
   *     "installed_date": ["The installed date must be a valid date."]
   *   }
   * }
   *
   * @param {HomeSystemRequest} data - System data
   * @returns {Promise<HomeSystem>} Created system
   */
  createHomeSystem: async (data: HomeSystemRequest): Promise<HomeSystem> => {
    const response = await homeApiClient.post<HomeSystem>('/home_system', data);
    return response.data;
  },
  /**
   * Update home system
   *
   * API: PATCH /home-systems/{id}
   * Headers:
   *   - Authorization: Bearer {token}
   *   - Content-Type: application/json
   *   - Accept: application/json
   *
   * Request Body Example:
   * {
   *   "brand": "Square D Homeline",
   *   "last_service_date": "2023-07-15",
   *   "next_service_date": "2025-07-15"
   * }
   *
   * Response Example (200 OK):
   * {
   *   "id": "sys_54321",
   *   "user_id": "usr_12345",
   *   "type": "electrical",
   *   "name": "Main Electrical Panel",
   *   "brand": "Square D Homeline",
   *   "installed_date": "2015-08-20",
   *   "last_service_date": "2023-07-15",
   *   "next_service_date": "2025-07-15",
   *   "health_score": 95,
   *   "details": {
   *     "amperage": "200",
   *     "panel_type": "Circuit Breaker"
   *   },
   *   "created_at": "2023-07-16T16:30:22Z",
   *   "updated_at": "2023-07-16T16:45:33Z"
   * }
   *
   * Error Response Example (404 Not Found):
   * {
   *   "message": "Home system not found."
   * }
   *
   * @param {string} id - System ID
   * @param {Partial<HomeSystemRequest>} data - System data to update
   * @returns {Promise<HomeSystem>} Updated system
   */
  updateHomeSystem: async (id: string, data: Partial<HomeSystemRequest>): Promise<HomeSystem> => {
    const response = await homeApiClient.patch<HomeSystem>(`/home_system/${id}`, data);
    return response.data;
  },
  /**
   * Delete home system
   *
   * API: DELETE /home-systems/{id}
   * Headers:
   *   - Authorization: Bearer {token}
   *   - Accept: application/json
   *
   * Response Example (200 OK):
   * {
   *   "message": "Home system deleted successfully."
   * }
   *
   * Error Response Example (404 Not Found):
   * {
   *   "message": "Home system not found."
   * }
   *
   * @param {string} id - System ID
   * @returns {Promise<void>}
   */
  deleteHomeSystem: async (id: string): Promise<void> => {
    await homeApiClient.delete(`/home_system/${id}`);
  },
  /**
   * Get maintenance tasks with optional filtering
   *
   * API: GET /maintenance-tasks
   * Headers:
   *   - Authorization: Bearer {token}
   *   - Accept: application/json
   *
   * Query Parameters:
   *   - status: Filter by task status (optional)
   *   - system: Filter by system type (optional)
   *
   * Response Example (200 OK):
   * [
   *   {
   *     "id": "mtask_12345",
   *     "user_id": "usr_12345",
   *     "name": "HVAC Filter Replacement",
   *     "system": "HVAC",
   *     "frequency": "Quarterly",
   *     "last_done": "2023-03-15",
   *     "next_due": "2023-06-15",
   *     "status": "overdue",
   *     "notes": "Use MERV 11 filters",
   *     "created_at": "2023-01-15T10:30:45Z",
   *     "updated_at": "2023-06-22T14:15:22Z"
   *   },
   *   ...
   * ]
   *
   * Error Response Example (401 Unauthorized):
   * {
   *   "message": "Unauthenticated."
   * }
   *
   * @param {Object} params - Query parameters
   * @returns {Promise<MaintenanceTask[]>} List of maintenance tasks
   */
  getMaintenanceTasks: async (params = {}): Promise<MaintenanceTask[]> => {
    const response = await apiClient.get<MaintenanceTask[]>('/maintenance-tasks', {
      params
    });
    return response.data;
  },
  /**
   * Create new maintenance task
   *
   * API: POST /maintenance-tasks
   * Headers:
   *   - Authorization: Bearer {token}
   *   - Content-Type: application/json
   *   - Accept: application/json
   *
   * Request Body Example:
   * {
   *   "name": "Water Heater Flush",
   *   "system": "Plumbing",
   *   "frequency": "Annual",
   *   "last_done": "2023-01-20",
   *   "next_due": "2024-01-20",
   *   "status": "on-track",
   *   "notes": "Remember to check pressure relief valve"
   * }
   *
   * Response Example (201 Created):
   * {
   *   "id": "mtask_54321",
   *   "user_id": "usr_12345",
   *   "name": "Water Heater Flush",
   *   "system": "Plumbing",
   *   "frequency": "Annual",
   *   "last_done": "2023-01-20",
   *   "next_due": "2024-01-20",
   *   "status": "on-track",
   *   "notes": "Remember to check pressure relief valve",
   *   "created_at": "2023-07-16T17:30:22Z",
   *   "updated_at": "2023-07-16T17:30:22Z"
   * }
   *
   * Error Response Example (422 Unprocessable Entity):
   * {
   *   "message": "The given data was invalid.",
   *   "errors": {
   *     "name": ["The name field is required."],
   *     "system": ["The system field is required."],
   *     "frequency": ["The frequency field is required."],
   *     "status": ["The selected status is invalid."]
   *   }
   * }
   *
   * @param {MaintenanceTaskRequest} data - Task data
   * @returns {Promise<MaintenanceTask>} Created task
   */
  createMaintenanceTask: async (data: MaintenanceTaskRequest): Promise<MaintenanceTask> => {
    const response = await apiClient.post<MaintenanceTask>('/maintenance-tasks', data);
    return response.data;
  },
  /**
   * Update maintenance task
   *
   * API: PATCH /maintenance-tasks/{id}
   * Headers:
   *   - Authorization: Bearer {token}
   *   - Content-Type: application/json
   *   - Accept: application/json
   *
   * Request Body Example:
   * {
   *   "last_done": "2023-07-15",
   *   "next_due": "2024-07-15",
   *   "status": "completed",
   *   "notes": "Completed annual flush and checked pressure relief valve. All working properly."
   * }
   *
   * Response Example (200 OK):
   * {
   *   "id": "mtask_54321",
   *   "user_id": "usr_12345",
   *   "name": "Water Heater Flush",
   *   "system": "Plumbing",
   *   "frequency": "Annual",
   *   "last_done": "2023-07-15",
   *   "next_due": "2024-07-15",
   *   "status": "completed",
   *   "notes": "Completed annual flush and checked pressure relief valve. All working properly.",
   *   "created_at": "2023-07-16T17:30:22Z",
   *   "updated_at": "2023-07-16T17:45:33Z"
   * }
   *
   * Error Response Example (404 Not Found):
   * {
   *   "message": "Maintenance task not found."
   * }
   *
   * @param {string} id - Task ID
   * @param {Partial<MaintenanceTaskRequest>} data - Task data to update
   * @returns {Promise<MaintenanceTask>} Updated task
   */
  updateMaintenanceTask: async (id: string, data: Partial<MaintenanceTaskRequest>): Promise<MaintenanceTask> => {
    const response = await apiClient.patch<MaintenanceTask>(`/maintenance-tasks/${id}`, data);
    return response.data;
  },
  /**
   * Delete maintenance task
   *
   * API: DELETE /maintenance-tasks/{id}
   * Headers:
   *   - Authorization: Bearer {token}
   *   - Accept: application/json
   *
   * Response Example (200 OK):
   * {
   *   "message": "Maintenance task deleted successfully."
   * }
   *
   * Error Response Example (404 Not Found):
   * {
   *   "message": "Maintenance task not found."
   * }
   *
   * @param {string} id - Task ID
   * @returns {Promise<void>}
   */
  deleteMaintenanceTask: async (id: string): Promise<void> => {
    await apiClient.delete(`/maintenance-tasks/${id}`);
  }
};
export default HomeService;