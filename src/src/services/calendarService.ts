import apiClient from './api';
import { CalendarEvent, CalendarEventRequest } from '../types/api';

/**
 * @version 1.0.0 | Last updated: 2023-07-20
 *
 * Service: CalendarService
 * Used by: CalendarView component
 *
 * @API_INTEGRATION Calendar Service
 * Handles calendar events CRUD operations
 */
export const CalendarService = {
  /**
   * Get calendar events
   *
   * API: GET /calendar-events
   * Headers:
   *   - Authorization: Bearer {token}
   *   - Accept: application/json
   *
   * Query Parameters:
   *   - start_date: Start date for events (YYYY-MM-DD)
   *   - end_date: End date for events (YYYY-MM-DD)
   *   - provider_id: Filter by provider ID (optional)
   *
   * Response Example (200 OK):
   * [
   *   {
   *     "id": "event_12345",
   *     "title": "HVAC Service",
   *     "start": "2023-07-15T09:00:00Z",
   *     "end": "2023-07-15T11:00:00Z",
   *     "provider_id": "prov_67890",
   *     "provider_name": "ABC HVAC Services",
   *     "provider_type": "hvac",
   *     "task_id": "task_54321",
   *     "status": "confirmed",
   *     "all_day": false,
   *     "created_at": "2023-06-15T14:30:22Z",
   *     "updated_at": "2023-06-15T14:30:22Z"
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
   * @returns {Promise<CalendarEvent[]>} List of calendar events
   */
  getCalendarEvents: async (params = {}): Promise<CalendarEvent[]> => {
    const response = await apiClient.get<CalendarEvent[]>('/calendar-events', {
      params
    });
    return response.data;
  },
  /**
   * Get calendar event by ID
   *
   * API: GET /calendar-events/{id}
   * Headers:
   *   - Authorization: Bearer {token}
   *   - Accept: application/json
   *
   * Response Example (200 OK):
   * {
   *   "id": "event_12345",
   *   "title": "HVAC Service",
   *   "start": "2023-07-15T09:00:00Z",
   *   "end": "2023-07-15T11:00:00Z",
   *   "provider_id": "prov_67890",
   *   "provider_name": "ABC HVAC Services",
   *   "provider_type": "hvac",
   *   "task_id": "task_54321",
   *   "status": "confirmed",
   *   "all_day": false,
   *   "created_at": "2023-06-15T14:30:22Z",
   *   "updated_at": "2023-06-15T14:30:22Z"
   * }
   *
   * Error Response Example (404 Not Found):
   * {
   *   "message": "Calendar event not found."
   * }
   *
   * @param {string} id - Event ID
   * @returns {Promise<CalendarEvent>} Event details
   */
  getCalendarEvent: async (id: string): Promise<CalendarEvent> => {
    const response = await apiClient.get<CalendarEvent>(`/calendar-events/${id}`);
    return response.data;
  },
  /**
   * Create new calendar event
   *
   * API: POST /calendar-events
   * Headers:
   *   - Authorization: Bearer {token}
   *   - Content-Type: application/json
   *   - Accept: application/json
   *
   * Request Body Example:
   * {
   *   "title": "Plumbing Inspection",
   *   "start": "2023-08-10T13:00:00Z",
   *   "end": "2023-08-10T15:00:00Z",
   *   "provider_id": "prov_12345",
   *   "task_id": "task_67890",
   *   "status": "pending",
   *   "all_day": false
   * }
   *
   * Response Example (201 Created):
   * {
   *   "id": "event_67890",
   *   "title": "Plumbing Inspection",
   *   "start": "2023-08-10T13:00:00Z",
   *   "end": "2023-08-10T15:00:00Z",
   *   "provider_id": "prov_12345",
   *   "provider_name": "Quality Plumbing Co.",
   *   "provider_type": "plumbing",
   *   "task_id": "task_67890",
   *   "status": "pending",
   *   "all_day": false,
   *   "created_at": "2023-07-16T19:30:22Z",
   *   "updated_at": "2023-07-16T19:30:22Z"
   * }
   *
   * Error Response Example (422 Unprocessable Entity):
   * {
   *   "message": "The given data was invalid.",
   *   "errors": {
   *     "title": ["The title field is required."],
   *     "start": ["The start field is required."],
   *     "end": ["The end must be after start."]
   *   }
   * }
   *
   * @param {CalendarEventRequest} data - Event data
   * @returns {Promise<CalendarEvent>} Created event
   */
  createCalendarEvent: async (data: CalendarEventRequest): Promise<CalendarEvent> => {
    const response = await apiClient.post<CalendarEvent>('/calendar-events', data);
    return response.data;
  },
  /**
   * Update calendar event
   *
   * API: PATCH /calendar-events/{id}
   * Headers:
   *   - Authorization: Bearer {token}
   *   - Content-Type: application/json
   *   - Accept: application/json
   *
   * Request Body Example:
   * {
   *   "start": "2023-08-10T14:00:00Z",
   *   "end": "2023-08-10T16:00:00Z",
   *   "status": "confirmed"
   * }
   *
   * Response Example (200 OK):
   * {
   *   "id": "event_67890",
   *   "title": "Plumbing Inspection",
   *   "start": "2023-08-10T14:00:00Z",
   *   "end": "2023-08-10T16:00:00Z",
   *   "provider_id": "prov_12345",
   *   "provider_name": "Quality Plumbing Co.",
   *   "provider_type": "plumbing",
   *   "task_id": "task_67890",
   *   "status": "confirmed",
   *   "all_day": false,
   *   "created_at": "2023-07-16T19:30:22Z",
   *   "updated_at": "2023-07-16T19:45:33Z"
   * }
   *
   * Error Response Example (404 Not Found):
   * {
   *   "message": "Calendar event not found."
   * }
   *
   * @param {string} id - Event ID
   * @param {Partial<CalendarEventRequest>} data - Event data to update
   * @returns {Promise<CalendarEvent>} Updated event
   */
  updateCalendarEvent: async (id: string, data: Partial<CalendarEventRequest>): Promise<CalendarEvent> => {
    const response = await apiClient.patch<CalendarEvent>(`/calendar-events/${id}`, data);
    return response.data;
  },
  /**
   * Delete calendar event
   *
   * API: DELETE /calendar-events/{id}
   * Headers:
   *   - Authorization: Bearer {token}
   *   - Accept: application/json
   *
   * Response Example (200 OK):
   * {
   *   "message": "Calendar event deleted successfully."
   * }
   *
   * Error Response Example (404 Not Found):
   * {
   *   "message": "Calendar event not found."
   * }
   *
   * @param {string} id - Event ID
   * @returns {Promise<void>}
   */
  deleteCalendarEvent: async (id: string): Promise<void> => {
    await apiClient.delete(`/calendar-events/${id}`);
  }
};
export default CalendarService;