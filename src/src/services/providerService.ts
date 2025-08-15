import apiClient from './api';
import { ServiceProvider, ServiceProviderRequest } from '../types/api';

/**
 * @version 1.0.0 | Last updated: 2023-07-20
 *
 * Service: ProviderService
 * Used by: MyHomeView, TaskDetail components
 *
 * @API_INTEGRATION Provider Service
 * Handles service providers CRUD operations
 */
export const ProviderService = {
  /**
   * Get service providers
   *
   * API: GET /service-providers
   * Headers:
   *   - Authorization: Bearer {token}
   *   - Accept: application/json
   *
   * Query Parameters:
   *   - type: Filter by provider type (optional)
   *
   * Response Example (200 OK):
   * [
   *   {
   *     "id": "prov_12345",
   *     "user_id": "usr_12345",
   *     "name": "ABC HVAC Services",
   *     "type": "HVAC",
   *     "phone": "(555) 123-4567",
   *     "last_service": "2023-03-22",
   *     "rating": 4,
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
   * @returns {Promise<ServiceProvider[]>} List of service providers
   */
  getServiceProviders: async (): Promise<ServiceProvider[]> => {
    const response = await apiClient.get<ServiceProvider[]>('/service-providers');
    return response.data;
  },
  /**
   * Get service provider by ID
   *
   * API: GET /service-providers/{id}
   * Headers:
   *   - Authorization: Bearer {token}
   *   - Accept: application/json
   *
   * Response Example (200 OK):
   * {
   *   "id": "prov_12345",
   *   "user_id": "usr_12345",
   *   "name": "ABC HVAC Services",
   *   "type": "HVAC",
   *   "phone": "(555) 123-4567",
   *   "last_service": "2023-03-22",
   *   "rating": 4,
   *   "created_at": "2023-01-15T10:30:45Z",
   *   "updated_at": "2023-06-22T14:15:22Z"
   * }
   *
   * Error Response Example (404 Not Found):
   * {
   *   "message": "Service provider not found."
   * }
   *
   * @param {string} id - Provider ID
   * @returns {Promise<ServiceProvider>} Provider details
   */
  getServiceProvider: async (id: string): Promise<ServiceProvider> => {
    const response = await apiClient.get<ServiceProvider>(`/service-providers/${id}`);
    return response.data;
  },
  /**
   * Create new service provider
   *
   * API: POST /service-providers
   * Headers:
   *   - Authorization: Bearer {token}
   *   - Content-Type: application/json
   *   - Accept: application/json
   *
   * Request Body Example:
   * {
   *   "name": "Secure Electric LLC",
   *   "type": "Electrical",
   *   "phone": "(555) 456-7890",
   *   "last_service": "2022-08-15",
   *   "rating": 4
   * }
   *
   * Response Example (201 Created):
   * {
   *   "id": "prov_54321",
   *   "user_id": "usr_12345",
   *   "name": "Secure Electric LLC",
   *   "type": "Electrical",
   *   "phone": "(555) 456-7890",
   *   "last_service": "2022-08-15",
   *   "rating": 4,
   *   "created_at": "2023-07-16T18:30:22Z",
   *   "updated_at": "2023-07-16T18:30:22Z"
   * }
   *
   * Error Response Example (422 Unprocessable Entity):
   * {
   *   "message": "The given data was invalid.",
   *   "errors": {
   *     "name": ["The name field is required."],
   *     "type": ["The type field is required."],
   *     "phone": ["The phone format is invalid."]
   *   }
   * }
   *
   * @param {ServiceProviderRequest} data - Provider data
   * @returns {Promise<ServiceProvider>} Created provider
   */
  createServiceProvider: async (data: ServiceProviderRequest): Promise<ServiceProvider> => {
    const response = await apiClient.post<ServiceProvider>('/service-providers', data);
    return response.data;
  },
  /**
   * Update service provider
   *
   * API: PATCH /service-providers/{id}
   * Headers:
   *   - Authorization: Bearer {token}
   *   - Content-Type: application/json
   *   - Accept: application/json
   *
   * Request Body Example:
   * {
   *   "phone": "(555) 456-7891",
   *   "last_service": "2023-07-15",
   *   "rating": 5
   * }
   *
   * Response Example (200 OK):
   * {
   *   "id": "prov_54321",
   *   "user_id": "usr_12345",
   *   "name": "Secure Electric LLC",
   *   "type": "Electrical",
   *   "phone": "(555) 456-7891",
   *   "last_service": "2023-07-15",
   *   "rating": 5,
   *   "created_at": "2023-07-16T18:30:22Z",
   *   "updated_at": "2023-07-16T18:45:33Z"
   * }
   *
   * Error Response Example (404 Not Found):
   * {
   *   "message": "Service provider not found."
   * }
   *
   * @param {string} id - Provider ID
   * @param {Partial<ServiceProviderRequest>} data - Provider data to update
   * @returns {Promise<ServiceProvider>} Updated provider
   */
  updateServiceProvider: async (id: string, data: Partial<ServiceProviderRequest>): Promise<ServiceProvider> => {
    const response = await apiClient.patch<ServiceProvider>(`/service-providers/${id}`, data);
    return response.data;
  },
  /**
   * Delete service provider
   *
   * API: DELETE /service-providers/{id}
   * Headers:
   *   - Authorization: Bearer {token}
   *   - Accept: application/json
   *
   * Response Example (200 OK):
   * {
   *   "message": "Service provider deleted successfully."
   * }
   *
   * Error Response Example (404 Not Found):
   * {
   *   "message": "Service provider not found."
   * }
   *
   * @param {string} id - Provider ID
   * @returns {Promise<void>}
   */
  deleteServiceProvider: async (id: string): Promise<void> => {
    await apiClient.delete(`/service-providers/${id}`);
  },
  /**
   * Get provider types for filtering
   *
   * API: GET /provider-types
   * Headers:
   *   - Authorization: Bearer {token}
   *   - Accept: application/json
   *
   * Response Example (200 OK):
   * [
   *   {
   *     "id": "type_1",
   *     "name": "HVAC"
   *   },
   *   {
   *     "id": "type_2",
   *     "name": "Plumbing"
   *   },
   *   ...
   * ]
   *
   * Error Response Example (401 Unauthorized):
   * {
   *   "message": "Unauthenticated."
   * }
   *
   * @returns {Promise<{ id: string; name: string; }[]>} List of provider types
   */
  getProviderTypes: async (): Promise<{
    id: string;
    name: string;
  }[]> => {
    const response = await apiClient.get<{
      id: string;
      name: string;
    }[]>('/provider-types');
    return response.data;
  }
};
export default ProviderService;